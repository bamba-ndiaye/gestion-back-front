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
  CreditCard
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
  const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = useState(false);
  const [showCompanyDetailsModal, setShowCompanyDetailsModal] = useState(false);
  const [showEmployeePaymentsModal, setShowEmployeePaymentsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState(null);
  const [selectedEmployeeForPayments, setSelectedEmployeeForPayments] = useState(null);

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
    },
    {
      title: 'Validated Cycles',
      value: payrollCycles.filter(c => c.status === 'VALIDATED').length,
      change: 'Ready for payment',
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
      <div className="flex justify-between items-center">
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
                        <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
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
          </DialogHeader>
          <PayrollForm
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
              Informations complètes sur l'employé
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
              Informations complètes sur l'entreprise
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
              Historique des bulletins de salaire et paiements
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