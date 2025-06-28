import { useEffect } from 'react';
import { useSoundStore } from '../useSoundStore';
import { MidiFeedback, LED_COLORS } from '../MidiFeedback';
import { mapIndexToNote } from '../MidiMapping';

export function MidiFeedbackController() {
  // Subscribe to the entire sounds array.
  // The hook will re-run whenever this array changes.
  const sounds = useSoundStore((state) => state.sounds);

  useEffect(() => {
    // 1. Start with a clean slate every time the sounds array is updated.
    MidiFeedback.clearAllPads();

    // 2. Loop through the current sounds and set the LED for each one.
    sounds.forEach((sound, index) => {
      const note = mapIndexToNote(index);
      if (note === null) return;
      const color = sound.isPlaying ? LED_COLORS.GREEN : LED_COLORS.RED;
      MidiFeedback.setPadColour(note, color);
    });

    // 3. Return a cleanup function to turn off all LEDs when the app closes.
    return () => {
      MidiFeedback.clearAllPads();
    };
  }, [sounds]); // Dependency array: this effect runs when `sounds` changes.

  return null; // This component renders no visible UI.
}