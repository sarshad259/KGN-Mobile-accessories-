"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category: "payment" | "shipping" | "returns" | "general";
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "payment" | "shipping" | "returns" | "general">("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: "payment",
      question: "What payment methods do you support?",
      answer: "We accept Cash on Delivery (COD) nationwide, EasyPaisa, JazzCash, and direct Bank Transfers. You can pay in cash to the delivery rider when your order arrives at your doorstep.",
    },
    {
      category: "shipping",
      question: "How long does shipping take and what does it cost?",
      answer: "Standard delivery takes 2 to 4 working days across Pakistan. Shipping fees are calculated dynamically according to store settings managed in the admin panel.",
    },
    {
      category: "shipping",
      question: "How do I pay the shipping fee?",
      answer: "You have to give the shipping fee directly to the courier rider who delivers the product to you. Please hand over the exact shipping fee amount directly to them upon delivery.",
    },
    {
      category: "returns",
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for any products with manufacturing defects or issues. The product must be returned with its original packaging intact to process refund or replacement.",
    },
    {
      category: "general",
      question: "Are your mobile accessories genuine?",
      answer: "Absolutely. All mobile accessories sold on KGN Accessories are 100% original and come with official brand warranties where applicable. We guarantee premium quality.",
    },
    {
      category: "shipping",
      question: "Do you offer international shipping?",
      answer: "Currently, we only deliver within Pakistan. We are exploring international shipping capabilities and will announce them when available.",
    },
    {
      category: "general",
      question: "How do I track my order status?",
      answer: "After logging into your account, navigate to 'My Orders' in the profile dropdown. You will see the delivery and payment status of your order updated live.",
    },
    {
      category: "general",
      question: "Do you offer any warranty on products?",
      answer: "Yes! Most of our premium fast chargers, audio devices, and power banks come with a 3 to 12-month brand replacement warranty. Please check individual product descriptions for details.",
    },
    {
      category: "general",
      question: "Can I change or cancel my order after placing it?",
      answer: "You can modify or cancel your order anytime before it is dispatched for delivery. To do so, please contact us immediately via WhatsApp at +92 326 5909963 with your order number.",
    },
    {
      category: "payment",
      question: "Do you offer wholesale rates for bulk orders?",
      answer: "Yes! KGN Accessories is a wholesale distributor. We already sell all products at wholesale prices on the website. For extremely large wholesale bulk imports/distribution, contact us directly.",
    },
    {
      category: "general",
      question: "What should I do if my package arrives damaged?",
      answer: "If you notice your parcel is damaged or tampered with upon arrival, please record a quick video while unboxing it and reach out to our customer support within 24 hours to claim a free replacement.",
    }
  ];

  const filteredFaqs = activeCategory === "all" ? faqs : faqs.filter(f => f.category === activeCategory);

  const handleToggle = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-foreground tracking-tight">Frequently Asked Questions</h1>
          <p className="text-sm text-muted-foreground mt-2">Find quick answers to common queries regarding payments, shipping, and returns.</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {(["all", "payment", "shipping", "returns", "general"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setExpandedIndex(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/10 transition-colors"
                >
                  <span className="font-bold text-foreground text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown 
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
                      isExpanded ? "rotate-180 text-primary" : ""
                    }`} 
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 text-sm text-muted-foreground border-t border-border/30 pt-3 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
