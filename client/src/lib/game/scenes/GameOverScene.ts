import Phaser from "phaser";
import { usePortPilot } from "../../stores/usePortPilot";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data?: any) {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const { score, bestScore } = usePortPilot.getState();

    // Use passed data or defaults
    const stats = {
      totalPoints: data?.totalPoints || score,
      playerHighScore: data?.playerHighScore || bestScore,
      cargoDelivered: data?.cargoDelivered || Math.floor(score / 25),
      smallShipsDocked: data?.smallShipsDocked || 0,
      mediumShipsDocked: data?.mediumShipsDocked || 0,
      bigShipsDocked: data?.bigShipsDocked || 0
    };

    // Dark semi-transparent background
    this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8);

    // Game Over title
    this.add.text(centerX, 60, 'GAME OVER', {
      fontSize: '48px',
      color: '#FF4444',
      fontStyle: 'bold',
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
    }).setOrigin(0.5);

    // Statistics panel
    const panelY = 140;
    this.add.rectangle(centerX, panelY + 120, 500, 240, 0x222222, 0.9)
      .setStrokeStyle(2, 0x444444);

    // Statistics header
    this.add.text(centerX, panelY, 'FINAL STATISTICS', {
      fontSize: '28px',
      color: '#FFFF44',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Total Points
    this.add.text(centerX, panelY + 40, `Total Points: ${stats.totalPoints}`, {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Player High Score
    this.add.text(centerX, panelY + 70, `Player High Score: ${stats.playerHighScore}`, {
      fontSize: '20px',
      color: '#44FF44'
    }).setOrigin(0.5);

    // Cargo items delivered
    this.add.text(centerX, panelY + 100, `Cargo Items Delivered: ${stats.cargoDelivered}`, {
      fontSize: '18px',
      color: '#CCCCCC'
    }).setOrigin(0.5);

    // Ship statistics
    this.add.text(centerX - 120, panelY + 130, `Small Ships Docked: ${stats.smallShipsDocked}`, {
      fontSize: '16px',
      color: '#CCCCCC'
    }).setOrigin(0.5);

    this.add.text(centerX, panelY + 130, `Medium Ships Docked: ${stats.mediumShipsDocked}`, {
      fontSize: '16px',
      color: '#CCCCCC'
    }).setOrigin(0.5);

    this.add.text(centerX + 120, panelY + 130, `Big Ships Docked: ${stats.bigShipsDocked}`, {
      fontSize: '16px',
      color: '#CCCCCC'
    }).setOrigin(0.5);

    // Buttons
    const buttonY = panelY + 200;
    
    // Play Again button
    const playAgainButton = this.add.rectangle(centerX - 120, buttonY, 200, 50, 0x4CAF50)
      .setInteractive()
      .on('pointerdown', () => {
        usePortPilot.getState().resetGame();
        usePortPilot.getState().setGameState('playing');
        this.scene.start('GameScene');
      })
      .on('pointerover', () => playAgainButton.setFillStyle(0x66BB6A))
      .on('pointerout', () => playAgainButton.setFillStyle(0x4CAF50));

    this.add.text(centerX - 120, buttonY, 'PLAY AGAIN', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Main Menu button
    const menuButton = this.add.rectangle(centerX + 120, buttonY, 200, 50, 0x757575)
      .setInteractive()
      .on('pointerdown', () => {
        usePortPilot.getState().resetGame();
        this.scene.start('MenuScene');
      })
      .on('pointerover', () => menuButton.setFillStyle(0x9E9E9E))
      .on('pointerout', () => menuButton.setFillStyle(0x757575));

    this.add.text(centerX + 120, buttonY, 'MAIN MENU', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
}
