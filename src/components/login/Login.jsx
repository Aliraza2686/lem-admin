import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import api from "../../api";
import { Logo } from "../ui/atoms/logo/Logo";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useTabHidden } from "../../hooks/useTabHidden";
import NightSkyScene from "./scene/NightSkyScene";
import Dunes from "./desert/Dunes";
import "./night-scene.css";

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

// Card fades + slides up as a whole, then its fields cascade in behind it.
const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.06, delayChildren: 0.25 },
  },
};

export default function Login() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const tabHidden = useTabHidden();

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
      const data = await res.data;
      if (data.user) {
        setErrors({});
        localStorage.setItem("user", JSON.stringify(data?.user));
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setErrors({ api: err.response?.data?.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`lunara-login${tabHidden ? " tab-hidden" : ""}`}>
      <NightSkyScene reduced={reduced} />
      <Dunes reduced={reduced} />

      <motion.div
        variants={cardVariants}
        initial={reduced ? false : "hidden"}
        animate="visible"
        className="lunara-card"
      >
        <motion.div variants={fieldVariants} className="mb-6 flex items-center gap-2">
          <Logo className="h-9 w-9" />
          <span className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
            Lumina Earth Minerals
          </span>
        </motion.div>

        <motion.div variants={fieldVariants} className="mb-7">
          <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-white/50">Sign in to continue to the dashboard.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={fieldVariants}>
            <label className="text-xs font-semibold text-white/60">Email</label>
            <div className="lunara-field mt-1.5 flex items-center rounded-lg px-3">
              <Mail className="size-4 shrink-0 text-white/30" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent p-2.5 text-sm text-white outline-none placeholder:text-white/25"
                placeholder="admin@lumina.com"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-400">{errors.email}</p>}
          </motion.div>

          <motion.div variants={fieldVariants}>
            <label className="text-xs font-semibold text-white/60">Password</label>
            <div className="lunara-field mt-1.5 flex items-center rounded-lg px-3">
              <Lock className="size-4 shrink-0 text-white/30" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-transparent p-2.5 text-sm text-white outline-none placeholder:text-white/25"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {errors.password && <p className="mt-1.5 text-xs font-medium text-rose-400">{errors.password}</p>}
          </motion.div>

          {errors.api && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-center text-xs font-medium text-rose-300"
            >
              {errors.api}
            </motion.p>
          )}

          <motion.button
            variants={fieldVariants}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            type="submit"
            disabled={loading}
            className="lunara-btn flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            {loading ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>

        <motion.p variants={fieldVariants} className="mt-6 text-center text-xs text-white/25">
          © {new Date().getFullYear()} Lumina Earth Minerals
        </motion.p>
      </motion.div>
    </div>
  );
}
