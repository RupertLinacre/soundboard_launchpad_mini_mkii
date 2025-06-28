
### (2) Step-by-Step Plan: Implement Active/Playing Pad LEDs

This plan will make pads with loaded sounds light up **red**, turn **green** while playing, and revert to **red** when finished.

#### Step 1: Update `MidiFeedback.ts` with Color Constants

Modify your existing `MidiFeedback.ts` to be more readable and to include a helper function that maps a sound's array index to the correct MIDI note number.

```typescript
// src/MidiFeedback.ts

import { WebMidi, Output } from 'webmidi';

// 1. Define color constants for readability
export const LED_COLORS = {
  OFF: 0x0C,
  RED: 0x0F,
  GREEN: 0x3C,
  AMBER: 0x3F, // Good for the "Light All" test button
};

class MidiFeedbackService {
    private output: Output | undefined;
    private isInitialized = false;

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        // This part is already correct in your code.
        try {
            await WebMidi.enable({ sysex: true });
            this.output = WebMidi.outputs.find(o => /Launchpad/i.test(o.name));
            if (this.output) {
                console.log(`Successfully found MIDI Output: ${this.output.name}`);
            } else {
                console.error('Could not find any Launchpad MIDI Output.');
            }
        } catch (err) {
            console.error('Failed to enable Web MIDI:', err);
        }
    }

    // 2. Add a helper to map a flat sound index (0, 1, 2...) to a grid note
    mapSoundIndexToNote(index: number): number | null {
        if (index < 0 || index > 63) return null; // Only handle the 8x8 grid
        const row = Math.floor(index / 8);
        const col = index % 8;
        // Use the Launchpad's session layout note mapping
        return (row * 10) + col + 11;
    }

    setPadColour(note: number, velocity: number) {
        if (!this.output) return;
        this.output.send([0x90, note, velocity]);
    }

    // Your lightUpAllPads and clearAllPads methods can remain for testing
    // Update them to use the new constants for clarity
    lightUpAllPads(velocity: number = LED_COLORS.AMBER) {
        if (!this.output) return;
        for (let i = 0; i < 64; i++) {
            const note = this.mapSoundIndexToNote(i);
            if (note) this.setPadColour(note, velocity);
        }
        console.log('Sent lamp test.');
    }

    clearAllPads() {
        this.lightUpAllPads(LED_COLORS.OFF);
        console.log('Cleared all pads.');
    }
}

export const MidiFeedback = new MidiFeedbackService();
```

#### Step 2: Create a `MidiFeedbackController` Component

This new, non-visual component will listen to your `Zustand` store and command the `MidiFeedback` service to update the LEDs whenever the sound state changes.

1.  Create a new file: `src/components/MidiFeedbackController.tsx`
2.  Add the following code:

```typescript
// src/components/MidiFeedbackController.tsx

import { useEffect } from 'react';
import { useSoundStore } from '../useSoundStore';
import { MidiFeedback, LED_COLORS } from '../MidiFeedback';

export function MidiFeedbackController() {
  // Subscribe to the entire sounds array.
  // The hook will re-run whenever this array changes.
  const sounds = useSoundStore((state) => state.sounds);

  useEffect(() => {
    // 1. Start with a clean slate every time the sounds array is updated.
    MidiFeedback.clearAllPads();

    // 2. Loop through the current sounds and set the LED for each one.
    sounds.forEach((sound, index) => {
      const note = MidiFeedback.mapSoundIndexToNote(index);
      if (note === null) return; // Ignore sounds beyond the 64-pad grid

      // Determine the color based on the isPlaying state
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
```

#### Step 3: Integrate the Controller into `App.tsx`

Finally, add the new `<MidiFeedbackController />` to your main app component so it's always running and listening for state changes.

1.  Open `src/App.tsx`.
2.  Import the new component and render it. You can now safely remove the test buttons if you wish.

```typescript
// src/App.tsx

import { useEffect } from 'react';
import { FileDropArea } from './components/FileDropArea';
import { PadGrid } from './components/PadGrid';
import { useSoundStore } from './useSoundStore';
import { AudioEngine } from './AudioEngine';
import { MidiHandler } from './MidiHandler';
import { MidiFeedback } from './MidiFeedback';
import { WebMidi } from 'webmidi';
// 1. Import the new controller
import { MidiFeedbackController } from './components/MidiFeedbackController';

// ... (KEY_MAP and other code remains the same)

function App() {
  // ... (all your existing useEffect hooks remain the same)

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      {/* 2. Add the controller component here. It's invisible. */}
      <MidiFeedbackController />

      <div className="w-full max-w-4xl flex flex-col gap-4">
        {/* You can optionally remove the test button block now */}
        <div className="bg-gray-800 border border-yellow-500 p-4 rounded-lg flex flex-col items-center gap-2">
          <h2 className="text-lg font-bold">MIDI Output Lamp Test</h2>
          <div className="flex gap-4">
            <button
              onClick={() => MidiFeedback.lightUpAllPads()}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded"
            >
              Light Up All Pads
            </button>
            <button
              onClick={() => MidiFeedback.clearAllPads()}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
            >
              Clear All Pads
            </button>
          </div>
        </div>

        <FileDropArea />
        <PadGrid />
      </div>
    </div>
  );
}

export default App;

```

With these changes, your application will now automatically reflect the state of your soundboard on the Launchpad's LEDs exactly as you specified.