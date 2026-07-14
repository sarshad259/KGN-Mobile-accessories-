"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import { CheckCircle2, Clock, MapPin, DollarSign, Calendar, Truck, User, AlertCircle } from "lucide-react";
import Image from "next/image";

interface OrderType {
  _id: string;
  user?: {
    name: string;
    email: string;
  };
  orderItems: {
    name: string;
    qty: number;
    image: string;
    price: number;
    color?: string;
  }[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [filter, setFilter] = useState<"all" | "pending" | "undelivered">("all");

  // Fetch all orders
  const { data: orders, isLoading } = useQuery<OrderType[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      return data;
    },
    staleTime: 0,
  });

  // Mutation to deliver order
  const deliverMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.put(`${apiUrl}/api/orders/${id}/deliver`, {}, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order marked as Delivered! 🚚");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Delivery update failed");
    },
  });

  const handleDeliver = (id: string) => {
    deliverMutation.mutate(id);
  };

  // Mutation to verify/pay order
  const payMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.put(`${apiUrl}/api/orders/${id}/pay`, {}, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Payment verified and marked as Paid! 💳");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Payment verification failed");
    },
  });

  const handlePay = (id: string) => {
    payMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-3xl border border-border">
        <p className="text-4xl mb-4">📦</p>
        <h3 className="text-xl font-bold mb-2">No orders placed yet</h3>
        <p className="text-muted-foreground">Once a customer orders, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
        <p className="text-muted-foreground mt-1">Track payments, shipping details, and manage fulfillment.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        {([
          { key: "all", label: "All Orders", count: orders.length },
          { key: "pending", label: "⚠ Pending Payment", count: orders.filter(o => !o.isPaid).length },
          { key: "undelivered", label: "📦 Undelivered", count: orders.filter(o => !o.isDelivered).length },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filter === tab.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                filter === tab.key ? "bg-white/20" : tab.key === "pending" && tab.count > 0 ? "bg-yellow-500/20 text-yellow-600" : "bg-muted-foreground/20"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}

        {/* Pending payment alert banner */}
        {orders.filter(o => !o.isPaid).length > 0 && filter !== "pending" && (
          <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-600 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            {orders.filter(o => !o.isPaid).length} unpaid order(s)!
          </div>
        )}
      </div>

      <div className="space-y-6">
        {orders
          .filter(order => {
            if (filter === "pending") return !order.isPaid;
            if (filter === "undelivered") return !order.isDelivered;
            return true;
          })
          .map((order) => (
          <div key={order._id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:border-primary/25 transition-all">
            {/* Header */}
            <div className="bg-muted/40 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-border gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-mono text-xs font-bold text-primary truncate max-w-[200px]">{order._id}</p>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Date Placed</p>
                  <p className="text-sm font-semibold text-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">Total Price</p>
                  <p className="text-sm font-extrabold text-foreground">Rs. {order.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Products */}
              <div className="lg:col-span-6 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Items</p>
                <div className="space-y-3">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-muted/20 p-2.5 rounded-2xl border border-border/40">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">Qty: {item.qty} × Rs. {item.price.toFixed(2)}</p>
                          {item.color && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                              {item.color}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping */}
              <div className="lg:col-span-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Shipping Address</p>
                <div className="text-sm text-foreground space-y-0.5">
                  <p className="font-bold flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-muted-foreground" /> {order.user?.name || "Customer"}</p>
                  <p className="text-muted-foreground">{order.shippingAddress.address}</p>
                  <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Status */}
              <div className="lg:col-span-3 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Status & Payment</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {order.isPaid ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
                      <span className="text-xs font-semibold">{order.isPaid ? "Paid" : "Pending Payment"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.isDelivered ? <Truck className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-blue-500 animate-pulse" />}
                      <span className="text-xs font-semibold">{order.isDelivered ? "Delivered" : "In Transit"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {!order.isPaid && (
                    <button
                      onClick={() => handlePay(order._id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 font-bold rounded-xl text-xs transition-all border border-green-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark as Paid 💵
                    </button>
                  )}

                  {!order.isDelivered && (
                    <button onClick={() => handleDeliver(order._id)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                      <Truck className="w-4 h-4" /> Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
