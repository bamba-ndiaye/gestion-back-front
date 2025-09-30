import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SuperAdminDashboard from "./components/dashboards/SuperAdminDashboard";
import AdministratorDashboard from "./components/dashboards/AdministratorDashboard";
import CashierDashboard from "./components/dashboards/CashierDashboard";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-glow p-4 bg-gradient-to-br from-primary to-accent rounded-2xl">
          <div className="h-8 w-8 bg-primary-foreground rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'SUPER_ADMIN') {
      return <Navigate to="/super-admin" replace />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <Layout>{children}</Layout>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/super-admin" element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdministratorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <CashierDashboard />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const LoginRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-glow p-4 bg-gradient-to-br from-primary to-accent rounded-2xl">
          <div className="h-8 w-8 bg-primary-foreground rounded"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'SUPER_ADMIN') {
      return <Navigate to="/super-admin" replace />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <Login />;
};

export default App;
