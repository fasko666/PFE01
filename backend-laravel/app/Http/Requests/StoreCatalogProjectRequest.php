<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCatalogProjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:160'],
            'slug'         => ['required', 'alpha_dash', 'max:160', Rule::unique('catalog_projects', 'slug')],
            'description'  => ['required', 'string', 'min:30', 'max:10000'],
            'category_id'  => ['nullable', 'integer', 'exists:categories,id'],
            'skills'       => ['nullable', 'array', 'max:30'],
            'tier_basic'   => ['required', 'array'],
            'tier_basic.price'         => ['required', 'numeric', 'min:5'],
            'tier_basic.delivery_days' => ['required', 'integer', 'min:1', 'max:90'],
            'tier_basic.revisions'     => ['required', 'integer', 'min:0', 'max:20'],
            'tier_standard' => ['nullable', 'array'],
            'tier_premium'  => ['nullable', 'array'],
            'faq'          => ['nullable', 'array'],
        ];
    }
}
