<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitIdentityVerificationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'document_type'   => ['required', 'in:passport,national_id,driving_license'],
            'document_number' => ['nullable', 'string', 'max:120'],
            'country'         => ['required', 'string', 'size:2'],
            'id_front'        => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'], // 8MB
            'id_back'         => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'selfie'          => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
        ];
    }
}
