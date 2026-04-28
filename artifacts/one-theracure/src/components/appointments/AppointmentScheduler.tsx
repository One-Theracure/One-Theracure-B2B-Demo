
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, User, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  date: Date;
  time: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

const AppointmentScheduler = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      patientName: 'John Doe',
      patientPhone: '+1-555-0123',
      patientEmail: 'john@example.com',
      date: new Date(),
      time: '10:00',
      duration: 30,
      type: 'Consultation',
      status: 'confirmed',
      notes: 'Follow-up for hypertension'
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      patientPhone: '+1-555-0124',
      patientEmail: 'jane@example.com',
      date: new Date(),
      time: '14:30',
      duration: 45,
      type: 'Check-up',
      status: 'scheduled',
      notes: 'Annual physical examination'
    }
  ]);

  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    date: undefined as Date | undefined,
    time: '',
    duration: 30,
    type: '',
    notes: ''
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const appointmentTypes = [
    'Consultation', 'Follow-up', 'Check-up', 'Emergency', 'Telemedicine'
  ];

  const handleAddAppointment = () => {
    if (newAppointment.patientName && newAppointment.date && newAppointment.time) {
      const appointment: Appointment = {
        id: Date.now().toString(),
        ...newAppointment,
        date: newAppointment.date!,
        status: 'scheduled'
      };
      setAppointments([...appointments, appointment]);
      setNewAppointment({
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        date: undefined,
        time: '',
        duration: 30,
        type: '',
        notes: ''
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/15 text-blue-700 dark:text-blue-300';
      case 'confirmed': return 'bg-green-500/15 text-green-700 dark:text-green-300';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'cancelled': return 'bg-red-500/15 text-red-700 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const todaysAppointments = appointments.filter(apt => 
    apt.date.toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule New Appointment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Schedule Appointment</span>
            </CardTitle>
            <CardDescription>Book a new patient appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={newAppointment.patientName}
                  onChange={(e) => setNewAppointment({...newAppointment, patientName: e.target.value})}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <Label htmlFor="patientPhone">Phone</Label>
                <Input
                  id="patientPhone"
                  value={newAppointment.patientPhone}
                  onChange={(e) => setNewAppointment({...newAppointment, patientPhone: e.target.value})}
                  placeholder="+1-555-0123"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="patientEmail">Email</Label>
              <Input
                id="patientEmail"
                type="email"
                value={newAppointment.patientEmail}
                onChange={(e) => setNewAppointment({...newAppointment, patientEmail: e.target.value})}
                placeholder="patient@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newAppointment.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newAppointment.date ? format(newAppointment.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newAppointment.date}
                      onSelect={(date) => setNewAppointment({...newAppointment, date})}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Time</Label>
                <Select value={newAppointment.time} onValueChange={(time) => setNewAppointment({...newAppointment, time})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={newAppointment.type} onValueChange={(type) => setNewAppointment({...newAppointment, type})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Duration (minutes)</Label>
                <Select value={newAppointment.duration.toString()} onValueChange={(duration) => setNewAppointment({...newAppointment, duration: parseInt(duration)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="appointmentNotes">Notes</Label>
              <Textarea
                id="appointmentNotes"
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <Button onClick={handleAddAppointment} className="w-full">
              Schedule Appointment
            </Button>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Today's Schedule</span>
            </CardTitle>
            <CardDescription>{format(new Date(), "EEEE, MMMM d, yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No appointments scheduled for today</p>
              ) : (
                todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">{appointment.time}</div>
                      <div>
                        <div className="font-medium">{appointment.patientName}</div>
                        <div className="text-sm text-muted-foreground">{appointment.type}</div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>Manage all scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{appointment.patientName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{format(appointment.date, "MMM d")}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{appointment.time}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{appointment.type}</Badge>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentScheduler;
