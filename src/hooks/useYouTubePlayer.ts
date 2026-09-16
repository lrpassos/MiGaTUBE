import { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from '../types';
import { storage } from '../lib/storage';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const DEFAULT_STARTER_TRACK: Track = {
  id: 'yt-69RdQFDuYPI',
  youtubeId: '69RdQFDuYPI',
  title: 'Is This Love (Official Music Video)',
  artist: 'Bob Marley & The Wailers',
  thumbnail: 'https://i.ytimg.com/vi/69RdQFDuYPI/hq720.jpg',
  duration: '3:54',
  durationSec: 234,
  type: 'music',
  album: 'Kaya (1978)',
  genre: 'Reggae',
  viewCount: '245M visualizações',
};

export function useYouTubePlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track>(() => {
    return storage.getLastPlayed() || DEFAULT_STARTER_TRACK;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(234);
  const [volume, setVolumeState] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mode, setMode] = useState<'vinyl' | 'video'>('vinyl');
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const playerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);
  const pendingTrackRef = useRef<Track | null>(null);
  const shouldPlayImmediatelyRef = useRef<boolean>(false);

  // Initialize Media Session API
  const updateMediaSession = useCallback((track: Track) => {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || 'MiGaTUBE Digital Music',
          artwork: [
            { src: track.thumbnail, sizes: '512x512', type: 'image/jpeg' },
            { src: track.thumbnail, sizes: '192x192', type: 'image/jpeg' },
          ],
        });
      } catch (err) {
        console.warn('MediaSession metadata error', err);
      }
    }
  }, []);

  // Sync YouTube API script
  useEffect(() => {
    if (!window.YT) {
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.body.appendChild(tag);
      }
    }

    const checkReady = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        setTimeout(checkReady, 100);
      }
    };

    const initPlayer = () => {
      const targetEl = document.getElementById('migatube-yt-iframe');
      if (!targetEl || playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player('migatube-yt-iframe', {
          height: '100%',
          width: '100%',
          videoId: currentTrack ? currentTrack.youtubeId : DEFAULT_STARTER_TRACK.youtubeId,
          playerVars: {
            enablejsapi: 1,
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            fs: 1,
            iv_load_policy: 3,
          },
          events: {
            onReady: (e: any) => {
              setIsPlayerReady(true);
              try {
                e.target.unMute();
                e.target.setVolume(85);
              } catch {}

              if (shouldPlayImmediatelyRef.current && pendingTrackRef.current) {
                const trk = pendingTrackRef.current;
                pendingTrackRef.current = null;
                shouldPlayImmediatelyRef.current = false;
                try {
                  e.target.loadVideoById(trk.youtubeId);
                  e.target.playVideo();
                  setIsPlaying(true);
                } catch (playErr) {
                  console.warn('Playback error on initial ready', playErr);
                }
              }
            },
            onStateChange: (event: any) => {
              // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
              if (event.data === 1) {
                setIsPlaying(true);
                setPlaybackError(null);
                const dur = playerRef.current?.getDuration?.();
                if (dur && dur > 0) setDuration(dur);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                handleTrackEnded();
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Player error code:', err?.data);
              const code = err?.data;
              if (code === 101 || code === 150) {
                setPlaybackError(
                  'Este vídeo possui restrições do YouTube para reprodução externa. Pule para a próxima faixa ou tente a versão de áudio/lyric.'
                );
              } else if (code === 100) {
                setPlaybackError('Vídeo não encontrado ou removido do YouTube.');
              }
            },
          },
        });
      } catch (err) {
        console.warn('Error creating YT.Player:', err);
      }
    };

    checkReady();

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  // Update progress timer
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const time = playerRef.current.getCurrentTime();
            if (typeof time === 'number') {
              setCurrentTime(time);
            }
            const totalDur = playerRef.current.getDuration?.();
            if (totalDur && totalDur > 0) {
              setDuration(totalDur);
            }
          } catch {}
        }
      }, 500);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying]);

  // Handle track ended based on repeat mode & queue
  const handleTrackEnded = () => {
    if (repeatMode === 'one') {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
      return;
    }

    if (queue.length > 0 && queueIndex >= 0) {
      if (queueIndex < queue.length - 1) {
        playTrack(queue[queueIndex + 1], queue, queueIndex + 1);
      } else if (repeatMode === 'all') {
        playTrack(queue[0], queue, 0);
      } else {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Play a specific track
  const playTrack = useCallback(
    (track: Track, newQueue?: Track[], index?: number) => {
      setCurrentTrack(track);
      setPlaybackError(null);
      storage.setLastPlayed(track);
      storage.addToHistory(track);
      updateMediaSession(track);

      if (track.type === 'video') {
        setMode('video');
      }

      if (newQueue) {
        setQueue(newQueue);
        const calculatedIndex =
          index ??
          newQueue.findIndex((t) => t.id === track.id || t.youtubeId === track.youtubeId);
        setQueueIndex(calculatedIndex);
      }

      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume || 85);
          playerRef.current.loadVideoById(track.youtubeId);
          playerRef.current.playVideo();
          setIsPlaying(true);
        } catch (e) {
          console.warn('Error loading video in YT Player', e);
        }
      } else {
        // Queue until onReady fires
        pendingTrackRef.current = track;
        shouldPlayImmediatelyRef.current = true;
        setIsPlaying(true);
      }
    },
    [updateMediaSession, volume]
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    setPlaybackError(null);

    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') {
      pendingTrackRef.current = currentTrack;
      shouldPlayImmediatelyRef.current = true;
      setIsPlaying(true);
      return;
    }

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume || 85);
        } catch {}

        // Check if video is loaded
        const currentUrl = playerRef.current.getVideoUrl?.() || '';
        if (!currentUrl.includes(currentTrack.youtubeId)) {
          playerRef.current.loadVideoById(currentTrack.youtubeId);
        }
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('togglePlay error', e);
    }
  }, [currentTrack, isPlaying, volume]);

  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seconds, true);
      } catch {}
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);

    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(val);
        if (val > 0 && playerRef.current.isMuted?.()) {
          playerRef.current.unMute?.();
        }
      } catch {}
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        setIsMuted(false);
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume || 80);
      } else {
        setIsMuted(true);
        playerRef.current.mute?.();
      }
    } catch {}
  }, [isMuted, volume]);

  const nextTrack = useCallback(() => {
    if (queue.length > 0 && queueIndex >= 0) {
      if (queueIndex < queue.length - 1) {
        playTrack(queue[queueIndex + 1], queue, queueIndex + 1);
      } else if (repeatMode === 'all') {
        playTrack(queue[0], queue, 0);
      }
    }
  }, [queue, queueIndex, repeatMode, playTrack]);

  const prevTrack = useCallback(() => {
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    if (queue.length > 0 && queueIndex > 0) {
      playTrack(queue[queueIndex - 1], queue, queueIndex - 1);
    } else {
      seekTo(0);
    }
  }, [currentTime, queue, queueIndex, playTrack, seekTo]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  // Setup MediaSession handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => togglePlay());
        navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            seekTo(details.seekTime);
          }
        });
      } catch (err) {
        console.warn('MediaSession setActionHandler error', err);
      }
    }
  }, [togglePlay, prevTrack, nextTrack, seekTo]);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    mode,
    queue,
    queueIndex,
    repeatMode,
    shuffle,
    isPlayerReady,
    playbackError,
    setPlaybackError,
    setMode,
    playTrack,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleRepeat,
    toggleShuffle,
  };
}
