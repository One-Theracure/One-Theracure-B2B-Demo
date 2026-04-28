
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";

interface PatientSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddPatient: () => void;
}

const PatientSearchBar = ({ searchTerm, onSearchChange, onAddPatient }: PatientSearchBarProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, MRN, or phone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10 text-base"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="h-10 text-sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button onClick={onAddPatient} className="h-10 text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientSearchBar;
