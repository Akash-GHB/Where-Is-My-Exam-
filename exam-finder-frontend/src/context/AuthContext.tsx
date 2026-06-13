import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

import { jwtDecode } from "jwt-decode";
import { setToken, removeToken } from "@/utils/auth";
import { loginUser, registerUser, loginWithGoogleApi } from "@/api/axios";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    provider: "email" | "google";
    role: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<AuthUser>;
    loginWithGoogleProvider: (token: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    signup: (name: string, email: string, password: string, username: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = "wime_user";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Rehydrate user from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(USER_KEY);
            if (saved) {
                setUser(JSON.parse(saved));
            }
        } catch {
            localStorage.removeItem(USER_KEY);
            removeToken();
        } finally {
            setIsLoading(false);
        }
    }, []);

    const persistUser = (u: AuthUser, token: string) => {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setToken(token);
        setUser(u);
    };

    const login = async (username: string, password: string) => {
        console.log("AuthContext: Login started for", username);
        setIsLoading(true);
        try {
            const data = await loginUser({ username, password });
            console.log("AuthContext: Login success, tokens received");

            // Ensure we use the properties returned by the API if available
            const decoded: any = jwtDecode(data.token);

            const user: AuthUser = {
                id: decoded.sub || username,
                name: data.name || decoded.name || username,
                email: data.email || decoded.email || `${username}@whereismyexam.test`,
                role: data.role || decoded.role || "ROLE_USER",
                provider: "email",
            };
            persistUser(user, data.token);
            console.log("AuthContext: User persisted, returning...");
            return user;
        } finally {
            console.log("AuthContext: Setting isLoading to false");
            setIsLoading(false);
        }
    };

    const loginWithGoogleProvider = async (googleToken: string) => {
        try {
            setIsLoading(true);
            const response = await loginWithGoogleApi(googleToken);
            setToken(response.token);

            const decoded: any = jwtDecode(response.token);
            const userData: AuthUser = {
                id: decoded.sub || "unknown",
                name: response.name,
                email: response.email,
                provider: "google",
                role: response.role
            };

            setUser(userData);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error("Google login failed", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            await new Promise((res) => setTimeout(res, 700));

            const mockGoogleUser: AuthUser = {
                id: "google-" + crypto.randomUUID(),
                name: "Google User",
                email: "user@gmail.com",
                avatar: "https://lh3.googleusercontent.com/a/default-user",
                provider: "google",
                role: "USER"
            };
            persistUser(mockGoogleUser, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUtYWRtaW4iLCJuYW1lIjoiR29vZ2xlIFVzZXIiLCJleHAiOjE5OTk5OTk5OTl9.mock-signature");
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string, username: string) => {
        setIsLoading(true);
        try {
            const data = await registerUser({ username, password, email, name });
            const decoded: any = jwtDecode(data.token);

            const newUser: AuthUser = {
                id: decoded.sub || username,
                name: data.name || decoded.name || name,
                email: data.email || decoded.email || email,
                role: data.role || decoded.role || "ROLE_USER",
                provider: "email",
            };
            persistUser(newUser, data.token);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(USER_KEY);
        removeToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                loginWithGoogleProvider,
                loginWithGoogle,
                signup,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
