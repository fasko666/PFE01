<?php

namespace Tests\Feature\Tax;

use App\Models\TaxDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaxDocumentFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_submits_tax_form_and_only_last4_persists(): void
    {
        $u = User::factory()->create();
        Sanctum::actingAs($u);

        $this->postJson('/api/tax-documents', [
            'form_type'   => 'w9', 'country' => 'US',
            'legal_name'  => 'Ada Lovelace', 'tax_id' => '123-45-6789',
            'address_line1' => '1 King St', 'city' => 'London', 'postal_code' => 'SW1A 1AA',
        ])->assertStatus(201)
          ->assertJsonPath('data.status', 'submitted')
          ->assertJsonPath('data.tax_id_last4', '****6789');

        $this->assertDatabaseMissing('tax_documents', ['tax_id_last4' => '123-45-6789']);
    }

    public function test_admin_approves_and_user_can_open_pdf(): void
    {
        $u     = User::factory()->create();
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        $doc = TaxDocument::create([
            'user_id'   => $u->id, 'form_type' => 'w9', 'country' => 'US',
            'legal_name' => 'X', 'tax_id_last4' => '****1234',
            'address_line1' => 'a', 'city' => 'b', 'postal_code' => 'c',
            'status' => 'submitted', 'submitted_at' => now(),
        ]);

        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/tax-documents/{$doc->id}/approve")->assertOk();

        Sanctum::actingAs($u);
        $res = $this->get("/api/tax-documents/{$doc->id}/pdf");
        $res->assertOk();
        $this->assertStringContainsString('W9', $res->getContent());
    }

    public function test_non_admin_cannot_approve(): void
    {
        $u = User::factory()->create();
        $doc = TaxDocument::create([
            'user_id' => $u->id, 'form_type' => 'w9', 'country' => 'US',
            'legal_name' => 'X', 'address_line1' => 'a', 'city' => 'b', 'postal_code' => 'c',
            'status' => 'submitted', 'submitted_at' => now(),
        ]);
        Sanctum::actingAs($u);
        $this->postJson("/api/admin/tax-documents/{$doc->id}/approve")->assertStatus(403);
    }
}
