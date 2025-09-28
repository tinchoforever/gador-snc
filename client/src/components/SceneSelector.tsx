import { Button } from '@/components/ui/button';
import { Scene } from '@shared/schema';
import { Play, Users, Camera, Sparkles, Home } from 'lucide-react';

interface SceneSelectorProps {
  scenes: Scene[];
  currentSceneId: number;
  onSceneSelect?: (sceneId: number) => void;
}

const getSceneIcon = (sceneName: string) => {
  switch (sceneName) {
    case 'Chaotic Thoughts':
      return Sparkles;
    case 'Magic Microphone':
      return Play;
    case 'Collective Energy':
      return Users;
    case 'Photo Booth':
      return Camera;
    case 'Closing Thoughtscape':
      return Home;
    default:
      return Play;
  }
};

const getSceneColor = (sceneId: number, isActive: boolean) => {
  const colors = {
    1: isActive ? 'bg-purple-600 border-purple-400 text-white' : 'border-purple-400/50 text-purple-300 hover:border-purple-400',
    2: isActive ? 'bg-blue-600 border-blue-400 text-white' : 'border-blue-400/50 text-blue-300 hover:border-blue-400',
    3: isActive ? 'bg-green-600 border-green-400 text-white' : 'border-green-400/50 text-green-300 hover:border-green-400',
    4: isActive ? 'bg-orange-600 border-orange-400 text-white' : 'border-orange-400/50 text-orange-300 hover:border-orange-400',
    5: isActive ? 'bg-teal-600 border-teal-400 text-white' : 'border-teal-400/50 text-teal-300 hover:border-teal-400',
  };
  return colors[sceneId as keyof typeof colors] || colors[1];
};

export default function SceneSelector({ scenes, currentSceneId, onSceneSelect }: SceneSelectorProps) {
  const handleSceneSelect = (sceneId: number) => {
    onSceneSelect?.(sceneId);
    console.log('Scene selected:', sceneId);
  };

  return (
    <div className="space-y-2" data-testid="scene-selector">
      {scenes.map((scene) => {
        const isActive = scene.id === currentSceneId;
        const Icon = getSceneIcon(scene.name);
        const colorClasses = getSceneColor(scene.id, isActive);
        
        return (
          <Button
            key={scene.id}
            variant={isActive ? "default" : "outline"}
            className={`w-full text-left h-auto py-3 px-4 ${colorClasses}`}
            onClick={() => handleSceneSelect(scene.id)}
            data-testid={`button-scene-${scene.id}`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive ? 'text-white' : ''
              }`} />
              <div className="flex-1">
                <div className="font-medium text-base">{scene.name}</div>
                <div className={`text-xs opacity-75 ${
                  isActive ? 'text-white/80' : 'text-current'
                }`}>
                  {scene.description}
                </div>
              </div>
              {scene.phrases.length > 0 && (
                <div className={`text-xs px-2 py-1 rounded-full ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-current/10 text-current'
                }`}>
                  {scene.phrases.length}
                </div>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
}