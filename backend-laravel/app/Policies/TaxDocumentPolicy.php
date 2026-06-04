<?php

namespace App\Policies;

use App\Models\TaxDocument;
use App\Models\User;

class TaxDocumentPolicy
{
    public function view(User $user, TaxDocument $doc): bool
    {
        return $user->role === 'admin' || (int) $doc->user_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return (bool) $user->id;
    }

    public function approve(User $user, TaxDocument $doc): bool
    {
        return $user->role === 'admin' && $doc->status === 'submitted';
    }

    public function reject(User $user, TaxDocument $doc): bool
    {
        return $user->role === 'admin' && $doc->status === 'submitted';
    }

    public function downloadPdf(User $user, TaxDocument $doc): bool
    {
        return $this->view($user, $doc) && $doc->status === 'approved';
    }
}
