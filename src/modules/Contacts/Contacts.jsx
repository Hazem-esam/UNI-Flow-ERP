import { useState, useEffect } from "react";
import Tabs from "./components/Tabs.jsx";
import StatsCards from "./components/StatsCard.jsx";
import ChartsSection from "./components/ChartsSection.jsx";
import Toolbar from "./components/Toolbar.jsx";
import ContactCard from "./components/ContactCard.jsx";
import ContactModal from "./components/ContactModal.jsx";
import {
  loadContacts,
  saveContacts,
  getTypeColor,
  ensureInitialContacts,
} from "./components/utils.js";

export default function Contacts() {
  const [activeTab, setActiveTab] = useState("all");
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    const initial = loadContacts();
    if (!initial || initial.length === 0) setContacts(ensureInitialContacts());
    else setContacts(initial);
  }, []);

  const saveAndSet = (newList) => {
    saveContacts(newList);
    setContacts(newList);
  };

  const handleSave = (contactObj) => {
    if (editingContact) {
      const updated = contacts.map((c) =>
        c.id === editingContact.id
          ? { ...contactObj, id: editingContact.id }
          : c
      );
      saveAndSet(updated);
    } else {
      const newContact = {
        ...contactObj,
        id: Math.max(...contacts.map((c) => c.id), 0) + 1,
      };
      saveAndSet([...contacts, newContact]);
    }
    setShowContactModal(false);
    setEditingContact(null);
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    saveAndSet(contacts.filter((c) => c.id !== id));
  };

  const toggleFavorite = (id) => {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, favorite: !c.favorite } : c
    );
    saveAndSet(updated);
  };

  const filteredContacts = contacts.filter((contact) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch =
      contact.name.toLowerCase().includes(s) ||
      contact.email.toLowerCase().includes(s) ||
      contact.company.toLowerCase().includes(s);

    const matchesType = selectedType === "all" || contact.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              {/* Optional icon here */}
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
            setEditingContact(null);
            setShowContactModal(true);
          }}
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
                setEditingContact(contact);
                setShowContactModal(true);
              }}
              onDelete={() => handleDelete(contact.id)}
              toggleFavorite={() => toggleFavorite(contact.id)}
              getTypeColor={getTypeColor}
            />
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No contacts found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
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
