"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { DollarSign, Users, ShoppingBag, TrendingUp, Package, ArrowUpRight, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

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
  isDelivered: boolean;
  createdAt: string;
}

interface UserType {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

interface ProductType {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  category: string;
}

const statusColors: Record<string, string> = {
  Delivered: "bg-green-500/10 text-green-500",
  Processing: "bg-yellow-500/10 text-yellow-600",
  Shipped: "bg-blue-500/10 text-blue-500",
  Pending: "bg-amber-500/10 text-amber-500",
};

export default function AdminDashboard() {
  const { userInfo } = useAuthStore();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kgn-mobile-accessories.onrender.com";

  // Fetch all orders
  const { data: orders, isLoading: loadingOrders } = useQuery<OrderType[]>({
    queryKey: ["admin-orders-dash"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      return data;
    },
    staleTime: 0,
  });

  // Fetch all users
  const { data: users, isLoading: loadingUsers } = useQuery<UserType[]>({
    queryKey: ["admin-users-dash"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/users`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      return data;
    },
    staleTime: 0,
  });

  // Fetch all products
  const { data: products, isLoading: loadingProducts } = useQuery<ProductType[]>({
    queryKey: ["admin-products-dash"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/products`);
      return data;
    },
    staleTime: 0,
  });

  // Dynamically compute live metrics
  const dashboardStats = useMemo(() => {
    const totalOrders = orders ? orders.length : 0;
    const totalUsers = users ? users.length : 0;
    const totalRevenue = orders ? orders.reduce((sum, order) => sum + order.totalPrice, 0) : 0;
    const productsCount = products ? products.length : 0;

    // Conversion rate simple representation
    const conversion = totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(1) : "0.0";

    return [
      { name: "Total Revenue", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, trend: "+14.2%", positive: true, sub: "Live calculations" },
      { name: "Active Users", value: totalUsers.toString(), icon: Users, trend: "+8.5%", positive: true, sub: "Live registrations" },
      { name: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag, trend: "+12.1%", positive: true, sub: "Placed checkouts" },
      { name: "Conversion Rate", value: `${conversion}%`, icon: TrendingUp, trend: "+2.3%", positive: true, sub: "Checkouts vs Users" },
    ];
  }, [orders, users, products]);

  // Dynamically compute top selling products
  const topProducts = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [
        { name: "SonicBass Wireless Earbuds", sales: 0, revenue: "$0.00" },
        { name: "65W GaN Charger", sales: 0, revenue: "$0.00" },
        { name: "KGN Armor Case", sales: 0, revenue: "$0.00" },
      ];
    }

    const counts: Record<string, { qty: number; total: number }> = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!counts[item.name]) {
          counts[item.name] = { qty: 0, total: 0 };
        }
        counts[item.name].qty += item.qty;
        counts[item.name].total += item.price * item.qty;
      });
    });

    return Object.entries(counts)
      .map(([name, val]) => ({
        name,
        sales: val.qty,
        revenue: `$${val.total.toFixed(2)}`,
        rawRevenue: val.total,
      }))
      .sort((a, b) => b.rawRevenue - a.rawRevenue)
      .slice(0, 4);
  }, [orders]);

  const recentOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  const isLoading = loadingOrders || loadingUsers || loadingProducts;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Admin. Real-time store diagnostics from live database.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, i) => (
          <motion.div key={stat.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }}
            className="bg-card p-5 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-primary/10 rounded-xl"><stat.icon className="w-5 h-5 text-primary" /></div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.positive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>{stat.trend}</span>
            </div>
            <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Recent Orders</h3>
            </div>
            <Link href="/admin/orders" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No orders recorded yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {["Order ID", "Customer", "Amount", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order, i) => {
                    const status = order.isDelivered ? "Delivered" : "Processing";
                    return (
                      <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4 font-mono text-primary text-xs font-semibold truncate max-w-[120px]">{order._id}</td>
                        <td className="px-5 py-4 font-medium">{order.user?.name || "Customer"}</td>
                        <td className="px-5 py-4 font-extrabold text-foreground">${order.totalPrice.toFixed(2)}</td>
                        <td className="px-5 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status]}`}>{status}</span></td>
                        <td className="px-5 py-4 text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 p-6 border-b border-border">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Top Products</h3>
          </div>
          <div className="p-4 space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <span className="text-lg font-extrabold text-muted-foreground/40 w-6">#{i + 1}</span>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.sales} sold</p>
                </div>
                <span className="text-sm font-bold text-primary flex-shrink-0">{p.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
