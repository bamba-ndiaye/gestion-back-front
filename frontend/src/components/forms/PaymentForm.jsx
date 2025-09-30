import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { paymentMethods, mockEmployees } from '../../data/mockData';
import { useToast } from '../../hooks/use-toast';
import { DollarSign, User } from 'lucide-react';

const PaymentForm = ({ payslip, onSubmit, onCancel }) => {
  const employee = payslip ? mockEmployees.find(emp => emp.id === payslip.employeeId) : null;
  
  const [formData, setFormData] = useState({
    amount: payslip?.netPay || 0,
    paymentMethod: 'bank_transfer',
    reference: '',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReference = () => {
    const method = formData.paymentMethod;
    const prefix = method === 'bank_transfer' ? 'TXN' : 
                  method === 'check' ? 'CHK' : 
                  method === 'cash' ? 'CSH' : 'PAY';
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(6, '0');
    const ref = `${prefix}${randomNum}`;
    
    handleInputChange('reference', ref);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid payment amount.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.amount) !== payslip?.netPay) {
      toast({
        title: "Amount Mismatch",
        description: `Payment amount must match the net pay amount of $${payslip?.netPay?.toLocaleString()}.`,
        variant: "destructive",
      });
      return;
    }

    if (!formData.reference.trim()) {
      toast({
        title: "Validation Error",
        description: "Payment reference is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.paymentDate) {
      toast({
        title: "Validation Error",
        description: "Payment date is required.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would send this data to your API
    console.log('Payment form submitted:', {
      ...formData,
      payslipId: payslip?.id,
      employeeId: payslip?.employeeId
    });
    
    toast({
      title: "Payment Recorded",
      description: `Payment of $${formData.amount.toLocaleString()} has been recorded successfully.`,
    });
    
    onSubmit(formData);
  };

  if (!payslip || !employee) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No payslip selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Employee and Payslip Info */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Payment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Employee:</span>
              <p className="font-semibold">{employee.firstName} {employee.lastName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Position:</span>
              <p className="font-semibold">{employee.position}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Gross Pay:</span>
              <p className="font-semibold">${payslip.grossPay.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Net Pay:</span>
              <p className="font-semibold text-primary">${payslip.netPay.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Payment Amount *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="Enter payment amount"
              className="pl-10"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label>Payment Method *</Label>
          <Select 
            value={formData.paymentMethod} 
            onValueChange={(value) => handleInputChange('paymentMethod', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Date */}
        <div className="space-y-2">
          <Label htmlFor="paymentDate">Payment Date *</Label>
          <Input
            id="paymentDate"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => handleInputChange('paymentDate', e.target.value)}
            required
          />
        </div>

        {/* Reference */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="reference">Payment Reference *</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={generateReference}
            >
              Generate
            </Button>
          </div>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => handleInputChange('reference', e.target.value)}
            placeholder="Enter payment reference/transaction ID"
            required
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Optional payment notes"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-success to-success/80">
            Record Payment
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;