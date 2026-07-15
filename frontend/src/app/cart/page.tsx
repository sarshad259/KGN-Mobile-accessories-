"use client";

import { useCartStore } from "@/store/useCartStore";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, cartTotal } = useCartStore();
  const { userInfo } = useAuthStore();
  const router = useRouter();

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userInfo) {
      toast.error("Please login to proceed to checkout!");
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kgn-mobile-accessories.onrender.com";

  // Fetch settings dynamically
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/settings`);
      return data;
    },
  });

  const baseShippingFee = settings?.shippingFee ?? 350;
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 10000;

  const shippingFee = cartTotal() > freeShippingThreshold ? 0 : baseShippingFee;
  const grandTotal = cartTotal() + shippingFee;

  const handleRemove = (id: string | number, name: string, selectedColor?: string) => {
    removeFromCart(id, selectedColor);
    toast.error(`${name}${selectedColor ? ` (${selectedColor})` : ""} removed from cart`, { icon: "🗑️" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground mb-8">{cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart</p>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-border shadow-sm"
          >
            <ShoppingBag className="w-20 h-20 text-muted-foreground mb-6 opacity-20" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-7 space-y-3">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    layout
                    key={`${item.id}-${item.selectedColor || "none"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-4 bg-card p-4 rounded-2xl border border-border hover:border-primary/20 hover:shadow-md transition-all"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-foreground truncate">{item.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <p className="text-primary font-semibold">Rs. {item.price.toFixed(2)}</p>
                        {item.selectedColor && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary/15 text-secondary border border-secondary/10">
                            Color: {item.selectedColor}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Qty Stepper */}
                        <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background">
                          <button
                            onClick={() => updateQty(item.id, item.qty - 1, item.selectedColor)}
                            className="px-3 py-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-sm font-bold">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, item.qty + 1, item.selectedColor)}
                            className="px-3 py-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <p className="font-extrabold text-foreground">Rs. {(item.price * item.qty).toFixed(2)}</p>
                          <button
                            onClick={() => handleRemove(item.id, item.name, item.selectedColor)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-card p-6 rounded-3xl border border-border shadow-xl sticky top-24">
                <h2 className="text-xl font-bold mb-5">Order Summary</h2>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({cartItems.reduce((a, b) => a + b.qty, 0)} items)</span>
                    <span className="font-semibold">Rs. {cartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold text-secondary">Pay on Delivery</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="font-bold text-base">Total</span>
                    <span className="font-extrabold text-2xl text-primary">Rs. {cartTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-secondary/5 border border-secondary/15 rounded-xl">
                  <p className="text-xs text-center text-muted-foreground">
                    Notice: Shipping charges are calculated by the <strong className="text-foreground">Pakistan Post Office</strong> according to your address. You will pay the shipping fee directly to them upon delivery.
                  </p>
                </div>

                <button
                  onClick={handleCheckoutClick}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all text-base cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </button>

                <Link href="/products" className="mt-3 block text-center text-sm text-muted-foreground hover:text-primary transition-colors">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
