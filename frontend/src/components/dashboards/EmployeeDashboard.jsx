import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Download,
  DollarSign,
  Calendar,
  TrendingUp,
  Eye,
  User
} from 'lucide-react';
import { mockPayslips, mockEmployees, mockPayments } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [employee] = useState(mockEmployees.find(emp => emp.email === user.email));
  const [payslips] = useState(mockPayslips.filter(p => p.employeeId === employee?.id));
  const [payments] = useState(mockPayments.filter(p => payslips.some(ps => ps.id === p.payslipId)));

  const currentYear = new Date().getFullYear();
  const yearlyEarnings = payslips
    .filter(p => new Date(p.paidAt).getFullYear() === currentYear)
    .reduce((sum, p) => sum + p.netPay, 0);

  const stats = [
    {
      title: 'This Month\'s Pay',
      value: `$${payslips[payslips.length - 1]?.netPay?.toLocaleString() || '0'}`,
      change: 'Last payment',
      icon: DollarSign,
      color: 'text-primary'
    },
    {
      title: 'Yearly Earnings',
      value: `$${yearlyEarnings.toLocaleString()}`,
      change: `${currentYear} total`,
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      title: 'Payslips Available',
      value: payslips.length,
      change: 'Ready to view',
      icon: FileText,
      color: 'text-accent'
    },
    {
      title: 'Annual Salary',
      value: `$${employee?.salary?.toLocaleString() || '0'}`,
      change: 'Gross annual',
      icon: Calendar,
      color: 'text-muted-foreground'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'paid': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getPaymentInfo = (payslipId) => {
    return payments.find(p => p.payslipId === payslipId);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Employee Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {employee?.firstName} {employee?.lastName}
          </p>
        </div>
      </div>

      {/* Employee Info Card */}
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-3">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground text-lg font-medium">
              {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
            </div>
            <div>
              <h2>{employee?.firstName} {employee?.lastName}</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {employee?.position} • {employee?.department}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{employee?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{employee?.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hire Date</p>
              <p className="font-medium">{new Date(employee?.hireDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor('approved')}>
                {employee?.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
                View and download your payslip history
              </CardDescription>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payslips.map((payslip) => {
              const paymentInfo = getPaymentInfo(payslip.id);
              
              return (
                <div
                  key={payslip.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                      <FileText className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Payslip #{payslip.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Net Pay: ${payslip.netPay.toLocaleString()} • Gross Pay: ${payslip.grossPay.toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <Badge className={getStatusColor(payslip.status)}>
                          {payslip.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {paymentInfo ? `Paid: ${new Date(paymentInfo.paymentDate).toLocaleDateString()}` : 'Payment pending'}
                        </span>
                        {paymentInfo && (
                          <span className="text-xs text-muted-foreground">
                            Ref: {paymentInfo.reference}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;