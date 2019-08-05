class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit; //Hearts, Spades, Diamond, Clubs
    this.selected = false;
    this.symbols = ["♥", "♠", "♦", "♣"];
  }

  show(x, y, w, h) {
    if (this.isRed()) {
      fill(200, 10, 10);
      strokeWeight(2);
      stroke(0);
      rect(x, y, w, h, 10);
      strokeWeight(1);
      fill(0);
      text(this.toString(), x + (w / 2), y + 30);
    } else {
      fill(0);
      stroke(255);
      strokeWeight(2);
      rect(x, y, w, h, 10);
      strokeWeight(1);
      fill(255);
      text(this.toString(), x + (w / 2), y + 30);
    }

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
