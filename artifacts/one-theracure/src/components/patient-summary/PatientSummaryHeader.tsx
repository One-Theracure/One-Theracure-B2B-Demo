
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MessageCircle } from 'lucide-react';

const PatientSummaryHeader = () => {
  return (
    <div className="relative bg-brand-soft border border-brand-trust/20 rounded-airbnb-md p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="text-center flex-1">
          <h1 className="text-display-md text-brand-navy mb-1">
            Triumph Oncology Clinic
          </h1>
          <p className="text-sm font-semibold text-brand-trust">After Visit Summary</p>
          <p className="text-xs text-muted-foreground font-inter">One TheraCure Smart-OPD • Main Branch</p>
        </div>
        <div className="flex-1 flex flex-col items-end gap-2">
          <div className="w-12 h-12 bg-card rounded-airbnb-pill border border-brand-trust/25 flex items-center justify-center">
            <img alt="One TheraCure Logo" src="/lovable-uploads/b9cdbbf7-5ed9-4d60-a067-0d76cdf9c8ca.jpg" className="w-8 h-8 object-fill" />
          </div>
          <div className="flex flex-col items-center">
            <QRCodeSVG
              value="https://app.onetheracure.com/visit/demo-visit-summary"
              size={48}
              level="M"
              className="border border-brand-trust/20 rounded-airbnb-xs p-0.5"
            />
            <span className="text-[8px] text-brand-trust mt-0.5 font-medium leading-tight text-center">Scan to save visit</span>
            <button
              onClick={() => {
                const visitUrl = 'https://app.onetheracure.com/visit/demo-visit-summary';
                const message = `Hi, here is your After Visit Summary from Triumph Oncology Clinic. View it here: ${visitUrl}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-green-500 hover:bg-green-600 text-white text-[8px] font-semibold rounded-full transition-colors print:hidden"
            >
              <MessageCircle className="h-2.5 w-2.5" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSummaryHeader;
