import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    console.log("ProtectedRoute: Still loading...", { path: location.pathname });
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-4 text-center">
        <div className="fancy-loader text-blue-500 mb-4">
          <div /><div /><div />
        </div>
        <p className="text-sm text-gray-500 animate-pulse">Loading secure content...</p>
      </div>
    );
  }

  // Not logged in -> go to login
  if (!isAuthenticated) {
    const loginPath = location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Logged in but role not allowed -> go to their dashboard
  if (allowedRoles && !allowedRoles.some(role =>
    user?.role === role || user?.role === role.replace("ROLE_", "")
  )) {
    const isActuallyAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";
    const fallbackPath = isActuallyAdmin ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
