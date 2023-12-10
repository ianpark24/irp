class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true;
  }
  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }
  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const {x,y} = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x,y);
  }

}

window.OverworldMaps = {
  startingRoom: {
    lowerSrc: "/images/maps/startingRoom.png",
    upperSrc: "/images/maps/startingRoomUpper.png",
    gameObjects: {
      //if()
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      landLady: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(9),
        direction: "right",
        src: "/images/characters/people/erio.png",
        talking: [
          {
            
          }
        ]
      }),
      book: new Person({
        x: utils.withGrid(2),
        y: utils.withGrid(6),
        src: "/images/characters/people/book.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Raskolnikov's Diary"},
              { type: "textMessage", text: "1859/4/20:"},
              { type: "textMessage", text: "I once envisioned myself to become the next Napolean. Bringing change to this world."},
              { type: "textMessage", text: "As a law student, who excelled in his classes, I thought I was just a few steps away from becoming a historical figure."},
              { type: "textMessage", text: "But then, I was struck with reality. I was poor and could not pay for my tution fee."},
              { type: "textMessage", text: "So, I had to drop out. Now, I am living as no one in St. Petersburg."},
            ]
          }
        ]
      }),
      /*
      axe: new Axe({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        storyFlag: "PICKED_UP_AXE"
      }),
      */
    },
    walls: {
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(5,11)] : true,
      [utils.asGridCoord(6,11)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(1, 4)] : true,
      [utils.asGridCoord(2, 4)] : true,
      [utils.asGridCoord(3, 4)] : true,
      [utils.asGridCoord(4, 4)] : true,
      [utils.asGridCoord(5, 4)] : true,
      [utils.asGridCoord(6, 4)] : true,
      [utils.asGridCoord(7, 4)] : true,
      [utils.asGridCoord(8, 4)] : true,
      [utils.asGridCoord(9, 4)] : true,
      [utils.asGridCoord(10, 4)] : true,
    },
    cutsceneSpaces: {
      /*
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      */
      [utils.asGridCoord(5,9)]: [{
        disqualify: ["SEEN_INTRO"],
        events: [
          { type: "addStoryFlag", flag: "SEEN_INTRO"},
          { type: "textMessage", text: "Hey!"},
          //{ type: "walk", who: "landLady", direction: "down"},
          { type: "stand", who: "landLady", direction: "right", time: 200},
          { type: "stand", who: "hero", direction: "left", time: 200},
          { type: "textMessage", text: "You have to pay your rent! You have not been paying for months now."},
          { type: "textMessage", text: "If you don't pay the rent soon, I will be calling the police!"},
          { type: "textMessage", text: "Poor people like you make this world a horrible place..."},
          { type: "textMessage", text: "You stink."},
          { type: "stand", who: "hero", direction: "down", time: 400},
          { type: "textMessage", text: "* You should probably pay your rent soon. But, you just ignore her anyway. *"},
          { type: "walk", who: "hero", direction: "down"},
          {
            type: "changeMap",
            map: "Street",
            x: utils.withGrid(12),
            y: utils.withGrid(7),
            direction: "down"
          },
        ]
      }],
      [utils.asGridCoord(6,9)]: [{
        disqualify: ["SEEN_INTRO"],
        events: [
          { type: "addStoryFlag", flag: "SEEN_INTRO"},
          { type: "textMessage", text: "Hey!"},
          { type: "walk", who: "landLady", direction: "right"},
          { type: "stand", who: "landLady", direction: "right", time: 200},
          { type: "stand", who: "hero", direction: "left", time: 200},
          { type: "textMessage", text: "You have to pay your rent! You have not been paying for months now."},
          { type: "textMessage", text: "If you don't pay the rent soon, I will be calling the police!"},
          { type: "textMessage", text: "Poor people like you make this world a horrible place..."},
          { type: "textMessage", text: "You stink."},
          { type: "stand", who: "hero", direction: "down", time: 400},
          { type: "textMessage", text: "* You should probably pay your rent soon. But, you just ignore her anyway. *"},
          { type: "walk", who: "hero", direction: "down"},
          {
            type: "changeMap",
            map: "Street",
            x: utils.withGrid(12),
            y: utils.withGrid(7),
            direction: "down"
          },
        ]
      }],
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Street",
              x: utils.withGrid(12),
              y: utils.withGrid(7),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(6,10)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Street",
              x: utils.withGrid(12),
              y: utils.withGrid(7),
              direction: "down"
            }
          ]
        }
      ],
    }
    
  },
  startingRoom1: {
    lowerSrc: "/images/maps/startingRoom.png",
    upperSrc: "/images/maps/startingRoomUpper.png",
    gameObjects: {
      //if()
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      
      /*
      axe: new Axe({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        storyFlag: "PICKED_UP_AXE"
      }),
      */
    },
    walls: {
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(5,11)] : true,
      [utils.asGridCoord(6,11)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(1, 4)] : true,
      [utils.asGridCoord(2, 4)] : true,
      [utils.asGridCoord(3, 4)] : true,
      [utils.asGridCoord(4, 4)] : true,
      [utils.asGridCoord(5, 4)] : true,
      [utils.asGridCoord(6, 4)] : true,
      [utils.asGridCoord(7, 4)] : true,
      [utils.asGridCoord(8, 4)] : true,
      [utils.asGridCoord(9, 4)] : true,
      [utils.asGridCoord(10, 4)] : true,
    },
    cutsceneSpaces: {
      /*
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      */
    
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Street",
              x: utils.withGrid(12),
              y: utils.withGrid(7),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(6,10)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Street",
              x: utils.withGrid(12),
              y: utils.withGrid(7),
              direction: "down"
            }
          ]
        }
      ],
    }
    
  },
  startingRoom2: {
    lowerSrc: "/images/maps/startingRoom.png",
    upperSrc: "/images/maps/startingRoomUpper.png",
    gameObjects: {
      //if()
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      NpcA: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(8),
        direction: "right",
        src: "/images/characters/people/npc4.png",
      }),
      /*
      axe: new Axe({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        storyFlag: "PICKED_UP_AXE"
      }),
      */
    },
    walls: {
      [utils.asGridCoord(0,5)] : true,
      [utils.asGridCoord(0,6)] : true,
      [utils.asGridCoord(0,7)] : true,
      [utils.asGridCoord(0,8)] : true,
      [utils.asGridCoord(0,9)] : true,
      [utils.asGridCoord(2,10)] : true,
      [utils.asGridCoord(3,10)] : true,
      [utils.asGridCoord(4,10)] : true,
      [utils.asGridCoord(5,11)] : true,
      [utils.asGridCoord(6,11)] : true,
      [utils.asGridCoord(7,10)] : true,
      [utils.asGridCoord(8,10)] : true,
      [utils.asGridCoord(9,10)] : true,
      [utils.asGridCoord(10,10)] : true,
      [utils.asGridCoord(11,5)] : true,
      [utils.asGridCoord(11,6)] : true,
      [utils.asGridCoord(11,7)] : true,
      [utils.asGridCoord(11,8)] : true,
      [utils.asGridCoord(11,9)] : true,
      [utils.asGridCoord(1, 4)] : true,
      [utils.asGridCoord(2, 4)] : true,
      [utils.asGridCoord(3, 4)] : true,
      [utils.asGridCoord(4, 4)] : true,
      [utils.asGridCoord(5, 4)] : true,
      [utils.asGridCoord(6, 4)] : true,
      [utils.asGridCoord(7, 4)] : true,
      [utils.asGridCoord(8, 4)] : true,
      [utils.asGridCoord(9, 4)] : true,
      [utils.asGridCoord(10, 4)] : true,
    },
    cutsceneSpaces: {
      /*
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      */
    
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Street",
              x: utils.withGrid(12),
              y: utils.withGrid(7),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(6,10)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Street",
              x: utils.withGrid(12),
              y: utils.withGrid(7),
              direction: "down"
            }
          ]
        }
      ],
    }
    
  },
  Street: {
    lowerSrc: "/images/maps/streetLower.png",
    upperSrc: "/images/maps/streetUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(12),
        y: utils.withGrid(7),
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hey have you read Crime and Punishment?", faceHero:"npcB" },
            ]
          }
        ]
      })
    },
    cutsceneSpaces: {
      [utils.asGridCoord(12,6)]: [
        {
          events: [
            { type: "changeMap", 
              map: "startingRoom1",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(4,8)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Inn",
              x: utils.withGrid(19),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(5,8)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Inn",
              x: utils.withGrid(20),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(27,8)]: [
        {
          events: [
            { type: "changeMap", 
              map: "YardKeeperHouse",
              x: utils.withGrid(6),
              y: utils.withGrid(12),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(22,4)]: [
        {
          events: [
            { type: "changeMap", 
              map: "House",
              x: utils.withGrid(6),
              y: utils.withGrid(12),
              direction: "up"
            }
          ]
        }
      ],
    }
  },
  Inn: {
    lowerSrc: "/images/maps/innLower.png",
    upperSrc: "/images/maps/innUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      /*
      axe: new Axe({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        storyFlag: "PICKED_UP_AXE"
      }),
      */
      Sonya: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc1.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hi! I am Sonya.", faceHero:"Sonya" },
              { type: "textMessage", text: "I am the eldest daughter of Katerina and Marmeladov.", faceHero:"Sonya" },
              { type: "textMessage", text: "After my mom’s many beatings and complaints that I do not support the family financially, I had to resort to prostitution to support my family.", faceHero:"Sonya" },
              { type: "textMessage", text: "I am often mistreated in this society, but I guess there is nothing I can do as I have no money...", faceHero:"Sonya" },
            ]
          }
        ]
      }),
      Marmeladov: new Person({
        x: utils.withGrid(11),
        y: utils.withGrid(4),
        src: "/images/characters/people/npc2.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hey! (sounds drunk)", faceHero:"Marmeladov" },
              { type: "textMessage", text: "Yoouuu must bee new here! I have never seen you around. I come here very often.", faceHero:"Marmeladov" },
              { type: "textMessage", text: "Yoouuu must bee new here! I have never seen you around. I come here very often.", faceHero:"Marmeladov" },
              { type: "textMessage", text: "I used to be a former government official, but after becoming an alcoholic, I have destroyed my own family.", faceHero:"Marmeladov" },
              { type: "textMessage", text: "I need to help my wife, but I can not…", faceHero:"Marmeladov" },
            ]
          }
        ]
      }),
      Katerina: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(6),
        src: "/images/characters/people/erio.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hi, I am Katerina.", faceHero:"Katerina" },
              { type: "textMessage", text: "I am the mother of four children. My husband is a drunk who never comes home.", faceHero:"Katerina" },
              { type: "textMessage", text: "We have no money, scarce amounts of food. I am slowly going insane.", faceHero:"Katerina" },
              { type: "textMessage", text: "Sometimes I beat my children as I am so frustrated and mad about how unfair this world is.", faceHero:"Katerina" },
              { type: "textMessage", text: "I hope to see you around.", faceHero:"Katerina" },
            ]
          }
        ]
      }),
      Razumikhin: new Person({
        x: utils.withGrid(4),
        y: utils.withGrid(6),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hi, I’m Razumikhin. I am Raskolnikov’s friend.", faceHero:"Razumikhin" },
              { type: "textMessage", text: "We became friends because we were both extremely poor when we were studying at university.", faceHero:"Razumikhin" },
              { type: "textMessage", text: "We both struggled to pay for our tuition, so we ended up dropping out.", faceHero:"Razumikhin" },
              { type: "textMessage", text: "I have plenty of memories with him, struggling in poverty but always supporting each other.", faceHero:"Razumikhin" },
            ]
          }
        ]
      }),
      Dunya: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc4.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "Hello. My name is Dunya. I am Raskolnikov’s sister.", faceHero:"Dunya" },
              { type: "textMessage", text: "Currently, I am looking to marry a man named Luzhin. But, I am not necessarily looking forward to this marriage.", faceHero:"Dunya" },
              { type: "textMessage", text: "I am only marrying him to support my family and help my brother get a job.", faceHero:"Dunya" },
            ]
          }
        ]
      }),
    },
    walls: {
      
    },
    cutsceneSpaces: {
      /*
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      */
      [utils.asGridCoord(19,10)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Street",
              x: utils.withGrid(4),
              y: utils.withGrid(8),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(20,10)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Street",
              x: utils.withGrid(5),
              y: utils.withGrid(8),
              direction: "down"
            }
          ]
        }
      ]
    }
  },
  YardKeeperHouse: {
    lowerSrc: "/images/maps/yardKeeperHouse.png",
    upperSrc: "/images/maps/yardKeeperHouseUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      
      axe: new Axe({
        x: utils.withGrid(6),
        y: utils.withGrid(4),
        storyFlag: "PICKED_UP_AXE"
      }),
      
    },
    walls: {
      
    },
    cutsceneSpaces: {
      /*
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      */
      [utils.asGridCoord(6,12)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Street",
              x: utils.withGrid(27),
              y: utils.withGrid(9),
              direction: "down"
            }
          ]
        }
      ],
    }
  },
  HouseBlood : {
    lowerSrc: "/images/maps/yardKeeperHouseBlood.png",
    upperSrc: "/images/maps/yardKeeperHouseUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      
      
      
    },
    walls: {
      
    },
    
  },
  House: {
    lowerSrc: "/images/maps/yardKeeperHouse.png",
    upperSrc: "/images/maps/yardKeeperHouseUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(6),
      }),
      
      Anlyona: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        direction: "down",
        src: "/images/characters/people/npc8.png",
        talking: [
          {
            required: ["PICKED_UP_AXE"],
            events: [
              { type: "textMessage", text: "* You swing your axe. *",},
              { 
                type: "changeMap", 
                map: "HouseBlood",
                x: utils.withGrid(6),
                y: utils.withGrid(7),
                direction: "up"
              },
              { type: "textMessage", text: "* You cut right through her neck... *",},
              { type: "textMessage", text: "* You quickly clean up the mess and run away in fear",},
              
              { type: "changeMap", 
              map: "startingRoom1",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up"
              },
              { type: "textMessage", text: "* Feeling sick, you go to bed... *",},
              { type: "changeMap", 
              map: "startingRoom2",
              x: utils.withGrid(8),
              y: utils.withGrid(8),
              direction: "left"
              },
              { type: "textMessage", text: "* You wake up feeling extremely confused and disoriented. *"},
              { type: "textMessage", text: "Hey! You are awake. You have been out for 24 hours."},
              { type: "textMessage", text: "I'm so sorry to tell you this, but the police are looking for you. You should go visit them."},
            ],
          }
        ]
      })
      
    },
    walls: {
      
    },
    cutsceneSpaces: {
      /*
      [utils.asGridCoord(7,4)]: [
        {
          events: [
            { who: "npcB", type: "walk",  direction: "left" },
            { who: "npcB", type: "stand",  direction: "up", time: 500 },
            { type: "textMessage", text:"You can't be in there!"},
            { who: "npcB", type: "walk",  direction: "right" },
            { who: "hero", type: "walk",  direction: "down" },
            { who: "hero", type: "walk",  direction: "left" },
          ]
        }
      ],
      */
      [utils.asGridCoord(6,12)]: [
        {
          events: [
            { type: "changeMap", 
              map: "Street",
              x: utils.withGrid(27),
              y: utils.withGrid(9),
              direction: "down"
            }
          ]
        }
      ],
    }
  },
  
}