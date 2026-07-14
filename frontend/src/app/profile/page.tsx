"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User, Package, MapPin, LogOut, CheckCircle2, Clock, Truck, FileText, MessageSquare, CornerDownRight } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { userInfo, logout } = useAuthStore();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Auth guard
  useEffect(() => {
    if (!userInfo) {
      router.push("/login?redirect=/profile");
    }
  }, [userInfo, router]);

  const [activeTab, setActiveTab] = useState<"orders" | "inquiries">("orders");

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["myorders"],
    queryFn: async () => {
      if (!userInfo?.token) return [];
      const { data } = await axios.get(`${apiUrl}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      return data;
    },
    enabled: !!userInfo?.token,
  });

  // Fetch inquiries
  const { data: inquiries, isLoading: inquiriesLoading } = useQuery({
    queryKey: ["myinquiries"],
    queryFn: async () => {
      if (!userInfo?.token) return [];
      const { data } = await axios.get(`${apiUrl}/api/contact/my`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      return data;
    },
    enabled: !!userInfo?.token,
  });

  if (!userInfo) return null;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar Profile Info */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-secondary/20" />
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-background mx-auto flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-extrabold">{userInfo.name}</h2>
                <p className="text-muted-foreground text-sm mb-6">{userInfo.email}</p>
                <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-2 bg-muted rounded-xl w-max mx-auto mb-6">
                  {userInfo.isAdmin ? "👑 Administrator" : "🛒 Customer"}
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-black text-primary">{orders?.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Total Orders</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-black text-foreground">
                  {orders?.filter((o: any) => o.isDelivered).length || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Delivered</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full md:w-2/3 space-y-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-border pb-2">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
                  activeTab === "orders"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="w-4 h-4" /> Order History
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
                  activeTab === "inquiries"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Support Inquiries
              </button>
            </div>

            {activeTab === "orders" ? (
              <div>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="text-center py-20 bg-card rounded-3xl border border-border">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6">When you place an order, it will appear here.</p>
                    <button onClick={() => router.push('/products')} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all">Start Shopping</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order: any) => (
                      <div key={order._id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Order Header */}
                        <div className="bg-muted/50 p-5 sm:px-6 flex flex-wrap items-center justify-between gap-4 border-b border-border">
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Order Number</p>
                            <p className="font-mono text-sm">{order._id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Date Placed</p>
                            <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total Amount</p>
                            <p className="text-sm font-bold text-primary">Rs. {order.totalPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <button className="text-primary hover:underline text-sm font-semibold flex items-center gap-1">
                              <FileText className="w-4 h-4" /> Receipt
                            </button>
                          </div>
                        </div>

                        {/* Order Body */}
                        <div className="p-5 sm:p-6">
                          {/* Status Badges */}
                          <div className="flex flex-wrap items-center gap-3 mb-6">
                            {order.isDelivered ? (
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20">
                                <Truck className="w-3.5 h-3.5" /> In Transit
                              </span>
                            )}

                            {order.isPaid ? (
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-500/20">
                                <Clock className="w-3.5 h-3.5" /> {order.paymentMethod} (Pending Payment)
                              </span>
                            )}
                          </div>

                          {/* Items */}
                          <div className="space-y-4">
                            {order.orderItems.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 relative">
                                  <Image
                                    src={item.image || "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=64&q=75"}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>
                                 <div className="flex-grow min-w-0">
                                   <p className="font-semibold text-sm truncate">{item.name}</p>
                                   <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                     <p className="text-xs text-muted-foreground">Qty: {item.qty} × Rs. {item.price.toFixed(2)}</p>
                                     {item.color && (
                                       <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                                         {item.color}
                                       </span>
                                     )}
                                   </div>
                                 </div>
                                <p className="font-bold text-sm flex-shrink-0">Rs. {(item.qty * item.price).toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {inquiriesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-28 bg-card border border-border rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : !inquiries || inquiries.length === 0 ? (
                  <div className="text-center py-20 bg-card rounded-3xl border border-border">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">No support inquiries</h3>
                    <p className="text-muted-foreground mb-6">If you send us a message through the contact page, it will display here.</p>
                    <button onClick={() => router.push('/contact')} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all">Submit Inquiry</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inq: any) => (
                      <div key={inq._id} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className={`inline-flex text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 ${
                              inq.reply 
                                ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}>
                              {inq.reply ? "Replied ✓" : "Pending Response"}
                            </span>
                            <h3 className="font-bold text-base text-foreground leading-tight">{inq.subject}</h3>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {inq.message}
                        </p>

                        {inq.reply && (
                          <div className="pt-4 border-t border-border/60 flex items-start gap-2.5">
                            <CornerDownRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="bg-muted/40 border border-border/80 rounded-2xl p-4 flex-grow text-xs leading-relaxed">
                              <p className="font-bold text-foreground mb-1 text-[10px] uppercase tracking-wider text-primary">Store Response</p>
                              <p className="whitespace-pre-wrap text-muted-foreground">{inq.reply}</p>
                              <span className="text-[9px] text-muted-foreground/60 mt-2 block">
                                Replied on {new Date(inq.repliedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
