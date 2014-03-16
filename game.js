var sprites = {
  frog: { sx: 0, sy: 0, w: 48, h: 48, frames: 1 },
  bg: { sx: 433, sy: 0, w: 320, h: 480, frames: 1 },
  car1: { sx: 143, sy: 0, w: 48, h: 48, frames: 1 },
  car2: { sx: 192, sy: 0, w: 48, h: 48, frames: 1 },  
  car3: { sx: 239, sy: 0, w: 96, h: 48, frames: 1 },
  car4: { sx: 335, sy: 0, w: 48, h: 48, frames: 1 },
  car5: { sx: 383, sy: 0, w: 48, h: 48, frames: 1 },
  trunk: { sx: 287, sy: 383, w: 144, h: 48, frames: 1 },
  death: { sx: 0, sy: 143, w: 48, h: 48, frames: 4 }
};

/*
var enemies = {
  cocheAmarillo: { x: 368,   y: 400, sprite: 'car1', A: -100 },
  cocheRosa:     { x: 0,   y: 350, sprite: 'car4', A: -100 },
  cocheBlanco:   { x: 250, y: 300, sprite: 'car5', A: -100 },
  tractor:       { x: 100, y: -50, sprite: 'car2', health: 20, 
                  B: 50, C: 4, E: 100, firePercentage: 0.001, missiles: 2 },
  camion:        { x: 0,   y: -50, sprite: 'car3', health: 10,
                  B: 150, C: 1.2, E: 75 },
  tronco         { x: 0,   y: -50, sprite: 'trunk', health: 10,
                  B: 150, C: 1.2, E: 75 },
};
*/

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16;

var startGame = function() {

  Game.setBoard(3,new TitleScreen("Frogger", "Press spacebar to start playing", playGame));

  //playGame();
};

var playGame = function() {

  Game.setBoard(3, undefined);

  var board = new GameBoard();
  board.add(new Background());
  Game.setBoard(0, board);

  var juego = new GameBoard();
  juego.add(new Frog());
  juego.add(new CocheAmarillo());
  juego.add(new CocheRosa());
  juego.add(new CocheBlanco());
  juego.add(new Tractor());
  juego.add(new Camion());
  juego.add(new Trunk());
  Game.setBoard(1, juego);
};

var winGame = function() {
  Game.setBoard(3,new TitleScreen("You win!", 
                                  "Press spacebar to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(3,new TitleScreen("You lose!", 
                                  "Press spacebar to play again",
                                  playGame));
};

var Background = function() {
  this.setup('bg');

  this.reload = this.reloadTime;
  this.x = 0;
  this.y = 0;

  this.step = function(dt) {};
};
Background.prototype = new Sprite();

var Frog = function() {
  this.setup('frog', { reloadTime: 0.08, maxVel: 50 });

  this.reload = this.reloadTime;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - this.h;

  this.step = function(dt) {

    this.reload -= dt;

    if( this.reload <= 0) {
      if (Game.keys['left']) {
        this.x -= this.w;
      }
      else if (Game.keys['right']) {
        this.x += this.w;
      }
      else if (Game.keys['up']) {
        this.y -= this.w;
      }
      else if (Game.keys['down']) {
        this.y += this.w;
      }

      this.reload = this.reloadTime;
    }

    if(this.x < 0) { this.x = 0; }
    else if(this.x > Game.width - this.w) { 
      this.x = Game.width - this.w;
    }
    if(this.y < 0) { this.y = 0; winGame(); }
    else if(this.y > Game.height - this.h) { 
      this.y = Game.height - this.h;
    }
  };
};
Frog.prototype = new Sprite();
Frog.prototype.type = OBJECT_PLAYER;
Frog.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    loseGame();
  }
};

var Coche = function() {
  this.x = 0;
  this.y = 0;
};
Coche.prototype = new Sprite();
Coche.prototype.step = function(dt) {
    this.x += this.vx * dt;

    var collision = this.board.collide(this,OBJECT_PLAYER);
    if(collision) {
      collision.hit(this.damage);
      this.board.remove(this);
    }

    var posicionEntidad = this.x + this.w;
    var posicionEliminacion = Game.width + (this.w * 1.5);

    if ( (posicionEntidad < 0) || (posicionEntidad > posicionEliminacion)) {
      this.board.remove(this);
      console.log("entidad eliminada ");
    }
};
Coche.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      Game.points += this.points || 100;
      this.board.add(new Explosion(this.x + this.w/2, 
                                   this.y + this.h/2));
    }
  }
};

var CocheAmarillo = function() {
  this.setup('car1', { vx: -50 });

  this.x = Game.width;
  this.y = 384;

};
CocheAmarillo.prototype = new Coche();

var CocheRosa = function() {
  this.setup('car4', { vx: -80 });

  this.x = Game.width;
  this.y = 336;

};
CocheRosa.prototype = new Coche();

var CocheBlanco = function() {
  this.setup('car5', { vx: 60 });

  this.x = -this.w;
  this.y = 288;

};
CocheBlanco.prototype = new Coche();

var Tractor = function() {
  this.setup('car2', { vx: 30 });

  this.x = -this.w;
  this.y = 240;

};
Tractor.prototype = new Coche();

var Camion = function() {
  this.setup('car3', { vx: -40 });

  this.x = Game.width;
  this.y = 336;

};
Camion.prototype = new Coche();

var Trunk = function() {
  this.setup( 'trunk', { vx: -70 });

  this.x = Game.width;
  this.y = 48;

  this.step = function(dt) {
    this.x += this.vx * dt;

    var collision = this.board.collide(this,OBJECT_PLAYER);
    if(collision) {
      collision.x = this.x;
    }

    var posicionEntidad = this.x + this.w;
    var posicionEliminacion = Game.width + (this.w * 1.5);

    /*if ( (posicionEntidad < 0) || (posicionEntidad > posicionEliminacion)) {
      this.board.remove(this);
      console.log("entidad eliminada ");
    }*/
  };
};
Trunk.prototype = new Sprite();

var Enemy = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0, reloadTime: 0.75, 
                                   reload: 0 };

Enemy.prototype.step = function(dt) {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

  this.x += this.vx * dt;
  this.y += this.vy * dt;

  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }

  if(Math.random() < 0.01 && this.reload <= 0) {
    this.reload = this.reloadTime;
    if(this.missiles == 2) {
      this.board.add(new EnemyMissile(this.x+this.w-2,this.y+this.h));
      this.board.add(new EnemyMissile(this.x+2,this.y+this.h));
    } else {
      this.board.add(new EnemyMissile(this.x+this.w/2,this.y+this.h));
    }

  }
  this.reload-=dt;

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      Game.points += this.points || 100;
      this.board.add(new Explosion(this.x + this.w/2, 
                                   this.y + this.h/2));
    }
  }
};

var EnemyMissile = function(x,y) {
  this.setup('enemy_missile',{ vy: 200, damage: 10 });
  this.x = x - this.w/2;
  this.y = y;
};

EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;

EnemyMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_PLAYER)
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y > Game.height) {
      this.board.remove(this); 
  }
};



var Explosion = function(centerX,centerY) {
  this.setup('explosion', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt) {
  this.frame++;
  if(this.frame >= 12) {
    this.board.remove(this);
  }
};

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});


