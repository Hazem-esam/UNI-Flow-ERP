import { fetchWithAuth } from "./Api";

export const dashboardService = {
  // Fetch all dashboard data
  async getDashboardData() {
    try {
      const [
        employees,
        leads,
        expenses,
        salesInvoices,
        products,
        departments,
        customers,
      ] = await Promise.all([
        this.getEmployees(),
        this.getLeads(),
        this.getExpenses(),
        this.getSalesInvoices(),
        this.getProducts(),
        this.getDepartments(),
        this.getCustomers(),
      ]);
      let stock = [];
      for (const product of products) {
        const productStock = await this.getStock(product.id);
        stock.push(productStock);
      }
      const invoice = (
        await Promise.all(
          salesInvoices.map((c) => this.getSalesInvoicesCustomer(c.id)),
        )
      ).flat();
      return {
        employees,
        leads,
        expenses,
        salesInvoices,
        products,
        stock,
        departments,
        customers,
        invoice,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  },

  // Get employees
  async getEmployees() {
    return fetchWithAuth("/api/Employee");
  },
  async getCustomers() {
    return fetchWithAuth("/api/sales/Customers");
  },
  async getStock(id) {
    return fetchWithAuth(`/api/InventoryReports/product/${id}/stock`);
  },
  // Get leads
  async getLeads() {
    return fetchWithAuth("/api/Lead");
  },

  // Get expenses
  async getExpenses() {
    return fetchWithAuth("/api/expenses");
  },

  // Get sales invoices
  async getSalesInvoices() {
    return fetchWithAuth("/api/sales/invoices");
  },
  async getSalesInvoicesCustomer(id) {
    try {
      return await fetchWithAuth(`/api/sales/invoices/${id}`);
    } catch {
      return [];
    }
  },
  // Get products/inventory
  async getProducts() {
    return fetchWithAuth("/api/Products");
  },

  // Get departments
  async getDepartments() {
    return fetchWithAuth("/api/Department");
  },

  // Get expense stats
  async getExpenseStats(fromDate, toDate, grouping = "monthly") {
    const params = new URLSearchParams({
      ...(fromDate && { FromDate: fromDate }),
      ...(toDate && { ToDate: toDate }),
      Grouping: grouping,
    });
    return fetchWithAuth(`/api/expenses/stats/summary?${params}`);
  },

  // Get company info
  async getCompanyInfo() {
    return fetchWithAuth("/api/companies/me");
  },

  // Get company modules
  async getCompanyModules() {
    return fetchWithAuth("/api/company-modules");
  },
};
