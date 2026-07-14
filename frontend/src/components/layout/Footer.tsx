"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const Facebook = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const Youtube = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2.5 7.1C2.5 7.1 2 9 2 12s.5 4.9.5 4.9c.3 1 1 1.8 2 2.1C7.1 19.5 12 19.5 12 19.5s4.9 0 7.5-.5c1-.3 1.7-1 2-2.1.5-1.5.5-4.9.5-4.9s-.5-3.4-.5-4.9c-.3-1-1-1.8-2-2.1C16.9 4.5 12 4.5 12 4.5s-4.9 0-7.5.5c-1 .3-1.7 1-2 2.1z"/><path d="m9.7 15.5 6.3-3.5-6.3-3.5v7z"/></svg>
);

export default function Footer() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/settings`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const storeName = settings?.storeName || "KGN Accessories";
  const contactEmail = settings?.contactEmail || "support@kgnaccessories.com";

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tighter text-primary">
              {storeName.split(" ")[0]} <span className="text-foreground">{storeName.split(" ").slice(1).join(" ")}</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Premium mobile accessories and gadgets to elevate your everyday tech experience.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://www.facebook.com/profile.php?id=61591359880743" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-[#1877F2] hover:scale-110 transition-all duration-200" 
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link 
                href="https://www.instagram.com/kgnmobileacc/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-[#E1306C] hover:scale-110 transition-all duration-200" 
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link 
                href="https://www.youtube.com/@KGNMobileAccesories" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-red-600 hover:scale-110 transition-all duration-200" 
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition">FAQs</Link></li>
              <li><Link href="/track" className="hover:text-primary transition">Track Order</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/categories/cables" className="hover:text-primary transition">Data Cables</Link></li>
              <li><Link href="/categories/chargers" className="hover:text-primary transition">Fast Chargers</Link></li>
              <li><Link href="/categories/audio" className="hover:text-primary transition">Earbuds & Audio</Link></li>
              <li><Link href="/categories/smartwatches" className="hover:text-primary transition">Smartwatches</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start group">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-primary group-hover:scale-110 transition-transform duration-200" />
                <span>Karachi, Pakistan</span>
              </li>
              <li className="flex items-center group">
                <Phone className="w-4 h-4 mr-2 text-green-500 group-hover:scale-110 group-hover:text-green-400 transition-all duration-200" />
                <span>+92 326 5909963</span>
              </li>
              <li className="flex items-center group">
                <Mail className="w-4 h-4 mr-2 text-blue-500 group-hover:scale-110 group-hover:text-blue-400 transition-all duration-200" />
                <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors">{contactEmail}</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-primary transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
