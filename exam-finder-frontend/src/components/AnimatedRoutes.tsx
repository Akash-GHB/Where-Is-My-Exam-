import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";

const pageVariants = {
    initial: { opacity: 1, y: 0, filter: "none" },
    animate: { opacity: 1, y: 0, filter: "none", transition: { duration: 0.1 } },
    exit: { opacity: 1, y: 0, filter: "none", transition: { duration: 0.1 } }
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="w-full h-full flex flex-col flex-1"
    >
        {children}
    </motion.div>
);


export const AnimatedRoutes = () => {
    return (
        <Routes>
            {/* Protected dashboard routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
                        <Index />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
                        <Index />
                    </ProtectedRoute>
                }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected user routes */}
            <Route
                path="/history"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
                        <History />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_USER", "ROLE_ADMIN"]}>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
