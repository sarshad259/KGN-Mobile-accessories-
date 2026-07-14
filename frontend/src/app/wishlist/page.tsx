"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

export default function WishlistPage() {
  const { userInfo } = useAuthStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const router = useRouter();
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Auth guard
  useEffect(() => {
    if (!userInfo) {
      toast.error("Please login to view your wishlist");
      router.push("/login?redirect=/wishlist");
    }
  }, [userInfo, router]);

  // Fetch wishlist
  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      if (!userInfo) return [];
      const { data } = await axios.get(`${apiUrl}/api/users/wishlist`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      return data;
    },
    enabled: !!userInfo,
  });

  // Remove from wishlist mutation
  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await axios.post(
        `${apiUrl}/api/users/wishlist`,
        { productId },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      return data;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previous = queryClient.getQueryData(["wishlist"]);
      queryClient.setQueryData(["wishlist"], (old: any[]) =>
        (old || []).filter((item: any) => item._id !== productId)
      );
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      queryClient.setQueryData(["wishlist"], context.previous);
      toast.error("Failed to remove item");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onSuccess: () => {
      toast("Removed from wishlist", { icon: "💔" });
    },
  });

  const handleRemove = (productId: string) => {
    removeMutation.mutate(productId);
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    });
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleAddAllToCart = () => {
    wishlist.forEach((product: any) => {
      addToCart({ id: product._id, name: product.name, price: product.price, image: product.image, qty: 1 });
    });
    toast.success(`${wishlist.length} item${wishlist.length > 1 ? "s" : ""} added to cart! 🛒`);
  };

  if (!userInfo) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <Heart className="w-9 h-9 fill-red-500 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isLoading ? "Loading..." : `${wishlist.length} saved item${wishlist.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              <ShoppingCart className="w-4 h-4" />
              Add All to Cart
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-3xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded-lg w-3/4" />
                  <div className="h-4 bg-muted rounded-lg w-1/2" />
                  <div className="h-10 bg-muted rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && wishlist.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping opacity-30" />
              <div className="relative w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-red-400 opacity-60" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Start saving products you love by clicking the heart icon on any product card.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              <Sparkles className="w-4 h-4" />
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* Wishlist grid */}
        {!isLoading && wishlist.length > 0 && (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {wishlist.map((product: any) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 transition-all flex flex-col"
                >
                  {/* Product Image */}
                  <Link href={`/products/${product._id}`} className="block relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={product.image || "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=400&q=75"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Remove button overlay */}
                    <button
                      onClick={(e) => { e.preventDefault(); handleRemove(product._id); }}
                      disabled={removeMutation.isPending}
                      className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-md rounded-full border border-border/50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md opacity-0 group-hover:opacity-100"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Heart badge */}
                    <div className="absolute top-3 left-3 p-1.5 bg-red-500/90 backdrop-blur-md rounded-full shadow-md">
                      <Heart className="w-3.5 h-3.5 fill-white text-white" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-grow">
                    <Link href={`/products/${product._id}`}>
                      <h3 className="font-bold text-foreground line-clamp-2 text-sm leading-snug hover:text-primary transition-colors mb-1">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mb-3">{product.category}</p>

                    <div className="mt-auto flex items-center justify-between gap-2">
                      <span className="font-black text-lg text-primary">Rs. {product.price?.toFixed(2)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemove(product._id)}
                          disabled={removeMutation.isPending}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          aria-label="Remove from wishlist"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl transition-all text-xs font-bold"
                          aria-label={`Add ${product.name} to cart`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Continue shopping link */}
        {!isLoading && wishlist.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-sm"
            >
              <ArrowRight className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
