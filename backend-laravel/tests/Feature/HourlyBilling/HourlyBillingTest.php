<?php

namespace Tests\Feature\HourlyBilling;

use App\Models\Contract;
use App\Models\JobPosting;
use App\Models\Proposal;
use App\Models\TimeLog;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WeeklyInvoice;
use App\Services\HourlyBillingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class HourlyBillingTest extends TestCase
{
    use RefreshDatabase;

    private User $client;
    private User $freelancer;
    private Contract $contract;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client     = User::factory()->create();
        $this->freelancer = User::factory()->create();
        $this->client->forceFill(['role' => 'client'])->save();
        $this->freelancer->forceFill(['role' => 'freelancer'])->save();

        Wallet::create(['user_id' => $this->client->id,     'balance' => 0, 'escrow_balance' => 0]);
        Wallet::create(['user_id' => $this->freelancer->id, 'balance' => 0]);

        $job = JobPosting::create([
            'client_id' => $this->client->id, 'title' => 'X',
            'description' => str_repeat('x', 60), 'type' => 'hourly',
            'experience_level' => 'intermediate', 'status' => 'open', 'visibility' => 'public',
        ]);
        $prop = Proposal::create([
            'job_id' => $job->id, 'freelancer_id' => $this->freelancer->id,
            'cover_letter' => 'hi', 'bid_amount' => 50,
        ]);
        $this->contract = Contract::create([
            'job_id' => $job->id, 'proposal_id' => $prop->id,
            'client_id' => $this->client->id, 'freelancer_id' => $this->freelancer->id,
            'title' => 'Hourly contract', 'amount' => 500,
            'type' => 'hourly', 'hourly_rate' => 50, 'weekly_limit' => 40,
            'status' => 'active', 'billing_status' => 'active',
        ]);
    }

    /* ── Generation + escrow drain + freelancer payout ───────────────── */

    public function test_paid_invoice_drains_escrow_and_credits_freelancer(): void
    {
        // Pre-fund escrow with $400 (8h × $50)
        Wallet::where('user_id', $this->client->id)->update(['escrow_balance' => 400]);
        $this->contract->update(['escrow_amount' => 400]);

        $weekStart = Carbon::now()->subWeek()->startOfWeek();
        TimeLog::create([
            'contract_id' => $this->contract->id, 'user_id' => $this->freelancer->id,
            'started_at'  => $weekStart->copy()->addDay(),
            'ended_at'    => $weekStart->copy()->addDay()->addHours(8),
            'duration_seconds' => 8 * 3600,
        ]);

        $service = app(HourlyBillingService::class);
        $invoice = $service->generateOneInvoice($this->contract, $weekStart, $weekStart->copy()->endOfWeek());

        $this->assertNotNull($invoice);
        $this->assertSame('paid', $invoice->status);
        $this->assertSame('8.00', (string) $invoice->hours_worked);
        $this->assertSame('400.00', (string) $invoice->gross_amount);
        $this->assertSame('40.00',  (string) $invoice->commission);                       // 10%
        $this->assertSame('360.00', (string) $invoice->net_to_freelancer);

        // Money landed
        $this->assertSame('360.00', (string) Wallet::where('user_id', $this->freelancer->id)->first()->balance);
        $this->assertSame('0.00',   (string) Wallet::where('user_id', $this->client->id)->first()->escrow_balance);
        $this->assertSame('0.00',   (string) $this->contract->fresh()->escrow_amount);
    }

    /* ── Insufficient escrow ─────────────────────────────────────────── */

    public function test_insufficient_escrow_records_failed_invoice(): void
    {
        Wallet::where('user_id', $this->client->id)->update(['escrow_balance' => 100]);
        $this->contract->update(['escrow_amount' => 100]);

        $weekStart = Carbon::now()->subWeek()->startOfWeek();
        TimeLog::create([
            'contract_id' => $this->contract->id, 'user_id' => $this->freelancer->id,
            'started_at'  => $weekStart->copy()->addDay(),
            'ended_at'    => $weekStart->copy()->addDay()->addHours(5),
            'duration_seconds' => 5 * 3600,
        ]);

        $invoice = app(HourlyBillingService::class)
            ->generateOneInvoice($this->contract, $weekStart, $weekStart->copy()->endOfWeek());

        $this->assertSame('failed', $invoice->status);
        $this->assertStringContainsString('Insufficient escrow', $invoice->failure_reason);
        $this->assertSame('0.00', (string) Wallet::where('user_id', $this->freelancer->id)->first()->balance);
    }

    /* ── Dispute lock ─────────────────────────────────────────────────── */

    public function test_disputed_contract_is_skipped_entirely(): void
    {
        $this->contract->update(['status' => 'disputed', 'escrow_amount' => 400]);
        Wallet::where('user_id', $this->client->id)->update(['escrow_balance' => 400]);

        $weekStart = Carbon::now()->subWeek()->startOfWeek();
        TimeLog::create([
            'contract_id' => $this->contract->id, 'user_id' => $this->freelancer->id,
            'started_at'  => $weekStart->copy()->addDay(),
            'ended_at'    => $weekStart->copy()->addDay()->addHours(3),
            'duration_seconds' => 3 * 3600,
        ]);

        $result = app(HourlyBillingService::class)
            ->generateOneInvoice($this->contract, $weekStart, $weekStart->copy()->endOfWeek());

        $this->assertNull($result);
        $this->assertSame(0, WeeklyInvoice::count());
        $this->assertSame('400.00', (string) $this->contract->fresh()->escrow_amount);
    }

    /* ── Weekly limit cap ─────────────────────────────────────────────── */

    public function test_weekly_limit_caps_billed_hours(): void
    {
        $this->contract->update(['weekly_limit' => 10, 'escrow_amount' => 1000]);
        Wallet::where('user_id', $this->client->id)->update(['escrow_balance' => 1000]);

        $weekStart = Carbon::now()->subWeek()->startOfWeek();
        TimeLog::create([
            'contract_id' => $this->contract->id, 'user_id' => $this->freelancer->id,
            'started_at'  => $weekStart->copy()->addDay(),
            'ended_at'    => $weekStart->copy()->addDay()->addHours(25),
            'duration_seconds' => 25 * 3600,
        ]);

        $invoice = app(HourlyBillingService::class)
            ->generateOneInvoice($this->contract, $weekStart, $weekStart->copy()->endOfWeek());

        $this->assertSame('10.00', (string) $invoice->hours_worked);          // capped at weekly_limit
        $this->assertSame('500.00', (string) $invoice->gross_amount);         // 10 × $50
    }

    /* ── Idempotency ──────────────────────────────────────────────────── */

    public function test_replay_returns_same_paid_invoice(): void
    {
        Wallet::where('user_id', $this->client->id)->update(['escrow_balance' => 1000]);
        $this->contract->update(['escrow_amount' => 1000]);

        $weekStart = Carbon::now()->subWeek()->startOfWeek();
        TimeLog::create([
            'contract_id' => $this->contract->id, 'user_id' => $this->freelancer->id,
            'started_at'  => $weekStart->copy()->addDay(),
            'ended_at'    => $weekStart->copy()->addDay()->addHours(4),
            'duration_seconds' => 4 * 3600,
        ]);

        $service = app(HourlyBillingService::class);
        $first  = $service->generateOneInvoice($this->contract, $weekStart, $weekStart->copy()->endOfWeek());
        $second = $service->generateOneInvoice($this->contract, $weekStart, $weekStart->copy()->endOfWeek());

        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, WeeklyInvoice::count());
        $this->assertSame('180.00', (string) Wallet::where('user_id', $this->freelancer->id)->first()->balance);    // not doubled
    }

    /* ── No-hours skip ────────────────────────────────────────────────── */

    public function test_no_logs_in_week_returns_null(): void
    {
        $service = app(HourlyBillingService::class);
        $result = $service->generateOneInvoice($this->contract, now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek());
        $this->assertNull($result);
        $this->assertSame(0, WeeklyInvoice::count());
    }

    /* ── API: earnings + spending ─────────────────────────────────────── */

    public function test_freelancer_earnings_endpoint_returns_total(): void
    {
        WeeklyInvoice::create([
            'contract_id' => $this->contract->id, 'client_id' => $this->client->id, 'freelancer_id' => $this->freelancer->id,
            'week_start' => '2026-05-25', 'week_end' => '2026-05-31',
            'seconds_worked' => 18000, 'hours_worked' => 5,
            'hourly_rate' => 50, 'gross_amount' => 250, 'commission' => 25, 'net_to_freelancer' => 225,
            'status' => 'paid', 'idempotency_key' => 'wk:'.$this->contract->id.':2026-05-25', 'processed_at' => now(),
        ]);

        Sanctum::actingAs($this->freelancer);
        $this->getJson('/api/billing/invoices/weekly/earnings')
            ->assertOk()
            ->assertJsonPath('data.lifetime_net', 225);
    }

    public function test_client_spending_endpoint(): void
    {
        WeeklyInvoice::create([
            'contract_id' => $this->contract->id, 'client_id' => $this->client->id, 'freelancer_id' => $this->freelancer->id,
            'week_start' => '2026-05-25', 'week_end' => '2026-05-31',
            'seconds_worked' => 18000, 'hours_worked' => 5,
            'hourly_rate' => 50, 'gross_amount' => 250, 'commission' => 25, 'net_to_freelancer' => 225,
            'status' => 'paid', 'idempotency_key' => 'wk:'.$this->contract->id.':2026-05-25', 'processed_at' => now(),
        ]);

        Sanctum::actingAs($this->client);
        $this->getJson('/api/billing/invoices/weekly/spending')
            ->assertOk()
            ->assertJsonPath('data.lifetime_gross', 250);
    }
}
