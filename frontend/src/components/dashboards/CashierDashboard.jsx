import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  DollarSign, 
  Plus, 
  Receipt,
  CreditCard,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { mockPayslips, mockPayments, mockEmployees } from '../../data/mockData';
import PaymentForm from '../forms/PaymentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useAuth } from '../../context/AuthContext';

const CashierDashboard = () => {
  const { user } = useAuth();
  const [payslips] = useState(mockPayslips);
  const [payments] = useState(mockPayments);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const stats = [
    {
      title: 'Pending Payments',
      value: payslips.filter(p => !payments.find(pay => pay.payslipId === p.id)).length,
      change: 'Ready for processing',
      icon: Clock,
      color: 'text-warning'
    },
    {
      title: 'Completed Today',
      value: payments.filter(p => p.paymentDate === new Date().toISOString().split('T')[0]).length,
      change: '+3 from yesterday',
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      title: 'Total Processed',
      value: `$${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`,
      change: 'This month',
      icon: DollarSign,
      color: 'text-primary'
    },
    {
      title: 'Success Rate',
      value: '100%',
      change: 'No failed payments',
      icon: TrendingUp,
      color: 'text-success'
    }
  ];

  const handleRecordPayment = (payslip) => {
    setSelectedPayslip(payslip);
    setShowPaymentForm(true);
  };

  const getPaymentStatus = (payslipId) => {
    const payment = payments.find(p => p.payslipId === payslipId);
    return payment ? payment.status : 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'failed': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getEmployee = (employeeId) => {
    return mockEmployees.find(emp => emp.id === employeeId);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cashier Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Record payments and manage payment processing
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="payslips" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="payslips" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Employee Payslips</CardTitle>
                  <CardDescription>
                    Process payments for approved payslips
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {payslips.length} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payslips.map((payslip) => {
                  const employee = getEmployee(payslip.employeeId);
                  const paymentStatus = getPaymentStatus(payslip.id);
                  
                  return (
                    <div
                      key={payslip.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {employee?.firstName} {employee?.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Net Pay: ${payslip.netPay.toLocaleString()}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={getStatusColor(paymentStatus)}>
                              {paymentStatus}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Gross: ${payslip.grossPay.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {paymentStatus === 'pending' ? (
                          <Button 
                            size="sm"
                            onClick={() => handleRecordPayment(payslip)}
                            className="bg-gradient-to-r from-success to-success/80"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Record Payment
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Receipt className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Payment History</CardTitle>
                  <CardDescription>
                    View all processed payments and generate reports
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => {
                  const payslip = payslips.find(p => p.id === payment.payslipId);
                  const employee = payslip ? getEmployee(payslip.employeeId) : null;
                  
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gradient-to-br from-success to-success/80 rounded-lg">
                          <CreditCard className="h-6 w-6 text-success-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {employee?.firstName} {employee?.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ${payment.amount.toLocaleString()} • {payment.paymentMethod.replace('_', ' ')}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Ref: {payment.reference}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Receipt className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Form */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Process payment for the selected payslip and record transaction details.
            </DialogDescription>
          </DialogHeader>
          <PaymentForm 
            payslip={selectedPayslip}
            onSubmit={() => setShowPaymentForm(false)}
            onCancel={() => setShowPaymentForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashierDashboard;