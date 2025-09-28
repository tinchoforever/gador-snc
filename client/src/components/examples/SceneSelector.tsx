import SceneSelector from '../SceneSelector';
import { SCENES } from '@shared/schema';

export default function SceneSelectorExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-teal-300 mb-6 text-center">
          Scene Selector Demo
        </h1>
        <SceneSelector
          scenes={SCENES}
          currentSceneId={2}
          onSceneSelect={(sceneId) => console.log('Scene selected:', sceneId)}
        />
      </div>
    </div>
  );
}