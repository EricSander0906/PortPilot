import Phaser from "phaser";
import { usePortPilot } from "../../stores/usePortPilot";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const { score, bestScore } = usePortPilot.getState();

    // Game Over title
    this.add.text(centerX, centerY - 150, 'GAME OVER', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Final score
    this.add.text(centerX, centerY - 50, `Final Score: ${score}`, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Best score
    this.add.text(centerX, centerY, `Best Score: ${bestScore}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Play Again button
    const playAgainButton = this.add.rectangle(centerX - 100, centerY + 100, 180, 60, 0x4CAF50)
      .setInteractive()
      .on('pointerdown', () => {
        usePortPilot.getState().resetGame();
        usePortPilot.getState().setGameState('playing');
        this.scene.start('GameScene');
      })
      .on('pointerover', () => playAgainButton.setFillStyle(0x66BB6A))
      .on('pointerout', () => playAgainButton.setFillStyle(0x4CAF50));

    this.add.text(centerX - 100, centerY + 100, 'PLAY AGAIN', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Menu button
    const menuButton = this.add.rectangle(centerX + 100, centerY + 100, 180, 60, 0x757575)
      .setInteractive()
      .on('pointerdown', () => {
        usePortPilot.getState().resetGame();
        this.scene.start('MenuScene');
      })
      .on('pointerover', () => menuButton.setFillStyle(0x9E9E9E))
      .on('pointerout', () => menuButton.setFillStyle(0x757575));

    this.add.text(centerX + 100, centerY + 100, 'MAIN MENU', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
}
