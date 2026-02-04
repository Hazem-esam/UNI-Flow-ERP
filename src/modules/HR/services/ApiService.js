const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return { success: true };
      }

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "object" ? data.detail || data.title || "Request failed" : data
        );
      }

      return { success: true, data };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { success: false, error: error.message };
    }
  }

  // Generic CRUD methods
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  // ============================================
  // EMPLOYEE ENDPOINTS
  // ============================================
  async getAllEmployees() {
    return this.get("/api/Employee");
  }

  async getEmployeeById(id) {
    return this.get(`/api/Employee/${id}`);
  }

  async getEmployeesByDepartment(departmentId) {
    return this.get(`/api/Employee/department/${departmentId}`);
  }

  async getEmployeesByStatus(status) {
    return this.get(`/api/Employee/status/${status}`);
  }

  async createEmployee(employeeData) {
    return this.post("/api/Employee", employeeData);
  }

  async updateEmployee(id, employeeData) {
    return this.put(`/api/Employee/${id}`, employeeData);
  }

  async updateEmployeeStatus(id, statusData) {
    return this.put(`/api/Employee/${id}/status`, statusData);
  }

  async deleteEmployee(id) {
    return this.delete(`/api/Employee/${id}`);
  }

  // ============================================
  // DEPARTMENT ENDPOINTS
  // ============================================
  async getAllDepartments() {
    return this.get("/api/Department");
  }

  async getDepartmentById(id) {
    return this.get(`/api/Department/${id}`);
  }

  async createDepartment(departmentData) {
    return this.post("/api/Department", departmentData);
  }

  async updateDepartment(id, departmentData) {
    return this.put(`/api/Department/${id}`, departmentData);
  }

  async deleteDepartment(id) {
    return this.delete(`/api/Department/${id}`);
  }

  // ============================================
  // JOB POSITION ENDPOINTS
  // ============================================
  async getAllPositions() {
    return this.get("/api/JobPosition");
  }

  async getPositionById(id) {
    return this.get(`/api/JobPosition/${id}`);
  }

  async createPosition(positionData) {
    return this.post("/api/JobPosition", positionData);
  }

  async updatePosition(id, positionData) {
    return this.put(`/api/JobPosition/${id}`, positionData);
  }

  async deletePosition(id) {
    return this.delete(`/api/JobPosition/${id}`);
  }

  // ============================================
  // ATTENDANCE ENDPOINTS
  // ============================================
  async checkIn(checkInData) {
    return this.post("/api/Attendance/checkin", checkInData);
  }

  async checkOut(checkOutData) {
    return this.post("/api/Attendance/checkout", checkOutData);
  }

  async createManualAttendance(attendanceData) {
    return this.post("/api/Attendance/manual", attendanceData);
  }

  async updateAttendance(id, attendanceData) {
    return this.put(`/api/Attendance/${id}`, attendanceData);
  }

  async getAttendanceSummary(employeeId, month, year) {
    return this.get(`/api/Attendance/summary/${employeeId}/${month}/${year}`);
  }

  // ============================================
  // LEAVE REQUEST ENDPOINTS
  // ============================================
  async createLeaveRequest(leaveData) {
    return this.post("/api/LeaveRequest", leaveData);
  }

  async getLeaveRequestById(id) {
    return this.get(`/api/LeaveRequest/${id}`);
  }

  async getEmployeeLeaves(employeeId) {
    return this.get(`/api/LeaveRequest/employee/${employeeId}`);
  }

  async getPendingLeaves() {
    return this.get("/api/LeaveRequest/pending");
  }

  async approveLeave(id, notes = "") {
    return this.post(`/api/LeaveRequest/${id}/approve`, { notes });
  }

  async rejectLeave(id, reason) {
    return this.post(`/api/LeaveRequest/${id}/reject`, { reason });
  }

  async cancelLeave(id, reason) {
    return this.post(`/api/LeaveRequest/${id}/cancel`, { reason });
  }

  async getLeaveBalance(employeeId, year) {
    return this.get(`/api/LeaveRequest/balance/${employeeId}/${year}`);
  }

  async deleteLeaveRequest(id) {
    return this.delete(`/api/LeaveRequest/${id}`);
  }

  // ============================================
  // PAYROLL ENDPOINTS
  // ============================================
  async generatePayroll(payrollData) {
    return this.post("/api/Payroll/generate", payrollData);
  }

  async getPayrollById(id) {
    return this.get(`/api/Payroll/${id}`);
  }

  async getEmployeePayrolls(employeeId) {
    return this.get(`/api/Payroll/employee/${employeeId}`);
  }

  async getPeriodPayrolls(month, year) {
    return this.get(`/api/Payroll/period/${month}/${year}`);
  }

  async updatePayroll(id, payrollData) {
    return this.put(`/api/Payroll/${id}`, payrollData);
  }

  async processPayroll(id) {
    return this.post(`/api/Payroll/${id}/process`);
  }

  async markPayrollAsPaid(id, paidData) {
    return this.post(`/api/Payroll/${id}/mark-paid`, paidData);
  }

  async revertPayroll(id) {
    return this.post(`/api/Payroll/${id}/revert`);
  }

  async deletePayroll(id) {
    return this.delete(`/api/Payroll/${id}`);
  }

  async getPayrollSummary(month, year) {
    return this.get(`/api/Payroll/summary/${month}/${year}`);
  }

  async recalculatePayroll(id) {
    return this.post(`/api/Payroll/${id}/recalculate`);
  }

  // ============================================
  // COMPANY USER ENDPOINTS
  // ============================================
  async getCompanyUsers() {
    return this.get("/api/company-users");
  }

  async createCompanyUser(userData) {
    return this.post("/api/company-users", userData);
  }

  async updateUserRoles(userId, roles) {
    return this.put(`/api/company-users/${userId}/roles`, { roles });
  }

  async updateUserStatus(userId, isActive) {
    return this.put(`/api/company-users/${userId}/status`, { isActive });
  }

  // ============================================
  // COMPANY ENDPOINTS
  // ============================================
  async getMyCompany() {
    return this.get("/api/companies/me");
  }

  async updateMyCompany(companyData) {
    return this.put("/api/companies/me", companyData);
  }

  async getCompanyModules() {
    return this.get("/api/company-modules");
  }

  async updateCompanyModule(moduleId, isEnabled) {
    return this.put(`/api/company-modules/${moduleId}`, { isEnabled });
  }
}

export default new ApiService();