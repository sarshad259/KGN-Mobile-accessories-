"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Heart, Loader2, ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function WishlistPage() {
  const { userInfo } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!userInfo) {
      router.push("/login?redirect=/profile/wishlist");
    }
  }, [userInfo, router]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kgn-mobile-accessories.onrender.com";

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/users/wishlist`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      return data;
    },
    enabled: !!userInfo,
  });

  if (!userInfo) return null; // Wait for redirect

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Back navigation */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Your Wishlist</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Saved items you want to buy later.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !wishlist || wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border">
            <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              You haven't saved any products yet. Browse our collection and click the heart icon to save items here!
            </p>
            <Link href="/products" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors">
              Start Browsing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {wishlist.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
