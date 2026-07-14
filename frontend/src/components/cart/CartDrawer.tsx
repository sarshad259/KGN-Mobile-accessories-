"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQty } = useCartStore();
  const { userInfo } = useAuthStore();
  const router = useRouter();

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    if (!userInfo) {
      toast.error("Please login to proceed to checkout!");
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const cartTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  };

  const handleQtyChange = (item: any, amount: number) => {
    const newQty = item.qty + amount;
    updateQty(item.id, newQty, item.selectedColor);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Shopping Cart ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Items List */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-muted/20 border border-border/50 rounded-2xl">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border/50 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-xs font-bold text-foreground truncate max-w-[180px]">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedColor)}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {item.selectedColor && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">Color: {item.selectedColor}</p>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        {/* Qty controls */}
                        <div className="flex items-center border border-border/80 rounded-lg bg-card overflow-hidden text-xs">
                          <button
                            onClick={() => handleQtyChange(item, -1)}
                            className="px-2 py-1 hover:bg-muted text-muted-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-bold">{item.qty}</span>
                          <button
                            onClick={() => handleQtyChange(item, 1)}
                            className="px-2 py-1 hover:bg-muted text-muted-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-primary">Rs. {(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/45" />
                  <div>
                    <h3 className="font-bold text-foreground">Your Cart is Empty</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                      Add premium mobile chargers, cables, or earbuds to get started!
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md active:scale-95"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-border bg-card space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-muted-foreground">Subtotal:</span>
                  <span className="font-extrabold text-lg text-primary">Rs. {cartTotal().toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Pakistan Post Office delivery shipping charges are payable directly to the courier agent.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="py-3 text-center border border-border bg-muted/40 hover:bg-muted font-bold text-xs rounded-xl transition-all"
                  >
                    View Cart
                  </Link>
                  <button
                    onClick={handleCheckoutClick}
                    className="py-3 text-center bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Checkout
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
