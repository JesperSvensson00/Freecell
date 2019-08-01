class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit; //Hearts, Spades, Diamond, Clubs
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
      return "Ace";
    } else if (this.value == 11) {
      return "Knight";
    } else if (this.value == 12) {
      return "Queen";
    } else if (this.value == 13) {
      return "King";
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
