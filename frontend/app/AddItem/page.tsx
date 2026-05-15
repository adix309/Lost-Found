import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

//TODO : Treba azurirat u skladu sa items tabelom

export default function AddItemPage() {
  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <section className="profile-page">
          <div className="container">
            <div className="profile-header">
              <p className="profile-header__eyebrow">Novi item</p>
              <h1 className="profile-header__title">Dodaj novi predmet</h1>
              <p className="profile-header__description">
                Popuni formu za izgubljeni ili pronađeni predmet. Ova forma je
                trenutno samo frontend prikaz i nije povezana sa backendom.
              </p>
            </div>

            <section className="profile-panel">
              <h2 className="profile-panel__title">Informacije o predmetu</h2>

              <form className="profile-form">
                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="itemName" className="field-label">
                      Naziv predmeta
                    </label>
                    <input
                      id="itemName"
                      name="itemName"
                      type="text"
                      className="form-input"
                      placeholder="Npr. novčanik, ključevi, telefon..."
                    />
                  </div>

                  <div className="profile-form__field">
                    <label htmlFor="itemType" className="field-label">
                      Tip oglasa
                    </label>
                    <select id="itemType" name="itemType" className="form-select">
                      <option value="lost">Izgubljeno</option>
                      <option value="found">Pronađeno</option>
                    </select>
                  </div>
                </div>

                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="category" className="field-label">
                      Kategorija
                    </label>
                    <input
                      id="category"
                      name="category"
                      type="text"
                      className="form-input"
                      placeholder="Dokumenti, elektronika, odjeća..."
                    />
                  </div>

                  <div className="profile-form__field">
                    <label htmlFor="location" className="field-label">
                      Lokacija
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className="form-input"
                      placeholder="Npr. Sarajevo, SCC"
                    />
                  </div>
                </div>

                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="date" className="field-label">
                      Datum
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      className="form-input"
                    />
                  </div>

                  <div className="profile-form__field">
                    <label htmlFor="contact" className="field-label">
                      Kontakt
                    </label>
                    <input
                      id="contact"
                      name="contact"
                      type="text"
                      className="form-input"
                      placeholder="Telefon ili email"
                    />
                  </div>
                </div>

                <div className="profile-form__field">
                  <label htmlFor="description" className="field-label">
                    Opis predmeta
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-input"
                    placeholder="Unesi dodatne detalje o predmetu..."
                    rows={6}
                    style={{ height: "auto", minHeight: "9rem", paddingTop: "0.9rem" }}
                  />
                </div>

                <div className="profile-form__field">
                  <label htmlFor="image" className="field-label">
                    Slika predmeta
                  </label>
                  <input id="image" name="image" type="file" className="form-input" />
                </div>

                <div className="profile-form__actions">
                  <button type="submit" className="btn btn--primary">
                    Dodaj item
                  </button>
                  <button type="reset" className="btn btn--outline">
                    Očisti formu
                  </button>
                </div>
              </form>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
