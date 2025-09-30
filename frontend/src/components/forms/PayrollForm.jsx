import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { mockEmployees, payPeriodTypes } from '../../data/mockData';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';

const PayrollForm = ({ onSubmit, onCancel }) => {
  const { user } = useAuth();
  const employees = mockEmployees.filter(emp => emp.companyId === user.companyId && emp.status === 'active');
  
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    payDate: '',
    description: '',
    selectedEmployees: employees.map(emp => emp.id), // Select all by default
    payPeriod: 'monthly'
  });
  
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmployeeToggle = (employeeId, checked) => {
    setFormData(prev => ({
      ...prev,
      selectedEmployees: checked 
        ? [...prev.selectedEmployees, employeeId]
        : prev.selectedEmployees.filter(id => id !== employeeId)
    }));
  };

  const toggleAllEmployees = (checked) => {
    setFormData(prev => ({
      ...prev,
      selectedEmployees: checked ? employees.map(emp => emp.id) : []
    }));
  };

  const calculateTotalAmount = () => {
    const selectedEmps = employees.filter(emp => formData.selectedEmployees.includes(emp.id));
    return selectedEmps.reduce((total, emp) => {
      // Simple calculation based on pay period
      let periodMultiplier = 1;
      if (formData.payPeriod === 'weekly') periodMultiplier = 1/52;
      else if (formData.payPeriod === 'monthly') periodMultiplier = 1/12;
      else if (formData.payPeriod === 'daily') periodMultiplier = 1/365;
      
      return total + (emp.salary * periodMultiplier);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['name', 'startDate', 'endDate', 'payDate'];
    for (const field of requiredFields) {
      if (!formData[field]?.toString().trim()) {
        toast({
          title: "Validation Error",
          description: `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Date validation
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const payDate = new Date(formData.payDate);
    
    if (startDate >= endDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    if (payDate <= endDate) {
      toast({
        title: "Validation Error",
        description: "Pay date should be after the end date.",
        variant: "destructive",
      });
      return;
    }

    if (formData.selectedEmployees.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one employee.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would send this data to your API
    console.log('Payroll form submitted:', {
      ...formData,
      totalAmount: calculateTotalAmount(),
      employeeCount: formData.selectedEmployees.length
    });
    
    toast({
      title: "Payroll Cycle Created",
      description: `${formData.name} has been created successfully with ${formData.selectedEmployees.length} employees.`,
    });
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Payroll Cycle Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., March 2024 Payroll"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Optional description for this payroll cycle"
            rows={2}
          />
        </div>
      </div>

      {/* Dates and Period */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payDate">Pay Date *</Label>
          <Input
            id="payDate"
            type="date"
            value={formData.payDate}
            onChange={(e) => handleInputChange('payDate', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Pay Period Type</Label>
          <Select value={formData.payPeriod} onValueChange={(value) => handleInputChange('payPeriod', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select pay period" />
            </SelectTrigger>
            <SelectContent>
              {payPeriodTypes.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Select Employees</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="selectAll"
                checked={formData.selectedEmployees.length === employees.length}
                onCheckedChange={toggleAllEmployees}
              />
              <Label htmlFor="selectAll" className="text-sm font-normal cursor-pointer">
                Select All ({employees.length})
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-2 border border-border rounded">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`employee-${employee.id}`}
                    checked={formData.selectedEmployees.includes(employee.id)}
                    onCheckedChange={(checked) => handleEmployeeToggle(employee.id, checked)}
                  />
                  <div>
                    <Label htmlFor={`employee-${employee.id}`} className="font-medium cursor-pointer">
                      {employee.firstName} {employee.lastName}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {employee.position} • ${employee.salary.toLocaleString()}/year
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {formData.selectedEmployees.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Selected Employees:</span>
                <span className="font-semibold ml-2">{formData.selectedEmployees.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Estimated Total:</span>
                <span className="font-semibold ml-2">${calculateTotalAmount().toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
          Launch Payroll Cycle
        </Button>
      </div>
    </form>
  );
};

export default PayrollForm;