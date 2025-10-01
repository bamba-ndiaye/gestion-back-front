import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { employeeStatuses } from '../../data/mockData';
import { useToast } from '../../hooks/use-toast';
import { api } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';

const EmployeeForm = ({ employee, companyId, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    telephone: employee?.telephone || '',
    service: employee?. service || '',
    email: employee?.email || '',
    ...(user?.role === 'SUPER_ADMIN' && { companyId: employee?.companyId || '' })
  });

  // Fetch companies for the dropdown (only for SUPER_ADMIN)
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data || [];
    },
    enabled: user?.role === 'SUPER_ADMIN'
  });

  // Set default companyId
  React.useEffect(() => {
    if (companyId) {
      setFormData(prev => ({ ...prev, companyId: companyId.toString() }));
    } else if (user?.role === 'SUPER_ADMIN' && companies.length > 0) {
      setFormData(prev => ({ ...prev, companyId: companies[0].id.toString() }));
    }
  }, [companies, user?.role, companyId]);


  
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const requiredFields = ['firstName', 'lastName', 'telephone', 'service', 'email'];
    if (user?.role === 'SUPER_ADMIN') {
      requiredFields.push('companyId');
    }
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const companyId = user?.role === 'SUPER_ADMIN' ? parseInt(formData.companyId) : undefined;
      if (user?.role === 'SUPER_ADMIN' && (isNaN(companyId) || companyId <= 0)) {
        toast({
          title: "Validation Error",
          description: "Please select a valid company.",
          variant: "destructive",
        });
        return;
      }

      const employeeData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        telephone: formData.telephone,
        service: formData.service,
        ...(companyId !== undefined && { companyId })
      };

      let response;
      if (employee) {
        // Update existing employee
        response = await api.put(`/employees/${employee.id}`, employeeData);
      } else {
        // Create new employee
        response = await api.post('/employees', employeeData);
      }

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: employee ? "Employee Updated" : "Employee Added",
        description: `${formData.firstName} ${formData.lastName} has been ${employee ? 'updated' : 'added'} successfully.`,
      });

      onSubmit(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter first name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        <Label htmlFor="telephone">Telephone *</Label>
        <Input
          id="telephone"
          value={formData.telephone}
          onChange={(e) => handleInputChange('telephone', e.target.value)}
          placeholder="Enter telephone number"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="service">Service *</Label>
        <Input
          id="service"
          value={formData.service}
          onChange={(e) => handleInputChange('service', e.target.value)}
          placeholder="Enter service"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter email address"
          required
        />
      </div>

      {/* Company Selection - Hidden for SUPER_ADMIN as it's auto-selected */}
      {false && user?.role === 'SUPER_ADMIN' && companies.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor="companyId">Company *</Label>
          <Select value={formData.companyId} onValueChange={(value) => handleInputChange('companyId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
          {employee ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;