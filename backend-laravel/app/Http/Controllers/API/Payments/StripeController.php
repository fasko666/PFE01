<?php

namespace App\Http\Controllers\API\Payments;

use App\Http\Controllers\Controller;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/**
 * Public-facing Stripe endpoints used by the React frontend:
 *  - POST /payments/stripe/deposit-session  — create Checkout session for wallet top-up
 *  - POST /payments/stripe/connect/onboard  — get a Connect onboarding URL
 *  - GET  /payments/stripe/connect/status   — refresh + return Connect status
 */
class StripeController extends Controller
{
    public function __construct(private StripeService $stripe) {}

    public function createDepositSession(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:5|max:100000',
        ]);

        try {
            $session = $this->stripe->createDepositCheckout(
                $request->user(),
                (float) $request->amount,
                'dep:'.$request->user()->id.':'.$request->amount.':'.now()->timestamp,
            );
            return response()->json([
                'data' => [
                    'session_id'  => $session->id,
                    'checkout_url'=> $session->url,
                ],
            ]);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function connectOnboard(Request $request): JsonResponse
    {
        try {
            $url = $this->stripe->createOnboardingLink($request->user());
            return response()->json(['data' => ['onboarding_url' => $url]]);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function connectStatus(Request $request): JsonResponse
    {
        try {
            $status = $this->stripe->syncConnectStatus($request->user());
            return response()->json(['data' => $status]);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
