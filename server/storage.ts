import { type InstallationState, type SocketMessage } from "@shared/schema";

// Storage interface for the Gador installation
export interface IStorage {
  getInstallationState(): Promise<InstallationState>;
  updateInstallationState(state: InstallationState): Promise<InstallationState>;
  addSocketMessage(message: SocketMessage): Promise<void>;
}

export class MemStorage implements IStorage {
  private installationState: InstallationState;
  private messages: SocketMessage[];

  constructor() {
    this.installationState = {
      currentScene: 1,
      activePhrases: [],
      isConnected: false,
      volume: 0.8,
    };
    this.messages = [];
  }

  async getInstallationState(): Promise<InstallationState> {
    return this.installationState;
  }

  async updateInstallationState(state: InstallationState): Promise<InstallationState> {
    this.installationState = { ...state };
    return this.installationState;
  }

  async addSocketMessage(message: SocketMessage): Promise<void> {
    this.messages.push(message);
    // Keep only last 100 messages
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
  }
}

export const storage = new MemStorage();
