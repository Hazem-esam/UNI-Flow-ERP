export  default function Tabs({ activeTab, setActiveTab, setSelectedStage }) {
  return (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => {
          setActiveTab("all");
          setSelectedStage("all");
        }}
      >
        All
      </button>
      <button
        onClick={() => {
          setActiveTab("qualified");
          setSelectedStage("qualified");
        }}
      >
        Qualified
      </button>
      <button
        onClick={() => {
          setActiveTab("converted");
          setSelectedStage("converted");
        }}
      >
        Converted
      </button>
    </div>
  );
}
