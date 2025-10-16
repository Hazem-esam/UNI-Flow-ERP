import { useParams } from "react-router-dom";

export default function ModulePage() {
  const { moduleName } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {moduleName.toUpperCase()} Module
      </h1>
      <p className="text-gray-600">
        Welcome to the <strong>{moduleName}</strong> module. Here you can manage
        all {moduleName} related operations.
      </p>
    </div>
  );
}
