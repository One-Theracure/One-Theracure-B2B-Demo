
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Phone, MapPin } from "lucide-react";

const ImportantRemindersCard = () => {
  return (
    <Card className="border-red-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <h3 className="font-semibold text-red-800">Important Reminders</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Take all medications exactly as prescribed</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Follow the advice given during your visit</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Contact the clinic if symptoms worsen or new symptoms appear</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Keep this summary for your medical records</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Attend follow-up appointments as scheduled</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-red-100 space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-red-600" />
            <span className="font-medium">Emergency:</span>
            <span>Call emergency services for severe symptoms</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Clinic Contact:</span>
            <span>Use One TheraCure app or call 1800-ONE-CURE</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportantRemindersCard;
