var sprites = {
  frog: { sx: 0, sy: 0, w: 48, h: 48, frames: 1 },
  bg: { sx: 433, sy: 0, w: 320, h: 480, frames: 1 },
  car1: { sx: 143, sy: 0, w: 48, h: 48, frames: 1 },
  car2: { sx: 192, sy: 0, w: 48, h: 48, frames: 1 },
  car3: { sx: 239, sy: 0, w: 96, h: 48, frames: 1 },
  car4: { sx: 335, sy: 0, w: 48, h: 48, frames: 1 },
  car5: { sx: 383, sy: 0, w: 48, h: 48, frames: 1 },
  trunk: { sx: 297, sy: 383, w: 125, h: 48, frames: 1 },
  death: { sx: 0, sy: 143, w: 48, h: 48, frames: 4 },
  deathroad: { sx: 0, sy: 191, w: 48, h: 48, frames: 4},
  none: { sx: 144, sy: 96, w: 48, h: 48, frames: 1}
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

var config = {
  lineaUnoCoches: { vx: new Number(-50), x: new Number(320), y: new Number(384), sprite: new String('car1'), freq: new Number(2.5) }
};

var OBJECT_PLAYER = 1,
    OBJECT_ENEMY = 2,
    OBJECT_PLATFORM = 4,
    OBJECT_WATER = 8;

var gameStoped = false;

var startGame = function() {

  Game.setBoard(3,new TitleScreen("Frogger", "Press spacebar to start playing", true, playGame));
};

var playGame = function() {

  Game.setBoard(3, undefined);

  gameStoped = false;

  var board = new GameBoard();
  board.add(new Background());
  Game.setBoard(0, board);

  var juego = new GameBoard();
  juego.add(new Spawner(config.lineaUnoCoches, new Coche()));
  juego.add(new Trunk(Game.width, 48));
  juego.add(new Trunk(Game.width+20, 96));
  juego.add(new Trunk(Game.width+40, 144));
  juego.add(new Water());
  juego.add(new Frog());
  Game.setBoard(1, juego);
};

var winGame = function() {
  gameStoped = true;
  Game.setBoard(3,new TitleScreen("You win!", 
                                  "Press spacebar to play again",
                                  false,
                                  playGame));
};

var loseGame = function() {
  gameStoped = true;
  Game.setBoard(3,new TitleScreen("You lose!", 
                                  "Press spacebar to play again",
                                  false,
                                  playGame));
};

var Background = function() {
  this.setup('bg');

  this.x = 0;
  this.y = 0;

  this.step = function(dt) {};
};
Background.prototype = new Sprite();

var Frog = function() {
  this.setup('frog', { vx: 0 });

  this.keydelay = false;
  this.tronco = false;

  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - this.h;

  this.timeout = function() {

    var self = this;
    setTimeout(function() {
      self.keydelay = false;
    }, 140);
  };

  this.step = function(dt) {

    if ( !gameStoped ) {
      this.x += this.vx * dt;

      this.collision = this.board.collide(this, OBJECT_PLATFORM);
      if ( this.collision ) {
        this.tronco = true;
        this.vx = this.collision.vx;
      }
      else {
        this.tronco = false;
        this.vx = 0;
      }

      if ( !this.tronco ) {
        this.collision = this.board.collide(this, OBJECT_WATER);
        if ( this.collision) {
          this.hit();
        }
      }

      if ( !this.keydelay ) {
        if (Game.keys['left']) {
          this.x -= this.w;
          this.keydelay = true;

          this.timeout();
        }
        else if (Game.keys['right']) {
          this.x += this.w;
          this.keydelay = true;

          this.timeout();
        }
        else if (Game.keys['up']) {
          this.y -= this.w;
          this.keydelay = true;

          this.timeout();
        }
        else if (Game.keys['down']) {
          this.y += this.w;
          this.keydelay = true;

          this.timeout();
        }
      }

      if(this.x < 0) { this.x = 0; }
      else if(this.x > Game.width - this.w) { 
        this.x = Game.width - this.w;
      }
      if(this.y <= 30) {
        this.y = 0;
        winGame();
      }
      else if(this.y > Game.height - this.h) { 
        this.y = Game.height - this.h;
      }
    }
  };
};
Frog.prototype = new Sprite();
Frog.prototype.collision = undefined;
Frog.prototype.type = OBJECT_PLAYER;
Frog.prototype.hit = function(damage) {

  if(this.board.remove(this)) {

    // La rana se ahoga sobre el agua
    if ( this.collision instanceof Water) {
      this.board.add(new AhogaRana(this.x + (this.w/2), this.y + (this.h/2)));
    }
    // La rana muere si colisona
    else {
      this.board.add(new MuerteRana(this.x + (this.w/2), this.y + (this.h/2)));
    }
  }
};

//var Coche = function(sprite, velocidad, posx, posy) {
  var Coche = function(props) {
  
  this.setup(props.sprite, props);
  
  /*
  this.merge( { sprite:'none', vx:0, x:0, y:0, w:48, h:48 } );
  this.setup(blueprints.sprite, blueprints);
  this.merge(override);
  */
};
Coche.prototype = new Sprite();
Coche.prototype.step = function(dt) {
    this.x += this.vx * dt;

    var collision = this.board.collide(this,OBJECT_PLAYER);
    if(collision) {
      collision.hit(this.damage);
    }

    var posicionEntidad = this.x + this.w;
    var posicionEliminacion = Game.width + (this.w * 1.5);

    if ( (posicionEntidad < 0) || (posicionEntidad > posicionEliminacion)) {
      this.board.remove(this);
      //console.log("entidad eliminada ");
    }
};
Coche.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      //this.board.add(new Explosion(this.x + this.w/2, this.y + this.h/2));
    }
  }
};

/*
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
*/
var Trunk = function(x, y) {
  this.setup( 'trunk', { vx: -70 });

  this.x = x;
  this.y = y;

  this.step = function(dt) {
    this.x += this.vx * dt;

    var posicionEntidad = this.x + this.w;
    var posicionEliminacion = Game.width + (this.w * 1.5);

    if ( (posicionEntidad < 0) || (posicionEntidad > posicionEliminacion)) {
      this.board.remove(this);
      console.log("entidad eliminada ");
    }
  };
};
Trunk.prototype = new Sprite();
Trunk.prototype.type = OBJECT_PLATFORM;

var Water = function() {

  this.setup( 'none', {} );

  this.x = 0;
  this.y = 48;
  this.w = Game.width;
  this.h = 142;

  this.draw = function(ctx) { };
  this.step = function(dt) { };
};
Water.prototype = new Sprite();
Water.prototype.type = OBJECT_WATER;

var MuerteRana = function(centerX, centerY) {
  this.setup('deathroad', { frame: 0 } );

  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;

  this.frameDelay = 8;
  this.subframe = 0;
};
MuerteRana.prototype = new Sprite();
MuerteRana.prototype.step = function(dt) {
  this.frame = Math.floor(this.subframe++ / this.frameDelay);
  if ( this.frame > 4) {
    if(this.board.remove(this)) {
      loseGame();
    }
  }
}

var AhogaRana = function(centerX, centerY) {
  this.setup('death', { frame: 4 } );

  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;

  this.frameDelay = 8;
  this.subframe = 3 * this.frameDelay;
};
AhogaRana.prototype = new Sprite();
AhogaRana.prototype.step = function(dt) {
  this.frame = Math.floor(this.subframe-- / this.frameDelay);
  if ( this.frame < 0) {
    if(this.board.remove(this)) {
      loseGame();
    }
  }
};

var Spawner = function(config, obj) {

  this.timeAcumulated = config.freq;

  this.step = function(dt) {

    this.timeAcumulated += dt;

    if ( this.timeAcumulated >= config.freq ) {
      this.board.add( Object.create(obj, config) );
      this.timeAcumulated = 0;
    }
  };

  this.draw = function(ctx) {};
};

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});
