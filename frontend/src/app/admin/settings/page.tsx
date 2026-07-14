"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Shield, CreditCard, DollarSign, ImagePlus, Plus, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

interface CarouselSlide {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

export default function AdminSettingsPage() {
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [storeName, setStoreName] = useState("KGN Mobile Accessories");
  const [contactEmail, setContactEmail] = useState("support@kgn.com");
  const [shippingFee, setShippingFee] = useState(250);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);
  const [codEnabled, setCodEnabled] = useState(true);
  
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/settings`);
      return data;
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName);
      setContactEmail(settings.contactEmail);
      setShippingFee(settings.shippingFee);
      setFreeShippingThreshold(settings.freeShippingThreshold);
      setCodEnabled(settings.codEnabled);
      if (settings.carouselSlides) setCarouselSlides(settings.carouselSlides);
    }
  }, [settings]);

  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.put(`${apiUrl}/api/settings`, {
        storeName,
        contactEmail,
        shippingFee,
        freeShippingThreshold,
        codEnabled,
        carouselSlides
      }, {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] }); // invalidate public settings cache
      toast.success("Settings saved successfully! ⚙️");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to save settings");
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation
    const incompleteSlides = carouselSlides.some(s => !s.image || !s.title || !s.cta || !s.href);
    if (incompleteSlides) {
      toast.error("Please fill in all required slide fields and ensure each has an image.");
      return;
    }
    saveMutation.mutate();
  };

  const addSlide = () => {
    setCarouselSlides([...carouselSlides, { image: "", title: "", subtitle: "", cta: "Shop Now", href: "/products" }]);
  };

  const removeSlide = (idx: number) => {
    setCarouselSlides(carouselSlides.filter((_, i) => i !== idx));
  };

  const updateSlide = (idx: number, field: keyof CarouselSlide, value: string) => {
    const updated = [...carouselSlides];
    updated[idx] = { ...updated[idx], [field]: value };
    setCarouselSlides(updated);
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlideIdx(idx);
    try {
      const formData = new FormData();
      formData.append("media", file);
      const { data } = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${userInfo?.token}` },
      });
      updateSlide(idx, "image", data.url);
      toast.success("Slide image uploaded!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global pricing rules, payment configurations, and contacts.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        {/* Section: General */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <Settings className="w-4 h-4 text-primary" /> General Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Store Name</label>
              <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} required className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Support Email</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all" />
            </div>
          </div>
        </div>

        {/* Section: Shipping Fees */}
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <DollarSign className="w-4 h-4 text-primary" /> Delivery Pricing
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Default Shipping Fee (Rs.)</label>
              <input type="number" step="1" value={shippingFee} onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)} required className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Free Shipping Minimum (Rs.)</label>
              <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(parseInt(e.target.value) || 0)} required className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all" />
            </div>
          </div>
        </div>

        {/* Section: Payments */}
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <CreditCard className="w-4 h-4 text-primary" /> Payments
          </h3>
          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border/60">
            <div className="space-y-0.5">
              <p className="text-sm font-bold">Cash on Delivery (COD)</p>
              <p className="text-xs text-muted-foreground">Accept cash payments when the package is delivered.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Section: Carousel Management */}
        <div className="space-y-4 pt-4 border-t border-border mt-6">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ImagePlus className="w-4 h-4 text-primary" /> Homepage Carousel
            </h3>
            <button type="button" onClick={addSlide} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground text-xs font-bold rounded-lg hover:bg-secondary/80 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Slide
            </button>
          </div>

          {carouselSlides.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
              <p className="text-sm text-muted-foreground mb-3">No slides configured. Default placeholders will be used.</p>
              <button type="button" onClick={addSlide} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl">Create First Slide</button>
            </div>
          ) : (
            <div className="space-y-6">
              {carouselSlides.map((slide, idx) => (
                <div key={idx} className="p-4 bg-muted/30 border border-border rounded-2xl relative group">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => removeSlide(idx)} className="p-1.5 bg-destructive/10 text-destructive hover:bg-destructive text-white rounded-md transition-colors" aria-label="Remove slide">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Slide {idx + 1}</p>
                  
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* Image Upload Area */}
                    <div className="w-full md:w-1/3 shrink-0">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Background Image *</label>
                      <div className="relative w-full aspect-video rounded-xl border-2 border-dashed border-border overflow-hidden flex flex-col items-center justify-center bg-background cursor-pointer hover:border-primary/50 transition-colors" onClick={() => document.getElementById(`slide-img-${idx}`)?.click()}>
                        {slide.image ? (
                          <>
                            <Image src={slide.image} alt="Slide preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-semibold">Change Image</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-3">
                            {uploadingSlideIdx === idx ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /> : <ImagePlus className="w-6 h-6 mx-auto text-muted-foreground mb-1" />}
                            <span className="text-xs text-muted-foreground block mt-1">{uploadingSlideIdx === idx ? "Uploading..." : "Click to Upload"}</span>
                          </div>
                        )}
                        <input id={`slide-img-${idx}`} type="file" accept="image/*" onChange={(e) => handleSlideImageUpload(e, idx)} className="hidden" />
                      </div>
                    </div>
                    
                    {/* Fields */}
                    <div className="w-full md:w-2/3 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Title *</label>
                        <input type="text" value={slide.title} onChange={(e) => updateSlide(idx, "title", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary outline-none text-sm" placeholder="e.g. Premium Phones" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Subtitle</label>
                        <input type="text" value={slide.subtitle} onChange={(e) => updateSlide(idx, "subtitle", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary outline-none text-sm" placeholder="e.g. Discover our new arrivals..." />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Button Text *</label>
                          <input type="text" value={slide.cta} onChange={(e) => updateSlide(idx, "cta", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary outline-none text-sm" placeholder="e.g. Shop Now" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Button Link *</label>
                          <input type="text" value={slide.href} onChange={(e) => updateSlide(idx, "href", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-1 focus:ring-primary outline-none text-sm" placeholder="e.g. /categories/cables" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={saveMutation.isPending} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
