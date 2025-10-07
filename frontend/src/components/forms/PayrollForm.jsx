import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { payPeriodTypes } from '../../data/mockData';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

const PayrollForm = ({ onSubmit, onCancel, companyId }) => {
  const { user } = useAuth();

  const currentCompanyId = companyId || user?.companyId;

  // Fetch real employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', currentCompanyId],
    queryFn: async () => {
      const response = await api.get(`/employees?companyId=${currentCompanyId}`);
      return response.data || [];
    },
    enabled: !!currentCompanyId
  });

  const activeEmployees = employees.filter(emp => emp.isActive);

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    payDate: '',
    description: '',
    selectionMode: 'all', // 'all' or 'specific'
    selectedEmployees: [], // Will be set when employees load
    payPeriod: 'monthly'
  });


  // Update selectedEmployees when employees load or selection mode changes
  React.useEffect(() => {
    if (activeEmployees.length > 0) {
      if (formData.selectionMode === 'all') {
        setFormData(prev => ({
          ...prev,
          selectedEmployees: activeEmployees.map(emp => emp.id)
        }));
      } else if (formData.selectionMode === 'specific' && formData.selectedEmployees.length === 0) {
        // Keep empty for specific selection
        setFormData(prev => ({
          ...prev,
          selectedEmployees: []
        }));
      }
    }
  }, [activeEmployees, formData.selectionMode]);
  
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectionModeChange = (mode) => {
    setFormData(prev => ({
      ...prev,
      selectionMode: mode,
      selectedEmployees: mode === 'all' ? activeEmployees.map(emp => emp.id) : []
    }));
  };

  const handleEmployeeToggle = (employeeId, checked) => {
    if (formData.selectionMode === 'specific') {
      setFormData(prev => ({
        ...prev,
        selectedEmployees: checked
          ? [...prev.selectedEmployees, employeeId]
          : prev.selectedEmployees.filter(id => id !== employeeId)
      }));
    }
  };

  const calculateTotalAmount = () => {
    const selectedEmps = activeEmployees.filter(emp => formData.selectedEmployees.includes(emp.id));
    return selectedEmps.reduce((total, emp) => {
      // Simple calculation based on pay period
      let periodMultiplier = 1;
      if (formData.payPeriod === 'weekly') periodMultiplier = 1/52;
      else if (formData.payPeriod === 'monthly') periodMultiplier = 1/12;
      else if (formData.payPeriod === 'daily') periodMultiplier = 1/365;

      return total + (1000 * periodMultiplier); // Using fixed salary for now
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

    if (formData.selectionMode === 'specific' && formData.selectedEmployees.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one employee.",
        variant: "destructive",
      });
      return;
    }

    // Create PayRun first
    api.post('/payruns', {
      month: new Date(formData.startDate).getMonth() + 1,
      year: new Date(formData.startDate).getFullYear(),
      startDate: formData.startDate,
      endDate: formData.endDate
    }).then((payRunResponse) => {
      const payRunId = payRunResponse.data.id;

      // Generate payslips for the PayRun
      return api.post(`/payslips/generate/${payRunId}`);
    }).then(() => {
      toast({
        title: "Payroll Cycle Created",
        description: `${formData.name} has been created successfully with ${formData.selectedEmployees.length} employees.`,
      });

      onSubmit(formData);
    }).catch((error) => {
      console.error('Error creating payroll:', error);
      toast({
        title: "Error",
        description: "Failed to create payroll cycle. Please try again.",
        variant: "destructive",
      });
    });
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
          <CardTitle className="text-lg">Select Employees</CardTitle>
          <CardDescription>Choose how to select employees for this payroll cycle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Mode */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="selectAll"
                name="selectionMode"
                value="all"
                checked={formData.selectionMode === 'all'}
                onChange={(e) => handleSelectionModeChange(e.target.value)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <Label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
                All Employees ({activeEmployees.length})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="selectSpecific"
                name="selectionMode"
                value="specific"
                checked={formData.selectionMode === 'specific'}
                onChange={(e) => handleSelectionModeChange(e.target.value)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
              />
              <Label htmlFor="selectSpecific" className="text-sm font-medium cursor-pointer">
                Select Specific Employees
              </Label>
            </div>
          </div>

          {/* Employee List for Specific Selection */}
          {formData.selectionMode === 'specific' && (
            <div className="space-y-3 max-h-96 overflow-y-auto border-t pt-4">
              {isLoading ? (
                <div className="text-center py-4">Loading employees...</div>
              ) : activeEmployees.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No active employees found</div>
              ) : (
                activeEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-2 border border-border rounded">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`employee-${employee.id}`}
                        checked={formData.selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => handleEmployeeToggle(employee.id, checked)}
                      />
                      <div>
                        <Label htmlFor={`employee-${employee.id}`} className="font-medium cursor-pointer">
                          {employee.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {employee.service} • $1000/year
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {(formData.selectionMode === 'all' || formData.selectedEmployees.length > 0) && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Selected Employees:</span>
                <span className="font-semibold ml-2">
                  {formData.selectionMode === 'all' ? activeEmployees.length : formData.selectedEmployees.length}
                </span>
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