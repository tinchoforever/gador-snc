import { z } from "zod";

// Scene definitions for the Gador installation
export const sceneSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  phrases: z.array(z.string()),
  isActive: z.boolean().default(false),
});

// Phrase animation state
export const phraseStateSchema = z.object({
  id: z.string(),
  text: z.string(),
  layer: z.enum(["front", "floating", "mirror", "return"]),
  opacity: z.number().min(0).max(1),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number().optional(),
  }),
  isActive: z.boolean().default(true),
  sceneId: z.number(),
});

// WebSocket message types
export const socketMessageSchema = z.object({
  type: z.enum(["trigger_phrase", "change_scene", "take_photo", "connection_status", "scene_update"]),
  payload: z.any(),
  timestamp: z.number(),
});

// Installation state
export const installationStateSchema = z.object({
  currentScene: z.number(),
  activePhrases: z.array(phraseStateSchema),
  isConnected: z.boolean(),
  volume: z.number().min(0).max(1),
});

export type Scene = z.infer<typeof sceneSchema>;
export type PhraseState = z.infer<typeof phraseStateSchema>;
export type SocketMessage = z.infer<typeof socketMessageSchema>;
export type InstallationState = z.infer<typeof installationStateSchema>;

// Scene data as defined in the concept
export const SCENES: Scene[] = [
  {
    id: 1,
    name: "Chaotic Thoughts",
    description: "Random anxious thoughts appearing automatically",
    phrases: [
      "¿Y si me olvido de lo que tengo que decir?",
      "Capaz no es suficiente lo que preparé...",
      "¿Desenchufé la planchita de pelo?",
      "¿Cómo hago para subirlos a todos al barco de Sistema Nervioso Central?",
      "¿Por qué no me habré puesto zapatos más cómodos?",
      "¿Los chicos estarán haciendo la tarea o viendo youtube?"
    ],
    isActive: false,
  },
  {
    id: 2,
    name: "Magic Microphone",
    description: "Manual trigger phrases one by one",
    phrases: [
      "Espero que Rocío no me pregunte nada difícil",
      "Necesito ese micrófono… ¿estará en Mercado Libre?",
      "Rocío… ¡te olvidaste de presentarme! Tenemos que anunciar mi nueva posición."
    ],
    isActive: false,
  },
  {
    id: 3,
    name: "Collective Energy",
    description: "Positive affirmations circulating",
    phrases: [
      "¡Lo vamos a lograr!",
      "¡Sí, juntos podemos!",
      "¡Qué bueno estar acá con todos!",
      "¡Vamos con todo!"
    ],
    isActive: false,
  },
  {
    id: 4,
    name: "Photo Booth",
    description: "Camera countdown and snapshot",
    phrases: [],
    isActive: false,
  },
  {
    id: 5,
    name: "Closing Thoughtscape",
    description: "Final crescendo with all phrases orbiting",
    phrases: [
      "¡Lo vamos a lograr!",
      "¡Sí, juntos podemos!",
      "¡Qué bueno estar acá con todos!",
      "¡Vamos con todo!"
    ],
    isActive: false,
  },
];
