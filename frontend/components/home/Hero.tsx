import Link from "next/link";
import { Container } from "@/components/common/Container";

export function Hero() {
  return (
    <section className="hero">
      <Container className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">Pouzdana community platforma</p>
          <h1 className="hero__title">
            Mjesto za prijavu izgubljenih i pronađenih predmeta.
          </h1>
          <p className="hero__subtitle">
            Pretraži oglase, pogledaj lokacije na mapi, dobij match prijedloge i
            sigurno potvrdi vlasništvo prije kontakta.
          </p>
          <div className="hero__actions">
            <Link href="/AddItem" className="btn btn--primary">
              Izgubio/la sam predmet
            </Link>
            <Link href="/AddItem" className="btn btn--outline">
              Pronašao/la sam predmet
            </Link>
          </div>
        </div>
        <div className="hero__aside">
          <p className="hero__eyebrow">Kako funkcioniše</p>
          <h2 className="hero__aside-title">Jednostavan i siguran proces</h2>
          <div className="hero__aside-grid">
            <div className="hero__aside-card">
              <p className="hero__aside-label">1. Objavi oglas</p>
              <p className="hero__aside-text">
                Kreiraj lost ili found prijavu sa jasnim detaljima i lokacijom.
              </p>
            </div>
            <div className="hero__aside-card">
              <p className="hero__aside-label">2. Match prijedlozi</p>
              <p className="hero__aside-text">
                Sistem prepoznaje moguće podudarnosti i šalje ti obavijesti.
              </p>
            </div>
            <div className="hero__aside-card">
              <p className="hero__aside-label">3. Verifikacija vlasništva</p>
              <p className="hero__aside-text">
                Sigurnosni koraci potvrđuju identitet prije razmjene kontakata.
              </p>
            </div>
            <div className="hero__aside-card">
              <p className="hero__aside-label">4. Povrat predmeta</p>
              <p className="hero__aside-text">
                Predmet se vraća, a oglas se zatvara kao resolved.
              </p>
            </div>
          </div>
          <div className="hero__aside-note">
            Povjerenje i sigurnost su osnovne vrijednosti platforme.
          </div>
        </div>
      </Container>
    </section>
  );
}
