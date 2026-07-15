"use client";

import { useState, useRef } from "react";
import { Plus, Edit2, Trash2, X, RefreshCw, Star, Upload, Film, Palette, ImagePlus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

interface ProductType {
  _id?: string;
  id?: string | number;
  name: string;
  price: number;
  description?: string;
  image: string;
  images?: string[];
  video?: string;
  colors?: string[];
  category: string;
  rating?: number;
  reviews?: number;
  discountPrice?: number;
}

export default function AdminProductsPage() {
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formDiscountPrice, setFormDiscountPrice] = useState<number | "">("");
  const [formCategory, setFormCategory] = useState("Chargers");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]); // up to 5 URLs
  const [formVideo, setFormVideo] = useState(""); // 1 video URL
  const [formColors, setFormColors] = useState(""); // comma-separated colors string

  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kgn-mobile-accessories.onrender.com";

  // ─── Fetch products ─────────────────────────────────────────────────────────
  const { data: products, isLoading, refetch } = useQuery<ProductType[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/products`);
      return data;
    },
    staleTime: 0,
  });

  const displayProducts = products || [];

  // ─── Upload helpers ──────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (formImages.length >= 5) {
      toast.error("Maximum 5 images allowed per product");
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("media", file);
      const { data } = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });
      setFormImages((prev) => [...prev, data.url]);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("media", file);
      const { data } = await axios.post(`${apiUrl}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo?.token}`,
        },
      });
      setFormVideo(data.url);
      toast.success("Video uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Video upload failed");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Modal open helpers ──────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName("");
    setFormPrice(0);
    setFormDiscountPrice("");
    setFormCategory("Chargers");
    setIsCustomCategory(false);
    setCustomCategoryName("");
    setFormDesc("");
    setFormImages([]);
    setFormVideo("");
    setFormColors("");
    setModalOpen(true);
  };

  const handleOpenEdit = (product: ProductType) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormDiscountPrice(product.discountPrice || "");

    const standardCategories = ["Chargers", "Audio", "Power Banks"];
    if (standardCategories.includes(product.category)) {
      setFormCategory(product.category);
      setIsCustomCategory(false);
      setCustomCategoryName("");
    } else {
      setFormCategory("custom");
      setIsCustomCategory(true);
      setCustomCategoryName(product.category);
    }

    setFormDesc(product.description || "");
    setFormImages(product.images || (product.image ? [product.image] : []));
    setFormVideo(product.video || "");
    setFormColors((product.colors || []).join(", "));
    setModalOpen(true);
  };

  // ─── Delete mutation ─────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${apiUrl}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refetch();
      toast.success("Product deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Delete failed");
    },
  });

  // ─── Save mutation ───────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const colorsArray = formColors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const productData = {
        name: formName,
        price: formPrice,
        discountPrice: formDiscountPrice === "" ? undefined : formDiscountPrice,
        category: isCustomCategory ? customCategoryName : formCategory,
        description: formDesc,
        // Primary image = first uploaded image (fallback placeholder)
        image: formImages[0] || "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=400&q=75",
        images: formImages,
        video: formVideo,
        colors: colorsArray,
      };

      if (editingProduct && editingProduct._id) {
        const { data } = await axios.put(`${apiUrl}/api/products/${editingProduct._id}`, productData, {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        return data;
      } else {
        const { data } = await axios.post(`${apiUrl}/api/products`, productData, {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refetch();
      setModalOpen(false);
      toast.success(editingProduct ? "Product updated successfully!" : "Product added successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Operation failed");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isCustomCategory ? customCategoryName.trim() : formCategory;
    if (!formName || formPrice <= 0 || !finalCategory) {
      toast.error("Please fill in all required fields!");
      return;
    }
    saveMutation.mutate();
  };

  const handleCategorySelectChange = (value: string) => {
    if (value === "custom") {
      setIsCustomCategory(true);
      setFormCategory("custom");
    } else {
      setIsCustomCategory(false);
      setFormCategory(value);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-muted-foreground mt-1">Add, update, or remove store products from one place.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="p-3 bg-muted hover:bg-muted/80 rounded-xl text-foreground font-semibold flex items-center justify-center transition-all" aria-label="Refresh list">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/25">
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Rating</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayProducts.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div>
                          <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-[300px] block">{p.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.images && p.images.length > 1 && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{p.images.length} imgs</span>
                            )}
                            {p.video && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">🎬 video</span>
                            )}
                            {p.colors && p.colors.length > 0 && (
                              <div className="flex gap-1">
                                {p.colors.slice(0, 4).map((c, i) => (
                                  <span key={i} title={c} className="w-3 h-3 rounded-full border border-border inline-block" style={{ background: c }} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground">{p.category}</td>
                    <td className="px-6 py-4 font-extrabold text-foreground">
                      {p.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="text-primary">Rs. {p.discountPrice.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground line-through">Rs. {p.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span>Rs. {p.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-xs text-foreground">{p.rating || 5}</span>
                        <span className="text-[10px] text-muted-foreground">({p.reviews || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(p)} className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-all" aria-label={`Edit ${p.name}`}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => p._id && handleDelete(p._id)} className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-all" aria-label={`Delete ${p.name}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <h3 className="text-xl font-bold">{editingProduct ? "✏️ Edit Product" : "✨ Add New Product"}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg bg-muted/50" aria-label="Close modal">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6">
              <form id="product-form" onSubmit={handleSave} className="space-y-5">

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Product Name *</label>
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="e.g. Ultra-Fast 65W GaN Charger" className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all" />
                </div>

                {/* Price + Discount + Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Original Price (Rs.) *</label>
                    <input type="number" step="0.01" min="0" value={formPrice} onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)} required className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Discount Price (Optional)</label>
                    <input type="number" step="0.01" min="0" value={formDiscountPrice} onChange={(e) => setFormDiscountPrice(e.target.value === "" ? "" : parseFloat(e.target.value))} placeholder="Leave empty if no sale" className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Category *</label>
                    <select value={formCategory} onChange={(e) => handleCategorySelectChange(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all cursor-pointer">
                      <option value="Chargers">Chargers</option>
                      <option value="Audio">Audio</option>
                      <option value="Power Banks">Power Banks</option>
                      <option value="custom">Add Custom Category...</option>
                    </select>
                  </div>
                </div>

                {isCustomCategory && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Custom Category Name *</label>
                    <input type="text" value={customCategoryName} onChange={(e) => setCustomCategoryName(e.target.value)} required placeholder="e.g. Cables" className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all" />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</label>
                  <textarea rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Product description..." className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all resize-none" />
                </div>

                {/* ── Images (up to 5) ── */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <ImagePlus className="w-3.5 h-3.5" />
                    Product Images ({formImages.length}/5)
                  </label>

                  {/* Image thumbnails */}
                  {formImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formImages.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                          <Image src={url} alt={`Product image ${idx + 1}`} fill className="object-cover" sizes="80px" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                            aria-label={`Remove image ${idx + 1}`}
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[9px] text-center py-0.5 font-semibold">MAIN</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-input"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage || formImages.length >= 5}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary text-sm font-semibold text-muted-foreground hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                  >
                    {uploadingImage ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading image...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> {formImages.length >= 5 ? "Max 5 images reached" : "Upload Image (JPG / PNG / WEBP)"}</>
                    )}
                  </button>
                  <p className="text-xs text-muted-foreground mt-1">First image will be the main product photo. Up to 5 images total.</p>
                </div>

                {/* ── Video (1) ── */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    Product Video (Optional)
                  </label>

                  {formVideo && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Film className="w-4 h-4 text-primary shrink-0" />
                        <a href={formVideo} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate">{formVideo}</a>
                      </div>
                      <button type="button" onClick={() => setFormVideo("")} className="p-1 text-destructive hover:bg-destructive/10 rounded-lg shrink-0" aria-label="Remove video">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {!formVideo && (
                    <>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/mov,video/avi"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload-input"
                      />
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploadingVideo}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary text-sm font-semibold text-muted-foreground hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                      >
                        {uploadingVideo ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Uploading video...</>
                        ) : (
                          <><Film className="w-4 h-4" /> Upload Product Video (MP4 / WEBM)</>
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* ── Colors ── */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    Available Colors (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formColors}
                    onChange={(e) => setFormColors(e.target.value)}
                    placeholder="e.g. Red, Blue, Black, White, #FF5733"
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                  />
                  {/* Color preview swatches */}
                  {formColors.trim() && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formColors.split(",").map((c) => c.trim()).filter(Boolean).map((color, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-2 py-1">
                          <span
                            className="w-4 h-4 rounded-full border border-border inline-block shrink-0"
                            style={{ background: color }}
                          />
                          <span className="text-xs font-medium text-foreground">{color}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Customers will see these as selectable color options. Use color names (Red, Blue) or hex codes (#FF0000).</p>
                </div>

              </form>
            </div>

            {/* Footer buttons */}
            <div className="shrink-0 border-t border-border p-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-3 border border-border rounded-xl font-bold hover:bg-muted transition-all">Cancel</button>
              <button type="submit" form="product-form" disabled={saveMutation.isPending || uploadingImage || uploadingVideo} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50">
                {saveMutation.isPending ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
