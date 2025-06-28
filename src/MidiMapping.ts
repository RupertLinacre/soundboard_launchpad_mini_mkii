// src/MidiMapping.ts

/**
 * Maps a sound's index (0-63) to the correct MIDI note for the Launchpad grid.
 * Formula derived from direct device output.
 * @param index The flat index of the sound in the array (0 to 63).
 * @returns The corresponding MIDI note number (e.g., 0 for index 0).
 */
export function mapIndexToNote(index: number): number | null {
    if (index < 0 || index > 63) {
        return null; // Out of the 8x8 grid bounds
    }
    const row = Math.floor(index / 8);
    const col = index % 8;
    return (row * 16) + col;
}

/**
 * Maps an incoming MIDI note from a pad press back to its grid index (0-63).
 * Formula derived from direct device output.
 * @param noteNumber The MIDI note number received from the device.
 * @returns The corresponding flat index (0-63) or null if it's not a grid pad.
 */
export function mapNoteToIndex(noteNumber: number): number | null {
    const col = noteNumber % 16;

    // This check is vital. It filters out the side buttons.
    // Grid pad columns are 0-7. Side button columns are 8-15.
    if (col > 7) {
        return null;
    }

    const row = Math.floor(noteNumber / 16);

    // This check filters out the top and bottom rows of round buttons.
    if (row > 7) {
        return null;
    }

    const index = (row * 8) + col;
    return index;
}
