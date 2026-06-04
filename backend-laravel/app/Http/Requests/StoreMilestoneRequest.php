<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * POST /api/contracts/{contract}/milestones
 *
 * The frontend may post `due_date` (display) or `due_at` (DB column). We accept
 * both and normalize to `due_at` in validated() — see `passedValidation()`.
 */
class StoreMilestoneRequest extends FormRequest
{
    public function authorize(): bool { return true; } // authorization handled by Policy in the controller

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:3', 'max:5000'],
            'amount'      => ['required', 'numeric', 'min:0.01', 'max:1000000'],
            'due_date'    => ['required_without:due_at', 'nullable', 'date', 'after:today'],
            'due_at'      => ['required_without:due_date', 'nullable', 'date', 'after:today'],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'       => 'A milestone title is required.',
            'description.required' => 'Please describe what this milestone covers.',
            'amount.min'           => 'Amount must be greater than zero.',
            'due_date.after'       => 'Due date must be in the future.',
            'due_at.after'         => 'Due date must be in the future.',
        ];
    }

    /** Normalize due_date → due_at so the controller has one canonical field. */
    protected function passedValidation(): void
    {
        if ($this->filled('due_date') && ! $this->filled('due_at')) {
            $this->merge(['due_at' => $this->input('due_date')]);
        }
    }
}
