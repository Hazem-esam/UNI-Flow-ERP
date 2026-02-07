import {
  User,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2,
  MapPin,
  Star,
  Linkedin,
  Globe,
} from "lucide-react";

export default function ContactCard({
  contact,
  onEdit,
  onDelete,
  toggleFavorite,
  getTypeColor,
  canManageContacts,
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{contact.name}</h3>
            {contact.position && (
              <p className="text-sm text-indigo-600 font-medium">
                {contact.position}
              </p>
            )}
          </div>
        </div>
        {canManageContacts ? (
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              contact.favorite
                ? "text-yellow-500 hover:bg-yellow-50"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <Star
              className={`w-5 h-5 ${contact.favorite ? "fill-current" : ""}`}
            />
          </button>
        ) : (
          <Star
            className={`w-5 h-5 ${contact.favorite ? "text-yellow-500  fill-current" : ""}`}
          />
        )}
      </div>

      <div className="mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
            contact.type,
          )}`}
        >
          {contact.type}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        {contact.company && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{contact.company}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="break-all">{contact.phone}</span>
          </div>
        )}
        {contact.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{contact.location}</span>
          </div>
        )}
        {contact.website && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 flex-shrink-0" />
            <a
              href={
                contact.website.startsWith("http")
                  ? contact.website
                  : `https://${contact.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline truncate"
            >
              {contact.website}
            </a>
          </div>
        )}
        {contact.linkedin && (
          <div className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 flex-shrink-0" />
            <a
              href={
                contact.linkedin.startsWith("http")
                  ? contact.linkedin
                  : `https://${contact.linkedin}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline truncate"
            >
              Profile
            </a>
          </div>
        )}
      </div>

      {contact.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 italic">{contact.notes}</p>
        </div>
      )}

      {canManageContacts && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
