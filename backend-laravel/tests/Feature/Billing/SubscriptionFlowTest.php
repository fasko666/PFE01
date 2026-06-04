<?php

namespace Tests\Feature\Billing;

use App\Models\Subscription;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubscriptionFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_plans_endpoint_returns_configured_plans(): void
    {
        $res = $this->getJson('/api/plans')->assertOk();
        $slugs = collect($res->json('data.plans'))->pluck('slug')->all();
        $this->assertContains('free', $slugs);
        $this->assertContains('freelancer_plus', $slugs);
        $this->assertContains('client_plus', $slugs);
        $this->assertContains('business', $slugs);
    }

    public function test_current_endpoint_returns_free_plan_when_no_subscription(): void
    {
        $u = User::factory()->create(['connects_balance' => 10]);
        Sanctum::actingAs($u);

        $this->getJson('/api/billing/subscription')
            ->assertOk()
            ->assertJsonPath('data.plan_slug', 'free')
            ->assertJsonPath('data.active', false)
            ->assertJsonPath('data.connects_balance', 10);
    }

    public function test_current_endpoint_reflects_active_subscription(): void
    {
        $u = User::factory()->create();
        Sanctum::actingAs($u);
        Subscription::create([
            'user_id' => $u->id, 'type' => 'default',
            'stripe_id' => 'sub_test_x', 'stripe_status' => 'active',
            'stripe_price' => 'price_x', 'plan_slug' => 'freelancer_plus',
        ]);

        $this->getJson('/api/billing/subscription')
            ->assertOk()
            ->assertJsonPath('data.plan_slug', 'freelancer_plus')
            ->assertJsonPath('data.active', true);
    }

    public function test_swap_requires_existing_subscription(): void
    {
        $u = User::factory()->create();
        Sanctum::actingAs($u);

        $this->postJson('/api/billing/swap', ['plan_slug' => 'business'])->assertStatus(404);
    }

    public function test_cancel_requires_existing_subscription(): void
    {
        $u = User::factory()->create();
        Sanctum::actingAs($u);
        $this->postJson('/api/billing/cancel')->assertStatus(404);
    }

    public function test_subscription_active_helper(): void
    {
        $sub = new Subscription(['stripe_status' => 'active']);
        $this->assertTrue($sub->active());
        $sub2 = new Subscription(['stripe_status' => 'canceled']);
        $this->assertFalse($sub2->active());
    }

    public function test_subscription_on_grace_period(): void
    {
        $sub = new Subscription([
            'stripe_status' => 'active',
            'ends_at' => now()->addDays(5),
        ]);
        $this->assertTrue($sub->onGracePeriod());
        $this->assertTrue($sub->active());
        $this->assertFalse($sub->recurring());
    }

    public function test_features_method_reads_from_config(): void
    {
        $sub = new Subscription(['plan_slug' => 'freelancer_plus']);
        $this->assertTrue($sub->hasFeature('see_who_viewed_profile'));
        $this->assertSame(80, $sub->features()['connects_monthly']);

        $free = new Subscription(['plan_slug' => 'free']);
        $this->assertFalse($free->hasFeature('see_who_viewed_profile'));
    }

    public function test_grant_connects_for_renewal_caps_at_max(): void
    {
        $u = User::factory()->create(['connects_balance' => 195]);
        $service = app(SubscriptionService::class);
        $delta = $service->grantConnectsForRenewal($u, 'freelancer_plus');  // +80 normally
        $this->assertSame(5, $delta);  // capped at 200
        $this->assertSame(200, (int) $u->fresh()->connects_balance);
    }

    public function test_invoices_returns_empty_when_no_stripe_customer(): void
    {
        $u = User::factory()->create();
        Sanctum::actingAs($u);
        $this->getJson('/api/billing/invoices')->assertOk()->assertJsonPath('data', []);
    }
}
