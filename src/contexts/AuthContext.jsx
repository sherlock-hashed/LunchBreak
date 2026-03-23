import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { signInWithGoogle } from "../lib/firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem("csclash_token");
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get("/auth/me");
                if (res.data.success) {
                    setUser(res.data.user);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                localStorage.removeItem("csclash_token");
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        if (res.data.success) {
            localStorage.setItem("csclash_token", res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
        }
        return res.data;
    };

    const signup = async (name, username, email, password, gender) => {
        const res = await api.post("/auth/register", {
            name,
            username,
            email,
            password,
            gender,
        });
        if (res.data.success) {
            localStorage.setItem("csclash_token", res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
        }
        return res.data;
    };

    const loginWithGoogle = async () => {
        const googleData = await signInWithGoogle();
        const res = await api.post("/auth/google", googleData);
        if (res.data.success) {
            localStorage.setItem("csclash_token", res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
        }
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            // ignore
        }
        localStorage.removeItem("csclash_token");
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateProfile = (updatedUser) => {
        setUser(updatedUser);
    };

    const refreshUser = async () => {
        try {
            const res = await api.get("/auth/me");
            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (err) {
            // console.error("refreshUser error:", err);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        signup,
        logout,
        loginWithGoogle,
        updateProfile,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
