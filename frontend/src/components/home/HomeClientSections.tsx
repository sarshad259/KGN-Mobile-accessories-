"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, ChevronRight, Shield, Zap, Headphones, RotateCcw, Sparkles } from "lucide-react";

// Dynamically import heavy animation component — reduces initial JS bundle
const MotionDiv = dynamic(() => import("framer-motion").then((m) => {
  const { motion } = m;
  const C = ({ children, ...props }: any) => <motion.div {...props}>{children}</motion.div>;
  C.displayName = "MotionDiv";
  return C;
}), { ssr: false, loading: () => <div /> });

const categories = [
  { name: "Data Cables",       icon: "🔌", color: "from-blue-500/20 to-blue-600/5",   border: "border-blue-500/20",   slug: "cables" },
  { name: "Fast Chargers",     icon: "⚡", color: "from-yellow-500/20 to-yellow-600/5",border: "border-yellow-500/20", slug: "chargers" },
  { name: "Earbuds",           icon: "🎧", color: "from-purple-500/20 to-purple-600/5",border: "border-purple-500/20", slug: "audio" },
  { name: "Power Banks",       icon: "🔋", color: "from-green-500/20 to-green-600/5", border: "border-green-500/20",  slug: "power-banks" },
  { name: "Smartwatches",      icon: "⌚", color: "from-red-500/20 to-red-600/5",     border: "border-red-500/20",    slug: "smartwatches" },

];

const features = [
  { icon: Shield,      title: "1-Year Warranty",   desc: "Full replacement warranty on all products" },
  { icon: Zap,         title: "Fast Delivery",      desc: "Next-day delivery across Pakistan" },
  { icon: Headphones,  title: "24/7 Support",       desc: "Expert help whenever you need it" },
  { icon: RotateCcw,   title: "Easy Returns",       desc: "30-day hassle-free return policy" },
];

export default function HomeClientSections() {
  return (
    <>
      {/* Category Quick Links */}
      <section className="py-14 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-7">
            <h2 className="text-xl font-bold tracking-tight">Shop by Category</h2>
            <Link href="/categories" className="flex items-center text-sm text-primary font-medium hover:underline">
              All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} hover:scale-105 transition-transform text-center`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-semibold leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-muted/30 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all">
                <div className="p-3 bg-primary/10 rounded-xl"><f.icon className="w-5 h-5 text-primary" /></div>
                <div><p className="font-bold text-sm">{f.title}</p><p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
