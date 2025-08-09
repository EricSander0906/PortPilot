# Port Pilot Game

## Overview

This is a full-stack HTML5 game implementation of "Port Pilot," a boat traffic management game originally built in Flash. The game features interactive boat control where players drag boats carrying colored shipments (red or yellow) to matching colored docks across six dock locations. Built using React with Phaser 3 for game rendering and Express.js for the backend, it includes automatic boat spawning, collision warnings, animated clouds with shadows, and immersive audio feedback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the UI layer and component structure
- **Phaser 3** game engine handling all game logic, rendering, and physics
- **Vite** as the build tool with hot module replacement for development
- **Zustand** for state management with separate stores for game state, audio, and Port Pilot specific data
- **Tailwind CSS** with shadcn/ui components for styling and UI elements
- **React Three Fiber/Drei** ecosystem for potential 3D enhancements (included but not actively used)

### Backend Architecture
- **Express.js** server with TypeScript for API routing
- **Modular route system** with placeholder for game-related endpoints
- **Memory storage** implementation with interfaces designed for easy database migration
- **Development/production environment** handling with Vite integration in dev mode

### Game Engine Structure
- **Scene-based architecture** with MenuScene, GameScene, and GameOverScene
- **Entity system** with Boat, Dock, and Cloud classes extending Phaser GameObjects
- **Component-based game objects** using Phaser's Container system for complex entities
- **Physics integration** using Phaser's Arcade physics for collision detection
- **Event-driven communication** between Phaser scenes and React state management

### Data Storage Solutions
- **Drizzle ORM** configured for PostgreSQL with schema definitions
- **Database migrations** system set up but not yet implemented
- **In-memory storage** currently used as a fallback with interface-based design
- **User management schema** prepared for future authentication features

### State Management
- **Zustand stores** separated by concern:
  - `useGame`: Core game phases and transitions
  - `usePortPilot`: Game-specific state (score, deliveries, selected boats)
  - `useAudio`: Sound management and mute controls
- **Reactive state updates** between React components and Phaser scenes
- **Persistent game state** maintained across scene transitions

### Asset Pipeline
- **SVG-based graphics** for scalable boat, dock, cloud, and UI elements
- **Audio asset management** with background music and sound effects
- **Vite asset processing** with support for game assets (GLTF, GLB, audio files)
- **Custom GLSL shader support** via vite-plugin-glsl for potential visual effects

## External Dependencies

### Core Framework Dependencies
- **Phaser 3**: Game engine for 2D game development and physics
- **React/React-DOM**: UI framework for component-based interface
- **Express.js**: Web server framework for API endpoints

### Database and ORM
- **Drizzle ORM**: Type-safe database query builder
- **Neon Database Serverless**: PostgreSQL database provider (configured but not deployed)
- **PostgreSQL**: Target database system for production

### UI and Styling
- **Radix UI**: Comprehensive component library for accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### State and Data Management
- **Zustand**: Lightweight state management with middleware support
- **TanStack React Query**: Server state management and caching
- **Zod**: Schema validation for type safety

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and enhanced development experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server

### Audio and Media
- **Web Audio API**: Native browser audio handling (no external audio library dependencies)
- **SVG assets**: Vector graphics for game sprites and UI elements

### Additional Features
- **React Three Fiber ecosystem**: 3D rendering capabilities (installed but not actively used)
- **Date-fns**: Date manipulation utilities
- **Class Variance Authority**: Utility for managing CSS class variants
- **CMDK**: Command palette implementation potential

The architecture is designed for scalability with clear separation between game logic (Phaser), UI management (React), and server functionality (Express). The database layer is prepared for PostgreSQL integration while currently operating with in-memory storage for development.