import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type HlsType from 'hls.js';
import type { PlaybackSource } from '@/types';

interface StreamlyPlayerProps {
  sources: PlaybackSource[];
  title: string;
  autoPlay?: boolean;
}

interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
  label: string;
}

export function StreamlyPlayer({
  sources,
  title,
  autoPlay = false,
}: StreamlyPlayerProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  const hlsRef =
    useRef<HlsType | null>(null);

  const orderedSources = useMemo(
    () =>
      [...sources]
        .filter(
          (source) =>
            source.isActive
        )
        .sort((a, b) => {
          if (
            a.isDefault !==
            b.isDefault
          ) {
            return a.isDefault
              ? -1
              : 1;
          }

          return (
            a.sortOrder -
            b.sortOrder
          );
        }),
    [sources]
  );

  const [
    selectedId,
    setSelectedId,
  ] = useState<number | null>(
    orderedSources[0]?.id ??
      null
  );

  const [
    qualityLevels,
    setQualityLevels,
  ] = useState<QualityLevel[]>(
    []
  );

  const [
    selectedQuality,
    setSelectedQuality,
  ] = useState<string>('auto');

  const [
    currentQuality,
    setCurrentQuality,
  ] = useState<string | null>(
    null
  );

  const [
    playbackError,
    setPlaybackError,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (
      selectedId == null ||
      !orderedSources.some(
        (source) =>
          source.id ===
          selectedId
      )
    ) {
      setSelectedId(
        orderedSources[0]?.id ??
          null
      );
    }
  }, [
    orderedSources,
    selectedId,
  ]);

  const selectedSource =
    orderedSources.find(
      (source) =>
        source.id === selectedId
    ) ?? orderedSources[0];

  useEffect(() => {
    const video =
      videoRef.current;

    if (
      !video ||
      !selectedSource
    ) {
      return;
    }

    let cancelled = false;

    const setupPlayer =
      async () => {
        setPlaybackError(null);
        setQualityLevels([]);
        setSelectedQuality(
          'auto'
        );
        setCurrentQuality(null);

        hlsRef.current?.destroy();
        hlsRef.current = null;

        video.pause();
        video.removeAttribute(
          'src'
        );
        video.load();

        const type =
          selectedSource.sourceType
            .toUpperCase();

        if (type === 'HLS') {
          /*
           * Safari/iOS có HLS native.
           * Khi browser dùng native HLS,
           * browser tự quản lý bitrate.
           */
          const nativeHls =
            video.canPlayType(
              'application/vnd.apple.mpegurl'
            );

          if (nativeHls) {
            video.src =
              selectedSource.sourceUrl;

            setCurrentQuality(
              'Auto'
            );

            if (autoPlay) {
              void video
                .play()
                .catch(() => {});
            }

            return;
          }

          /*
           * Chrome/Edge/Firefox:
           * dùng hls.js và cho phép
           * chọn quality thủ công.
           */
          const {
            default: Hls,
          } = await import(
            'hls.js'
          );

          if (
            cancelled ||
            !Hls.isSupported()
          ) {
            if (!cancelled) {
              setPlaybackError(
                'Trình duyệt không hỗ trợ nguồn HLS này.'
              );
            }

            return;
          }

          const hls =
            new Hls({
              enableWorker: true,
              startLevel: -1,
            });

          hlsRef.current = hls;

          hls.attachMedia(video);

          hls.loadSource(
            selectedSource.sourceUrl
          );

          hls.on(
            Hls.Events
              .MANIFEST_PARSED,
            () => {
              if (cancelled) {
                return;
              }

              const levels =
                hls.levels
                  .map(
                    (
                      level,
                      index
                    ) => {
                      const height =
                        level.height ??
                        0;

                      const bitrate =
                        level.bitrate ??
                        0;

                      const label =
                        height > 0
                          ? `${height}p`
                          : `${Math.round(
                              bitrate /
                                1000
                            )} kbps`;

                      return {
                        index,
                        height,
                        bitrate,
                        label,
                      };
                    }
                  )
                  .sort(
                    (a, b) =>
                      b.height -
                        a.height ||
                      b.bitrate -
                        a.bitrate
                  );

              setQualityLevels(
                levels
              );

              if (autoPlay) {
                void video
                  .play()
                  .catch(() => {});
              }
            }
          );

          hls.on(
            Hls.Events
              .LEVEL_SWITCHED,
            (_, data) => {
              const level =
                hls.levels[
                  data.level
                ];

              if (
                level?.height
              ) {
                setCurrentQuality(
                  `${level.height}p`
                );
              }
            }
          );

          hls.on(
            Hls.Events.ERROR,
            (_, data) => {
              if (
                !data.fatal
              ) {
                return;
              }

              switch (
                data.type
              ) {
                case Hls
                  .ErrorTypes
                  .NETWORK_ERROR:
                  hls.startLoad();
                  break;

                case Hls
                  .ErrorTypes
                  .MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;

                default:
                  setPlaybackError(
                    'Không thể phát nguồn video này.'
                  );

                  hls.destroy();
                  hlsRef.current =
                    null;
              }
            }
          );

          return;
        }

        if (type === 'DASH') {
          setPlaybackError(
            'Nguồn DASH chưa được hỗ trợ.'
          );

          return;
        }

        /*
         * MP4 / WEBM
         */
        video.src =
          selectedSource.sourceUrl;

        if (autoPlay) {
          void video
            .play()
            .catch(() => {});
        }
      };

    void setupPlayer();

    return () => {
      cancelled = true;

      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [
    selectedSource,
    autoPlay,
  ]);

  const changeQuality = (
    value: string
  ) => {
    setSelectedQuality(value);

    const hls =
      hlsRef.current;

    if (!hls) {
      return;
    }

    if (value === 'auto') {
      /*
       * -1 = Adaptive Bitrate.
       * hls.js tự chọn theo mạng.
       */
      hls.currentLevel = -1;

      return;
    }

    const levelIndex =
      Number(value);

    if (
      Number.isInteger(
        levelIndex
      )
    ) {
      hls.currentLevel =
        levelIndex;
    }
  };

  if (!selectedSource) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-card bg-surface-elevated p-8 text-center text-text-secondary">
        Phim này chưa có
        nguồn phát.
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
          Trình duyệt của bạn
          không hỗ trợ video.
        </video>

        {playbackError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center">
            <p className="text-sm text-white">
              {playbackError}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {qualityLevels.length >
          0 && (
          <>
            <span className="text-sm text-text-secondary">
              Chất lượng:
            </span>

            <select
              value={
                selectedQuality
              }
              onChange={(
                event
              ) =>
                changeQuality(
                  event.target
                    .value
                )
              }
              className="rounded-button border border-white/10 bg-surface-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-brand"
            >
              <option value="auto">
                Auto
                {currentQuality
                  ? ` (${currentQuality})`
                  : ''}
              </option>

              {qualityLevels.map(
                (level) => (
                  <option
                    key={
                      level.index
                    }
                    value={
                      level.index
                    }
                  >
                    {
                      level.label
                    }
                  </option>
                )
              )}
            </select>
          </>
        )}

        {orderedSources.length >
          1 && (
          <>
            <span className="text-sm text-text-secondary">
              Nguồn:
            </span>

            <select
              value={
                selectedSource.id
              }
              onChange={(
                event
              ) =>
                setSelectedId(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              className="rounded-button border border-white/10 bg-surface-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-brand"
            >
              {orderedSources.map(
                (source) => (
                  <option
                    key={
                      source.id
                    }
                    value={
                      source.id
                    }
                  >
                    {[
                      source.quality,
                      source.language,
                      source.sourceType,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ' • '
                      )}
                  </option>
                )
              )}
            </select>
          </>
        )}
      </div>

      {(selectedSource.providerName ||
        selectedSource.license) && (
        <div className="text-xs text-text-muted">
          {selectedSource.providerName && (
            <span>
              Nguồn:{' '}
              {
                selectedSource.providerName
              }
            </span>
          )}

          {selectedSource.license && (
            <span>
              {' '}
              • Giấy phép:{' '}
              {
                selectedSource.license
              }
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