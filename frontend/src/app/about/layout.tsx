import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about KGN Accessories — Pakistan's trusted premium mobile accessories brand. Our story, mission, and commitment to quality products and customer satisfaction.",
  alternates: {
    canonical: "https://kgnaccessories.pk/about",
  },
  openGraph: {
    title: "About Us | KGN Accessories",
    description:
      "Pakistan's trusted premium mobile accessories brand. Quality, trust and innovation.",
    url: "https://kgnaccessories.pk/about",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
