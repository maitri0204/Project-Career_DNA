"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { generateInvoice } from "@/lib/generateInvoice";

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:5050/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
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
  invoice_number?: string | null;
}

interface UserProfile {
  id?: string;
  _id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobile?: string;
  state?: string;
  city?: string;
  country?: string;
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "success">("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<"all" | "free" | "razorpay">("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.id || user?._id;
        if (!userId) return;

        // Fetch payments and profile in parallel
        const [paymentsRes, profileRes] = await Promise.all([
          axios.post(`${PAYMENT_API_URL}/user-payments`, {
            user_id: userId,
            app_id: APP_ID,
          }, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
        ]);

        setPayments(paymentsRes.data.payments || []);

        if (profileRes?.data) {
          const p = profileRes.data.data || profileRes.data.user || profileRes.data;
          setProfile(p);
        } else {
          // Fallback from localStorage
          setProfile(user);
        }
      } catch {
        console.error("Failed to fetch payment data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const paymentId = (p.razorpay_payment_id || "").toLowerCase();
        if (!paymentId.includes(q)) return false;
      }
      if (dateFrom) {
        if (new Date(p.created_at) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(p.created_at) > to) return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (paymentTypeFilter === "free" && !p.razorpay_payment_id?.startsWith("free_")) return false;
      if (paymentTypeFilter === "razorpay" && (p.razorpay_payment_id?.startsWith("free_") || !p.razorpay_payment_id)) return false;
      return true;
    });
  }, [payments, searchQuery, dateFrom, dateTo, statusFilter, paymentTypeFilter]);

  const hasActiveFilters = searchQuery || dateFrom || dateTo || statusFilter !== "all" || paymentTypeFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
    setPaymentTypeFilter("all");
  };

  const handleDownloadInvoice = (payment: Payment) => {
    const userName = profile
      ? [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ")
      : "User";
    generateInvoice({
      payment,
      user: {
        name: userName,
        email: profile?.email || "",
        mobile: profile?.mobile || "",
        state: profile?.state || "",
        city: profile?.city || "",
        country: profile?.country || "India",
      },
      appId: APP_ID,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <span className="text-sm text-gray-500">{filteredPayments.length} of {payments.length} payments</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filters</h2>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
              Clear All Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Search Payment ID</label>
            <input type="text" placeholder="Payment ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Payment Type</label>
            <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value as typeof paymentTypeFilter)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
              <option value="all">All Types</option>
              <option value="razorpay">Razorpay</option>
              <option value="free">Free (Coupon)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500 font-medium">{hasActiveFilters ? "No payments match the filters" : "No payments yet"}</p>
          <p className="text-gray-400 text-sm mt-1">
            {hasActiveFilters ? "" : "Your payment history will appear here after you make a purchase"}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">Clear Filters</button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Discount</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">GST</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Paid</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Payment ID</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">₹{p.amount}</td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {(p.discount_amount || 0) > 0 ? `- ₹${p.discount_amount}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-600">
                      {p.gst_applicable ? `₹${p.gst_amount || 0}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{p.final_amount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === "success" ? "bg-green-50 text-green-700" :
                        p.status === "paid" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {p.status === "success" ? "Success" : p.status === "paid" ? "Free" : p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {p.razorpay_payment_id?.startsWith("free_") ? "Free" : p.razorpay_payment_id?.slice(-12) || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDownloadInvoice(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Download Invoice"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Invoice
                      </button>
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
