<?php

namespace Tests\Feature\Payments;

use App\Models\Contract;
use App\Models\JobPosting;
use App\Models\Proposal;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Services\LedgerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StripeRefundTest extends TestCase
{
    use RefreshDatabase;

    public function test_reverse_deposit_debits_wallet_and_creates_refund_row(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['role' => 'client'])->save();
        Wallet::create(['user_id' => $user->id, 'balance' => 0]);

        $ledger = app(LedgerService::class);

        // Step 1: simulate a successful deposit (the Stripe checkout path)
        $deposit = $ledger->deposit($user, 500.00, 'pi_test_idempo_1', [
            'description'       => 'Test deposit',
            'payment_method'    => 'stripe',
            'stripe_payment_id' => 'pi_test_123',
        ]);
        $this->assertSame('500.00', (string) Wallet::where('user_id', $user->id)->first()->balance);

        // Step 2: Stripe sends a refund webhook → ledger reversal
        $reversal = $ledger->reverseDeposit($deposit, 500.00, 'stripe_refund:re_test_1', 'Customer refund');

        $this->assertSame('refund', $reversal->type);
        $this->assertSame('out',    $reversal->direction);
        $this->assertSame('0.00',   (string) Wallet::where('user_id', $user->id)->first()->balance);

        // Idempotency: replaying the webhook should return the same refund row, not double-debit
        $replay = $ledger->reverseDeposit($deposit, 500.00, 'stripe_refund:re_test_1', 'Customer refund');
        $this->assertSame($reversal->id, $replay->id);
        $this->assertSame('0.00', (string) Wallet::where('user_id', $user->id)->first()->balance);
    }

    public function test_partial_refund_debits_only_the_refunded_amount(): void
    {
        $user = User::factory()->create();
        Wallet::create(['user_id' => $user->id, 'balance' => 0]);
        $ledger = app(LedgerService::class);

        $deposit = $ledger->deposit($user, 1000.00, 'pi_part_1', ['stripe_payment_id' => 'pi_x']);
        $ledger->reverseDeposit($deposit, 200.00, 'partial_refund:1', 'partial');

        $this->assertSame('800.00', (string) Wallet::where('user_id', $user->id)->first()->balance);
    }

    public function test_reverse_rejects_amount_exceeding_original(): void
    {
        $user = User::factory()->create();
        Wallet::create(['user_id' => $user->id, 'balance' => 0]);
        $ledger = app(LedgerService::class);

        $deposit = $ledger->deposit($user, 100.00, 'k1', ['stripe_payment_id' => 'pi_y']);

        $this->expectException(\RuntimeException::class);
        $ledger->reverseDeposit($deposit, 200.00, 'k2', 'overrun');
    }

    public function test_freeze_contract_disputes_active_contracts(): void
    {
        $client     = User::factory()->create();
        $freelancer = User::factory()->create();
        $client->forceFill(['role' => 'client'])->save();
        $freelancer->forceFill(['role' => 'freelancer'])->save();

        $job = JobPosting::create([
            'client_id' => $client->id, 'title' => 'J', 'description' => str_repeat('x', 60),
            'type' => 'fixed', 'experience_level' => 'intermediate',
        ]);
        $prop = Proposal::create([
            'job_id' => $job->id, 'freelancer_id' => $freelancer->id, 'cover_letter' => 'x', 'bid_amount' => 100,
        ]);
        $contract = Contract::create([
            'job_id' => $job->id, 'proposal_id' => $prop->id,
            'client_id' => $client->id, 'freelancer_id' => $freelancer->id,
            'title' => 'C', 'amount' => 500, 'status' => 'active',
        ]);

        app(LedgerService::class)->freezeContract($contract, 'Stripe dispute test');

        $this->assertSame('disputed', $contract->fresh()->status);
        $this->assertSame('Stripe dispute test', $contract->fresh()->dispute_reason);
        $this->assertNotNull($contract->fresh()->disputed_at);
    }
}
