"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ChevronRight, ChevronLeft,
  Truck, Package, MapPin, Mail, Phone, User,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const steps = ["Shipping", "Review", "Confirm"];

export default function CheckoutPage() {
  const { userInfo } = useAuthStore();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setCheckingAuth(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", postalCode: "", country: "Pakistan",
  });

  const { cartItems, clearCart } = useCartStore();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kgn-mobile-accessories.onrender.com";

  // Fetch settings
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/settings`);
      return data;
    },
  });

  const FREE_SHIPPING_THRESHOLD = settings?.freeShippingThreshold ?? 10000;
  const codEnabled = settings?.codEnabled ?? true;

  // Shipping is paid directly to Pakistan Post on delivery (post-paid)
  const shippingFee = 0;
  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const grandTotal = subtotal;

  // Pre-fill from logged-in user
  useEffect(() => {
    if (userInfo && !shipping.email) {
      const [first = "", ...rest] = userInfo.name.split(" ");
      setShipping(p => ({ ...p, email: userInfo.email, firstName: first, lastName: rest.join(" ") }));
    }
  }, [userInfo, shipping.email]);

  // Auth guard
  useEffect(() => {
    if (!checkingAuth && !userInfo) {
      toast.error("Please log in to check out!", { id: "checkout-auth-guard" });
      router.push("/login?redirect=/checkout");
    }
  }, [checkingAuth, userInfo, router]);

  if (checkingAuth || loadingSettings) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      </div>
    );
  }
  if (!userInfo) return null;

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setShipping(p => ({ ...p, [e.target.name]: e.target.value }));

  const validateShipping = () => {
    const required: (keyof typeof shipping)[] = ["firstName", "lastName", "email", "address", "city", "postalCode"];
    for (const f of required) {
      if (!shipping[f]) {
        toast.error(`Please fill in: ${f.replace(/([A-Z])/g, " $1")}`);
        return false;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
      toast.error("Invalid email address");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 0 && !validateShipping()) return;
    setCurrentStep(p => Math.min(p + 1, steps.length - 1));
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) { toast.error("Your cart is empty!"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${apiUrl}/api/orders`,
        {
          orderItems: cartItems.map(item => ({
            name: item.name, qty: item.qty, image: item.image, price: item.price, product: item.id,
            color: item.selectedColor,
          })),
          shippingAddress: {
            address: shipping.address, city: shipping.city,
            postalCode: shipping.postalCode, country: shipping.country,
          },
          paymentMethod: codEnabled ? "Cash on Delivery" : "Advance Payment",
          taxPrice: 0,
          shippingPrice: shippingFee,
          totalPrice: grandTotal,
        },
        { headers: { Authorization: `Bearer ${userInfo?.token}` } }
      );
      setOrderId(data._id);
      clearCart();
      setOrderPlaced(true);
      toast.success("Order placed successfully! 🎉");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Empty cart ──
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Package className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-20" aria-hidden="true" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-4">Add some products before checking out.</p>
            <Link href="/products" className="mt-4 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all">
              Shop Now
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Order placed success ──
  if (orderPlaced) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md w-full"
            role="alert"
            aria-live="polite"
          >
            <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-14 h-14 text-green-500" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-extrabold mb-2">Order Confirmed! 🎉</h1>
            <p className="text-muted-foreground mb-1">
              Order ID: <span className="font-mono text-primary">{orderId}</span>
            </p>
            <p className="text-muted-foreground mb-6">
              Confirmation sent to <span className="text-primary">{shipping.email}</span>
            </p>
            <div className="bg-card border border-border rounded-2xl p-5 mb-6 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-semibold">{shipping.firstName} {shipping.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ship to</span>
                <span className="font-semibold">{shipping.city}, {shipping.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-semibold">💵 Cash on Delivery</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Total</span>
                <span className="text-primary">Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-left text-sm">
              <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">📦 What happens next?</p>
              <p className="text-muted-foreground">Our team will confirm your order and contact you for delivery scheduling. Please keep your phone reachable.</p>
            </div>
            <Link
              href="/"
              className="block w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all text-center"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Checkout form ──
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Checkout</h1>

        {/* Stepper */}
        <nav aria-label="Checkout steps" className="mb-10 px-4">
          <ol className="flex items-center justify-between relative" role="list">
            <div className="absolute left-0 top-5 w-full h-0.5 bg-border" aria-hidden="true" />
            <div
              className="absolute left-0 top-5 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              aria-hidden="true"
            />
            {steps.map((step, i) => (
              <li key={step} className="relative flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    i < currentStep
                      ? "bg-primary text-primary-foreground"
                      : i === currentStep
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-card border-2 border-border text-muted-foreground"
                  }`}
                  aria-current={i === currentStep ? "step" : undefined}
                >
                  {i < currentStep ? <CheckCircle2 className="w-5 h-5" aria-hidden="true" /> : i + 1}
                </div>
                <span className={`text-xs font-semibold ${i <= currentStep ? "text-primary" : "text-muted-foreground"}`}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
              <AnimatePresence mode="wait">

                {/* STEP 1: Shipping */}
                {currentStep === 0 && (
                  <motion.div
                    key="ship"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-xl" aria-hidden="true">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Shipping Address</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                            First Name <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="firstName"
                            name="firstName"
                            value={shipping.firstName}
                            onChange={handleShippingChange}
                            placeholder="John"
                            aria-required="true"
                            autoComplete="given-name"
                            className="w-full px-3 py-3 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                            Last Name <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="lastName"
                            name="lastName"
                            value={shipping.lastName}
                            onChange={handleShippingChange}
                            placeholder="Doe"
                            aria-required="true"
                            autoComplete="family-name"
                            className="w-full px-3 py-3 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                          Email <span aria-hidden="true">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                          <input
                            id="email"
                            name="email"
                            value={shipping.email}
                            onChange={handleShippingChange}
                            type="email"
                            placeholder="john@example.com"
                            aria-required="true"
                            autoComplete="email"
                            className="w-full pl-9 pr-3 py-3 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1.5">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                          <input
                            id="phone"
                            name="phone"
                            value={shipping.phone}
                            onChange={handleShippingChange}
                            type="tel"
                            placeholder="+92 300 1234567"
                            autoComplete="tel"
                            className="w-full pl-9 pr-3 py-3 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-medium mb-1.5">
                          Street Address <span aria-hidden="true">*</span>
                        </label>
                        <input
                          id="address"
                          name="address"
                          value={shipping.address}
                          onChange={handleShippingChange}
                          placeholder="123 Main Street"
                          aria-required="true"
                          autoComplete="street-address"
                          className="w-full px-3 py-3 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium mb-1.5">
                            City <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="city"
                            name="city"
                            value={shipping.city}
                            onChange={handleShippingChange}
                            placeholder="Karachi"
                            aria-required="true"
                            autoComplete="address-level2"
                            className="w-full px-3 py-3 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium mb-1.5">
                            Postal <span aria-hidden="true">*</span>
                          </label>
                          <input
                            id="postalCode"
                            name="postalCode"
                            value={shipping.postalCode}
                            onChange={handleShippingChange}
                            placeholder="75600"
                            aria-required="true"
                            autoComplete="postal-code"
                            className="w-full px-3 py-3 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium mb-1.5">Country</label>
                          <select
                            id="country"
                            name="country"
                            value={shipping.country}
                            onChange={handleShippingChange}
                            autoComplete="country-name"
                            className="w-full px-3 py-3 rounded-xl border border-border bg-background/50 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                          >
                            {["Pakistan", "UAE", "Saudi Arabia", "USA", "UK", "Canada"].map(c => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                          Pakistan Post Shipping
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Shipping fees are not charged by our store. They will be calculated dynamically by the <strong className="text-foreground">Pakistan Post Office</strong> according to the place you live. You must pay the shipping charges directly to the post office delivery agent when they deliver your parcel.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Review */}
                {currentStep === 1 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-xl" aria-hidden="true">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold">Review Order</h2>
                    </div>

                    <ul className="space-y-3 mb-5" aria-label="Order items">
                      {cartItems.map(item => (
                        <li key={item.id} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-semibold text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                          </div>
                          <p className="font-bold text-sm">Rs. {(item.price * item.qty).toFixed(2)}</p>
                        </li>
                      ))}
                    </ul>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="font-semibold mb-2">📦 Shipping to</p>
                        <p className="text-muted-foreground">{shipping.firstName} {shipping.lastName}</p>
                        <p className="text-muted-foreground">{shipping.address}</p>
                        <p className="text-muted-foreground">{shipping.city}, {shipping.postalCode}</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-4">
                        <p className="font-semibold mb-2">💳 Payment</p>
                        {codEnabled ? (
                          <>
                            <p className="text-muted-foreground">💵 Cash on Delivery</p>
                            <p className="text-xs text-muted-foreground mt-1">Pay when your order arrives at your door.</p>
                          </>
                        ) : (
                          <>
                            <p className="text-muted-foreground">💳 Card / Bank Transfer</p>
                            <p className="text-xs text-muted-foreground mt-1">Advance payment required.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Confirm */}
                {currentStep === 2 && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-500/10 rounded-xl" aria-hidden="true">
                        <Truck className="w-5 h-5 text-green-600" />
                      </div>
                      <h2 className="text-xl font-bold">Confirm & Place Order</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                          <Truck className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <div>
                            <p className="font-bold text-primary">{codEnabled ? "Cash on Delivery" : "Advance Payment Required"}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {codEnabled
                                ? "Pay in cash when your order arrives. No advance payment needed. Our delivery team will collect payment at your door."
                                : "Currently, Cash on Delivery is disabled. Our team will contact you for payment details."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/40 rounded-2xl p-5 text-sm space-y-2">
                        <p className="font-semibold mb-3">Order Summary</p>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deliver to</span>
                          <span className="font-medium">{shipping.address}, {shipping.city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact</span>
                          <span className="font-medium">{shipping.email}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 font-bold">
                          <span>Amount due on delivery</span>
                          <span className="text-primary">Rs. {grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nav Buttons */}
              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={() => setCurrentStep(p => Math.max(p - 1, 0))}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                    currentStep === 0 ? "opacity-0 pointer-events-none" : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                  aria-label="Go back"
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Back
                </button>
                <button
                  onClick={currentStep === steps.length - 1 ? handlePlaceOrder : nextStep}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-70"
                  aria-label={currentStep === steps.length - 1 ? "Place order" : "Continue to next step"}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Processing...
                    </span>
                  ) : currentStep === steps.length - 1 ? (
                    "Place Order"
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold mb-5">Order Summary</h2>
              <ul className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1" aria-label="Cart items">
                {cartItems.map(item => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center" aria-label={`Quantity: ${item.qty}`}>
                        {item.qty}
                      </span>
                    </div>
                    <p className="text-sm font-medium flex-grow truncate">{item.name}</p>
                    <p className="text-sm font-bold flex-shrink-0">Rs. {(item.price * item.qty).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-secondary">Pay on Delivery</span>
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-bold text-base">Total</span>
                  <span className="font-extrabold text-2xl text-primary">Rs. {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Badge */}
              <div className="mt-4 flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm text-primary">
                <Truck className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="font-semibold">{codEnabled ? "Pay on Delivery — No advance payment" : "Standard Delivery"}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
