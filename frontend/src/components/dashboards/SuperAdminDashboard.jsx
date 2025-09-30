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
import { api } from "../../lib/api";
import CompanyForm from "../forms/CompanyForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

const SuperAdminDashboard = () => {
  const queryClient = useQueryClient();
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

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


  const stats = [
    {
      title: "Total Companies",
      value: companies.length,
      change: "+2 this month",
      icon: Building2,
      color: "text-primary",
    },
    {
      title: "Active Users",
      value: "47",
      change: "+12% from last month",
      icon: Users,
      color: "text-warning",
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "All systems operational",
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

      {/* Main Content */}
      <div className="space-y-6">
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
                        <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                          <Building2 className="h-6 w-6 text-primary-foreground" />
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
        </div>

      {/* Company Form Dialog */}
      <Dialog open={showCompanyForm} onOpenChange={setShowCompanyForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? "Edit Company" : "Create New Company"}
            </DialogTitle>
          </DialogHeader>
          <CompanyForm
            company={selectedCompany}
            onSubmit={handleCompanySubmit}
            onCancel={() => setShowCompanyForm(false)}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default SuperAdminDashboard;
