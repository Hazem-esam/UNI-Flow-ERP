import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarDefault from "../../components/NavbarDefault";
export default function Signup() {
  const [typeOfUser, setTypeOfUser] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // Save data to localStorage for now
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
    localStorage.setItem("Image", image);
    localStorage.setItem("Phone Number", phoneNumber);
    localStorage.setItem("Company Code", companyCode);
    localStorage.setItem("User Name", name);
    localStorage.setItem("companyName", companyName);
    localStorage.setItem("Type Of User", typeOfUser);

    alert("Signup successful!");
    navigate("/dashboard"); //i will update it to navigate the user to his modul(role)
  };

  return (
    <>
      <NavbarDefault />
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4 text-center">Signup</h1>
        <div className="flex flex-row justify-center space-x-5 text-2xl font-bold mb-4">
          <label>
            <input
              className="mx-3"
              type="radio"
              name="typeOfUser"
              value="manager"
              checked={typeOfUser === "manager"}
              onChange={() => setTypeOfUser("manager")}
            />
            Manager
          </label>

          <label>
            <input
              className="mx-3"
              type="radio"
              name="typeOfUser"
              value="user"
              checked={typeOfUser === "user"}
              onChange={() => setTypeOfUser("user")}
            />
            User
          </label>
        </div>
        {typeOfUser === "user" ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="User Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />{" "}
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border p-2 rounded"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Company Code Invitation"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              Signup
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full border p-2 rounded"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              Signup
            </button>
          </form>
        )}
      </div>
    </>
  );
}
