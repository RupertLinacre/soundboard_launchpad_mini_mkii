import { create } from 'zustand';
import * as Tone from 'tone';

interface Sound {
  id: string;
  name: string;
  player: Tone.Player;
  isPlaying: boolean;
}

interface SoundStore {
  sounds: Sound[];
  looperSample: { name: string; file: File } | null;
  isLooperPlaying: boolean;
  looperVolume: number;
  addSound: (sound: Sound) => void;
  setPlaying: (id: string, isPlaying: boolean) => void;
  setLooperSample: (file: File) => void;
  setIsLooperPlaying: (isPlaying: boolean) => void;
  setLooperVolume: (volume: number) => void;
}

export const useSoundStore = create<SoundStore>((set) => ({
  sounds: [],
  looperSample: null,
  isLooperPlaying: false,
  looperVolume: 75, // Default volume
  addSound: (sound) =>
    set((state) => {
      const newSounds = [...state.sounds, { ...sound, isPlaying: false }];
      console.log('Sounds in store:', newSounds);
      return { sounds: newSounds };
    }),
  setPlaying: (id, isPlaying) =>
    set((state) => ({
      sounds: state.sounds.map((sound) =>
        sound.id === id ? { ...sound, isPlaying } : sound
      ),
    })),
  setLooperSample: (file) => set({ looperSample: { name: file.name, file } }),
  setIsLooperPlaying: (isPlaying) => set({ isLooperPlaying: isPlaying }),
  setLooperVolume: (volume) => set({ looperVolume: volume }),
}));
