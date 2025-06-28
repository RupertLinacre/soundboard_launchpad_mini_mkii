import { useEffect } from 'react';
import { FileDropArea } from './components/FileDropArea';
import { PadGrid } from './components/PadGrid';
import { useSoundStore } from './useSoundStore';
import { AudioEngine } from './AudioEngine';
import { MidiHandler } from './MidiHandler';

const KEY_MAP: { [key: string]: number } = {
  '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '0': 9,
  'q': 10, 'w': 11, 'e': 12, 'r': 13, 't': 14, 'y': 15, 'u': 16, 'i': 17, 'o': 18, 'p': 19,
  'a': 20, 's': 21, 'd': 22, 'f': 23, 'g': 24, 'h': 25, 'j': 26, 'k': 27, 'l': 28,
  'z': 29, 'x': 30, 'c': 31, 'v': 32, 'b': 33, 'n': 34, 'm': 35,
};

function App() {
  const sounds = useSoundStore((state) => state.sounds);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyIndex = KEY_MAP[event.key.toLowerCase()];
      if (keyIndex !== undefined && sounds[keyIndex]) {
        AudioEngine.play(sounds[keyIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sounds]);

  useEffect(() => {
    MidiHandler.enableMidi();
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col gap-4">
        <FileDropArea />
        <PadGrid />
      </div>
    </div>
  );
}

export default App;
