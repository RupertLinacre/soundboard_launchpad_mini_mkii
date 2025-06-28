import { useSoundStore } from '../useSoundStore';
import { AudioEngine } from '../AudioEngine';
import { useEffect } from 'react';

const keyboardMap = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';',
  'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/',
];

const padColors = [
  'bg-gradient-to-br from-red-400 to-red-600', // Red
  'bg-gradient-to-br from-blue-400 to-blue-600', // Blue
  'bg-gradient-to-br from-green-400 to-green-600', // Green
  'bg-gradient-to-br from-yellow-400 to-yellow-600', // Yellow
  'bg-gradient-to-br from-purple-400 to-purple-600', // Purple
  'bg-gradient-to-br from-pink-400 to-pink-600', // Pink
  'bg-gradient-to-br from-indigo-400 to-indigo-600', // Indigo
  'bg-gradient-to-br from-teal-400 to-teal-600', // Teal
  'bg-gradient-to-br from-orange-400 to-orange-600', // Orange
  'bg-gradient-to-br from-cyan-400 to-cyan-600', // Cyan
  'bg-gradient-to-br from-lime-400 to-lime-600', // Lime
  'bg-gradient-to-br from-fuchsia-400 to-fuchsia-600', // Fuchsia
  'bg-gradient-to-br from-emerald-400 to-emerald-600', // Emerald
  'bg-gradient-to-br from-rose-400 to-rose-600', // Rose
];

export function PadGrid() {
  const sounds = useSoundStore((state) => state.sounds);
  const playSound = (id: string) => AudioEngine.play(id);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const index = keyboardMap.indexOf(event.key.toLowerCase());
      if (index !== -1 && sounds[index]) {
        playSound(sounds[index].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sounds]);

  return (
    <div className="bg-gradient-to-br from-blue-200 to-purple-300 p-8 rounded-3xl shadow-2xl">
      {sounds.length === 0 ? (
        <p className="text-gray-700 text-center text-2xl font-semibold">
          No pads yet! Drag and drop some fun sounds here!
        </p>
      ) : (
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          {sounds.map((sound, index) => (
            <button
              key={sound.id}
              onClick={() => playSound(sound.id)}
              className={`
                ${padColors[index % padColors.length]}
                text-white font-extrabold
                py-10 px-4 rounded-2xl shadow-xl
                transform transition-all duration-150 ease-in-out
                hover:scale-105 hover:shadow-2xl
                focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-75
                ${sound.isPlaying ? 'ring-4 ring-white scale-105' : ''}
                flex flex-col items-center justify-center
                relative overflow-hidden
              `}
              style={{ minWidth: '130px', minHeight: '130px' }}
            >
              <span className="text-6xl mb-2 opacity-90 drop-shadow-md">{keyboardMap[index]?.toUpperCase() || ''}</span>
              <span className="text-xl text-center leading-tight font-bold drop-shadow-sm">{sound.name}</span>
              <div className="absolute inset-0 bg-black opacity-10 mix-blend-overlay"></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
