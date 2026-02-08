import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import ApiService from "../services/ApiService.js";
import { ArrowLeft, Save, X } from "lucide-react";

const CreateEmployee = ({ onBack }) => {
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;

    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };

  const isFutureDate = (date) => {
    if (!date) return false;
    return new Date(date) > new Date();
  };

  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [employees, setEmployees] = useState([]); // For reports to
  const [formData, setFormData] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: 1,
    nationality: "",
    nationalId: "",
    maritalStatus: 1,
    bankAccountNumber: "",
    bankName: "",
    bankBranch: "",
    hireDate: "",
    probationPeriodMonths: 3,
    departmentId: "",
    positionId: "",
    reportsToId: "",
    currentAddress: {
      city: "",
      country: "",
      postalCode: "",
    },
    salary: 0,
    currency: "USD",
  });
  const buildPayload = (formData) => {
    const payload = {};

    // -----------------------------
    // REQUIRED FIELDS (always send)
    // -----------------------------
    payload.employeeCode = formData.employeeCode.trim();
    payload.firstName = formData.firstName.trim();
    payload.lastName = formData.lastName.trim();
    payload.email = formData.email.trim();
    payload.gender = Number(formData.gender);
    payload.nationality = formData.nationality.trim();
    payload.nationalId = formData.nationalId.trim();
    payload.departmentId = formData.departmentId;
    payload.positionId = formData.positionId;
    payload.salary = Number(formData.salary);

    payload.dateOfBirth = new Date(formData.dateOfBirth).toISOString();
    payload.hireDate = new Date(formData.hireDate).toISOString();

    // -----------------------------
    // REQUIRED ADDRESS (ALL FIELDS)
    // -----------------------------
    payload.currentAddress = {
      city: formData.currentAddress.city.trim(),
      country: formData.currentAddress.country.trim(),
      postalCode: formData.currentAddress.postalCode.trim(),
    };

    // -----------------------------
    // OPTIONAL FIELDS (ONLY IF FILLED)
    // -----------------------------
    if (formData.phoneNumber?.trim()) {
      payload.phoneNumber = formData.phoneNumber.trim();
    }

    if (formData.maritalStatus) {
      payload.maritalStatus = Number(formData.maritalStatus);
    }

    if (formData.bankAccountNumber?.trim()) {
      payload.bankAccountNumber = formData.bankAccountNumber.trim();
    }

    if (formData.bankName?.trim()) {
      payload.bankName = formData.bankName.trim();
    }

    if (formData.bankBranch?.trim()) {
      payload.bankBranch = formData.bankBranch.trim();
    }

    if (
      formData.probationPeriodMonths !== "" &&
      formData.probationPeriodMonths !== null
    ) {
      payload.probationPeriodMonths = Number(formData.probationPeriodMonths);
    }

    if (formData.reportsToId) {
      payload.reportsToId = formData.reportsToId;
    }

    if (formData.currency?.trim()) {
      payload.currency = formData.currency.trim();
    }

    return payload;
  };

  useEffect(() => {
    loadDepartments();
    loadPositions();
    loadEmployees();
  }, []);

  const loadDepartments = async () => {
    const response = await ApiService.getAllDepartments();
    if (response.success) {
      setDepartments(response.data || []);
    }
  };

  const loadPositions = async () => {
    const response = await ApiService.getAllPositions();
    if (response.success) {
      setPositions(response.data || []);
    }
  };

  const loadEmployees = async () => {
    const response = await ApiService.getAllEmployees();
    if (response.success) {
      setEmployees(response.data || []);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      currentAddress: {
        ...prev.currentAddress,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 AGE VALIDATION
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);

      if (age !== null && age < 18) {
        alert("Employee must be at least 18 years old.");
        return;
      }
    }

    // 🔹 HIRE DATE VALIDATION
    if (isFutureDate(formData.hireDate)) {
      alert("Hire date cannot be in the future.");
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload(formData);
      console.log("Payload being sent:", payload);

      const response = await ApiService.createEmployee(payload);
      console.log("API response:", response);

      if (response.success) {
        alert("Employee created successfully!");
        onBack();
      } else {
        console.error("API Error Response:", response);
        alert(
          `Failed to create employee: ${response.error || JSON.stringify(response)}`,
        );
      }
    } catch (error) {
      console.error("Caught exception while creating employee:", error);
      alert("An error occurred while creating the employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Employee
        </h1>
        <div className="w-24" /> {/* Spacer for alignment */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Code *
              </label>
              <input
                type="text"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>Male</option>
                <option value={2}>Female</option>
                <option value={3}>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>Single</option>
                <option value={2}>Married</option>
                <option value={3}>Divorced</option>
                <option value={4}>Widowed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Employment Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                name="positionId"
                value={formData.positionId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Position</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reports To
              </label>
              <select
                name="reportsToId"
                value={formData.reportsToId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Manager</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hire Date *
              </label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probation Period (Months)
              </label>
              <input
                type="number"
                name="probationPeriodMonths"
                value={formData.probationPeriodMonths}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Banking Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Banking Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Branch
              </label>
              <input
                type="text"
                name="bankBranch"
                value={formData.bankBranch}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.currentAddress.city}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.currentAddress.country}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.currentAddress.postalCode}
                onChange={handleAddressChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEmployee;
