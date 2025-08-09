import Phaser from "phaser";
import { Boat } from "../entities/Boat";
import { Dock } from "../entities/Dock";
import { Cloud } from "../entities/Cloud";
import { usePortPilot } from "../../stores/usePortPilot";
import { useAudio } from "../../stores/useAudio";

export class GameScene extends Phaser.Scene {
  private boats: Boat[] = [];
  private docks: Dock[] = [];
  private clouds: Cloud[] = [];
  private draggedBoat: Boat | null = null;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private warningCircles: Phaser.GameObjects.Graphics[] = [];
  private pathPreview: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Load boat sprites
    this.load.svg('boat-red', '/images/boat-red.svg', { width: 60, height: 40 });
    this.load.svg('boat-yellow', '/images/boat-yellow.svg', { width: 60, height: 40 });
    
    // Load dock sprites
    this.load.svg('dock-red', '/images/dock-red.svg', { width: 80, height: 60 });
    this.load.svg('dock-yellow', '/images/dock-yellow.svg', { width: 80, height: 60 });
    
    // Load other assets
    this.load.svg('cloud', '/images/cloud.svg', { width: 100, height: 60 });
    this.load.svg('warning', '/images/warning.svg', { width: 30, height: 30 });
  }

  create() {
    // Start background music
    const { backgroundMusic, isMuted } = useAudio.getState();
    if (backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(() => console.log('Background music play prevented'));
    }

    // Create natural sea background
    this.createSeaBackground();
    
    // Create ground areas for docks
    this.createGroundAreas();
    
    // Create docks in three areas
    this.createDocks();
    
    // Create initial clouds
    this.createClouds();
    
    // Set up boat spawning
    this.spawnTimer = this.time.addEvent({
      delay: 3000,
      callback: this.spawnBoat,
      callbackScope: this,
      loop: true
    });

    // Set up input handling for click-to-path
    this.input.on('pointerdown', this.onPointerDown, this);

    // Spawn first boat immediately
    this.time.delayedCall(1000, this.spawnBoat, [], this);
  }

  private createSeaBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create realistic sea gradient background
    const graphics = this.add.graphics();
    
    // Sea gradient from light blue to darker blue
    for (let i = 0; i < height; i++) {
      const ratio = i / height;
      const r = Math.floor(65 + (30 - 65) * ratio);   // 65 to 30
      const g = Math.floor(180 + (100 - 180) * ratio); // 180 to 100  
      const b = Math.floor(220 + (160 - 220) * ratio); // 220 to 160
      const color = (r << 16) | (g << 8) | b;
      
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, i, width, 1);
    }

    // Add wave patterns
    const wave1 = this.add.graphics();
    wave1.lineStyle(2, 0x4A90E2, 0.3);
    for (let x = 0; x < width; x += 50) {
      const y = height * 0.3 + Math.sin(x * 0.02) * 10;
      if (x === 0) wave1.moveTo(x, y);
      else wave1.lineTo(x, y);
    }
    wave1.strokePath();

    const wave2 = this.add.graphics();
    wave2.lineStyle(2, 0x87CEEB, 0.2);
    for (let x = 0; x < width; x += 30) {
      const y = height * 0.6 + Math.sin(x * 0.03 + 1) * 8;
      if (x === 0) wave2.moveTo(x, y);
      else wave2.lineTo(x, y);
    }
    wave2.strokePath();
  }

  private createGroundAreas() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Top-left ground area for docks
    const topLeftGround = this.add.graphics();
    topLeftGround.fillStyle(0x8B7355, 1); // Brown sandy color
    topLeftGround.fillEllipse(width * 0.2, height * 0.25, width * 0.25, height * 0.2);
    
    // Add some texture to ground
    topLeftGround.fillStyle(0x654321, 0.3);
    for (let i = 0; i < 20; i++) {
      const x = width * 0.1 + Math.random() * width * 0.2;
      const y = height * 0.15 + Math.random() * height * 0.2;
      topLeftGround.fillCircle(x, y, Math.random() * 3 + 1);
    }

    // Bottom-right ground area for docks  
    const bottomRightGround = this.add.graphics();
    bottomRightGround.fillStyle(0x8B7355, 1);
    bottomRightGround.fillEllipse(width * 0.8, height * 0.75, width * 0.25, height * 0.2);
    
    // Add texture
    bottomRightGround.fillStyle(0x654321, 0.3);
    for (let i = 0; i < 20; i++) {
      const x = width * 0.7 + Math.random() * width * 0.2;
      const y = height * 0.65 + Math.random() * height * 0.2;
      bottomRightGround.fillCircle(x, y, Math.random() * 3 + 1);
    }
  }

  private createDocks() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Top-left area
    this.docks.push(new Dock(this, width * 0.15, height * 0.2, 'red'));
    this.docks.push(new Dock(this, width * 0.25, height * 0.2, 'yellow'));

    // Middle-center area
    this.docks.push(new Dock(this, width * 0.45, height * 0.5, 'red'));
    this.docks.push(new Dock(this, width * 0.55, height * 0.5, 'yellow'));

    // Bottom-right area
    this.docks.push(new Dock(this, width * 0.75, height * 0.8, 'red'));
    this.docks.push(new Dock(this, width * 0.85, height * 0.8, 'yellow'));
  }

  private createClouds() {
    for (let i = 0; i < 5; i++) {
      const cloud = new Cloud(this, 
        Phaser.Math.Between(0, this.cameras.main.width),
        Phaser.Math.Between(0, this.cameras.main.height * 0.3)
      );
      this.clouds.push(cloud);
    }
  }

  private spawnBoat() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Spawn from edges
    const side = Phaser.Math.Between(0, 3);
    let x, y;
    
    switch (side) {
      case 0: // Top
        x = Phaser.Math.Between(0, width);
        y = -50;
        break;
      case 1: // Right
        x = width + 50;
        y = Phaser.Math.Between(0, height);
        break;
      case 2: // Bottom
        x = Phaser.Math.Between(0, width);
        y = height + 50;
        break;
      case 3: // Left
        x = -50;
        y = Phaser.Math.Between(0, height);
        break;
      default:
        x = -50;
        y = height / 2;
    }

    const color = Phaser.Math.RND.pick(['red', 'yellow']) as 'red' | 'yellow';
    const shipments = Phaser.Math.Between(2, 5);
    
    const boat = new Boat(this, x, y, color, shipments);
    this.boats.push(boat);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    const boat = this.getBoatAtPosition(pointer.x, pointer.y);
    if (boat) {
      // First click selects boat
      if (this.draggedBoat !== boat) {
        if (this.draggedBoat) {
          this.draggedBoat.setSelected(false);
        }
        this.draggedBoat = boat;
        boat.setSelected(true);
        usePortPilot.getState().setSelectedBoat(boat.getId());
      } else {
        // Second click sets path
        this.setBoatPath(boat, pointer.x, pointer.y);
      }
    } else {
      // Click on empty space - set path for selected boat
      if (this.draggedBoat) {
        this.setBoatPath(this.draggedBoat, pointer.x, pointer.y);
      }
    }
  }

  private setBoatPath(boat: Boat, targetX: number, targetY: number) {
    // Create smooth path preview
    this.showPathPreview(boat.x, boat.y, targetX, targetY);
    
    // Set boat destination
    boat.setDestination(targetX, targetY);
    
    // Check if target is over a dock
    const dock = this.getDockAtPosition(targetX, targetY);
    if (dock && dock.canAcceptBoat(boat)) {
      // Delay delivery until boat reaches destination
      boat.setTargetDock(dock);
    }
  }

  private showPathPreview(startX: number, startY: number, endX: number, endY: number) {
    // Remove existing preview
    if (this.pathPreview) {
      this.pathPreview.destroy();
    }

    // Create smooth curved path
    this.pathPreview = this.add.graphics();
    this.pathPreview.lineStyle(3, 0xFFFFFF, 0.8);
    
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2 - 50; // Slight curve
    
    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(startX, startY),
      new Phaser.Math.Vector2(midX, midY),
      new Phaser.Math.Vector2(endX, endY)
    );
    
    curve.draw(this.pathPreview);
    
    // Fade out preview after 2 seconds
    this.tweens.add({
      targets: this.pathPreview,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        if (this.pathPreview) {
          this.pathPreview.destroy();
          this.pathPreview = null;
        }
      }
    });
  }

  private getBoatAtPosition(x: number, y: number): Boat | null {
    for (const boat of this.boats) {
      if (boat.getBounds().contains(x, y)) {
        return boat;
      }
    }
    return null;
  }

  private getDockAtPosition(x: number, y: number): Dock | null {
    for (const dock of this.docks) {
      if (Phaser.Geom.Rectangle.Contains(dock.getBounds(), x, y)) {
        return dock;
      }
    }
    return null;
  }

  public handleDelivery(boat: Boat, dock: Dock) {
    if (boat.getColor() === dock.getColor()) {
      // Successful delivery with different scoring: red=40, yellow=10
      const basePoints = boat.getColor() === 'red' ? 40 : 10;
      const points = basePoints * boat.getShipments();
      usePortPilot.getState().incrementScore(points);
      usePortPilot.getState().updateBestScore();
      
      // Play success sound
      const { playSuccess } = useAudio.getState();
      playSuccess();
      
      // Remove boat
      this.removeBoat(boat);
    }
  }

  private removeBoat(boat: Boat) {
    const index = this.boats.indexOf(boat);
    if (index > -1) {
      this.boats.splice(index, 1);
      boat.destroy();
    }
  }

  update() {
    // Update boats
    this.boats.forEach(boat => {
      boat.update();
      
      // Remove boats that are off-screen
      if (boat.isOffScreen(this.cameras.main)) {
        this.removeBoat(boat);
      }
    });

    // Update clouds
    this.clouds.forEach(cloud => cloud.update());

    // Check for boat collisions
    this.checkBoatCollisions();

    // Clean up warning circles
    this.warningCircles = this.warningCircles.filter(circle => {
      if (circle.alpha <= 0) {
        circle.destroy();
        return false;
      }
      return true;
    });
  }

  private checkBoatCollisions() {
    // Clear existing warnings
    this.warningCircles.forEach(circle => circle.destroy());
    this.warningCircles = [];

    for (let i = 0; i < this.boats.length; i++) {
      for (let j = i + 1; j < this.boats.length; j++) {
        const boat1 = this.boats[i];
        const boat2 = this.boats[j];
        
        const distance = Phaser.Math.Distance.Between(boat1.x, boat1.y, boat2.x, boat2.y);
        
        if (distance < 80) { // Collision threshold
          // Create warning circle
          const warning = this.add.graphics();
          warning.lineStyle(4, 0xff0000, 0.8);
          warning.strokeCircle(boat1.x, boat1.y, 50);
          warning.strokeCircle(boat2.x, boat2.y, 50);
          this.warningCircles.push(warning);
          
          // Play warning sound
          const { playHit } = useAudio.getState();
          playHit();
          
          // Fade out warning
          this.tweens.add({
            targets: warning,
            alpha: 0,
            duration: 1000,
            ease: 'Power2'
          });
        }
      }
    }
  }
}
