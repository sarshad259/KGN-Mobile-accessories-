"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kgn-mobile-accessories.onrender.com";
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/settings`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const contactEmail = settings?.contactEmail || "support@kgnaccessories.com";

  const contactMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const { data } = await axios.post(`${apiUrl}/api/contact`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Message sent successfully! ✉️");
      setFormData({ name: "", email: "", subject: "", message: "" });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to send message");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-black text-foreground tracking-tight"
            >
              Get In Touch
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base"
            >
              Have a question about a product, order status, or wholesale options? Drop us a line and our dedicated support team will help you out.
            </motion.p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {/* Phone */}
                <div className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Call/SMS</h3>
                    <p className="text-xs text-muted-foreground mt-1">+92 326 5909963</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Email Support</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">{contactEmail}</a>
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Location</h3>
                    <p className="text-xs text-muted-foreground mt-1">Karachi, Pakistan</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <a 
                  href="https://wa.me/923265909963" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl hover:border-green-500/30 transition-all group"
                >
                  <div className="p-3 bg-green-500/10 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                      WhatsApp Chat <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-bold">24/7</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">0326 5909963</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Your email address"
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write details of your query..."
                    className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"} <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
