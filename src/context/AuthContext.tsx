"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "@/components/config/config";
import { isStudentLoggedIn } from "@/helpers/commonHelper";
interface AuthContextType {
  role: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  setAuth: (role: string, token: string) => void;
  clearAuth: () => void;
}

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  isAuthenticated: false,
  loading: true,
  setAuth: () => { },
  clearAuth: () => { }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const loginStatus = isStudentLoggedIn();
  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rolename");
    localStorage.removeItem('IdToken');
    localStorage.removeItem('AccessToken');
    localStorage.removeItem('RefreshToken');
    setRole("");
    setIsAuthenticated(false);
  };
  const setAuth = (rolename: string, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("rolename", rolename);
    setRole(rolename);
    setIsAuthenticated(true);
    setLoading(false);
  };
  const validateAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    const rolename = localStorage.getItem("rolename");
    const AccessToken = localStorage.getItem("AccessToken");
    if (!token || !rolename) {
      clearAuth();
      setLoading(false);
      return;
    }
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        clearAuth();
        router.push(rolename === "SUPERADMIN" ? "/admin/signin" : "/signin");
        return;
      }
      if (AccessToken && (rolename === "STUDENT" || rolename === "INSTRUCTOR")) {
        const cognitoDecoded: DecodedToken = jwtDecode(AccessToken);
        const refreshToken = localStorage.getItem("RefreshToken");
        if (cognitoDecoded.exp && cognitoDecoded.exp < currentTime) {
          const username = cognitoDecoded.username;
          try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/v1/user/get-new-token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "X-ID-TOKEN": localStorage.getItem("IdToken") || "",
                "X-ACCESS-TOKEN": AccessToken || "",
              },
              body: JSON.stringify({ username, refreshToken }),
            });
            const data = await response.json();
            if (response.status === 422 || !response.ok) {
              throw new Error(data.message || "Token refresh failed");
            }
            // debugger
            localStorage.setItem("AccessToken", data.data.result.AccessToken);
            localStorage.setItem("IdToken", data.data.result.IdToken);
            setIsAuthenticated(true);
            setRole(rolename);
            return
          } catch (error) {
            console.error("Token refresh failed", error);
            clearAuth();
            router.push("/signin");
            return;
          } finally{
            setLoading(false);
          }
        }
      }
      setIsAuthenticated(true);
      setRole(rolename);
    } catch (error) {
      console.error("Invalid token", error);
      clearAuth();
      router.push(rolename === "SUPERADMIN" ? "/admin/signin" : "/signin");
    } finally {
      setLoading(false);
    }
  }, [router]);


  useEffect(() => {
    validateAuth();
  }, [validateAuth]);
  useEffect(() => {
    const adminResetPasswordRegex = /^\/admin\/reset-password\/[a-zA-Z0-9]+$/;
    const userResetPasswordRegex = /^\/user\/reset-password\/[a-zA-Z0-9]+$/;
    if (role == "" && (loading || pathname === "/signin" || pathname === "/admin/signin" || pathname === "/admin/forgot-password")) return;
    if (role === "STUDENT" && (pathname == '/contact-us' || pathname == '/about-us' || pathname == '/')) return;
    if (pathname === "/instructor-signup" || adminResetPasswordRegex.test(pathname) || userResetPasswordRegex.test(pathname)) return;
    if (pathname.startsWith("/admin") && role !== "SUPERADMIN") {
      clearAuth();
      router.push("/admin/signin");
    } else if (pathname.startsWith("/instructor") && role !== "INSTRUCTOR") {
      clearAuth();
      router.push("/signin");
    } else if ((pathname.startsWith("/dashboard") || pathname.startsWith("/checkout") || pathname.startsWith("/cart")) && role !== "STUDENT") {
      clearAuth();
      router.push("/signin");
    } else if (loginStatus && pathname === "/signin") {
      router.push("/dashboard");
    }
  }, [pathname, role, loading, router]);

  return (
    <AuthContext.Provider value={{ role, isAuthenticated, loading, setAuth,clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
