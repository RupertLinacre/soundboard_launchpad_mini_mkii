import { useSoundStore } from '../useSoundStore';
import { AudioEngine } from '../AudioEngine';

export function PadGrid() {
  const sounds = useSoundStore((state) => state.sounds);

  const handleClick = (id: string) => {
    AudioEngine.play(id);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 grid grid-cols-4 gap-4">
      {sounds.length === 0 ? (
        <p className="text-gray-400 col-span-4 text-center">No pads yet. Drop some audio files!</p>
      ) : (
        sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => handleClick(sound.id)}
            className={`bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-4 rounded-lg shadow-md transition-all duration-100 ease-in-out ${sound.isPlaying ? 'ring-4 ring-blue-500 scale-105' : ''}`}
          >
            {sound.name}
          </button>
        ))
      )}
    </div>
  );
}
