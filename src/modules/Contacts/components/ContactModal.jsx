import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function ContactModal({ contact, onSave, onClose }) {
  // Helper function to convert type string to integer
  const getTypeValue = (typeString) => {
    const typeMap = {
      client: 1,
      vendor: 2,
      partner: 3,
      lead: 4,
    };
    return typeMap[typeString] || 1;
  };

  // Helper function to convert type integer to string
  const getTypeString = (typeInt) => {
    const typeMap = {
      1: "client",
      2: "vendor",
      3: "partner",
      4: "lead",
    };
    return typeMap[typeInt] || "client";
  };

  const [formData, setFormData] = useState({
    fullName: contact?.fullName || "",
    email: contact?.email || "",
    phoneNumber: contact?.phoneNumber || "",
    company: contact?.company || "",
    position: contact?.position || "",
    type: contact?.type ? getTypeString(contact.type) : "client",
    location: contact?.location || "",
    website: contact?.website || "",
    profileLink: contact?.profileLink || "",
    favorite: contact?.favorite || false,
    notes: contact?.notes || "",
  });

  useEffect(() => {
    setFormData({
      fullName: contact?.fullName || "",
      email: contact?.email || "",
      phoneNumber: contact?.phoneNumber || "",
      company: contact?.company || "",
      position: contact?.position || "",
      type: contact?.type ? getTypeString(contact.type) : "client",
      location: contact?.location || "",
      website: contact?.website || "",
      profileLink: contact?.profileLink || "",
      favorite: contact?.favorite || false,
      notes: contact?.notes || "",
    });
  }, [contact]);

  const handleSubmit = () => {
    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.company
    ) {
      alert("Please fill required fields: name, email, phone, company.");
      return;
    }

    // Prepare data for API
    const apiData = {
      ...(contact?.id && { id: contact.id }), 
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      company: formData.company,
      position: formData.position || "",
      type: getTypeValue(formData.type),
      location: formData.location || "",
      website: formData.website || "",
      profileLink: formData.profileLink || "",
      notes: formData.notes || "",
      favorite: formData.favorite,
    };

    console.log("Submitting contact data:", apiData);
    onSave(apiData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {contact ? "Edit Contact" : "Add Contact"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Acme Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Position
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Sales Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="client">Client</option>
              <option value="vendor">Vendor</option>
              <option value="partner">Partner</option>
              <option value="lead">Lead</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="City, State"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Website
            </label>
            <input
              type="text"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              LinkedIn / Social Profile
            </label>
            <input
              type="text"
              placeholder="https://linkedin.com/in/username"
              value={formData.profileLink}
              onChange={(e) =>
                setFormData({ ...formData, profileLink: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add any additional notes about this contact..."
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.favorite}
                onChange={(e) =>
                  setFormData({ ...formData, favorite: e.target.checked })
                }
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Mark as Favorite
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            {contact ? "Update Contact" : "Add Contact"}
          </button>
        </div>
      </div>
    </div>
  );
}
