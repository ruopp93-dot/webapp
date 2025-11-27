import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Feed } from "./components/Feed";
import { Profile } from "./components/Profile";
import { useTelegram } from "./hooks/useTelegram";
import { usePersistentState } from "./hooks/usePersistentState";
import { fetchPopularMovies } from "./api/tmdb";

const ACCENT = "#e50914";

function rankItems(items, likedIds, watchedIds) {
  const likedSet = new Set(likedIds);
  const watchedSet = new Set(watchedIds);
  const likedGenreCount = new Map();

  items.forEach((item) => {
    if (!likedSet.has(item.id)) return;
    (item.genreIds || []).forEach((g) => {
      likedGenreCount.set(g, (likedGenreCount.get(g) || 0) + 1);
    });
  });

  return [...items]
    .map((item) => {
      const genreScore = (item.genreIds || []).reduce(
        (sum, g) => sum + (likedGenreCount.get(g) || 0),
        0
      );
      const popScore = (item.popularity || 0) / 10;
      const likedBoost = likedSet.has(item.id) ? 20 : 0;
      const watchedBoost = watchedSet.has(item.id) ? 5 : 0;
      return {
        item,
        score: popScore + genreScore * 2 + likedBoost + watchedBoost
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}

export default function App() {
  const { webApp, user, colorScheme, sendEvent } = useTelegram();
  const userId = user?.id ? String(user.id) : "guest";

  const [view, setView] = useState("feed");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastSource, setLastSource] = useState("tmdb");
  const [useLLMOrder, setUseLLMOrder] = useState(false);

  const [likedIds, setLikedIds] = usePersistentState(`likes-${userId}`, []);
  const [watchedIds, setWatchedIds] = usePersistentState(`watched-${userId}`, []);
  const [hiddenIds, setHiddenIds] = usePersistentState(`hidden-${userId}`, []);

  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);
  const likedSet = useMemo(() => new Set(likedIds), [likedIds]);
  const watchedSet = useMemo(() => new Set(watchedIds), [watchedIds]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", ACCENT);
    document.documentElement.style.setProperty("--bg", "#0b0b0f");
    document.documentElement.style.setProperty("--text", "#f5f5f5");
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => !hiddenSet.has(item.id)),
    [items, hiddenSet]
  );

  const feedItems = useMemo(
    () => (useLLMOrder ? visibleItems : rankItems(visibleItems, likedIds, watchedIds)),
    [useLLMOrder, visibleItems, likedIds, watchedIds]
  );

  const likedItems = useMemo(
    () =>
      likedIds
        .map((id) => items.find((it) => it.id === id) || { id, title: `#${id}` })
        .filter(Boolean),
    [items, likedIds]
  );

  const watchedItems = useMemo(
    () =>
      watchedIds
        .map((id) => items.find((it) => it.id === id) || { id, title: `#${id}` })
        .filter(Boolean),
    [items, watchedIds]
  );

  const bootstrap = useCallback(async () => {
    setIsLoading(true);
    const res = await fetchPopularMovies(1);
    setPage(1);
    setHasMore(res.hasMore);
    setItems(res.items);
    setLastSource(res.from);
    setIsLoading(false);
    setUseLLMOrder(false);
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap, userId]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    const res = await fetchPopularMovies(nextPage);
    setPage(nextPage);
    setHasMore(res.hasMore);
    setLastSource(res.from);
    setItems((prev) => {
      const seen = new Set(prev.map((i) => i.id));
      const merged = [...prev];
      res.items.forEach((item) => {
        if (!seen.has(item.id)) {
          merged.push(item);
          seen.add(item.id);
        }
      });
      return merged;
    });
    setIsLoading(false);
  }, [hasMore, isLoading, page]);

  const handleLike = useCallback(
    (item) => {
      setLikedIds((prev) => {
        const exists = prev.includes(item.id);
        const next = exists ? prev.filter((id) => id !== item.id) : [...prev, item.id];
        sendEvent("like_toggle", { id: item.id, liked: !exists });
        return next;
      });
    },
    [sendEvent, setLikedIds]
  );

  const handleWatched = useCallback(
    (item) => {
      setWatchedIds((prev) => {
        const exists = prev.includes(item.id);
        const next = exists ? prev.filter((id) => id !== item.id) : [...prev, item.id];
        sendEvent("watched_toggle", { id: item.id, watched: !exists });
        return next;
      });
    },
    [sendEvent, setWatchedIds]
  );

  const handleSkip = useCallback(
    (item) => {
      setHiddenIds((prev) => {
        if (prev.includes(item.id)) return prev;
        const next = [...prev, item.id];
        sendEvent("skip", { id: item.id });
        return next;
      });
    },
    [sendEvent, setHiddenIds]
  );

  const handleLLMRecs = useCallback(async () => {
    if (hasMore && items.length < 6) {
      await loadMore();
    }

    const likedPool = items.filter((it) => likedSet.has(it.id));
    const keywordWeight = new Map();
    likedPool.forEach((it) => {
      const text = `${it.title || ""} ${it.overview || ""}`.toLowerCase();
      text
        .split(/[^a-яa-z0-9]+/i)
        .filter((w) => w.length > 2)
        .forEach((w) => {
          keywordWeight.set(w, (keywordWeight.get(w) || 0) + 1);
        });
    });

    const rescored = [...items]
      .map((it) => {
        const text = `${it.title || ""} ${it.overview || ""}`.toLowerCase();
        let kwScore = 0;
        keywordWeight.forEach((count, word) => {
          if (text.includes(word)) {
            kwScore += count * 3;
          }
        });
        const base = (it.popularity || 0) / 10 + (it.rating || 0) * 2;
        const likedBoost = likedSet.has(it.id) ? 20 : 0;
        const watchedPenalty = watchedSet.has(it.id) ? -5 : 0;
        const noise = Math.random() * 5;
        return { it, score: base + kwScore + likedBoost + watchedPenalty + noise };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.it);

    setItems(rescored);
    setUseLLMOrder(true);
    sendEvent("llm_recommendations", { liked: likedIds, watched: watchedIds });
  }, [hasMore, items, likedIds, likedSet, loadMore, sendEvent, watchedIds, watchedSet]);

  return (
    <div className={`app ${colorScheme === "dark" ? "theme-dark" : "theme-light"}`}>
      <header className="tiktok-bar">
        <div className="tiktok-tabs">
          <span className="tab muted">Подписки</span>
          <span className="tab active">Для тебя</span>
        </div>
        <div className="brand">CineSwipe</div>
      </header>

      <div className="status-bar">
        <span className="pill sm">Авторизация: {user ? `TG ${userId}` : "гость"}</span>
        <span className="pill sm ghost">
          Источник: {lastSource === "tmdb" ? "TMDb · ru" : "Fallback локальный"}
        </span>
      </div>

      {view === "feed" ? (
        <Feed
          items={feedItems}
          likedIds={likedIds}
          watchedIds={watchedIds}
          onLike={handleLike}
          onWatched={handleWatched}
          onSkip={handleSkip}
          loadMore={loadMore}
          hasMore={hasMore}
          isLoading={isLoading}
        />
      ) : (
        <Profile user={user} likedItems={likedItems} watchedItems={watchedItems} />
      )}

      <nav className="bottom-nav">
        <button
          className={`nav-btn ${view === "feed" ? "is-active" : ""}`}
          onClick={() => setView("feed")}
        >
          <span role="img" aria-label="home">
            🏠
          </span>
          <span>Лента</span>
        </button>
        <button className="nav-btn plus-btn" onClick={handleLLMRecs}>
          <span role="img" aria-label="recs">
            🎯
          </span>
          <span className="tiny">Реком.</span>
        </button>
        <button
          className={`nav-btn ${view === "profile" ? "is-active" : ""}`}
          onClick={() => setView("profile")}
        >
          <span role="img" aria-label="profile">
            👤
          </span>
          <span>Профиль</span>
        </button>
      </nav>
    </div>
  );
}
