<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAgencyRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:120'],
            'slug'        => ['required', 'string', 'max:120', 'alpha_dash', Rule::unique('agencies', 'slug')->whereNull('deleted_at')],
            'description' => ['nullable', 'string', 'max:5000'],
            'country'     => ['nullable', 'string', 'size:2'],
            'website'     => ['nullable', 'url', 'max:255'],
            'skills'      => ['nullable', 'array', 'max:30'],
            'skills.*'    => ['string', 'max:80'],
        ];
    }
}
