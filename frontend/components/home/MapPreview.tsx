import Link from "next/link";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";

export function MapPreview() {
  return (
    <section className="map-preview">
      <Container className="map-preview__inner">
        <SectionHeading
          title="Mapa oglasa"
          description="Pregledaj oglase na mapi i brzo pronađi predmete u blizini."
          action={
            <Link href="/map" className="btn btn--outline btn--sm">
              Otvori mapu
            </Link>
          }
        />
        <div className="map-preview__card">
          <div className="map-preview__map">
            <span className="map-preview__marker map-preview__marker--one" />
            <span className="map-preview__marker map-preview__marker--two" />
            <span className="map-preview__marker map-preview__marker--three" />
            <span className="map-preview__marker map-preview__marker--four" />
            <span className="map-preview__marker map-preview__marker--five" />
          </div>
          <div className="map-preview__legend">
            <p>
              Lokacije su grupisane po zonama, a status oglasa je vidljiv kroz
              boje markera.
            </p>
            <div className="map-preview__legend-items">
              <span className="legend-item">
                <span className="legend-dot legend-dot--lost" />
                Izgubljeno
              </span>
              <span className="legend-item">
                <span className="legend-dot legend-dot--found" />
                Pronađeno
              </span>
              <span className="legend-item">
                <span className="legend-dot legend-dot--resolved" />
                Završeno
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
