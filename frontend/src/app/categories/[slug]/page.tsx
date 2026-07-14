"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { useParams } from "next/navigation";

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Capitalize slug and handle hyphens for display
  const title = slug 
    ? slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") 
    : "";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-8">{title}</h1>
          <p className="text-muted-foreground mb-12">Explore our premium selection of {slug} products.</p>
          <FeaturedProducts category={slug} showAll />
        </div>
      </main>
      <Footer />
    </div>
  );
}
