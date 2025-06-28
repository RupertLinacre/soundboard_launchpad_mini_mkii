import * as Tone from 'tone';
import { useSoundStore } from './useSoundStore';

export const AudioEngine = {
  players: new Map<string, Tone.Player>(),
  looperPlayer: null as Tone.Player | null,
  looperVolumeNode: new Tone.Volume(0).toDestination(), // Initialize with 0dB, connected to master output

  async decodeAudioFile(file: File): Promise<Tone.Player> {
    const url = URL.createObjectURL(file);
    const player = new Tone.Player(url).toDestination();
    await player.loaded;
    URL.revokeObjectURL(url); // Clean up the object URL
    return player;
  },

  async loadLooperSample(file: File) {
    if (this.looperPlayer) {
      this.looperPlayer.dispose(); // Dispose previous player if exists
    }
    const url = URL.createObjectURL(file);
    this.looperPlayer = new Tone.Player(url).connect(this.looperVolumeNode);
    this.looperPlayer.loop = true;
    await this.looperPlayer.loaded;
    URL.revokeObjectURL(url);
    console.log('Looper sample loaded:', file.name);
  },

  toggleLooperPlayback() {
    if (this.looperPlayer) {
      if (this.looperPlayer.state === 'started') {
        this.looperPlayer.stop();
        useSoundStore.getState().setIsLooperPlaying(false);
        console.log('Looper stopped');
      } else {
        this.looperPlayer.start();
        useSoundStore.getState().setIsLooperPlaying(true);
        console.log('Looper started');
      }
    }
  },

  setLooperVolume(volume: number) {
    // Tone.Volume expects values in dB. Convert 0-100 to a suitable dB range.
    // A common mapping is 0-100 to -60dB (silent) to 0dB (unity gain).
    // Or, for more control, 0-100 to -40dB to 0dB. Let's use -40 to 0.
    const db = Tone.Midi.mtof(volume).toFrequency(); // This is a hack, Tone.Midi.mtof converts MIDI note to frequency, which is not what we want.
    // Let's use a linear scale for now, and map it to a reasonable dB range.
    // A simple linear mapping from 0-100 to -40dB to 0dB:
    // db = (volume / 100) * 40 - 40;
    // Or, for a more logarithmic feel (closer to how human hearing perceives volume):
    // db = 20 * Math.log10(volume / 100); // This would make 0 volume -Infinity, which is fine.
    // Let's use a simpler linear mapping for now, from 0-100 to -60dB to 0dB.
    const dbVolume = volume === 0 ? -Infinity : (volume / 100) * 60 - 60;
    this.looperVolumeNode.volume.value = dbVolume;
    useSoundStore.getState().setLooperVolume(volume);
    console.log('Looper volume set to:', volume, 'dB:', dbVolume);
  },

  stopLooper() {
    if (this.looperPlayer && this.looperPlayer.state === 'started') {
      this.looperPlayer.stop();
      useSoundStore.getState().setIsLooperPlaying(false);
      console.log('Looper stopped');
    }
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