"use client";

import Link from "next/link";
import {
  ShoppingCart, Menu, X, User, LogOut, Shield, ChevronDown, Search, Heart, Box
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import CartDrawer from "@/components/cart/CartDrawer";
import toast from "react-hot-toast";

const navLinks = [
  { href: "/products", label: "Shop All" },
  { href: "/categories/chargers", label: "Chargers" },
  { href: "/categories/audio", label: "Audio" },
  { href: "/categories/power-banks", label: "Power Banks" },
];

export default function Navbar({ initialSettings }: { initialSettings?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const cartItems = useCartStore((state) => state.cartItems);
  const addToCart = useCartStore((state) => state.addToCart);
  
  const { userInfo, logout } = useAuthStore();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch products for autocomplete search
  const { data: searchProducts } = useQuery<any[]>({
    queryKey: ["navbar-search-products"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/products`);
      return data;
    },
    staleTime: 1000 * 60 * 10,
    enabled: searchQuery.trim().length > 0, // Only fetch when they start typing
  });

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !searchProducts) return [];
    const query = searchQuery.toLowerCase().trim();
    return searchProducts.filter(p => 
      p.name?.toLowerCase().includes(query) || 
      p.category?.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, searchProducts]);

  // Close search suggestions dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  // Read wishlist count from react-query cache (kept in sync by ProductCard)
  const wishlistItems = (queryClient.getQueryData<any[]>(["wishlist"]) || []);
  const wishlistCount = userInfo ? wishlistItems.length : 0;

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/settings`);
      return data;
    },
    initialData: initialSettings,
    staleTime: 1000 * 60 * 5,
  });

  const storeName = settings?.storeName || "KGN Accessories";
  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setIsOpen(false);
    router.push("/login");
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  const handleNavClick = () => setIsOpen(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="w-full">
      {/* Announcement Bar */}
      <div className="w-full bg-gradient-to-r from-primary/90 via-secondary/90 to-primary/90 text-primary-foreground py-2.5 text-xs font-bold tracking-wide select-none overflow-hidden relative border-b border-border/10">
        <div className="flex w-max animate-marquee">
          <span className="px-8 whitespace-nowrap">
            We sell in bulk! Contact us on WhatsApp (+92 326 5909963) for special wholesale & bulk order rates. &nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp; Expand your retail catalog with premium accessories.
          </span>
          <span className="px-8 whitespace-nowrap">
            We sell in bulk! Contact us on WhatsApp (+92 326 5909963) for special wholesale & bulk order rates. &nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp; Expand your retail catalog with premium accessories.
          </span>
        </div>
      </div>
      <nav
        className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-xl sm:text-2xl font-black tracking-tighter text-primary"
                aria-label={`${storeName} — Home`}
              >
                {storeName.split(" ")[0]}
                <span className="text-foreground hidden sm:inline"> {storeName.split(" ").slice(1).join(" ")}</span>
                <span className="text-foreground sm:hidden"> Acc</span>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <ul className="hidden md:flex space-x-8 items-center" role="list">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop Icons & Search */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative hidden lg:block" ref={searchContainerRef}>
                <form onSubmit={handleSearchSubmit}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-9 pr-4 py-1.5 w-48 xl:w-64 bg-muted/50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                    aria-label="Search products"
                  />
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl py-2.5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-1 pb-2 border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Matches Found
                    </div>
                    <ul className="divide-y divide-border/40 max-h-80 overflow-y-auto" role="list">
                      {filteredSuggestions.map((product) => (
                        <li key={product._id} className="hover:bg-secondary/40 transition-colors">
                          <div className="flex items-center gap-3 px-4 py-2">
                            <Link 
                              href={`/products/${product._id}`}
                              onClick={() => {
                                setShowSuggestions(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center gap-3 flex-grow min-w-0"
                            >
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                                <p className="text-[10px] text-primary font-bold">Rs. {product.price.toFixed(2)}</p>
                              </div>
                            </Link>
                            <button
                              onClick={() => {
                                addToCart({
                                  id: product._id,
                                  name: product.name,
                                  image: product.image,
                                  price: product.price,
                                  qty: 1,
                                  selectedColor: product.colors?.[0] || "",
                                });
                                toast.success(`${product.name} added to cart!`);
                                setShowSuggestions(false);
                                setSearchQuery("");
                              }}
                              className="px-2.5 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] font-extrabold rounded-lg transition-all"
                            >
                              + Cart
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="px-4 pt-2 border-t border-border/50 text-center">
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchQuery("");
                        }}
                        className="text-[10px] font-extrabold text-primary hover:underline uppercase tracking-wider block"
                      >
                        View all results →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <ThemeToggle />

              {/* Wishlist icon */}
              <Link
                href="/wishlist"
                className="relative p-2 text-muted-foreground hover:text-red-500 transition-colors group"
                aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} item${wishlistCount > 1 ? "s" : ""}` : ""}`}
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 text-muted-foreground hover:text-primary transition-colors group"
                aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} item${cartCount > 1 ? "s" : ""}` : ""}`}
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                {cartCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              {userInfo ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted text-sm font-semibold transition-colors"
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                    aria-label={`User menu for ${userInfo.name}`}
                  >
                    <div
                      className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold"
                      aria-hidden="true"
                    >
                      {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[80px] truncate">{userInfo.name.split(" ")[0]}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                      role="menu"
                      aria-label="User account menu"
                    >
                      <div className="px-4 py-2 border-b border-border/50 mb-1">
                        <p className="text-xs text-muted-foreground">Signed in as</p>
                        <p className="text-sm font-bold truncate">{userInfo.name}</p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors font-medium"
                        role="menuitem"
                      >
                        <User className="w-4 h-4" aria-hidden="true" /> My Profile
                      </Link>

                      <Link
                        href="/wishlist"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors font-medium"
                        role="menuitem"
                      >
                        <Heart className="w-4 h-4 text-red-500" aria-hidden="true" /> My Wishlist
                        {wishlistCount > 0 && (
                          <span className="ml-auto bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/track"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors font-medium"
                        role="menuitem"
                      >
                        <Box className="w-4 h-4 text-primary" aria-hidden="true" /> Track Order
                      </Link>

                      {userInfo.isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                          role="menuitem"
                        >
                          <Shield className="w-4 h-4" aria-hidden="true" /> Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium text-left"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-muted-foreground hover:text-blue-500 transition-colors group"
                  aria-label="Sign in to your account"
                >
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                </Link>
              )}
            </div>

            {/* Mobile buttons */}
            <div className="flex items-center md:hidden space-x-3">
              <ThemeToggle />
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 text-muted-foreground hover:text-primary transition group"
                aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                {cartCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-muted-foreground hover:text-foreground focus:outline-none rounded-lg hover:bg-muted transition-colors"
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                {isOpen
                  ? <X className="h-6 w-6" aria-hidden="true" />
                  : <Menu className="h-6 w-6" aria-hidden="true" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu — CSS transition, no JS library overhead */}
        <div
          id="mobile-menu"
          className={`md:hidden bg-background border-b border-border/50 overflow-hidden transition-all duration-200 ease-in-out ${
            isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={!isOpen}
          inert={!isOpen ? true : undefined}
        >
          <div className="px-4 py-4 space-y-3">
            <ul className="space-y-1" role="list">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={handleNavClick}
                    className="block px-3 py-2 text-base font-medium text-foreground hover:bg-secondary rounded-xl transition-all"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/track"
                  onClick={handleNavClick}
                  className="block px-3 py-2 text-base font-medium text-foreground hover:bg-secondary rounded-xl transition-all"
                >
                  Track Order
                </Link>
              </li>
            </ul>

            <form onSubmit={handleSearchSubmit} className="relative mt-2 px-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Search products"
              />
            </form>

            <div className="border-t border-border/50 pt-3">
              {userInfo ? (
                <div className="space-y-1 px-3">
                  <p className="text-xs text-muted-foreground mb-2">
                    Signed in as <strong className="text-foreground">{userInfo.name}</strong>
                  </p>
                  <Link
                    href="/profile"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 py-2 text-sm font-semibold text-foreground hover:text-blue-500 transition-colors group"
                  >
                    <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 group-hover:text-blue-500" aria-hidden="true" /> My Profile
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={handleNavClick}
                    className="flex items-center gap-2 py-2 text-sm font-semibold text-foreground hover:text-red-500 transition-colors group"
                  >
                    <Heart className="w-4 h-4 text-red-500" aria-hidden="true" /> My Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-1 bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  {userInfo.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={handleNavClick}
                      className="flex items-center gap-2 py-2 text-sm font-semibold text-primary hover:text-amber-500 transition-colors group"
                    >
                      <Shield className="w-4 h-4 group-hover:scale-110 transition-transform duration-200 group-hover:text-amber-500" aria-hidden="true" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-2 text-sm font-semibold text-destructive hover:text-red-600 transition-colors group"
                  >
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 px-3 py-2 text-base font-semibold text-foreground hover:text-blue-500 hover:bg-secondary rounded-xl transition-colors group"
                >
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 group-hover:text-blue-500" aria-hidden="true" /> Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </header>
  );
}
