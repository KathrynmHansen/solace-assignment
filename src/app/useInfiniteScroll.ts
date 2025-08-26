import { useEffect, useRef, useCallback } from "react";

interface InfiniteScrollOptions {
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number; // how close to bottom before loading
}

export function useInfiniteScroll({ hasMore, onLoadMore, threshold = 1.0 }: InfiniteScrollOptions) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    if (hasMore) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold }
    );

    const node = loaderRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [loadMore, threshold]);

  return loaderRef;
}