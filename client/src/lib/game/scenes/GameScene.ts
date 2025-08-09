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

    // Set up input handling
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);

    // Spawn first boat immediately
    this.time.delayedCall(1000, this.spawnBoat, [], this);
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
    const shipments = Phaser.Math.RND.pick([3, 5]);
    
    const boat = new Boat(this, x, y, color, shipments);
    this.boats.push(boat);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    const boat = this.getBoatAtPosition(pointer.x, pointer.y);
    if (boat) {
      this.draggedBoat = boat;
      boat.setDragging(true);
      usePortPilot.getState().setSelectedBoat(boat.getId());
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (this.draggedBoat) {
      this.draggedBoat.setPosition(pointer.x, pointer.y);
    }
  }

  private onPointerUp() {
    if (this.draggedBoat) {
      this.draggedBoat.setDragging(false);
      
      // Check if boat is over a dock
      const dock = this.getDockAtPosition(this.draggedBoat.x, this.draggedBoat.y);
      if (dock && dock.canAcceptBoat(this.draggedBoat)) {
        this.handleDelivery(this.draggedBoat, dock);
      }
      
      this.draggedBoat = null;
      usePortPilot.getState().setSelectedBoat(null);
    }
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

  private handleDelivery(boat: Boat, dock: Dock) {
    if (boat.getColor() === dock.getColor()) {
      // Successful delivery
      const points = boat.getShipments() * 10;
      usePortPilot.getState().incrementScore(points);
      usePortPilot.getState().incrementDeliveries();
      
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
