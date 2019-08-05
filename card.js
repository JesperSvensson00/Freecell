class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit; //Hearts, Spades, Diamond, Clubs
    this.selected = false;
    this.symbols = ["♥", "♠", "♦", "♣"];
  }

  show(x, y, w, h) {
    //    //Shadow
    //    fill(0,0,0, 40);
    //    noStroke();
    //    rect(x+5, y+5, w, h, 10);
    //Card
    fill(255);
    strokeWeight(2);
    stroke(200);
    rect(x, y, w, h, 10);

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
    text("" + this.valueToString(), x + 5, y + 20);
    textAlign(RIGHT);
    text("" + this.valueToString(), x + cardWidth - 7, y + cardHeight - 8);
    textAlign(CENTER);
    textSize(30);
    strokeWeight(2);
    text(this.valueToString(), x + cardWidth/2, y + (cardHeight+textWidth(this.valueToString()))/2);
    //Symbol
    noStroke();
    textSize(30);
    textAlign(LEFT);
    text("" + this.symbols[this.suit], x + 5, y + 45);
    textAlign(RIGHT);
    text("" + this.symbols[this.suit], x + cardWidth - 7, y + cardHeight - 28);

    if (this.selected) {
      noFill();
      stroke(255, 207, 64);
      strokeWeight(4);
      rect(x, y, w, h, 10);
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
      return false;
    } else {
      return true;
    }
  }

  toString() {
    return this.valueToString() + " of " + this.suitToString();
  }

  valueToString() {
    if (this.value > 1 && this.value < 11) {
      return this.value + "";
    } else if (this.value == 1) {
      return "E";
    } else if (this.value == 11) {
      return "Kn";
    } else if (this.value == 12) {
      return "D";
    } else if (this.value == 13) {
      return "K";
    }
  }

  suitToString() {
    switch (this.suit) {
      case 0:
        return "spades";
        break;
      case 1:
        return "hearts";
        break;
      case 2:
        return "clubs";
        break;
      case 3:
        return "diamonds";
        break;
      default:
        return "blank";
    }
  }
}
