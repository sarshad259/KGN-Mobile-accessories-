import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HomeClientSections from "@/components/home/HomeClientSections";

export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  let settings = null;
  try {
    const res = await fetch(`${apiUrl}/api/settings`, { next: { revalidate: 300 } });
    if (res.ok) {
      settings = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch settings on server:", error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar initialSettings={settings} />
      <main id="main-content" className="flex-grow">
        <Hero initialSettings={settings} />
        <HomeClientSections />
        <FeaturedProducts />
      </main>
      <Footer initialSettings={settings} />
    </div>
  );
}
