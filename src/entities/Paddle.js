export class Paddle {
  constructor(scene, id, x, y) {
    this.id = id;
    this.scene = scene;
    this.score = 0;
    this.boolCanPush = true;

    this.baseWidth = 50;
    this.baseHeight = 50;
    this.baseSpeed = 300;

    // Seleccionar sprite según el id
    const spriteKey = id === 'player1' ? 'Robot1' : 'Robot2';

    this.sprite = this.scene.physics.add.sprite(x, y, spriteKey);

    this.sprite.setImmovable(false);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.allowGravity = true;

     this.sprite.setScale(0.1);

  }
}


