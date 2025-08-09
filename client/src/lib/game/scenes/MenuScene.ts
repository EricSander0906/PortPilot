import Phaser from "phaser";
import { usePortPilot } from "../../stores/usePortPilot";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Title
    this.add.text(centerX, centerY - 100, 'PORT PILOT', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY - 50, 'Boat Traffic Management', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Play button
    const playButton = this.add.rectangle(centerX, centerY + 50, 200, 60, 0x4CAF50)
      .setInteractive()
      .on('pointerdown', () => {
        usePortPilot.getState().setGameState('playing');
        this.scene.start('GameScene');
      })
      .on('pointerover', () => playButton.setFillStyle(0x66BB6A))
      .on('pointerout', () => playButton.setFillStyle(0x4CAF50));

    this.add.text(centerX, centerY + 50, 'PLAY', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instructions
    this.add.text(centerX, centerY + 150, 'Drag boats to matching colored docks\nRed boats to red docks, Yellow boats to yellow docks', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }
}
