import React, { useEffect, useRef } from "react";
import { PosterCard } from "./PosterCard";

export function Feed({
  items,
  likedIds,
  watchedIds,
  onLike,
  onWatched,
  onSkip,
  loadMore,
  hasMore,
  isLoading
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoading) {
            loadMore();
          }
        });
      },
      { rootMargin: "60% 0px", threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <section className="feed">
      {items.map((item) => (
        <PosterCard
          key={item.id}
          item={item}
          onLike={onLike}
          onWatched={onWatched}
          onSkip={onSkip}
          isLiked={likedIds.includes(item.id)}
          isWatched={watchedIds.includes(item.id)}
        />
      ))}

      {hasMore && (
        <div className="sentinel" ref={sentinelRef}>
          {isLoading ? "Подгружаем..." : "Ещё..."}
        </div>
      )}
      {!hasMore && <div className="end">Больше тайтлов пока нет — обновите позже.</div>}
    </section>
  );
}
