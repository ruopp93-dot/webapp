import React from "react";

export function Profile({ user, likedItems, watchedItems }) {
  const initials = user?.first_name?.[0] || "U";
  return (
    <section className="profile">
      <div className="profile-card">
        <div className="avatar">{initials}</div>
        <div>
          <div className="muted">Telegram ID</div>
          <h3>{user?.id || "guest"}</h3>
          <div className="muted">
            {user?.first_name} {user?.last_name}
            {user?.username && <span> · @{user.username}</span>}
          </div>
        </div>
      </div>

      <div className="profile-section">
        <div className="section-title">Лайкнуто ({likedItems.length})</div>
        <div className="compact-grid">
          {likedItems.length === 0 && <div className="muted">Пока пусто</div>}
          {likedItems.map((item) => (
            <div className="chip" key={`like-${item.id}`}>
              {item.poster && <img src={item.poster} alt="" loading="lazy" />}
              <div>
                <div className="chip-title">{item.title}</div>
                <div className="muted">⭐ {item.rating ? item.rating.toFixed(1) : "N/A"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <div className="section-title">Просмотрено ({watchedItems.length})</div>
        <div className="compact-grid">
          {watchedItems.length === 0 && <div className="muted">Ещё ничего не отмечено</div>}
          {watchedItems.map((item) => (
            <div className="chip" key={`watched-${item.id}`}>
              {item.poster && <img src={item.poster} alt="" loading="lazy" />}
              <div>
                <div className="chip-title">{item.title}</div>
                <div className="muted">
                  {item.releaseDate ? item.releaseDate.slice(0, 4) : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
