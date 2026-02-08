import { Search, Plus, Users, Edit, Trash2 } from "lucide-react";

export default function CustomersTab({
  customers,
  searchQuery,
  setSearchQuery,
  handleAddCustomer,
  handleEditCustomer,
  handleDeleteCustomer,
  canManage,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-md flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
        {canManage && (
          <button
            onClick={handleAddCustomer}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Customer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Customers</h3>
            <p className="text-gray-600 mb-4">
              {canManage
                ? "Start by adding your first customer"
                : "No customers to display"}
            </p>
            {canManage && (
              <button
                onClick={handleAddCustomer}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Customer
              </button>
            )}
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition"
            >
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCustomer(c)}
                      className="p-2 hover:bg-green-50 text-green-600 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(c.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold mb-2">{c.name}</h3>
              {c.email && <p className="text-sm text-gray-600">📧 {c.email}</p>}
              {c.phone && <p className="text-sm text-gray-600">📞 {c.phone}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
