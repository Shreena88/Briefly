import { useState } from "react";

export default function DocumentImage({ base64 }) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative flex flex-col h-full bg-slate-50">
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-1 p-1 bg-white/50 backdrop-blur-md rounded-lg border border-slate-200 shadow-sm">
        {[0.75, 1, 1.5, 2].map((z) => (
          <button
            key={z}
            onClick={() => setZoom(z)}
            className={`px-3 py-1 text-[10px] rounded font-bold transition-all uppercase tracking-tighter ${
              zoom === z
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-500 hover:bg-white hover:text-primary"
            }`}
          >
            {z === 1 ? "100%" : `${z * 100}%`}
          </button>
        ))}
      </div>

      {/* Scrollable image container */}
      <div className="flex-1 overflow-auto scrollbar-thin flex items-start justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        <img
          src={base64}
          alt="Scanned document page"
          style={{ width: `${zoom * 100}%` }}
          className="max-w-none shadow-2xl rounded-sm border border-slate-200 ring-4 ring-white/50"
          draggable={false}
        />
      </div>
    </div>
  );
}
