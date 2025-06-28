# Soundboard App Implementation Plan

This plan breaks down the development of the soundboard web app into small, verifiable steps. After each step, the application should be runnable in a browser to confirm the functionality has been correctly implemented.

## Step 1: Project Setup & Basic Layout

*   **Goal:** Initialize the project with Vite, add Tailwind CSS, and create a basic placeholder layout.
*   **Actions:**
    1.  Use Vite to scaffold a new React + TypeScript project.
    2.  Install and configure Tailwind CSS for styling.
    3.  In `App.tsx`, create two main sections: one for the file drop zone and one for the sound pad grid. Use simple `div`s with borders and labels for now.
*   **Verification:**
    *   Run `npm run dev`.
    *   Open the browser to the provided localhost URL.
    *   The page should display two distinct placeholder boxes for the "Drop Zone" and "Pad Grid", with basic Tailwind styles applied.

## Step 2: File Drop & State Mgt Setup

*   **Goal:** Implement the file drop functionality and set up a state management store to hold the dropped files.
*   **Actions:**
    1.  Install `zustand` and `react-dropzone`.
    2.  Create a Zustand store (`useSoundStore.ts`) that holds an array of `File` objects.
    3.  Implement the `FileDropArea` component using `react-dropzone`.
    4.  On dropping files, validate they are `audio/wav` or `audio/mpeg`, and then add the valid files to the Zustand store.
*   **Verification:**
    *   Open the app in the browser.
    *   Use React DevTools to inspect the Zustand store's state.
    *   Drag and drop a few MP3 or WAV files onto the drop zone.
    *   Confirm that the store's state updates to show an array of the `File` objects you dropped.

## Step 3: Displaying the Sound Pads

*   **Goal:** Render a grid of pads based on the files in the store.
*   **Actions:**
    1.  Create a `PadGrid` component.
    2.  This component will read the array of sounds from the Zustand store.
    3.  It will map over the array and render a simple `<button>` for each file, displaying the file's name as the button text.
    4.  Use CSS Grid with Tailwind to arrange the buttons in a responsive grid.
*   **Verification:**
    *   Open the app.
    *   Drop several audio files onto the drop zone.
    *   The "Pad Grid" area should now display one button for each file, with the correct file name, arranged in a grid.

## Step 4: Audio Playback on Click

*   **Goal:** Decode dropped audio files and play them when a pad is clicked.
*   **Actions:**
    1.  Install `tone`.
    2.  Create an `AudioEngine.ts` service that uses `Tone.js`.
    3.  Modify the Zustand store. Instead of just `File`, it should store an object like `{ id, name, player: Tone.Player }`.
    4.  When files are dropped, use the `AudioEngine` to decode each file into a `Tone.Player` instance and add the resulting objects to the store.
    5.  In the `PadGrid` component, add an `onClick` handler to each button that calls the `start()` method of its corresponding `Tone.Player`.
*   **Verification:**
    *   Open the app and drop a WAV or MP3 file.
    *   A pad appears in the grid.
    *   Clicking the pad should immediately play the audio file.

## Step 5: Keyboard Controls

*   **Goal:** Trigger sound pads using keyboard keys.
*   **Actions:**
    1.  Define a mapping of keyboard keys to pad indices (e.g., `1` -> 0, `2` -> 1, ..., `q` -> 9, `w` -> 10).
    2.  Add a global `keydown` event listener in the main `App.tsx` component.
    3.  When a mapped key is pressed, find the corresponding sound in the Zustand store by its index and trigger its `Tone.Player` to play.
*   **Verification:**
    *   Open the app and drop at least two audio files.
    *   Pressing the '1' key should play the first sound.
    *   Pressing the '2' key should play the second sound.

## Step 6: MIDI Input & Playback

*   **Goal:** Connect a MIDI controller to trigger the sound pads.
*   **Actions:**
    1.  Install `webmidi`.
    2.  Create a `MidiHandler.ts` service.
    3.  On app load, the `MidiHandler` should request MIDI access and listen for `noteon` events on all available inputs.
    4.  When a `noteon` event is received, map the MIDI note number to a pad index (e.g., MIDI note 36 -> pad 0, 37 -> pad 1).
    5.  Trigger the corresponding `Tone.Player` from the Zustand store.
*   **Verification:**
    *   Connect a MIDI controller to your computer.
    *   Open the app. The browser should prompt for MIDI access. Grant it.
    *   Drop a few audio files.
    *   Pressing pads on your MIDI controller should trigger the corresponding sounds in the web app.

## Step 7: Final Polish & Styling

*   **Goal:** Improve the visual design and user feedback.
*   **Actions:**
    1.  Use Tailwind CSS to create a clean, modern design for the pads, the drop zone, and the overall layout.
    2.  Add visual feedback for interactions:
        *   Highlight the drop zone when a file is being dragged over it.
        *   Make pads light up or change appearance when they are triggered by click, keyboard, or MIDI.
*   **Verification:**
    *   The app should be visually appealing and feel responsive. Interactions should provide clear feedback to the user.
