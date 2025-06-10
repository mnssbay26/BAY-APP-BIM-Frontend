import React from "react";

export default function BayerLoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80">
      {/* Bayer logo: absolute path from public */}
      <img
        src="/bayerLoading.svg"
        alt="Bayer Logo"
        className="h-17 mb-1"
      />

      {/* Loading message */}
      <p className="text-gray-700 text-lg">{message}</p>
    </div>
  );
}