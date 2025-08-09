import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { PortPilotGame } from "../../lib/game/PortPilotGame";
import { GameUI } from "./GameUI";
import { usePortPilot } from "../../lib/stores/usePortPilot";

export function GameContainer() {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<PortPilotGame | null>(null);
  const { gameState } = usePortPilot();

  useEffect(() => {
    if (gameRef.current && !phaserGameRef.current) {
      // Initialize Phaser game
      phaserGameRef.current = new PortPilotGame({
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: gameRef.current,
        backgroundColor: '#87CEEB',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      });
    }

    // Handle window resize
    const handleResize = () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
      {gameState === 'playing' && <GameUI />}
    </div>
  );
}
