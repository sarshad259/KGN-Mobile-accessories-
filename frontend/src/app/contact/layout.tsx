import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with KGN Accessories. Call or WhatsApp us at +92 326 5909963, email us, or fill out our contact form. We're based in Karachi, Pakistan.",
  alternates: {
    canonical: "https://kgnaccessories.pk/contact",
  },
  openGraph: {
    title: "Contact Us | KGN Accessories",
    description:
      "Reach out to KGN Accessories via phone, WhatsApp, or email. Based in Karachi, Pakistan.",
    url: "https://kgnaccessories.pk/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
