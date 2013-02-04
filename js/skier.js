var Sprite = require('./Sprite');

(function(global) {
	function Skier(data) {
		var that = new Sprite(data);
		var sup = {
			draw: that.superior('draw'),
			hits: that.superior('hits')
		};
		var directions = {
			esEast: function(xDiff) { return xDiff > 300; },
			sEast: function(xDiff) { return xDiff > 75; },
			wsWest: function(xDiff) { return xDiff < -300; },
			sWest: function(xDiff) { return xDiff < -75; }
		};

		var recoveryTimeout;

		var canSpeedBoost = true;

		var obstaclesHit = [];
		var pixelsTravelled = 0;

		that.isMoving = true;
		that.hasBeenHit = false;

		that.reset = function () {
			obstaclesHit = [];
			pixelsTravelled = 0;
			that.isMoving = true;
			that.hasBeenHit = false;
			canSpeedBoost = true;
		};

		function getBeingEatenSprite() {
			return 'blank';
		}

		that.moveToward = function (cx, cy) {
			if (that.hasBeenHit) return;

			if (cy > that.y) {
				pixelsTravelled += that.speed;
				that.isMoving = true;
			} else {
				that.isMoving = false;
			}
			that.movingToward = [ cx, cy ];
		};

		that.getPixelsTravelledDownMountain = function () {
			return pixelsTravelled;
		};

		that.draw = function(dContext) {
			var spritePartToUse = function () {
				if (that.isBeingEaten) {
					return getBeingEatenSprite();
				}

				if (that.hasBeenHit) {
					return 'hit';
				}
				
				var xDiff = that.movingToward[0] - that.x;
				var yDiff = that.movingToward[1] - that.y;
				if (yDiff < 0) {
					if (xDiff > 0) {
						return 'east';
					} else {
						return 'west';
					}
				}

				if (directions.esEast(xDiff)) {
					return 'esEast';
				} else if (directions.sEast(xDiff)) {
					return 'sEast';
				} else if (directions.wsWest(xDiff)) {
					return 'wsWest';
				} else if (directions.sWest(xDiff)) {
					return 'sWest';
				}
				return 'south';
			};

			return sup.draw(dContext, spritePartToUse());
		};

		that.hits = function (obs) {
			if (obstaclesHit.indexOf(obs.id) !== -1) {
				return false;
			}

			if (sup.hits(obs)) {
				obstaclesHit.push(obs.id);
				return true;
			}

			return false;
		};

		that.speedBoost = function () {
			var originalSpeed = that.speed;
			if (canSpeedBoost) {
				canSpeedBoost = false;
				that.setSpeed(that.speed * 2);
				setTimeout(function () {
					that.setSpeed(originalSpeed);
					setTimeout(function () {
						canSpeedBoost = true;
					}, 10000);
				}, 2000);
			}
		};

		that.hasHitObstacle = function () {
			that.isMoving = false;
			that.hasBeenHit = true;
			if (recoveryTimeout) {
				clearTimeout(recoveryTimeout);
			}
			recoveryTimeout = setTimeout(function() {
				that.isMoving = true;
				that.hasBeenHit = false;
			}, 1500);
		};

		that.isEatenBy = function (monster, whenEaten) {
			monster.startEating(whenEaten);
			that.isMoving = false;
			that.isBeingEaten = true;
		};

		that.reset = function () {
			obstaclesHit = [];
			pixelsTravelled = 0;
			that.isMoving = true;
			that.hasBeenHit = false;
			canSpeedBoost = true;
		};

		return that;
	}

	global.Skier = Skier;
})(this);

if (typeof module !== 'undefined') {
	module.exports = this.Skier;
}
