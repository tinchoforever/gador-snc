import FloatingPhrase from '../FloatingPhrase';
import { PhraseState } from '@shared/schema';

export default function FloatingPhraseExample() {
  const samplePhrases: PhraseState[] = [
    {
      id: 'phrase-1',
      text: '¿Y si me olvido de lo que tengo que decir?',
      layer: 'front',
      opacity: 1,
      position: { x: 100, y: 150 },
      isActive: true,
      sceneId: 1,
    },
    {
      id: 'phrase-2',
      text: '¡Lo vamos a lograr!',
      layer: 'floating',
      opacity: 0.8,
      position: { x: 300, y: 300 },
      isActive: true,
      sceneId: 3,
    },
    {
      id: 'phrase-3',
      text: '¿Cómo hago para subirlos a todos al barco de Sistema Nervioso Central?',
      layer: 'return',
      opacity: 0.65,
      position: { x: 150, y: 450 },
      isActive: true,
      sceneId: 1,
    },
  ];

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      {samplePhrases.map(phrase => (
        <FloatingPhrase key={phrase.id} phrase={phrase} />
      ))}
      
      <div className="absolute top-4 left-4 z-50">
        <div className="px-4 py-2 bg-black/50 backdrop-blur-sm border border-teal-500/30 rounded-lg">
          <p className="text-teal-300 text-sm font-medium">
            Floating Phrases Demo
          </p>
          <p className="text-blue-200 text-xs opacity-80">
            Different layers and opacity levels
          </p>
        </div>
      </div>
    </div>
  );
}