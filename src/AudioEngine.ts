import * as Tone from 'tone';

export const AudioEngine = {
  players: new Map<string, Tone.Player>(),

  async decodeAudioFile(file: File): Promise<Tone.Player> {
    const url = URL.createObjectURL(file);
    const player = new Tone.Player(url).toDestination();
    await player.loaded;
    URL.revokeObjectURL(url); // Clean up the object URL
    return player;
  },

  play(id: string) {
    const player = this.players.get(id);
    if (player) {
      player.start();
    }
  },

  addPlayer(id: string, player: Tone.Player) {
    this.players.set(id, player);
  },
};
