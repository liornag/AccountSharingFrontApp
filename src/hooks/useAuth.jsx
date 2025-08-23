import { createContext, useContext, useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStorage } from "./useSessionStorage";
import { setAuthToken } from "../lib/api";
import { io } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useSessionStorage("user", null);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  const connectSocket = (token) => {
    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    s.on("connect", () => console.log("✅ Socket connected:", s.id));
    s.on("disconnect", () => console.log("❌ Socket disconnected"));
    s.on("connect_error", (err) => console.error("⚠️ Socket connect error:", err.message));

    setSocket(s);
  };

  // call this function when you want to authenticate the user
   const login = async (data, redirectTo) => {
    const { token: rawToken, username } = data ?? {};
    const token = (rawToken || "").replace(/^Bearer\s+/i, "");
    if (!token) {
      console.error("Login: missing token in response", data);
      throw new Error("Missing token");
    }

    setUser({ username, token });
    setAuthToken(token);
    connectSocket(token);

    const redirectToTemp = redirectTo
    sessionStorage.removeItem('redirectAfterLogin')

    navigate(redirectToTemp || "/uploadBill", { replace: true });
  };

  // call this function to sign out logged in user
  const logout = () => {
    setUser(null);
    setAuthToken(null);

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    navigate("/", { replace: true });
  };

  useEffect(() => {
    if (user?.token && !socket) {
      connectSocket(user.token);
    }

    if(socket && !user && !user.token){
      socket.close();
      setSocket(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      socket,
    }),
    [user, socket]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};