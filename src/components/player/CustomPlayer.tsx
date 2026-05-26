import { Play, Loader2 } from 'lucide-react';
import { useRef, ChangeEvent } from 'react';
import PlayerControls from './PlayerControls';
import { useCustomPlayer } from '@/hooks/useCustomPlayer';
import type { VodDetail, PlayerState, PlayerSettings } from '@/types';

export interface PlayerProps {
  setCurrentTime: (_time: number) => void;
  type?: string;
  vod: VodDetail;
  timestamp?: number;
  setDelay?: (_delay: number) => void;
  setPlayerState: (_state: PlayerState) => void;
  cdnBase?: string;
  defaultVolume: number;
  defaultMuted: boolean;
  theatreMode: boolean;
  setTheatreMode: (_v: boolean) => void;
  copyTimestamp: () => void;
  playerRef: React.RefObject<HTMLVideoElement | null>;
  onUpdateSettings?: (_settings: PlayerSettings) => void;
}

export default function Player(props: PlayerProps) {
  const {
    setCurrentTime,
    type,
    vod,
    setDelay,
    setPlayerState,
    cdnBase,
    defaultVolume,
    defaultMuted,
    theatreMode,
    setTheatreMode,
    copyTimestamp,
    playerRef,
    onUpdateSettings,
  } = props;

  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    source,
    fileError,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isFullscreen,
    playbackSpeed,
    playIconSize,
    isBuffering,
    toggleFullscreen,
    togglePlayPause,
    toggleMute,
    handleVolumeChange,
    handleSeekChange,
    handlePlaybackSpeedChange,
    handleError,
    timeUpdate,
    handlePlay,
    handlePause,
    handleEnded,
    handleWaiting,
    handlePlaying,
    handleLoadedMetadata,
    setSource,
  } = useCustomPlayer({
    type,
    vod,
    cdnBase,
    playerRef,
    setCurrentTime,
    setDelay,
    setPlayerState,
    defaultVolume,
    defaultMuted,
    onUpdateSettings,
  });

  const fileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files![0];
    if (!file || !file.type.match(/video\//)) {
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setSource(objectUrl);
  };

  const toggleTheatreMode = () => {
    setTheatreMode(!theatreMode);
  };

  return (
    <div className="h-full w-full">
      <div ref={playerContainerRef} className="relative h-full w-full overflow-hidden outline-none">
        {type === 'manual' && !source && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#16161e]">
            {fileError && (
              <div className="mb-2 rounded-lg border border-red-700 bg-red-900/50 px-4 py-2 text-sm text-red-200">
                {fileError}
              </div>
            )}
            <div className="mt-4">
              <label className="inline-block cursor-pointer rounded-lg bg-[#6366f1] px-4 py-2 text-white transition-colors hover:bg-[#818cf8]">
                Select Video
                <input type="file" hidden onChange={fileChange} accept="video/*,.mkv" />
              </label>
            </div>
          </div>
        )}

        <video
          ref={playerRef}
          playsInline
          autoPlay
          tabIndex={-1}
          poster={vod.vod_uploads[0]?.thumbnail_url || undefined}
          preload="auto"
          onTimeUpdate={timeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onError={handleError}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlayPause}
          onDoubleClick={toggleFullscreen}
          className="h-full w-full cursor-pointer"
          style={{ visibility: !source ? ('hidden' as const) : 'visible' }}
        />

        {source && (
          <>
            <div
              onClick={togglePlayPause}
              onDoubleClick={toggleFullscreen}
              className={`absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 transition-opacity duration-200 ${
                isPlaying ? 'pointer-events-none opacity-0 delay-75' : 'opacity-100 delay-75'
              }`}
            >
              <Play className="text-white drop-shadow-2xl" size={playIconSize} />
            </div>

            {isBuffering && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-white/80" />
              </div>
            )}

            <PlayerControls
              isPlaying={isPlaying}
              volume={volume}
              isMuted={isMuted}
              currentTime={currentTime}
              duration={duration}
              theatreMode={theatreMode}
              isFullscreen={isFullscreen}
              playbackSpeed={playbackSpeed}
              onTogglePlayPause={togglePlayPause}
              onVolumeChange={handleVolumeChange}
              onSeekChange={handleSeekChange}
              onToggleMute={toggleMute}
              onToggleTheatreMode={toggleTheatreMode}
              onToggleFullscreen={toggleFullscreen}
              playerContainerRef={playerContainerRef}
              onPlaybackSpeedChange={handlePlaybackSpeedChange}
              onCopyTimestamp={copyTimestamp}
            />
          </>
        )}
      </div>
    </div>
  );
}
