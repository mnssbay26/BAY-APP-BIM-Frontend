import React, { useState, useEffect, useRef } from "react";

export function BayerFooter() {
  return (
    <footer
      style={{ backgroundColor: "#4B0056" }}
      className="text-white py-4"
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Left text */}
        <p className="text-sm">
          © 2025 BAYER. All rights reserved.
        </p>

        {/* Right-aligned links */}
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a
            href="https://www.bayer.com/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline"
          >
            Bayer Global
          </a>
          <a
            href="https://www.bayer.com/en/us/crop-science"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:underline"
          >
            Bayer US Crop Science
          </a>
        </div>
      </div>
    </footer>
  );
}

export default React.memo(BayerFooter);
