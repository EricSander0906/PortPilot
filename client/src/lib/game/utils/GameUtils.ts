import Phaser from "phaser";
import { CargoColor } from "../../stores/usePortPilot";

export class GameUtils {
  public static calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  public static getRandomCargoColor(): CargoColor {
    return Math.random() < 0.5 ? 'red' : 'yellow';
  }

  public static getRandomShipmentCount(): number {
    return Math.random() < 0.6 ? 3 : 5;
  }

  public static isPointInBounds(x: number, y: number, bounds: Phaser.Geom.Rectangle): boolean {
    return Phaser.Geom.Rectangle.Contains(bounds, x, y);
  }

  public static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  public static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }
}
