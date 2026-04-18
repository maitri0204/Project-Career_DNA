"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:5050/api";
const APP_ID = "career_dna";

interface Payment {
  _id: string;
  amount: number;
  final_amount: number;
  discount_amount?: number;
  gst_applicable?: boolean;
  gst_amount?: number;
  razorpay_payment_id: string | null;
  status: string;
  created_at: string;
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user?._id) return;

        const { data } = await axios.post(`${PAYMENT_API_URL}/user-payments`, {
          user_id: user._id,
          app_id: APP_ID,
        }, { headers: { Authorization: `Bearer ${token}` } });
        setPayments(data.payments || []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>

      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500 font-medium">No payments yet</p>
          <p className="text-gray-400 text-sm mt-1">Your payment history will appear here after you make a purchase</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">
                  {new Date(p.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-50 text-green-600">
                  Paid
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Amount</span>
                  <span>₹{p.amount}</span>
                </div>
                {(p.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{p.discount_amount}</span>
                  </div>
                )}
                {(p.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{p.amount - (p.discount_amount || 0)}</span>
                  </div>
                )}
                {p.gst_applicable && (
                  <div className="flex justify-between text-orange-600">
                    <span>GST (18%)</span>
                    <span>+ ₹{p.gst_amount || 0}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                  <span>Total Paid</span>
                  <span>₹{p.final_amount}</span>
                </div>
              </div>

              {p.razorpay_payment_id && !p.razorpay_payment_id.startsWith("free_") && (
                <p className="text-xs text-gray-400 mt-3">
                  Transaction ID: {p.razorpay_payment_id}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
