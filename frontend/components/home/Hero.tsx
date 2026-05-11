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
            <Link href="/listings/new?type=lost" className="btn btn--primary">
              Izgubio/la sam predmet
            </Link>
            <Link href="/listings/new?type=found" className="btn btn--outline">
              Pronašao/la sam predmet
            </Link>
            <div className="hero__actions-secondary">
              <Link href="/listings" className="btn btn--secondary">
                Pregledaj oglase
              </Link>
            </div>
          </div>
        </div>
        <div className="hero__panel">
          <div className="hero__panel-header">
            <span>Pregled sistema</span>
            <span className="hero__pill">Live prikaz</span>
          </div>
          <div className="hero__grid">
            <div className="hero__card">
              <p className="hero__label">Mini mapa</p>
              <div className="hero__map">
                <span className="hero__marker hero__marker--one" />
                <span className="hero__marker hero__marker--two" />
                <span className="hero__marker hero__marker--three" />
                <span className="hero__marker hero__marker--four" />
              </div>
              <p className="hero__note">
                Pregled lokacija sa aktivnim oglasima.
              </p>
            </div>
            <div className="hero__card">
              <p className="hero__label">Novi oglasi</p>
              <div className="hero__list">
                <div className="hero__list-item">
                  <span>Crni ruksak</span>
                  <span className="hero__status hero__status--lost">
                    Izgubljeno
                  </span>
                </div>
                <div className="hero__list-item">
                  <span>Pronađen novčanik</span>
                  <span className="hero__status hero__status--found">
                    Pronađeno
                  </span>
                </div>
                <div className="hero__list-item">
                  <span>Ključevi sa privjeskom</span>
                  <span className="hero__status hero__status--pending">
                    Potvrda u toku
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
