import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Products",
  description: "Search KGN Accessories for mobile accessories, cables, chargers, earbuds, power banks and more. Fast delivery across Pakistan.",
  alternates: {
    canonical: "https://kgnaccessories.pk/search",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
