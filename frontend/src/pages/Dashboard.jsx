import React from 'react';
import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard';
import AdministratorDashboard from '../components/dashboards/AdministratorDashboard';
import CashierDashboard from '../components/dashboards/CashierDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />;
      case 'ADMIN':
        return <AdministratorDashboard />;
      case 'CASHIER':
        return <CashierDashboard />;
      case 'EMPLOYEE':
        return <EmployeeDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Invalid user role
            </h2>
          </div>
        );
    }
  };

  return renderDashboard();
};

export default Dashboard;