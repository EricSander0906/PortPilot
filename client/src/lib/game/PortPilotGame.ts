import Phaser from "phaser";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { GameOverScene } from "./scenes/GameOverScene";

export class PortPilotGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);

    // Add scenes
    this.scene.add('MenuScene', MenuScene);
    this.scene.add('GameScene', GameScene);
    this.scene.add('GameOverScene', GameOverScene);

    // Start with menu
    this.scene.start('MenuScene');
  }
}
