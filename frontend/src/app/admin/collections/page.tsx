"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { Tag, ShoppingBag, DollarSign, Archive, Star, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

interface ProductType {
  _id?: string;
  name: string;
  price: number;
  category: string;
  rating?: number;
  reviews?: number;
  countInStock?: number;
}

interface OrderType {
  _id: string;
  orderItems: {
    name: string;
    qty: number;
    price: number;
    product: string;
  }[];
}

const collectionsData = [
  { name: "Cables", slug: "cables", image: "/cable.png", desc: "Nylon braided durable premium charging cables", color: "from-blue-500/10 to-cyan-500/10 text-blue-500 border-blue-500/20" },
  { name: "Chargers", slug: "chargers", image: "/charger.png", desc: "Gallium Nitride (GaN) super chargers & high-amp adapters", color: "from-yellow-500/10 to-amber-500/10 text-amber-500 border-yellow-500/20" },
  { name: "Audio", slug: "audio", image: "/audio.png", desc: "Active Noise Cancelling earbuds & audio tech", color: "from-purple-500/10 to-pink-500/10 text-purple-500 border-purple-500/20" },
  { name: "Power Banks", slug: "power-banks", image: "/powerbank.png", desc: "Premium MagSafe power supply packs & backup power", color: "from-green-500/10 to-emerald-500/10 text-green-500 border-green-500/20" },
];

export default function AdminCollectionsPage() {
  const { userInfo } = useAuthStore();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kgn-mobile-accessories.onrender.com";

  // Fetch products
  const { data: products, isLoading: loadingProducts } = useQuery<ProductType[]>({
    queryKey: ["admin-col-products"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/products`);
      return data;
    },
    staleTime: 0,
  });

  // Fetch orders
  const { data: orders, isLoading: loadingOrders } = useQuery<OrderType[]>({
    queryKey: ["admin-col-orders"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      return data;
    },
    staleTime: 0,
  });

  // Aggregate stats per category dynamically
  const dynamicCollections = useMemo(() => {
    // 1. Get unique categories from actual products
    const uniqueCategories = products 
      ? Array.from(new Set(products.map(p => p.category)))
      : [];

    // 2. Build list of collections starting with defaults
    const list = [...collectionsData];

    // 3. For any category from products that does not exist in standard list, append dynamically!
    uniqueCategories.forEach(cat => {
      if (!cat) return;
      const slug = cat.toLowerCase().replace(/\s+/g, "-");
      const exists = list.some(col => col.slug === slug);
      if (!exists) {
        list.push({
          name: cat,
          slug: slug,
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=75",
          desc: `Custom created accessories collection: ${cat}`,
          color: "from-indigo-500/10 to-violet-500/10 text-indigo-500 border-indigo-500/20",
        });
      }
    });

    return list.map(col => {
      // Filter products by category slug
      const catProducts = products 
        ? products.filter(p => p.category?.toLowerCase().replace(/\s+/g, "-") === col.slug || p.category === col.name)
        : [];
      
      const productCount = catProducts.length;
      
      // Calculate out of stock count
      const outOfStockCount = catProducts.filter(p => p.countInStock === 0).length;

      // Calculate total sales/revenue of items belonging to this category
      let salesCount = 0;
      let totalRevenue = 0;

      if (orders && products) {
        orders.forEach(order => {
          order.orderItems.forEach(item => {
            // Find if item name matches any product in this category
            const isMatch = catProducts.some(p => p.name === item.name);
            if (isMatch) {
              salesCount += item.qty;
              totalRevenue += item.price * item.qty;
            }
          });
        });
      }

      return {
        ...col,
        productCount,
        outOfStockCount,
        salesCount,
        revenue: totalRevenue.toFixed(2),
      };
    });
  }, [products, orders]);

  const isLoading = loadingProducts || loadingOrders;

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
        <h1 className="text-3xl font-bold tracking-tight">Collections Management</h1>
        <p className="text-muted-foreground mt-1">Monitor product counts, total items, dynamic sales, and revenue generated per category.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {dynamicCollections.map((col, idx) => (
          <motion.div
            key={col.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className={`bg-card border rounded-3xl overflow-hidden shadow-sm flex flex-col sm:flex-row hover:shadow-md hover:border-primary/20 transition-all ${col.color}`}
          >
            {/* Image section */}
            <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-muted flex-shrink-0">
              <Image src={col.image} alt={col.name} fill className="object-cover" sizes="192px" />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white sm:hidden">
                <h3 className="text-lg font-bold">{col.name}</h3>
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
              <div>
                <div className="hidden sm:flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-foreground">{col.name}</h3>
                  <Link href={`/categories/${col.slug}`} className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5">
                    View Catalog <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{col.desc}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                    <Archive className="w-3 h-3 text-muted-foreground/60" /> Products
                  </p>
                  <p className="text-lg font-extrabold text-foreground">
                    {col.productCount} <span className="text-[10px] text-muted-foreground font-normal">items</span>
                  </p>
                  {col.outOfStockCount > 0 && (
                    <span className="inline-block text-[9px] font-bold bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">
                      {col.outOfStockCount} Out of Stock
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-muted-foreground/60" /> Units Sold
                  </p>
                  <p className="text-lg font-extrabold text-foreground">
                    {col.salesCount} <span className="text-[10px] text-muted-foreground font-normal">sold</span>
                  </p>
                </div>

                <div className="col-span-2 space-y-1 border-t border-border/30 pt-3 flex justify-between items-center">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-primary" /> Total Revenue
                  </p>
                  <p className="text-lg font-extrabold text-primary">
                    ${col.revenue}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
