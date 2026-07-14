"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { useState } from "react";
import { SlidersHorizontal, Search, ChevronDown } from "lucide-react";

export default function ProductsPage() {
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">All Products</h1>
            <p className="text-muted-foreground mt-2">Browse our full collection of premium mobile accessories.</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary outline-none text-sm transition-all cursor-pointer font-medium"
              >
                <option value="all">All Categories</option>
                <option value="cables">Cables</option>
                <option value="chargers">Chargers</option>
                <option value="audio">Audio</option>
                <option value="power-banks">Power Banks</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-border bg-card focus:ring-2 focus:ring-primary outline-none text-sm transition-all cursor-pointer font-medium"
              >
                <option value="default">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest First</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Pass filters down */}
          <FeaturedProducts sort={sort} search={search} category={category} showAll />
        </div>
      </main>
      <Footer />
    </div>
  );
}
