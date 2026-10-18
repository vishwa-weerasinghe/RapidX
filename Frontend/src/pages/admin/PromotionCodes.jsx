import { useEffect, useState } from "react";
import api from "../../axios";
import { Tag, Plus, Edit3, Trash2, Eye, EyeOff, Calendar, Percent, X, RefreshCw } from "lucide-react";

export default function PromotionCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    valid_until: "",
    usage_limit: "",
    is_hidden: false,
  });

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/promotion-codes");
      setCodes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleOpenModal = (code = null) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        discount_type: code.discount_type,
        discount_value: code.discount_value,
        valid_until: code.valid_until ? code.valid_until.split("T")[0] : "",
        usage_limit: code.usage_limit || "",
        is_hidden: code.is_hidden,
      });
    } else {
      setEditingCode(null);
      setFormData({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        valid_until: "",
        usage_limit: "",
        is_hidden: false,
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this promotion code?")) return;
    try {
      await api.delete(`/promotion-codes/${id}`);
      setCodes(codes.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete code.");
    }
  };

  const handleToggleHidden = async (code) => {
    try {
      const res = await api.put(`/promotion-codes/${code.id}`, {
        ...code,
        is_hidden: !code.is_hidden,
      });
      setCodes(codes.map((c) => (c.id === code.id ? res.data : c)));
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.usage_limit) payload.usage_limit = null;
      if (!payload.valid_until) payload.valid_until = null;

      if (editingCode) {
        const res = await api.put(`/promotion-codes/${editingCode.id}`, payload);
        setCodes(codes.map((c) => (c.id === editingCode.id ? res.data : c)));
      } else {
        const res = await api.post("/promotion-codes", payload);
        setCodes([res.data, ...codes]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving promotion code.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sacramento/10 dark:bg-sacramento-900/40 text-sacramento dark:text-sacramento-300">
            <Tag size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Promotion Codes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Create seasonal vouchers, percentage discounts, and voucher limits.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sacramento hover:bg-sacramento-600 dark:bg-castleton-500 dark:hover:bg-castleton-600 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>New Promotion Code</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-emerald-100 border-t-sacramento animate-spin" />
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading promotion codes...</p>
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-white dark:bg-[#16231c] rounded-3xl border border-border-light dark:border-border-dark/60 p-12 text-center">
          <Tag size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">No Promotion Codes Created</h3>
          <p className="text-xs text-slate-400 mb-5">Create discount codes to run seasonal marketing campaigns.</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sacramento text-white text-xs font-bold"
          >
            <Plus size={14} /> Add First Code
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card View (visible on < sm screens) */}
          <div className="grid grid-cols-1 gap-3.5 sm:hidden">
            {codes.map((code) => (
              <div
                key={code.id}
                className="bg-white dark:bg-[#16231c] p-4 rounded-2xl border border-border-light dark:border-border-dark/60 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-xl bg-sacramento/10 text-sacramento dark:text-sacramento-300 font-mono font-black text-sm tracking-wider">
                      {code.code}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {code.discount_value}% OFF
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(code)}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-surface-2 text-slate-600 dark:text-slate-300 hover:text-sacramento transition-colors"
                      title="Edit Code"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                      title="Delete Code"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-light/60 dark:border-border-dark/40 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 text-center">
                    <span className="block text-[10px] text-slate-400 font-semibold">Usage</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {code.usage_count || 0} / {code.usage_limit || "∞"}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 text-center">
                    <span className="block text-[10px] text-slate-400 font-semibold">Expiry</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {code.valid_until ? code.valid_until.split("T")[0] : "None"}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-surface-2/60 text-center flex flex-col justify-center">
                    <button
                      onClick={() => handleToggleHidden(code)}
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        code.is_hidden
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {code.is_hidden ? "Hidden" : "Active"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table (visible on sm and larger screens) */}
          <div className="hidden sm:block overflow-hidden rounded-3xl bg-white dark:bg-[#16231c] border border-border-light dark:border-border-dark/60 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-surface-2/40 text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-border-light/60 dark:border-border-dark/40">
                    <th className="px-5 py-3.5 text-left">Voucher Code</th>
                    <th className="px-5 py-3.5 text-left">Discount</th>
                    <th className="px-5 py-3.5 text-left">Redemptions</th>
                    <th className="px-5 py-3.5 text-left">Validity</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60 dark:divide-border-dark/40">
                  {codes.map((code) => (
                    <tr
                      key={code.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-surface-2/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-xl bg-sacramento/10 text-sacramento dark:text-sacramento-300 font-mono font-bold text-sm">
                          {code.code}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">
                        {code.discount_value}% OFF
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {code.usage_count || 0} / {code.usage_limit || "Unlimited"}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {code.valid_until ? (
                          <span className="flex items-center gap-1.5 font-mono">
                            <Calendar size={13} className="text-sacramento" />
                            {code.valid_until.split("T")[0]}
                          </span>
                        ) : (
                          "No expiration"
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleToggleHidden(code)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            code.is_hidden
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {code.is_hidden ? (
                            <>
                              <EyeOff size={12} />
                              Hidden
                            </>
                          ) : (
                            <>
                              <Eye size={12} />
                              Active
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(code)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sacramento hover:bg-slate-100 dark:hover:bg-surface-2 transition-colors"
                            title="Edit Code"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(code.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Code"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modern Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16231c] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-border-light dark:border-border-dark/60">
            <div className="p-6 border-b border-border-light dark:border-border-dark/60 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingCode ? "Edit Promotion Code" : "Create Promotion Code"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Define coupon code, discount percentage, and limits.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Voucher Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAFARI2026"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-2 border border-slate-200 dark:border-border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-sacramento/30 text-sm font-bold text-slate-900 dark:text-white uppercase"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  required
                  placeholder="e.g. 15"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-2 border border-slate-200 dark:border-border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-sacramento/30 text-sm text-slate-900 dark:text-white font-mono"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-2 border border-slate-200 dark:border-border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-sacramento/30 text-sm text-slate-900 dark:text-white font-mono"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-2 border border-slate-200 dark:border-border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-sacramento/30 text-sm text-slate-900 dark:text-white font-mono"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_hidden"
                  checked={formData.is_hidden}
                  onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                  className="w-4 h-4 text-sacramento rounded border-slate-300 focus:ring-sacramento/40"
                />
                <label htmlFor="is_hidden" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Hide code from public showcase
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border-light/60 dark:border-border-dark/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-surface-2 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sacramento hover:bg-sacramento-600 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
