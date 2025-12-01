import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col h-screen w-full">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1  ">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="p-6 overflow-y-auto w-full">{children}</main>
      </div>
    </div>
  );
}
