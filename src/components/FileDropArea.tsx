import { useDropzone } from 'react-dropzone';
import { useSoundStore } from '../useSoundStore';
import { AudioEngine } from '../AudioEngine';

export function FileDropArea() {
  const addSound = useSoundStore((state) => state.addSound);

  const onDrop = async (acceptedFiles: File[]) => {
    console.log('Dropped files:', acceptedFiles);
    const audioFiles = acceptedFiles.filter(
      (file) => file.type === 'audio/wav' || file.type === 'audio/mpeg'
    );
    console.log('Filtered audio files:', audioFiles);

    for (const file of audioFiles) {
      try {
        const player = await AudioEngine.decodeAudioFile(file);
        const id = file.name; // Using file name as ID for simplicity
        AudioEngine.addPlayer(id, player);
        addSound({ id, name: file.name, player, isPlaying: false });
      } catch (error) {
        console.error('Error decoding audio file:', file.name, error);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`bg-yellow-300 border-4 border-dashed border-yellow-500 rounded-3xl p-16 text-center cursor-pointer transition-all duration-200 ease-in-out ${
        isDragActive ? 'border-green-500 bg-green-200 ring-4 ring-green-500' : ''
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-yellow-800 text-2xl font-bold">
        {isDragActive
          ? 'Drop your awesome sounds here!'
          : "Drag your awesome sounds here, or click to pick some!"}
      </p>
    </div>
  );
}