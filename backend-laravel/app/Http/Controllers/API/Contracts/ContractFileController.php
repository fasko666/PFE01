<?php

namespace App\Http\Controllers\API\Contracts;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\ContractFile;
use App\Services\ContractActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ContractFileController extends Controller
{
    public function __construct(private ContractActivityService $activity) {}

    public function index(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, $contract);
        $files = $contract->files()->with(['uploader:id,name,avatar', 'versions.uploader:id,name,avatar'])->orderByDesc('created_at')->get();
        return response()->json(['data' => $files]);
    }

    public function store(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, $contract);
        $request->validate([
            'file'        => 'required|file|max:51200',   // 50 MB cap
            'description' => 'nullable|string|max:500',
        ]);
        $f = $request->file('file');
        $stored = $f->store("contracts/{$contract->id}/files", 'public');

        $row = ContractFile::create([
            'contract_id'   => $contract->id,
            'uploader_id'   => $request->user()->id,
            'original_name' => $f->getClientOriginalName(),
            'stored_path'   => $stored,
            'mime_type'     => $f->getClientMimeType(),
            'size_bytes'    => $f->getSize(),
            'version'       => 1,
            'description'   => $request->input('description'),
        ]);

        $this->activity->log($contract, $request->user()->id, 'file.uploaded',
            ['file_id' => $row->id, 'name' => $row->original_name, 'size' => $row->size_bytes]);

        return response()->json(['data' => $row->load('uploader:id,name,avatar')], 201);
    }

    /** Upload a new version of an existing file (linked via parent_id chain). */
    public function storeVersion(Request $request, ContractFile $file): JsonResponse
    {
        $this->guard($request, $file->contract);
        $request->validate(['file' => 'required|file|max:51200']);
        $f = $request->file('file');
        $stored = $f->store("contracts/{$file->contract_id}/files", 'public');

        // version number = max version in chain + 1
        $root = $file->parent_id ? ContractFile::find($file->parent_id) : $file;
        $maxVersion = ContractFile::where(function ($w) use ($root) {
            $w->where('id', $root->id)->orWhere('parent_id', $root->id);
        })->max('version');

        $row = ContractFile::create([
            'contract_id'   => $file->contract_id,
            'uploader_id'   => $request->user()->id,
            'parent_id'     => $root->id,
            'original_name' => $f->getClientOriginalName(),
            'stored_path'   => $stored,
            'mime_type'     => $f->getClientMimeType(),
            'size_bytes'    => $f->getSize(),
            'version'       => $maxVersion + 1,
            'description'   => $request->input('description'),
        ]);

        $this->activity->log($file->contract, $request->user()->id, 'file.versioned',
            ['parent_id' => $root->id, 'new_version' => $row->version]);

        return response()->json(['data' => $row], 201);
    }

    public function download(Request $request, ContractFile $file): StreamedResponse
    {
        $this->guard($request, $file->contract);
        if (! Storage::disk('public')->exists($file->stored_path)) {
            abort(404);
        }
        return Storage::disk('public')->download($file->stored_path, $file->original_name);
    }

    public function destroy(Request $request, ContractFile $file): JsonResponse
    {
        $this->guard($request, $file->contract);
        if ((int) $file->uploader_id !== (int) $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Only the uploader or an admin can delete this file'], 403);
        }
        $file->delete(); // soft delete (file stays on disk for recovery)
        $this->activity->log($file->contract, $request->user()->id, 'file.deleted', ['file_id' => $file->id]);
        return response()->json(['data' => ['deleted' => true]]);
    }

    private function guard(Request $request, Contract $contract): void
    {
        if (! $request->user()->can('view', $contract)) {
            abort(response()->json(['message' => 'Forbidden'], 403));
        }
    }
}
