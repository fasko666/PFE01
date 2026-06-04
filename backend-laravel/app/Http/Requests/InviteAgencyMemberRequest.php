<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InviteAgencyMemberRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'role'  => ['required', 'in:admin,freelancer'],
        ];
    }
}
