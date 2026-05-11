const mockListings = [
  {
    id: 1,
    title: "Izgubljen crni novčanik",
    description: "Novčanik izgubljen u blizini SCC-a, s dokumentima i karticama.",
    location: "Marijin Dvor, Sarajevo",
    date: "08.05.2026",
    status: "lost",
    cta: "Pogledaj detalje",
  },
  {
    id: 2,
    title: "Pronađen set ključeva",
    description: "Ključevi pronađeni na klupi u parku, sa plavim privjeskom.",
    location: "Baščaršija, Sarajevo",
    date: "06.05.2026",
    status: "found",
    cta: "Pogledaj detalje",
  },
  {
    id: 3,
    title: "Izgubljen sivi ruksak",
    description: "Ruksak ostavljen u tramvaju, unutra su sveske i punjač.",
    location: "Grbavica, Sarajevo",
    date: "03.05.2026",
    status: "resolved",
    cta: "Pogledaj detalje",
  },
];

export function ProfileListings() {
  return (
    <section className="profile-listings">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Moji oglasi</p>
          <h2 className="section-heading__title">
            Pregled oglasa koje si objavio
          </h2>
        </div>
      </div>

      <div className="profile-listings__grid">
        {mockListings.map((listing) => (
          <article key={listing.id} className="listing-card">
            <div
              className="listing-card__image listing-card__image--placeholder"
              aria-hidden="true"
            />

            <div className="listing-card__content">
              <div className="listing-card__header">
                <h3 className="listing-card__title">{listing.title}</h3>

                <span className={`status-badge status-badge--${listing.status}`}>
                  {listing.status === "lost" && "Izgubljeno"}
                  {listing.status === "found" && "Pronađeno"}
                  {listing.status === "resolved" && "Resolved"}
                </span>
              </div>

              <p className="listing-card__description">{listing.description}</p>

              <div className="listing-card__meta">
                <span>{listing.location}</span>
                <span>{listing.date}</span>
              </div>

              <a href="#" className="listing-card__link">
                {listing.cta}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}