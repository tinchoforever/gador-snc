import StageDisplay from '../StageDisplay';
import { InstallationState } from '@shared/schema';

export default function StageDisplayExample() {
  const mockState: InstallationState = {
    currentScene: 1,
    activePhrases: [],
    isConnected: true,
    volume: 0.8,
  };

  return (
    <StageDisplay 
      installationState={mockState}
      onStateChange={(newState) => console.log('State changed:', newState)}
    />
  );
}