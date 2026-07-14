"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, Heart, Zap, Users, Award, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const stats = [
    { value: "5000+", label: "Products Sold" },
    { value: "2000+", label: "Happy Customers" },
    { value: "50+", label: "Categories" },
    { value: "24/7", label: "Customer Support" },
  ];

  const values = [
    { icon: Shield, title: "Uncompromising Quality", desc: "We source only premium mobile accessories that stand up to daily heavy usage." },
    { icon: Heart, title: "Customer Centricity", desc: "Our buyers are at the center of everything. Your satisfaction is our driving force." },
    { icon: Zap, title: "Speed & Convenience", desc: "Fast shipping, nationwide COD, and smooth tracking workflows." },
    { icon: Target, title: "Trust & Transparency", desc: "No hidden charges, real product descriptions, and guaranteed warranty service." },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-black text-foreground tracking-tight"
            >
              Our Story
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
            >
              At KGN Accessories, we believe premium electronics and accessories should be accessible. We curate, verify, and deliver top-tier mobile accessories across Pakistan to elevate your digital lifestyle.
            </motion.p>
          </div>
        </section>

        {/* Brand Mission & Story */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-black text-foreground mb-4">Pakistan's Premium Mobile Brand</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Founded with a mission to eliminate low-quality copycats and unstable chargers from the market, KGN Accessories brings premium build quality, high-speed power delivery, and state-of-the-art aesthetics directly to your doorstep.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Whether it is rugged cables, premium audio accessories, or intelligent smart chargers, every item undergoes strict evaluation before it lists on our shop.
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
                  <p className="text-3xl font-black text-primary mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Corporate Values */}
        <section className="bg-muted/10 border-t border-b border-border py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl font-black text-foreground">Our Core Principles</h2>
              <p className="text-sm text-muted-foreground mt-2">What makes KGN Accessories the ultimate hub for digital geeks.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all">
                    <div className="p-3 bg-primary/10 text-primary w-fit rounded-xl mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm mb-2">{v.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
