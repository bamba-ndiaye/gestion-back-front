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
  CheckCircle,
  CreditCard,
  Clock,
  UserCheck
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import EmployeeForm from '../forms/EmployeeForm';
import PayrollForm from '../forms/PayrollForm';
import AttendanceForm from '../forms/AttendanceForm';
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
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = useState(false);
  const [showCompanyDetailsModal, setShowCompanyDetailsModal] = useState(false);
  const [showEmployeePaymentsModal, setShowEmployeePaymentsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState(null);
  const [selectedEmployeeForPayments, setSelectedEmployeeForPayments] = useState(null);
  const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] = useState(null);

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

  // Fetch company admin email
  const { data: companyAdmin } = useQuery({
    queryKey: ['company-admin', effectiveCompanyId],
    queryFn: async () => {
      if (!effectiveCompanyId) return null;
      const response = await api.get(`/companies/${effectiveCompanyId}/admin`);
      return response.data;
    },
    enabled: !!effectiveCompanyId && showCompanyDetailsModal,
  });

  // Fetch employee details for modal
  const { data: employeeDetails } = useQuery({
    queryKey: ['employee', selectedEmployeeForDetails?.id],
    queryFn: async () => {
      if (!selectedEmployeeForDetails?.id) return null;
      const response = await api.get(`/employees/${selectedEmployeeForDetails.id}`);
      return response.data;
    },
    enabled: !!selectedEmployeeForDetails?.id && showEmployeeDetailsModal,
  });

  // Fetch employee payslips for modal
  const { data: employeePayslips = [] } = useQuery({
    queryKey: ['employee-payslips', selectedEmployeeForPayments?.id],
    queryFn: async () => {
      if (!selectedEmployeeForPayments?.id) return [];
      const response = await api.get(`/payslips/employee/${selectedEmployeeForPayments.id}`);
      return response.data || [];
    },
    enabled: !!selectedEmployeeForPayments?.id && showEmployeePaymentsModal,
  });

  // Fetch payroll cycles from API
  const { data: payrollCycles = [], isLoading: payRunsLoading } = useQuery({
    queryKey: ['payroll-cycles'],
    queryFn: async () => {
      const response = await api.get('/payruns');
      return response.data || [];
    },
  });

  // Fetch attendance data for the current month
  const { data: attendanceData = [] } = useQuery({
    queryKey: ['company-attendance', effectiveCompanyId],
    queryFn: async () => {
      if (!effectiveCompanyId) return [];
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

      const response = await api.get(`/attendance/company?startDate=${startOfMonth.toISOString().split('T')[0]}&endDate=${endOfMonth.toISOString().split('T')[0]}`);
      return response.data || [];
    },
    enabled: !!effectiveCompanyId
  });

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      change: '+2 this month',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Present Today',
      value: attendanceData.filter(a => a.status === 'PRESENT' && a.date === new Date().toISOString().split('T')[0]).length,
      change: 'Checked in',
      icon: UserCheck,
      color: 'text-success'
    },
    {
      title: 'Monthly Payroll',
      value: `$${payrollCycles.reduce((sum, cycle) => sum + (cycle.payslips?.reduce((pSum, p) => pSum + (p.netSalary || 0), 0) || 0), 0).toLocaleString()}`,
      change: 'Current cycles',
      icon: DollarSign,
      color: 'text-success'
    },
    {
      title: 'Active Cycles',
      value: payrollCycles.filter(c => c.status === 'DRAFT').length,
      change: 'Awaiting validation',
      icon: Calendar,
      color: 'text-warning'
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

  const handleViewEmployeeDetails = (employee) => {
    setSelectedEmployeeForDetails(employee);
    setShowEmployeeDetailsModal(true);
  };

  const handleViewEmployeePayments = (employee) => {
    setSelectedEmployeeForPayments(employee);
    setShowEmployeePaymentsModal(true);
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

  const handleRecordAttendance = (employee) => {
    setSelectedEmployeeForAttendance(employee);
    setShowAttendanceForm(true);
  };

  const handleAttendanceSubmit = () => {
    queryClient.invalidateQueries({ queryKey: ['company-attendance', effectiveCompanyId] });
    setShowAttendanceForm(false);
    setSelectedEmployeeForAttendance(null);
  };

  const handleValidatePayRun = async (payRunId) => {
    try {
      await api.put(`/payruns/${payRunId}/validate`);
      // Invalidate and refetch payroll cycles
      queryClient.invalidateQueries({ queryKey: ['payroll-cycles'] });
    } catch (error) {
      console.error('Error validating pay run:', error);
    }
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
      <div
        className="flex justify-between items-center p-4 rounded-lg"
        style={{ backgroundColor: company?.color ? company.color + '20' : undefined }}
      >
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {company ? company.name : 'Administrator Dashboard'}
            </h1>
            {company && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompanyDetailsModal(true)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            {company ? `Manage employees for ${company.name}` : "Manage your company's employees and payroll"}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleCreateEmployee} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          <Button
            onClick={handleLaunchPayroll}
            style={{
              background: `linear-gradient(to right, ${company?.color || 'hsl(var(--primary))'}, hsl(var(--accent)))`
            }}
          >
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEmployeeDetails(employee)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEmployeePayments(employee)}
                      >
                        <CreditCard className="h-4 w-4" />
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

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Attendance Records</CardTitle>
                  <CardDescription>
                    Track employee attendance and working hours
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAttendanceForm(true)} variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Record Attendance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-muted-foreground">No attendance records found for this month</div>
                  </div>
                ) : (
                  attendanceData.slice(0, 10).map((record) => (
                    <div
                      key={`${record.employeeId}-${record.date}`}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {record.employee.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{record.employee.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs">
                              Check In: {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}
                            </span>
                            <span className="text-xs">
                              Check Out: {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={record.status === 'PRESENT' ? 'default' : 'secondary'} className="text-xs">
                          {record.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {record.checkIn && record.checkOut ?
                            `${Math.round((new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60) * 10) / 10}h worked` :
                            'No hours recorded'
                          }
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
              {payRunsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-muted-foreground">Loading payroll cycles...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {payrollCycles.map((cycle) => (
                    <div
                      key={cycle.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            background: `linear-gradient(to bottom right, ${company?.color || 'hsl(var(--primary))'}, hsl(var(--accent)))`
                          }}
                        >
                          <Calendar className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{cycle.month}/{cycle.year}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={getStatusColor(cycle.status.toLowerCase())}>
                              {cycle.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {cycle.payslips?.length || 0} bulletins
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {cycle.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-success"
                            onClick={() => handleValidatePayRun(cycle.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            <DialogDescription>
              Create a new payroll cycle and select employees to include.
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

      <Dialog open={showAttendanceForm} onOpenChange={setShowAttendanceForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Attendance</DialogTitle>
            <DialogDescription>
              Record check-in, check-out, or update attendance status for an employee
            </DialogDescription>
          </DialogHeader>
          <AttendanceForm
            employeeId={selectedEmployeeForAttendance?.id}
            onSubmit={handleAttendanceSubmit}
            onCancel={() => setShowAttendanceForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPayrollForm} onOpenChange={setShowPayrollForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Launch New Payroll Cycle</DialogTitle>
          </DialogHeader>
          <PayrollForm
            companyId={effectiveCompanyId}
            onSubmit={() => setShowPayrollForm(false)}
            onCancel={() => setShowPayrollForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Employee Details Modal */}
      <Dialog open={showEmployeeDetailsModal} onOpenChange={setShowEmployeeDetailsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l'employé</DialogTitle>
            <DialogDescription>
              Informations complètes sur l'employé sélectionné
            </DialogDescription>
          </DialogHeader>
          {employeeDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom</label>
                  <p className="text-lg font-semibold">{employeeDetails.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{employeeDetails.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p>{employeeDetails.telephone || 'Non spécifié'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service</label>
                  <p>{employeeDetails.service || 'Non spécifié'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statut actif</label>
                  <Badge variant={employeeDetails.isActive ? "default" : "secondary"}>
                    {employeeDetails.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de création</label>
                  <p>{new Date(employeeDetails.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dernière mise à jour</label>
                  <p>{new Date(employeeDetails.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-pulse text-muted-foreground">Chargement des détails...</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Company Details Modal */}
      <Dialog open={showCompanyDetailsModal} onOpenChange={setShowCompanyDetailsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l'entreprise</DialogTitle>
            <DialogDescription>
              Informations complètes sur l'entreprise sélectionnée
            </DialogDescription>
          </DialogHeader>
          {company ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom</label>
                  <p className="text-lg font-semibold">{company.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Adresse</label>
                  <p>{company.address || 'Non spécifiée'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Admin</label>
                  <p>{companyAdmin?.email || 'Non spécifié'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statut actif</label>
                  <Badge variant={company.isActive ? "default" : "secondary"}>
                    {company.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de création</label>
                  <p>{new Date(company.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dernière mise à jour</label>
                  <p>{new Date(company.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-pulse text-muted-foreground">Chargement des détails...</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Payments Modal */}
      <Dialog open={showEmployeePaymentsModal} onOpenChange={setShowEmployeePaymentsModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Paiements de {selectedEmployeeForPayments?.name}</DialogTitle>
            <DialogDescription>
              Historique complet des bulletins de salaire et statuts de paiement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {employeePayslips.length > 0 ? (
              <div className="space-y-4">
                {employeePayslips.map((payslip) => (
                  <div
                    key={payslip.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                        <FileText className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Bulletin #{payslip.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Cycle: {payslip.payRun ? `${payslip.payRun.month}/${payslip.payRun.year}` : 'N/A'}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm">
                            Salaire net: ${payslip.netSalary?.toLocaleString() || '0'}
                          </span>
                          <span className="text-sm">
                            Payé: ${payslip.amountPaid?.toLocaleString() || '0'}
                          </span>
                          <Badge variant={payslip.amountPaid >= payslip.netSalary ? "default" : "secondary"} className="text-xs">
                            {payslip.amountPaid >= payslip.netSalary ? 'Payé' : 'Partiellement payé'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Créé: {new Date(payslip.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Mis à jour: {new Date(payslip.updatedAt).toLocaleDateString()}
                      </p>
                      {payslip.amountPaid < payslip.netSalary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await api.put(`/payslips/${payslip.id}/payment`, {
                                amountPaid: payslip.netSalary
                              });
                              queryClient.invalidateQueries({ queryKey: ['employee-payslips', selectedEmployeeForPayments?.id] });
                            } catch (error) {
                              console.error('Error processing payment:', error);
                            }
                          }}
                        >
                          Payer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Aucun bulletin trouvé pour cet employé</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdministratorDashboard;