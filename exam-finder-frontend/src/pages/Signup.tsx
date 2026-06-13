import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, GraduationCap, Loader2, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One number", test: (p: string) => /\d/.test(p) },
];

export default function Signup() {
    const { signup, loginWithGoogleProvider } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validate = (): string | null => {
        if (!name.trim()) return "Full name is required";
        if (!email.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
        if (password.length < 8) return "Password must be at least 8 characters";
        if (password !== confirmPassword) return "Passwords do not match";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const err = validate();
        if (err) { setError(err); return; }

        setIsLoading(true);
        try {
            const emailValue = email.trim().toLowerCase();
            await signup(name.trim(), emailValue, password, emailValue);
            toast({ title: "Account created!", description: "Welcome to Where Is My Exam." });
            navigate("/", { replace: true });
        } catch (err: any) {
            console.error("Signup error:", err);
            const backendError = err.response?.data?.message;
            setError(backendError || "Could not create account. Please try again.");
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
            navigate("/", { replace: true });
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
                        className="w-full max-w-[420px] glass-card rounded-3xl p-8 sm:p-10 space-y-6 relative overflow-hidden my-8"
                    >
                        {/* Subtle background glow inside the card */}
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-gray-200 dark:bg-white/10 blur-3xl rounded-full" />
                        <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-gray-200 dark:bg-white/5 blur-3xl rounded-full" />

                        <div className="text-center relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2 tracking-tight">Create an account</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Already have an account?{" "}
                                <Link to="/login" className="font-semibold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        <div className="relative z-10 space-y-5">
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
                                        text="signup_with"
                                        shape="pill"
                                        theme="outline"
                                        size="large"
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-3 py-1">
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
                                    <label htmlFor="name" className="block text-sm font-medium mb-1.5 ml-1">Full name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <User className="w-4 h-4 text-gray-400 transition-colors" />
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={isLoading}
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 input-focus transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5 ml-1">Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className="w-4 h-4 text-gray-400 transition-colors" />
                                        </div>
                                        <input
                                            id="signup-email"
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
                                    <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5 ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-gray-400 transition-colors" />
                                        </div>
                                        <input
                                            id="signup-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a strong password"
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
                                    {password && (
                                        <div className="mt-2 ml-1 space-y-1">
                                            {passwordRules.map((rule) => (
                                                <div key={rule.label} className="flex items-center gap-1.5">
                                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${rule.test(password) ? "bg-green-500" : "bg-white/10"}`}>
                                                        {rule.test(password) && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                                                    </div>
                                                    <span className={`text-xs ${rule.test(password) ? "text-green-400" : "text-gray-400"}`}>
                                                        {rule.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium mb-1.5 ml-1">Confirm password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-gray-400 transition-colors" />
                                        </div>
                                        <input
                                            id="confirm-password"
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Repeat your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={isLoading}
                                            className={`w-full pl-10 pr-10 py-3 rounded-2xl text-sm bg-gray-50 dark:bg-white/5 border focus:outline-none focus:border-gray-400 dark:focus:border-white/30 input-focus transition-all duration-300 ${confirmPassword && confirmPassword !== password ? 'border-red-400/50 focus:border-red-400/80' : 'border-gray-200 dark:border-white/10'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-90 transition-all duration-200 mt-4"
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
                                    ) : "Create account"}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
