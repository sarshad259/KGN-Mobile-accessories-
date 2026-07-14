"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronRight, Sparkles } from "lucide-react";

const categories = [
  { 
    name: "Data Cables", 
    slug: "cables", 
    desc: "Nylon braided durable charging cables",
    image: "/cable.png",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "group-hover:border-blue-500/30"
  },
  { 
    name: "Fast Chargers", 
    slug: "chargers", 
    desc: "High-speed GaN adapters & durable cables",
    image: "/charger.png",
    color: "from-yellow-500/20 to-amber-500/20",
    border: "group-hover:border-yellow-500/30"
  },
  { 
    name: "Earbuds & Audio", 
    slug: "audio", 
    desc: "True wireless sound & immersive active noise cancelling",
    image: "/audio.png",
    color: "from-purple-500/20 to-pink-500/20",
    border: "group-hover:border-purple-500/30"
  },
  { 
    name: "Power Banks", 
    slug: "power-banks", 
    desc: "Heavy-duty MagSafe portable backup batteries",
    image: "/powerbank.png",
    color: "from-green-500/20 to-emerald-500/20",
    border: "group-hover:border-green-500/30"
  },
];

export default function CategoriesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title Header */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Premium Collections
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">Shop by Category</h1>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Explore our curated collections of premium, ultra-durable accessories engineered to complement your active lifestyle.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, idx) => (
            <Link key={cat.slug} href={`/categories/${cat.slug}`} className="group block">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`relative h-[480px] rounded-3xl overflow-hidden border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 ${cat.border}`}
              >
                {/* Background Glow Blobs */}
                <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none`} />

                {/* Main Premium Category Image with exact aspect ratios */}
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={cat.image} 
                    alt={cat.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    quality={75}
                  />
                  {/* Premium overlay gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 space-y-3">
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary-foreground/10 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                    Explore
                  </span>
                  
                  <div>
                    <h3 className="text-2xl font-extrabold text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {cat.name}
                      <ChevronRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                    </h3>
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
