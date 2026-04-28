import { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import api from "../../api";
import { Logo } from "../ui/atoms/logo/Logo";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Minimum 6 characters required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/users/login", form);
      console.log("Login success:", res.data);

      // Example: store token (adjust based on backend)
    //   localStorage.setItem("token", res.data.token);

      // redirect (you can use react-router)
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setErrors({ api: err.response?.data?.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-6 text-center">
        <div className="flex justify-center items-center">
            <Logo />
        </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Lumina Earth Minerals
          </h1>
          <p className="text-sm text-gray-500 mt-1">Admin Panel Login</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <div className="flex items-center border rounded-lg px-3 mt-1 focus-within:ring-2 focus-within:ring-black">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-2 outline-none bg-transparent text-sm"
                placeholder="admin@lumina.com"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <div className="flex items-center border rounded-lg px-3 mt-1 focus-within:ring-2 focus-within:ring-black">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-2 outline-none bg-transparent text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* API Error */}
          {errors.api && (
            <p className="text-sm text-red-500 text-center">
              {errors.api}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          © {new Date().getFullYear()} Lumina Earth Minerals
        </p>
      </div>
    </div>
  );
}
