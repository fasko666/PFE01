<?php

namespace App\Http\Controllers\API\Payments;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\Contract;
use App\Models\Milestone;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function wallet(Request $request): JsonResponse
    {
        $wallet = $request->user()->wallet ?? Wallet::create(['user_id' => $request->user()->id]);
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get();

        return response()->json([
            'data' => array_merge($wallet->toArray(), ['transactions' => $transactions]),
        ]);
    }

    public function deposit(Request $request): JsonResponse
    {
        $request->validate(['amount' => 'required|numeric|min:10']);

        $wallet = $request->user()->wallet ?? Wallet::create(['user_id' => $request->user()->id]);
        $amount = (float) $request->amount;
        $fee    = round($amount * 0.03, 2);
        $net    = $amount - $fee;

        DB::transaction(function () use ($wallet, $amount, $fee, $net, $request) {
            Transaction::create([
                'wallet_id'   => $wallet->id,
                'user_id'     => $request->user()->id,
                'reference'   => 'DEP-' . strtoupper(Str::random(10)),
                'type'        => 'credit',
                'amount'      => $net,
                'fee'         => $fee,
                'status'      => 'completed',
                'description' => $request->description ?? 'Wallet top-up',
            ]);
            $wallet->increment('balance', $net);
        });

        return response()->json(['data' => ['message' => 'Funds added', 'amount' => $net]]);
    }

    public function fundEscrow(Request $request, Contract $contract): JsonResponse
    {
        $request->validate(['amount' => 'required|numeric|min:1']);

        if ($contract->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::transaction(function () use ($request, $contract) {
            $wallet = $request->user()->wallet;
            $amount = (float) $request->amount;

            Transaction::create([
                'wallet_id'   => $wallet->id,
                'user_id'     => $request->user()->id,
                'contract_id' => $contract->id,
                'reference'   => 'ESC-' . strtoupper(Str::random(10)),
                'type'        => 'escrow',
                'amount'      => $amount,
                'fee'         => $amount * 0.03,
                'status'      => 'completed',
                'description' => "Escrow funded for: {$contract->title}",
            ]);

            $contract->increment('escrow_amount', $amount);
        });

        return response()->json(['data' => ['message' => 'Escrow funded successfully']]);
    }

    public function releaseMilestone(Request $request, Milestone $milestone): JsonResponse
    {
        $contract = $milestone->contract;
        if ($contract->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($milestone->status !== 'submitted') {
            return response()->json(['message' => 'Milestone is not ready for release'], 400);
        }

        DB::transaction(function () use ($milestone, $contract) {
            $milestone->update(['status' => 'paid', 'approved_at' => now()]);

            $freelancerWallet = $contract->freelancer->wallet;
            $platformFee = $milestone->amount * 0.1;
            $netAmount   = $milestone->amount - $platformFee;

            Transaction::create([
                'wallet_id'    => $freelancerWallet->id,
                'user_id'      => $contract->freelancer_id,
                'contract_id'  => $contract->id,
                'milestone_id' => $milestone->id,
                'reference'    => 'PAY-' . strtoupper(Str::random(10)),
                'type'         => 'credit',
                'amount'       => $netAmount,
                'fee'          => $platformFee,
                'status'       => 'completed',
                'description'  => "Payment for milestone: {$milestone->title}",
            ]);

            $freelancerWallet->increment('balance', $netAmount);
        });

        return response()->json(['data' => ['message' => 'Payment released to freelancer']]);
    }

    public function overview(Request $request): JsonResponse
    {
        $user   = $request->user();
        $wallet = $user->wallet;

        $inEscrow = Transaction::where('user_id', $user->id)
            ->where('type', 'escrow')
            ->where('status', 'completed')
            ->sum('amount');

        $totalEarned = Transaction::where('user_id', $user->id)
            ->where('type', 'credit')
            ->where('status', 'completed')
            ->sum('amount');

        $totalSpent = Transaction::where('user_id', $user->id)
            ->whereIn('type', ['escrow', 'debit'])
            ->where('status', 'completed')
            ->sum('amount');

        return response()->json([
            'data' => [
                'in_escrow'    => $inEscrow,
                'total_earned' => $totalEarned,
                'total_spent'  => $totalSpent,
                'available'    => $wallet?->balance ?? 0,
            ],
        ]);
    }
}
