"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState as useSidebarState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Menu, X, Tag, MessageSquare, HelpCircle, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const userInfo = useAuthStore((state) => state.userInfo);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Small delay to allow Zustand to hydrate from localStorage
    const timer = setTimeout(() => setChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products",  href: "/admin/products", icon: Package },
    { name: "Collections", href: "/admin/collections", icon: Tag },
    { name: "Orders",    href: "/admin/orders", icon: ShoppingCart },
    { name: "Users",     href: "/admin/users", icon: Users },
    { name: "Messages",  href: "/admin/messages", icon: MessageSquare },
    { name: "Settings",  href: "/admin/settings", icon: Settings },
  ];

  // Show spinner while hydrating
  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!userInfo) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background gap-5 text-center px-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <ShieldAlert className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-extrabold">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">You need to be logged in to access the admin panel.</p>
        <Link
          href={`/login?redirect=/admin`}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
        >
          Login
        </Link>
      </div>
    );
  }

  // Logged in but NOT admin → forbidden
  if (!userInfo.isAdmin) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background gap-5 text-center px-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <ShieldAlert className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-extrabold">Forbidden</h1>
        <p className="text-muted-foreground max-w-sm">
          Your account <strong>{userInfo.email}</strong> does not have admin privileges.
        </p>
        <Link href="/" className="px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all">
          Back to Store
        </Link>
      </div>
    );
  }

  // Admin — render full layout
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/admin" className="text-xl font-bold text-primary tracking-tight">
            KGN <span className="text-foreground">Admin</span>
          </Link>
          <button className="md:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin badge */}
        <div className="mx-4 mt-4 mb-2 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl">
          <p className="text-xs text-muted-foreground font-medium">Signed in as</p>
          <p className="text-sm font-bold text-primary truncate">{userInfo.name}</p>
          <span className="inline-block mt-1 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">ADMIN</span>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-10rem)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-border space-y-1">
            <Link href="/" className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:bg-muted hover:text-foreground transition-colors">
              <ShoppingCart className="w-5 h-5 mr-3" /> View Store
            </Link>
            <button
              onClick={() => { useAuthStore.getState().logout(); router.push("/login"); }}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-destructive rounded-xl hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-card border-b border-border">
          <button className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3 ml-auto">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {userInfo.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold hidden sm:block">{userInfo.name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
