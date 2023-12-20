const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const GROUND_LEVEL = 300;
const OBSTACLE_SIZE = 40;
const BIRD_SIZE = 40;
const DINO_SIZE = 80;
const DINO_X = 50;


const DINO_IMAGE = new Image()
DINO_IMAGE.src = "dino.png"
const BIRD_IMAGE = new Image()
BIRD_IMAGE.src = "bird.png"
const OBSTACLE_IMAGE = new Image()
OBSTACLE_IMAGE.src = "obstacle.png"

class Entity {
  constructor(x, y, width, height, image) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
  }

  draw(context) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height)
    //draw hitbox (comme minecraft)
    context.strokeStyle = "#ff000050"
    context.lineWidth = 2;
    context.strokeRect(this.x, this.y, this.width, this.height)
  }
}

class Dino extends Entity {
  constructor(x, y) {
    super(x, y, DINO_SIZE, DINO_SIZE, DINO_IMAGE)
    this.jumpVelocity = 0;
    this.trail = [];
  }

  update() {
    this.y += this.jumpVelocity;
    this.jumpVelocity += 1;

    if (this.y > GROUND_LEVEL) {
      this.y = GROUND_LEVEL;
    }

    this.trail.forEach(t => {
      t.x -= 5
    })

    this.trail.push({ x: this.x, y: this.y })
    if (this.trail.length > 20) {
      this.trail.shift()
    }
  }

  draw(context) {
    context.fillStyle = "#aaaaaa";
    this.trail.forEach((pos) => {
      context.fillRect(pos.x + this.width / 2, pos.y + this.height / 2, 5, 5)
    })
    super.draw(context)

  }

  jump() {
    if (this.y === GROUND_LEVEL) {
      this.jumpVelocity = -20;
    }
  }

}
class Bird extends Entity {
  constructor(x, speed) {
    super(x, GROUND_LEVEL - DINO_SIZE, BIRD_SIZE, BIRD_SIZE, BIRD_IMAGE)
    this.speed = speed;
    this.time = 0;

  }
  update() {
    this.x -= this.speed;
    this.y += Math.sin(this.time) * 1.5
    this.time += 0.1

  }

}
class Obstacle extends Entity {
  constructor(x, speed) {
    super(x, GROUND_LEVEL + OBSTACLE_SIZE, OBSTACLE_SIZE, OBSTACLE_SIZE, OBSTACLE_IMAGE)
    this.speed = speed;
  }
  update() {
    this.x -= this.speed;
  }
}

const collides = (entity1, entity2) => {
  return (
    entity1.x < entity2.x + entity2.width &&
    entity1.x + entity1.width > entity2.x &&
    entity1.y < entity2.y + entity2.height &&
    entity1.y + entity1.height > entity2.y
  )
}

class Game {
  constructor(context) {
    this.context = context;
    this.dino = new Dino(DINO_X, GROUND_LEVEL);
    this.entities = [this.dino];
    this.score = 0;
    this.speed = 5;
    this.play = true;

    this.spawnObscacle()

    document.addEventListener('keydown', () => {
      console.log('keydown');
      this.dino.jump()
    })

    this.scoreInterval = setInterval(() => {
      this.increaseScore()
    }, 100);
    this.speedInterval = setInterval(() => {
      this.increaseSpeed()
    }, 1000);

  }//end constructor

  increaseScore() {
    this.score++
  }

  increaseSpeed() {
    this.speed += 0.1;
  }

  spawnObscacle() {
    if (Math.random() < 0.5) {
      this.entities.push(new Obstacle(GAME_WIDTH, this.speed))
    } else {
      this.entities.push(new Bird(GAME_WIDTH, this.speed))
    }

    setTimeout(() => {
      if(this.play){
        this.spawnObscacle()
      }
    }, Math.max(500, 2000 - this.speed * 20))
  }

  update() {
    this.context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.drawScore()
    this.context.fillStyle = "green";
    this.context.fillRect(0, GROUND_LEVEL + DINO_SIZE, GAME_WIDTH, GAME_HEIGHT - (GROUND_LEVEL + DINO_SIZE))

    //affiche les différents éléments en continue 
    this.entities.forEach(entity => {
      entity.update();
      entity.draw(this.context);
    })
    const isCollides = this.entities.some(entity => {
      if (entity === this.dino) return false;
      return collides(this.dino, entity)
    })

    if (isCollides) {
      this.play = false;
      clearInterval(this.scoreInterval);
      clearInterval(this.speedInterval);
    }
  }

  drawScore() {
    this.context.font = '20px Arial'
    this.context.fillStyle = "#000000"
    this.context.fillText(`Score: ${this.score}`, 10, 30)
  }
}


const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

const game = new Game(context)

const frame = () => {
  if (game.play) {
    game.update();
    requestAnimationFrame(frame)
  } else {
    context.font = "64px Arial";
    context.fillStyle = '#ff0000'
    context.fillText('GAME OVER', GAME_WIDTH / 4, GAME_HEIGHT / 2)
  }
}

requestAnimationFrame(frame)

// Window.requestAnimationFrame()
// La méthode window.requestAnimationFrame() indique au navigateur qu'on souhaite exécuter une animation et demande que celui-ci exécute une fonction spécifique de mise à jour de l'animation, avant le prochain rafraîchissement à l'écran du navigateur => but que l'animation soit dynamique