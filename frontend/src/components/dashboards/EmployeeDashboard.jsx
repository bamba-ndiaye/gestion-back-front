import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { FileText, DollarSign, Calendar, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  // Fetch employee payslips
  const { data: payslips = [], isLoading, error } = useQuery({
    queryKey: ['employee-payslips', user?.id],
    queryFn: async () => {
      const response = await api.get(`/payslips/employee/${user.id}`);
      return response.data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate total earnings
  const totalEarnings = payslips.reduce((sum, payslip) => sum + (payslip.netSalary || 0), 0);
  const paidAmount = payslips.reduce((sum, payslip) => sum + (payslip.amountPaid || 0), 0);

  const stats = [
    {
      title: 'Total Payslips',
      value: payslips.length,
      change: 'All time',
      icon: FileText,
      color: 'text-primary'
    },
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toLocaleString()}`,
      change: 'Gross salary',
      icon: DollarSign,
      color: 'text-success'
    },
    {
      title: 'Amount Paid',
      value: `$${paidAmount.toLocaleString()}`,
      change: `${((paidAmount / totalEarnings) * 100 || 0).toFixed(1)}% received`,
      icon: Calendar,
      color: 'text-warning'
    },
    {
      title: 'Pending Payment',
      value: `$${(totalEarnings - paidAmount).toLocaleString()}`,
      change: 'Outstanding',
      icon: Download,
      color: 'text-muted-foreground'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Employee Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            View your payslips and payment history
          </p>
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

      {/* Payslips List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">My Payslips</CardTitle>
              <CardDescription>
                Your salary slips and payment records
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {payslips.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading payslips...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-destructive">Error loading payslips</div>
            </div>
          ) : payslips.length > 0 ? (
            <div className="space-y-4">
              {payslips.map((payslip) => (
                <div
                  key={payslip.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                      <FileText className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Payslip #{payslip.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {payslip.payRun ? `${payslip.payRun.month}/${payslip.payRun.year}` : 'N/A'}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm">
                          Net Salary: ${payslip.netSalary?.toLocaleString() || '0'}
                        </span>
                        <span className="text-sm">
                          Paid: ${payslip.amountPaid?.toLocaleString() || '0'}
                        </span>
                        <Badge variant={payslip.amountPaid >= payslip.netSalary ? "default" : "secondary"} className="text-xs">
                          {payslip.amountPaid >= payslip.netSalary ? 'Fully Paid' : 'Partial Payment'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(payslip.createdAt).toLocaleDateString()}
                    </p>
                    {payslip.generatedPdfUrl && (
                      <a
                        href={`http://localhost:3000${payslip.generatedPdfUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No payslips found</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;