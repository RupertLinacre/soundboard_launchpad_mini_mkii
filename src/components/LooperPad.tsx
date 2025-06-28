import { useDropzone } from 'react-dropzone';
import { useSoundStore } from '../useSoundStore';
import { AudioEngine } from '../AudioEngine';
import { useEffect } from 'react';

export function LooperPad() {
  const { looperSample, isLooperPlaying, looperVolume, setLooperSample, setIsLooperPlaying, setLooperVolume } = useSoundStore();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'audio/wav' || file.type === 'audio/mpeg') {
        await AudioEngine.loadLooperSample(file);
        setLooperSample(file);
        setIsLooperPlaying(false); // Reset playing state on new sample load
      } else {
        console.warn('Only audio files (WAV, MP3) are supported for the looper.');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  const handleTogglePlayback = () => {
    if (looperSample) {
      AudioEngine.toggleLooperPlayback();
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseInt(event.target.value, 10);
    console.log('Slider volume changed to:', volume);
    AudioEngine.setLooperVolume(volume);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'l') {
        handleTogglePlayback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [looperSample, isLooperPlaying]);

  return (
    <div
      className={`
        bg-gradient-to-br from-purple-600 to-indigo-800 text-white
        p-6 rounded-3xl shadow-2xl flex flex-col items-center justify-between
        transition-all duration-200 ease-in-out
        ${isDragActive ? 'ring-4 ring-purple-300' : ''}
        ${isLooperPlaying ? 'ring-4 ring-pink-400' : ''}
      `}
      style={{ minHeight: '200px' }}
    >
      <div
        {...getRootProps()}
        className={`
          w-full flex-grow flex items-center justify-center text-center
          border-4 border-dashed rounded-2xl p-4 cursor-pointer
          ${isDragActive ? 'border-purple-300' : 'border-purple-400'}
        `}
      >
        <input {...getInputProps()} />
        {!looperSample ? (
          <p className="text-xl font-semibold opacity-80">
            Drag a single audio file here to loop
          </p>
        ) : (
          <p className="text-2xl font-bold">
            {looperSample.name}
          </p>
        )}
      </div>

      {looperSample && (
        <div className="w-full mt-4 flex flex-col items-center gap-3">
          <button
            onClick={handleTogglePlayback}
            className={`
              w-full py-3 rounded-xl text-xl font-bold
              transition-colors duration-200
              ${isLooperPlaying
                ? 'bg-pink-500 hover:bg-pink-600' 
                : 'bg-green-500 hover:bg-green-600'}
            `}
          >
            {isLooperPlaying ? 'Stop Loop (L)' : 'Start Loop (L)'}
          </button>

          <div className="w-full flex items-center gap-2">
            <span className="text-lg font-semibold">Volume:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={looperVolume}
              onChange={handleVolumeChange}
              className="w-full h-3 bg-purple-400 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
