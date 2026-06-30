import { AuthProvider, useAuth } from "@auth/AuthContext";
import LoginPage from "@pages/public/LoginPage";

function Shell() {
  const { loading } = useAuth();
  return (
    <>
      <div>여운</div>
      {loading ? <p>세션 확인 중…</p> : <LoginPage />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;
