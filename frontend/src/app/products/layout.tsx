import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse our full range of premium mobile accessories in Pakistan — fast chargers, wireless earbuds, power banks, smartwatches and more. Cash on Delivery available.",
  keywords: [
    "buy mobile accessories Pakistan",
    "fast chargers Pakistan",
    "wireless earbuds Pakistan",
    "power banks COD",
  ],
  alternates: {
    canonical: "https://kgnaccessories.pk/products",
  },
  openGraph: {
    title: "Shop All Products | KGN Accessories",
    description:
      "Premium mobile accessories with Cash on Delivery across Pakistan.",
    url: "https://kgnaccessories.pk/products",
    type: "website",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
