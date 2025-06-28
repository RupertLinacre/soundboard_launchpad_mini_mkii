Soundboard Web App – Project Context (gemini.md)

Purpose

Create a zero-BS web soundboard: users drag WAV/MP3 files into the page, a grid of pads appears (one per file), each pad plays its sound on click or when the matching pad on a connected MIDI controller (e.g., Ableton Push/Launchpad) is pressed.  Pads are numbered (and then lettered qwertyuiop) and pressing the corresponding number or letter triggers the pad.

Core Requirements
	•	Drag-and-drop import of local audio files (WAV, MP3).
	•	Instant pad grid auto-sized to the number of samples.
	•	Low-latency playback (no audible glitch on first hit).
	•	Automatic MIDI mapping: first 128 pads map to MIDI notes 0-127; respond to noteon events.
	•	No back-end; everything runs client-side; optional PWA caching.

Target Architecture

Layer	Technology	Responsibility
UI / View	React 18 + Tailwind	Render grid, file drop zone, basic controls
State	Zustand	Hold array of sounds {id, name, buffer} and expose play(idx)
Audio	Tone.js on top of Web Audio API	Decode, cache and trigger AudioBuffers; master limiter
MIDI	Web MIDI API via webmidi.js	Enumerate devices, listen to noteon, call play(idx)
Dev / Build	Vite (React TS template)	Fast HMR, zero config
Optional	Workbox	Cache decoded buffers for offline use (PWA)

Component Diagram

+----------------+       drag files        +---------------------+
| FileDropArea   | ----------------------> | AudioEngine (Tone)  |
| (react-dropzone)|                        |  decode & cache     |
+----------------+                         +----------+----------+
        |                                           |
        | addSounds([])                             | play(idx)
        v                                           |
  +--------------+      Zustand store      +--------v--------+
  | PadGrid      | <---------------------- | MidiHandler     |
  | (React grid) |                         | (webmidi.js)    |
  +--------------+                         +-----------------+

Data Flow
	1.	User drops n files → FileDropArea validates & passes File[].
	2.	AudioEngine decodes each file to an AudioBuffer, returns metadata.
	3.	Store pushes {id, name, buffer}; UI re-renders n pads.
	4.	User interaction
	•	Click pad → play(idx)
	•	MIDI noteon → play(idx) (note number = idx)
	5.	AudioEngine starts the corresponding AudioBuffer through a limiter to speakers.

Constraints & Assumptions
	•	Browser must support Web Audio (all evergreen) and Web MIDI (Chrome/Edge; Safari behind flag).
	•	Memory cap: soft-limit total sample size to ~30 MB.
	•	First version hard-wires pad size grid (4×4/8×8); later dynamic CSS grid.

Stretch Goals (not in v1 scope)
	•	Pad colour assignment and MIDI LED feedback (RGB Sysex).
	•	Preset save/load (JSON + IndexedDB for blobs).
	•	Waveform thumbnail and progress ring on pad.

⸻



***

### LLM Context: Interacting with the Novation Launchpad Mini MK2

This document outlines the precise, validated methods for controlling a Novation Launchpad Mini MK2 within a web application, based on the final working code. The key discovery is that this device **does not use SysEx for basic LED control** but instead relies on standard **MIDI Note On messages** where the velocity byte determines the color.

#### 1. Device Connection & Identification

To establish a connection, the application must find the correct MIDI output port. A robust method is to search for a device whose name includes "Launchpad", as implemented in `MidiFeedback.ts`.

*   **Method:** Use `WebMidi.js` to enable MIDI access.
*   **Code:** `this.output = WebMidi.outputs.find(o => /Launchpad/i.test(o.name));`

This approach is flexible and accommodates minor variations in the device's reported name (e.g., "Launchpad Mini").

#### 2. LED Control Protocol

The core of LED control is sending a standard 3-byte **Note On** message on MIDI channel 1.

*   **Format:** `[Status, Note Number, Velocity]`
*   **Example Message:** `[0x90, 0, 15]`
    *   **Status (`0x90`):** This byte represents a "Note On" event on MIDI channel 1. It is a fixed value for this purpose.
    *   **Note Number (`0`):** This byte identifies the target pad on the device. The correct note number must be derived from the mapping logic (see Section 4).
    *   **Velocity (`15`):** This byte determines the pad's color and brightness. It does **not** represent the velocity of a key press in this context.

#### 3. Color System (Velocity-Based)

The Launchpad Mini MK2 has a limited, non-RGB color palette. Colors are selected by providing a specific velocity value. The working implementation (`MidiFeedback.ts`) defines these as constants for clarity:

| Constant        | Color   | Velocity (Hex) | Velocity (Decimal) |
| :-------------- | :------ | :------------- | :----------------- |
| `LED_COLORS.OFF`  | Off     | `0x0C`         | 12                 |
| `LED_COLORS.RED`  | Red     | `0x0F`         | 15                 |
| `LED_COLORS.GREEN`| Green   | `0x3C`         | 60                 |
| `LED_COLORS.AMBER`| Amber   | `0x3F`         | 63                 |

#### 4. MIDI Note Mapping (The Ground Truth)

The most critical part of the implementation is the bidirectional mapping between the application's internal state (a flat array `index` from 0-63) and the device's physical note layout. This logic is correctly isolated in the `src/MidiMapping.ts` module.

**A. Output: From App Index to Pad Note (`mapIndexToNote`)**

To light up a pad corresponding to a sound at a given `index`, the application must calculate the correct `noteNumber` to send.

*   **Formula:** `noteNumber = (Math.floor(index / 8) * 16) + (index % 8)`
*   **Example:**
    *   Sound at `index 0` (top-left) maps to `note 0`.
    *   Sound at `index 8` (second row, first pad) maps to `note 16`.

**B. Input: From Pad Note to App Index (`mapNoteToIndex`)**

When a user presses a pad, the device sends a `Note On` message. The application must convert the `noteNumber` back to the corresponding sound `index`.

*   **Formula:** `index = (Math.floor(noteNumber / 16) * 8) + (noteNumber % 16)`
*   **Validation is Essential:** This function must filter out notes from the round control buttons on the sides, top, and bottom. The validation logic in `mapNoteToIndex` correctly achieves this by checking if the calculated column (`noteNumber % 16`) is greater than 7 or if the row is outside the 0-7 range. This ensures only presses on the 8x8 grid are processed.

#### 5. Recommended Implementation Architecture

The working code uses a clean, decoupled architecture that should be maintained:

1.  **`MidiMapping.ts`:** A dedicated, stateless module containing the pure `mapIndexToNote` and `mapNoteToIndex` functions. This is the central "translator".
2.  **`MidiHandler.ts`:** The input service. It listens for `noteon` events from the device, uses `mapNoteToIndex` to find the correct sound index, and triggers the `AudioEngine`.
3.  **`MidiFeedback.ts`:** The output service. It provides methods like `setPadColour` to send lighting commands to the device.
4.  **`MidiFeedbackController.tsx`:** A non-visual React component that acts as the reactive bridge. It subscribes to the `useSoundStore` and, whenever the state of sounds (e.g., `isPlaying`) changes, it uses `MidiFeedback.ts` and `mapIndexToNote` to update the device's LEDs accordingly. This effectively synchronizes the hardware with the application state.