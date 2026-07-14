"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { Star, ShoppingCart, ShieldCheck, Truck, RefreshCw, ChevronLeft, Minus, Plus, Heart } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";

const parseColor = (colorStr: string): { name: string; hex: string } => {
  const clean = colorStr.trim();
  
  if (clean.includes('|')) {
    const parts = clean.split('|');
    const name = parts[0].trim();
    const hex = parts[1].trim();
    return { name, hex: hex.startsWith('#') ? hex : `#${hex}` };
  }
  if (clean.includes(':')) {
    const parts = clean.split(':');
    const name = parts[0].trim();
    const hex = parts[1].trim();
    return { name, hex: hex.startsWith('#') ? hex : `#${hex}` };
  }

  if (clean.startsWith('#')) {
    return { name: clean, hex: clean };
  }
  if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(clean)) {
    return { name: `#${clean}`, hex: `#${clean}` };
  }

  const nameLower = clean.toLowerCase();
  const colorMap: Record<string, string> = {
    black: "#111827",
    white: "#FFFFFF",
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#10B981",
    gray: "#6B7280",
    grey: "#6B7280",
    silver: "#E5E7EB",
    gold: "#D97706",
    golden: "#F59E0B",
    yellow: "#FBBF24",
    purple: "#8B5CF6",
    pink: "#EC4899",
    orange: "#F97316",
    navy: "#1E3A8A",
    "navy blue": "#1E3A8A",
    sky: "#0EA5E9",
    "sky blue": "#7DD3FC",
    "rose gold": "#B76E79",
    copper: "#B87333",
    bronze: "#CD7F32",
    midnight: "#1E293B",
    "midnight blue": "#0F172A",
  };
  return { name: clean, hex: colorMap[nameLower] || clean };
};

const getColorHex = (colorName: string): string => {
  return parseColor(colorName).hex;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const addToCart = useCartStore((state) => state.addToCart);
  const [qty, setQty] = useState(1);
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch product from backend
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/products/${id}`);
      return data;
    },
    retry: false,
  });

  // Fetch related products based on category
  const { data: relatedProducts } = useQuery({
    queryKey: ["products", "related", product?.category],
    queryFn: async () => {
      if (!product?.category) return [];
      const { data } = await axios.get(`${apiUrl}/api/products?category=${encodeURIComponent(product.category)}`);
      return data.filter((p: any) => p._id !== id).slice(0, 4);
    },
    enabled: !!product?.category,
  });

  // Fetch wishlist status
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

  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/settings`);
      return data;
    },
  });

  const freeShippingThreshold = settings?.freeShippingThreshold ?? 10000;

  const filteredReviews = useMemo(() => {
    if (!product || !Array.isArray(product.reviews)) return [];
    if (starFilter === null) return product.reviews;
    return product.reviews.filter((r: any) => r.rating === starFilter);
  }, [product, starFilter]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [product.image, ...(Array.isArray(product.images) ? product.images : [])];
    return Array.from(new Set(list)).filter(Boolean);
  }, [product]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      if (Array.isArray(product.colors) && product.colors.length > 0) {
        setSelectedColor(parseColor(product.colors[0]).name);
      } else {
        setSelectedColor("");
      }
    }
  }, [product]);

  const isLiked = wishlist.some((item: any) => item._id === id);

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        `${apiUrl}/api/users/wishlist`,
        { productId: id },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      if (!isLiked) toast.success("Added to wishlist! ❤️");
      else toast("Removed from wishlist", { icon: "💔" });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err.message || "Failed to update wishlist"),
  });

  const handleAddToCart = () => {
    if (!product) return;
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color!");
      return;
    }
    addToCart({
      id: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      qty,
      selectedColor: selectedColor || undefined,
    });
    toast.success(`${product.name}${selectedColor ? ` (${selectedColor})` : ""} added to cart!`, { icon: "🛒" });
  };

  // Submit review mutation
  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      const { data } = await axios.post(
        `${apiUrl}/api/products/${id}/reviews`,
        reviewData,
        {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Review submitted successfully! ⭐");
      setComment("");
      setRating(5);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    },
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please add a comment");
      return;
    }
    reviewMutation.mutate({ rating, comment });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">Product not found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The product you are looking for does not exist in our catalog database.</p>
          <button onClick={() => router.push("/products")} className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl">Back to Store</button>
        </main>
        <Footer />
      </div>
    );
  }

  const displayProduct = product;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Back navigation */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 font-semibold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Product Image / Video & Thumbnails */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-border bg-muted shadow-sm flex items-center justify-center">
              {activeImage === "video" && displayProduct.video ? (
                <video 
                  src={displayProduct.video} 
                  controls 
                  className="w-full h-full object-cover"
                  autoPlay
                />
              ) : (
                <Image 
                  src={activeImage || displayProduct.image} 
                  alt={displayProduct.name} 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
            </div>

            {/* Thumbnail Gallery & Video Trigger */}
            <div className="flex flex-wrap gap-2">
              {galleryImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border bg-muted transition-all ${
                    activeImage === img && activeImage !== "video"
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}

              {displayProduct.video && (
                <button
                  onClick={() => setActiveImage("video")}
                  className={`w-16 h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all bg-card text-center ${
                    activeImage === "video"
                      ? "border-primary ring-2 ring-primary/20 scale-105 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground"
                  }`}
                >
                  <span className="text-lg">🎥</span>
                  <span className="text-[9px] font-bold uppercase">Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full">
                {displayProduct.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-4">
                {displayProduct.name}
              </h1>
              
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(displayProduct.rating || 5) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">{displayProduct.rating || 5}</span>
                <span className="text-xs text-muted-foreground">({displayProduct.numReviews || (displayProduct.reviews?.length) || 0} customer reviews)</span>
              </div>
            </div>

            <div className="border-t border-b border-border py-4">
              {displayProduct.discountPrice && displayProduct.discountPrice < displayProduct.price ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-extrabold text-primary">
                      Rs. {displayProduct.discountPrice.toFixed(2)}
                    </p>
                    <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Save Rs. {(displayProduct.price - displayProduct.discountPrice).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-through decoration-red-500/50 decoration-2">
                    Rs. {displayProduct.price.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-3xl font-extrabold text-foreground">
                  Rs. {displayProduct.price.toFixed(2)}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Free shipping on orders over Rs. {freeShippingThreshold.toLocaleString()}.
              </p>
            </div>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {displayProduct.description || "Designed with premium quality materials. Engineered to stand up to heavy daily wear and provide ultimate ease of use, durability, and a clean minimalist aesthetic."}
            </p>

            {/* Color Selector */}
            {displayProduct.colors && displayProduct.colors.length > 0 && (
              <div className="space-y-3 pb-2">
                <span className="text-sm font-bold text-muted-foreground">Select Color:</span>
                <div className="flex flex-wrap gap-2">
                  {displayProduct.colors.map((colorStr: string) => {
                    const parsed = parseColor(colorStr);
                    return (
                      <button
                        key={colorStr}
                        onClick={() => setSelectedColor(parsed.name)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedColor === parsed.name
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-card text-foreground border-border hover:bg-muted"
                        }`}
                      >
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10 inline-block flex-shrink-0"
                          style={{ backgroundColor: parsed.hex }}
                          aria-hidden="true"
                        />
                        {parsed.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Qty and Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-muted-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-xl bg-card overflow-hidden">
                  <button 
                    onClick={() => setQty(p => Math.max(p - 1, 1))}
                    className="px-3 py-2 hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-extrabold">{qty}</span>
                  <button 
                    onClick={() => setQty(p => p + 1)}
                    className="px-3 py-2 hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  onClick={handleAddToCart}
                  className="flex-grow flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all text-base"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Shopping Cart
                </button>
                <button
                  onClick={() => {
                    if (!userInfo) return toast.error("Please login to save products");
                    toggleWishlist.mutate();
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-4 border border-border bg-card hover:bg-muted text-foreground font-bold rounded-2xl transition-all"
                  aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Bulk Order Info */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between gap-4 mt-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-primary">Need Bulk Quantities?</p>
                <p className="text-[10px] text-muted-foreground">We offer special bulk pricing rates for retailers and commercial distributors.</p>
              </div>
              <a 
                href="https://wa.me/923265909963?text=Hi!%20I%20am%20interested%20in%20buying%20KGN%20Accessories%20products%20in%20bulk." 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold text-[10px] rounded-xl transition-all shadow-md shrink-0"
              >
                Inquire Bulk
              </a>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-border">
              <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/40 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">1 Year Warranty</p>
                  <p className="text-[10px] text-muted-foreground">100% genuine guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/40 rounded-2xl">
                <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">Fast Shipping</p>
                  <p className="text-[10px] text-muted-foreground">Worldwide express transit</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/40 rounded-2xl">
                <RefreshCw className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">30-Day Returns</p>
                  <p className="text-[10px] text-muted-foreground">Hassle-free dynamic exchange</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-border pt-12">
            <h2 className="text-2xl font-bold text-foreground mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-20 border-t border-border pt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>
          
          {/* Summary / Stats */}
          {/* Summary / Stats */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 bg-card border border-border p-6 rounded-3xl shadow-sm items-center">
            <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-8">
              <p className="text-5xl font-black text-foreground">{displayProduct.rating || 0}</p>
              <div className="flex items-center justify-center gap-0.5 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.floor(displayProduct.rating || 0) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} 
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-semibold">
                Based on {displayProduct.reviews?.length || 0} reviews
              </p>
            </div>
            
            <div className="md:col-span-8 space-y-2 text-xs">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = Array.isArray(displayProduct.reviews) ? displayProduct.reviews.filter((r: any) => r.rating === star).length : 0;
                const total = Array.isArray(displayProduct.reviews) ? displayProduct.reviews.length || 1 : 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-12 font-bold text-muted-foreground whitespace-nowrap text-right">{star} Star</span>
                    <div className="flex-grow h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-right text-muted-foreground font-bold">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Star Filter Tabs */}
          {displayProduct.reviews && displayProduct.reviews.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 items-center">
              <span className="text-xs font-bold text-muted-foreground mr-2">Filter Reviews:</span>
              <button
                onClick={() => setStarFilter(null)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                  starFilter === null
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                All ({displayProduct.reviews.length})
              </button>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = displayProduct.reviews ? displayProduct.reviews.filter((r: any) => r.rating === star).length : 0;
                return (
                  <button
                    key={star}
                    onClick={() => setStarFilter(star)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                      starFilter === star
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    ★ {star} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Review List */}
          <div className="space-y-6 mb-10">
            {filteredReviews && filteredReviews.length > 0 ? (
              filteredReviews.map((r: any) => (
                <div key={r._id} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-foreground text-sm">{r.name}</p>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {new Date(r.createdAt || r.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{r.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-muted/20 border border-dashed border-border rounded-2xl">
                <p className="text-sm text-muted-foreground">
                  {starFilter !== null 
                    ? `No ${starFilter}-star reviews match your filter.` 
                    : "No reviews yet. Be the first to review this product!"}
                </p>
              </div>
            )}
          </div>

          {/* Form to submit review */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Write a Review</h3>
            {userInfo ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform active:scale-95 hover:scale-110"
                      >
                        <Star 
                          className={`w-8 h-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Review Comment</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">Please log in to write a review.</p>
                <button
                  onClick={() => router.push(`/login?redirect=/products/${id}`)}
                  className="px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 font-bold rounded-xl text-sm transition-all"
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
