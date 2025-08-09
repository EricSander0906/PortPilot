import { usePortPilot } from "../../lib/stores/usePortPilot";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function GameUI() {
  const { score, bestScore, gameState } = usePortPilot();
  const { toggleMute, isMuted } = useAudio();

  if (gameState !== 'playing') return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      {/* Top HUD */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        pointerEvents: 'auto'
      }}>
        <Card style={{
          padding: '10px 20px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: 'none'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div>Score: {score}</div>
            <div>Best: {bestScore}</div>
          </div>
        </Card>

        <Button
          onClick={toggleMute}
          variant="outline"
          size="sm"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </Button>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'auto'
      }}>
        <Card style={{
          padding: '10px 20px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: 'none',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px' }}>
            Click boats to select, then click destination to set path • Red cargo = 40pts, Yellow = 10pts
          </div>
        </Card>
      </div>
    </div>
  );
}
