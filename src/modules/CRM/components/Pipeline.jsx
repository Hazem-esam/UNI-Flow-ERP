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

export default function Pipeline({ pipelineData }) {
  return (
    <div className="space-y-6">
      {/* Pipeline Stages Cards */}
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

      {/* Pipeline Visualization */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Pipeline Visualization
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
    </div>
  );
}
