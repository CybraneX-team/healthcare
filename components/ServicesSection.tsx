"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Activity,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Tag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rtdb } from "@/utils/firebase";
import { onValue, ref } from "firebase/database";

const servicesProducts = [
  {
    id: "sp-001",
    name: "Quicksilver Scientific, Inc.",
    category: "Product",
    productService: "Vitamin D3K2",
    pricing: "$55",
    address: "1960 Cherry Street, Louisville, CO 80027",
    phone: "(303) 531-0861",
    email: "support@quicksilverscientific.com",
    operatingHours: "8:00AM - 5:00PM (Monday to Friday)",
    mapLink: "LINK",
  },
  {
    id: "sp-002",
    name: "Structure (Dr. Jason Valdez)",
    category: "Service",
    productService: "Chiropractic Treatment",
    pricing: "N/A",
    address: "6860 Embarcadero Lane Carlsbad, CA 92011",
    phone: "(832) 689-5022",
    email: "hello@structurecarlsbad.com",
    operatingHours:
      "8:00AM - 6:00PM (Monday to Friday); 8:00AM - 11:00AM (Saturday & Sunday)",
    mapLink: "LINK",
  },
  {
    id: "sp-003",
    name: "Breathe Degrees",
    category: "Service",
    productService: "Breathwork, Cold Plunge, Sauna",
    pricing: "starts at $69",
    address: "6965 El Camino Real #107, Carlsbad, CA 92011",
    phone: "(760) 814-2334",
    email: "admin@breathedegrees.com",
    operatingHours:
      "5:30AM - 9:00PM (Sunday to Friday); 6:30AM - 7:00PM (Saturday)",
    mapLink: "LINK",
  },
  {
    id: "sp-004",
    name: "Mitrua",
    category: "Service",
    productService: "Radiology Second Opinion",
    pricing: "starts at $99",
    address: "N/A",
    phone: "N/A",
    email: "N/A",
    operatingHours: "24/7",
    mapLink: "LINK",
  },
];

// Google Maps component
const GoogleMap = ({ address }: { address: string }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't try to load map if address is N/A
    if (address === "N/A") return;

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

    return () => {
      // Cleanup if needed
    };
  }, [address]);

  if (address === "N/A") {
    return (
      <div
        className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center"
        style={{ height: "300px" }}
      >
        <p className="text-gray-500">No address information available</p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} style={{ width: "100%", height: "300px" }}></div>
    </div>
  );
};

export function ServicesProductsSection() {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [servicesProducts, setServicesProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleExpand = (id: string) => {
    if (expandedItemId === id) {
      setExpandedItemId(null);
    } else {
      setExpandedItemId(id);
    }
  };

  useEffect(() => {
  setLoading(true);
  const servicesRef = ref(rtdb, "services"); // Adjust if your Firebase path is different (like "servicesProducts")

  const unsubscribe = onValue(servicesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const servicesArray = Object.values(data);
      setServicesProducts(servicesArray);
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  const filteredItems = servicesProducts.filter((item) => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.productService.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.address !== "N/A" && item.address.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (activeFilter !== "all") {
      return item.category.toLowerCase() === activeFilter.toLowerCase();
    }

    return true;
  });

  // Function to render a single service/product card
  const renderItemCard = (item: any, index : number) => {
    const isExpanded = expandedItemId === item.id;
    const hasValidAddress = item.address !== "N/A";

    return (
      <div key={index}>
      <div  className="mb-6">
        <Card
          className={`overflow-hidden transition-all duration-300 hover:shadow-md ${
            isExpanded ? "border-blue-200" : ""
          }`}
        >
          <CardContent className="p-0">
            <div className={`p-5 ${isExpanded ? "bg-blue-50" : "bg-white"}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-black">
                    {item.name}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>{item.category}</span>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {item.productService}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                {item.pricing !== "N/A" && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    {item.pricing}
                  </div>
                )}
                {item.phone !== "N/A" && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {item.phone}
                  </div>
                )}
                {item.email !== "N/A" && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{item.email}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{item.operatingHours}</span>
                </div>
                {hasValidAddress && (
                  <div className="flex items-center text-sm text-gray-600 md:col-span-2">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 ${
                      item.category === "Product"
                        ? "border-purple-200 text-purple-700 bg-purple-50"
                        : "border-green-200 text-green-700 bg-green-50"
                    }`}
                  >
                    {item.category === "Product" ? (
                      <ShoppingBag className="h-3 w-3 text-purple-600" />
                    ) : (
                      <Activity className="h-3 w-3 text-green-600" />
                    )}
                    <span>{item.category}</span>
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-8"
                  onClick={() => toggleExpand(item.id)}
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
                  <ShoppingBag className="h-4 w-4 mr-2 text-blue-500" />
                  {item.category} Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="font-medium text-sm text-black">
                      Category
                    </div>
                    <div className="text-sm text-gray-700">{item.category}</div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="font-medium text-sm text-black">
                      {item.category} Offered
                    </div>
                    <div className="text-sm text-gray-700">
                      {item.productService}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="font-medium text-sm text-black">
                      Pricing
                    </div>
                    <div className="text-sm text-gray-700">
                      {item.pricing !== "N/A" ? item.pricing : "Not available"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="font-medium text-sm text-black">
                      Operating Hours
                    </div>
                    <div className="text-sm text-gray-700">
                      {item.operatingHours}
                    </div>
                  </div>
                  {item.phone !== "N/A" && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="font-medium text-sm text-black">
                        Phone
                      </div>
                      <div className="text-sm text-gray-700">{item.phone}</div>
                    </div>
                  )}
                  {item.email !== "N/A" && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="font-medium text-sm text-black">
                        Email
                      </div>
                      <div className="text-sm text-gray-700">{item.email}</div>
                    </div>
                  )}
                </div>

                {hasValidAddress && (
                  <>
                    <h4 className="font-medium mt-6 mb-2 flex items-center text-black">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      Location
                    </h4>

                    {/* Google Maps integration */}
                    <GoogleMap address={item.address} />
                  </>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {item.category === "Product"
                      ? "View Product"
                      : "Book Service"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    );
  };

  return (
    <>
      {loading ? (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600 text-lg animate-pulse">Loading services...</p>
      </div>
      )
    :(
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-black">
          Products & Services
        </h1>
        <p className="text-gray-600">
          Browse available health products and services
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products or services..."
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
              All
            </TabsTrigger>
            <TabsTrigger
              value="product"
              className="rounded-full px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600 data-[state=active]:shadow-sm"
            >
              Products
            </TabsTrigger>
            <TabsTrigger
              value="service"
              className="rounded-full px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600 data-[state=active]:shadow-sm"
            >
              Services
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid layout for cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredItems.map((item : any , index : number)=>{return renderItemCard(item,index)})}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No items found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery
              ? `No items match your search for "${searchQuery}". Try a different search term.`
              : "No items found for the selected filter."}
          </p>
        </div>
      )}
    </div>
    )
  }
    </>

  );
}
