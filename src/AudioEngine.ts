import * as Tone from 'tone';
import { useSoundStore } from './useSoundStore';

export const AudioEngine = {
  players: new Map<string, Tone.Player>(),

  async decodeAudioFile(file: File): Promise<Tone.Player> {
    const url = URL.createObjectURL(file);
    const player = new Tone.Player(url).toDestination();
    await player.loaded;
    URL.revokeObjectURL(url); // Clean up the object URL
    return player;
  },

  async play(id: string) {
    const player = this.players.get(id);
    if (player) {
      // Set the UI state to "playing"
      useSoundStore.getState().setPlaying(id, true);

      // If the sound is already playing, stop it first for a clean re-trigger.
      if (player.state === 'started') {
        player.stop();
      }

      // **Crucially, assign the onended callback BEFORE starting.**
      // This will be called only when the sound finishes playing naturally.
      player.onstop = () => {
        useSoundStore.getState().setPlaying(id, false);
      };

      // Start playback.
      player.start();
    }
  },

  addPlayer(id: string, player: Tone.Player) {
    this.players.set(id, player);
  },
};