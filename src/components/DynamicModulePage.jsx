import { useParams } from "react-router-dom";

import CRM from "../modules/CRM";
import HRModule from "../modules/HR";
import InventoryModule from "../modules/Inventory";
import SalesModule from "../modules/Sales";
import DashboardModule from "../modules/Dashboard";
import Expenses from "../modules/Expenses";

const moduleRegistry = {
  hr: HRModule,
  inventory: InventoryModule,
  sales: SalesModule,
  crm: CRM,
  dashboard: DashboardModule,
  expenses: Expenses,
};

export default function DynamicModulePage() {
  const { moduleName } = useParams();

  const ModuleComponent = moduleRegistry[moduleName.toLowerCase()];

  if (!ModuleComponent) {
    return (
      <h1 className="text-xl font-semibold text-red-500">
        Module "{moduleName}" not found
      </h1>
    );
  }

  return <ModuleComponent />;
}
