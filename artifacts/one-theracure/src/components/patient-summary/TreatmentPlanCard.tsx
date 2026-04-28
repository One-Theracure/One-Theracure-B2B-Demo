
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Pill } from "lucide-react";

interface TreatmentPlanCardProps {
  medications: string;
  investigations: string;
  treatment: string;
  advice: string;
  followUp: string;
}

const TreatmentPlanCard = ({ 
  medications, 
  investigations, 
  treatment, 
  advice, 
  followUp 
}: TreatmentPlanCardProps) => {
  return (
    <Card className="border-indigo-500/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Pill className="h-4 w-4 text-indigo-600" />
          <h3 className="font-semibold text-indigo-700 dark:text-indigo-400">Treatment Plan</h3>
        </div>
        
        <div className="space-y-3">
          {medications ? (
            <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
              <h4 className="font-medium text-indigo-700 dark:text-indigo-400 mb-2">Prescribed Medications</h4>
              <div className="space-y-1">
                {medications.split('\n').map((med, index) => 
                  med.trim() && (
                    <div key={index} className="text-sm text-foreground">• {med.trim()}</div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 p-3 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">No medications prescribed at this time</p>
            </div>
          )}

          {investigations && (
            <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
              <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">Tests/Investigations Ordered</h4>
              <div className="space-y-1">
                {investigations.split('\n').map((test, index) => 
                  test.trim() && (
                    <div key={index} className="text-sm text-foreground">• {test.trim()}</div>
                  )
                )}
              </div>
            </div>
          )}

          {treatment && (
            <div className="bg-teal-500/10 p-3 rounded-lg border border-teal-500/20">
              <h4 className="font-medium text-teal-700 dark:text-teal-400 mb-2">Treatment/Procedures</h4>
              <p className="text-sm text-foreground">• {treatment}</p>
            </div>
          )}

          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Advice & Instructions</h4>
            <p className="text-sm text-foreground">
              {advice || "Continue current lifestyle and follow general health guidelines"}
            </p>
          </div>

          <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Follow-up</h4>
            <p className="text-sm text-foreground">
              {followUp || "As needed or if symptoms persist"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreatmentPlanCard;
