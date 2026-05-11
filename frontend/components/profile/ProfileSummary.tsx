export function ProfileSummary() {
  return (
    <aside className="profile-panel">
      <h2 className="profile-panel__title">Sažetak naloga</h2>

      <div className="profile-summary">
        <div className="profile-summary__item">
          <span className="profile-summary__label">Status naloga</span>
          <span className="profile-summary__value">Aktivan</span>
        </div>

        <div className="profile-summary__item">
          <span className="profile-summary__label">Uloga</span>
          <span className="profile-summary__value">Korisnik</span>
        </div>

        <div className="profile-summary__item">
          <span className="profile-summary__label">Objavljeni oglasi</span>
          <span className="profile-summary__value">3</span>
        </div>

        <div className="profile-summary__item">
          <span className="profile-summary__label">Aktivni oglasi</span>
          <span className="profile-summary__value">2</span>
        </div>

        <div className="profile-summary__item">
          <span className="profile-summary__label">Resolved oglasi</span>
          <span className="profile-summary__value">1</span>
        </div>
      </div>
    </aside>
  );
}