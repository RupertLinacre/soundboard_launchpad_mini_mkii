import { WebMidi } from 'webmidi';
import { useSoundStore } from './useSoundStore';
import { AudioEngine } from './AudioEngine';

export const MidiHandler = {
  async enableMidi() {
    try {
      await WebMidi.enable();
      console.log('Web MIDI API enabled!');

      WebMidi.inputs.forEach((input) => {
        console.log(`Input: ${input.name}`);
        input.addListener('noteon', (e) => {
          const noteNumber = e.note.number;
          console.log(`Received noteon: ${noteNumber}`);
          const sounds = useSoundStore.getState().sounds;
          if (sounds[noteNumber]) {
            AudioEngine.play(sounds[noteNumber].id);
          }
        });
      });
    } catch (err) {
      console.error('Web MIDI API could not be enabled:', err);
    }
  },
};
