import { Container } from "@/components/common/Container";

export function Footer() {
  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <div>
          <p className="site-footer__logo">Lost & Found</p>
          <p className="site-footer__description">
            Mjesto za prijavu izgubljenih i pronađenih predmeta, sa
            fokusom na sigurnost, provjeru identiteta i povjerenje između
            korisnika.
          </p>
        </div>
        <div className="site-footer__links">
          <p className="site-footer__links-title">Kontakt</p>
          <div className="site-footer__contact">
            <p className="site-footer__link">Email: info@lostfound.ba</p>
            <p className="site-footer__link">Telefon: +387 33 123 456</p>
            <p className="site-footer__link">Adresa: Zmaja od Bosne 33, Sarajevo</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
