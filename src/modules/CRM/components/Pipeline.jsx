import { useState } from "react";
import EditDealModal from "../components/EditDealModal";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Building2,
  DollarSign,
  Calendar,
  User,
  Edit,
  Trash2,
} from "lucide-react";
import { mapEnumToDealStage, pipelineApi } from "../services/Crmservice";

export default function Pipeline({
  pipelineDeals = [],
  pipelineData,
  loadPipeline,
  canManage,
  canAccess,
}) {
  // Group deals by stage for visualization
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  console.log(pipelineDeals);
  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setShowEditModal(true);
  };
  const handleDeleteDeal = async (dealId, dealName) => {
    // Simple browser confirm (you can replace with a custom modal later)
    const confirmed = window.confirm(
      `Are you sure you want to delete deal "${dealName}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await pipelineApi.delete(dealId);
      // Refresh the list
      loadPipeline();
      // Optional: show success message
      alert("Deal deleted successfully");
    } catch (err) {
      console.error("Failed to delete deal:", err);
      alert("Could not delete deal. Please try again.");
    }
  };
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingDeal(null);
  };

  const handleSaveDeal = async (updatedDeal) => {
    try {
      // Use the existing pipelineApi.update
      await pipelineApi.update(editingDeal.id, updatedDeal);
      // Refresh pipeline data
      loadPipeline();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to update deal:", err);
      alert("Could not update deal. Check console.");
    }
  };
  const dealStageData = [
    {
      stage: "Prospecting",
      count: pipelineDeals.filter((d) => d.dealStage === 1).length,
      value: pipelineDeals
        .filter((d) => d.dealStage === 1)
        .reduce((s, d) => s + d.dealAmount, 0),
    },
    {
      stage: "Qualification",
      count: pipelineDeals.filter((d) => d.dealStage === 2).length,
      value: pipelineDeals
        .filter((d) => d.dealStage === 2)
        .reduce((s, d) => s + d.dealAmount, 0),
    },
    {
      stage: "Proposal",
      count: pipelineDeals.filter((d) => d.dealStage === 3).length,
      value: pipelineDeals
        .filter((d) => d.dealStage === 3)
        .reduce((s, d) => s + d.dealAmount, 0),
    },
    {
      stage: "Negotiation",
      count: pipelineDeals.filter((d) => d.dealStage === 4).length,
      value: pipelineDeals
        .filter((d) => d.dealStage === 4)
        .reduce((s, d) => s + d.dealAmount, 0),
    },
    {
      stage: "Closed Won",
      count: pipelineDeals.filter((d) => d.dealStage === 5).length,
      value: pipelineDeals
        .filter((d) => d.dealStage === 5)
        .reduce((s, d) => s + d.dealAmount, 0),
    },
    {
      stage: "Closed Lost",
      count: pipelineDeals.filter((d) => d.dealStage === 6).length,
      value: pipelineDeals
        .filter((d) => d.dealStage === 6)
        .reduce((s, d) => s + d.dealAmount, 0),
    },
  ];

  const getDealStageColor = (stage) => {
    switch (stage) {
      case 1:
        return "bg-blue-100 text-blue-700";
      case 2:
        return "bg-purple-100 text-purple-700";
      case 3:
        return "bg-yellow-100 text-yellow-700";
      case 4:
        return "bg-orange-100 text-orange-700";
      case 5:
        return "bg-green-100 text-green-700";
      case 6:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Pipeline Stages Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lead Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pipelineData.map((stage, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {stage.stage}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Leads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stage.count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-xl font-bold text-pink-600">
                    ${(stage.value / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Pipeline Stages Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Active Deals Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealStageData
            .filter((stage) => stage.count > 0)
            .map((stage, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {stage.stage}
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Deals</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stage.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-xl font-bold text-pink-600">
                      ${(stage.value / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Lead Pipeline Visualization
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={pipelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis yAxisId="left" orientation="left" stroke="#ec4899" />
            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="count"
              fill="#ec4899"
              name="Number of Leads"
            />
            <Bar
              yAxisId="right"
              dataKey="value"
              fill="#3b82f6"
              name="Value ($)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Deal Pipeline Visualization */}
      {dealStageData.some((stage) => stage.count > 0) && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Deal Pipeline Visualization
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dealStageData.filter((s) => s.count > 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis yAxisId="left" orientation="left" stroke="#ec4899" />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="count"
                fill="#ec4899"
                name="Number of Deals"
              />
              <Bar
                yAxisId="right"
                dataKey="value"
                fill="#3b82f6"
                name="Value ($)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Active Deals List */}
      {pipelineDeals.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900">Active Deals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Deal Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Stage
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Expected Close
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Customer ID
                  </th>
                  {(canAccess || canManage) && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pipelineDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {deal.dealName}
                          </p>
                          {deal.leadId && (
                            <p className="text-xs text-gray-500">
                              Lead ID: {deal.leadId}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          ${deal.dealAmount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getDealStageColor(
                          deal.dealStage,
                        )}`}
                      >
                        {mapEnumToDealStage(deal.dealStage)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {deal.expectedCloseDate}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {deal.customerId}
                    </td>
                    {canAccess && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditDeal(deal)}
                            className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                            title="Edit Deal"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <button
                              onClick={() =>
                                handleDeleteDeal(deal.id, deal.dealName)
                              }
                              className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                              title="Delete Deal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showEditModal && editingDeal && (
        <EditDealModal
          deal={editingDeal}
          onClose={handleCloseModal}
          onSave={handleSaveDeal}
          mapEnumToDealStage={mapEnumToDealStage}
        />
      )}
      {/* Empty State */}
      {pipelineDeals.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-lg border border-gray-100 text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Active Deals
          </h3>
          <p className="text-gray-600">
            Convert leads to customers to create deals in the pipeline
          </p>
        </div>
      )}
    </div>
  );
}
