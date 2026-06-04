<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaxDocumentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'form_type'    => ['required', 'in:w9,w8ben,vat'],
            'country'      => ['required', 'string', 'size:2'],
            'legal_name'   => ['required', 'string', 'max:200'],
            'tax_id'       => ['required', 'string', 'min:4', 'max:64'],   // we only persist last 4
            'address_line1'=> ['required', 'string', 'max:255'],
            'address_line2'=> ['nullable', 'string', 'max:255'],
            'city'         => ['required', 'string', 'max:120'],
            'state_region' => ['nullable', 'string', 'max:120'],
            'postal_code'  => ['required', 'string', 'max:20'],
            'form_payload' => ['nullable', 'array'],
        ];
    }
}
