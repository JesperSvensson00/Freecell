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
      newDeck[i] = prevDeck.splice(spot, 1)[0];
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

  getTopCard(){
    return this.deck[this.size()-1];
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

function inReveredHL(cards) {
  //Checks if the cards in "cards" are in a numerical order
  for(let i = 0; i < cards.length-1; i++){
    if(cards[i].value-1 != cards[i+1].value){
      print("Not in order");
       return false;
    }
  }
  return true;
}

function inOrderLH(cards) {
  //Checks if the cards in "cards" are in a numerical order
  for(let i = 0; i < cards.length-1; i++){
    if(cards[i].value+1 != cards[i+1].value){
       return false;
    }
  }
  return true;
}

function inAltColor(cards) {
  //Cecks if the cards color in "cards" are alternating
  for(let i = 0; i < cards.length-1; i++){
    if(cards[i].isRed() == cards[i+1].isRed()){
      print("Color is not alternating");
       return false;
    }
  }
  return true;
}
