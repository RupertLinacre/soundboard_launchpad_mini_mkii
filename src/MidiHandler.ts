import { WebMidi } from 'webmidi';
import { useSoundStore } from './useSoundStore';
import { AudioEngine } from './AudioEngine';
import { mapNoteToIndex } from './MidiMapping';

export const MidiHandler = {
  async enableMidi() {
    try {
      await WebMidi.enable();
      console.log('Web MIDI API enabled!');

      WebMidi.inputs.forEach((input) => {
        input.removeListener('noteon'); // Prevent duplicate listeners
        input.addListener('noteon', (e) => {
          const noteNumber = e.note.number;
          const index = mapNoteToIndex(noteNumber);
          if (index !== null) {
            const sounds = useSoundStore.getState().sounds;
            if (sounds[index]) {
              AudioEngine.play(sounds[index].id);
            }
          }
        });
      });
    } catch (err) {
      console.error('Web MIDI API could not be enabled:', err);
    }
  },
};
