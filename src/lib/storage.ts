import { Track, Playlist, AppSettings } from '../types';
import { INITIAL_PLAYLISTS } from './curatedData';

const STORAGE_KEYS = {
  FAVORITES: 'migatube_favorites_v1',
  HISTORY: 'migatube_history_v1',
  PLAYLISTS: 'migatube_playlists_v1',
  SETTINGS: 'migatube_settings_v1',
  LAST_PLAYED: 'migatube_last_played_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  vinylAnimation: true,
  vuMeterEnabled: true,
  autoplay: true,
  quality: 'auto',
  hifiAudioBoost: true,
};

export const storage = {
  getFavorites(): Track[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isFavorite(trackId: string): boolean {
    const favs = storage.getFavorites();
    return favs.some((t) => t.id === trackId || t.youtubeId === trackId);
  },

  toggleFavorite(track: Track): boolean {
    try {
      const favs = storage.getFavorites();
      const existsIndex = favs.findIndex((t) => t.id === track.id || t.youtubeId === track.youtubeId);
      let updated: Track[];
      let isFav = false;
      if (existsIndex >= 0) {
        updated = favs.filter((_, idx) => idx !== existsIndex);
        isFav = false;
      } else {
        updated = [track, ...favs];
        isFav = true;
      }
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      window.dispatchEvent(new Event('migatube_favorites_updated'));
      return isFav;
    } catch {
      return false;
    }
  },

  getHistory(): Track[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToHistory(track: Track): void {
    try {
      const hist = storage.getHistory();
      // Remove any existing duplicate and put at the front
      const filtered = hist.filter((t) => t.id !== track.id && t.youtubeId !== track.youtubeId);
      const updated = [track, ...filtered].slice(0, 50); // Keep last 50
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      window.dispatchEvent(new Event('migatube_history_updated'));
    } catch (e) {
      console.error('Error saving to history', e);
    }
  },

  removeFromHistory(trackId: string): void {
    try {
      const hist = storage.getHistory();
      const updated = hist.filter((t) => t.id !== trackId && t.youtubeId !== trackId);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      window.dispatchEvent(new Event('migatube_history_updated'));
    } catch {}
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      window.dispatchEvent(new Event('migatube_history_updated'));
    } catch {}
  },

  getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(INITIAL_PLAYLISTS));
        return INITIAL_PLAYLISTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PLAYLISTS;
    }
  },

  createPlaylist(name: string, description = ''): Playlist {
    const playlists = storage.getPlaylists();
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name: name.trim() || 'Nova Playlist',
      description: description.trim(),
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSystem: false,
    };
    const updated = [newPlaylist, ...playlists];
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updated));
    window.dispatchEvent(new Event('migatube_playlists_updated'));
    return newPlaylist;
  },

  updatePlaylist(playlistId: string, updates: Partial<Playlist>): void {
    try {
      const playlists = storage.getPlaylists();
      const updated = playlists.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, ...updates, updatedAt: new Date().toISOString() };
        }
        return pl;
      });
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updated));
      window.dispatchEvent(new Event('migatube_playlists_updated'));
    } catch {}
  },

  deletePlaylist(playlistId: string): void {
    try {
      const playlists = storage.getPlaylists();
      const updated = playlists.filter((pl) => pl.id !== playlistId);
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updated));
      window.dispatchEvent(new Event('migatube_playlists_updated'));
    } catch {}
  },

  addTrackToPlaylist(playlistId: string, track: Track): boolean {
    try {
      const playlists = storage.getPlaylists();
      const target = playlists.find((pl) => pl.id === playlistId);
      if (!target) return false;

      // Check if already in playlist
      if (target.tracks.some((t) => t.id === track.id || t.youtubeId === track.youtubeId)) {
        return false;
      }

      target.tracks.push(track);
      target.updatedAt = new Date().toISOString();
      if (!target.coverUrl) {
        target.coverUrl = track.thumbnail;
      }

      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
      window.dispatchEvent(new Event('migatube_playlists_updated'));
      return true;
    } catch {
      return false;
    }
  },

  removeTrackFromPlaylist(playlistId: string, trackId: string): void {
    try {
      const playlists = storage.getPlaylists();
      const target = playlists.find((pl) => pl.id === playlistId);
      if (!target) return;
      target.tracks = target.tracks.filter((t) => t.id !== trackId && t.youtubeId !== trackId);
      target.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
      window.dispatchEvent(new Event('migatube_playlists_updated'));
    } catch {}
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(newSettings: Partial<AppSettings>): AppSettings {
    try {
      const current = storage.getSettings();
      const updated = { ...current, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      window.dispatchEvent(new Event('migatube_settings_updated'));
      return updated;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  getLastPlayed(): Track | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setLastPlayed(track: Track): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, JSON.stringify(track));
    } catch {}
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.PLAYLISTS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.LAST_PLAYED);
      window.dispatchEvent(new Event('migatube_all_cleared'));
    } catch {}
  }
};
