"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { generateInvoice } from "@/lib/generateInvoice";

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:5050/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
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

interface UserDetail {
  name: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  state: string;
  city: string;
  country: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState<Record<string, UserDetail>>({});

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "success">("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<"all" | "free" | "razorpay">("all");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token") || "";
        const { data } = await axios.get(`${PAYMENT_API_URL}/admin/payments/${APP_ID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const paymentsList: Payment[] = data.payments || [];
        setPayments(paymentsList);
        setSummary(data.summary || null);

        // Fetch user details
        const userIds = [...new Set(paymentsList.map((p) => p.user_id))];
        if (userIds.length > 0) {
          try {
            const userRes = await axios.post(`${API_URL}/test/admin/users-by-ids`, { user_ids: userIds }, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUserMap(userRes.data.users || {});
          } catch {
            console.error("Failed to fetch user details");
          }
        }
      } catch (err) {
        console.error("Failed to fetch payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const userName = (userMap[p.user_id]?.name || "").toLowerCase();
        const paymentId = (p.razorpay_payment_id || "").toLowerCase();
        const userId = p.user_id.toLowerCase();
        if (!userName.includes(q) && !paymentId.includes(q) && !userId.includes(q)) return false;
      }
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(p.created_at) < from) return false;
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
  }, [payments, searchQuery, dateFrom, dateTo, statusFilter, paymentTypeFilter, userMap]);

  const filteredSummary = useMemo(() => {
    const total_payments = filteredPayments.length;
    const total_revenue = filteredPayments.reduce((sum, p) => sum + p.final_amount, 0);
    const total_gst = filteredPayments.reduce((sum, p) => sum + (p.gst_amount || 0), 0);
    const total_discount = filteredPayments.reduce((sum, p) => sum + (p.discount_amount || 0), 0);
    return { total_payments, total_revenue, total_gst, total_discount, revenue_before_gst: total_revenue - total_gst };
  }, [filteredPayments]);

  const hasActiveFilters = searchQuery || dateFrom || dateTo || statusFilter !== "all" || paymentTypeFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setStatusFilter("all");
    setPaymentTypeFilter("all");
  };

  const handleDownloadInvoice = (payment: Payment) => {
    const userDetail = userMap[payment.user_id];
    generateInvoice({
      payment,
      user: {
        name: userDetail?.name || "Unknown User",
        email: userDetail?.email || "",
        mobile: userDetail?.mobile || "",
        state: userDetail?.state || "",
        city: userDetail?.city || "",
        country: userDetail?.country || "India",
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

  const displaySummary = hasActiveFilters ? filteredSummary : summary;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <span className="text-sm text-gray-500">{filteredPayments.length} of {payments.length} payments</span>
      </div>

      {/* Revenue Summary Cards */}
      {displaySummary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{displaySummary.total_payments}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600 mt-1">₹{displaySummary.total_revenue}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue (excl. GST)</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">₹{displaySummary.revenue_before_gst}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">GST Collected</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">₹{displaySummary.total_gst}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Discounts</p>
            <p className="text-2xl font-bold text-red-500 mt-1">₹{displaySummary.total_discount}</p>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <input type="text" placeholder="Name or Payment ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900">
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="paid">Paid (Free)</option>
            </select>
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
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">User Name</th>
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
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {userMap[p.user_id]?.name || <span className="text-gray-400 font-mono text-xs">{p.user_id.slice(-8)}</span>}
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
