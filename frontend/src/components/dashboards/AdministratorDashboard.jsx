import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Users,
  Plus,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  PlayCircle,
  CheckCircle
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import EmployeeForm from '../forms/EmployeeForm';
import PayrollForm from '../forms/PayrollForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useAuth } from '../../context/AuthContext';

const AdministratorDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get('companyId');
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch employees from API
  const effectiveCompanyId = user?.role === 'SUPER_ADMIN' && companyIdFromUrl ? companyIdFromUrl : user?.companyId;
  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: user?.role === 'SUPER_ADMIN' ? (companyIdFromUrl ? ['employees', companyIdFromUrl] : ['employees']) : ['employees', user?.companyId],
    queryFn: async () => {
      const endpoint = user?.role === 'SUPER_ADMIN' && companyIdFromUrl ? `/employees?companyId=${companyIdFromUrl}` : (user?.role === 'SUPER_ADMIN' ? '/employees' : `/employees?companyId=${user?.companyId}`);
      const response = await api.get(endpoint);
      return response.data || [];
    },
    enabled: user?.role === 'SUPER_ADMIN' || !!effectiveCompanyId,
  });

  // Fetch company name if viewing specific company
  const { data: company } = useQuery({
    queryKey: ['company', effectiveCompanyId],
    queryFn: async () => {
      if (!effectiveCompanyId) return null;
      const response = await api.get(`/companies/${effectiveCompanyId}`);
      return response.data;
    },
    enabled: !!effectiveCompanyId,
  });

  // Mock payroll cycles data
  const payrollCycles = [
    {
      id: 1,
      name: 'September 2025',
      startDate: '2025-09-01',
      endDate: '2025-09-30',
      status: 'completed',
      employeeCount: 4,
      totalAmount: 225000
    },
    {
      id: 2,
      name: 'October 2025',
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      status: 'processing',
      employeeCount: 4,
      totalAmount: 230000
    }
  ];

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      change: '+2 this month',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Monthly Payroll',
      value: '$225,000',
      change: '+5% from last month',
      icon: DollarSign,
      color: 'text-success'
    },
    {
      title: 'Active Cycles',
      value: payrollCycles.filter(c => c.status !== 'completed').length,
      change: '1 in progress',
      icon: Calendar,
      color: 'text-warning'
    },
    {
      title: 'Completion Rate',
      value: '98.5%',
      change: 'On track this month',
      icon: TrendingUp,
      color: 'text-success'
    }
  ];

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setShowEmployeeForm(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleEmployeeSubmit = () => {
    // Invalidate and refetch employees
    queryClient.invalidateQueries({ queryKey: user?.role === 'SUPER_ADMIN' ? (companyIdFromUrl ? ['employees', companyIdFromUrl] : ['employees']) : ['employees', user?.companyId] });
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const response = await api.delete(`/employees/${employeeId}`);
      if (response.error) {
        console.error("Error deleting employee:", response.error);
        // You could show a toast here
      } else {
        // Invalidate and refetch employees
        queryClient.invalidateQueries({ queryKey: user?.role === 'SUPER_ADMIN' ? (companyIdFromUrl ? ['employees', companyIdFromUrl] : ['employees']) : ['employees', user?.companyId] });
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleLaunchPayroll = () => {
    setShowPayrollForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10';
      case 'processing': return 'text-warning bg-warning/10';
      case 'pending': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {company ? company.name : 'Administrator Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {company ? `Manage employees for ${company.name}` : "Manage your company's employees and payroll"}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleCreateEmployee} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          <Button onClick={handleLaunchPayroll} className="bg-gradient-to-r from-primary to-accent">
            <PlayCircle className="h-4 w-4 mr-2" />
            Launch Payroll
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow animate-scale-in" style={{animationDelay: `${index * 100}ms`}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Cycles</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Employees</CardTitle>
                  <CardDescription>
                    Manage your company's employee records
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {employees.length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-muted-foreground">Loading employees...</div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive">Error loading employees</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {employee.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge variant={employee.isActive ? "default" : "secondary"} className="text-xs">
                              {employee.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Joined {new Date(employee.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action ne peut pas être annulée. Cela supprimera définitivement l'employé {employee.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Payroll Cycles</CardTitle>
                  <CardDescription>
                    View and manage payroll processing cycles
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payrollCycles.map((cycle) => (
                  <div
                    key={cycle.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                        <Calendar className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cycle.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge className={getStatusColor(cycle.status)}>
                            {cycle.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {cycle.employeeCount} employees
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ${cycle.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {cycle.status === 'processing' && (
                        <Button variant="ghost" size="sm" className="text-success">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee ? "Update the employee's information." : "Fill in the details to add a new employee to your company."}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            employee={selectedEmployee}
            companyId={effectiveCompanyId}
            onSubmit={handleEmployeeSubmit}
            onCancel={() => setShowEmployeeForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPayrollForm} onOpenChange={setShowPayrollForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Launch New Payroll Cycle</DialogTitle>
          </DialogHeader>
          <PayrollForm 
            onSubmit={() => setShowPayrollForm(false)}
            onCancel={() => setShowPayrollForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdministratorDashboard;