import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppSelector } from "@/store/hooks";

// Pages
import Auth from "./pages/Auth";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import AttendancePage from "./pages/employee/AttendancePage";
import HistoryPage from "./pages/employee/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import AllEmployeesPage from "./pages/manager/AllEmployeesPage";
import TeamCalendarPage from "./pages/manager/TeamCalendarPage";
import ReportsPage from "./pages/manager/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component that handles role-based routing
const DashboardRouter = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Route to appropriate dashboard based on role
  if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }

  return <EmployeeDashboard />;
};

// Home redirect
const HomeRedirect = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/auth" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Dashboard - role-based */}
      <Route path="/dashboard" element={<DashboardRouter />} />
      
      {/* Employee Routes */}
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      
      {/* Manager Routes */}
      <Route path="/employees" element={<AllEmployeesPage />} />
      <Route path="/calendar" element={<TeamCalendarPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
