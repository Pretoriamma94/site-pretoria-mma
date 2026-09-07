'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { NewsPopup } from '@/components/NewsPopup';
import {
  isNewsPopupExcludedPath,
  type NewsPopupPayload,
} from '@/lib/news-popup';

function isPopupPayload(value: unknown): value is NewsPopupPayload {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== 'string' ||
    typeof row.titre !== 'string' ||
    typeof row.slug !== 'string' ||
    typeof row.resume !== 'string' ||
    !(row.image_url === null || typeof row.image_url === 'string')
  ) {
    return false;
  }
  return true;
}

export function NewsPopupHost() {
  const pathname = usePathname();
  const [post, setPost] = useState<NewsPopupPayload | null>(null);

  useEffect(() => {
    if (isNewsPopupExcludedPath(pathname)) {
      setPost(null);
      return;
    }

    let cancelled = false;
    fetch('/api/news-popup')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        if (!cancelled && isPopupPayload(data)) {
          setPost({
            ...data,
            max_affichages:
              data.max_affichages === 2 || data.max_affichages === 3 ? data.max_affichages : 1,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setPost(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!post) return null;
  return <NewsPopup post={post} />;
}
