import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Lock, Eye, EyeOff, AlertCircle, GraduationCap, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";
import { forgotPassword, verifyOtp, resetPassword } from "@/api/axios";

type Step = "email" | "otp" | "reset";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Resend timer
    const [resendTimer, setResendTimer] = useState(0);

    // OTP input refs
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown for resend
    useEffect(() => {
        if (resendTimer <= 0) return;
        const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Auto-focus first OTP input when step changes to OTP
    useEffect(() => {
        if (step === "otp") {
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    // ─── Step 1: Send OTP ────────────────────────────────────────────────
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) { setError("Email is required"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address"); return; }

        setIsLoading(true);
        try {
            const res = await forgotPassword(email.trim().toLowerCase());
            toast({ title: "OTP Sent!", description: res.message });
            setResendTimer(60);
            setStep("otp");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to send OTP. Please try again.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Step 2: Verify OTP ──────────────────────────────────────────────
    const handleVerifyOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);

        const otpString = otp.join("");
        if (otpString.length !== 6) { setError("Please enter the complete 6-digit OTP"); return; }

        setIsLoading(true);
        try {
            const res = await verifyOtp(email.trim().toLowerCase(), otpString);
            toast({ title: "Verified!", description: res.message });
            setStep("reset");
        } catch (err: any) {
            const msg = err.response?.data?.message || "OTP verification failed.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Step 3: Reset Password ──────────────────────────────────────────
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
        if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }

        setIsLoading(true);
        try {
            const res = await resetPassword(email.trim().toLowerCase(), newPassword);
            setSuccess(res.message);
            toast({ title: "Password Reset!", description: "You can now login with your new password." });
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to reset password.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Resend OTP ──────────────────────────────────────────────────────
    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setError(null);
        setIsLoading(true);
        try {
            await forgotPassword(email.trim().toLowerCase());
            toast({ title: "OTP Resent!", description: "A new OTP has been sent to your email." });
            setResendTimer(60);
            setOtp(["", "", "", "", "", ""]);
            otpRefs.current[0]?.focus();
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to resend OTP.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── OTP Input Handlers ──────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only last digit
        setOtp(newOtp);

        // Auto-advance to next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (value && index === 5 && newOtp.every((d) => d !== "")) {
            setTimeout(() => handleVerifyOtp(), 200);
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 0) return;
        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
            newOtp[i] = pasted[i] || "";
        }
        setOtp(newOtp);
        if (pasted.length === 6) {
            otpRefs.current[5]?.focus();
            setTimeout(() => handleVerifyOtp(), 200);
        } else {
            otpRefs.current[Math.min(pasted.length, 5)]?.focus();
        }
    };

    // ─── Step Titles ─────────────────────────────────────────────────────
    const stepConfig = {
        email: { title: "Forgot password?", subtitle: "Enter your email and we'll send you an OTP to reset it." },
        otp: { title: "Check your email", subtitle: `We sent a 6-digit code to ${email}` },
        reset: { title: "Set new password", subtitle: "Choose a strong password for your account." },
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
                        {/* Subtle background glow */}
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-gray-200 dark:bg-white/10 blur-3xl rounded-full" />
                        <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-gray-200 dark:bg-white/5 blur-3xl rounded-full" />

                        {/* Header */}
                        <div className="text-center relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto mb-6 shadow-lg">
                                {step === "reset" ? <Lock className="w-6 h-6" /> : step === "otp" ? <KeyRound className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                            </div>
                            <h2 className="text-3xl font-bold mb-2 tracking-tight">{stepConfig[step].title}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{stepConfig[step].subtitle}</p>
                        </div>

                        <div className="relative z-10 space-y-6">
                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm"
                                    >
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Success */}
                            <AnimatePresence>
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm"
                                    >
                                        <CheckCircle className="w-4 h-4 shrink-0" />
                                        {success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ─── STEP 1: EMAIL ─── */}
                            {step === "email" && (
                                <motion.form
                                    key="email-step"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleSendOtp}
                                    className="space-y-4"
                                    noValidate
                                >
                                    <div>
                                        <label htmlFor="reset-email" className="block text-sm font-medium mb-1.5 ml-1">Email address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Mail className="w-4 h-4 text-gray-400 transition-colors" />
                                            </div>
                                            <input
                                                id="reset-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={isLoading}
                                                autoFocus
                                                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 input-focus transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-90 transition-all duration-200 mt-2 disabled:opacity-60"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" />Sending OTP...</>
                                        ) : "Send OTP"}
                                    </motion.button>
                                </motion.form>
                            )}

                            {/* ─── STEP 2: OTP ─── */}
                            {step === "otp" && (
                                <motion.form
                                    key="otp-step"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleVerifyOtp}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium mb-3 ml-1 text-center">Enter 6-digit OTP</label>
                                        <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                                            {otp.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={(el) => { otpRefs.current[i] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    disabled={isLoading}
                                                    className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:border-black dark:focus:border-white transition-all duration-200"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading || otp.join("").length !== 6}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</>
                                        ) : "Verify OTP"}
                                    </motion.button>

                                    {/* Resend */}
                                    <div className="text-center">
                                        {resendTimer > 0 ? (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Resend OTP in <span className="font-bold text-black dark:text-white">{resendTimer}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={isLoading}
                                                className="text-xs font-semibold text-black dark:text-white hover:underline transition-colors"
                                            >
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                </motion.form>
                            )}

                            {/* ─── STEP 3: RESET PASSWORD ─── */}
                            {step === "reset" && !success && (
                                <motion.form
                                    key="reset-step"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleResetPassword}
                                    className="space-y-4"
                                    noValidate
                                >
                                    <div>
                                        <label htmlFor="new-password" className="block text-sm font-medium mb-1.5 ml-1">New password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Lock className="w-4 h-4 text-gray-400 transition-colors" />
                                            </div>
                                            <input
                                                id="new-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                disabled={isLoading}
                                                autoFocus
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

                                    <div>
                                        <label htmlFor="confirm-new-password" className="block text-sm font-medium mb-1.5 ml-1">Confirm password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Lock className="w-4 h-4 text-gray-400 transition-colors" />
                                            </div>
                                            <input
                                                id="confirm-new-password"
                                                type={showConfirm ? "text" : "password"}
                                                placeholder="Repeat new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={isLoading}
                                                className={`w-full pl-10 pr-10 py-3 rounded-2xl text-sm bg-gray-50 dark:bg-white/5 border focus:outline-none focus:border-gray-400 dark:focus:border-white/30 input-focus transition-all duration-300 ${confirmPassword && confirmPassword !== newPassword ? 'border-red-400/50' : 'border-gray-200 dark:border-white/10'}`}
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
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-90 transition-all duration-200 mt-2 disabled:opacity-60"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" />Resetting...</>
                                        ) : "Reset Password"}
                                    </motion.button>
                                </motion.form>
                            )}

                            {/* Back to login link */}
                            <div className="text-center pt-2">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Back to sign in
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
