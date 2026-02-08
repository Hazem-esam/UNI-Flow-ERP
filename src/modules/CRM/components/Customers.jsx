import {
  Building2,
  Mail,
  Phone,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

export default function Customers({
  customers,
  onEdit,
  onDelete,
  onAdd,
  canManage,
  canAccess,
}) {
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        {(canAccess || canManage) && (
          <button
            onClick={() => onAdd && onAdd()}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        )}
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  customer.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {customer.status}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {customer.name}
            </h3>
            <p className="text-sm text-pink-600 font-medium mb-4">
              {customer.contact}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">
                  ${customer.lifetimeValue.toLocaleString()} LTV
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Last: {customer.lastPurchase}</span>
              </div>
            </div>

            {canAccess && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    onEdit &&
                    onEdit({
                      id: customer.id,
                      code: customer.code,
                      name: customer.name,
                      email: customer.email,
                      phone: customer.phone,
                      address: customer.address,
                      taxNumber: customer.taxNumber,
                      creditLimit: customer.lifetimeValue, // ✅ Map lifetimeValue to creditLimit
                      isActive: customer.status === "active", // ✅ Map status to isActive
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-md font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>

                {canManage && (
                  <button
                    onClick={() => onDelete && onDelete(customer.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
