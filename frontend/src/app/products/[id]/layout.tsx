import type { Metadata } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kgn-mobile-accessories.onrender.com";
const siteUrl = "https://kgnaccessories.pk";

// Generates dynamic <title> and <meta description> for each product page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const res = await fetch(`${apiUrl}/api/products/${id}`, {
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) {
      return {
        title: "Product Not Found",
        description: "This product could not be found.",
        robots: { index: false, follow: false },
      };
    }

    const product = await res.json();
    const title = `${product.name} — Buy Online in Pakistan`;
    const description =
      product.description
        ? `${product.description.slice(0, 150).trim()}… Cash on Delivery available.`
        : `Buy ${product.name} online in Pakistan. Cash on Delivery. Fast shipping from KGN Accessories.`;

    return {
      title,
      description,
      keywords: [
        product.name,
        product.category,
        "buy online Pakistan",
        "Cash on Delivery",
        "mobile accessories",
      ].filter(Boolean),
      alternates: {
        canonical: `${siteUrl}/products/${id}`,
      },
      openGraph: {
        title: `${product.name} | KGN Accessories`,
        description,
        url: `${siteUrl}/products/${id}`,
        type: "website",
        images: product.image
          ? [
              {
                url: product.image,
                width: 800,
                height: 800,
                alt: product.name,
              },
            ]
          : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | KGN Accessories`,
        description,
        images: product.image ? [product.image] : undefined,
      },
    };
  } catch {
    return {
      title: "Product Details",
      description: "View product details on KGN Accessories.",
    };
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
