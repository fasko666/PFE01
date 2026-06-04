<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProposalRequest extends FormRequest
{
    public function authorize(): bool { return true; }   // Policy handled in controller
    public function rules(): array
    {
        return [
            'cover_letter'       => ['required', 'string', 'min:10', 'max:10000'],
            'bid_amount'         => ['required', 'numeric', 'min:1', 'max:1000000'],
            'estimated_days'     => ['nullable', 'integer', 'min:1', 'max:365'],
            'estimated_duration' => ['nullable', 'integer', 'min:1', 'max:365'],
            'is_ai_generated'    => ['nullable', 'boolean'],
        ];
    }
}
