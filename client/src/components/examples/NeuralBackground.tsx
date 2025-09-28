import NeuralBackground from '../NeuralBackground';

export default function NeuralBackgroundExample() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <NeuralBackground 
        intensity={0.8}
        particleCount={60}
        connectionDistance={180}
        pulseActive={true}
      />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-teal-300 mb-2"
              style={{ textShadow: '0 0 20px hsl(178, 100%, 33%)' }}>
            Neural Network Background
          </h1>
          <p className="text-blue-200">Pulsating neuron-inspired connections</p>
        </div>
      </div>
    </div>
  );
}