export default class MusicManager {
  static currentMusic = null;

  static play(scene, key, config = {}) {
    if (this.currentMusic && this.currentMusic.key === key) {
      return; // ya está sonando
    }

    if (this.currentMusic) {
      this.currentMusic.stop();
    }

    this.currentMusic = scene.sound.add(key, {
      loop: true,
      volume: 0.5,
      ...config
    });

    this.currentMusic.play();
  }

  static stop() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }
}