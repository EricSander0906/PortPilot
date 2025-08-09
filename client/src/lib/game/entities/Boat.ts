import Phaser from "phaser";
import { CargoColor } from "../../stores/usePortPilot";

export class Boat extends Phaser.GameObjects.Container {
  private cargoText: Phaser.GameObjects.Text;
  private id: string;
  private color: CargoColor;
  private shipments: number;
  private isDragging: boolean = false;
  private velocity: Phaser.Math.Vector2;
  private mouseTarget: Phaser.Math.Vector2 | null = null;
  private trail: Phaser.GameObjects.Graphics;
  private trailPoints: Phaser.Math.Vector2[] = [];
  private lastDeliveryTime: number = 0;
  private deliveryDelay: number = 2000; // 2 seconds between deliveries
  private boatBody: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, color: CargoColor, shipments: number) {
    super(scene, x, y);
    
    this.id = Phaser.Utils.String.UUID();
    this.color = color;
    this.shipments = shipments;
    this.velocity = new Phaser.Math.Vector2(
      Phaser.Math.Between(-30, 30),
      Phaser.Math.Between(-30, 30)
    );

    // Create trail renderer
    this.trail = scene.add.graphics();
    this.trail.setDepth(-1); // Behind boat

    // Create boat body (top-down view)
    this.boatBody = scene.add.graphics();
    this.createBoatShape();
    this.add(this.boatBody);

    // Create cargo indicator
    this.cargoText = scene.add.text(0, 0, shipments.toString(), {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(this.cargoText);

    // Set interactive size based on boat length
    const boatLength = 20 + (shipments - 2) * 10; // 20-50 pixels based on shipments (2-5)
    this.setSize(boatLength, 12);
    this.setInteractive();

    // Add to scene
    scene.add.existing(this);
  }

  public createBoatShape() {
    this.boatBody.clear();
    
    // Boat length varies with shipments (2-5 shipments = 20-50 pixel length)
    const length = 20 + (this.shipments - 2) * 10;
    const width = 12;
    
    if (this.color === 'mixed') {
      // Mixed color boat - half red, half yellow
      this.boatBody.fillStyle(0xFF0000); // Red
      this.boatBody.fillRect(-length/2, -width/2, length/2, width);
      this.boatBody.fillStyle(0xFFFF00); // Yellow
      this.boatBody.fillRect(0, -width/2, length/2, width);
      
      // Outline
      this.boatBody.lineStyle(2, 0x000000);
      this.boatBody.strokeRect(-length/2, -width/2, length, width);
    } else {
      // Single color boat
      const boatColor = this.color === 'red' ? 0xFF0000 : 0xFFFF00;
      this.boatBody.fillStyle(boatColor);
      this.boatBody.fillRect(-length/2, -width/2, length, width);
      
      // Outline
      this.boatBody.lineStyle(2, 0x000000);
      this.boatBody.strokeRect(-length/2, -width/2, length, width);
    }
    
    // Boat front (triangle)
    this.boatBody.fillStyle(0x444444);
    this.boatBody.fillTriangle(length/2, 0, length/2 + 8, -4, length/2 + 8, 4);
    this.boatBody.lineStyle(1, 0x000000);
    this.boatBody.strokeTriangle(length/2, 0, length/2 + 8, -4, length/2 + 8, 4);
  }

  public update() {
    let movementX = 0;
    let movementY = 0;

    if (this.isDragging && this.mouseTarget) {
      // Smooth movement towards mouse when dragging
      const distance = Phaser.Math.Distance.Between(this.x, this.y, this.mouseTarget.x, this.mouseTarget.y);
      
      if (distance > 5) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.mouseTarget.x, this.mouseTarget.y);
        const speed = 120; // pixels per second
        movementX = Math.cos(angle) * speed * 0.016;
        movementY = Math.sin(angle) * speed * 0.016;
        
        this.x += movementX;
        this.y += movementY;
      }
    } else {
      // Automatic movement when not dragging
      movementX = this.velocity.x * 0.016;
      movementY = this.velocity.y * 0.016;
      this.x += movementX;
      this.y += movementY;
    }

    // Rotate boat based on movement direction
    if (Math.abs(movementX) > 0.1 || Math.abs(movementY) > 0.1) {
      const angle = Math.atan2(movementY, movementX);
      this.rotation = angle;
    }

    // Update trail
    this.updateTrail();

    // Check for dock delivery when dragging
    if (this.isDragging) {
      this.checkDockDelivery();
    }
  }

  private updateTrail() {
    // Add current position to trail
    this.trailPoints.push(new Phaser.Math.Vector2(this.x, this.y));
    
    // Limit trail length
    if (this.trailPoints.length > 15) {
      this.trailPoints.shift();
    }
    
    // Redraw trail
    this.trail.clear();
    if (this.trailPoints.length > 1) {
      const trailColor = this.color === 'red' ? 0xFF4444 : 
                        this.color === 'yellow' ? 0xFFFF44 : 0xFF8844; // Mixed = orange
      
      for (let i = 1; i < this.trailPoints.length; i++) {
        const alpha = (i / this.trailPoints.length) * 0.8; // Fade trail
        this.trail.lineStyle(3, trailColor, alpha);
        
        if (i === 1) {
          this.trail.moveTo(this.trailPoints[i-1].x, this.trailPoints[i-1].y);
        }
        this.trail.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
      }
      this.trail.strokePath();
    }
  }

  private checkDockDelivery() {
    const scene = this.scene as any;
    if (scene.docks) {
      for (const dock of scene.docks) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, dock.x, dock.y);
        if (distance < 40) {
          // Check if enough time has passed since last delivery
          const currentTime = Date.now();
          if (currentTime - this.lastDeliveryTime > this.deliveryDelay) {
            this.attemptDelivery(dock);
            this.lastDeliveryTime = currentTime;
          }
        }
      }
    }
  }

  private attemptDelivery(dock: any) {
    if (this.shipments <= 0) return;

    // Mixed boats can deliver to any dock
    if (this.color === 'mixed' || this.color === dock.getColor()) {
      const scene = this.scene as any;
      if (scene.handleDelivery) {
        scene.handleDelivery(this, dock);
      }
    }
  }

  public setDragging(dragging: boolean) {
    this.isDragging = dragging;
    if (dragging) {
      this.setScale(1.1);
    } else {
      this.setScale(1.0);
      this.mouseTarget = null;
    }
  }

  public setMouseTarget(x: number, y: number) {
    this.mouseTarget = new Phaser.Math.Vector2(x, y);
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
    const length = 20 + (this.shipments - 2) * 10;
    const width = 12;
    return new Phaser.Geom.Rectangle(this.x - length/2, this.y - width/2, length, width);
  }

  public isOffScreen(camera: Phaser.Cameras.Scene2D.Camera): boolean {
    const margin = 100;
    return !this.isDragging && (
           this.x < -margin || 
           this.x > camera.width + margin || 
           this.y < -margin || 
           this.y > camera.height + margin);
  }

  public getShipmentType(): 'small' | 'medium' | 'big' {
    if (this.shipments <= 2) return 'small';
    if (this.shipments <= 3) return 'medium';
    return 'big';
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
    // Clean up trail
    if (this.trail) {
      this.trail.destroy();
    }
    super.destroy(fromScene);
  }
}
