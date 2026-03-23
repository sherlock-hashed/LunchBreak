import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) {
        return { socket: null, isConnected: false, onlineCount: 0 };
    }
    return ctx;
};

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socketInstance, setSocketInstance] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            // Disconnect if logged out
            if (socketInstance) {
                socketInstance.disconnect();
                setSocketInstance(null);
                setIsConnected(false);
            }
            return;
        }

        // Get JWT token
        const token = localStorage.getItem("csclash_token");
        if (!token) return;

        // Prevent multiple connections
        if (socketInstance) return;

        // Create socket connection
        const socket = io(import.meta.env.PROD ? "/" : "http://localhost:5000", {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocketInstance(socket);

        socket.on("connect", () => {
            // console.log("[Socket] Connected:", socket.id);
            setIsConnected(true);
        });

        socket.on("disconnect", (reason) => {
            // console.log("[Socket] Disconnected:", reason);
            setIsConnected(false);
        });

        socket.on("connect_error", (err) => {
            // console.error("[Socket] Connection error:", err.message);
            setIsConnected(false);
        });

        socket.on("online-count", (data) => {
            setOnlineCount(data.count);
        });

        return () => {
            socket.disconnect();
            setSocketInstance(null);
            setIsConnected(false);
        };
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={{
            socket: socketInstance,
            isConnected,
            onlineCount,
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
