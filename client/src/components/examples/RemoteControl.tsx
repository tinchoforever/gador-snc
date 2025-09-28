import RemoteControl from '../RemoteControl';
import { InstallationState } from '@shared/schema';

export default function RemoteControlExample() {
  const mockState: InstallationState = {
    currentScene: 1,
    activePhrases: [],
    isConnected: true,
    volume: 0.8,
  };

  return (
    <RemoteControl 
      installationState={mockState}
      onSceneChange={(sceneId) => console.log('Scene changed to:', sceneId)}
      onPhraseTriggered={(phrase, sceneId) => console.log('Phrase triggered:', phrase, 'in scene:', sceneId)}
      onPhotoTrigger={() => console.log('Photo triggered')}
      onVolumeChange={(volume) => console.log('Volume changed to:', volume)}
    />
  );
}