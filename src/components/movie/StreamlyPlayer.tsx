import { useEffect, useMemo, useRef, useState } from 'react';
import Hls from 'hls.js';
import type { PlaybackSource } from '@/types';

interface StreamlyPlayerProps {
  sources: PlaybackSource[];
  title: string;
  autoPlay?: boolean;
}

export function StreamlyPlayer({
  sources,
  title,
  autoPlay = false,
}: StreamlyPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const orderedSources = useMemo(
    () =>
      [...sources]
        .filter((source) => source.isActive)
        .sort((a, b) => {
          if (a.isDefault !== b.isDefault) {
            return a.isDefault ? -1 : 1;
          }

          return a.sortOrder - b.sortOrder;
        }),
    [sources]
  );

  const [selectedId, setSelectedId] =
    useState<number | null>(
      orderedSources[0]?.id ?? null
    );

  useEffect(() => {
    if (
      selectedId == null ||
      !orderedSources.some(
        (source) => source.id === selectedId
      )
    ) {
      setSelectedId(
        orderedSources[0]?.id ?? null
      );
    }
  }, [orderedSources, selectedId]);

  const selectedSource =
    orderedSources.find(
      (source) => source.id === selectedId
    ) ?? orderedSources[0];

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !selectedSource) {
      return;
    }

    const type =
      selectedSource.sourceType.toUpperCase();

    let hls: Hls | null = null;

    video.pause();
    video.removeAttribute('src');
    video.load();

    if (type === 'HLS') {
      if (video.canPlayType(
        'application/vnd.apple.mpegurl'
      )) {
        video.src = selectedSource.sourceUrl;
      } else if (Hls.isSupported()) {
        hls = new Hls();

        hls.loadSource(
          selectedSource.sourceUrl
        );

        hls.attachMedia(video);
      }
    } else {
      video.src = selectedSource.sourceUrl;
    }

    if (autoPlay) {
      void video.play().catch(() => {
        // Browser có thể chặn autoplay có âm thanh.
      });
    }

    return () => {
      hls?.destroy();
    };
  }, [selectedSource, autoPlay]);

  if (!selectedSource) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-card bg-surface-elevated p-8 text-center text-text-secondary">
        Phim này chưa có nguồn phát.
      </div>
    );
  }

  if (
    selectedSource.sourceType.toUpperCase() ===
    'DASH'
  ) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-card bg-surface-elevated p-8 text-center text-text-secondary">
        Nguồn DASH chưa được hỗ trợ trên player hiện tại.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-card bg-black shadow-card">
        <video
          ref={videoRef}
          className="h-full w-full bg-black object-contain"
          controls
          playsInline
          preload="metadata"
          title={`Xem ${title}`}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </div>

      {orderedSources.length > 1 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-text-secondary">
            Nguồn phát:
          </span>

          <select
            value={selectedSource.id}
            onChange={(event) =>
              setSelectedId(
                Number(event.target.value)
              )
            }
            className="rounded-button border border-white/10 bg-surface-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-brand"
          >
            {orderedSources.map((source) => (
              <option
                key={source.id}
                value={source.id}
              >
                {[
                  source.quality,
                  source.language,
                  source.sourceType,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {(selectedSource.providerName ||
        selectedSource.license) && (
        <div className="text-xs text-text-muted">
          {selectedSource.providerName && (
            <span>
              Nguồn: {selectedSource.providerName}
            </span>
          )}

          {selectedSource.license && (
            <span>
              {' '}
              • Giấy phép:{' '}
              {selectedSource.license}
            </span>
          )}

          {selectedSource.attributionUrl && (
            <>
              {' '}
              •{' '}
              <a
                href={
                  selectedSource.attributionUrl
                }
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline"
              >
                Thông tin nguồn
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}