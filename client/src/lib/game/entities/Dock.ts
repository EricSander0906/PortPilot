import Phaser from "phaser";
import { CargoColor } from "../../stores/usePortPilot";
import { Boat } from "./Boat";

export class Dock extends Phaser.GameObjects.Container {
  private dockSprite: Phaser.GameObjects.Image;
  private color: CargoColor;
  private isOccupied: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, color: CargoColor) {
    super(scene, x, y);
    
    this.color = color;

    // Create dock sprite
    this.dockSprite = scene.add.image(0, 0, `dock-${color}`);
    this.add(this.dockSprite);

    // Add to scene
    scene.add.existing(this);
  }

  public getColor(): CargoColor {
    return this.color;
  }

  public canAcceptBoat(boat: Boat): boolean {
    return !this.isOccupied && boat.getColor() === this.color;
  }

  public setOccupied(occupied: boolean) {
    this.isOccupied = occupied;
    
    // Visual feedback
    if (occupied) {
      this.dockSprite.setAlpha(0.7);
    } else {
      this.dockSprite.setAlpha(1.0);
    }
  }

  public getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 40, this.y - 30, 80, 60);
  }
}
