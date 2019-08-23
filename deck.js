class Deck {
  constructor(cards, spot) {
    this.deck = cards;
    this.spot = spot;
  }

  size() {
    return this.deck.length;
  }

  shuffle() {
    let prevDeck = this.copy();
    let newDeck = [];

    for (let i = 0; i < this.deck.length; i++) {
      let spot = floor(random(prevDeck.length));
      newDeck[i] = prevDeck.splice(spot, 1)[0];
    }
    this.deck = newDeck;
  }

  toString() {
    let s = "The deck is: ";
    for (let i = 0; i < this.deck.length - 1; i++) {
      s += this.deck[i].toString() + ",\n ";
    }
    s += this.deck[this.deck.length - 1].toString();
    return s;
  }

  print() {
    console.log(this.toString());
  }

  copy() {
    let deck = [];
    for (let i = 0; i < this.deck.length; i++) {
      deck[i] = this.deck[i];
    }
    return deck;
  }

  size() {
    return this.deck.length;
  }

  moveTopCard(deck) {
    deck.deck.push(this.deck.pop());
  }

  moveCards(firstCard, deck) {
    let cards = this.deck.splice(firstCard);
    for (let i = 0; i < cards.length; i++) {
      deck.deck.push(cards[i]);
    }
  }

  getTopCard() {
    if (this.size() == 0) {
      return new Card(0, 5);
    }
    return this.deck[this.size() - 1];
  }

  sort() {
    this.deck = sortDeck(this);
  }

}

function sortDeck(deck) {
  let cards = deck.deck;
  let swapp;
  let n = deck.size();
  do {
    swapp = false;
    for (var i = 0; i < n - 1; i++) {
      if (cards[i].value < cards[i + 1].value) {
        var temp = cards[i];
        cards[i] = cards[i + 1];
        cards[i + 1] = temp;
        swapp = true;
      }
    }
    n--;
  } while (swapp);

  return cards;
}

function newDeckOfCards() {
  let cards = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 1; j < 14; j++) {
      cards.push(new Card(j, i));
    }
  }
  let deck = new Deck(cards, null);
  return deck;
}

function inOrderHL(cards) {
  //Checks if the cards in "cards" are in a numerical order
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].value - 1 != cards[i + 1].value) {
      print("Not in order");
      return false;
    }
  }
  return true;
}

function inOrderLH(cards) {
  //Checks if the cards in "cards" are in a numerical order
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].value + 1 != cards[i + 1].value) {
      return false;
    }
  }
  return true;
}

function inAltColor(cards) {
  //Cecks if the cards color in "cards" are alternating
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i].isRed() == cards[i + 1].isRed()) {
      print("Color is not alternating");
      return false;
    }
  }
  return true;
}
