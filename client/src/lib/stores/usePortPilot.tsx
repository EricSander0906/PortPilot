import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "menu" | "playing" | "gameOver";
export type CargoColor = "red" | "yellow" | "mixed";

interface PortPilotState {
  gameState: GameState;
  score: number;
  bestScore: number;
  selectedBoat: string | null;
  
  // Actions
  setGameState: (state: GameState) => void;
  incrementScore: (points: number) => void;
  updateBestScore: () => void;
  setSelectedBoat: (boatId: string | null) => void;
  resetGame: () => void;
}

export const usePortPilot = create<PortPilotState>()(
  subscribeWithSelector((set, get) => ({
    gameState: "menu",
    score: 0,
    bestScore: 0,
    selectedBoat: null,
    
    setGameState: (state) => set({ gameState: state }),
    
    incrementScore: (points) => set((state) => ({ 
      score: state.score + points 
    })),
    
    updateBestScore: () => set((state) => ({
      bestScore: Math.max(state.score, state.bestScore)
    })),
    
    setSelectedBoat: (boatId) => set({ selectedBoat: boatId }),
    
    resetGame: () => set((state) => ({
      score: 0,
      selectedBoat: null,
      gameState: "menu",
      bestScore: Math.max(state.score, state.bestScore)
    }))
  }))
);
