"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:5050/api";
const APP_ID = "career_dna";

interface Payment {
  _id: string;
  user_id: string;
  test_id: string;
  amount: number;
  final_amount: number;
  discount_amount?: number;
  gst_applicable?: boolean;
  gst_amount?: number;
  coupon_id: string | null;
  razorpay_payment_id: string | null;
  status: string;
  created_at: string;
}

interface Summary {
  total_payments: number;
  total_revenue: number;
  total_gst: number;
  total_discount: number;
  revenue_before_gst: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
        const { data } = await axios.get(`${PAYMENT_API_URL}/admin/payments/${APP_ID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(data.payments || []);
        setSummary(data.summary || null);
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>

      {/* Revenue Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total_payments}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600 mt-1">₹{summary.total_revenue}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue (excl. GST)</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">₹{summary.revenue_before_gst}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">GST Collected</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">₹{summary.total_gst}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Discounts</p>
            <p className="text-2xl font-bold text-red-500 mt-1">₹{summary.total_discount}</p>
          </div>
        </div>
      )}

      {/* Payments Table */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500 font-medium">No payments yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">User ID</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Discount</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">GST</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Paid</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(p.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">{p.user_id.slice(-8)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">₹{p.amount}</td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {(p.discount_amount || 0) > 0 ? `- ₹${p.discount_amount}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-600">
                      {p.gst_applicable ? `₹${p.gst_amount || 0}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{p.final_amount}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {p.razorpay_payment_id?.startsWith("free_") ? "Free" : p.razorpay_payment_id?.slice(-12) || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
