"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/common/Container";
import styles from "./Hero.module.css";

export function Hero() {
  const router = useRouter();

  const handleAddItemClick = (event: React.MouseEvent, type: "lost" | "found") => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      event.preventDefault();
      router.push("/login");
    }
  };

  return (
    <section className={styles.hero}>
      <Container className={styles.hero__inner}>
        <div className={styles.hero__copy}>
          <p className={styles.hero__eyebrow}>Pouzdana community platforma</p>
          <h1 className={styles.hero__title}>
            Mjesto za prijavu izgubljenih i pronađenih predmeta.
          </h1>
          <p className={styles.hero__subtitle}>
            Pretraži oglase, pogledaj lokacije na mapi, dobij match prijedloge i
            sigurno potvrdi vlasništvo prije kontakta.
          </p>
          <div className={styles.hero__actions}>
            <Link
              href="/AddItem?type=lost"
              className="btn btn--primary"
              onClick={(event) => handleAddItemClick(event, "lost")}
            >
              Izgubio/la sam predmet
            </Link>
            <Link
              href="/AddItem?type=found"
              className="btn btn--outline"
              onClick={(event) => handleAddItemClick(event, "found")}
            >
              Pronašao/la sam predmet
            </Link>
          </div>
        </div>
        <div className={styles.hero__aside}>
          <p className={styles.hero__eyebrow}>Kako funkcioniše</p>
          <h2 className={styles["hero__aside-title"]}>Jednostavan i siguran proces</h2>
          <div className={styles["hero__aside-grid"]}>
            <div className={styles["hero__aside-card"]}>
              <p className={styles["hero__aside-label"]}>1. Objavi oglas</p>
              <p className={styles["hero__aside-text"]}>
                Kreiraj lost ili found prijavu sa jasnim detaljima i lokacijom.
              </p>
            </div>
            <div className={styles["hero__aside-card"]}>
              <p className={styles["hero__aside-label"]}>2. Match prijedlozi</p>
              <p className={styles["hero__aside-text"]}>
                Sistem prepoznaje moguće podudarnosti i šalje ti obavijesti.
              </p>
            </div>
            <div className={styles["hero__aside-card"]}>
              <p className={styles["hero__aside-label"]}>3. Verifikacija vlasništva</p>
              <p className={styles["hero__aside-text"]}>
                Sigurnosni koraci potvrđuju identitet prije razmjene kontakata.
              </p>
            </div>
            <div className={styles["hero__aside-card"]}>
              <p className={styles["hero__aside-label"]}>4. Povrat predmeta</p>
              <p className={styles["hero__aside-text"]}>
                Predmet se vraća, a oglas se zatvara kao resolved.
              </p>
            </div>
          </div>
          <div className={styles["hero__aside-note"]}>
            Povjerenje i sigurnost su osnovne vrijednosti platforme.
          </div>
        </div>
      </Container>
    </section>
  );
}
