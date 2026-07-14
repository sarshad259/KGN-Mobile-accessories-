import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Providers from "@/components/providers";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

// Separate viewport export (Next.js 14+ best practice)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f23" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const siteUrl = "https://kgnaccessories.pk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mobile Accessories",
    template: "%s | Mobile Accessories",
  },
  description:
    "Shop premium mobile accessories in Pakistan — cables, chargers, earbuds, power banks and more. Cash on Delivery available nationwide. KGN Accessories.",
  keywords: [
    "mobile accessories Pakistan",
    "charging cables Pakistan",
    "fast chargers",
    "wireless earbuds",
    "power banks",
    "KGN accessories",
    "online mobile accessories",
  ],
  authors: [{ name: "KGN Accessories", url: siteUrl }],
  creator: "KGN Accessories",
  publisher: "KGN Accessories",
  category: "ecommerce",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "KGN Accessories | Premium Mobile Accessories in Pakistan",
    description:
      "Premium mobile accessories to elevate your tech experience. Cash on Delivery nationwide.",
    url: siteUrl,
    siteName: "KGN Accessories",
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "KGN Accessories — Premium Mobile Accessories",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KGN Accessories | Premium Mobile Accessories",
    description: "Premium mobile accessories. Cash on Delivery across Pakistan.",
    images: [`${siteUrl}/og-image.jpg`],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/icon.png",
  },
};

// JSON-LD structured data for Google rich results
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "KGN Accessories",
  url: siteUrl,
  logo: `${siteUrl}/favicon.ico`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+92-326-5909963",
    contactType: "customer service",
    areaServed: "PK",
    availableLanguage: ["English", "Urdu"],
  },
  sameAs: [],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "KGN Accessories",
  description: "Premium mobile accessories store in Pakistan",
  url: siteUrl,
  telephone: "+92-326-5909963",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Karachi",
    addressCountry: "PK",
  },
  priceRange: "Rs. 200 - Rs. 50,000",
  paymentAccepted: "Cash on Delivery",
  currenciesAccepted: "PKR",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} font-sans h-full antialiased`}
    >
      <head>
        {/* DNS prefetch & preconnect for performance */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />

      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-primary/30">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Skip to main content link for keyboard / screen-reader users */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:font-semibold"
            >
              Skip to main content
            </a>
            {children}
            <WhatsAppButton />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
