class Axe extends GameObject {
  constructor(config) {
    super(config);
    this.sprite = new Sprite({
      gameObject: this,
      src: "/images/characters/testAxe.png",
      animations: {
        "not-picked-up-down": [[0, 0]],
        "picked-up-down": [[1, 0]],
      },
      currentAnimation: "not-picked-up-down"
    });
    this.storyFlag = config.storyFlag;
    
    this.talking = [
      {
        required: [this.storyFlag],
        events: [
          { type: "textMessage", text: "There is nothing else to pick up." },
        ]
      },
      {
        events: [
          { type: "textMessage", text: "You picked up an axe." },
          { type: "addStoryFlag", flag: this.storyFlag },
        ]
      }
    ]
  }
  update() {
    this.sprite.currentAnimation = playerState.storyFlags[this.storyFlag]
      ? "picked-up-down"
      : "not-picked-up-down";
  }
}

