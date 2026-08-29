import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Package, Newspaper, Users } from "lucide-react";
import api from "../../api";
import { Logo } from "../ui/atoms/logo/Logo";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useGlowPulse } from "../../hooks/useGlowPulse";

const FEATURES = [
  { icon: Package, label: "Products" },
  { icon: Newspaper, label: "Articles" },
  { icon: Users, label: "Visitors" },
];

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};
const formVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export default function Login() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const glowRef = useGlowPulse(true);

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
    <div className="dash-shell flex min-h-screen rounded-none">
      {/* BRAND PANEL */}
      <div className="relative hidden w-[46%] flex-col overflow-hidden p-12 lg:flex">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo />
        </motion.div>

        <div className="flex flex-1 flex-col justify-center gap-8">
          <div className="relative flex justify-start">
            <CrystalGraphic reduced={reduced} />
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
          <h1 className="max-w-sm text-3xl font-semibold text-white">
            Run the Lumina Earth Minerals catalog from one place.
          </h1>
          <p className="mt-2 max-w-sm text-sm text-white/50">
            Products, articles, and visitor insight — all in this admin panel.
          </p>

          <div className="mt-6 flex items-center gap-5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-white/40">
                <Icon className="size-3.5 text-glow" />
                {label}
              </div>
            ))}
          </div>
          </motion.div>
        </div>
      </div>

      {/* FORM PANEL */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          variants={formVariants}
          initial={reduced ? false : "hidden"}
          animate="visible"
          className="dash-panel w-full max-w-sm rounded-2xl p-8"
        >
          <motion.div variants={fieldVariants} className="mb-6 text-center lg:hidden">
            <div className="mb-3 flex justify-center">
              <Logo />
            </div>
          </motion.div>

          <motion.div variants={fieldVariants} className="mb-7">
            <h2 className="text-xl font-semibold text-white">Admin login</h2>
            <p className="mt-1 text-sm text-white/40">Sign in to continue to the dashboard.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={fieldVariants}>
              <label className="text-xs font-semibold text-white/60">Email</label>
              <div className="transition-glow mt-1.5 flex items-center rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-glow focus-within:shadow-glow-sm">
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
              <div className="transition-glow mt-1.5 flex items-center rounded-lg border border-white/10 bg-white/5 px-3 focus-within:border-glow focus-within:shadow-glow-sm">
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
              ref={glowRef}
              variants={fieldVariants}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              type="submit"
              disabled={loading}
              style={{ boxShadow: "0 0 0 1px rgba(79,209,255,0.3), 0 0 calc(4px + 14px * var(--glow-opacity, 0)) 0 rgba(79,209,255,0.35)" }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-glow py-2.5 text-sm font-semibold text-primary-deep transition-colors duration-150 hover:bg-glow-soft disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}

function CrystalGraphic({ reduced }) {
  const floatAnim = reduced
    ? {}
    : { y: [0, -14, 0], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } };

  return (
    <div className="relative flex size-64 items-center justify-center">
      <div className="absolute size-56 rounded-full bg-glow/10 blur-3xl" />
      <div className="absolute -top-6 -right-6 size-24 rounded-full bg-accent/15 blur-2xl" />

      <motion.svg animate={floatAnim} width="200" height="200" viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id="crystalFace1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4fd1ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#132844" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="crystalFace2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8fe3ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0d1f35" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <g style={{ filter: "drop-shadow(0 0 24px rgba(79,209,255,0.45))" }}>
          <polygon points="100,15 150,70 130,150 70,150 50,70" fill="url(#crystalFace1)" stroke="#4fd1ff" strokeOpacity="0.5" strokeWidth="1" />
          <polygon points="100,15 150,70 100,95" fill="url(#crystalFace2)" stroke="#8fe3ff" strokeOpacity="0.6" strokeWidth="1" />
          <polygon points="100,15 50,70 100,95" fill="url(#crystalFace1)" stroke="#8fe3ff" strokeOpacity="0.4" strokeWidth="1" />
          <polygon points="50,70 100,95 70,150" fill="url(#crystalFace2)" strokeOpacity="0.3" strokeWidth="1" stroke="#4fd1ff" />
          <polygon points="150,70 130,150 100,95" fill="url(#crystalFace1)" strokeOpacity="0.3" strokeWidth="1" stroke="#4fd1ff" />
        </g>
      </motion.svg>
    </div>
  );
}
