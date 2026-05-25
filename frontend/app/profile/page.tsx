import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { ProfileListings } from "@/components/profile/ProfileListings";
import { AuthGuard } from "@/components/auth/AuthGuard";
import styles from "@/components/profile/ProfileStyles.module.css";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <section className={styles["profile-page"]}>
            <div className="container">
              <div className={styles["profile-header"]}>
                <p className={styles["profile-header__eyebrow"]}>Moj profil</p>
                <h1 className={styles["profile-header__title"]}>
                  Profil korisnika
                </h1>
                <p className={styles["profile-header__description"]}>
                  Pregledaj i ažuriraj svoje osnovne informacije te prati oglase koje
                  si objavio.
                </p>
              </div>

              <div className={styles["profile-layout"]}>
                <ProfileForm />
                <ProfileSummary />
              </div>

              <ProfileListings />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}