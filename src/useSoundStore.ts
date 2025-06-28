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
  addSound: (sound: Sound) => void;
  setPlaying: (id: string, isPlaying: boolean) => void;
}

export const useSoundStore = create<SoundStore>((set) => ({
  sounds: [],
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
}));
