import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import {
  UserPlus,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  Key,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function Signup() {
  const [typeOfUser, setTypeOfUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);

  // Validation schema for Manager
  const managerValidationSchema = Yup.object({
    fullName: Yup.string()
      .min(2, "Full name must be at least 2 characters")
      .required("Full name is required"),
    companyName: Yup.string()
      .min(2, "Company name must be at least 2 characters")
      .required("Company name is required"),
    taxNumber: Yup.string()
      .min(5, "Tax number must be at least 5 characters")
      .required("Tax number is required"),
    address: Yup.string()
      .min(5, "Address must be at least 5 characters")
      .required("Address is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits")
      .required("Phone number is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  // Validation schema for User
  const userValidationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .required("Name is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits")
      .required("Phone number is required"),
    companyCode: Yup.string()
      .min(4, "Company code must be at least 4 characters")
      .required("Company code is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
  });

  // Formik for Manager
  const managerFormik = useFormik({
    initialValues: {
      fullName: "",
      companyName: "",
      taxNumber: "",
      address: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: managerValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);

      const result = await signup(
        values.fullName,
        values.email,
        values.password,
        {
          name: values.companyName,
          taxNumber: values.taxNumber,
          address: values.address,
        },
      );

      setIsLoading(false);

      if (result.success) {
        navigate("/dashboard");
      } else {
        alert(`Registration failed: ${result.error}`);
      }
    },
  });

  // Formik for User
  const userFormik = useFormik({
    initialValues: {
      name: "",
      phoneNumber: "",
      companyCode: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: userValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);

      alert(
        "User registration endpoint not yet configured. Please contact your administrator.",
      );

      setIsLoading(false);
    },
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-600">
                Join UNI Flow ERP and streamline your business
              </p>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={() => setTypeOfUser("manager")}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                    typeOfUser === "manager"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {typeOfUser === "manager" && (
                    <CheckCircle2 className="absolute top-3 right-3 w-6 h-6 text-blue-600" />
                  )}
                  <Building2
                    className={`w-12 h-12 mx-auto mb-3 ${
                      typeOfUser === "manager"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  <h3 className="font-bold text-gray-900">Manager</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Register your company
                  </p>
                </button>
              </div>
            </div>

            {typeOfUser === "manager" && (
              <form onSubmit={managerFormik.handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        managerFormik.touched.fullName &&
                        managerFormik.errors.fullName
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      {...managerFormik.getFieldProps("fullName")}
                    />
                  </div>
                  {managerFormik.touched.fullName &&
                    managerFormik.errors.fullName && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {managerFormik.errors.fullName}
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      placeholder="Enter company name"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        managerFormik.touched.companyName &&
                        managerFormik.errors.companyName
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      {...managerFormik.getFieldProps("companyName")}
                    />
                  </div>
                  {managerFormik.touched.companyName &&
                    managerFormik.errors.companyName && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {managerFormik.errors.companyName}
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="taxNumber"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Tax Number
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="taxNumber"
                      name="taxNumber"
                      type="text"
                      placeholder="Enter tax number"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        managerFormik.touched.taxNumber &&
                        managerFormik.errors.taxNumber
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      {...managerFormik.getFieldProps("taxNumber")}
                    />
                  </div>
                  {managerFormik.touched.taxNumber &&
                    managerFormik.errors.taxNumber && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {managerFormik.errors.taxNumber}
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Company Address
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Enter company address"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        managerFormik.touched.address &&
                        managerFormik.errors.address
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      {...managerFormik.getFieldProps("address")}
                    />
                  </div>
                  {managerFormik.touched.address &&
                    managerFormik.errors.address && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {managerFormik.errors.address}
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="managerPhone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="managerPhone"
                      name="phoneNumber"
                      type="tel"
                      placeholder="1234567890"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        managerFormik.touched.phoneNumber &&
                        managerFormik.errors.phoneNumber
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      {...managerFormik.getFieldProps("phoneNumber")}
                    />
                  </div>
                  {managerFormik.touched.phoneNumber &&
                    managerFormik.errors.phoneNumber && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {managerFormik.errors.phoneNumber}
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="managerEmail"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="managerEmail"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        managerFormik.touched.email &&
                        managerFormik.errors.email
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      {...managerFormik.getFieldProps("email")}
                    />
                  </div>
                  {managerFormik.touched.email &&
                    managerFormik.errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {managerFormik.errors.email}
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="managerPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="managerPassword"
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        managerFormik.touched.password &&
                        managerFormik.errors.password
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      {...managerFormik.getFieldProps("password")}
                    />
                  </div>
                  {managerFormik.touched.password &&
                    managerFormik.errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {managerFormik.errors.password}
                      </p>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="managerConfirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="managerConfirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        managerFormik.touched.confirmPassword &&
                        managerFormik.errors.confirmPassword
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      {...managerFormik.getFieldProps("confirmPassword")}
                    />
                  </div>
                  {managerFormik.touched.confirmPassword &&
                    managerFormik.errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {managerFormik.errors.confirmPassword}
                      </p>
                    )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !managerFormik.isValid}
                  className="group w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Manager Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {typeOfUser && (
              <>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Already have an account?
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to="/login"
                    className="w-full flex justify-center py-3 px-4 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Sign In Instead
                  </Link>
                </div>
              </>
            )}
          </div>

          {typeOfUser && (
            <p className="mt-8 text-center text-sm text-gray-600">
              By signing up, you agree to our Terms of Service and Privacy
              Policy
            </p>
          )}
        </div>
      </div>
    </>
  );
}
