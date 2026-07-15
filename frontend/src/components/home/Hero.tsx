"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const defaultSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=1600&q=80",
    title: "Premium Cables",
    subtitle: "Durable, fast-charging nylon braided cables built to last.",
    cta: "Shop Cables",
    href: "/products",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80",
    title: "Immersive Audio",
    subtitle: "Experience crystal clear sound with KGN Pro Max Earbuds. Now with Active Noise Cancellation.",
    cta: "Shop Audio",
    href: "/categories/audio",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=1600&q=80",
    title: "Ultra-Fast Charging",
    subtitle: "Power up your devices in minutes with our 65W GaN fast chargers.",
    cta: "Shop Chargers",
    href: "/categories/chargers",
  },
];

export default function Hero({ initialSettings }: { initialSettings?: any }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kgn-mobile-accessories.onrender.com";

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/settings`);
      return data;
    },
    initialData: initialSettings && initialSettings.carouselSlides ? initialSettings : undefined,
    staleTime: 1000 * 60 * 5,
  });

  const activeSlides = settings?.carouselSlides && settings.carouselSlides.length > 0 
    ? settings.carouselSlides 
    : defaultSlides;

  const [currentSlide, setCurrentSlide] = useState(0);

  // Ensure currentSlide is within bounds if slides array shrinks
  useEffect(() => {
    if (currentSlide >= activeSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));

  if (!activeSlides[currentSlide]) return null;

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-background">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Subtle overlay to ensure text readability */}
          <div className="absolute inset-0 bg-background/50 z-10" />
          <Image
            src={activeSlides[currentSlide].image}
            alt={activeSlides[currentSlide].title}
            fill
            className="object-cover object-center"
            priority
          />
          
          <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center">
              <div className="max-w-3xl flex flex-col items-center">
                <motion.span 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1 sm:gap-1.5 py-1 px-3 sm:py-1.5 sm:px-4 rounded-full bg-primary/10 text-primary text-[10px] sm:text-sm font-semibold mb-3 sm:mb-6 border border-primary/20 backdrop-blur-md"
                >
                  <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> KGN Accessories
                </motion.span>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-3 sm:mb-6 leading-[1.1] drop-shadow-xl"
                >
                  {activeSlides[currentSlide].title}
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs sm:text-lg md:text-xl text-foreground/95 mb-6 sm:mb-10 max-w-xl leading-relaxed drop-shadow-sm"
                >
                  {activeSlides[currentSlide].subtitle}
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full px-2"
                >
                  <Link
                    href={activeSlides[currentSlide].href}
                    className="inline-flex justify-center items-center gap-1 sm:gap-2 px-4 py-2.5 sm:px-8 sm:py-4 text-xs sm:text-base font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors shadow-lg shadow-primary/25"
                  >
                    {activeSlides[currentSlide].cta.split(" ")[0]} <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex justify-center items-center px-4 py-2.5 sm:px-8 sm:py-4 text-xs sm:text-base font-semibold text-foreground bg-background/50 hover:bg-muted/80 border border-border/50 backdrop-blur-md rounded-full transition-colors"
                  >
                    View All
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center items-center gap-4">
        <button 
          onClick={prevSlide}
          className="p-3 rounded-full bg-background/50 hover:bg-muted/80 text-foreground backdrop-blur-md transition-colors border border-border/50 shadow-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex gap-2">
          {activeSlides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                currentSlide === idx ? "bg-primary w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className="p-3 rounded-full bg-background/50 hover:bg-muted/80 text-foreground backdrop-blur-md transition-colors border border-border/50 shadow-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
