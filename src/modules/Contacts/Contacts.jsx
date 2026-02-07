import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import PermissionGuard from "../../components/PermissionGuard.jsx";
import Tabs from "./components/Tabs.jsx";
import StatsCards from "./components/StatsCard.jsx";
import ChartsSection from "./components/ChartsSection.jsx";
import Toolbar from "./components/Toolbar.jsx";
import ContactCard from "./components/ContactCard.jsx";
import ContactModal from "./components/ContactModal.jsx";
import { getTypeColor } from "./components/utils.js";
import { FaAddressBook } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function ContactsContent() {
  const { isAuthenticated, hasPermission, user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("all");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedType, setSelectedType] = useState("all");

  // Check if user can manage contacts (create, edit, delete) using actual user permissions
  const canManageContacts =
    user?.permissions?.includes("contacts.contacts.manage") || false;
  const canReadContacts =
    user?.permissions?.includes("contacts.contacts.read") || canManageContacts;

  // Helper function to get type string from integer
  const getTypeString = (typeInt) => {
    const typeMap = {
      1: "client",
      2: "vendor",
      3: "partner",
      4: "lead",
    };
    return typeMap[typeInt] || "client";
  };

  // Helper function to get type integer from string
  const getTypeValue = (typeString) => {
    const typeMap = {
      client: 1,
      vendor: 2,
      partner: 3,
      lead: 4,
    };
    return typeMap[typeString] || 1;
  };

  // Transform API contact to UI format
  const transformContact = (apiContact) => ({
    id: apiContact.id,
    name: apiContact.fullName,
    email: apiContact.email,
    phone: apiContact.phoneNumber || "",
    company: apiContact.company,
    position: apiContact.position || "",
    type: getTypeString(apiContact.type),
    location: apiContact.location || "",
    website: apiContact.website || "",
    linkedin: apiContact.profileLink || "",
    favorite: apiContact.favorite || false,
    notes: apiContact.notes || "",
    // Keep original API fields for editing
    fullName: apiContact.fullName,
    phoneNumber: apiContact.phoneNumber || "",
    profileLink: apiContact.profileLink || "",
  });

  // Fetch contacts from API (extracted for reuse)
  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch all contacts - the GET /api/Contact endpoint returns complete data
      const response = await fetch(`${API_BASE_URL}/api/Contact`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch contacts: ${response.status} ${response.statusText}`,
        );
      }

      const contactsList = await response.json();
      const transformedContacts = contactsList.map(transformContact);

      setContacts(transformedContacts);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts: " + err.message);
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchContacts();
  }, [isAuthenticated]);

  // Check for duplicate email or phone
  const checkDuplicate = (contactObj, currentContactId = null) => {
    const duplicateEmail = contacts.find(
      (c) =>
        c.id !== currentContactId &&
        c.email.toLowerCase() === contactObj.email.toLowerCase(),
    );

    if (duplicateEmail) {
      return {
        isDuplicate: true,
        field: "email",
        message: `This email is already used by ${duplicateEmail.name}`,
      };
    }

    // Only check phone if it's provided
    if (contactObj.phoneNumber && contactObj.phoneNumber.trim() !== "") {
      const duplicatePhone = contacts.find(
        (c) =>
          c.id !== currentContactId && c.phoneNumber === contactObj.phoneNumber,
      );

      if (duplicatePhone) {
        return {
          isDuplicate: true,
          field: "phone",
          message: `This phone number is already used by ${duplicatePhone.name}`,
        };
      }
    }

    return { isDuplicate: false };
  };

  // Handle save contact (create or update)
  const handleSave = async (contactObj) => {
    // Check permission before saving
    if (!canManageContacts) {
      alert("You don't have permission to manage contacts.");
      return;
    }

    try {
      const isEditing = !!editingContact;

      // Check for duplicates
      const duplicateCheck = checkDuplicate(
        contactObj,
        isEditing ? editingContact.id : null,
      );
      if (duplicateCheck.isDuplicate) {
        alert(duplicateCheck.message);
        return;
      }

      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("You are not authenticated. Please log in again.");
        return;
      }

      // Prepare API data
      const apiData = {
        ...(isEditing && { id: editingContact.id }),
        fullName: contactObj.fullName,
        email: contactObj.email,
        phoneNumber: contactObj.phoneNumber,
        company: contactObj.company,
        position: contactObj.position || "",
        type: contactObj.type,
        location: contactObj.location || "",
        website: contactObj.website || "",
        profileLink: contactObj.profileLink || "",
        notes: contactObj.notes || "",
        favorite: contactObj.favorite || false,
      };

      const url = `${API_BASE_URL}/api/Contact`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          errorText || `Failed to ${isEditing ? "update" : "create"} contact`,
        );
      }

      // Close modal first for better UX
      setShowContactModal(false);
      setEditingContact(null);

      // Refetch all contacts to get fresh data from server
      await fetchContacts();
    } catch (err) {
      console.error("Error saving contact:", err);
      alert("Error saving contact: " + err.message);
    }
  };

  // Handle delete contact
  const handleDelete = async (id) => {
    // Check permission before deleting
    if (!canManageContacts) {
      alert("You don't have permission to delete contacts.");
      return;
    }

    if (deleting) return; // Prevent multiple deletes

    if (!window.confirm("Are you sure you want to delete this contact?"))
      return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("You are not authenticated. Please log in again.");
        setDeleting(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Contact/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      // Handle both 200 OK and 204 No Content as success
      if (!response.ok && response.status !== 204) {
        const errorText = await response
          .text()
          .catch(() => "Failed to delete contact");
        throw new Error(errorText);
      }

      // Refetch all contacts to get fresh data from server
      await fetchContacts();
    } catch (err) {
      console.error("Error deleting contact:", err);
      alert("Error deleting contact: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Handle toggle favorite
  const toggleFavorite = async (id) => {
    // Check permission before toggling favorite
    if (!canManageContacts) {
      alert("You don't have permission to manage contacts.");
      return;
    }

    const contact = contacts.find((c) => c.id === id);
    if (!contact) {
      console.error("Contact not found for id:", id);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("You are not authenticated. Please log in again.");
        return;
      }

      // Prepare the update data
      const updatedContact = {
        id: contact.id,
        fullName: contact.fullName,
        email: contact.email,
        phoneNumber: contact.phoneNumber || null,
        company: contact.company || "",
        position: contact.position || "",
        type: getTypeValue(contact.type),
        location: contact.location || "",
        website: contact.website || "",
        profileLink: contact.profileLink || "",
        notes: contact.notes || "",
        favorite: !contact.favorite,
      };

      const response = await fetch(`${API_BASE_URL}/api/Contact`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(updatedContact),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || "Failed to update favorite status");
      }

      // Refetch all contacts to get fresh data from server
      await fetchContacts();
    } catch (err) {
      console.error("Error updating favorite:", err);
      alert("Error updating favorite status: " + err.message);
    }
  };

  // Filter contacts based on search and active tab
  const filteredContacts = contacts.filter((contact) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      contact.name.toLowerCase().includes(s) ||
      contact.email.toLowerCase().includes(s) ||
      contact.company.toLowerCase().includes(s) ||
      contact.position.toLowerCase().includes(s);

    const matchesType = selectedType === "all" || contact.type === selectedType;

    return matchesSearch && matchesType;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchContacts();
            }}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaAddressBook size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Contacts Module
              </h1>
              <p className="text-gray-600">
                Manage all your business relationships
              </p>
            </div>
          </div>
        </div>

        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setSelectedType={setSelectedType}
        />

        <StatsCards contacts={contacts} />

        {activeTab === "all" && <ChartsSection contacts={contacts} />}

        <Toolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openModal={() => {
            if (!canManageContacts) {
              alert("You don't have permission to create contacts.");
              return;
            }
            setEditingContact(null);
            setShowContactModal(true);
          }}
          canManageContacts={canManageContacts}
        />

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === "favorites"
            ? filteredContacts.filter((c) => c.favorite)
            : filteredContacts
          ).map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={() => {
                if (!canManageContacts) {
                  alert("You don't have permission to edit contacts.");
                  return;
                }
                setEditingContact(contact);
                setShowContactModal(true);
              }}
              onDelete={() => handleDelete(contact.id)}
              toggleFavorite={() => toggleFavorite(contact.id)}
              getTypeColor={getTypeColor}
              canManageContacts={canManageContacts}
            />
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No contacts found
            </h3>
            <p className="text-gray-600 mb-4">
              {contacts.length === 0
                ? "Get started by adding your first contact"
                : "Try adjusting your search or filters"}
            </p>
            {contacts.length === 0 && canManageContacts && (
              <button
                onClick={() => {
                  setEditingContact(null);
                  setShowContactModal(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md"
              >
                Add Your First Contact
              </button>
            )}
          </div>
        )}

        {showContactModal && (
          <ContactModal
            contact={editingContact}
            onSave={handleSave}
            onClose={() => {
              setShowContactModal(false);
              setEditingContact(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Wrap with Permission Guard
export default function Contacts() {
  const { user } = useContext(AuthContext);

  // Check if user has any contacts permissions
  const hasContactsPermission = user?.permissions?.some((p) =>
    p.startsWith("contacts."),
  );

  if (!hasContactsPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 p-6">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
          <FaAddressBook size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the Contacts module.
          </p>
          <p className="text-sm text-gray-500">
            Required permissions: contacts.read or contacts.manage
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your roles: {user?.roles?.join(", ") || "None"}
          </p>
        </div>
      </div>
    );
  }

  return <ContactsContent />;
}
