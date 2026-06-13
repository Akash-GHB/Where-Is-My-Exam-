import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, LogOut, Menu, X, GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { isLoggedIn, removeToken, getTheme, toggleTheme, type Theme } from "@/utils/auth";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setThemeState] = useState<Theme>(getTheme());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loggedIn = isLoggedIn();
  const { user: authUser, logout: authLogout } = useAuth();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setThemeState(newTheme);
  };

  const handleLogout = () => {
    removeToken();
    navigate("/admin/login");
  };

  const handleUserLogout = () => {
    authLogout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-white/70 dark:bg-black/50 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 transition-colors duration-200"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={authUser?.role === "ROLE_ADMIN" ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-black dark:bg-white flex items-center justify-center group-hover:bg-neutral-800 dark:group-hover:bg-neutral-100 transition-colors">
              <GraduationCap className="w-5 h-5 text-white dark:text-black" />
            </div>
            <span className="font-bold text-lg text-black dark:text-white hidden sm:inline">
              Where Is My Exam
            </span>
            <span className="font-bold text-lg text-black dark:text-white sm:hidden">
              WIME
            </span>
          </Link>

          {/* Desktop Navigation — only show when user is logged in */}
          {authUser && (
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/dashboard" active={isActive("/dashboard")}>Find Exam</NavLink>
              <NavLink to="/history" active={isActive("/history")}>History</NavLink>
              <NavLink to="/profile" active={isActive("/profile")}>Profile</NavLink>
              {authUser.role === "ROLE_ADMIN" ? (
                <NavLink to="/admin/dashboard" active={isActive("/admin/dashboard")}>Dashboard</NavLink>
              ) : (
                <NavLink to="/dashboard" active={isActive("/dashboard")}>Dashboard</NavLink>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {authUser && <NotificationBell />}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="relative overflow-hidden"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 0 : 180, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.div>
            </Button>

            {/* User sign-out (when logged in via AuthContext) */}
            {authUser && (
              <div className="hidden md:flex items-center gap-2 ml-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate max-w-[120px]">
                  {authUser.name}
                </span>
                <button
                  type="button"
                  onClick={handleUserLogout}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-all"
                >
                  Sign out
                </button>
              </div>
            )}
            {/* Login links — shown when no user is logged in */}
            {!authUser && (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/admin/login"
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-all font-medium"
                >
                  Admin
                </Link>
                <Link
                  to="/login"
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-all font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Admin JWT logout */}
            {loggedIn && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                aria-label="Admin Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && authUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-200/50 dark:border-white/10"
          >
            <div className="flex flex-col gap-2">
              <MobileNavLink to="/dashboard" active={isActive("/dashboard")}>
                Find Exam
              </MobileNavLink>
              <MobileNavLink to="/history" active={isActive("/history")}>
                History
              </MobileNavLink>
              <MobileNavLink to="/profile" active={isActive("/profile")}>
                Profile
              </MobileNavLink>
              {authUser.role === "ROLE_ADMIN" ? (
                <MobileNavLink to="/admin/dashboard" active={isActive("/admin/dashboard")}>
                  Dashboard
                </MobileNavLink>
              ) : (
                <MobileNavLink to="/dashboard" active={isActive("/dashboard")}>
                  Dashboard
                </MobileNavLink>
              )}
              {/* Mobile sign out */}
              <button
                onClick={handleUserLogout}
                className="px-4 py-3 rounded-lg text-base font-medium text-left text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-all duration-200"
              >
                Sign out ({authUser.name})
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ to, active, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
        ? "text-black dark:text-white"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
        }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white rounded-full mx-2"
          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
        />
      )}
    </Link>
  );
}

function MobileNavLink({ to, active, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${active
        ? "bg-gray-100 dark:bg-neutral-900 text-black dark:text-white"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-900"
        }`}
    >
      {children}
    </Link>
  );
}
