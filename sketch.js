let spreadsheet;

var playingPiles;
var endPiles;
var cellPiles;

var cardWidth;
var cardHeight;

var startDeck;
var gameWon = false;

var ppPressed, epPressed, cpPressed = false;
var prevCardSpot = {
  pileNr: null,
  cardNr: null
};
var prevCard = null;
var selectedCards = [];

var dragedCard;

function preload() {

}

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
        new Deck([], 15)
    ];

  cellPiles = [new Deck([], 0), new Deck([], 1), new Deck([], 2), new Deck([], 3)];
  endPiles = [new Deck([], 4), new Deck([], 5), new Deck([], 6), new Deck([], 7)];

  cardHeight = 200;
  cardWidth = 125;


  dealCards(startDeck);
}

function draw() {
  background(45, 170, 45);

  if (gameWon) {

  } else {
    drawDecks();
  }
  //  if (mouseIsPressed && dragedCard !== null) {
  //    dragedCard.show(mouseX, mouseY, cardWidth, cardHeight);
  //  }

}

function mousePressed() {
  if (mouseX < width && mouseX > 0 && mouseY > 0 && mouseY < height) {
    let cardSpot = findCardSpot(mouseX, mouseY);
    if (cardSpot == null) {
      return;
    }
    if (cardSpot.pileNr > 7) {
      dragedCard = playingPiles[cardSpot.pileNr - 8].getTopCard();
    } else if (cardSpot.pileNr < 3) {
      dragedCard = cellPiles[cardSpot.pileNr].getTopCard();
    }
  }
}

function mouseReleased() {
  dragedCard = null;
}

function drawDecks() {
  let sideMargin = 50;
  let xspace = (width - 2 * sideMargin - 8 * cardWidth) / 7;
  //Playing piles
  let yspace = 55;
  let ppTopMargin = 260;
  for (let pd = 0; pd < playingPiles.length; pd++) {
    let xPos = sideMargin + (cardWidth + xspace) * pd;
    fill(10, 10, 10, 80);
    noStroke();
    let shadowHeight = yspace * (playingPiles[pd].size() - 1) + cardHeight;
    rect(xPos + 8, ppTopMargin + 5, cardWidth, shadowHeight, 10);
    for (let c = 0; c < playingPiles[pd].size(); c++) {
      let card = playingPiles[pd].deck[c];
      card.show(xPos, ppTopMargin + yspace * c, cardWidth, cardHeight);
    }
  }
  //Top piles
  let topMargin = 30;

  //Cell piles
  for (let cd = 0; cd < cellPiles.length; cd++) {
    if (cellPiles[cd].size() == 0) {
      noFill();
      stroke(10, 240, 20);
      strokeWeight(2);
      rect(sideMargin + (cardWidth + xspace) * cd, topMargin, cardWidth, cardHeight, 10);
    } else {
      //Shadow
      fill(10, 10, 10, 80);
      noStroke();
      rect(sideMargin + (cardWidth + xspace) * cd + 5, topMargin + 3, cardWidth, cardHeight, 10);
      //Card
      cellPiles[cd].getTopCard().show(sideMargin + (cardWidth + xspace) * cd, topMargin, cardWidth, cardHeight);
    }
  }
  //End piles
  for (let ed = 0; ed < endPiles.length; ed++) {
    if (endPiles[ed].size() == 0) {
      noFill();
      stroke(10, 240, 20);
      strokeWeight(2);
      rect(sideMargin + (cardWidth + xspace) * (ed + 4), topMargin, cardWidth, cardHeight, 10);
    } else {
      //Shadow
      fill(10, 10, 10, 100);
      noStroke();
      rect(sideMargin + (cardWidth + xspace) * (ed + 4) + 5, topMargin + 3, cardWidth, cardHeight, 10);
      endPiles[ed].getTopCard().show(sideMargin + (cardWidth + xspace) * (ed + 4), topMargin, cardWidth, cardHeight);
    }
  }

}

function dealCards(dealDeck) {
  let size = dealDeck.size();
  for (let i = 0; i < size; i++) {
    dealDeck.moveTopCard(playingPiles[i % playingPiles.length]);
  }
}

function mouseClicked() {
  let cardSpot;
  if (mouseY > 0 && mouseY < height) {
    cardSpot = findCardSpot(mouseX, mouseY);
  } else {
    return;
  }

  //If the press is not on a card
  if (cardSpot === null) {
    return;
  }

  //Check if it is the first or second press
  if (!ppPressed && !epPressed && !cpPressed) /*First press*/ {
    firstPress(cardSpot);
  } else /*Second press*/ {
    secondPress(cardSpot);
  }
}

function doubleClicked() {
  clearSelection();
  let cardSpot;
  if (mouseY > 0 && mouseY < height) {
    cardSpot = findCardSpot(mouseX, mouseY);
  } else {
    return;
  }
  if (cardSpot === null) {
    return;
  }
  if (cardSpot.pileNr > 7) {
    if (cardSpot.cardNr == playingPiles[cardSpot.pileNr - 8].size() - 1) {
      let card = playingPiles[cardSpot.pileNr - 8].getTopCard();
      for (let i = 0; i < endPiles.length; i++) {
        if (card.suit == i && card.value - 1 == endPiles[i].getTopCard().value) {
          playingPiles[cardSpot.pileNr - 8].moveTopCard(endPiles[i]);
          autoMove();
          gameWon = checkIfWon();
        }
      }
    }
  }

  for (let i = 0; i < cellPiles.length; i++) {
    if (cellPiles[i].size() == 0) {
      if (cardSpot.pileNr > 7) {
        if (cardSpot.cardNr == playingPiles[cardSpot.pileNr - 8].size() - 1) {
          playingPiles[cardSpot.pileNr - 8].moveTopCard(cellPiles[i]);
          autoMove();
          gameWon = checkIfWon();
        }
      }
      return;
    }
  }

}

function firstPress(cardSpot) {

  if (getCard(cardSpot) === null) {
    return;
  }

  if (cardSpot.pileNr > 7) {
    if (cardSpot.cardNr == playingPiles[cardSpot.pileNr - 8].size() - 1) {
      //Top card
      ppPressed = true;
      getCard(cardSpot).selected = true;
    } else {
      /*Multiple cards selected*/
      return;
      //Creates an array of the selected cards
      selectedCards = playingPiles[cardSpot.pileNr - 8].deck.slice(cardSpot.cardNr);

      //The cards needs to be in order
      if (inOrderHL(selectedCards) && inAltColor(selectedCards)) {
        //Seleces all the cards
        ppPressed = true;
        //Highlights the selected cards
        for (let i = 0; i < selectedCards.length; i++) {
          selectedCards[i].selected = true;
        }
      }
    }
  } else if (cardSpot.pileNr > 3) {
    //Can't move from endpiles
    print("You cant move cards from the endpile!");
    return;
  } else {
    //Cellpiles
    cpPressed = true;
    getCard(cardSpot).selected = true;
  }
  prevCardSpot = cardSpot;
  prevCard = getCard(cardSpot);
}

function secondPress(cardSpot) {
  if (cardSpot.pileNr == prevCardSpot.pileNr) {
    //If the same pile is pressed
    prevCard.selected = false;
    ppPressed = false;
    epPressed = false;
    cpPressed = false;
  } else {
    /*
     *   TRY MOVE
     */
    if (ppPressed) {
      //Try move from playing piles
      if (cardSpot.pileNr > 7) {
        let pile1 = playingPiles[prevCardSpot.pileNr - 8];
        let pile2 = playingPiles[cardSpot.pileNr - 8];
        if (pile1.getTopCard().isRed() != pile2.getTopCard().isRed()) {
          if (pile1.getTopCard().value == pile2.getTopCard().value - 1) {
            pile1.moveTopCard(pile2);
          } else {
            print("Korten ska ligga i ordningen kung till äss!");
          }
        } else {
          print("Korten ska ligga med växlande färg!");
        }
      } else if (cardSpot.pileNr > 3) {
        //PP to EP
        let endPile = endPiles[cardSpot.pileNr - 4];
        let playingPile = playingPiles[prevCardSpot.pileNr - 8];
        if (endPile.getTopCard().value == playingPile.getTopCard().value - 1) {
          if (endPile.getTopCard().suit == playingPile.getTopCard().suit) {
            playingPile.moveTopCard(endPile);
          } else {
            print("Korten ska ha samma färg i bashögarna!");
          }
        } else {
          print("Korten ska ligga i ordning äss till kung i bashögarna!");
        }
      } else {
        //PP to CP
        let cellPile = cellPiles[cardSpot.pileNr];
        let playingPile = playingPiles[prevCardSpot.pileNr - 8];
        if (cellPile.size() == 0) {
          playingPile.moveTopCard(cellPile);
        } else {
          print("Det får bara finnas ett kort här!");
        }
      }
    } else if (cpPressed) {
      //Try move from cell piles
      if (cardSpot.pileNr > 7) {
        //CP to PP
        print("CP to PP");
      } else if (cardSpot.pileNr > 3) {
        //CP to EP
        print("CP to EP");
      } else {
        //CP to CP
        print("CP to CP");
      }
    }
    autoMove();
    gameWon = checkIfWon();
    clearSelection();
  }
}

function autoMove() {
  for (let i = 0; i < playingPiles.length; i++) {
    let topCard = playingPiles[i].getTopCard();
    if (topCard.value == 1) {
      playingPiles[i].moveTopCard(endPiles[topCard.suit]);
    }
  }
}

function moveCard(pile1, pile2, cards) {
  //Card move from pile1 to pile2
}

function clearSelection() {
  if (prevCard != null) {
    prevCard.selected = false;
  }
  prevCard = null;
  prevCardSpot = {
    pileNr: null,
    cardNr: null
  };
  for (let i = 0; i < selectedCards.length; i++) {
    selectedCards[i].selected = false;
  }
  selectedCards = [];
  ppPressed = false;
  epPressed = false;
  cpPressed = false;
}

function getCard(cardSpot) {
  let card;
  if (cardSpot.pileNr > 7) {
    //Playinpile
    if (playingPiles[cardSpot.pileNr - 8].size() == 0) {
      print("Det finns inget kort här!");
      return null;
    } else {
      card = playingPiles[cardSpot.pileNr - 8].deck[cardSpot.cardNr];
    }
  } else if (cardSpot.pileNr > 3) {
    //Endpiles
    if (endPiles[cardSpot.pileNr - 4].size() == 0) {
      print("Det finns inget kort här!");
      return null;
    } else {
      card = endPiles[cardSpot.pileNr - 4].deck[cardSpot.cardNr];
    }
  } else {
    //Cellpiles
    if (cellPiles[cardSpot.pileNr].size() == 0) {
      print("Det finns inget kort här!");
      return null;
    } else {
      card = cellPiles[cardSpot.pileNr].deck[cardSpot.cardNr];
    }
  }
  return card;
}

function findCardSpot(x, y) {
  let sideMargin = 50;
  let topMargin = 30;
  let middleMargin = 30;
  let ppTopMargin = topMargin + cardHeight + middleMargin;
  let xspace = (width - 2 * sideMargin - 8 * cardWidth) / 7;
  let yspace = 55;

  let pileNr = null;
  let cardNr = null;
  if (x > sideMargin && x < width - sideMargin) {
    x = x - sideMargin;
    //In the top area
    if (y > topMargin && y < topMargin + cardHeight) {
      for (let i = 0; i < 8; i++) {
        if (x > (cardWidth + xspace) * i && x < cardWidth + (cardWidth + xspace) * i) {
          pileNr = i;
          cardNr = 0;
          break;
        }
      }
    } else if (y > ppTopMargin && y < height) { //Playing piles area
      for (let i = 0; i < 8; i++) {
        if (x > (cardWidth + xspace) * i && x < cardWidth + (cardWidth + xspace) * i) {
          pileNr = i + 8;
          break;
        }
      }
      if (pileNr === null) {
        return null;
      }
      if (y < ppTopMargin + yspace * (playingPiles[pileNr - 8].size() - 1) + cardHeight) {

        //Checks wich card was pressed
        for (let i = 0; i < playingPiles[pileNr - 8].size(); i++) {
          if (y > ppTopMargin + yspace * i && y < ppTopMargin + yspace * (i + 1)) {
            cardNr = i;
            break;
          } else {
            cardNr = playingPiles[pileNr - 8].size() - 1;
          }
        }
        if (pileNr === null) {
          return null;
        }
      }
    }
    if (pileNr === null) {
      return null
    } else if (cardNr === null) {
      return null;
    }
    return {
      pileNr: pileNr,
      cardNr: cardNr
    };
  } else {
    return null;
  }

}

function checkIfWon() {
  let won = true;
  for (let i = 0; i < endPiles.length; i++) {
    if (endPiles[i].getTopCard().value != 13) {
      won = false;
    }
  }
  return won;
}
