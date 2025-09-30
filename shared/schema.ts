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

// Auto-triggered phrases for Scene 1
export const SCENE1_AUTO_PHRASES = [
  "Hoy la misión es clara: motivar, inspirar y sumar confianza.",
  "¿Traje el cargador del celu? ¿Necesitaré adaptador?",
  "Respirá profundo: convención, allá vamos.",
  "Último repaso mental: todo bajo control.",
  "Ojalá que la energía positiva sea contagiosa.",
  "¿Estará mi perfume en el freeshop?",
  "Tengo que comprar garotos para todos en la oficina.",
  "Preparada, enfocada y con toda la energía lista."
];

// Scene data as defined in the concept
export const SCENES: Scene[] = [
  {
    id: 1,
    name: "Opening Thoughts",
    description: "First 5 phrases - sequential remote trigger",
    phrases: [
      "¿Y si me olvido de lo que tengo que decir?",
      "Capaz no es suficiente lo que preparé...",
      "¿Desenchufé la planchita de pelo?",
      "¿Cómo hago para subirlos a todos al barco de Sistema Nervioso Central?",
      "¿Por qué no me habré puesto zapatos más cómodos?"
    ],
    isActive: false,
  },
  {
    id: 2,
    name: "Start Scene",
    description: "Start button to begin",
    phrases: [],
    isActive: false,
  },
  {
    id: 3,
    name: "Scene 3",
    description: "3 individual phrase buttons",
    phrases: [
      "Espero que Rocío no me pregunte nada difícil",
      "Necesito ese micrófono… ¿estará en Mercado Libre?",
      "Rocío… ¡te olvidaste de presentarme! Tenemos que anunciar mi nueva posición."
    ],
    isActive: false,
  },
  {
    id: 4,
    name: "Closing Scene",
    description: "4 closing phrases - sequential trigger",
    phrases: [
      "¡Sí! Juntos podemos, ¡vamos con todo!",
      "¿Nos sacamos una foto todos juntos?",
      "¡Lo vamos a lograr!",
      "¡Qué bueno estar acá con todos!"
    ],
    isActive: false,
  },
];
