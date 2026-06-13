import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, GraduationCap, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const features = [
    { emoji: "🔍", title: "Instant Search", desc: "Find your exam hall in seconds" },
    { emoji: "📄", title: "Admit Card", desc: "Download your admit card as PDF" },
    { emoji: "🔔", title: "Always Updated", desc: "Real-time seating information" },
];

export default function Login() {
    const { login, loginWithGoogleProvider, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

    // ALL hooks must be declared before any early returns (Rules of Hooks)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Already logged in — redirect to the correct dashboard
    if (isAuthenticated) {
        const isActuallyAdmin = user?.role?.includes("ADMIN");
        const target = isActuallyAdmin ? "/admin/dashboard" : "/dashboard";
        return <Navigate to={target} replace />;
    }

    const validate = () => {
        if (!email.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
        if (!password) return "Password is required";
        if (password.length < 6) return "Password must be at least 6 characters";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const validationError = validate();
        if (validationError) { setError(validationError); return; }

        setIsLoading(true);
        try {
            await login(email.trim().toLowerCase(), password);
            toast({ title: "Welcome back!", description: "You've been signed in successfully." });
            // Redirection is handled automatically by the reactive 'isAuthenticated' check in the component body
        } catch {
            setError("Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) return;

        setError(null);
        setIsGoogleLoading(true);
        try {
            await loginWithGoogleProvider(credentialResponse.credential);
            toast({ title: "Signed in with Google!", description: "Welcome to Where Is My Exam." });
            navigate(from, { replace: true });
        } catch {
            setError("Google sign-in failed. Please try again.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full max-w-[420px] glass-card rounded-3xl p-8 sm:p-10 space-y-8 relative overflow-hidden"
                    >
                        {/* Subtle background glow inside the card */}
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-gray-200 dark:bg-white/10 blur-3xl rounded-full" />
                        <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-gray-200 dark:bg-white/5 blur-3xl rounded-full" />

                        <div className="text-center relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2 tracking-tight">Welcome back</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Don't have an account?{" "}
                                <Link to="/signup" className="font-semibold hover:underline">
                                    Sign up free
                                </Link>
                            </p>
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-center w-full relative">
                                {isGoogleLoading ? (
                                    <div className="flex items-center justify-center p-3 text-sm text-gray-500">
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Authenticating securely...
                                    </div>
                                ) : (
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError("Google login failed")}
                                        useOneTap
                                        shape="pill"
                                        theme="outline"
                                        size="large"
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">or continue with</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-1.5 ml-1">Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className="w-4 h-4 text-gray-400 transition-colors" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 input-focus transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                                        <Link to="/forgot-password" className="text-xs text-gray-500 dark:text-gray-400 hover:underline transition-colors">Forgot?</Link>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-gray-400 transition-colors" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full pl-10 pr-10 py-3 rounded-2xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 input-focus transition-all duration-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-90 transition-all duration-200 mt-2"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
                                    ) : "Sign in"}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
