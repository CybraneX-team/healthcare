"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Activity,
  Beaker,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building,
  Printer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rtdb } from "@/utils/firebase";
import { onValue, ref } from "firebase/database";

const diagnosticCenters = [
  {
    id: "center-001",
    name: "Carlsbad Imaging Center",
    category: "Imaging Center",
    address: "6010 Hidden Valley Rd #125, Carlsbad, CA 92011, United States",
    phone: "(760) 730-3536",
    email: "info@carlsbadimaging.com",
    fax: "(760) 720-4833",
    operatingHours: "8:30 am – 5:00 pm (Monday to Friday)",
    diagnostics: "Imaging & Scans",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-002",
    name: "Intermountain Medical Imaging - Dtn Boise",
    category: "Imaging Center",
    address: "927 W Myrtle St, Boise, ID 83702, United States",
    phone: "(208) 954-8100",
    email: "customerservice@msnllc.com",
    fax: "(208) 947-3322",
    operatingHours: "6:30AM - 9:30PM (Monday to Friday)",
    diagnostics: "Imaging & Scans",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-003",
    name: "Treasure Valley Imaging",
    category: "Imaging Center",
    address: "8800 W Emerald St, Boise, ID 83704, United States",
    phone: "(208) 373-5012",
    email: "info@treasurevalleyhospital.com",
    fax: "(208) 373-5113",
    operatingHours: "5:30 AM - 7:00 PM (Monday to Friday)",
    diagnostics: "Imaging & Scans",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-004",
    name: "RAYUS Radiology Beaverton",
    category: "Imaging Center",
    address: "233 NE 102nd Ave, Portland, OR 97220, United States",
    phone: "(503) 253-1105",
    email: "N/A",
    fax: "(503) 535-8394",
    operatingHours:
      "7:00AM - 9:30PM (Monday to Friday); 8:00AM - 5:00PM (Saturday); 8:30AM - 4:00PM (Sunday)",
    diagnostics: "Imaging & Scans",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-005",
    name: "Bridgetown Downtown Portland",
    category: "Physical Therapy & Training Studio",
    address: "1800 NW Upshur St. #150 Portland, OR, 97209",
    phone: "(503) 719-5318",
    email: "info@bridgetownpt.com",
    fax: "(503) 222-1485",
    operatingHours: "7:30AM - 6:30PM (Monday to Friday)",
    diagnostics: "Functional Testing",
    biophysical: "Biomechanics",
    mapLink: "LINK",
  },
  {
    id: "center-006",
    name: "DexaFit Orlando",
    category: "Physical Therapy & Training Studio",
    address:
      "6735 Conroy Windermere Rd STE 207, Orlando, FL 32835, United States",
    phone: "(407) 341-4511",
    email: "orlando@dexafit.com",
    fax: "N/A",
    operatingHours: "8:00AM - 2:00PM (Monday to Friday)",
    diagnostics: "Functional Testing",
    biophysical: "Biomechanics",
    mapLink: "LINK",
  },
  {
    id: "center-007",
    name: "DexaFit Gilbert",
    category: "Physical Therapy & Training Studio",
    address: "5656 S. Power Road, Suite 124, Gilbert, AZ 85295",
    phone: "(480) 336-9062",
    email: "gilbert@dexafit.com",
    fax: "N/A",
    operatingHours: "8:00AM - 4:00PM (Tuesday to Saturday)",
    diagnostics: "Functional Testing",
    biophysical: "Biomechanics",
    mapLink: "LINK",
  },
  {
    id: "center-008",
    name: "The Endurance Athlete",
    category: "Physical Therapy & Training Studio",
    address: "6451 El Camino Real, Suite B-2 Carlsbad, CA",
    phone: "(858)210-5975",
    email: "daniel@shift-fitness.com",
    fax: "N/A",
    operatingHours:
      "5:00AM - 8:00PM (Monday to Thursday); 5:00AM - 5:00PM (Friday); 9:00AM - 2:00PM (Saturday); 8:00AM - 12:00PM (Sunday)",
    diagnostics: "Functional Testing",
    biophysical: "Biomechanics",
    mapLink: "LINK",
  },
  {
    id: "center-009",
    name: "San Diego Sports Medicine & Family Health Center",
    category: "Physical Therapy",
    address:
      "10505 Sorrento Valley Rd Suite 200, San Diego, CA 92121, United States",
    phone: "(858) 793-7860",
    email: "mattd@sdsm.com",
    fax: "(858) 436-1289",
    operatingHours: "8:00AM - 5:00PM (Monday to Friday)",
    diagnostics: "Functional Testing",
    biophysical: "Biomechanics",
    mapLink: "LINK",
  },
  {
    id: "center-010",
    name: "CT Heart Scan San Diego",
    category: "Imaging Center",
    address: "8707 Complex Dr, San Diego, CA 92123, United States",
    phone: "(619) 334-3787",
    email: "info@ctheartscan.com",
    fax: "N/A",
    operatingHours: "8:00AM - 5:00PM (Monday to Friday)",
    diagnostics: "Imaging & Scans",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-011",
    name: "SimonMed Imaging",
    category: "Imaging Center",
    address: "16220 N. Scottsdale Rd., Suite 600 Scottsdale, AZ 85254",
    phone: "(866) 614-8555",
    email: "N/A",
    fax: "N/A",
    operatingHours: "varies per location",
    diagnostics: "Imaging & Scans",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-012",
    name: "Quest Diagnostics",
    category: "Laboratory",
    address: "500 Plaza Drive Secaucus, NJ 07094",
    phone: "(866) 697-8378",
    email: "N/A",
    fax: "N/A",
    operatingHours: "varies per location",
    diagnostics: "Biological/Chemical",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-013",
    name: "Rupa Health",
    category: "Laboratory",
    address: "800 Boylston St, Suite 1410, Boston, MA 02199",
    phone: "(669) 294-2703",
    email: "support@rupahealth.com",
    fax: "N/A",
    operatingHours: "varies per location",
    diagnostics: "Biological/Chemical",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-014",
    name: "Function Health",
    category: "Laboratory",
    address: "600 Congress Ave. Floor 14. Austin, TX 78701",
    phone: "N/A",
    email: "N/A",
    fax: "N/A",
    operatingHours: "varies per location",
    diagnostics: "Biological/Chemical",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-015",
    name: "Advent Health",
    category: "Laboratory",
    address: "900 Hope Way, Altamonte Springs, FL 32714",
    phone: "(407) 357-1000",
    email: "N/A",
    fax: "N/A",
    operatingHours: "24/7",
    diagnostics: "Biological/Chemical",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-016",
    name: "Medical Ultrasound Imaging",
    category: "Imaging Center",
    address: "5854 S. Pecos Rd., Bld J Suite 500, Las Vegas, NV 89120",
    phone: "(702) 499-4305",
    email: "metirexh1969@gmail.com",
    fax: "N/A",
    operatingHours: "9:00AM - 6:00PM (Monday to Saturday)",
    diagnostics: "Imaging & Scans",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
  {
    id: "center-017",
    name: "Cell Sciences",
    category: "Laboratory",
    address: "852 S Military Trail, Deerfield Beach, FL 33442",
    phone: "(954) 426-2304",
    email: "info@cellsciencesystem.com",
    fax: "(954) 428-8676",
    operatingHours: "9:00AM - 6:00PM (Monday to Friday)",
    diagnostics: "Biological/Chemical",
    biophysical: "Biomarker",
    mapLink: "LINK",
  },
];

// Diagnostic categories mapping
const diagnosticCategories = {
  "Imaging & Scans": "Radiology",
  "Functional Testing": "Physical Therapy",
  "Biological/Chemical": "Laboratory",
};

// Google Maps component
const GoogleMap = ({ address }: { address: string }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Maps API script
    const loadGoogleMapsScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDMzgrrBr5x1-dZO6-7zFcq_AbhkdsoffM&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    // Initialize map
    const initMap = () => {
      if (!window.google || !mapRef.current) return;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { address } as google.maps.GeocoderRequest,
        (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus
        ) => {
          if (status === "OK" && results && results[0]) {
            const map = new window.google.maps.Map(
              mapRef.current as HTMLElement,
              {
                center: results[0].geometry.location,
                zoom: 15,
              }
            );

            new window.google.maps.Marker({
              map,
              position: results[0].geometry.location,
            });
          }
        }
      );
    };

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      loadGoogleMapsScript();
    }

    return () => {};
  }, [address]);

  return (
    <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} style={{ width: "100%", height: "300px" }}></div>
    </div>
  );
};

export function LabsSection() {
  const [diagnosticCenters, setDiagnosticCenters] = useState<any[]>([]);
  const [expandedCenterId, setExpandedCenterId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false); // new

  const toggleExpand = (id: string) => {
    if (expandedCenterId === id) {
      setExpandedCenterId(null);
    } else {
      setExpandedCenterId(id);
    }
  };

  useEffect(() => {
    setLoading(true);
    const centersRef = ref(rtdb, "diagnosticCenters");
    const unsubscribe = onValue(centersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const centersArray = Object.values(data);
        setDiagnosticCenters(centersArray);
      }
      setLoading(false); // data loaded, stop loading
    });

    return () => unsubscribe();
  }, []);

  const filteredCenters = diagnosticCenters.filter((center) => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        center.name.toLowerCase().includes(query) ||
        center.address.toLowerCase().includes(query) ||
        center.category.toLowerCase().includes(query) ||
        center.diagnostics.toLowerCase().includes(query)
      );
    }

    // Filter by diagnostic category
    if (activeFilter !== "all") {
      return center.diagnostics
        .toLowerCase()
        .includes(activeFilter.toLowerCase());
    }

    return true;
  });

  // Function to render a single diagnostic center card
  const renderCenterCard = (center: any, index: number) => {
    const isExpanded = expandedCenterId === center.id;

    if (loading) {
      console.log("got true");
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600 text-lg animate-pulse">
            Loading centers...
          </p>
        </div>
      );
    }
    return (
      <div key={index} className="mb-6">
        <Card
          className={`overflow-hidden transition-all duration-300 hover:shadow-md ${
            isExpanded ? "border-blue-200" : ""
          }`}
        >
          <CardContent className="p-0">
            <div className={`p-5 ${isExpanded ? "bg-blue-50" : "bg-white"}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-black ">
                    {center.name}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{center.category}</span>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {center.diagnostics}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {center.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">
                    {center.email !== "N/A" ? center.email : "Not available"}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Printer className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {center.fax !== "N/A" ? center.fax : "Not available"}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{center.operatingHours}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 md:col-span-2">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{center.address}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-green-200 text-green-700 bg-green-50"
                  >
                    <Activity className="h-3 w-3 text-green-600" />
                    <span>{center.biophysical}</span>
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-8"
                  onClick={() => toggleExpand(center.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="p-5 border-t border-gray-100 bg-white">
                <h4 className="font-medium mb-3 flex items-center text-black">
                  <Beaker className="h-4 w-4 mr-2 text-blue-500" />
                  Diagnostic Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="font-medium text-sm text-black">
                      Category
                    </div>
                    <div className="text-sm text-gray-700">
                      {center.category}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="font-medium text-sm text-black">
                      Diagnostics
                    </div>
                    <div className="text-sm text-gray-700">
                      {center.diagnostics}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="font-medium text-sm text-black">
                      Biophysical Indicators
                    </div>
                    <div className="text-sm text-gray-700">
                      {center.biophysical}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="font-medium text-sm text-black">
                      Operating Hours
                    </div>
                    <div className="text-sm text-gray-700">
                      {center.operatingHours}
                    </div>
                  </div>
                  {center.fax !== "N/A" && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="font-medium text-sm text-black">Fax</div>
                      <div className="text-sm text-gray-700">{center.fax}</div>
                    </div>
                  )}
                </div>

                <h4 className="font-medium mt-6 mb-2 flex items-center text-black">
                  <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                  Location
                </h4>

                {/* Google Maps integration */}
                <GoogleMap address={center.address} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600 text-lg animate-pulse">
            Loading centers...
          </p>
        </div>
      ) : (
        <div className="px-4 py-6 md:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-black">
              Diagnostic Centers
            </h1>
            <p className="text-gray-600">
              View and find diagnostic centers for medical tests
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search centers or diagnostics"
                className="pl-10 pr-4 py-2 w-full rounded-full border bg-white text-gray-700 border-gray-400 focus:outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs
              value={activeFilter}
              onValueChange={setActiveFilter}
              className="w-full md:w-auto max-w-xs md:max-w-full hidden sm:flex"
            >
              <TabsList className="p-1 rounded-full bg-white border border-blue-100">
                <TabsTrigger
                  value="all"
                  className="rounded-full px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600 data-[state=active]:shadow-sm"
                >
                  All Centers
                </TabsTrigger>
                <TabsTrigger
                  value="imaging"
                  className="rounded-full px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600 data-[state=active]:shadow-sm"
                >
                  Imaging
                </TabsTrigger>
                <TabsTrigger
                  value="functional"
                  className="rounded-full px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600 data-[state=active]:shadow-sm"
                >
                  Functional
                </TabsTrigger>
                <TabsTrigger
                  value="biological"
                  className="rounded-full px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600 data-[state=active]:shadow-sm"
                >
                  Biological
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Responsive grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* All cards in a single responsive grid */}
            {filteredCenters.map((center, index) =>
              renderCenterCard(center, index)
            )}
          </div>

          {filteredCenters.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No diagnostic centers found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery
                  ? `No centers match your search for "${searchQuery}". Try a different search term.`
                  : "No diagnostic centers found for the selected filter."}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
