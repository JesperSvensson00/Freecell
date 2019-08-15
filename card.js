class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit; //Hearts, Spades, Diamond, Clubs
    this.selected = false;
    this.x = 0;
    this.y = 0;
    this.speed = createVector(0);
    this.vel = 90;

    this.dragged = false;
  }

  show(x, y, w, h) {
//    if (!this.draged) {
//      if (dist(this.x, this.y, x, y) < this.vel) {
//        this.x = x;
//        this.y = y;
//      } else {
//        if (this.x != x) {
//          this.speed.set(x - this.x, y - this.y);
//          this.speed.setMag(this.vel);
//          this.x += this.speed.x;
//        }
//        if (this.y != y) {
//          this.speed.set(x - this.x, y - this.y);
//          this.speed.setMag(this.vel);
//          this.y += this.speed.y;
//        }
//      }
//    }

    this.x = x;
    this.y = y;

    //Card
    fill(255);
    strokeWeight(2);
    stroke(200, 200, 200);
    rect(this.x, this.y, w, h, 10);

    //Text
    if (this.isRed()) {
      fill(255, 0, 0);
      stroke(255, 0, 0);
    } else {
      fill(0);
      stroke(0);
    }
    //Value
    textSize(20);
    textAlign(LEFT);
    text(this.valueToString(), this.x + 5, this.y + 20);
    textAlign(LEFT);
    rotate(PI);
    text(this.valueToString(), -(this.x + cardWidth - 5), -(this.y + cardHeight - 20));
    rotate(-PI);
    textAlign(CENTER);
    textSize(30);
    strokeWeight(2);
    text(this.valueToString(), this.x + cardWidth / 2, this.y + (cardHeight + textWidth(this.valueToString())) / 2);
    //Symbol
    noStroke();
    textSize(30);
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

  }

  move(x, y) {
    this.speed.set(x, y);
    this.speed.setMag(1);
    this.x += this.speed.x;
    this.y += this.speed.y;
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
    return this.valueToString() + " of " + this.suitToString();
  }

  valueToString() {
    if (this.value > 1 && this.value < 11) {
      return this.value + "";
    } else if (this.value == 1) {
      return "A";
    } else if (this.value == 11) {
      return "Kn";
    } else if (this.value == 12) {
      return "Q";
    } else if (this.value == 13) {
      return "K";
    }
  }

  suitToString() {
    switch (this.suit) {
      case 0:
        return "hearts";
        break;
      case 1:
        return "spades";
        break;
      case 2:
        return "diamonds";
        break;
      case 3:
        return "clubs";
        break;
      default:
        return "blank";
    }
  }

  print(){
    console.log(this.toString());
  }
}
