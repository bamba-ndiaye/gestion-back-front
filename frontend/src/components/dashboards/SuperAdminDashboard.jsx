import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Building2,
  Users,
  Plus,
  Settings,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { api } from "../../lib/api";
import CompanyForm from "../forms/CompanyForm";
import EmployeeForm from "../forms/EmployeeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
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

const SuperAdminDashboard = () => {
  const queryClient = useQueryClient();
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch companies from API
  const {
    data: companies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await api.get("/companies");
      return response.data || [];
    },
  });

  // Fetch employees from API for SUPER_ADMIN (no companyId filter)
  const {
    data: employees = [],
    isLoading: employeesLoading,
    error: employeesError,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await api.get("/employees");
      return response.data || [];
    },
  });

  // Fetch users from API for SUPER_ADMIN
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/users");
      return response.data || [];
    },
  });


  const stats = [
    {
      title: "Total Companies",
      value: companies.length,
      change: `${companies.filter(c => c.isActive).length} active`,
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Total Employees",
      value: employees.length,
      change: `${employees.filter(e => e.isActive).length} active`,
      icon: Users,
      color: "text-success",
    },
    {
      title: "Active Users",
      value: users.length,
      change: "System users",
      icon: Users,
      color: "text-warning",
    },
    {
      title: "System Health",
      value: "99.9%",
      change: `${companies.length + employees.length + users.length} total records`,
      icon: TrendingUp,
      color: "text-success",
    },
  ];

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setShowCompanyForm(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setShowCompanyForm(true);
  };

  const handleCompanySubmit = (updatedCompany) => {
    // Invalidate and refetch companies
    queryClient.invalidateQueries({ queryKey: ["companies"] });
    setShowCompanyForm(false);
    setSelectedCompany(null);
  };


  const handleViewCompanyDetails = async (companyId) => {
    // Redirect to admin dashboard with company filter for SUPER_ADMIN
    window.location.href = `/admin?companyId=${companyId}`;
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        const response = await api.delete(`/companies/${companyId}`);
        if (response.error) {
          console.error("Error deleting company:", response.error);
          // You could show a toast here
        } else {
          // Invalidate and refetch companies
          queryClient.invalidateQueries({ queryKey: ["companies"] });
        }
      } catch (error) {
        console.error("Error deleting company:", error);
      }
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const response = await api.delete(`/employees/${employeeId}`);
      if (response.error) {
        console.error("Error deleting employee:", response.error);
        // You could show a toast here
      } else {
        // Invalidate and refetch employees
        queryClient.invalidateQueries({ queryKey: ["employees"] });
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  // Employee handlers for SUPER_ADMIN
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
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage all companies and system-wide settings
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleCreateEmployee} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          <Button
            onClick={handleCreateCompany}
            className="bg-gradient-to-r from-primary to-accent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
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
      <Tabs defaultValue="companies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Companies</CardTitle>
                  <CardDescription>
                    Manage all registered companies in the system
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {companies.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-muted-foreground">
                    Loading companies...
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-destructive">
                    Error loading companies
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: company.color || '#007bff' }}
                          ></div>
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{company.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {company.address}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCompanyDetails(company.id)}
                          title="View Company Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCompany(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCompany(company.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Employees</CardTitle>
                  <CardDescription>
                    Manage all employees across all companies
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {employees.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {employeesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-pulse text-muted-foreground">
                    Loading employees...
                  </div>
                </div>
              ) : employeesError ? (
                <div className="text-center py-8">
                  <div className="text-destructive">
                    Error loading employees
                  </div>
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
                          {employee.name
                            .split(" ")
                            .map((n) => n.charAt(0))
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {employee.email}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge
                              variant={
                                employee.isActive ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {employee.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Joined{" "}
                              {new Date(
                                employee.createdAt
                              ).toLocaleDateString()}
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
      </Tabs>

      {/* Company Form Dialog */}
      <Dialog open={showCompanyForm} onOpenChange={setShowCompanyForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? "Edit Company" : "Create New Company"}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany ? "Update the company information and settings." : "Fill in the details to create a new company in the system."}
            </DialogDescription>
          </DialogHeader>
          <CompanyForm
            company={selectedCompany}
            onSubmit={handleCompanySubmit}
            onCancel={() => setShowCompanyForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Employee Form Dialog */}
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee ? "Update the employee's information and salary details." : "Fill in the details to add a new employee to the system."}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            employee={selectedEmployee}
            onSubmit={handleEmployeeSubmit}
            onCancel={() => setShowEmployeeForm(false)}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SuperAdminDashboard;
