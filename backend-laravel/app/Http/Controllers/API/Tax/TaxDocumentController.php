<?php

namespace App\Http\Controllers\API\Tax;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaxDocumentRequest;
use App\Models\TaxDocument;
use App\Services\AuditLogService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TaxDocumentController extends Controller
{
    public function __construct(private AuditLogService $audit) {}

    /** GET /api/tax-documents — user's own documents */
    public function index(Request $request): JsonResponse
    {
        $rows = TaxDocument::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')->get();
        return response()->json(['data' => $rows]);
    }

    /** POST /api/tax-documents */
    public function store(StoreTaxDocumentRequest $request): JsonResponse
    {
        if (! $request->user()->can('create', TaxDocument::class)) throw new AuthorizationException();
        $data = $request->validated();

        $doc = TaxDocument::create([
            'user_id'        => $request->user()->id,
            'form_type'      => $data['form_type'],
            'country'        => strtoupper($data['country']),
            'legal_name'     => $data['legal_name'],
            'tax_id_last4'   => '****' . substr($data['tax_id'], -4),
            'address_line1'  => $data['address_line1'],
            'address_line2'  => $data['address_line2'] ?? null,
            'city'           => $data['city'],
            'state_region'   => $data['state_region'] ?? null,
            'postal_code'    => $data['postal_code'],
            'form_payload'   => $data['form_payload'] ?? null,
            'status'         => 'submitted',
            'submitted_at'   => now(),
        ]);

        $this->audit->log('tax.submitted', $request->user()->id, $doc, ['form_type' => $doc->form_type]);

        return response()->json(['data' => $doc], 201);
    }

    /** GET /api/tax-documents/{taxDocument} */
    public function show(Request $request, TaxDocument $taxDocument): JsonResponse
    {
        if (! $request->user()->can('view', $taxDocument)) throw new AuthorizationException();
        return response()->json(['data' => $taxDocument]);
    }

    /** GET /api/tax-documents/{taxDocument}/pdf — generates a printable HTML the browser saves as PDF. */
    public function pdf(Request $request, TaxDocument $taxDocument): Response
    {
        if (! $request->user()->can('downloadPdf', $taxDocument)) throw new AuthorizationException();
        $html = $this->renderHtml($taxDocument);
        return response($html)->header('Content-Type', 'text/html; charset=utf-8');
    }

    /* ── Admin ──────────────────────────────────────────────────────────── */

    /** GET /api/admin/tax-documents?status=submitted */
    public function adminIndex(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') throw new AuthorizationException();
        $request->validate(['status' => 'nullable|in:draft,submitted,approved,rejected']);

        $q = TaxDocument::with('user:id,name,email,username,country');
        if ($request->filled('status')) $q->where('status', $request->status);

        return response()->json([
            'data' => $q->orderByDesc('created_at')->paginate($request->integer('per_page', 20)),
        ]);
    }

    public function approve(Request $request, TaxDocument $taxDocument): JsonResponse
    {
        if (! $request->user()->can('approve', $taxDocument)) throw new AuthorizationException();

        $taxDocument->update([
            'status'      => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);
        $this->audit->log('tax.approved', $request->user()->id, $taxDocument);
        return response()->json(['data' => $taxDocument->fresh()]);
    }

    public function reject(Request $request, TaxDocument $taxDocument): JsonResponse
    {
        if (! $request->user()->can('reject', $taxDocument)) throw new AuthorizationException();
        $request->validate(['rejection_reason' => 'required|string|min:5|max:2000']);

        $taxDocument->update([
            'status'           => 'rejected',
            'reviewed_by'      => $request->user()->id,
            'reviewed_at'      => now(),
            'rejection_reason' => $request->input('rejection_reason'),
        ]);
        $this->audit->log('tax.rejected', $request->user()->id, $taxDocument, ['reason' => $request->input('rejection_reason')]);
        return response()->json(['data' => $taxDocument->fresh()]);
    }

    /** Server-rendered printable HTML (browser Cmd-P → Save as PDF). */
    private function renderHtml(TaxDocument $d): string
    {
        $css = '@page { margin: 24mm 16mm; } body { font: 12pt/1.5 -apple-system, "Segoe UI", sans-serif; color:#111; max-width: 760px; margin: 0 auto; padding: 24px; }
h1 { font-size: 22pt } table { width:100%; border-collapse: collapse; margin: 8pt 0 } th, td { text-align:left; padding:6pt 8pt; border-bottom: 1px solid #eee; }
@media print { .noprint { display:none } }';

        $title = strtoupper($d->form_type) . ' — ' . e($d->legal_name);
        return '<!doctype html><html><head><meta charset="utf-8"><title>'.$title.'</title><style>'.$css.'</style></head><body>
<div class="noprint"><button onclick="window.print()">Save as PDF</button></div>
<h1>'.$title.'</h1>
<p><em>Tax form on file with PANDA Marketplace.</em></p>
<table>
<tr><th>Form type</th><td>'.strtoupper($d->form_type).'</td></tr>
<tr><th>Country</th><td>'.e($d->country).'</td></tr>
<tr><th>Legal name</th><td>'.e($d->legal_name).'</td></tr>
<tr><th>Tax ID</th><td>'.e($d->tax_id_last4).'</td></tr>
<tr><th>Address</th><td>'.e($d->address_line1).' '.e((string)$d->address_line2).', '.e($d->city).' '.e((string)$d->state_region).' '.e($d->postal_code).'</td></tr>
<tr><th>Status</th><td>'.e($d->status).'</td></tr>
<tr><th>Submitted</th><td>'.($d->submitted_at?->format('Y-m-d').'</td></tr>').'
<tr><th>Approved</th><td>'.($d->reviewed_at?->format('Y-m-d') ?? '—').'</td></tr>
</table>
<p style="color:#888;font-size:10pt">Document #'.$d->id.' · generated '.date('Y-m-d H:i').'</p>
</body></html>';
    }
}
