import { MessageSquare } from "lucide-react";

export default function Header() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900">CRM Module</h1>
          <p className="text-gray-600">
            Manage leads, customers, and sales pipeline
          </p>
        </div>
      </div>
    </div>
  );
}
