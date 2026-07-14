"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const { data: wishlist = [] } = useQuery({
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

  const isLiked = wishlist.some((item: any) => item._id === product._id);

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        `${apiUrl}/api/users/wishlist`,
        { productId: product._id },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);
      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!old) return [];
        if (isLiked) return old.filter((item: any) => item._id !== product._id);
        return [...old, product];
      });
      return { previousWishlist };
    },
    onError: (err: any, newTodo, context: any) => {
      queryClient.setQueryData(["wishlist"], context.previousWishlist);
      toast.error(err?.response?.data?.message || err.message || "Failed to update wishlist");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userInfo) {
      toast.error("Please login to save products to your wishlist");
      return;
    }
    toggleWishlist.mutate();
    if (!isLiked) {
      toast.success("Added to wishlist! ❤️");
    } else {
      toast("Removed from wishlist", { icon: "💔" });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      qty: 1,
    });
    toast.success(`${product.name} added to cart!`, { icon: "🛒" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group bg-card rounded-3xl border border-border shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all overflow-hidden flex flex-col relative"
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 backdrop-blur-md border border-border/50 hover:bg-background transition-all"
        aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-5 h-5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
      </button>

      {/* Sale Badge */}
      {product.discountPrice && product.discountPrice < product.price && (
        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
          Sale
        </div>
      )}

      <Link href={`/products/${product._id}`} className="block relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image || "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=400&q=75"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>
      <div className="p-5 flex flex-col flex-grow relative">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.floor(product.rating || 5)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.numReviews || 0})</span>
        </div>

        <Link href={`/products/${product._id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-extrabold text-foreground line-clamp-2 text-lg leading-tight">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            {product.discountPrice && product.discountPrice < product.price ? (
              <>
                <span className="font-black text-xl text-primary">Rs. {product.discountPrice.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground line-through decoration-red-500/50 decoration-2">Rs. {product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-black text-xl text-primary">Rs. {product.price?.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground p-3 rounded-xl transition-colors shadow-sm"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
