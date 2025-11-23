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
  Image as ImageIcon,
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
    companyName: Yup.string()
      .min(2, "Company name must be at least 2 characters")
      .required("Company name is required"),
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
      companyName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: null,
    },
    validationSchema: managerValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setTimeout(() => {
        const userData = {
          typeOfUser: "manager",
          companyName: values.companyName,
          email: values.email,
          password: values.password,
          phoneNumber: values.phoneNumber,
          image: values.image || "",
          name: "",
          companyCode: "",
        };
        signup(userData);
        alert("Signup successful!");
        navigate("/dashboard");
        setIsLoading(false);
      }, 1000);
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
      image: null,
    },
    validationSchema: userValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setTimeout(() => {
        const userData = {
          typeOfUser: "user",
          companyName: "",
          email: values.email,
          password: values.password,
          name: values.name,
          phoneNumber: values.phoneNumber,
          image: values.image || "",
          companyCode: values.companyCode,
        };
        signup(userData);
        alert("Signup successful!");
        navigate("/dashboard");
        setIsLoading(false);
      }, 1000);
    },
  });

  const handleImageChange = (e, formik) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("image", file);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative max-w-2xl mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Header */}
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

            {/* User Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                Select Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
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

                <button
                  type="button"
                  onClick={() => setTypeOfUser("user")}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                    typeOfUser === "user"
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {typeOfUser === "user" && (
                    <CheckCircle2 className="absolute top-3 right-3 w-6 h-6 text-purple-600" />
                  )}
                  <User
                    className={`w-12 h-12 mx-auto mb-3 ${
                      typeOfUser === "user" ? "text-purple-600" : "text-gray-400"
                    }`}
                  />
                  <h3 className="font-bold text-gray-900">User</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Join a company
                  </p>
                </button>
              </div>
            </div>

            {/* Manager Form */}
            {typeOfUser === "manager" && (
              <form onSubmit={managerFormik.handleSubmit} className="space-y-5">
                {/* Company Name */}
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

                {/* Phone Number */}
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

                {/* Email */}
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

                {/* Password */}
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

                {/* Confirm Password */}
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

                {/* Profile Picture */}
                <div>
                  <label
                    htmlFor="managerImage"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Profile Picture (Optional)
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="managerImage"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, managerFormik)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                {/* Submit Button */}
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

            {/* User Form */}
            {typeOfUser === "user" && (
              <form onSubmit={userFormik.handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="userName"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="userName"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        userFormik.touched.name && userFormik.errors.name
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                      {...userFormik.getFieldProps("name")}
                    />
                  </div>
                  {userFormik.touched.name && userFormik.errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {userFormik.errors.name}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="userPhone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="userPhone"
                      name="phoneNumber"
                      type="tel"
                      placeholder="1234567890"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        userFormik.touched.phoneNumber &&
                        userFormik.errors.phoneNumber
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                      {...userFormik.getFieldProps("phoneNumber")}
                    />
                  </div>
                  {userFormik.touched.phoneNumber &&
                    userFormik.errors.phoneNumber && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {userFormik.errors.phoneNumber}
                      </p>
                    )}
                </div>

                {/* Company Code */}
                <div>
                  <label
                    htmlFor="companyCode"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Company Invitation Code
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="companyCode"
                      name="companyCode"
                      type="text"
                      placeholder="Enter invitation code"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        userFormik.touched.companyCode &&
                        userFormik.errors.companyCode
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                      {...userFormik.getFieldProps("companyCode")}
                    />
                  </div>
                  {userFormik.touched.companyCode &&
                    userFormik.errors.companyCode && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {userFormik.errors.companyCode}
                      </p>
                    )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="userEmail"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="userEmail"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        userFormik.touched.email && userFormik.errors.email
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                      {...userFormik.getFieldProps("email")}
                    />
                  </div>
                  {userFormik.touched.email && userFormik.errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {userFormik.errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="userPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="userPassword"
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        userFormik.touched.password &&
                        userFormik.errors.password
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                      {...userFormik.getFieldProps("password")}
                    />
                  </div>
                  {userFormik.touched.password &&
                    userFormik.errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {userFormik.errors.password}
                      </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="userConfirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="userConfirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        userFormik.touched.confirmPassword &&
                        userFormik.errors.confirmPassword
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-purple-500"
                      }`}
                      {...userFormik.getFieldProps("confirmPassword")}
                    />
                  </div>
                  {userFormik.touched.confirmPassword &&
                    userFormik.errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {userFormik.errors.confirmPassword}
                      </p>
                    )}
                </div>

                {/* Profile Picture */}
                <div>
                  <label
                    htmlFor="userImage"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Profile Picture (Optional)
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="userImage"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, userFormik)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !userFormik.isValid}
                  className="group w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create User Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
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

                {/* Login Link */}
                <div className="mt-6">
                  <Link
                    to="/login"
                    className="w-full flex justify-center py-3 px-4 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Sign In Instead
                  </Link></div>
              </>
            )}
          </div>

          {/* Footer Text */}
          {typeOfUser && (
            <p className="mt-8 text-center text-sm text-gray-600">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          )}
        </div>
      </div>
    </>
  );
}