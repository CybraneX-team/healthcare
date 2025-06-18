import { Loader2 } from "lucide-react";

export default function OverlayLoader({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg flex items-center gap-4">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-blue-800 text-lg font-semibold">{message}</span>
      </div>
    </div>
  );
}
