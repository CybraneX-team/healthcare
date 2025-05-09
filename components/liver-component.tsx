"use client";

import { Card, CardContent } from "@/components/ui/card";

export const LiverComponent = () => {
  return (
    <div className="lg:col-span-8">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Liver Care Card */}
        <Card className="shadow-sm border-0 bg-white rounded-3xl h-[250px]">
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-800 text-lg">Liver Care</h3>
            <div className="mt-28">
              <div className="text-gray-500 text-sm">Fatty Liver</div>
              <div className="text-2xl font-semibold mt-1">Grade III</div>
            </div>
          </CardContent>
        </Card>

        
        <div className="grid grid-cols-3 w-[50.5rem] bg-white p-3 rounded-3xl">
          {/* ALT Card */}
          <Card className="shadow-sm bg-gray-200 border-0 rounded-3xl w-[15.75rem] ml-1">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-800 text-3xl mb-0">ALT</h3>
              {/* <div className="text-xs text-red-500 mt-0.5">Critical seek<br />medical attention</div> */}
              <div className="text-3xl font-extralight mt-2">80 U/L</div>
            </CardContent>
          </Card>

          {/* AST Card */}
          <Card className="shadow-sm bg-gray-200 border-0  rounded-3xl w-[15.75rem] ml-1">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-800 text-3xl mb-2">AST</h3>
              <div className="text-3xl font-extralight">35 U/L</div>
            </CardContent>
          </Card>

          {/* Bilirubin Card */}
          <Card className="shadow-sm bg-gray-200 border-0  rounded-3xl w-[15.75rem] ml-1">
            <CardContent className="p-6">
              <h3 className=" text-gray-800 text-lg mb-2">Bilirubin</h3>
              <div className="text-3xl font-semibold">1.3 mg/dl</div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Gut Health Card */}
      <Card className="shadow-sm border-0 bg-white rounded-3xl w-full h-[460px]">
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4">
              <h3 className="font-bold text-gray-800 text-xl mb-6">Gut Health</h3>
              
              {/* Gut Health Score */}
              <div>
                <div className="text-gray-500 text-sm mb-1 mt-64">Gut Health Score</div>
                <div className="text-6xl font-semibold">65%</div>
              </div>
            </div>
            
            {/* Gut Health Visualization */}
            <div className="flex items-end ml-20 justify-between h-96 md:h-96">
              {[
                { name: 'Elastase-1', value: 90 },
                { name: 'Elastase-1', value: 40 },
                { name: 'Calprotectin', value: 60 },
                { name: 'Secretory IgA', value: 50 },
                { name: 'Anti-Gliadin IgA', value: 70 },
                { name: 'Eosinophil Protein', value: 75 },
                { name: 'Occult Blood', value: 55 },
                { name: 'Beta-Glucuronidase', value: 30 }
              ].map((item, index) => {
                // Determine color intensity based on value
                let colorIntensity;
                if (item.value >= 80) {
                  colorIntensity = 600;
                } else if (item.value >= 70) {
                  colorIntensity = 500;
                } else if (item.value >= 60) {
                  colorIntensity = 400;
                } else if (item.value >= 50) {
                  colorIntensity = 300;
                } else if (item.value >= 40) {
                  colorIntensity = 200;
                } else if (item.value >= 30) {
                  colorIntensity = 100;
                } else {
                  colorIntensity = 50;
                }
                
                return (
                  <div key={index} className="flex flex-col items-center" style={{ width: '14%' }}>
                    <div className="w-full flex justify-center">
                      <div className="w-16 h-80 flex items-end rounded-full bg-gray-100">
                        <div 
                          className={`w-full bg-blue-${colorIntensity} rounded-full`} 
                          style={{ height: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs mt-2 text-gray-500 text-center w-full" style={{ minHeight: '2.5rem' }}>
                      {item.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiverComponent;