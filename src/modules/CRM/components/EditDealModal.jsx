// EditDealModal.jsx
import { useState } from "react";
import { X } from "lucide-react";
import { mapDealStageToEnum, DealStage } from "../services/Crmservice"; // adjust path

export default function EditDealModal({ deal, onClose, onSave }) {
  const [formData, setFormData] = useState({
    dealName: deal.dealName || "",
    dealAmount: deal.dealAmount || 0,
    dealStage: deal.dealStage,
    expectedCloseDate: deal.expectedCloseDate
      ? new Date(deal.expectedCloseDate).toISOString().split("T")[0]
      : "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = formData.dealName.trim();
    if (!trimmedName) {
      alert("Deal name is required!");
      return; // prevent submit
    }
    // Prepare data for API (convert back to numbers/enums if needed)
    const payload = {
      dealName: trimmedName,
      dealAmount: Number(formData.dealAmount) || 0,
      dealStage: Number(formData.dealStage),
      expectedCloseDate: formData.expectedCloseDate || null, // already "yyyy-MM-dd"

      // Preserve original values from the existing deal (critical!)
      customerId: deal.customerId ,
      leadId: deal.leadId 
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Edit Deal</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500 hover:text-gray-800" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Name
            </label>
            <input
              type="text"
              name="dealName"
              value={formData.dealName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              name="dealAmount"
              value={formData.dealAmount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage
            </label>
            <select
              name="dealStage"
              value={formData.dealStage}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value={DealStage.PROSPECTING}>Prospecting</option>
              <option value={DealStage.QUALIFICATION}>Qualification</option>
              <option value={DealStage.PROPOSAL}>Proposal</option>
              <option value={DealStage.NEGOTIATION}>Negotiation</option>
              <option value={DealStage.CLOSED_WON}>Closed Won</option>
              <option value={DealStage.CLOSED_LOST}>Closed Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Close Date
            </label>
            <input
              type="date"
              name="expectedCloseDate"
              value={formData.expectedCloseDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
