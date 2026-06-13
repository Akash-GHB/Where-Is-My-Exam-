import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User, LogIn, AlertCircle, GraduationCap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/Spinner";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/admin/dashboard";

  // ALL hooks must come before any early returns (Rules of Hooks)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already logged in — redirect
  if (isAuthenticated) {
    const isAdmin = user?.role?.includes("ADMIN");
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      await login(username.trim(), password);
      toast({
        title: "Login successful",
        description: "Welcome back to the admin portal",
      });
      // Redirection handled by the reactive check above
    } catch (err: unknown) {
      console.error("Login error:", err);
      const error = err as { response?: { status?: number; data?: { message?: string } } };

      if (error.response?.status === 401) {
        setError("Invalid username or password");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Unable to connect to the server. Please try again.");
      }

      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-border/50 shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full gradient-hero w-fit">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Sign in to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-black dark:bg-white text-white dark:text-black
                    text-sm font-semibold
                    hover:bg-neutral-800 dark:hover:bg-neutral-100
                    active:scale-[0.98] transition-all duration-200
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-400 dark:text-neutral-600">
                Are you a student?{" "}
                <Link to="/login" className="text-gray-600 dark:text-gray-400 font-medium hover:underline">
                  Login here
                </Link>
              </p>

              <p className="mt-6 text-center text-xs text-gray-400 dark:text-neutral-500 text-center">
                Contact your administrator for access credentials
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
