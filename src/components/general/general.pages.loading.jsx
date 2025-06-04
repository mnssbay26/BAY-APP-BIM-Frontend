import React from "react";

export default function BayerLoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80">
      {/* Logo de Bayer: ruta absoluta desde public */}
      <img
        src="/bayerLoading.svg"
        alt="Bayer Logo"
        className="h-18 mb-2"
      />

      {/* Mensaje de Loading */}
      <p className="text-gray-700 text-lg">{message}</p>
    </div>
  );
}