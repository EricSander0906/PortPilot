import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "menu" | "playing" | "gameOver";
export type CargoColor = "red" | "yellow";

interface PortPilotState {
  gameState: GameState;
  score: number;
  deliveries: number;
  selectedBoat: string | null;
  
  // Actions
  setGameState: (state: GameState) => void;
  incrementScore: (points: number) => void;
  incrementDeliveries: () => void;
  setSelectedBoat: (boatId: string | null) => void;
  resetGame: () => void;
}

export const usePortPilot = create<PortPilotState>()(
  subscribeWithSelector((set) => ({
    gameState: "menu",
    score: 0,
    deliveries: 0,
    selectedBoat: null,
    
    setGameState: (state) => set({ gameState: state }),
    
    incrementScore: (points) => set((state) => ({ 
      score: state.score + points 
    })),
    
    incrementDeliveries: () => set((state) => ({ 
      deliveries: state.deliveries + 1 
    })),
    
    setSelectedBoat: (boatId) => set({ selectedBoat: boatId }),
    
    resetGame: () => set({
      score: 0,
      deliveries: 0,
      selectedBoat: null,
      gameState: "menu"
    })
  }))
);
