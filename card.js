class Card {
	constructor(value, suit) {
		this.value = value;
		this.suit = suit; //Hearts, Spades, Diamond, Clubs
		this.selected = false;
		// this.x = random(0, width);
		// this.y = random(0, height);
		this.x = width / 2;
		this.y = height - cardHeight;
		this.speed = createVector(0);
		this.moving = false;

		this.dragged = false;
	}

	show(x, y, w, h) {
		this.x = x;
		this.y = y;

		if (!highScreen) {
			//If not on a small screen e.g. mobile
			//Card - background
			fill(255);
			strokeWeight(2);
			stroke(200, 200, 200);
			rect(this.x, this.y, w, h, 10);

			//Text color
			if (this.isRed()) {
				fill(255, 0, 0);
				stroke(255, 0, 0);
			} else {
				fill(0);
				stroke(0);
			}
			textStyle(NORMAL);
			//Value
			textSize(20 * fontRatio);
			textAlign(LEFT, BASELINE);
			text(this.valueToString(), this.x + 5, this.y + 20);
			textAlign(LEFT);
			rotate(PI);
			text(this.valueToString(), -(this.x + cardWidth - 5), -(this.y + cardHeight - 20));
			rotate(-PI);
			//Middle - value
			textAlign(CENTER, BASELINE);
			textSize(30 * fontRatio);
			strokeWeight(2);
			text(this.valueToString(), this.x + cardWidth / 2, this.y + (cardHeight + 30) / 2);
			//Symbol
			noStroke();
			textSize(30 * fontRatio);
			textAlign(LEFT);
			text(symbols[this.suit], this.x + 5, this.y + 45);
			textAlign(RIGHT);
			rotate(PI);
			text(symbols[this.suit], -(this.x + cardWidth - 23), -(this.y + cardHeight - 48));
			rotate(-PI);

			if (this.selected) {
				noFill();
				stroke(255, 207, 64);
				strokeWeight(4);
				rect(this.x, this.y, w, h, 10);
			}
		} else {
			//On a small screen e.g. mobile
			//Card - background
			fill(255);
			strokeWeight(1);
			stroke(200, 200, 200);
			rect(this.x, this.y, w, h, 6);

			//Text color
			if (this.isRed()) {
				fill(255, 0, 0);
				stroke(255, 0, 0);
			} else {
				fill(0);
				stroke(0);
			}
			textStyle(NORMAL);
			//Value - top left corner
			textSize(10 * fontRatio);
			textAlign(LEFT, BASELINE);
			text(this.valueToString(), this.x + 3, this.y + 15);
			//Middle - value
			textAlign(CENTER, BASELINE);
			textSize(20 * fontRatio);
			strokeWeight(1);
			text(this.valueToString(), this.x + cardWidth / 2, this.y + (cardHeight + 20) / 2);
			//Symbol - top right
			noStroke();
			textSize(10 * fontRatio);
			textAlign(RIGHT, BASELINE);
			text(symbols[this.suit], this.x + cardWidth - 3, this.y + 15);

			if (this.selected) {
				noFill();
				stroke(255, 207, 64);
				strokeWeight(4);
				rect(this.x, this.y, w, h, 6);
			}
		}
	}

	higherThan(card) {
		if (this.value > card.value) {
			return true;
		}
		return false;
	}

	isRed() {
		if (this.suit % 2 == 0) {
			return true;
		} else {
			return false;
		}
	}

	toString() {
		return this.valueToString() + ' of ' + this.suitToString();
	}

	valueToString() {
		if (this.value > 1 && this.value < 11) {
			return this.value + '';
		} else if (this.value == 1) {
			return 'A';
		} else if (this.value == 11) {
			return 'Kn';
		} else if (this.value == 12) {
			return 'Q';
		} else if (this.value == 13) {
			return 'K';
		}
	}

	suitToString() {
		switch (this.suit) {
			case 0:
				return 'hearts';
			case 1:
				return 'spades';
			case 2:
				return 'diamonds';
			case 3:
				return 'clubs';
			default:
				return 'blank';
		}
	}

	print() {
		console.log(this.toString());
	}
}
