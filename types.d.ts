// Add this to your project to handle Google Maps types
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        Geocoder: any;
      };
    };
  }
}

export {};
