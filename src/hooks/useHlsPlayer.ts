import type Hls from 'hls.js';
import type { ErrorData } from 'hls.js';
import { useRef, useEffect, useState } from 'react';
import type { PlayerSource } from '@/types';

interface HlsConfig {
  enableWorker: boolean;
  lowLatencyMode: boolean;
  backBufferLength: number;
  maxBufferLength: number;
  maxMaxBufferLength: number;
  maxBufferSize: number;
  maxBufferHole: number;
  liveSyncDurationCount: number;
  liveDurationInfinity: boolean;
  debug: boolean;
}

const hlsConfig: HlsConfig = {
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 90,
  maxBufferLength: 30,
  maxMaxBufferLength: 600,
  maxBufferSize: 60 * 1000 * 1000,
  maxBufferHole: 0.5,
  liveSyncDurationCount: 3,
  liveDurationInfinity: false,
  debug: false,
} as const;

interface UseHlsPlayerOptions {
  type?: string;
  cdnBase?: string;
  platformVodId: string;
  playerRef: React.RefObject<HTMLVideoElement | null>;
}

export interface UseHlsPlayerReturn {
  source: PlayerSource;
  setSource: React.Dispatch<React.SetStateAction<PlayerSource>>;
  fileError: string | undefined;
}

export function useHlsPlayer({ type, cdnBase, platformVodId, playerRef }: UseHlsPlayerOptions): UseHlsPlayerReturn {
  const hlsInstance = useRef<Hls | null>(null);
  const [source, setSource] = useState<PlayerSource>(undefined);
  const [fileError, setFileError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const initHls = async () => {
      if (type === 'cdn') {
        if (!cdnBase) {
          setFileError('CDN URL not configured');
          return;
        }
        const hlsUrl = `${cdnBase}/videos/${platformVodId}/hls/${platformVodId}.m3u8`;
        setSource(hlsUrl);

        if (playerRef.current!.canPlayType('application/vnd.apple.mpegurl')) {
          playerRef.current!.src = hlsUrl;
          return;
        }

        const HlsClass = (await import('hls.js')).default;

        if (!isMounted) return;

        if (HlsClass.isSupported()) {
          hlsInstance.current = new HlsClass(hlsConfig);
          hlsInstance.current.loadSource(hlsUrl);
          hlsInstance.current.attachMedia(playerRef.current!);

          hlsInstance.current.on(HlsClass.Events.ERROR, (_event: unknown, _data: unknown) => {
            const data = _data as ErrorData;
            if (data.fatal) {
              switch (data.type) {
                case HlsClass.ErrorTypes.NETWORK_ERROR:
                case HlsClass.ErrorTypes.MEDIA_ERROR:
                  hlsInstance.current!.destroy();
                  break;
                default:
                  hlsInstance.current!.destroy();
                  setFileError('Failed to load video');
                  break;
              }
            }
          });
        }
      }
    };

    initHls();

    return () => {
      isMounted = false;
      if (hlsInstance.current) {
        hlsInstance.current.destroy();
      }
    };
  }, [type, cdnBase, platformVodId, playerRef]);

  return { source, setSource, fileError };
}
