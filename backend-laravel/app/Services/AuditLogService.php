<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * Single entry point for compliance / forensic logging.
 *
 *   $audit->log('ledger.deposit', $user, $tx, ['amount' => 100]);
 *
 * Never throws — audit failures must not break the business action. We capture
 * IP + user agent from the current request when available.
 */
class AuditLogService
{
    public function __construct(private ?Request $request = null) {}

    public function log(
        string $action,
        ?int $actorId = null,
        ?Model $target = null,
        array $payload = [],
    ): ?AuditLog {
        try {
            return AuditLog::create([
                'actor_id'    => $actorId,
                'action'      => $action,
                'target_type' => $target ? get_class($target) : null,
                'target_id'   => $target?->getKey(),
                'payload'     => $payload ?: null,
                'ip_address'  => $this->request?->ip(),
                'user_agent'  => substr((string) $this->request?->userAgent(), 0, 500),
                'created_at'  => now(),
            ]);
        } catch (\Throwable $e) {
            // Audit log failure must never break the calling business action.
            \Log::warning('Audit log write failed', ['error' => $e->getMessage(), 'action' => $action]);
            return null;
        }
    }
}
