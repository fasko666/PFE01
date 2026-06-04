<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\ContractActivity;

class ContractActivityService
{
    public function log(Contract $contract, ?int $actorId, string $type, array $data = []): ContractActivity
    {
        return ContractActivity::create([
            'contract_id' => $contract->id,
            'actor_id'    => $actorId,
            'type'        => $type,
            'data'        => $data,
            'created_at'  => now(),
        ]);
    }
}
