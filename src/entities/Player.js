export class Player {
  constructor(scene, playerId, x, y) {
    this.scene = scene;
    this.playerId = playerId;

    this.baseSpeed = 500;
    this.sprite = scene.physics.add.sprite(x, y, 'Robot1');
    this.sprite.setImmovable(false);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.allowGravity = true;

  } 
}