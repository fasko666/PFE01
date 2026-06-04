<?php

namespace Tests\Feature\Catalog;

use App\Models\CatalogOrder;
use App\Models\CatalogProject;
use App\Models\Contract;
use App\Models\Conversation;
use App\Models\User;
use App\Services\CatalogCheckoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CatalogFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_freelancer_creates_catalog_project_in_pending_review(): void
    {
        $u = User::factory()->create();
        $u->forceFill(['role' => 'freelancer'])->save();
        Sanctum::actingAs($u);

        $this->postJson('/api/catalog', [
            'title' => 'Stripe integration', 'slug' => 'stripe-integration',
            'description' => str_repeat('Build a complete Stripe integration with webhooks. ', 4),
            'tier_basic'  => ['price' => 250, 'delivery_days' => 7, 'revisions' => 2],
        ])->assertStatus(201)
          ->assertJsonPath('data.status', 'pending_review');
    }

    public function test_client_cannot_create_catalog_project(): void
    {
        $u = User::factory()->create();
        $u->forceFill(['role' => 'client'])->save();
        Sanctum::actingAs($u);

        $this->postJson('/api/catalog', [
            'title' => 'X', 'slug' => 'x',
            'description' => str_repeat('x', 60),
            'tier_basic' => ['price' => 50, 'delivery_days' => 3, 'revisions' => 1],
        ])->assertStatus(403);
    }

    public function test_index_returns_only_published_projects(): void
    {
        $seller = User::factory()->create();
        $seller->forceFill(['role' => 'freelancer'])->save();

        CatalogProject::create([
            'seller_id' => $seller->id, 'title' => 'Pub', 'slug' => 'pub',
            'description' => str_repeat('x', 60),
            'tier_basic' => ['price' => 100, 'delivery_days' => 5, 'revisions' => 1],
            'status' => 'published',
        ]);
        CatalogProject::create([
            'seller_id' => $seller->id, 'title' => 'Pending', 'slug' => 'pending',
            'description' => str_repeat('x', 60),
            'tier_basic' => ['price' => 100, 'delivery_days' => 5, 'revisions' => 1],
            'status' => 'pending_review',
        ]);

        $res = $this->getJson('/api/catalog')->assertOk();
        $titles = collect($res->json('data.data'))->pluck('title')->all();
        $this->assertSame(['Pub'], $titles);
    }

    public function test_admin_can_approve_project(): void
    {
        $seller = User::factory()->create();
        $seller->forceFill(['role' => 'freelancer'])->save();
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        $project = CatalogProject::create([
            'seller_id' => $seller->id, 'title' => 'X', 'slug' => 'x',
            'description' => str_repeat('x', 60),
            'tier_basic' => ['price' => 50, 'delivery_days' => 3, 'revisions' => 1],
            'status' => 'pending_review',
        ]);

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/catalog/{$project->id}/approve")
            ->assertOk()->assertJsonPath('data.status', 'published');
    }

    public function test_save_and_unsave_catalog_project(): void
    {
        $u = User::factory()->create();
        $seller = User::factory()->create();
        $seller->forceFill(['role' => 'freelancer'])->save();
        $project = CatalogProject::create([
            'seller_id' => $seller->id, 'title' => 'X', 'slug' => 'x-save',
            'description' => str_repeat('x', 60),
            'tier_basic' => ['price' => 50, 'delivery_days' => 3, 'revisions' => 1],
            'status' => 'published',
        ]);

        Sanctum::actingAs($u);
        $this->postJson("/api/catalog/{$project->slug}/save")->assertOk()->assertJsonPath('data.saved', true);
        $this->assertDatabaseHas('saved_catalog_projects', ['user_id' => $u->id, 'catalog_project_id' => $project->id]);

        $this->deleteJson("/api/catalog/{$project->slug}/save")->assertOk()->assertJsonPath('data.saved', false);
    }

    public function test_paid_order_creates_contract_and_conversation(): void
    {
        $seller = User::factory()->create();
        $seller->forceFill(['role' => 'freelancer'])->save();
        $buyer = User::factory()->create();
        $buyer->forceFill(['role' => 'client'])->save();

        $project = CatalogProject::create([
            'seller_id' => $seller->id, 'title' => 'Logo', 'slug' => 'logo',
            'description' => str_repeat('x', 60),
            'tier_basic' => ['price' => 200, 'delivery_days' => 5, 'revisions' => 2],
            'status' => 'published',
        ]);

        $order = CatalogOrder::create([
            'catalog_project_id' => $project->id,
            'buyer_id' => $buyer->id, 'seller_id' => $seller->id,
            'tier' => 'basic', 'price' => 200,
            'delivery_days' => 5, 'revisions_allowed' => 2,
            'status' => 'pending_payment',
        ]);

        // Simulate a Stripe webhook payload (we don't hit Stripe in tests)
        $fakeSession = new \stdClass();
        $fakeSession->metadata = (object) ['panda_order_id' => $order->id];
        $fakeSession->payment_intent = 'pi_test_123';
        $fakeSession->id = 'cs_test_xyz';

        // Hack: wrap into Stripe\Checkout\Session — for the test we just call the
        // service directly with a duck-typed stdClass equivalent.
        $service = app(CatalogCheckoutService::class);
        $reflection = new \ReflectionMethod($service, 'markOrderPaidFromSession');
        $reflection->invoke($service, $fakeSession);

        $order->refresh();
        $this->assertSame('in_progress', $order->status);
        $this->assertNotNull($order->contract_id);
        $this->assertNotNull($order->conversation_id);

        $contract = Contract::find($order->contract_id);
        $this->assertSame((int) $buyer->id,  (int) $contract->client_id);
        $this->assertSame((int) $seller->id, (int) $contract->freelancer_id);
        $this->assertSame('200.00', (string) $contract->escrow_amount);
        $this->assertSame('active', $contract->status);

        $convo = Conversation::find($order->conversation_id);
        $this->assertSame(2, $convo->participants()->count());
    }

    public function test_buyer_can_review_after_delivery(): void
    {
        $seller = User::factory()->create();
        $buyer  = User::factory()->create();
        $project = CatalogProject::create([
            'seller_id' => $seller->id, 'title' => 'X', 'slug' => 'x-rev',
            'description' => str_repeat('x', 60),
            'tier_basic' => ['price' => 50, 'delivery_days' => 3, 'revisions' => 1],
            'status' => 'published',
        ]);
        $order = CatalogOrder::create([
            'catalog_project_id' => $project->id, 'buyer_id' => $buyer->id, 'seller_id' => $seller->id,
            'tier' => 'basic', 'price' => 50,
            'delivery_days' => 3, 'revisions_allowed' => 1,
            'status' => 'delivered',
        ]);

        Sanctum::actingAs($buyer);
        $this->postJson("/api/catalog/orders/{$order->id}/review", ['rating' => 5, 'comment' => 'Amazing work'])
            ->assertStatus(201)->assertJsonPath('data.rating', '5.00');

        $this->assertSame('5.00', (string) $project->fresh()->avg_rating);
        $this->assertSame(1, (int) $project->fresh()->reviews_count);
    }
}
