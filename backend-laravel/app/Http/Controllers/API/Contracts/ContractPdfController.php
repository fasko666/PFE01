<?php

namespace App\Http\Controllers\API\Contracts;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Renders contract / dispute as printable HTML. The frontend opens this in a
 * new tab and the user uses Cmd-P → "Save as PDF". This avoids pulling in a
 * PDF library and ships TODAY.
 *
 * If we later need real PDFs server-side, swap renderHtml() for a dompdf call.
 */
class ContractPdfController extends Controller
{
    public function contract(Request $request, Contract $contract): Response
    {
        $this->guard($request, $contract);
        $contract->load(['client', 'freelancer', 'milestones', 'job']);
        $html = $this->renderHtml('Contract #'.$contract->id, $this->contractBody($contract));
        return response($html)->header('Content-Type', 'text/html; charset=utf-8');
    }

    public function dispute(Request $request, Contract $contract): Response
    {
        $this->guard($request, $contract);
        if (! in_array($contract->status, ['disputed', 'cancelled', 'completed', 'active'], true) || ! $contract->disputed_at) {
            abort(404, 'No dispute on record for this contract');
        }
        $contract->load(['client', 'freelancer', 'disputeOpener', 'resolver']);
        $html = $this->renderHtml('Dispute report — Contract #'.$contract->id, $this->disputeBody($contract));
        return response($html)->header('Content-Type', 'text/html; charset=utf-8');
    }

    private function renderHtml(string $title, string $body): string
    {
        $css = <<<'CSS'
@page { margin: 24mm 16mm; }
body { font: 12pt/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color:#111; max-width: 760px; margin: 0 auto; padding: 24px; }
h1 { font-size: 24pt; margin: 0 0 4pt; }
h2 { font-size: 14pt; margin: 22pt 0 6pt; border-bottom: 1px solid #ddd; padding-bottom: 4pt; }
.muted { color:#666; font-size: 10pt; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
th, td { text-align: left; padding: 6pt 8pt; border-bottom: 1px solid #eee; font-size: 11pt; }
th { background: #f9f9f9; font-weight: 600; }
.bx { border: 1px solid #ddd; border-radius: 6pt; padding: 12pt; margin: 8pt 0; background: #fafafa; }
.brand { letter-spacing: 4pt; font-weight: 800; text-transform: uppercase; color:#4361ff; }
@media print { .noprint { display: none } }
CSS;
        return <<<HTML
<!doctype html><html><head><meta charset="utf-8"><title>{$title}</title><style>{$css}</style></head>
<body>
<div class="brand">PANDA</div>
<h1>{$title}</h1>
<p class="muted">Generated {date('Y-m-d H:i')}</p>
<div class="noprint" style="margin: 8pt 0 16pt"><button onclick="window.print()">Save as PDF / Print</button></div>
{$body}
</body></html>
HTML;
    }

    private function contractBody(Contract $c): string
    {
        $milestones = '';
        foreach ($c->milestones as $m) {
            $milestones .= '<tr><td>'.e($m->title).'</td><td>$'.number_format((float)$m->amount,2).'</td><td>'.e($m->status).'</td><td>'.($m->due_at ? $m->due_at->format('Y-m-d') : '—').'</td></tr>';
        }
        if (! $milestones) $milestones = '<tr><td colspan="4" style="color:#888">No milestones</td></tr>';

        return '
<h2>Parties</h2>
<table>
<tr><th>Client</th><td>'.e($c->client?->name ?? '—').' &lt;'.e($c->client?->email ?? '').'&gt;</td></tr>
<tr><th>Freelancer</th><td>'.e($c->freelancer?->name ?? '—').' &lt;'.e($c->freelancer?->email ?? '').'&gt;</td></tr>
</table>

<h2>Engagement</h2>
<table>
<tr><th>Job</th><td>'.e($c->job?->title ?? '—').'</td></tr>
<tr><th>Contract title</th><td>'.e($c->title).'</td></tr>
<tr><th>Type</th><td>'.e($c->type).'</td></tr>
<tr><th>Amount</th><td>$'.number_format((float)$c->amount,2).'</td></tr>
<tr><th>Status</th><td>'.e($c->status).'</td></tr>
<tr><th>Started</th><td>'.($c->started_at?->format('Y-m-d') ?? '—').'</td></tr>
<tr><th>Deadline</th><td>'.($c->deadline_at?->format('Y-m-d') ?? '—').'</td></tr>
</table>

<h2>Description</h2>
<div class="bx">'.nl2br(e((string)$c->description)).'</div>

<h2>Milestones</h2>
<table><tr><th>Title</th><th>Amount</th><th>Status</th><th>Due</th></tr>'.$milestones.'</table>

<h2>Terms</h2>
<div class="bx">'.($c->terms ? nl2br(e($c->terms)) : '<span class="muted">No additional terms.</span>').'</div>

<p class="muted">Contract #'.$c->id.' · PANDA Marketplace</p>';
    }

    private function disputeBody(Contract $c): string
    {
        return '
<h2>Summary</h2>
<table>
<tr><th>Contract</th><td>#'.$c->id.' — '.e($c->title).'</td></tr>
<tr><th>Status</th><td>'.e($c->status).'</td></tr>
<tr><th>Dispute opened</th><td>'.($c->disputed_at?->format('Y-m-d H:i') ?? '—').'</td></tr>
<tr><th>Opened by</th><td>'.e($c->disputeOpener?->name ?? '—').'</td></tr>
<tr><th>Resolved</th><td>'.($c->resolved_at?->format('Y-m-d H:i') ?? '—').'</td></tr>
<tr><th>Resolution</th><td>'.e($c->resolution_outcome ?? '—').' by '.e($c->resolver?->name ?? '—').'</td></tr>
</table>

<h2>Dispute reason</h2>
<div class="bx">'.nl2br(e((string)$c->dispute_reason)).'</div>

<h2>Amounts</h2>
<table>
<tr><th>Contract amount</th><td>$'.number_format((float)$c->amount,2).'</td></tr>
<tr><th>Escrow at time of report</th><td>$'.number_format((float)$c->escrow_amount,2).'</td></tr>
</table>
<p class="muted">Dispute report — Contract #'.$c->id.'</p>';
    }

    private function guard(Request $request, Contract $contract): void
    {
        if (! $request->user()->can('view', $contract)) {
            abort(response()->json(['message' => 'Forbidden'], 403));
        }
    }
}
