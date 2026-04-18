"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:5050/api";
const APP_ID = "career_dna";

interface Coupon {
  _id: string;
  code: string;
  discount_type: "flat" | "percent";
  value: number;
  expiry_date: string;
  app_id: string;
  created_at: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Test amount from backend
  const [testAmount, setTestAmount] = useState<number>(499);
  const [editingAmount, setEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [savingAmount, setSavingAmount] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"flat" | "percent">("percent");
  const [value, setValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryTime, setExpiryTime] = useState("23:59");

  // Edit state
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editDiscountType, setEditDiscountType] = useState<"flat" | "percent">("percent");
  const [editValue, setEditValue] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editExpiryTime, setEditExpiryTime] = useState("23:59");
  const [saving, setSaving] = useState(false);

  // Computed preview
  const discountPreview = useMemo(() => {
    const v = Number(value);
    if (!v || v <= 0) return null;
    let discountAmt = 0;
    if (discountType === "percent") {
      discountAmt = Math.round((testAmount * v) / 100);
    } else {
      discountAmt = v;
    }
    discountAmt = Math.min(discountAmt, testAmount);
    const finalAmt = Math.max(testAmount - discountAmt, 0);
    return { discountAmt, finalAmt };
  }, [value, discountType, testAmount]);

  // Validation error
  const validationError = useMemo(() => {
    const v = Number(value);
    if (!v || v <= 0) return null;
    if (discountType === "flat" && v > testAmount) {
      return `Flat discount (₹${v}) cannot exceed test amount (₹${testAmount})`;
    }
    if (discountType === "percent" && v >= 100) {
      return "Percentage must be less than 100%";
    }
    return null;
  }, [value, discountType, testAmount]);

  const fetchAppConfig = async () => {
    try {
      const res = await axios.get(`${PAYMENT_API_URL}/admin/app-config/${APP_ID}`);
      setTestAmount(res.data.test_amount);
      setNewAmount(String(res.data.test_amount));
    } catch {
      // default stays 499
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${PAYMENT_API_URL}/admin/coupons`);
      const all: Coupon[] = res.data;
      setCoupons(all.filter((c) => c.app_id === APP_ID));
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppConfig();
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveAmount = async () => {
    const amt = Number(newAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSavingAmount(true);
    try {
      const res = await axios.put(`${PAYMENT_API_URL}/admin/app-config/${APP_ID}`, { test_amount: amt });
      setTestAmount(res.data.test_amount);
      setEditingAmount(false);
      toast.success("Test amount updated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update amount");
    } finally {
      setSavingAmount(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value || !expiryDate) {
      toast.error("Please fill all fields");
      return;
    }
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setCreating(true);
    try {
      await axios.post(`${PAYMENT_API_URL}/admin/coupons`, {
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        value: Number(value),
        expiry_date: `${expiryDate}T${expiryTime || "23:59"}:00`,
        app_id: APP_ID,
      });
      toast.success("Coupon created!");
      setCode("");
      setValue("");
      setExpiryDate("");
      setExpiryTime("23:59");
      setShowForm(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const editValidationError = useMemo(() => {
    const v = Number(editValue);
    if (!v || v <= 0) return null;
    if (editDiscountType === "flat" && v > testAmount) return `Flat discount (₹${v}) cannot exceed test amount (₹${testAmount})`;
    if (editDiscountType === "percent" && v >= 100) return "Percentage must be less than 100%";
    return null;
  }, [editValue, editDiscountType, testAmount]);

  const openEdit = (coupon: Coupon) => {
    const dt = new Date(coupon.expiry_date);
    const datePart = dt.toISOString().split("T")[0];
    const timePart = dt.toTimeString().slice(0, 5);
    setEditingCoupon(coupon);
    setEditDiscountType(coupon.discount_type);
    setEditValue(String(coupon.value));
    setEditExpiryDate(datePart);
    setEditExpiryTime(timePart);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editValue || !editExpiryDate) { toast.error("Please fill all fields"); return; }
    if (editValidationError) { toast.error(editValidationError); return; }
    setSaving(true);
    try {
      const res = await axios.put(`${PAYMENT_API_URL}/admin/coupons/${editingCoupon._id}`, {
        discount_type: editDiscountType,
        value: Number(editValue),
        expiry_date: `${editExpiryDate}T${editExpiryTime || "23:59"}:00`,
      });
      setCoupons((prev) => prev.map((c) => c._id === editingCoupon._id ? res.data : c));
      setEditingCoupon(null);
      toast.success("Coupon updated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`${PAYMENT_API_URL}/admin/coupons/${id}`);
      toast.success("Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch {
      toast.error("Failed to delete coupon");
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage pricing and discount coupons for this application</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl shadow hover:shadow-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? "Cancel" : "Add Coupon"}
        </button>
      </div>

      {/* Test Amount Setting */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Test Amount</h2>
            <p className="text-sm text-gray-500 mt-0.5">The price students pay to download their report</p>
          </div>
          {editingAmount ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-lg font-semibold">₹</span>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                min="1"
                className="w-28 px-3 py-2 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveAmount}
                disabled={savingAmount}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {savingAmount ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => { setEditingAmount(false); setNewAmount(String(testAmount)); }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">₹{testAmount}</span>
              <button
                onClick={() => { setEditingAmount(true); setNewAmount(String(testAmount)); }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Create New Coupon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE20"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => { setDiscountType(e.target.value as "flat" | "percent"); setValue(""); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount {discountType === "percent" ? "(%)" : "(₹)"}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={discountType === "percent" ? "e.g. 20" : "e.g. 100"}
                min="1"
                max={discountType === "percent" ? "99" : String(testAmount)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${validationError ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                required
              />
              {validationError && (
                <p className="text-xs text-red-500 mt-1">{validationError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                <input
                  type="time"
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  className="w-32 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Discount Preview */}
          {discountPreview && !validationError && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-1">Discount Preview</p>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-600">Test Amount: <strong>₹{testAmount}</strong></span>
                <span className="text-green-600">Discount: <strong>- ₹{discountPreview.discountAmt}</strong></span>
                <span className="text-blue-700">Student Pays: <strong className="text-lg">₹{discountPreview.finalAmt}</strong></span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={creating || !!validationError}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create Coupon"}
          </button>
        </form>
      )}

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="text-gray-500 font-medium">No coupons yet</p>
          <p className="text-gray-400 text-sm mt-1">Click &quot;Add Coupon&quot; to create one</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Code</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Discount</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Student Pays</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Valid Until</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => {
                const expired = isExpired(coupon.expiry_date);
                const disc = coupon.discount_type === "percent"
                  ? Math.round((testAmount * coupon.value) / 100)
                  : Math.min(coupon.value, testAmount);
                const studentPays = Math.max(testAmount - disc, 0);
                return (
                  <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {coupon.discount_type === "percent"
                        ? `${coupon.value}% (₹${disc})`
                        : `₹${coupon.value}`}
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-700">₹{studentPays}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(coupon.expiry_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      <span className="text-xs text-gray-500">
                        {new Date(coupon.expiry_date).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {expired ? (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-600">Expired</span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-50 text-green-600">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Edit Coupon</h2>
              <button type="button" onClick={() => setEditingCoupon(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-2.5">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Coupon Code (read-only)</p>
              <p className="font-mono font-bold text-gray-900">{editingCoupon.code}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={editDiscountType}
                onChange={(e) => { setEditDiscountType(e.target.value as "flat" | "percent"); setEditValue(""); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount {editDiscountType === "percent" ? "(%)" : "(₹)"}</label>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                min="1"
                max={editDiscountType === "percent" ? "99" : String(testAmount)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none ${editValidationError ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                required
              />
              {editValidationError && <p className="text-xs text-red-500 mt-1">{editValidationError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="time"
                  value={editExpiryTime}
                  onChange={(e) => setEditExpiryTime(e.target.value)}
                  className="w-32 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving || !!editValidationError}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
