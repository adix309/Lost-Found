import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { QuickSearch } from "@/components/home/QuickSearch";
import { MapPreview } from "@/components/home/MapPreview";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { HowItWorks } from "@/components/home/HowItWorks";

export default function Home() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Hero />
        <QuickSearch />
        <MapPreview />
        <FeaturedListings />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
