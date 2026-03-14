import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import useStore from "./store/useStore";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import MainLayout from "./components/shared/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import NotesPage from "./pages/NotesPage";
import MatieresPage from "./pages/MatieresPage";
import RevisionsPage from "./pages/RevisionsPage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { isAuthenticated, user } = useStore();
  if (isAuthenticated && user?.onboardingCompleted)
    return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, _hasHydrated } = useStore();

  useEffect(() => {
    // Appliquer le thème immédiatement
    const theme = user?.theme || "default";
    document.documentElement.setAttribute("data-theme", theme);
  }, [user?.theme]);

  // Si l'application est en train de se charger, on ne rend rien pour éviter
  // les redirections clignotantes entre /login et / le temps de charger le cache.
  if (!_hasHydrated) return null;

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "DM Sans, sans-serif",
            borderRadius: "12px",
            fontSize: "14px",
          },
          duration: 3000,
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <RegisterPage />
            </AuthRoute>
          }
        />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="matieres" element={<MatieresPage />} />
          <Route path="revisions" element={<RevisionsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="profile" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
