import { useEffect, useState } from "react";
import api from "../../axios";

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
      setCodes(res.data);
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
        valid_until: code.valid_until ? code.valid_until.split('T')[0] : "",
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
    <div className="p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-[#29AB87] dark:text-white tracking-tight">
          Promotion Codes
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#29AB87] text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          + Add New Code
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-[#29AB87] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-white dark:bg-[#2A2A2A] rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No promotion codes found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#2A2A2A] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Usage</th>
                  <th className="px-6 py-4">Valid Until</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50 dark:hover:bg-black/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{code.code}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {code.discount_value}%
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {code.usage_count} limit {code.usage_limit || "∞"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {code.valid_until ? `${code.valid_until.split('T')[0]} T00:00:00` : "No expiry"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleHidden(code)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          code.is_hidden
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {code.is_hidden ? "Hidden" : "Active"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleOpenModal(code)}
                        className="text-blue-500 hover:text-blue-700 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(code.id)}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1f1f1f] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCode ? "Edit Promotion Code" : "New Promotion Code"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Code</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#29AB87]/50 text-gray-900 dark:text-white"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Discount Percentage (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#29AB87]/50 text-gray-900 dark:text-white"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Valid Until</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#29AB87]/50 text-gray-900 dark:text-white"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#29AB87]/50 text-gray-900 dark:text-white"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="is_hidden"
                  checked={formData.is_hidden}
                  onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                  className="w-4 h-4 text-[#29AB87] bg-gray-100 border-gray-300 rounded focus:ring-[#29AB87] focus:ring-2"
                />
                <label htmlFor="is_hidden" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Hide code from customers
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#29AB87] text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
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
