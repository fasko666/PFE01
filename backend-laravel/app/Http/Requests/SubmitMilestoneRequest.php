<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitMilestoneRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'submission_message' => ['required', 'string', 'min:3', 'max:5000'],
            'attachments'        => ['nullable', 'array', 'max:20'],
            'attachments.*.url'  => ['nullable', 'string', 'max:2000'],
            'attachments.*.name' => ['nullable', 'string', 'max:255'],
            'attachments.*.size' => ['nullable', 'integer', 'min:0'],
            'attachments.*.mime' => ['nullable', 'string', 'max:120'],
        ];
    }

    public function messages(): array
    {
        return [
            'submission_message.required' => 'Please describe what you submitted for review.',
        ];
    }
}
