"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PaymentComponentProps {
  userId: string;
  testId: string;
  appId: string;
  amount: number; // in INR
  apiBaseUrl: string; // e.g. "http://localhost:5050/api"
  authToken: string; // JWT token from the parent app
  onSuccess: () => void;
  onFailure?: (error: string) => void;
}

interface CouponResult {
  valid: boolean;
  discount?: number;
  final_amount?: number;
  message: string;
}

interface OrderResult {
  order_id: string;
  amount: number;
  final_amount: number;
  razorpay_key: string;
  free?: boolean;
  gst_amount?: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const GST_RATE = 0.18;

// ─── Component ──────────────────────────────────────────────────────────────

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  userId,
  testId,
  appId,
  amount,
  apiBaseUrl,
  authToken,
  onSuccess,
  onFailure,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const api = useMemo(() => axios.create({
    baseURL: apiBaseUrl,
    headers: { Authorization: `Bearer ${authToken}` },
  }), [apiBaseUrl, authToken]);

  // ─── Fetch GST setting from backend ────────────────────────────────────
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get(`/app-config/${appId}`);
        setGstEnabled(data.gst_enabled || false);
      } catch {
        // default: no GST
      }
    };
    fetchConfig();
  }, [api, appId]);

  // ─── Computed amounts ──────────────────────────────────────────────────
  const afterDiscount = useMemo(() => Math.max(amount - discount, 0), [amount, discount]);
  const gstAmount = useMemo(() => gstEnabled ? Math.round(afterDiscount * GST_RATE) : 0, [afterDiscount, gstEnabled]);
  const finalAmount = useMemo(() => afterDiscount + gstAmount, [afterDiscount, gstAmount]);

  // ─── Apply Coupon ───────────────────────────────────────────────────────
  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError("");
    setCouponMessage("");

    try {
      const { data } = await api.post<CouponResult>("/validate-coupon", {
        user_id: userId,
        coupon_code: couponCode.trim(),
        app_id: appId,
        amount,
      });

      if (data.valid) {
        setDiscount(data.discount || 0);
        setCouponApplied(true);
        setCouponMessage(data.message);
      } else {
        setError(data.message);
        setCouponApplied(false);
        setDiscount(0);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to validate coupon";
      setError(msg);
      setCouponApplied(false);
    } finally {
      setLoading(false);
    }
  }, [couponCode, userId, appId, amount, api]);

  // ─── Remove Coupon ──────────────────────────────────────────────────────
  const removeCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setDiscount(0);
    setCouponMessage("");
    setError("");
  };

  // ─── Load Razorpay Script ──────────────────────────────────────────────
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ─── Verify Payment ────────────────────────────────────────────────────
  const verifyPayment = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ): Promise<boolean> => {
    try {
      const { data } = await api.post("/verify-payment", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        user_id: userId,
        app_id: appId,
      });
      return data.success;
    } catch {
      return false;
    }
  };

  // ─── Handle Payment ────────────────────────────────────────────────────
  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Please check your connection.");
        setLoading(false);
        return;
      }

      // 2. Create order on backend
      const { data: order } = await api.post<OrderResult>("/create-order", {
        user_id: userId,
        test_id: testId,
        app_id: appId,
        amount,
        coupon_code: couponApplied ? couponCode.trim() : undefined,
      });

      // If fully discounted (free), skip Razorpay
      if (order.free) {
        onSuccess();
        setLoading(false);
        return;
      }

      // 3. Open Razorpay checkout
      const options = {
        key: order.razorpay_key,
        amount: order.final_amount * 100,
        currency: "INR",
        name: "Assessment Payment",
        description: `Payment for test`,
        order_id: order.order_id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify payment
          const verified = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          if (verified) {
            onSuccess();
          } else {
            const msg = "Payment verification failed. Please contact support.";
            setError(msg);
            onFailure?.(msg);
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        const msg = response.error?.description || "Payment failed";
        setError(msg);
        onFailure?.(msg);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to initiate payment";
      setError(msg);
      onFailure?.(msg);
      setLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-5">
      <h2 className="text-xl font-bold text-gray-800">Complete Payment</h2>

      {/* Price Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Amount</span>
          <span>₹{amount}</span>
        </div>
        {couponApplied && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>- ₹{discount}</span>
          </div>
        )}
        {couponApplied && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₹{afterDiscount}</span>
          </div>
        )}
        {gstEnabled && (
          <div className="flex justify-between text-sm text-orange-600">
            <span>GST (18%)</span>
            <span>+ ₹{gstAmount}</span>
          </div>
        )}
        <div className="border-t pt-2 flex justify-between font-semibold text-gray-800">
          <span>Total</span>
          <span>₹{finalAmount}</span>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Have a coupon?</label>
        {!couponApplied ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
              disabled={loading}
            />
            <button
              onClick={applyCoupon}
              disabled={loading || !couponCode.trim()}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "..." : "Apply"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm font-medium">✓ {couponCode}</span>
              <span className="text-green-600 text-xs">{couponMessage}</span>
            </div>
            <button
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Processing..." : `Pay ₹${finalAmount}`}
      </button>

      <p className="text-xs text-center text-gray-400">
        Secured by Razorpay. Your payment information is encrypted.
      </p>
    </div>
  );
};

export default PaymentComponent;
