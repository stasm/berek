(function(window, undefined) {

	var Config = {
		bindings: {
            'p1-right': 'RIGHT_ARROW',
            'p1-left': 'LEFT_ARROW',
            'p1-up': 'UP_ARROW',
            'p2-right': 'D',
            'p2-left': 'A',
            'p2-up': 'W',
            'halt': 'SPACE',
		},
        debug: true,
	};
    function Debug() {
        this._fps = document.getElementById('fps');
        this._frame_time = document.getElementById('frame-time');
        this._accumulator = document.getElementById('accumulator');
    };
    Debug.prototype = {
        _fps: null,
        _frame_time: null,
        _accumulator: null,

        fps: function fps() {
            return 1000 / Game._frame_time;
        },
        display: function display() {
            this._fps.innerHTML = this.fps();
            this._frame_time.innerHTML = Game._frame_time;
            this._accumulator.innerHTML = Game._accumulator;
        },
        check_for_halt: function check_for_halt() {
            if (Input.current('halt'))
                Game.pause();
        },
    }
	var System = {
        debug: null,
		fps: 60,
        tick: null,
		width: 480,
		height: 320,
		viewport: null,
		ctx: null,

		init: function init() {
			this.initViewport();
			this.initContext();
			this.readConfig(Config);
            this.debug = new Debug();
            this.tick = 1000 / this.fps;
			Input.initKeyboard();
			Game.init();
		},
		initViewport: function initViewport() {
			this.viewport = document.getElementById('viewport');
			this.viewport.width = this.width;
			this.viewport.height = this.height;
		},
		initContext: function initContext() {
			this.ctx = this.viewport.getContext('2d');
		},
		readConfig: function readConfig(config) {
			for (action in config.bindings) {
				var key = config.bindings[action];
				Input.bind(key, action);
			}
		},
	};

	var Input = {
		keys: {
            'SPACE': 32,
			'LEFT_ARROW': 37,
			'UP_ARROW': 38,
			'RIGHT_ARROW': 39,
			'DOWN_ARROW': 40,
			'A': 65,
			'D': 68,
			'S': 83,
			'W': 87,
		},
		bindings: {},
		current_actions: {},
		initKeyboard: function() {
			window.addEventListener('keydown', this.keydown.bind(this), false);
			window.addEventListener('keyup', this.keyup.bind(this), false);
		},
		keydown: function(event) {
			var code = event.keyCode;
			var action = this.bindings[code];
			if (action) {
				this.current_actions[action] = true;
				event.stopPropagation();
				event.preventDefault();
			}
		},
		keyup: function(event) {
			var code = event.keyCode;
			var action = this.bindings[code];
			if (action) {
				this.current_actions[action] = false;
				event.stopPropagation();
				event.preventDefault();
			}
		},
		bind: function(key, action) {
			var code = this.keys[key];
			this.bindings[code] = action;
		},
		current: function(action) {
			return this.current_actions[action];
		},
	};

	var Game = {
        _map: null,
        _collision_map: null,
		_entities: [],
		_interval: null,
        _frame_time: null,
        _current_time: null,
        _accumulator: null,

		init: function init() {
            // map
            this._map = new Map();
            this._collision_map = new CollisionMap();
            // entities
			this._entities.push(new Entity('p1', 384, 64,
                                           'assets/blue-right.png',
                                           'assets/blue-left.png'));
			this._entities.push(new Entity('p2', 64, 64,
                                           'assets/red-right.png',
                                           'assets/red-left.png'));
            // go
            this._current_time = Date.now();
            this.start();
		},
        start: function start() {
			this._interval = window.setInterval(this.loop.bind(this), 1000 / System.fps);
        },
        pause: function pause() {
            window.clearInterval(this._interval);
        },
        clear: function clear() {
			var ctx = System.ctx;
			ctx.fillStyle = 'rgba(255,255,255,0.2)';
			ctx.fillRect(0, 0, System.width, System.height);
        },
		loop: function loop() {
            if (Config.debug) {
                System.debug.display();
                System.debug.check_for_halt();
            }
            var _previous_time = this._current_time;
            this._current_time = Date.now();
            this._frame_time = this._current_time - _previous_time;
            this._accumulator += this._frame_time;
            while (this._accumulator >= System.tick) {
                this.integrate();
                this._accumulator -= System.tick;
                if (Config.debug) {
                    System.debug.display();
                }
            }
            this.render();
		},
        integrate: function integrate() {
            for (var i=0, entity; entity = this._entities[i]; i++) {
                entity.integrate();
            }
        },
        render: function render() {
            this.clear();
            this._map.render();
            for (var i=0, entity; entity = this._entities[i]; i++) {
                entity.render();
            }
        },
	};

    var Gravity = {
        constant: 16, // pixels per square second
        anti: 8,
        pull: function pull(entity) {
            if (entity.is_jumping())
                // gravity only pulls objects that are in the air
                entity.vel.y += this.constant;
        }
    };

    function Viewport() {
    };

    Viewport.prototype = {
        // clear
        // scroll
        // parallax
    };

    function Map() {
    };

    Map.prototype = {
        tile_size: {
            x: 16,
            y: 16,
        },
        tiles: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
            [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1],
            [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
            [1,1,1,1,1,0,0,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ],
        render_tile: function render_tile(code, i, j) {
			var ctx = System.ctx;
            var fill = 255 - code * 66;
			ctx.fillStyle = 'rgb('+fill+','+fill+','+fill+')';
			ctx.fillRect(i * this.tile_size.x, j * this.tile_size.y,
                         this.tile_size.x, this.tile_size.y);
        },
        render: function render() {
            for (var i=0; i < System.width / this.tile_size.x; i++) {
                for (var j=0; j < System.height / this.tile_size.y; j++) {
                    this.render_tile(this.tiles[j][i], i, j);
                };
            };
        },
    };
    
    function CollisionMap() {
    };

    CollisionMap.prototype = {
        tile_size: Map.prototype.tile_size,
        tiles: Map.prototype.tiles, // same as Map for now
        detect: function detect(entity) {
            i = Math.floor(entity.pos.x / this.tile_size.x);
            j = Math.floor(entity.pos.y / this.tile_size.y);
            if (this.tiles[j][i]) {
                return true;
            }
            if (this.tiles[j][i+1]) {
                return true;
            }
            if (this.tiles[j+1][i]) {
                if (entity.prev_pos.y < entity.pos.y) {
                    entity.is_jumping(false);
                }
                return true;
            }
            if (this.tiles[j+1][i+1]) {
                if (entity.prev_pos.y < entity.pos.y)
                    entity.is_jumping(false);
                return true;
            }

        },
    };

    function Img(src, flipped_src) {
        this.image = new Image();
        this.image.src = src;
        if (flipped_src) {
            this.flipped = new Image();
            this.flipped.src = flipped_src;
        } else 
            this.flipped = null;
    };

    Img.prototype = {
        image: null,
        flipped: null,
        render: function render(x, y, flipped) {
			var ctx = System.ctx;
            var img = flipped ? this.flipped : this.image;
			ctx.drawImage(img, x, y);
        },
    };

	function Entity(p, pos_x, pos_y, img_right, img_left) {
        this._jumping = true;
        this._facing_right = true;
        this.p = p;
        this.pos = {
            x: pos_x,
            y: pos_y,
        }
		this.prev_pos = {
			x: 0,
			y: 0,
		};
        this.vel = {
            x: 0,
            y: 0,
        };
        this.max_vel = {
            x: 512,
            y: 512,
        };
		this.size = {
			x: 16,
			y: 16,
		};
		this.speed = {
            x: 192, // pixels per second
            y: 256,
        };
        this.img = new Img(img_right, img_left);
        this.vel = {
            x: 0,
            y: 0,
        };
	};

	Entity.prototype = {
        is_jumping: function is_jumping(bool) {
            if (bool === undefined)
                return this._jumping;
            this._jumping = bool;
        },
        is_flipped: function is_flipped(bool) {
            if (bool === undefined)
                return ! this._facing_right;
            this._facing_right = ! bool;

        },
        get_vel: function get_vel(dir) {
            return Math.min(this.vel[dir], this.max_vel[dir]) / System.fps;
        },
		render: function draw() {
            this.img.render(this.pos.x, this.pos.y, this.is_flipped());
		},
		integrate: function update() {
            this.prev_pos.x = this.pos.x;
            this.prev_pos.y = this.pos.y;
            // adjust velocity
            Gravity.pull(this);
			if (Input.current(this.p + '-right')) this.move('right');
			if (Input.current(this.p + '-left')) this.move('left');
			if (Input.current(this.p + '-up')) this.jump();
            // update position based on velocity
            this.pos.x += this.get_vel('x');
            this.pos.y += this.get_vel('y');
            this.vel.x = 0;
            if (Game._collision_map.detect(this)) {
                // collision detected
                this.pos.x = this.prev_pos.x;
                this.pos.y = this.prev_pos.y;
                this.stop();
            } else {
                // no collision, it's airborne
                this.is_jumping(true);
            }
		},
		move: function move(direction) {
			if (direction == 'right') {
                this.is_flipped(false);
                this.vel.x = this.speed.x;
            }
			if (direction == 'left') {
                this.is_flipped(true);
                this.vel.x = - this.speed.x;
            }
		},
        jump: function jump() {
            if (this.is_jumping()) {
                if (this.vel.y < 0) {
                    // the entity is going up
                    // keeping the up arrow pressed makes the entity go higher
                    this.vel.y -= Math.max(0, Gravity.anti);
                };
            } else {
                this.vel.y -= this.speed.y;
                this.is_jumping(true);
            };
        },
        stop: function stop() {
            this.vel.x = 0;
            this.vel.y = 0;
        },
	};

	window.addEventListener("DOMContentLoaded", System.init.bind(System), false);

})(window);
