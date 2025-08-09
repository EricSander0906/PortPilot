import Phaser from "phaser";
import { CargoColor } from "../../stores/usePortPilot";

export class Boat extends Phaser.GameObjects.Container {
  private boatSprite: Phaser.GameObjects.Image;
  private cargoText: Phaser.GameObjects.Text;
  private id: string;
  private color: CargoColor;
  private shipments: number;
  private isDragging: boolean = false;
  private velocity: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene, x: number, y: number, color: CargoColor, shipments: number) {
    super(scene, x, y);
    
    this.id = Phaser.Utils.String.UUID();
    this.color = color;
    this.shipments = shipments;
    this.velocity = new Phaser.Math.Vector2(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );

    // Create boat sprite
    this.boatSprite = scene.add.image(0, 0, `boat-${color}`);
    this.add(this.boatSprite);

    // Create cargo indicator
    this.cargoText = scene.add.text(0, -30, shipments.toString(), {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
    this.add(this.cargoText);

    // Set interactive
    this.setSize(60, 40);
    this.setInteractive();

    // Add to scene
    scene.add.existing(this);
  }

  public update() {
    if (!this.isDragging) {
      // Move automatically when not being dragged
      this.x += this.velocity.x * 0.016; // 60 FPS delta
      this.y += this.velocity.y * 0.016;
    }
  }

  public setDragging(dragging: boolean) {
    this.isDragging = dragging;
    
    // Visual feedback when dragging
    if (dragging) {
      this.boatSprite.setTint(0xaaaaaa);
      this.setScale(1.1);
    } else {
      this.boatSprite.clearTint();
      this.setScale(1.0);
    }
  }

  public getId(): string {
    return this.id;
  }

  public getColor(): CargoColor {
    return this.color;
  }

  public getShipments(): number {
    return this.shipments;
  }

  public getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 30, this.y - 20, 60, 40);
  }

  public isOffScreen(camera: Phaser.Cameras.Scene2D.Camera): boolean {
    const margin = 100;
    return this.x < -margin || 
           this.x > camera.width + margin || 
           this.y < -margin || 
           this.y > camera.height + margin;
  }

  public deliverCargo(): boolean {
    if (this.shipments > 0) {
      this.shipments--;
      this.cargoText.setText(this.shipments.toString());
      return this.shipments === 0;
    }
    return true;
  }
}
