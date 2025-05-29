"use client";
import { Card, CardContent } from "@/components/ui/card";

export default function PancreasComponent() {
  return (
    <div className="w-full h-full p-8">
      <div className="grid grid-cols-[1.2fr,1fr] gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Metabolism Card */}
          <Card className="rounded-[32px] bg-white shadow-sm">
            <CardContent className="p-10">
              <div className="flex justify-between">
                <div className="space-y-12">
                  <div>
                    <h2 className="text-[40px] font-semibold text-black mb-12">Metabolism</h2>
                    <div className="space-y-1">
                      <p className="text-[#6B7280] text-xl font-normal">Fasting Glucose</p>
                      <p className="text-[28px] font-semibold">99 mg/dl</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[#6B7280] text-xl font-normal">Glycated<br/>Haemoglobin</h3>
                    <p className="text-[40px] font-semibold">5.5%</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center ml-8">
                  <div className="w-20 h-56 bg-gray-100 rounded-[100px] flex items-end overflow-hidden">
                    <div className="w-full h-[65%] bg-[#0066FF] rounded-[100px]" />
                  </div>
                  <p className="text-sm text-[#6B7280] mt-3 text-center leading-tight">High metabolic<br />activity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diabetes Risk Score Card */}
          <Card className="rounded-[32px] bg-white shadow-sm">
            <CardContent className="p-10">
              <h3 className="text-[28px] font-semibold text-black mb-4">Diabetes Risk Score</h3>
              <div className="flex items-center gap-3">
                <span className="text-[40px] font-semibold">6</span>
                <span className="text-[#6B7280] text-xl">Low risk</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Insulin Card */}
          <Card className="rounded-[32px] bg-white shadow-sm">
            <CardContent className="p-10">
              <div className="flex justify-between items-start mb-24">
                <div>
                  <p className="text-[#6B7280] text-xl mb-1">Insulin</p>
                  <p className="text-[40px] font-semibold">16 μU/mL</p>
                </div>
                <span className="bg-[#EBF5FF] text-[#0066FF] px-6 py-2 rounded-full text-base font-medium">
                  Normal
                </span>
              </div>
              <div className="text-right">
                <p className="text-[#6B7280] text-xl mb-1">Hemoglobin</p>
                <p className="text-[28px] font-semibold">13 μU/mL</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Cholesterol Card */}
          <Card className="rounded-[32px] bg-white shadow-sm">
            <CardContent className="p-10">
              <p className="text-[40px] font-semibold mb-2">200mg/dl</p>
              <p className="text-[#6B7280] text-xl">Total Cholesterol</p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mt-12">
            <button className="w-full bg-[#F3F4F6] text-[#374151] rounded-[100px] py-5 text-lg font-medium">
              Upload Sugar Intake
            </button>
            <button className="w-full bg-[#0066FF] text-white rounded-[100px] py-5 text-lg font-medium">
              Bodily Fluids
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
