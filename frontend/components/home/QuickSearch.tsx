import { Container } from "@/components/common/Container";
import styles from "./QuickSearch.module.css";

//TODO (Frontend - filteri i search)
//
// - Ažurirati GET /items da šalje:
//   item_type, category, location_name, brand, color, search
//
// - Primjer:
//   /items?item_type=lost&category=Mobitel&location_name=Sarajevo&brand=Apple&search=iphone
//
// - Dodati UI:
//   - item_type (Lost/Found)
//   - category
//   - location
//   - brand
//   - color
//   - search input
//
// - Povezati filtere sa API pozivom
//
// - (Opcionalno)
//   - debounce za search
//   - reset filtera
//   - prikaz aktivnih filtera
//
// - Ako nema rezultata → "Nema pronađenih itema"
//
// - Čuvati filtere u URL-u

export function QuickSearch() {
  return (
    <section className={styles["quick-search"]}>
      <Container className={styles["quick-search__inner"]}>
        <form className={styles["quick-search__form"]}>
          <div className={styles["quick-search__field"]}>
            <label className="field-label">Pretraga</label>
            <input
              type="text"
              placeholder="Ruksak, novčanik, dokumenti..."
              className="form-input"
            />
          </div>
          <div className={styles["quick-search__field"]}>
            <label className="field-label">Tip</label>
            <select className="form-select">
              <option value="">Svi</option>
              <option value="lost">Izgubljeno</option>
              <option value="found">Pronađeno</option>
            </select>
          </div>
          <div className={styles["quick-search__field"]}>
            <label className="field-label">Kategorija</label>
            <select className="form-select">
              <option value="">Sve kategorije</option>
              <option value="torbe">Torbe</option>
              <option value="dokumenti">Dokumenti</option>
              <option value="elektronika">Elektronika</option>
              <option value="licni">Lični predmeti</option>
            </select>
          </div>
          <div className={styles["quick-search__field"]}>
            <label className="field-label">Lokacija</label>
            <input
              type="text"
              placeholder="Grad ili naselje"
              className="form-input"
            />
          </div>
          <div className={styles["quick-search__field"]}>
            <label className="field-label">Datum</label>
            <input type="date" className="form-input" />
          </div>
          <div className={styles["quick-search__actions"]}>
            <button type="button" className="btn btn--primary btn--block">
              Pretraži
            </button>
          </div>
        </form>
      </Container>
    </section>
  );
}
