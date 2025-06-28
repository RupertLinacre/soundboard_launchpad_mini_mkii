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
            console.log('WebMidi enabled.');
            this.output = WebMidi.outputs.find(o => /Launchpad/i.test(o.name));
            if (this.output) {
                console.log(`Successfully found MIDI Output: ${this.output.name}`);
            } else {
                console.error('Could not find any Launchpad MIDI Output. Available outputs:', WebMidi.outputs.map(o => o.name));
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