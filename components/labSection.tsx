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
