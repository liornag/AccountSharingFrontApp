import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import { setAuthToken } from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();

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
    navigate(redirectTo || "/uploadBill", { replace: true });
  };

  // call this function to sign out logged in user
  const logout = () => {
    setUser(null);
    setAuthToken(null);
    navigate("/", { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};