import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import type HlsType from 'hls.js';

import {
  Check,
  LoaderCircle,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';

import type { PlaybackSource } from '@/types';

interface StreamlyPlayerProps {
  sources: PlaybackSource[];
  title: string;
  autoPlay?: boolean;
}

interface TrackOption {
  index: number;
  label: string;
}

interface QualityOption extends TrackOption {
  height: number;
  bitrate: number;
}

const SPEED_OPTIONS = [
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  2,
];

function formatTime(seconds: number): string {
  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    return '0:00';
  }

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(
    (total % 3600) / 60
  );

  const remainingSeconds = String(
    total % 60
  ).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      '0'
    )}:${remainingSeconds}`;
  }

  return `${minutes}:${remainingSeconds}`;
}

function languageLabel(
  language?: string | null,
  name?: string | null
): string {
  const lang = (language ?? '')
    .trim()
    .toLowerCase();

  const rawName = (name ?? '').trim();

  if (
    lang === 'vi' ||
    lang.startsWith('vi-')
  ) {
    return 'Tiếng Việt';
  }

  if (
    lang === 'en' ||
    lang.startsWith('en-')
  ) {
    return 'English';
  }

  return (
    rawName ||
    language ||
    'Không rõ ngôn ngữ'
  );
}

function MenuOption({
  label,
  selected = false,
  disabled = false,
  onClick,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className="flex min-h-10 w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="min-w-0 break-words">
        {label}
      </span>

      {selected && (
        <Check
          size={16}
          className="shrink-0"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export function StreamlyPlayer({
  sources,
  title,
  autoPlay = false,
}: StreamlyPlayerProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const hlsRef =
    useRef<HlsType | null>(null);

  // Danh sách nguồn đang hoạt động.
  const activeSources = useMemo(
    () =>
      sources
        .filter((source) => source.isActive)
        .slice()
        .sort((a, b) => {
          if (a.isDefault !== b.isDefault) {
            return a.isDefault ? -1 : 1;
          }

          return (
            a.sortOrder - b.sortOrder ||
            a.id - b.id
          );
        }),
    [sources]
  );

  const [sourceId, setSourceId] =
    useState<number | null>(null);

  const selectedSource =
    activeSources.find(
      (source) => source.id === sourceId
    ) ?? activeSources[0];

  // Playback state.
  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isBuffering, setIsBuffering] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(1);

  const [muted, setMuted] =
    useState(false);

  const [speed, setSpeed] =
    useState(1);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [settingsOpen, setSettingsOpen] =
    useState(false);
  
  const [controlsVisible, setControlsVisible] =
    useState(true);

  const controlsTimeoutRef =
    useRef<number | null>(null);

  const [playbackError, setPlaybackError] =
    useState<string | null>(null);

  // Quality.
  const [qualityLevels, setQualityLevels] =
    useState<QualityOption[]>([]);

  const [qualityChoice, setQualityChoice] =
    useState('auto');

  const [currentQuality, setCurrentQuality] =
    useState<string | null>(null);

  // Audio.
  const [audioTracks, setAudioTracks] =
    useState<TrackOption[]>([]);

  const [audioChoice, setAudioChoice] =
    useState(-1);

  // Subtitles.
  const [subtitleTracks, setSubtitleTracks] =
    useState<TrackOption[]>([]);

  const [subtitleChoice, setSubtitleChoice] =
    useState(-1);

  const [
    nativeSubtitleTracks,
    setNativeSubtitleTracks,
  ] = useState(false);

  // Chọn nguồn mặc định khi cần.
  useEffect(() => {
    if (
      !activeSources.some(
        (source) => source.id === sourceId
      )
    ) {
      setSourceId(
        activeSources[0]?.id ?? null
      );
    }
  }, [activeSources, sourceId]);

  const sourceUrl =
    selectedSource?.sourceUrl ?? '';

  const sourceType =
    selectedSource?.sourceType?.toUpperCase() ??
    '';

  const currentSourceId =
    selectedSource?.id ?? -1;

  // Khởi tạo video khi đổi nguồn.
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !sourceUrl) {
      return;
    }

    let cancelled = false;
    let retriedNetwork = false;
    let retriedMedia = false;

    let ownedHls: HlsType | null = null;

    const resetPlayer = () => {
      setPlaybackError(null);
      setIsPlaying(false);
      setIsBuffering(true);
      setCurrentTime(0);
      setDuration(0);

      setQualityLevels([]);
      setQualityChoice('auto');
      setCurrentQuality(null);

      setAudioTracks([]);
      setAudioChoice(-1);

      setSubtitleTracks([]);
      setSubtitleChoice(-1);
      setNativeSubtitleTracks(false);

      setSettingsOpen(false);

      hlsRef.current?.destroy();
      hlsRef.current = null;

      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    const syncNativeSubtitles = () => {
      if (cancelled || hlsRef.current) {
        return;
      }

      const result: TrackOption[] = [];

      for (
        let index = 0;
        index < video.textTracks.length;
        index++
      ) {
        const track = video.textTracks[index];

        if (
          track.kind === 'subtitles' ||
          track.kind === 'captions'
        ) {
          result.push({
            index,
            label: languageLabel(
              track.language,
              track.label
            ),
          });
        }
      }

      setSubtitleTracks(result);
      setNativeSubtitleTracks(true);
    };

    const initializePlayer = async () => {
      resetPlayer();

      // DASH chưa tích hợp.
      if (sourceType === 'DASH') {
        setPlaybackError(
          'Nguồn DASH chưa được hỗ trợ.'
        );

        setIsBuffering(false);
        return;
      }

      // MP4 / WebM.
      if (sourceType !== 'HLS') {
        video.src = sourceUrl;

        if (autoPlay) {
          void video.play().catch(() => {
            // Autoplay có thể bị trình duyệt chặn.
          });
        }

        return;
      }

      // Safari và iOS có thể phát HLS native.
      if (
        video.canPlayType(
          'application/vnd.apple.mpegurl'
        )
      ) {
        video.src = sourceUrl;

        setCurrentQuality(
          'Auto (trình duyệt)'
        );

        syncNativeSubtitles();

        if (autoPlay) {
          void video.play().catch(() => {});
        }

        return;
      }

      // Chrome / Edge / Firefox:
      // tải hls.js khi cần thiết.
      const { default: Hls } = await import(
        'hls.js'
      );

      if (cancelled) {
        return;
      }

      if (!Hls.isSupported()) {
        setPlaybackError(
          'Trình duyệt này không hỗ trợ HLS.'
        );

        setIsBuffering(false);
        return;
      }

      const hls = new Hls({
        enableWorker: true,
        startLevel: -1,
      });

      ownedHls = hls;
      hlsRef.current = hls;

      // Lấy chất lượng thật từ HLS.
      const updateQualities = () => {
        if (cancelled) {
          return;
        }

        const options: QualityOption[] =
          hls.levels.map((level, index) => {
            const height =
              level.height || 0;

            const bitrate =
              level.bitrate || 0;

            const resolution =
              height > 0
                ? `${height}p`
                : 'Không rõ độ phân giải';

            return {
              index,
              height,
              bitrate,
              label: `${resolution} · ${Math.round(
                bitrate / 1000
              )} kbps`,
            };
          });

        options.sort(
          (a, b) =>
            b.height - a.height ||
            b.bitrate - a.bitrate
        );

        setQualityLevels(options);
      };

      // Lấy các ngôn ngữ âm thanh.
      const updateAudioTracks = () => {
        if (cancelled) {
          return;
        }

        setAudioTracks(
          hls.audioTracks.map(
            (track, index) => ({
              index,
              label: languageLabel(
                track.lang,
                track.name
              ),
            })
          )
        );

        setAudioChoice(hls.audioTrack);
      };

      // Lấy phụ đề của HLS.
      const updateSubtitleTracks = () => {
        if (cancelled) {
          return;
        }

        setSubtitleTracks(
          hls.subtitleTracks.map(
            (track, index) => ({
              index,
              label: languageLabel(
                track.lang,
                track.name
              ),
            })
          )
        );

        setSubtitleChoice(
          hls.subtitleTrack
        );

        setNativeSubtitleTracks(false);
      };

      hls.on(
        Hls.Events.MANIFEST_PARSED,
        () => {
          if (cancelled) {
            return;
          }

          updateQualities();
          updateAudioTracks();
          updateSubtitleTracks();

          if (autoPlay) {
            void video.play().catch(() => {});
          }
        }
      );

      hls.on(
        Hls.Events.LEVELS_UPDATED,
        updateQualities
      );

      hls.on(
        Hls.Events.AUDIO_TRACKS_UPDATED,
        updateAudioTracks
      );

      hls.on(
        Hls.Events.SUBTITLE_TRACKS_UPDATED,
        updateSubtitleTracks
      );

      hls.on(
        Hls.Events.LEVEL_SWITCHED,
        (_, data) => {
          if (cancelled) {
            return;
          }

          const level =
            hls.levels[data.level];

          setCurrentQuality(
            level?.height
              ? `${level.height}p`
              : null
          );
        }
      );

      hls.on(
        Hls.Events.AUDIO_TRACK_SWITCHED,
        (_, data) => {
          if (!cancelled) {
            setAudioChoice(data.id);
          }
        }
      );

      hls.on(
        Hls.Events.SUBTITLE_TRACK_SWITCH,
        (_, data) => {
          if (!cancelled) {
            setSubtitleChoice(data.id);
          }
        }
      );

      hls.on(
        Hls.Events.ERROR,
        (_, data) => {
          if (!data.fatal || cancelled) {
            return;
          }

          if (
            data.type ===
              Hls.ErrorTypes.NETWORK_ERROR &&
            !retriedNetwork
          ) {
            retriedNetwork = true;
            hls.startLoad();
          } else if (
            data.type ===
              Hls.ErrorTypes.MEDIA_ERROR &&
            !retriedMedia
          ) {
            retriedMedia = true;
            hls.recoverMediaError();
          } else {
            setIsBuffering(false);

            setPlaybackError(
              'Nguồn phim đang lỗi hoặc không truy cập được. Hãy thử nguồn khác.'
            );

            hls.destroy();

            if (hlsRef.current === hls) {
              hlsRef.current = null;
            }
          }
        }
      );

      hls.attachMedia(video);
      hls.loadSource(sourceUrl);
    };

    video.textTracks.addEventListener(
      'addtrack',
      syncNativeSubtitles
    );

    video.addEventListener(
      'loadedmetadata',
      syncNativeSubtitles
    );

    void initializePlayer().catch(() => {
      if (!cancelled) {
        setPlaybackError(
          'Không khởi tạo được trình phát video.'
        );

        setIsBuffering(false);
      }
    });

    return () => {
      cancelled = true;

      video.textTracks.removeEventListener(
        'addtrack',
        syncNativeSubtitles
      );

      video.removeEventListener(
        'loadedmetadata',
        syncNativeSubtitles
      );

      ownedHls?.destroy();

      if (hlsRef.current === ownedHls) {
        hlsRef.current = null;
      }
    };
  }, [
    currentSourceId,
    sourceUrl,
    sourceType,
    autoPlay,
  ]);

  // Đồng bộ tốc độ phát.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Theo dõi fullscreen.
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement)
      );
    };

    document.addEventListener(
      'fullscreenchange',
      onFullscreenChange
    );

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        onFullscreenChange
      );
    };
  }, []);

  // Play / Pause.
  const togglePlay = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  // Lùi 10s / tua 30s.
  const seek = (offset: number) => {
    const video = videoRef.current;

    if (
      !video ||
      !Number.isFinite(video.currentTime)
    ) {
      return;
    }

    const end = Number.isFinite(
      video.duration
    )
      ? video.duration
      : Infinity;

    const next = Math.min(
      end,
      Math.max(
        0,
        video.currentTime + offset
      )
    );

    video.currentTime = next;
    setCurrentTime(next);
  };

  // Tua đến vị trí trên timeline.
  const seekTo = (time: number) => {
    const video = videoRef.current;

    if (
      !video ||
      !Number.isFinite(video.duration)
    ) {
      return;
    }

    video.currentTime = Math.min(
      video.duration,
      Math.max(0, time)
    );

    setCurrentTime(video.currentTime);
  };

  // Chỉnh âm lượng.
  const setPlayerVolume = (next: number) => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.volume = Math.max(
      0,
      Math.min(1, next)
    );

    video.muted = next === 0;

    setVolume(video.volume);
    setMuted(video.muted);
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.muted = !video.muted;
    setMuted(video.muted);
  };

  // Fullscreen.
  const toggleFullscreen = async () => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      if (container.requestFullscreen) {
        await container.requestFullscreen();
        return;
      }
    } catch {
      // Tiếp tục thử native fullscreen.
    }

    const iosVideo =
      videoRef.current as
        | (HTMLVideoElement & {
            webkitEnterFullscreen?: () => void;
          })
        | null;

    try {
      iosVideo?.webkitEnterFullscreen?.();
    } catch {
      // Trình duyệt không hỗ trợ.
    }
  };

  // Đổi chất lượng HLS.
  const changeQuality = (choice: string) => {
    const hls = hlsRef.current;

    if (!hls) {
      return;
    }

    hls.currentLevel =
      choice === 'auto'
        ? -1
        : Number(choice);

    setQualityChoice(choice);
    setSettingsOpen(false);
  };

  // Đổi âm thanh.
  const changeAudio = (index: number) => {
    const hls = hlsRef.current;

    if (!hls) {
      return;
    }

    hls.audioTrack = index;

    setAudioChoice(index);
    setSettingsOpen(false);
  };

  // Đổi phụ đề.
  const changeSubtitle = (index: number) => {
    const video = videoRef.current;

    if (nativeSubtitleTracks && video) {
      for (
        let i = 0;
        i < video.textTracks.length;
        i++
      ) {
        video.textTracks[i].mode =
          i === index
            ? 'showing'
            : 'disabled';
      }
    } else if (hlsRef.current) {
      hlsRef.current.subtitleDisplay =
        index !== -1;

      hlsRef.current.subtitleTrack = index;
    }

    setSubtitleChoice(index);
    setSettingsOpen(false);
  };
// Tự ẩn thanh điều khiển khi đang phát.
const showControlsTemporarily = () => {
  setControlsVisible(true);

  if (controlsTimeoutRef.current != null) {
    window.clearTimeout(
      controlsTimeoutRef.current
    );
  }

  if (isPlaying && !settingsOpen) {
    controlsTimeoutRef.current =
      window.setTimeout(() => {
        setControlsVisible(false);
      }, 2500);
  }
};

useEffect(() => {
  if (controlsTimeoutRef.current != null) {
    window.clearTimeout(
      controlsTimeoutRef.current
    );
  }

  if (!isPlaying || settingsOpen) {
    setControlsVisible(true);
    return;
  }

  controlsTimeoutRef.current =
    window.setTimeout(() => {
      setControlsVisible(false);
    }, 2500);

  return () => {
    if (controlsTimeoutRef.current != null) {
      window.clearTimeout(
        controlsTimeoutRef.current
      );
    }
  };
}, [isPlaying, settingsOpen]);
  // Phím tắt trên máy tính.
  const onPlayerKeyDown = (
    event: KeyboardEvent<HTMLDivElement>
  ) => {
    if (
      event.target instanceof
        HTMLButtonElement ||
      event.target instanceof
        HTMLInputElement ||
      event.target instanceof
        HTMLSelectElement
    ) {
      return;
    }

    const key = event.key.toLowerCase();

    if (
      event.code === 'Space' ||
      key === 'k'
    ) {
      event.preventDefault();
      togglePlay();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      seek(-10);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      seek(30);
    } else if (key === 'm') {
      toggleMute();
    } else if (key === 'f') {
      void toggleFullscreen();
    } else if (event.key === 'Escape') {
      setSettingsOpen(false);
    }
  };

  // Nếu phim không có nguồn.
  if (!selectedSource) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-card bg-black p-6 text-center text-white/80">
        Phim này chưa có nguồn phát đang
        hoạt động.
      </div>
    );
  }

  const hasDuration =
    Number.isFinite(duration) &&
    duration > 0;

  const durationForSlider = hasDuration
    ? duration
    : 0;

  const sliderTime = hasDuration
    ? Math.min(
        duration,
        Math.max(0, currentTime)
      )
    : 0;

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={onPlayerKeyDown}
        onPointerMove={showControlsTemporarily}
        onPointerDown={showControlsTemporarily}
        className="relative aspect-video overflow-hidden rounded-card bg-black text-white shadow-card outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label={`Trình phát ${title}`}
      >
        {/* VIDEO */}
        <video
          ref={videoRef}
          controls={false}
          playsInline
          preload="metadata"
          title={title}
          className={`h-full w-full bg-black object-contain ${
              controlsVisible
                ? 'cursor-pointer'
                : 'cursor-none'
            }`}
          onClick={togglePlay}
          onPlay={() => {
            setIsPlaying(true);
            setIsBuffering(false);
            setPlaybackError(null);
          }}
          onPlaying={() => {
            setIsBuffering(false);
          }}
          onPause={() => {
            setIsPlaying(false);
          }}
          onWaiting={() => {
            setIsBuffering(true);
          }}
          onCanPlay={() => {
            setIsBuffering(false);
            setPlaybackError(null);
          }}
          onTimeUpdate={(event) => {
            setCurrentTime(
              event.currentTarget.currentTime
            );
          }}
          onLoadedMetadata={(event) => {
            setDuration(
              event.currentTarget.duration
            );

            event.currentTarget.playbackRate =
              speed;
          }}
          onDurationChange={(event) => {
            setDuration(
              event.currentTarget.duration
            );
          }}
          onVolumeChange={(event) => {
            setVolume(
              event.currentTarget.volume
            );

            setMuted(
              event.currentTarget.muted
            );
          }}
          onError={() => {
            setIsBuffering(false);

            setPlaybackError(
              'Video không thể phát. Hãy thử nguồn khác hoặc tải lại trang.'
            );
          }}
        >
          Trình duyệt không hỗ trợ video.
        </video>

        {/* LOADING */}
        {isBuffering && !playbackError && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <LoaderCircle
              size={34}
              className="animate-spin text-white/80"
              aria-label="Đang tải video"
            />
          </div>
        )}

        {/* ERROR */}
        {playbackError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/85 px-6 text-center text-sm text-white">
            {playbackError}
          </div>
        )}

        {/* CONTROL BAR */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/85 to-transparent px-2 pb-2 pt-8 transition-opacity duration-300 sm:px-4 sm:pb-3 sm:pt-14 ${
            controlsVisible || settingsOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }`}
        >

          {/* TIMELINE */}
          <input
            type="range"
            aria-label="Tua đến thời điểm"
            min={0}
            max={durationForSlider}
            step={0.1}
            value={sliderTime}
            disabled={!hasDuration}
            onChange={(event) => {
              seekTo(
                Number(event.target.value)
              );
            }}
            className="mb-2 h-1 w-full cursor-pointer accent-white disabled:opacity-40"
          />

          <div className="flex items-center gap-0.5 sm:gap-2">

            {/* PLAY / PAUSE */}
            <button
              type="button"
              onClick={togglePlay}
              title={
                isPlaying
                  ? 'Tạm dừng'
                  : 'Phát'
              }
              aria-label={
                isPlaying
                  ? 'Tạm dừng'
                  : 'Phát'
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
            >
              {isPlaying ? (
                <Pause
                  size={21}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={21}
                  fill="currentColor"
                />
              )}
            </button>

            {/* LÙI 10 GIÂY */}
            <button
              type="button"
              onClick={() => seek(-10)}
              title="Lùi 10 giây"
              aria-label="Lùi 10 giây"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
            >
              <RotateCcw size={23} />

              <span className="pointer-events-none absolute text-[9px] font-bold">
                10
              </span>
            </button>

            {/* TUA 30 GIÂY */}
            <button
              type="button"
              onClick={() => seek(30)}
              title="Tua 30 giây"
              aria-label="Tua 30 giây"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
            >
              <RotateCw size={23} />

              <span className="pointer-events-none absolute text-[9px] font-bold">
                30
              </span>
            </button>

            {/* MUTE */}
            <button
              type="button"
              onClick={toggleMute}
              title={
                muted
                  ? 'Bật âm'
                  : 'Tắt âm'
              }
              aria-label={
                muted
                  ? 'Bật âm'
                  : 'Tắt âm'
              }
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/15 sm:flex"
            >
              {muted || volume === 0 ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>

            {/* VOLUME SLIDER */}
            <input
              type="range"
              aria-label="Âm lượng"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => {
                setPlayerVolume(
                  Number(event.target.value)
                );
              }}
              className="hidden w-14 cursor-pointer accent-white lg:block"
            />

            {/* TIME */}
            <span className="ml-1 whitespace-nowrap text-[11px] tabular-nums sm:text-sm">
              {formatTime(currentTime)}
              {' / '}
              {formatTime(duration)}
            </span>

            <div className="min-w-0 flex-1" />

            {/* SETTINGS */}
            <button
              type="button"
              title="Chất lượng, tốc độ, âm thanh và phụ đề"
              aria-label="Cài đặt video"
              aria-expanded={settingsOpen}
              onClick={() => {
                setSettingsOpen(
                  (open) => !open
                );
              }}
              className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-full px-2 hover:bg-white/15"
            >
              <Settings size={21} />

              <span className="hidden text-xs lg:inline">
                {qualityChoice === 'auto'
                  ? currentQuality ?? 'Auto'
                  : qualityLevels
                      .find(
                        (level) =>
                          String(level.index) ===
                          qualityChoice
                      )
                      ?.label.split(' · ')[0] ??
                    'Quality'}
              </span>
            </button>

            {/* FULLSCREEN */}
            <button
              type="button"
              onClick={() => {
                void toggleFullscreen();
              }}
              title={
                isFullscreen
                  ? 'Thoát toàn màn hình'
                  : 'Toàn màn hình'
              }
              aria-label="Toàn màn hình"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
            >
              <Maximize size={21} />
            </button>
          </div>
        </div>

        {/* SETTINGS PANEL */}
        {settingsOpen && (
          <div className="absolute inset-x-2 bottom-16 top-2 z-40 overflow-y-auto rounded-lg border border-white/15 bg-neutral-900/95 p-2 text-white shadow-2xl backdrop-blur-md sm:inset-x-auto sm:bottom-16 sm:right-3 sm:top-auto sm:max-h-[min(65vh,400px)] sm:w-72">

            {/* QUALITY */}
            <div className="border-b border-white/10 pb-2">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                Chất lượng video
              </p>

              {sourceType === 'HLS' &&
              qualityLevels.length > 0 ? (
                <>
                  <MenuOption
                    label={`Tự động${
                      currentQuality
                        ? ` (${currentQuality})`
                        : ''
                    }`}
                    selected={
                      qualityChoice === 'auto'
                    }
                    onClick={() => {
                      changeQuality('auto');
                    }}
                  />

                  {qualityLevels.map(
                    (level) => (
                      <MenuOption
                        key={level.index}
                        label={level.label}
                        selected={
                          qualityChoice ===
                          String(level.index)
                        }
                        onClick={() => {
                          changeQuality(
                            String(level.index)
                          );
                        }}
                      />
                    )
                  )}
                </>
              ) : (
                <p className="px-3 py-2 text-xs text-white/60">
                  {sourceType === 'HLS'
                    ? 'Chất lượng tự động do trình duyệt quản lý hoặc nguồn chưa cung cấp các mức chất lượng.'
                    : 'Nguồn MP4/WebM có độ phân giải cố định.'}
                </p>
              )}
            </div>

            {/* PLAYBACK SPEED */}
            <div className="border-b border-white/10 py-2">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                Tốc độ phát
              </p>

              {SPEED_OPTIONS.map(
                (rate) => (
                  <MenuOption
                    key={rate}
                    label={
                      rate === 1
                        ? 'Bình thường (1x)'
                        : `${rate}x`
                    }
                    selected={
                      speed === rate
                    }
                    onClick={() => {
                      setSpeed(rate);
                      setSettingsOpen(false);
                    }}
                  />
                )
              )}
            </div>

            {/* AUDIO */}
            <div className="border-b border-white/10 py-2">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                Âm thanh / Ngôn ngữ
              </p>

              {audioTracks.length > 0 ? (
                audioTracks.map((track) => (
                  <MenuOption
                    key={track.index}
                    label={track.label}
                    selected={
                      audioChoice === track.index
                    }
                    onClick={() => {
                      changeAudio(track.index);
                    }}
                  />
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-white/60">
                  {selectedSource.language ||
                    'Bản gốc'}
                  {' — '}
                  Nguồn này chưa có track âm thanh
                  khác để chuyển ngôn ngữ.
                </p>
              )}
            </div>

            {/* SUBTITLES */}
            <div className="py-2">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                Phụ đề
              </p>

              <MenuOption
                label="Tắt phụ đề"
                selected={
                  subtitleChoice === -1
                }
                onClick={() => {
                  changeSubtitle(-1);
                }}
              />

              {subtitleTracks.map(
                (track) => (
                  <MenuOption
                    key={track.index}
                    label={track.label}
                    selected={
                      subtitleChoice ===
                      track.index
                    }
                    onClick={() => {
                      changeSubtitle(
                        track.index
                      );
                    }}
                  />
                )
              )}

              {subtitleTracks.length === 0 && (
                <p className="px-3 py-2 text-xs text-white/60">
                  Nguồn này chưa cung cấp phụ đề
                  tiếng Việt hoặc tiếng Anh.
                </p>
              )}
            </div>

            {/* SOURCE SELECTOR */}
            {activeSources.length > 1 && (
              <div className="border-t border-white/10 pt-2">
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                  Nguồn phát
                </p>

                {activeSources.map(
                  (source) => (
                    <MenuOption
                      key={source.id}
                      label={[
                        source.quality,
                        source.language,
                        source.sourceType,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                      selected={
                        selectedSource.id ===
                        source.id
                      }
                      onClick={() => {
                        setSourceId(source.id);
                        setSettingsOpen(false);
                      }}
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* COPYRIGHT / ATTRIBUTION */}
      {(
        selectedSource.providerName ||
        selectedSource.license ||
        selectedSource.attributionUrl
      ) && (
        <p className="text-xs text-text-muted">
          {selectedSource.providerName && (
            <>
              Nguồn: {selectedSource.providerName}
            </>
          )}

          {selectedSource.license && (
            <>
              {' '}
              • Giấy phép: {selectedSource.license}
            </>
          )}

          {selectedSource.attributionUrl && (
            <>
              {' '}
              •{' '}
              <a
                href={selectedSource.attributionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                Thông tin nguồn
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}