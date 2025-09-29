# Gador SNC 85th Anniversary Interactive Installation

## Overview

This is an interactive motion design installation created for Gador SNC's 85th anniversary celebration. The system features a futuristic audiovisual experience that visualizes thoughts and inner voices as illuminated Spanish phrases floating within a pulsating, neuron-inspired neural network background. The installation consists of two main components: a fullscreen stage display for large-screen projections and a mobile remote control interface for real-time interaction.

The project implements a sci-fi inspired design aesthetic drawing from films like "Minority Report" and "Inside Out", featuring dynamic particle systems, floating text animations, and HUD-style interfaces. The installation cycles through five distinct scenes, each with its own collection of Spanish phrases that appear with various animation styles and opacity layers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom brand color palette and futuristic design tokens
- **Animation**: GSAP for complex phrase animations and tsParticles for neural network background
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks with shared state interfaces

### Backend Architecture
- **Server**: Express.js with TypeScript for API endpoints
- **Data Layer**: In-memory storage with interface for future database integration
- **Real-time Communication**: WebSocket support planned for remote control synchronization
- **Session Management**: Built-in session handling for installation state persistence

### Component Architecture
The system is organized into specialized components:

**Stage Display Components:**
- `NeuralBackground`: Multi-layer tsParticles system with neural networks, pulses, and burst effects
- `FloatingPhrase`: GSAP-powered phrase animation engine with four entry styles (draw, focus, flash, mask)
- `PhotoBooth`: Camera integration for visitor photo capture
- `StageDisplay`: Main orchestrator component managing scene transitions and phrase lifecycles

**Remote Control Components:**
- `RemoteControl`: Mobile-optimized control interface
- `SceneSelector`: Touch-friendly scene navigation with color-coded buttons
- `ConnectionStatus`: Real-time WebSocket connection monitoring

### Animation System
The phrase animation system implements a sophisticated orbital cycle:
1. **Entry Phase**: Phrases appear using one of four styles (handwriting draw, focus blur, character flash, mask reveal)
2. **Front Orbit**: 8-second left-to-right movement at 100% opacity
3. **Back Mirror**: 8-second right-to-left movement at 35% opacity with teal tinting
4. **Return Cycle**: 8-second left-to-right return at 65% opacity
5. **Loop State**: Continuous slow drift with maintained opacity

Each phrase is mapped to specific vertical lanes (A=22%, B=38%, C=54%, D=70%) and triggers synchronized neural burst effects.

### Design System
- **Color Palette**: Gador brand colors including Primary Blue (#0033A0), Secondary Teal (#00A99D), and Light Blue (#78C4E6)
- **Typography**: Avenir Next with Helvetica Neue fallback, featuring glowing text effects
- **Layout**: Fullscreen stage projection with HUD elements, mobile-first responsive grid for remote
- **Interactions**: Touch-friendly controls, real-time phrase triggering, emergency stop functionality

### Database Schema
The shared schema defines:
- Scene management with phrase collections and activation states
- Phrase state tracking including position, opacity, layer, and animation status
- WebSocket message types for real-time communication
- Installation state persistence for volume, active phrases, and connection status

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive primitive components for accessibility and interaction patterns
- **Tailwind CSS**: Utility-first CSS framework with custom brand configuration
- **Class Variance Authority**: Type-safe component variant management
- **Lucide React**: Consistent icon system for interface elements

### Animation and Graphics
- **tsParticles**: Neural network background particle system with multi-layer support
- **GSAP**: Professional-grade animation library for phrase movement and transitions (referenced but not yet installed)

### Development Tools
- **Vite**: Fast development server with Hot Module Replacement
- **TypeScript**: Type safety across shared interfaces and component props
- **ESBuild**: Fast bundling for production deployment

### Database and Persistence
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Drizzle Kit**: Database migration and schema management
- **Neon Database**: Serverless PostgreSQL for cloud deployment
- **Zod**: Runtime schema validation for API contracts

### Backend Services
- **Express.js**: Web server framework with middleware support
- **Connect PG Simple**: PostgreSQL session store integration
- **React Query**: Server state management and caching for remote control

### Form and Data Handling
- **React Hook Form**: Form state management with validation
- **Hookform Resolvers**: Integration with Zod for form validation
- **Date-fns**: Date manipulation for timestamp handling

The architecture is designed to scale from prototype to production deployment while maintaining the real-time, interactive nature required for a live installation environment.