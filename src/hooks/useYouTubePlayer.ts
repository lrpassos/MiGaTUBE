import { useState, useEffect, useRef, useCallback } from 'react';
import { Track } from '../types';
import { storage } from '../lib/storage';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function useYouTubePlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => storage.getLastPlayed());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolumeState] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mode, setMode] = useState<'vinyl' | 'video'>('vinyl');
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.body.appendChild(tag);
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

      playerRef.current = new window.YT.Player('migatube-yt-iframe', {
        height: '100%',
        width: '100%',
        videoId: currentTrack ? currentTrack.youtubeId : 'mGVGIbflG_M',
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
          fs: 1,
        },
        events: {
          onReady: () => {
            setIsPlayerReady(true);
            try {
              playerRef.current.setVolume(85);
            } catch {}
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
            if (event.data === 1) {
              setIsPlaying(true);
              const dur = playerRef.current?.getDuration?.();
              if (dur && dur > 0) setDuration(dur);
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              // Track finished
              handleTrackEnded();
            }
          },
          onError: (err: any) => {
            console.warn('YouTube Player error code:', err?.data);
          }
        },
      });
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
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time || 0);

          const totalDur = playerRef.current.getDuration?.();
          if (totalDur && totalDur > 0) {
            setDuration(totalDur);
          }
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
  const playTrack = useCallback((track: Track, newQueue?: Track[], index?: number) => {
    setCurrentTrack(track);
    storage.setLastPlayed(track);
    storage.addToHistory(track);
    updateMediaSession(track);

    // Auto set vinyl mode if it's marked as music, video mode if type === 'video'
    if (track.type === 'video') {
      setMode('video');
    } else {
      setMode('vinyl');
    }

    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(index ?? newQueue.findIndex(t => t.id === track.id || t.youtubeId === track.youtubeId));
    }

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById(track.youtubeId);
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Error loading video in YT Player', e);
      }
    }
  }, [updateMediaSession]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('togglePlay error', e);
    }
  }, [isPlaying]);

  const seekTo = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true);
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);

    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(val);
      if (val > 0 && playerRef.current.isMuted?.()) {
        playerRef.current.unMute?.();
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      playerRef.current.unMute?.();
      playerRef.current.setVolume?.(volume || 80);
    } else {
      setIsMuted(true);
      playerRef.current.mute?.();
    }
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
    // If more than 3 seconds in, restart track
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
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
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
    containerRef,
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
