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
