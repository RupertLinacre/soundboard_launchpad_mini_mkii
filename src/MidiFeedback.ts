import { WebMidi, Output } from 'webmidi';
import { mapIndexToNote } from './MidiMapping';

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



    setPadColour(note: number, velocity: number) {
        if (!this.output) return;
        this.output.send([0x90, note, velocity]);
    }

    // Your lightUpAllPads and clearAllPads methods can remain for testing
    // Update them to use the new constants for clarity

    lightUpAllPads(velocity: number = LED_COLORS.AMBER) {
        if (!this.output) return;
        for (let i = 0; i < 64; i++) {
            const note = mapIndexToNote(i);
            if (note !== null) this.setPadColour(note, velocity);
        }
        console.log('Sent lamp test.');
    }

    clearAllPads() {
        this.lightUpAllPads(LED_COLORS.OFF);
        console.log('Cleared all pads.');
    }
}

export const MidiFeedback = new MidiFeedbackService();