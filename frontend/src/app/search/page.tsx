"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { SearchX, Loader2 } from "lucide-react";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "search", q],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/products?keyword=${encodeURIComponent(q)}`);
      return data;
    },
    enabled: !!q,
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Search Results</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Showing results for <span className="text-primary font-bold">"{q}"</span>
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border">
            <SearchX className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No products found</h2>
            <p className="text-muted-foreground max-w-md">
              We couldn't find anything matching "{q}". Try adjusting your search or browse our categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
