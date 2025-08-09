import Phaser from "phaser";
import { CargoColor } from "../../stores/usePortPilot";

export class Boat extends Phaser.GameObjects.Container {
  private boatSprite: Phaser.GameObjects.Image;
  private cargoText: Phaser.GameObjects.Text;
  private id: string;
  private color: CargoColor;
  private shipments: number;
  private isSelected: boolean = false;
  private velocity: Phaser.Math.Vector2;
  private destination: Phaser.Math.Vector2 | null = null;
  private targetDock: any = null; // Will be typed later
  private trail: Phaser.GameObjects.Graphics;
  private trailPoints: Phaser.Math.Vector2[] = [];
  private selectionRing: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, color: CargoColor, shipments: number) {
    super(scene, x, y);
    
    this.id = Phaser.Utils.String.UUID();
    this.color = color;
    this.shipments = shipments;
    this.velocity = new Phaser.Math.Vector2(
      Phaser.Math.Between(-50, 50),
      Phaser.Math.Between(-50, 50)
    );

    // Create trail renderer
    this.trail = scene.add.graphics();
    this.trail.setDepth(-1); // Behind boat

    // Create selection ring
    this.selectionRing = scene.add.graphics();
    this.selectionRing.setVisible(false);

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
    // Move towards destination if set
    if (this.destination) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.destination.x, this.destination.y);
      
      if (distance < 5) {
        // Reached destination
        if (this.targetDock) {
          // Trigger delivery
          (this.scene as any).handleDelivery(this, this.targetDock);
          this.targetDock = null;
        }
        this.destination = null;
      } else {
        // Move towards destination smoothly
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.destination.x, this.destination.y);
        const speed = 100; // pixels per second
        this.x += Math.cos(angle) * speed * 0.016;
        this.y += Math.sin(angle) * speed * 0.016;
      }
    } else {
      // Automatic movement when no destination
      this.x += this.velocity.x * 0.016;
      this.y += this.velocity.y * 0.016;
    }

    // Update trail
    this.updateTrail();
    
    // Update selection ring position
    if (this.isSelected) {
      this.selectionRing.setPosition(this.x, this.y);
    }
  }

  private updateTrail() {
    // Add current position to trail
    this.trailPoints.push(new Phaser.Math.Vector2(this.x, this.y));
    
    // Limit trail length
    if (this.trailPoints.length > 20) {
      this.trailPoints.shift();
    }
    
    // Redraw trail
    this.trail.clear();
    if (this.trailPoints.length > 1) {
      const trailColor = this.color === 'red' ? 0xFF4444 : 0xFFFF44;
      this.trail.lineStyle(3, trailColor, 0.6);
      
      for (let i = 1; i < this.trailPoints.length; i++) {
        const alpha = i / this.trailPoints.length; // Fade trail
        this.trail.lineStyle(3, trailColor, alpha * 0.6);
        
        if (i === 1) {
          this.trail.moveTo(this.trailPoints[i-1].x, this.trailPoints[i-1].y);
        }
        this.trail.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
      }
      this.trail.strokePath();
    }
  }

  public setSelected(selected: boolean) {
    this.isSelected = selected;
    this.selectionRing.setVisible(selected);
    
    if (selected) {
      // Draw selection ring
      this.selectionRing.clear();
      this.selectionRing.lineStyle(3, 0x00FF00, 0.8);
      this.selectionRing.strokeCircle(0, 0, 35);
      this.selectionRing.setPosition(this.x, this.y);
      this.setScale(1.1);
    } else {
      this.selectionRing.clear();
      this.setScale(1.0);
    }
  }

  public setDestination(x: number, y: number) {
    this.destination = new Phaser.Math.Vector2(x, y);
  }

  public setTargetDock(dock: any) {
    this.targetDock = dock;
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

  public destroy(fromScene?: boolean) {
    // Clean up trail and selection ring
    if (this.trail) {
      this.trail.destroy();
    }
    if (this.selectionRing) {
      this.selectionRing.destroy();
    }
    super.destroy(fromScene);
  }
}
