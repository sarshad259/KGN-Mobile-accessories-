"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/useCartStore";
import { useMemo } from "react";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  sort?: string;
  search?: string;
  category?: string;
  showAll?: boolean;
}

export default function FeaturedProducts({ sort = "default", search = "", category = "all", showAll = false }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: fetchedProducts, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const { data } = await axios.get(`${apiUrl}/api/products`);
      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const baseProducts = fetchedProducts || [];

  const displayProducts = useMemo(() => {
    let list = [...baseProducts];

    // Filter by category
    if (category && category !== "all") {
      list = list.filter((p: any) => p.category?.toLowerCase().replace(/\s+/g, "-") === category);
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p: any) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }

    // Sort
    switch (sort) {
      case "price-asc": list.sort((a: any, b: any) => a.price - b.price); break;
      case "price-desc": list.sort((a: any, b: any) => b.price - a.price); break;
      case "rating": list.sort((a: any, b: any) => b.rating - a.rating); break;
      case "newest": list.reverse(); break;
    }

    return showAll ? list : list.slice(0, 4);
  }, [baseProducts, sort, search, category, showAll]);

  const handleAddToCart = (product: any) => {
    addToCart({ id: product.id || product._id, name: product.name, price: product.price, image: product.image, qty: 1 });
    toast.success(`${product.name} added to cart!`, { icon: "🛒" });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[...Array(showAll ? 8 : 4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-3 sm:p-5 space-y-2"><div className="h-3 bg-muted rounded w-12" /><div className="h-4 bg-muted rounded w-3/4" /><div className="h-8 bg-muted rounded" /></div>
          </div>
        ))}
      </div>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-2xl border border-border">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-xl font-bold mb-2">No products found</p>
        <p className="text-muted-foreground">Try adjusting your search or filter.</p>
      </div>
    );
  }

  return (
    <section className={showAll ? "" : "py-20 bg-background"}>
      <div className={showAll ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        {!showAll && (
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Handpicked For You</span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-1">Featured Products</h2>
              <p className="mt-1 text-muted-foreground text-sm">Premium quality, trusted by thousands.</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-primary font-semibold text-sm hover:underline">View all →</Link>
          </div>
        )}

        {showAll && (
          <p className="text-sm text-muted-foreground mb-6">{displayProducts.length} products found</p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayProducts.map((product: any, index: number) => (
            <div key={product.id || product._id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {!showAll && (
          <div className="mt-8 sm:hidden text-center">
            <Link href="/products" className="text-primary font-semibold text-sm hover:underline">View all products →</Link>
          </div>
        )}
      </div>
    </section>
  );
}
