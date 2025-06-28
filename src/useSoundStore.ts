import { create } from 'zustand';
import * as Tone from 'tone';

interface Sound {
  id: string;
  name: string;
  player: Tone.Player;
}

interface SoundStore {
  sounds: Sound[];
  addSound: (sound: Sound) => void;
}

export const useSoundStore = create<SoundStore>((set) => ({
  sounds: [],
  addSound: (sound) =>
    set((state) => {
      const newSounds = [...state.sounds, sound];
      console.log('Sounds in store:', newSounds);
      return { sounds: newSounds };
    }),
}));