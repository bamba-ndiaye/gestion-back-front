import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock, UserCheck, UserX, AlertTriangle, Minus } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

const AttendanceForm = ({ onSubmit, onCancel, employeeId, date }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Si employeeId n'est pas fourni, utiliser celui de l'utilisateur connecté (pour auto-pointage)
  const targetEmployeeId = employeeId || user?.id;

  const [formData, setFormData] = useState({
    employeeId: targetEmployeeId,
    date: date || new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'PRESENT',
    notes: ''
  });

  // Récupérer les informations de l'employé
  const { data: employee } = useQuery({
    queryKey: ['employee', targetEmployeeId],
    queryFn: async () => {
      const response = await api.get(`/employees/${targetEmployeeId}`);
      return response.data;
    },
    enabled: !!targetEmployeeId
  });

  // Vérifier s'il y a déjà un pointage pour cette date
  const { data: existingAttendance } = useQuery({
    queryKey: ['attendance', targetEmployeeId, formData.date],
    queryFn: async () => {
      const response = await api.get(`/attendance/employee/${targetEmployeeId}?startDate=${formData.date}&endDate=${formData.date}`);
      return response.data?.[0] || null;
    },
    enabled: !!targetEmployeeId && !!formData.date
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuickAction = (action) => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); // HH:MM format

    if (action === 'checkIn') {
      setFormData(prev => ({
        ...prev,
        checkIn: timeString,
        status: 'PRESENT'
      }));
    } else if (action === 'checkOut') {
      setFormData(prev => ({
        ...prev,
        checkOut: timeString
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const attendanceData = {
        ...formData,
        checkIn: formData.checkIn ? new Date(`${formData.date}T${formData.checkIn}`).toISOString() : null,
        checkOut: formData.checkOut ? new Date(`${formData.date}T${formData.checkOut}`).toISOString() : null
      };

      if (existingAttendance) {
        // Mettre à jour
        await api.put(`/attendance/${existingAttendance.id}`, attendanceData);
        toast({
          title: "Attendance Updated",
          description: "Attendance record has been updated successfully.",
        });
      } else {
        // Créer
        await api.post('/attendance', attendanceData);
        toast({
          title: "Attendance Recorded",
          description: "Attendance has been recorded successfully.",
        });
      }

      onSubmit && onSubmit(attendanceData);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'ABSENT': return <UserX className="h-4 w-4 text-red-600" />;
      case 'LATE': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'HALF_DAY': return <Minus className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'text-green-600 bg-green-50 border-green-200';
      case 'ABSENT': return 'text-red-600 bg-red-50 border-red-200';
      case 'LATE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HALF_DAY': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employee Info */}
      {employee && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground text-lg font-medium">
                {employee.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">{employee.service}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          required
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleQuickAction('checkIn')}
              className="flex items-center space-x-2"
            >
              <UserCheck className="h-4 w-4" />
              <span>Check In Now</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleQuickAction('checkOut')}
              className="flex items-center space-x-2"
            >
              <UserX className="h-4 w-4" />
              <span>Check Out Now</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="checkIn">Check In Time</Label>
          <Input
            id="checkIn"
            type="time"
            value={formData.checkIn}
            onChange={(e) => handleInputChange('checkIn', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkOut">Check Out Time</Label>
          <Input
            id="checkOut"
            type="time"
            value={formData.checkOut}
            onChange={(e) => handleInputChange('checkOut', e.target.value)}
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
          <SelectTrigger>
            <SelectValue>
              <div className="flex items-center space-x-2">
                {getStatusIcon(formData.status)}
                <span>{formData.status.replace('_', ' ')}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PRESENT">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span>PRESENT</span>
              </div>
            </SelectItem>
            <SelectItem value="ABSENT">
              <div className="flex items-center space-x-2">
                <UserX className="h-4 w-4 text-red-600" />
                <span>ABSENT</span>
              </div>
            </SelectItem>
            <SelectItem value="LATE">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>LATE</span>
              </div>
            </SelectItem>
            <SelectItem value="HALF_DAY">
              <div className="flex items-center space-x-2">
                <Minus className="h-4 w-4 text-orange-600" />
                <span>HALF DAY</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Optional notes about this attendance record"
          rows={3}
        />
      </div>

      {/* Existing Attendance Info */}
      {existingAttendance && (
        <Card className={`border-2 ${getStatusColor(existingAttendance.status)}`}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(existingAttendance.status)}
              <span className="font-medium">Existing Record Found</span>
            </div>
            <p className="text-sm">
              Check In: {existingAttendance.checkIn ? new Date(existingAttendance.checkIn).toLocaleTimeString() : 'N/A'} |
              Check Out: {existingAttendance.checkOut ? new Date(existingAttendance.checkOut).toLocaleTimeString() : 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This will update the existing attendance record.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
          {existingAttendance ? 'Update Attendance' : 'Record Attendance'}
        </Button>
      </div>
    </form>
  );
};

export default AttendanceForm;