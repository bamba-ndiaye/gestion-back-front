import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Upload, X } from 'lucide-react';
import { currencies, payPeriodTypes } from '../../data/mockData';
import { useToast } from '../../hooks/use-toast';
import { api } from '../../lib/api';

const CompanyForm = ({ company, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    address: company?.address || '',
    currency: company?.currency || 'USD',
    payPeriod: company?.payPeriod || 'monthly',
    logo: company?.logo || null
  });
  
  const [logoPreview, setLogoPreview] = useState(company?.logo || null);
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PNG or JPG image.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          logo: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({
      ...prev,
      logo: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.address.trim()) {
      toast({
        title: "Validation Error",
        description: "Company address is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      let response;

      if (company) {
        // Update existing company
        response = await api.put(`/companies/${company.id}`, {
          name: formData.name,
          address: formData.address
        });
      } else {
        // Create new company
        response = await api.post('/companies', {
          name: formData.name,
          address: formData.address
        });
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
        title: company ? "Company Updated" : "Company Created",
        description: `${formData.name} has been ${company ? 'updated' : 'created'} successfully.`,
      });

      onSubmit(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save company. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>Company Logo</Label>
        <div className="flex items-start space-x-4">
          {logoPreview ? (
            <div className="relative">
              <img 
                src={logoPreview} 
                alt="Company logo preview" 
                className="h-20 w-20 object-cover rounded-lg border border-border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeLogo}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="h-20 w-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1">
            <input
              id="logo"
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('logo').click()}
            >
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
            </Button>
            <p className="text-sm text-muted-foreground mt-1">
              PNG or JPG format, max 2MB
            </p>
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Company Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter company name"
          required
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter company address"
          rows={3}
          required
        />
      </div>

      {/* Currency and Pay Period */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* Admin Account Info */}
      {!company && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Admin Account</h3>
            <p className="text-sm text-muted-foreground">
              An administrator account will be automatically created with default credentials:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Email: admin@{formData.name.toLowerCase().replace(/\s+/g, '')}.com</li>
              <li>• Password: admin123 (can be changed after login)</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
          {company ? 'Update Company' : 'Create Company'}
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;