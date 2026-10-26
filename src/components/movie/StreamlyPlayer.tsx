import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type HlsType from 'hls.js';

import {
  Maximize,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';

import type {
  PlaybackSource,
} from '@/types';

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

function formatTime(
  seconds: number
) {
  if (
    !Number.isFinite(seconds)
  ) {
    return '0:00';
  }

  const total =
    Math.max(
      0,
      Math.floor(seconds)
    );

  const minutes =
    Math.floor(total / 60);

  const remainingSeconds =
    total % 60;

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

export function StreamlyPlayer({
  sources,
  title,
  autoPlay = false,
}: StreamlyPlayerProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

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
  ] = useState('auto');

  const [
    currentQuality,
    setCurrentQuality,
  ] = useState<string | null>(
    null
  );

  const [
    showSettings,
    setShowSettings,
  ] = useState(false);

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    duration,
    setDuration,
  ] = useState(0);

  const [
    volume,
    setVolume,
  ] = useState(1);

  const [
    muted,
    setMuted,
  ] = useState(false);

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
        source.id ===
        selectedId
    ) ??
    orderedSources[0];

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

    const setup =
      async () => {
        setPlaybackError(null);
        setQualityLevels([]);
        setSelectedQuality(
          'auto'
        );
        setCurrentQuality(null);
        setShowSettings(false);

        hlsRef.current?.destroy();
        hlsRef.current = null;

        video.pause();
        video.removeAttribute(
          'src'
        );
        video.load();

        const sourceType =
          selectedSource.sourceType
            .toUpperCase();

        if (
          sourceType === 'HLS'
        ) {
          const nativeHls =
            video.canPlayType(
              'application/vnd.apple.mpegurl'
            );

          /*
           * Safari/iPhone:
           * hệ điều hành tự xử lý
           * Adaptive Bitrate.
           */
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
           * Chrome / Edge /
           * Firefox:
           * dùng hls.js.
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
                'Trình duyệt không hỗ trợ HLS.'
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

              /*
               * Lấy các quality thật
               * từ HLS manifest.
               */
              const levelMap =
                new Map<
                  string,
                  QualityLevel
                >();

              hls.levels.forEach(
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

                  const existing =
                    levelMap.get(
                      label
                    );

                  if (
                    !existing ||
                    bitrate >
                      existing.bitrate
                  ) {
                    levelMap.set(
                      label,
                      {
                        index,
                        height,
                        bitrate,
                        label,
                      }
                    );
                  }
                }
              );

              const levels =
                Array.from(
                  levelMap.values()
                ).sort(
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
              } else {
                setCurrentQuality(
                  null
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
                    'Không thể phát nguồn phim này.'
                  );

                  hls.destroy();

                  hlsRef.current =
                    null;
              }
            }
          );

          return;
        }

        if (
          sourceType ===
          'DASH'
        ) {
          setPlaybackError(
            'Nguồn DASH chưa được hỗ trợ.'
          );

          return;
        }

        /*
         * MP4 / WebM.
         */
        video.src =
          selectedSource.sourceUrl;

        if (autoPlay) {
          void video
            .play()
            .catch(() => {});
        }
      };

    void setup();

    return () => {
      cancelled = true;

      hlsRef.current?.destroy();

      hlsRef.current = null;
    };
  }, [
    selectedSource,
    autoPlay,
  ]);

  const togglePlay =
    async () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      if (video.paused) {
        await video
          .play()
          .catch(() => {});
      } else {
        video.pause();
      }
    };

  const changeQuality = (
    value: string
  ) => {
    const hls =
      hlsRef.current;

    if (!hls) {
      return;
    }

    setSelectedQuality(value);

    if (
      value === 'auto'
    ) {
      /*
       * -1 = Adaptive Bitrate.
       */
      hls.currentLevel = -1;

      setShowSettings(false);

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

    setShowSettings(false);
  };

  const changeProgress = (
    value: number
  ) => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime =
      value;

    setCurrentTime(value);
  };

  const changeVolume = (
    value: number
  ) => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.volume = value;
    video.muted =
      value === 0;

    setVolume(value);
    setMuted(
      value === 0
    );
  };

  const toggleMute = () => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    const nextMuted =
      !video.muted;

    video.muted =
      nextMuted;

    setMuted(
      nextMuted
    );
  };

  const toggleFullscreen =
    async () => {
      const container =
        containerRef.current;

      if (!container) {
        return;
      }

      if (
        document.fullscreenElement
      ) {
        await document
          .exitFullscreen()
          .catch(() => {});

        return;
      }

      await container
        .requestFullscreen()
        .catch(() => {});
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
      <div
        ref={containerRef}
        className="group relative aspect-video overflow-hidden rounded-card bg-black shadow-card"
      >
        <video
          ref={videoRef}
          className="h-full w-full bg-black object-contain"
          playsInline
          preload="metadata"
          title={`Xem ${title}`}
          onClick={() =>
            void togglePlay()
          }
          onDoubleClick={() =>
            void toggleFullscreen()
          }
          onPlay={() =>
            setIsPlaying(true)
          }
          onPause={() =>
            setIsPlaying(false)
          }
          onTimeUpdate={(
            event
          ) =>
            setCurrentTime(
              event.currentTarget
                .currentTime
            )
          }
          onLoadedMetadata={(
            event
          ) =>
            setDuration(
              event.currentTarget
                .duration
            )
          }
          onDurationChange={(
            event
          ) =>
            setDuration(
              event.currentTarget
                .duration
            )
          }
          onVolumeChange={(
            event
          ) => {
            setVolume(
              event.currentTarget
                .volume
            );

            setMuted(
              event.currentTarget
                .muted
            );
          }}
        />

        {playbackError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-6 text-center">
            <p className="text-white">
              {playbackError}
            </p>
          </div>
        )}

        {/* CONTROL BAR */}
        <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 pb-3 pt-12 sm:px-5 sm:pb-4">
          {/* TIMELINE */}
          <input
            type="range"
            min={0}
            max={
              Number.isFinite(
                duration
              )
                ? duration
                : 0
            }
            step="0.1"
            value={currentTime}
            onChange={(
              event
            ) =>
              changeProgress(
                Number(
                  event.target
                    .value
                )
              )
            }
            className="mb-3 h-1 w-full cursor-pointer accent-white"
          />

          <div className="flex items-center gap-3">
            {/* PLAY */}
            <button
              type="button"
              onClick={() =>
                void togglePlay()
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
              aria-label={
                isPlaying
                  ? 'Tạm dừng'
                  : 'Phát'
              }
            >
              {isPlaying ? (
                <Pause
                  size={23}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={23}
                  fill="currentColor"
                />
              )}
            </button>

            {/* VOLUME */}
            <button
              type="button"
              onClick={
                toggleMute
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
              aria-label="Âm lượng"
            >
              {muted ||
              volume === 0 ? (
                <VolumeX
                  size={22}
                />
              ) : (
                <Volume2
                  size={22}
                />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step="0.05"
              value={
                muted
                  ? 0
                  : volume
              }
              onChange={(
                event
              ) =>
                changeVolume(
                  Number(
                    event.target
                      .value
                  )
                )
              }
              className="hidden w-20 cursor-pointer accent-white sm:block"
            />

            {/* TIME */}
            <span className="whitespace-nowrap text-xs text-white/90 sm:text-sm">
              {formatTime(
                currentTime
              )}
              {' / '}
              {formatTime(
                duration
              )}
            </span>

            <div className="flex-1" />

            {/* QUALITY SETTINGS */}
            {qualityLevels.length >
              0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowSettings(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                  className="flex h-9 items-center gap-1 rounded-full px-2 text-white transition hover:bg-white/15"
                  aria-label="Chất lượng"
                >
                  <Settings
                    size={22}
                  />

                  <span className="hidden text-xs sm:inline">
                    {selectedQuality ===
                    'auto'
                      ? currentQuality
                        ? `Auto ${currentQuality}`
                        : 'Auto'
                      : qualityLevels.find(
                          (
                            level
                          ) =>
                            String(
                              level.index
                            ) ===
                            selectedQuality
                        )
                          ?.label ??
                        'Quality'}
                  </span>
                </button>

                {showSettings && (
                  <div className="absolute bottom-12 right-0 min-w-44 overflow-hidden rounded-lg border border-white/10 bg-neutral-900/95 py-2 shadow-2xl backdrop-blur">
                    <p className="px-4 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-white/50">
                      Chất lượng
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        changeQuality(
                          'auto'
                        )
                      }
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-white/10 ${
                        selectedQuality ===
                        'auto'
                          ? 'text-white'
                          : 'text-white/75'
                      }`}
                    >
                      <span>
                        Auto
                      </span>

                      {currentQuality && (
                        <span className="text-xs text-white/50">
                          {
                            currentQuality
                          }
                        </span>
                      )}
                    </button>

                    {qualityLevels.map(
                      (
                        level
                      ) => (
                        <button
                          type="button"
                          key={
                            level.index
                          }
                          onClick={() =>
                            changeQuality(
                              String(
                                level.index
                              )
                            )
                          }
                          className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-white/10 ${
                            selectedQuality ===
                            String(
                              level.index
                            )
                              ? 'text-white'
                              : 'text-white/75'
                          }`}
                        >
                          <span>
                            {
                              level.label
                            }
                          </span>

                          {selectedQuality ===
                            String(
                              level.index
                            ) && (
                            <span>
                              ✓
                            </span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* FULLSCREEN */}
            <button
              type="button"
              onClick={() =>
                void toggleFullscreen()
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
              aria-label="Toàn màn hình"
            >
              <Maximize
                size={22}
              />
            </button>
          </div>
        </div>
      </div>

      {/* MULTIPLE PHYSICAL SOURCES */}
      {orderedSources.length >
        1 && (
        <div className="flex flex-wrap items-center gap-3">
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
        </div>
      )}

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