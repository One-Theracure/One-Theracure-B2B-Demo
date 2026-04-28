
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/types/patient";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Patient) => void;
}

const AddPatientModal = ({ isOpen, onClose, onAddPatient }: AddPatientModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    mrn: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    bloodGroup: "",
    allergies: "",
    specialty: "",
    chronicConditions: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateMRN = () => {
    return `MRN${Date.now().toString().slice(-6)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.gender || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newPatient: Patient = {
      id: `patient_${Date.now()}`,
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      mrn: formData.mrn || generateMRN(),
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      emergencyContact: formData.emergencyContact,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
      chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map(c => c.trim()) : [],
      lastVisit: new Date().toISOString(),
      totalVisits: 0,
      specialty: formData.specialty || "General Medicine",
      status: "Active",
      recentVisits: []
    };

    onAddPatient(newPatient);
    toast({
      title: "Success",
      description: `Patient ${formData.name} has been added successfully`
    });

    // Reset form
    setFormData({
      name: "",
      age: "",
      gender: "",
      mrn: "",
      phone: "",
      email: "",
      address: "",
      emergencyContact: "",
      bloodGroup: "",
      allergies: "",
      specialty: "",
      chronicConditions: ""
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter patient name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="Enter age"
                min="0"
                max="150"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mrn">MRN</Label>
              <Input
                id="mrn"
                value={formData.mrn}
                onChange={(e) => handleInputChange("mrn", e.target.value)}
                placeholder="Leave blank to auto-generate"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange("bloodGroup", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Select value={formData.specialty} onValueChange={(value) => handleInputChange("specialty", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Medicine">General Medicine</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="Gynecology">Gynecology</SelectItem>
                  <SelectItem value="Oncology">Oncology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter full address"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
              placeholder="Emergency contact number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies (comma-separated)</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => handleInputChange("allergies", e.target.value)}
              placeholder="e.g., Penicillin, Peanuts, Latex"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chronicConditions">Chronic Conditions (comma-separated)</Label>
            <Input
              id="chronicConditions"
              value={formData.chronicConditions}
              onChange={(e) => handleInputChange("chronicConditions", e.target.value)}
              placeholder="e.g., Diabetes, Hypertension"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Patient
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientModal;
