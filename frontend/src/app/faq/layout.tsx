import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs — Frequently Asked Questions",
  description:
    "Get answers to common questions about KGN Accessories — payment methods (Cash on Delivery), shipping times (2-4 days, free over Rs. 3,000), returns policy, and more.",
  alternates: {
    canonical: "https://kgnaccessories.pk/faq",
  },
  openGraph: {
    title: "FAQs | KGN Accessories",
    description:
      "Answers to your questions about payments, shipping, returns and more.",
    url: "https://kgnaccessories.pk/faq",
    type: "website",
  },
};

// FAQ JSON-LD schema → shows FAQ accordion directly in Google search results
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What payment methods do you support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept Cash on Delivery (COD) nationwide. You can pay in cash to the delivery rider when your order arrives at your doorstep.",
      },
    },
    {
      "@type": "Question",
      name: "How long does shipping take and what does it cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Standard delivery takes 2 to 4 working days. Shipping is completely free on all orders over Rs. 3,000! For orders under Rs. 3,000, a flat shipping fee of Rs. 250 applies.",
      },
    },
    {
      "@type": "Question",
      name: "What is your return policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer a 30-day return policy for any products with manufacturing defects or issues. The product must be returned with its original packaging intact to process a refund or replacement.",
      },
    },
    {
      "@type": "Question",
      name: "Are your mobile accessories genuine?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. All mobile accessories sold on KGN Accessories are 100% original and come with official brand warranties where applicable.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer international shipping?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Currently, we only deliver within Pakistan. We are exploring international shipping capabilities and will announce them when available.",
      },
    },
    {
      "@type": "Question",
      name: "How do I track my order status?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After logging into your account, navigate to 'My Orders' in the profile dropdown. You will see the delivery and payment status of your order updated live.",
      },
    },
  ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
