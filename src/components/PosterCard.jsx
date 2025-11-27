import React from "react";

export function PosterCard({
  item,
  onLike,
  onWatched,
  onSkip,
  isLiked,
  isWatched
}) {
  const likeCount = Math.max(1, Math.round((item.popularity || item.rating || 100) * 10));
  const watchCount = Math.max(1, Math.round((item.popularity || 100) * 2));

  return (
    <article className="card">
      <div className="card-media">
        {item.poster ? (
          <img src={item.poster} alt={item.title} loading="lazy" />
        ) : (
          <div className="card-placeholder">Нет постера</div>
        )}

        <div className="floating-actions">
          <button
            className={`floating-btn ${isLiked ? "is-active" : ""}`}
            onClick={() => onLike(item)}
          >
            <span role="img" aria-label="лайк">
              ❤️
            </span>
            <div className="count">{likeCount.toLocaleString("ru-RU")}</div>
          </button>
          <button
            className={`floating-btn ${isWatched ? "is-active" : ""}`}
            onClick={() => onWatched(item)}
          >
            <span role="img" aria-label="просмотрено">
              👁️
            </span>
            <div className="count">{watchCount.toLocaleString("ru-RU")}</div>
          </button>
          <button className="floating-btn ghost" onClick={() => onSkip(item)}>
            <span role="img" aria-label="не интересно">
              🚫
            </span>
            <div className="count">Скрыть</div>
          </button>
        </div>

        <div className="card-overlay top">
          <div className="pill">⭐ {item.rating ? item.rating.toFixed(1) : "N/A"}</div>
          {item.releaseDate && <div className="pill">{item.releaseDate.slice(0, 4)}</div>}
        </div>

        <div className="card-overlay bottom">
          <div className="user-row">
            <div className="avatar sm">{item.title?.slice(0, 1) || "Ф"}</div>
            <div>
              <div className="username">@cinebot</div>
              <div className="muted tiny">Персональные рекомендации</div>
            </div>
          </div>
          <div className="card-title">{item.title}</div>
          {item.overview && <div className="card-desc">{item.overview}</div>}
        </div>
      </div>
    </article>
  );
}
