import { Container } from "@/components/common/Container";

export function QuickSearch() {
  return (
    <section className="quick-search">
      <Container className="quick-search__inner">
        <form className="quick-search__form">
          <div className="quick-search__field">
            <label className="field-label">Pretraga</label>
            <input
              type="text"
              placeholder="Ruksak, novčanik, dokumenti..."
              className="form-input"
            />
          </div>
          <div className="quick-search__field">
            <label className="field-label">Tip</label>
            <select className="form-select">
              <option value="">Svi</option>
              <option value="lost">Izgubljeno</option>
              <option value="found">Pronađeno</option>
            </select>
          </div>
          <div className="quick-search__field">
            <label className="field-label">Kategorija</label>
            <select className="form-select">
              <option value="">Sve kategorije</option>
              <option value="torbe">Torbe</option>
              <option value="dokumenti">Dokumenti</option>
              <option value="elektronika">Elektronika</option>
              <option value="licni">Lični predmeti</option>
            </select>
          </div>
          <div className="quick-search__field">
            <label className="field-label">Lokacija</label>
            <input
              type="text"
              placeholder="Grad ili naselje"
              className="form-input"
            />
          </div>
          <div className="quick-search__field">
            <label className="field-label">Datum</label>
            <input type="date" className="form-input" />
          </div>
          <div className="quick-search__actions">
            <button type="button" className="btn btn--primary btn--block">
              Pretraži
            </button>
          </div>
        </form>
      </Container>
    </section>
  );
}
