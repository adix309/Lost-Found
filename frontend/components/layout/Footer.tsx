import Link from "next/link";
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
          <Link href="/contact" className="site-footer__link">
            Kontakt
          </Link>
          <Link href="/terms" className="site-footer__link">
            Pravila korištenja
          </Link>
          <Link href="/privacy" className="site-footer__link">
            Privatnost
          </Link>
        </div>
      </Container>
    </footer>
  );
}
