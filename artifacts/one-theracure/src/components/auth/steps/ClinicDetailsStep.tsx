
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Clock, IndianRupee, Copy, User, Stethoscope } from "lucide-react";
import { SignUpData } from "../SignUpFlow";

interface ClinicDetailsStepProps {
  data: SignUpData;
  updateData: (updates: Partial<SignUpData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ClinicDetailsStep = ({ data, updateData, onNext, onPrev }: ClinicDetailsStepProps) => {
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const specialties = [
    "General Medicine", "Cardiology", "Neurology", "Orthopedics", 
    "Pediatrics", "Gynecology", "Dermatology", "Psychiatry", 
    "Oncology", "Gastroenterology", "Pulmonology", "Endocrinology"
  ];

  const languages = [
    "English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", 
    "Bengali", "Marathi", "Gujarati", "Punjabi", "Urdu", "Odia"
  ];

  const updateConsultationMode = (mode: string, checked: boolean) => {
    const modes = checked 
      ? [...data.consultationModes, mode]
      : data.consultationModes.filter(m => m !== mode);
    updateData({ consultationModes: modes });
  };

  const updateWorkingHours = (day: string, field: 'start' | 'end' | 'isWorking', value: string | boolean) => {
    updateData({
      workingHours: {
        ...data.workingHours,
        [day]: {
          ...data.workingHours[day],
          [field]: value
        }
      }
    });
  };

  const copyMondayToFriday = () => {
    const mondayHours = data.workingHours.monday;
    const updatedHours = { ...data.workingHours };
    
    ['tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
      updatedHours[day] = { ...mondayHours };
    });
    
    updateData({ workingHours: updatedHours });
  };

  const updateLanguages = (language: string) => {
    const languages = data.languagesSpoken.includes(language)
      ? data.languagesSpoken.filter(l => l !== language)
      : [...data.languagesSpoken, language];
    updateData({ languagesSpoken: languages });
  };

  const isStepValid = () => {
    return (
      data.clinicName &&
      data.clinicAddress &&
      data.consultationModes.length > 0 &&
      (data.consultationModes.includes('In-Person') ? data.consultationFees.inPerson : true) &&
      (data.consultationModes.includes('Teleconsultation') ? data.consultationFees.teleconsultation : true)
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-playfair font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
          Doctor Profile & Clinic Details
        </h2>
        <p className="text-muted-foreground font-inter mt-2">
          Complete your professional profile - this is how patients will see you
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Profile */}
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Doctor Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Full Name *</Label>
                  <Input
                    id="doctorName"
                    placeholder="Dr. Rajesh Kumar"
                    value={data.fullName}
                    onChange={(e) => updateData({ fullName: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Select value={data.specialty} onValueChange={(value) => updateData({ specialty: value })}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subSpecialty">Sub-specialty</Label>
                  <Input
                    id="subSpecialty"
                    placeholder="e.g., Interventional Cardiology"
                    value={data.subSpecialty || ''}
                    onChange={(e) => updateData({ subSpecialty: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="10"
                    value={data.yearsOfExperience || ''}
                    onChange={(e) => updateData({ yearsOfExperience: parseInt(e.target.value) || 0 })}
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Languages Spoken</Label>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={data.languagesSpoken.includes(lang)}
                        onCheckedChange={() => updateLanguages(lang)}
                      />
                      <Label htmlFor={`lang-${lang}`} className="text-sm">{lang}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About Doctor</Label>
                <Textarea
                  id="about"
                  placeholder="Brief description about your expertise and approach to patient care..."
                  value={data.aboutDoctor || ''}
                  onChange={(e) => updateData({ aboutDoctor: e.target.value })}
                  className="bg-muted/50"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Clinic Information */}
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Clinic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic Name *</Label>
                <Input
                  id="clinicName"
                  placeholder="Dr. Kumar's Cardiac Care Center"
                  value={data.clinicName}
                  onChange={(e) => updateData({ clinicName: e.target.value })}
                  className="bg-muted/50 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Clinic Address *</Label>
                <Input
                  id="clinicAddress"
                  placeholder="123 MG Road, Bangalore, Karnataka 560001"
                  value={data.clinicAddress}
                  onChange={(e) => updateData({ clinicAddress: e.target.value })}
                  className="bg-muted/50"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicPhone">Clinic Phone</Label>
                  <Input
                    id="clinicPhone"
                    type="tel"
                    placeholder="+91 80 1234 5678"
                    value={data.clinicPhone || ''}
                    onChange={(e) => updateData({ clinicPhone: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicEmail">Clinic Email</Label>
                  <Input
                    id="clinicEmail"
                    type="email"
                    placeholder="contact@clinic.com"
                    value={data.clinicEmail || ''}
                    onChange={(e) => updateData({ clinicEmail: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consultation Modes & Fees */}
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IndianRupee className="h-5 w-5 text-green-600" />
                <span>Consultation Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Consultation Modes *</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="inPerson"
                      checked={data.consultationModes.includes('In-Person')}
                      onCheckedChange={(checked) => updateConsultationMode('In-Person', checked as boolean)}
                    />
                    <Label htmlFor="inPerson" className="flex-1">In-Person Consultation</Label>
                    {data.consultationModes.includes('In-Person') && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          placeholder="500"
                          value={data.consultationFees.inPerson}
                          onChange={(e) => updateData({ 
                            consultationFees: { ...data.consultationFees, inPerson: e.target.value }
                          })}
                          className="w-20 bg-muted/50"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="teleconsultation"
                      checked={data.consultationModes.includes('Teleconsultation')}
                      onCheckedChange={(checked) => updateConsultationMode('Teleconsultation', checked as boolean)}
                    />
                    <Label htmlFor="teleconsultation" className="flex-1">Teleconsultation</Label>
                    {data.consultationModes.includes('Teleconsultation') && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          placeholder="300"
                          value={data.consultationFees.teleconsultation}
                          onChange={(e) => updateData({ 
                            consultationFees: { ...data.consultationFees, teleconsultation: e.target.value }
                          })}
                          className="w-20 bg-muted/50"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span>Working Hours</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyMondayToFriday}
                  className="text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Mon-Fri
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {days.map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-4">
                    <Checkbox
                      checked={data.workingHours[key]?.isWorking || false}
                      onCheckedChange={(checked) => updateWorkingHours(key, 'isWorking', checked as boolean)}
                    />
                    <div className="w-20 text-sm font-medium">{label}</div>
                    {data.workingHours[key]?.isWorking && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={data.workingHours[key]?.start || '09:00'}
                          onChange={(e) => updateWorkingHours(key, 'start', e.target.value)}
                          className="w-28 bg-muted/50"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={data.workingHours[key]?.end || '18:00'}
                          onChange={(e) => updateWorkingHours(key, 'end', e.target.value)}
                          className="w-28 bg-muted/50"
                        />
                      </div>
                    )}
                    {!data.workingHours[key]?.isWorking && (
                      <span className="text-muted-foreground text-sm">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Live Preview */}
        <div className="lg:col-span-1">
          <Card className="luxury-card sticky top-4 border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg text-blue-700 dark:text-blue-300">Live Preview</CardTitle>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">How patients will see your profile</p>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {data.fullName ? data.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR'}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground">
                    {data.fullName || 'Dr. Your Name'}
                  </h3>
                  <p className="text-blue-600 font-semibold text-lg">
                    {data.specialty || 'Your Specialty'}
                  </p>
                  {data.subSpecialty && (
                    <p className="text-sm text-muted-foreground font-medium">{data.subSpecialty}</p>
                  )}
                  {data.yearsOfExperience > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      {data.yearsOfExperience} years experience
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 text-lg">
                    {data.clinicName || 'Your Clinic Name'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {data.clinicAddress || 'Clinic Address'}
                  </p>
                  {data.clinicPhone && (
                    <p className="text-xs text-muted-foreground">📞 {data.clinicPhone}</p>
                  )}
                  {data.clinicEmail && (
                    <p className="text-xs text-muted-foreground">✉️ {data.clinicEmail}</p>
                  )}
                </div>

                {data.consultationModes.length > 0 && (
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Consultation Fees</h4>
                    <div className="space-y-1">
                      {data.consultationModes.includes('In-Person') && data.consultationFees.inPerson && (
                        <div className="flex justify-between text-sm">
                          <span>In-Person</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">₹{data.consultationFees.inPerson}</span>
                        </div>
                      )}
                      {data.consultationModes.includes('Teleconsultation') && data.consultationFees.teleconsultation && (
                        <div className="flex justify-between text-sm">
                          <span>Video Call</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">₹{data.consultationFees.teleconsultation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {data.languagesSpoken.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-1">
                      {data.languagesSpoken.slice(0, 4).map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                      {data.languagesSpoken.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{data.languagesSpoken.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {data.aboutDoctor && (
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">About</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                      {data.aboutDoctor.slice(0, 120)}
                      {data.aboutDoctor.length > 120 && '...'}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Availability</span>
                    <Badge variant="outline" className="text-xs">
                      {Object.values(data.workingHours).filter(day => day?.isWorking).length} days/week
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(data.workingHours)
                      .filter(([_, hours]) => hours?.isWorking)
                      .slice(0, 3)
                      .map(([day, hours]) => (
                        <div key={day} className="flex justify-between text-xs text-muted-foreground">
                          <span className="capitalize">{day}</span>
                          <span>{hours?.start} - {hours?.end}</span>
                        </div>
                      ))}
                    {Object.values(data.workingHours).filter(day => day?.isWorking).length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">+ more days available</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onPrev}>
          Back
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!isStepValid()}
          className="btn-luxury px-8"
        >
          Continue to KYC Verification
        </Button>
      </div>
    </div>
  );
};

export default ClinicDetailsStep;
