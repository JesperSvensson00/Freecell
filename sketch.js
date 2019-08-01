var playingPiles;
var endPiles;
var cellPiles;

var cardWidth;
var cardHeight;

var startDeck;

var ppPressed, epPressed, cpPressed = false;

function setup() {
  createCanvas(1400, 900);

  startDeck = newDeckOfCards();
  startDeck.shuffle();

  playingPiles = [new Deck([], 8),
                  new Deck([], 9),
                  new Deck([], 10),
                  new Deck([], 11),
                  new Deck([], 12),
                  new Deck([], 13),
                  new Deck([], 14),
                  new Deck([], 15)];

  cellPiles = [new Deck([], 0), new Deck([], 1), new Deck([], 2), new Deck([], 3)];
  endPiles = [new Deck([], 4), new Deck([], 5), new Deck([], 6), new Deck([], 7)];

  cardHeight = 200;
  cardWidth = 125;


  dealCards();
}

function draw() {
  background(11, 140, 15);

  drawDecks();


  //Guide lines
  strokeWeight(2);
  stroke(20, 20, 200);
  //Top piles
  line(0, 30, width, 30);
  line(0, 230, width, 230);
  //Playing piles top
  line(0, 260, width, 260);
  //Middle
  line(width / 2, 0, width / 2, height);
  //Sides
  let margin = 50;
  line(margin, 0, margin, height);
  line(width - margin, 0, width - margin, height);
}

function drawDecks() {
  noStroke();
  textAlign(CENTER);
  textSize(15);
  let sideMargin = 50;
  let xspace = (width - 2 * sideMargin - 8 * cardWidth) / 7;
  //Playing piles
  let yspace = 55;
  let ppTopMargin = 260;
  for (let pd = 0; pd < playingPiles.length; pd++) {
    for (let c = 0; c < playingPiles[pd].size(); c++) {
      let card = playingPiles[pd].deck[c];
      fill(200);
      stroke(0);
      rect(sideMargin + (cardWidth + xspace) * pd, ppTopMargin + yspace * c, cardWidth, cardHeight);
      fill(0);
      text(card.toString(), sideMargin + (cardWidth + xspace) * pd + (cardWidth / 2), ppTopMargin + yspace * c + 30);
    }
  }
  //Toppiles
  let topMargin = 30;
  //Cell piles
  for (let cd = 0; cd < cellPiles.length; cd++) {
    for (let c = 0; c < cellPiles[cd].deck.length; c++) {
      let card = cellPiles[cd].deck[c];
      fill(200);
      rect(sideMargin + (cardWidth + xspace) * cd, topMargin, cardWidth, cardHeight);
      fill(0);
      text(card.toString(), sideMargin + (cardWidth + xspace) * cd + (cardWidth / 2), topMargin + cardHeight / 2);
    }
  }
  //End piles
  for (let ed = 0; ed < endPiles.length; ed++) {
    for (let c = 0; c < endPiles[ed].deck.length; c++) {
      let card = endPiles[ed].deck[c];
      fill(200);
      rect(sideMargin + (cardWidth + xspace) * (ed + 4), topMargin, cardWidth, cardHeight);
      fill(0);
      text(card.toString(), sideMargin + (cardWidth + xspace) * (ed + 4) + (cardWidth / 2), topMargin + cardHeight / 2);
    }
  }

}

function dealCards() {
  for (let i = 0; i < startDeck.size(); i++) {
    startDeck.moveTopCard(playingPiles[i % playingPiles.length]);
  }
}

function mouseClicked() {
  findPile(mouseX, mouseY);

}

function findPile(x, y) {
  let sideMargin = 50;
  let topMargin = 30;
  let middleMargin = 30;
  let ppTopMargin = topMargin + cardHeight + middleMargin;
  let xspace = (width - 2 * sideMargin - 8 * cardWidth) / 7;
  let yspace = 55;

  if (x > sideMargin && x < width - sideMargin) {
    x = x - sideMargin;
    //In the top area
    if (y > topMargin && y < topMargin + cardHeight) {
      let pileNr = null;

      for (let i = 0; i < 8; i++) {
        if (x > (cardWidth + xspace) * i && x < cardWidth + (cardWidth + xspace) * i) {
          pileNr = i;
          break;
        }
      }
      print("Deck number is: " + pileNr);
    }

    //Playing piles area
    if (y > ppTopMargin && y < height) {
      let pileNr = null;

      for (let i = 0; i < 8; i++) {
        if (x > (cardWidth + xspace) * i && x < cardWidth + (cardWidth + xspace) * i) {
          pileNr = i + 8;
          break;
        }
      }
      if (y < ppTopMargin + yspace * (playingPiles[pileNr - 8].size() - 1) + cardHeight) {
        let cardNr = null;

        //Cheks wich card was pressed
        for (let i = 0; i < playingPiles[pileNr - 8].size() - 1; i++) {
          if (y > ppTopMargin + yspace*i && y < ppTopMargin + yspace*(i+1)) {
            cardNr = i;
            break;
          } else {
            cardNr = playingPiles[pileNr - 8].size() - 1;
          }
        }

        print("Pressed deck " + pileNr + " & card " + cardNr);
      }
    }
  }

  function moveCard(pile1, card1, pile2, card2){

  }

}
