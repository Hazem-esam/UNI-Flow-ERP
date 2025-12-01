import { useParams } from "react-router-dom";

import CRM from "../modules/CRM/CRM";
import HRModule from "../modules/HR/HR";
import InventoryModule from "../modules/Inventory/Inventory";
import SalesModule from "../modules/Sales/Sales";
import DashboardModule from "../modules/Dashboard/Dashboard";
import Expenses from "../modules/Expenses/Expenses";
import Contacts from "../modules/Contacts/Contacts";
const moduleRegistry = {
  hr: HRModule,
  inventory: InventoryModule,
  sales: SalesModule,
  crm: CRM,
  dashboard: DashboardModule,
  expenses: Expenses,
  contacts: Contacts,
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
