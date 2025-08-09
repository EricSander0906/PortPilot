import Phaser from "phaser";

export class Cloud extends Phaser.GameObjects.Container {
  private cloudSprite: Phaser.GameObjects.Image;
  private shadowSprite: Phaser.GameObjects.Image;
  private velocity: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Random velocity moving from bottom-right to top-left
    this.velocity = new Phaser.Math.Vector2(
      Phaser.Math.Between(-30, -10), // Moving left
      Phaser.Math.Between(-20, -5)   // Moving up
    );

    // Create shadow first (behind)
    this.shadowSprite = scene.add.image(10, 10, 'cloud');
    this.shadowSprite.setTint(0x000000);
    this.shadowSprite.setAlpha(0.3);
    this.shadowSprite.setScale(0.9);
    this.add(this.shadowSprite);

    // Create cloud sprite
    this.cloudSprite = scene.add.image(0, 0, 'cloud');
    this.cloudSprite.setTint(0xffffff);
    this.cloudSprite.setAlpha(0.8);
    this.add(this.cloudSprite);

    // Random scale
    const scale = Phaser.Math.FloatBetween(0.8, 1.5);
    this.setScale(scale);

    // Add to scene
    scene.add.existing(this);
  }

  public update() {
    this.x += this.velocity.x * 0.016; // 60 FPS delta
    this.y += this.velocity.y * 0.016;

    // Wrap around screen
    if (this.x < -100) {
      this.x = this.scene.cameras.main.width + 100;
    }
    if (this.y < -100) {
      this.y = this.scene.cameras.main.height + 100;
    }
  }
}
