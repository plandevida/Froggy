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
  tortuga: { sx: 0, sy: 239, w: 48, h: 48, frames: 5},
  none: { sx: 144, sy: 96, w: 48, h: 48, frames: 1}
};

var config = {
  lineaUnoCarretera: { vx: -70, x: 320, y: 384, freq: 3.3 },
  lineaDosCarretera: { vx: -90, x: 320, y: 336, freq: 3 },
  lineaTresCarretera: { vx: 60, x: 0, y: 288, freq: 3.7 },
  lineaCuatroCarretera: { vx: -80, x: 320, y: 240, freq: 4 },
  lineaUnoAgua: { vx: -70, x: 320, y: 144, freq: 4 },
  lineaDosAgua: { vx: 50, x: 0, y: 96, freq: 6 },
  lineaTresAgua: { vx: -80, x: 320, y: 48, freq: 3.5}
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

  var juego = new GameBoard(OBJECT_PLAYER);
  juego.add(new Spawner(config.lineaUnoCarretera, new Coche('car1')));
  juego.add(new Spawner(config.lineaDosCarretera, new Coche('car4')));
  juego.add(new Spawner(config.lineaTresCarretera, new Coche('car5'), new Coche('car2')));
  juego.add(new Spawner(config.lineaCuatroCarretera, new Coche('car3')));
  juego.add(new Spawner(config.lineaUnoAgua, new Trunk()));
  juego.add(new Spawner(config.lineaDosAgua, new Trunk(-125)));
  juego.add(new Spawner(config.lineaTresAgua, new Trunk()));
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

var Coche = function(image) {

  this.setup(image);

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
    }
};

var Trunk = function(x, y) {
  this.setup( 'trunk' );

  this.x = x;
  this.y = y;

  this.step = function(dt) {
    this.x += this.vx * dt;

    var posicionEntidad = this.x + this.w;
    var posicionEliminacion = Game.width + (this.w * 1.5);

    if ( (posicionEntidad < 0) || (posicionEntidad > posicionEliminacion)) {
      this.board.remove(this);
    }
  };
};
Trunk.prototype = new Sprite();
Trunk.prototype.type = OBJECT_PLATFORM;

var Tortuga = function() {
  this.setup('tortuga');

  this.step = function() {

  };
};
Tortuga.prototype = new Sprite();

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

  // tiempo que trascurre desde que se crea un objeto
  // hasta que se vuelve a crear el siguiente
  this.timeAcumulated = config.freq;

  // configuración de los objetos que se van a crear
  this.configuracion = config;

  // lista de elementos para esta configuración
  this.elementos = new Array();

  // el número de elementos de la lista
  this.numElems = arguments.length-1;

  // el indice de elemento que se va a crear
  // cada vez
  this.elementoAsalir = 0;

  for ( var i in arguments) {

    var elem = arguments[i];

    // Solo metemos en el board los objetos
    // que se pintan en el juego.
    if ( elem instanceof Sprite ) {

      // Configuramos el elemento que se va a poner el en 
      // board con la propiedades que le corresponden
      if(this.configuracion) {
        for (var prop in this.configuracion) {

          if ( !elem[prop] ) {
            elem[prop] = this.configuracion[prop];
          }
        }
      }
      this.elementos.push(elem);
    }
  }

  this.step = function(dt) {

    this.timeAcumulated += dt;

    if ( this.timeAcumulated >= config.freq ) {

      // de la lista de objetos que se ejecutan en
      // esta posición y configuración obtenemos al que
      // le toca aparecer
      var objeto = this.elementos[this.elementoAsalir];

      // se crea el objeto y se inserta en el gameboard
      this.board.add( Object.create( objeto ) );
      this.timeAcumulated = 0;

      // si se han creado ya todos los elementos
      // de esa posición, se vuelve a empezar la lista
      if ( this.elementoAsalir < this.numElems-1 ) {
        this.elementoAsalir++;
      }
      else {
        this.elementoAsalir = 0;
      }
    }
  };

  this.draw = function(ctx) {
    // no hace nada
  };
};

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});
