import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { QuickSearch } from "@/components/home/QuickSearch";
import { FeaturedListings } from "@/components/home/FeaturedListings";

export default function Home() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Hero />
        <QuickSearch />
        <FeaturedListings />
      </main>
      <Footer />
    </div>
  );
}
