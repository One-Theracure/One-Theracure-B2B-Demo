
import NewVisitForm from "@/components/NewVisitForm";

interface NewVisitContentProps {
  profileData?: {
    name: string;
    role: string;
    email: string;
    phone: string;
    specialty: string;
    clinicName: string;
    clinicAddress: string;
    about: string;
  };
  onProfileUpdate?: (updatedProfile: any) => void;
}

const NewVisitContent = ({ profileData, onProfileUpdate }: NewVisitContentProps) => {
  return <NewVisitForm profileData={profileData} onProfileUpdate={onProfileUpdate} />;
};

export default NewVisitContent;
