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

    for(let i = 0; i < this.deck.length; i++){
      let spot = floor(random(prevDeck.length));
      newDeck[i] = prevDeck.splice(spot, 1);
    }
    this.deck = newDeck;
  }

  toString() {
    let s = "The deck is: ";
    for (let i = 0; i < this.deck.length - 1; i++) {
      s += this.deck[i].toString() + ",\n ";
    }
    s += this.deck[this.deck.length-1].toString();
    return s;
  }

  print(){
    console.log(this.toString());
  }

  copy(){
    let deck = [];
    for(let i = 0; i < this.deck.length; i++){
      deck[i] = this.deck[i];
    }
    return deck;
  }

  size(){
    return this.deck.length;
  }

  moveTopCard(deck){
    deck.deck.push(this.deck.pop());
  }

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
