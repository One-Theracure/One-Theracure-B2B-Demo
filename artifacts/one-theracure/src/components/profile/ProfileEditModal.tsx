
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Save } from "lucide-react";
import { toast } from "sonner";
import BasicInfoSection from "./BasicInfoSection";
import ClinicInfoSection from "./ClinicInfoSection";
import LanguagesSection from "./LanguagesSection";
import AboutSection from "./AboutSection";

interface ProfileData {
  name: string;
  role: string;
  email: string;
  phone: string;
  specialty: string;
  clinicName: string;
  clinicAddress: string;
  about: string;
  languagesSpoken: string[];
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    role: string;
    id: string;
    email?: string;
  };
  onProfileUpdate: (updatedUser: ProfileData & { id: string }) => void;
}

const buildInitialProfile = (u: ProfileEditModalProps["currentUser"]): ProfileData => ({
  name: u.name,
  role: u.role,
  email: u.email ?? "",
  phone: "",
  specialty: "General Medicine",
  clinicName: "",
  clinicAddress: "",
  about: "",
  languagesSpoken: ["English"],
});

const ProfileEditModal = ({ isOpen, onClose, currentUser, onProfileUpdate }: ProfileEditModalProps) => {
  const [profileData, setProfileData] = useState<ProfileData>(() => buildInitialProfile(currentUser));

  // Re-sync from Clerk identity whenever the user object changes (e.g. Clerk
  // hydrates after the modal has already mounted as a guest), or whenever the
  // modal is reopened. Without this the form can show stale identity.
  useEffect(() => {
    if (!isOpen) return;
    setProfileData((prev) => ({
      ...prev,
      name: currentUser.name,
      role: currentUser.role,
      email: currentUser.email ?? prev.email,
    }));
  }, [isOpen, currentUser.id, currentUser.name, currentUser.role, currentUser.email]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguagesChange = (languages: string[]) => {
    setProfileData(prev => ({ ...prev, languagesSpoken: languages }));
  };

  const handleAboutChange = (about: string) => {
    setProfileData(prev => ({ ...prev, about }));
  };

  const handleSave = () => {
    // Update the current user data for header display
    onProfileUpdate({
      ...profileData,
      id: currentUser.id,
    });

    toast.success("Profile updated successfully!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Edit Profile</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <BasicInfoSection 
            profileData={profileData} 
            onInputChange={handleInputChange} 
          />

          <ClinicInfoSection 
            profileData={profileData} 
            onInputChange={handleInputChange} 
          />

          <LanguagesSection 
            languagesSpoken={profileData.languagesSpoken} 
            onLanguagesChange={handleLanguagesChange} 
          />

          <AboutSection 
            about={profileData.about} 
            onAboutChange={handleAboutChange} 
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
