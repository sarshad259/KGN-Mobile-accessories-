import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HomeClientSections from "@/components/home/HomeClientSections";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main id="main-content" className="flex-grow">
        <Hero />
        <HomeClientSections />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
}
