import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Categories",
  description:
    "Browse all mobile accessory categories at KGN Accessories - fast chargers, wireless earbuds, power banks, smartwatches, data cables and more.",
  alternates: {
    canonical: "https://kgnaccessories.pk/categories",
  },
  openGraph: {
    title: "All Categories | KGN Accessories",
    description: "Browse all mobile accessory categories. Cash on Delivery across Pakistan.",
    url: "https://kgnaccessories.pk/categories",
    type: "website",
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
