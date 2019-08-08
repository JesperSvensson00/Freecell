/*
Dra och släppa kortet - rita det utifrån vart på kortet man tryckte
Animationer
*/


let spreadsheet;

var playingPiles;
var endPiles;
var cellPiles;

var cardWidth;
var cardHeight;

var startDeck;
var gameWon = false;
var gameTime = 0;
var oldMillis = 0;
var restartBtn;
var symbols = ["♥", "♠", "♦", "♣"];

var ppPressed, epPressed, cpPressed = false;
var prevCardSpot = {
  pileNr: null,
  cardNr: null
};
var prevCard = null;
var selectedCards = [];

var dragedCard;


var sideMargin = 50;
var xspace = 0;
var yspace = 55;
var ppTopMargin = 260;
var topMargin = 30;

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
  xspace = (width - 2 * sideMargin - 8 * cardWidth) / 7;

  dealCards(startDeck);
  gameTime = 0;
  restartBtn = createButton("Vill du spela igen?");
  restartBtn.position((width - 200) / 2, height / 2 - 80);
  restartBtn.mousePressed(restart);
  restartBtn.hide();
  restartBtn.size(200, 50);
  gameWon = false;
}

function draw() {
  background(45, 170, 45);

  if (gameWon) {
    restartBtn.show();
    noStroke();
    fill(0);
    textSize(40);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Grattis, du klarade det!", width / 2, height / 2 - 180);

    let time = floor(gameTime / 60) + ":" + (gameTime % 60);
    textSize(30);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text("Din tid blev: " + time + " min.", width / 2, height / 2 - 140);
  } else {

    if (millis() > oldMillis + 1000) {
      gameTime++;
      oldMillis = millis();
    }

    drawDecks();

    //Timer
    noStroke();
    fill(0);
    textSize(20);
    textAlign(RIGHT, TOP);
    let time = floor(gameTime / 60) + ":" + (gameTime % 60);
    text(time + "", width - 50, 8);


    //    if (mouseIsPressed && dragedCard !== null) {
    //      dragedCard.show(mouseX, mouseY, cardWidth, cardHeight);
    //    }
  }
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
  //Playing piles
  //Loops through playingpiles and draws them
  for (let pd = 0; pd < playingPiles.length; pd++) {
    let xPos = sideMargin + (cardWidth + xspace) * pd;
    let pile = playingPiles[pd];

    if (pile.size() == 0) {
      //Draws the base
      noFill();
      stroke(10, 240, 20);
      strokeWeight(2);
      rect(xPos, ppTopMargin, cardWidth, cardHeight, 10);
    } else {
      //Draws the shadow of the pile
      let shadowHeight = yspace * (playingPiles[pd].size() - 1) + cardHeight;
      fill(10, 10, 10, 80);
      noStroke();
      rect(xPos + 8, ppTopMargin + 5, cardWidth, shadowHeight, 10);

      //Draws all the cards for every pile
      for (let c = 0; c < pile.size(); c++) {
        let card = pile.deck[c];
        card.show(xPos, ppTopMargin + yspace * c, cardWidth, cardHeight);
      }
    }
  }
  //Top piles

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
      //Inner shadow
      fill(45, 170, 45);
      strokeWeight(6);
      stroke(10, 10, 10, 100);
      rect(sideMargin + (cardWidth + xspace) * (ed + 4) + 3, topMargin + 3, cardWidth - 6, cardHeight - 6, 10);

      //Symbol
      fill(0, 0, 0, 100);
      noStroke();
      textSize(80);
      textAlign(CENTER, CENTER);
      text(symbols[ed], sideMargin + (cardWidth + xspace) * (ed + 4) + cardWidth / 2, topMargin + cardHeight / 2);
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
  cardSpot = findCardSpot(mouseX, mouseY);

  //If the press is not on a card
  if (cardSpot === null) {
    clearSelection();
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
  cardSpot = findCardSpot(mouseX, mouseY);

  if (cardSpot === null) {
    clearSelection();
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
          return;
        }
      }

      //Moves the clicked card to the cellpiles if there is a spot
      for (let i = 0; i < cellPiles.length; i++) { //Loops through the cellpiles
        if (cellPiles[i].size() == 0) { //If the pile is empty
          playingPiles[cardSpot.pileNr - 8].moveTopCard(cellPiles[i]);
          autoMove();
          gameWon = checkIfWon();
          return;
        }
      }
    }
  } else if (cardSpot.pileNr < 4) {
    let card = cellPiles[cardSpot.pileNr].getTopCard();
    for (let i = 0; i < endPiles.length; i++) {
      if (card.suit == i && card.value - 1 == endPiles[i].getTopCard().value) {
        cellPiles[cardSpot.pileNr].moveTopCard(endPiles[i]);
        autoMove();
        gameWon = checkIfWon();
        return;
      }
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
    clearSelection();
  } else {
    /*
     *   TRY MOVE
     */
    if (ppPressed) {
      //Try move from playing piles
      if (cardSpot.pileNr > 7) {
        let pile1 = playingPiles[prevCardSpot.pileNr - 8];
        let pile2 = playingPiles[cardSpot.pileNr - 8];
        if (pile2.size() == 0) { //PP to empty PP
          if (selectedCards.length > 0) {
            if (movebleCards(cardSpot.pileNr) >= selectedCards.length) {
              pile1.moveCards(prevCardSpot.cardNr, pile2);
            } else {
              print("Du kan max flytta " + movebleCards(cardSpot.pileNr) + " hit!");
            }
          } else {
            pile1.moveTopCard(pile2);
          }
        } else if (selectedCards.length > 0) {
          if (pile1.deck[prevCardSpot.cardNr].isRed() != pile2.getTopCard().isRed()) {
            if (pile1.deck[prevCardSpot.cardNr].value == pile2.getTopCard().value - 1) {
              if (movebleCards(cardSpot.pileNr) >= selectedCards.length) {
                pile1.moveCards(prevCardSpot.cardNr, pile2);
              } else {
                print("Du kan max flytta " + movebleCards(cardSpot.pileNr) + " kort hit!");
              }
            } else {
              print("Korten ska ligga i ordningen kung till äss!");
            }
          } else {
            print("Korten ska ligga med växlande färg!");
          }
        } else if (pile1.getTopCard().isRed() != pile2.getTopCard().isRed()) {
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
        if (cardSpot.pileNr > 7) {
          let cellPile = cellPiles[prevCardSpot.pileNr];
          let playingPile = playingPiles[cardSpot.pileNr - 8];
          if (playingPile.size() == 0) { //CP to empty PP
            cellPile.moveTopCard(playingPile);
          } else if (cellPile.getTopCard().isRed() != playingPile.getTopCard().isRed()) {
            if (cellPile.getTopCard().value == playingPile.getTopCard().value - 1) {
              cellPile.moveTopCard(playingPile);
            } else {
              print("Korten ska ligga i ordningen kung till äss!");
            }
          } else {
            print("Korten ska ligga med växlande färg!");
          }
        }
      } else if (cardSpot.pileNr > 3) {
        let endPile = endPiles[cardSpot.pileNr - 4];
        let cellPile = cellPiles[prevCardSpot.pileNr];
        if (endPile.getTopCard().value == cellPile.getTopCard().value - 1) {
          if (endPile.getTopCard().suit == cellPile.getTopCard().suit) {
            cellPile.moveTopCard(endPile);
          } else {
            print("Korten ska ha samma färg i bashögarna!");
          }
        } else {
          print("Korten ska ligga i ordning äss till kung i bashögarna!");
        }
      } else {
        let cellPile1 = cellPiles[cardSpot.pileNr];
        let cellPile2 = cellPiles[prevCardSpot.pileNr];
        if (cellPile1.size() == 0) {
          cellPile2.moveTopCard(cellPile1);
        } else {
          print("Det får bara finnas ett kort här!");
        }
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
      if (playingPiles[pileNr - 8].size() == 0) {
        cardNr = 0;
      } else if (y < ppTopMargin + yspace * (playingPiles[pileNr - 8].size() - 1) + cardHeight) {
        //Checks wich card was pressed
        for (let i = 0; i < playingPiles[pileNr - 8].size(); i++) {
          if (y > ppTopMargin + yspace * i && y < ppTopMargin + yspace * (i + 1)) {
            cardNr = i;
            break;
          } else {
            cardNr = playingPiles[pileNr - 8].size() - 1;
          }
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

function restart() {
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

  dealCards(startDeck);
  gameTime = 0;
  gameWon = false;
  restartBtn.hide();
}

function movebleCards(pileNr) {
  let cellSpots = 0;
  let pileSpots = 0;
  let spots = 0;
  for (let i = 0; i < cellPiles.length; i++) {
    if (cellPiles[i].size() == 0) {
      cellSpots++;
    }
  }
  for (let i = 0; i < playingPiles.length; i++) {
    if (i != pileNr - 8) {
      if (playingPiles[i].size() == 0) {
        cellSpots++;
      }
    }
  }

  spots = (cellSpots + 1) * (pileSpots + 1);

  return spots;
}
