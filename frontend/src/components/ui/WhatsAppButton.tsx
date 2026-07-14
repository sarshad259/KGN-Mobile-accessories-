"use client";

import { useState } from "react";

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);
  const phoneNumber = "923265909963";
  const message = encodeURIComponent("Hi! I need help with my order on KGN Accessories 🛍️");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group flex-row-reverse"
      aria-label="Chat on WhatsApp"
    >
      {/* Button */}
      <div className="relative">
        {/* Pulsing ring */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />
        {/* Shadow glow */}
        <div
          className={`absolute inset-0 rounded-full bg-green-500 blur-xl transition-opacity duration-300 ${
            isHovered ? "opacity-40" : "opacity-0"
          }`}
        />
        {/* Main button */}
        <div className="relative w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110">
          {/* Official WhatsApp SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="w-8 h-8"
            aria-hidden="true"
          >
            <path
              fill="#fff"
              d="M16 0C7.164 0 0 7.163 0 16c0 2.824.737 5.474 2.027 7.775L0 32l8.438-2.012A15.937 15.937 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.773-1.853l-.485-.288-5.013 1.196 1.226-4.875-.317-.502A13.266 13.266 0 012.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.27-9.91c-.398-.199-2.356-1.163-2.72-1.295-.364-.133-.629-.199-.894.199-.265.398-1.028 1.295-1.26 1.561-.231.265-.463.298-.861.1-.397-.199-1.677-.618-3.194-1.972-1.18-1.053-1.977-2.354-2.208-2.752-.232-.398-.025-.613.174-.811.178-.178.398-.464.597-.696.2-.232.265-.398.398-.663.133-.265.066-.497-.033-.696-.1-.199-.894-2.155-1.225-2.95-.323-.774-.65-.669-.894-.681l-.762-.013c-.265 0-.696.1-1.06.497-.364.398-1.39 1.36-1.39 3.316 0 1.956 1.423 3.846 1.622 4.112.2.265 2.8 4.274 6.784 5.994.948.409 1.688.653 2.265.835.951.302 1.817.26 2.501.157.763-.113 2.356-.963 2.688-1.893.332-.929.332-1.726.232-1.893-.099-.166-.364-.265-.762-.464z"
            />
          </svg>
        </div>
      </div>
      {/* Tooltip — slides in from the left */}
      <span
        className={`hidden sm:block bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 whitespace-nowrap ${
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        Chat with us on WhatsApp 💬
      </span>
    </a>
  );
}

