"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";


export default function AddItemPage() {
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const itemData = {
      title: formData.get("title"),
      description: formData.get("description"),
      item_type: formData.get("item_type"),
      category: formData.get("category"),
      location_name: formData.get("location_name"),

      latitude: formData.get("latitude")
        ? Number(formData.get("latitude"))
        : null,

      longitude: formData.get("longitude")
        ? Number(formData.get("longitude"))
        : null,

      event_date: formData.get("event_date")
        ? new Date(formData.get("event_date") as string).toISOString()
        : null,

      image_url: formData.get("image_url") || null,
      brand: formData.get("brand") || null,
      color: formData.get("color") || null,

      reward_amount: formData.get("reward_amount")
        ? Number(formData.get("reward_amount"))
        : null,

      contact_phone: formData.get("contact_phone") || null,
      contact_email: formData.get("contact_email") || null,
      hidden_unique_features: formData.get("hidden_unique_features") || null,
      status: formData.get("status") || "active",
    };

    const response = await fetch("http://127.0.0.1:8000/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Greška:", error);
      alert("Greška prilikom dodavanja itema.");
      return;
    }

    const result = await response.json();
    console.log("Item dodan:", result);

    alert("Item je uspješno dodan.");
    event.currentTarget.reset();
  }


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
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="title" className="field-label">
                      Naziv predmeta
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      className="form-input"
                      placeholder="Npr. novčanik, ključevi, telefon..."
                      required
                    />
                  </div>

                  <div className="profile-form__field">
                    <label htmlFor="item_type" className="field-label">
                      Tip oglasa
                    </label>
                    <select
                      id="item_type"
                      name="item_type"
                      className="form-select"
                      defaultValue="lost"
                      required
                    >
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
                      required
                    />
                  </div>

                  <div className="profile-form__field">
                    <label htmlFor="location_name" className="field-label">
                      Lokacija
                    </label>
                    <input
                      id="location_name"
                      name="location_name"
                      type="text"
                      className="form-input"
                      placeholder="Npr. Sarajevo, SCC"
                      required
                    />
                  </div>
                </div>

                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="latitude" className="field-label">
                      Latitude
                    </label>
                    <input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="Npr. 43.8563"
                    />
                  </div>

                  <div className="profile-form__field">
                    <label htmlFor="longitude" className="field-label">
                      Longitude
                    </label>
                    <input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="Npr. 18.4131"
                    />
                  </div>
                </div>

                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="event_date" className="field-label">
                      Datum događaja
                    </label>
                    <input
                      id="event_date"
                      name="event_date"
                      type="datetime-local"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="profile-form__field">
                    <label htmlFor="status" className="field-label">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      className="form-select"
                      defaultValue="active"
                    >
                      <option value="active">Aktivan</option>
                      <option value="resolved">Riješen</option>
                      <option value="expired">Istekao</option>
                    </select>
                  </div>
                </div>

                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="brand" className="field-label">
                      Brend
                    </label>
                    <input
                      id="brand"
                      name="brand"
                      type="text"
                      className="form-input"
                      placeholder="Npr. Apple, Nike, Samsung..."
                    />
                  </div>

                  <div className="profile-form__field">
                    <label htmlFor="color" className="field-label">
                      Boja
                    </label>
                    <input
                      id="color"
                      name="color"
                      type="text"
                      className="form-input"
                      placeholder="Npr. crna, plava, crvena..."
                    />
                  </div>
                </div>

                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="reward_amount" className="field-label">
                      Nagrada
                    </label>
                    <input
                      id="reward_amount"
                      name="reward_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder="Npr. 50"
                    />
                  </div>

                  <div className="profile-form__field">
                    <label htmlFor="image_url" className="field-label">
                      URL slike
                    </label>
                    <input
                      id="image_url"
                      name="image_url"
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="profile-form__row">
                  <div className="profile-form__field">
                    <label htmlFor="contact_phone" className="field-label">
                      Kontakt telefon
                    </label>
                    <input
                      id="contact_phone"
                      name="contact_phone"
                      type="tel"
                      className="form-input"
                      placeholder="+387 61 123 456"
                    />
                  </div>

                  <div className="profile-form__field">
                    <label htmlFor="contact_email" className="field-label">
                      Kontakt email
                    </label>
                    <input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      className="form-input"
                      placeholder="ime@email.com"
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
                    required
                    style={{
                      height: "auto",
                      minHeight: "9rem",
                      paddingTop: "0.9rem",
                    }}
                  />
                </div>

                <div className="profile-form__field">
                  <label htmlFor="hidden_unique_features" className="field-label">
                    Skriveni unikatni detalji
                  </label>
                  <textarea
                    id="hidden_unique_features"
                    name="hidden_unique_features"
                    className="form-input"
                    placeholder="Detalji koje samo vlasnik zna, npr. ogrebotina, naljepnica, sadržaj novčanika..."
                    rows={4}
                    style={{
                      height: "auto",
                      minHeight: "7rem",
                      paddingTop: "0.9rem",
                    }}
                  />
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
