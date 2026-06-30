import { createContext, useContext, useEffect, useState } from "react";
import { restoreSession, logout as doLogout } from "@api/auth";

const AuthContext = createContext(null);

// StrictMode 이중 마운트에서도 refresh가 한 번만 나가도록 promise 메모이즈.
let restorePromise = null;
function restoreOnce() {
  if (!restorePromise) {
    restorePromise = restoreSession();
  }
  return restorePromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    restoreOnce().then((restored) => {
      if (active) {
        setUser(restored);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    await doLogout(); // 서버가 access·refresh 쿠키를 만료시키고 refresh를 폐기한다
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
