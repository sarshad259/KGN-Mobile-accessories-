"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, CreditCard, Box, Check, Loader2, ArrowRight, HelpCircle } from "lucide-react";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  _id: string;
}

interface OrderDetails {
  _id: string;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  orderItems: OrderItem[];
  totalPrice: number;
}

export default function OrderTrackingPage() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [searchId, setSearchId] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const { data: order, isLoading, isError, error } = useQuery<OrderDetails>({
    queryKey: ["track-order", searchId],
    queryFn: async () => {
      if (!searchId) return null;
      // Strip spaces or quotes
      const cleanId = searchId.trim();
      const { data } = await axios.get(`${apiUrl}/api/orders/${cleanId}/track`);
      return data;
    },
    enabled: !!searchId,
    retry: false,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      setSearchId(orderIdInput.trim());
    }
  };

  // Determine steps status
  const getTimelineSteps = (ord: OrderDetails) => {
    const steps = [
      {
        title: "Order Placed",
        description: "Your order has been recorded successfully",
        date: new Date(ord.createdAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }),
        completed: true,
        active: true,
      },
      {
        title: "Payment Status",
        description: ord.isPaid 
          ? `Verified & Cleared` 
          : ord.paymentMethod === "Cash on Delivery"
            ? "Will be collected upon delivery"
            : "Awaiting bank/transfer validation",
        date: ord.paidAt ? new Date(ord.paidAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : undefined,
        completed: ord.isPaid || ord.paymentMethod === "Cash on Delivery", // COD is implicitly processed as ready-for-courier
        active: ord.isPaid,
      },
      {
        title: "Dispatched (Pakistan Post)",
        description: ord.isDelivered 
          ? "Parcel dispatched via Pakistan Post Office"
          : "Preparing package for shipment dispatch",
        date: ord.deliveredAt ? new Date(ord.deliveredAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : undefined,
        completed: ord.isDelivered,
        active: ord.isDelivered,
      },
      {
        title: "Delivered",
        description: ord.isDelivered 
          ? "Order successfully delivered to your doorstep"
          : "Awaiting delivery handoff",
        date: ord.deliveredAt ? new Date(ord.deliveredAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" }) : undefined,
        completed: ord.isDelivered,
        active: ord.isDelivered,
      }
    ];
    return steps;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">Track Your Shipment</h1>
          <p className="text-muted-foreground mt-3">
            Enter your order ID (provided in your confirmation receipt) to check your shipping and payment status dynamically.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-16 relative">
          <div className="relative flex items-center bg-card rounded-2xl border border-border shadow-md focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-transparent transition-all overflow-hidden p-1.5 pr-2">
            <Search className="w-5 h-5 text-muted-foreground ml-3.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="e.g. 64d9f67a2d8e4c001f3b25a1"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full pl-3 pr-4 py-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-all shadow-md active:scale-95 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Locating...
                </>
              ) : (
                <>
                  Track
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results Container */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground text-sm font-semibold">Retrieving shipping metrics...</p>
            </motion.div>
          )}

          {isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto text-center p-8 bg-destructive/5 border border-destructive/20 rounded-3xl"
            >
              <HelpCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-70" />
              <h3 className="text-lg font-bold text-foreground">Order Not Found</h3>
              <p className="text-muted-foreground text-xs leading-relaxed mt-2">
                We couldn't find an order matching that ID. Please check the ID and try again, or reach out to customer support on WhatsApp.
              </p>
            </motion.div>
          )}

          {!isLoading && !isError && order && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
            >
              {/* Stepper Timeline */}
              <div className="md:col-span-7 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-8">
                <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border/60 pb-3">
                  <Box className="w-5 h-5 text-primary" /> Delivery Status Progress
                </h2>

                <div className="relative pl-8 border-l border-border/80 ml-4 space-y-8">
                  {getTimelineSteps(order).map((step, idx) => (
                    <div key={idx} className="relative">
                      {/* Checkmark circle */}
                      <span
                        className={`absolute -left-12 top-0.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                          step.completed
                            ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20"
                            : "bg-background border-border text-muted-foreground"
                        }`}
                      >
                        {step.completed ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </span>

                      <div>
                        <h3 className={`text-sm font-bold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                        {step.date && (
                          <p className="text-[10px] text-primary/80 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {step.date}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Info Summary */}
              <div className="md:col-span-5 space-y-6">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold border-b border-border/60 pb-3 mb-4">Parcel Details</h2>
                  
                  <div className="text-xs space-y-3 mb-5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono font-bold">{order._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-semibold text-foreground">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        order.isPaid ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {order.isPaid ? "PAID ✓" : "PENDING"}
                      </span>
                    </div>
                  </div>

                  <ul className="border-t border-border pt-4 space-y-3 mb-4 max-h-48 overflow-y-auto pr-1" aria-label="Items in tracking parcel">
                    {order.orderItems.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-xs">
                        <span className="truncate max-w-[200px] font-medium text-muted-foreground">
                          {item.name} <strong className="text-foreground">× {item.qty}</strong>
                        </span>
                        <span className="font-bold text-foreground">Rs. {(item.price * item.qty).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-border pt-3 flex justify-between items-center text-sm">
                    <span className="font-bold">Total Bill:</span>
                    <span className="font-extrabold text-primary text-lg">Rs. {order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Warning Info Card */}
                <div className="bg-blue-500/5 border border-blue-500/25 rounded-3xl p-5 space-y-2">
                  <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5">
                    📦 Pakistan Post Handoff
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Note: Your shipping fee will be charged by the **Pakistan Post Office** upon arrival. Please pay the delivery agent directly when they hand off the product.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
