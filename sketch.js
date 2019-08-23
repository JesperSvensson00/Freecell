/*
Spara senaste draget
Mobil/skärm anpassning
*/


let spreadsheet;

var piles; //0-3 cellPiles //4-7 basepiles //7-15 playingpiles

var cardWidth;
var cardHeight;

var startDeck;
var gameWon = false;
var prevGameWon = true;
var gameTime = 0;
var oldMillis = 0;
var playAgainBtn;
var restartBtn;
var symbols = ["♥", "♠", "♦", "♣"];

var ppPressed, epPressed, cpPressed = false;
var prevCardSpot = {
  pileNr: null,
  cardNr: null
};
var prevCard = null;
var selectedCards = [];

var dragedCard = null;
var dragedCardClicked = {
  x: 0,
  y: 0,
  dragging: false
}
var mousePressedMillis = 0;

var moveHistory = [];


var sideMargin = 50;
var xspace = 0;
var yspace = 55;
var ppTopMargin = 260;
var topMargin = 40;
var ratio;

function preload() {
  let soundIndex = '' + floor(random(1, 5));
  cardSound = loadSound('res/sounds/cardPlace' + soundIndex + '.wav');
  cardSound.setVolume(0.6);

  dealingSound = loadSound('res/sounds/cardFan2.wav');
  dealingSound.setVolume(0.6);

  winningSound = loadSound('res/sounds/winning.wav');
  winningSound.setVolume(0.6);

  errorSound = loadSound('res/sounds/error.wav');
  errorSound.setVolume(0.6);
}

function setup() {
  frameRate(15);
  console.clear();
  createCanvas(windowWidth - 200, windowHeight - 50);
  gameWon = true;
  gameTime = 0;

  playAgainBtn = createButton("Vill du spela igen?");
  playAgainBtn.position((width - 200) / 2, height / 2 - 80);
  playAgainBtn.mousePressed(restart);
  playAgainBtn.size(200, 50);
  playAgainBtn.addClass("playAgain");

  restartBtn = createButton("Börja om");
  restartBtn.position(width - 180, 15);
  restartBtn.mousePressed(restart);
  restartBtn.size(80, 20);
  restartBtn.addClass("menu");
  restartBtn.hide();

  //Set sizes, margins and spaces
  resize();
}

function draw() {
  background(45, 170, 45);
  print(floor(frameRate()));

  if (gameWon) {
    if (!prevGameWon) {
      print("Grattis!");
      winningSound.play();
      prevGameWon = true;
    }
    playAgainBtn.show();
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


    if (mouseIsPressed && dragedCard !== null) {
      dragedCard.show(mouseX + dragedCardClicked.x, mouseY + dragedCardClicked.y, cardWidth, cardHeight);
    }
  }
}

function drawDecks() {
  //Top piles

  //Cell piles
  for (let cd = 0; cd < 4; cd++) {
    if (piles[cd].size() == 0) {
      noFill();
      stroke(10, 240, 20);
      strokeWeight(2);
      rect(sideMargin + (cardWidth + xspace) * cd, topMargin, cardWidth, cardHeight, 10);
    } else {
      let card = piles[cd].getTopCard();
      if (!card.dragged) {
        //Shadow
        fill(10, 10, 10, 80);
        noStroke();
        rect(sideMargin + (cardWidth + xspace) * cd + 5, topMargin + 3, cardWidth, cardHeight, 10);

        //Card
        card.show(sideMargin + (cardWidth + xspace) * cd, topMargin, cardWidth, cardHeight);
      }
    }
  }
  //End piles
  for (let ed = 4; ed < 8; ed++) {
    if (piles[ed].size() == 0) {
      //Inner shadow
      fill(45, 170, 45);
      strokeWeight(6);
      stroke(10, 10, 10, 100);
      rect(sideMargin + (cardWidth + xspace) * ed + 3, topMargin + 3, cardWidth - 6, cardHeight - 6, 10);

      //Symbol
      fill(0, 0, 0, 100);
      noStroke();
      textSize(80);
      textAlign(CENTER, CENTER);
      text(symbols[ed], sideMargin + (cardWidth + xspace) * ed + cardWidth / 2, topMargin + cardHeight / 2);
    } else {
      //Shadow
      fill(10, 10, 10, 100);
      noStroke();
      rect(sideMargin + (cardWidth + xspace) * ed + 5, topMargin + 3, cardWidth, cardHeight, 10);
      piles[ed].getTopCard().show(sideMargin + (cardWidth + xspace) * ed, topMargin, cardWidth, cardHeight);
    }
  }

  //Playing piles
  //Loops through playingpiles and draws them
  for (let pd = 8; pd < 16; pd++) {
    let xPos = sideMargin + (cardWidth + xspace) * (pd - 8);
    let pile = piles[pd];

    if (pile.size() == 0) {
      //Draws the base
      noFill();
      stroke(10, 240, 20);
      strokeWeight(2);
      rect(xPos, ppTopMargin, cardWidth, cardHeight, 10);
    } else {
      //Draws the shadow of the pile
      let pileYSpace = yspace;
      if (height < (pile.size() - 1) * pileYSpace + ppTopMargin + cardHeight + 10) {
        pileYSpace = (height - ppTopMargin - cardHeight - 10) / (pile.size() - 1);
      }
      let shadowHeight = pileYSpace * (piles[pd].size() - 1) + cardHeight;
      fill(10, 10, 10, 80);
      noStroke();
      rect(xPos + 8, ppTopMargin + 5, cardWidth, shadowHeight, 10);

      //Draws all the cards for every pile
      for (let c = 0; c < pile.size(); c++) {
        let card = pile.deck[c];
        if (!card.dragged) {
          card.show(xPos, ppTopMargin + pileYSpace * c, cardWidth, cardHeight);
        }
      }
    }
  }
}

function keyPressed() {
  if (keyCode == "32") {
    if (!gameWon && moveHistory.length != 0) {
      undoMove();
    }
  }
}

function mousePressed() {
  if (gameWon) {
    return;
  }
  frameRate(30);
  mousePressedMillis = millis();
  //Finds the card wich should be dragged
  let cardSpot = findCardSpot(mouseX, mouseY);
  //Checks if there was a card at the press
  if (cardSpot == null || (cardSpot.pileNr > 3 && cardSpot.pileNr < 8)) {
    return;
  }
  //If a card is already selected skip drag
  if (ppPressed || cpPressed) {
    if (prevCardSpot !== null) {
      if (cardSpot.pileNr != prevCardSpot.pileNr) {
        return;
      }
    } else {
      return;
    }
  }
  if (cardSpot.pileNr > 7) {
    if (cardSpot.cardNr == piles[cardSpot.pileNr].size() - 1) {
      dragedCard = getCard(cardSpot);
    } else {
      return;
    }
  } else if (cardSpot.pileNr < 4) {
    if (cardSpot.cardNr == piles[cardSpot.pileNr].size() - 1) {
      dragedCard = getCard(cardSpot);
    } else {
      return;
    }
  }
  if (dragedCard !== null) {
    dragedCardClicked = {
      x: dragedCard.x - mouseX,
      y: dragedCard.y - mouseY
    };
    dragedCard.dragged = true;
    prevCardSpot = cardSpot;
    dragedCardClicked.dragged = true;
  }
}

function mouseReleased() {
  if (gameWon) {
    return;
  }
  frameRate(10);
  let cardSpot = findCardSpot(mouseX, mouseY);
  if (cardSpot == null) {
    if (dragedCard !== null) {
      cardSound.play();
    }

    clearSelection();
    return;
  }
  //Check if it was a short press and then preform a regular press
  if (millis() < mousePressedMillis + 100 || cardSpot.pileNr == prevCardSpot.pileNr || dragedCard === null) {
    if (dragedCard !== null) {
      dragedCard.dragged = false;
      dragedCard = null;
    }

    //Check if it is the first or second press
    if (!ppPressed && !epPressed && !cpPressed) /*First press*/ {
      firstPress(cardSpot);
    } else /*Second press*/ {
      secondPress(cardSpot);
    }
    return;
  }

  //If there was a drag but not a dragged card
  if (dragedCard === null) {
    clearSelection();
    return;
  }

  //Finding the new card
  if (cardSpot.pileNr > 7) {
    newPile = piles[cardSpot.pileNr];
    newCard = newPile.getTopCard();
  } else if (cardSpot.pileNr < 4) {
    newPile = piles[cardSpot.pileNr];
    if (newPile.size() > 0) {
      newCard = newPile.getTopCard();
    }
  }

  if (prevCardSpot.pileNr > 7) {
    prevPile = piles[prevCardSpot.pileNr];
  } else if (prevCardSpot.pileNr < 4) {
    prevPile = piles[prevCardSpot.pileNr];
  }

  if (newPile.size() == 0) {
    moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
  } else if (dragedCard.isRed() != newCard.isRed()) {
    if (dragedCard.value == newPile.getTopCard().value - 1) {
      moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
    } else {
      print("Korten ska ligga i ordningen kung till äss!");
      errorSound.play();
    }
  } else {
    print("Korten ska ligga med växlande färg!");
    errorSound.play();
  }

  dragedCard.dragged = false;
  dragedCard.selected = false;
  dragedCardClicked.dragged = false;
  autoMove();
  gameWon = checkIfWon();
  clearSelection();
}

function doubleClicked() {
  if (gameWon) {
    return;
  }
  clearSelection();
  let cardSpot;
  cardSpot = findCardSpot(mouseX, mouseY);

  if (cardSpot === null) {
    clearSelection();
    return;
  }
  if (cardSpot.pileNr > 7) { //If it the playing piles
    if (cardSpot.cardNr == piles[cardSpot.pileNr].size() - 1) { //If it is the top card
      let card = piles[cardSpot.pileNr].getTopCard();
      for (let i = 4; i < 8; i++) {
        if (card.suit == i - 4 && card.value - 1 == piles[i].getTopCard().value) {
          moveCard(cardSpot.pileNr, i);
          return;
        }
      }

      //Moves the clicked card to the cellpiles if there is a spot
      for (let i = 0; i < 4; i++) { //Loops through the cellpiles
        if (piles[i].size() == 0) { //If the pile is empty
          moveCard(cardSpot.pileNr, i);
          return;
        }
      }
    }
  } else if (cardSpot.pileNr < 4) {
    let card = piles[cardSpot.pileNr].getTopCard();
    for (let i = 4; i < 8; i++) {
      if (card.suit == i - 4 && card.value - 1 == piles[i].getTopCard().value) {
        moveCard(cardSpot.pileNr, i);
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
    if (cardSpot.cardNr == piles[cardSpot.pileNr].size() - 1) {
      //Top card
      ppPressed = true;
      getCard(cardSpot).selected = true;
    } else {
      /*Multiple cards selected*/
      //Creates an array of the selected cards
      selectedCards = piles[cardSpot.pileNr].deck.slice(cardSpot.cardNr);

      //The cards needs to be in order
      if (inOrderHL(selectedCards) && inAltColor(selectedCards)) {
        //Seleces all the cards
        ppPressed = true;
        //Highlights the selected cards
        for (let i = 0; i < selectedCards.length; i++) {
          selectedCards[i].selected = true;
        }
      } else {
        errorSound.play();
      }
    }
  } else if (cardSpot.pileNr > 3) {
    //Can't move from endpiles
    print("Du kan inte flytta kort från bashögarna!");
    errorSound.play();
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
        let pile1 = piles[prevCardSpot.pileNr];
        let pile2 = piles[cardSpot.pileNr];
        if (pile2.size() == 0) { //PP to empty PP
          if (selectedCards.length > 0) {
            if (movebleCards(cardSpot.pileNr) >= selectedCards.length) {
              moveCards(prevCardSpot.pileNr, cardSpot.pileNr, selectedCards);
            } else {
              print("Du kan max flytta " + movebleCards(cardSpot.pileNr) + " hit!");
              errorSound.play();
            }
          } else {
            moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
          }
        } else if (selectedCards.length > 0) {
          if (pile1.deck[prevCardSpot.cardNr].isRed() != pile2.getTopCard().isRed()) {
            if (pile1.deck[prevCardSpot.cardNr].value == pile2.getTopCard().value - 1) {
              if (movebleCards(cardSpot.pileNr) >= selectedCards.length) {
                print("Moved");
                moveCards(prevCardSpot.pileNr, cardSpot.pileNr, selectedCards);
              } else {
                print("Du kan max flytta " + movebleCards(cardSpot.pileNr) + " kort hit!");
                errorSound.play();
              }
            } else {
              print("Korten ska ligga i ordningen kung till äss!");
              errorSound.play();
            }
          } else {
            print("Korten ska ligga med växlande färg!");
            errorSound.play();
          }
        } else if (pile1.getTopCard().isRed() != pile2.getTopCard().isRed()) {
          if (pile1.getTopCard().value == pile2.getTopCard().value - 1) {
            moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
          } else {
            print("Korten ska ligga i ordningen kung till äss!");
            errorSound.play();
          }
        } else {
          print("Korten ska ligga med växlande färg!");
          errorSound.play();
        }
      } else if (cardSpot.pileNr > 3) {
        //PP to EP
        let endPile = piles[cardSpot.pileNr];
        let playingPile = piles[prevCardSpot.pileNr];
        if (endPile.getTopCard().value == playingPile.getTopCard().value - 1) {
          if (endPile.getTopCard().suit == playingPile.getTopCard().suit) {
            moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
          } else {
            print("Korten ska ha samma färg i bashögarna!");
            errorSound.play();
          }
        } else {
          print("Korten ska ligga i ordning äss till kung i bashögarna!");
          errorSound.play();
        }

      } else {
        //PP to CP
        let cellPile = piles[cardSpot.pileNr];
        let playingPile = piles[prevCardSpot.pileNr];
        if (cellPile.size() == 0) {
          moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
        } else {
          print("Det får bara finnas ett kort här!");
          errorSound.play();
        }
      }
    } else if (cpPressed) {
      //Try move from cell piles
      if (cardSpot.pileNr > 7) {
        if (cardSpot.pileNr > 7) {
          let cellPile = piles[prevCardSpot.pileNr];
          let playingPile = piles[cardSpot.pileNr];
          if (playingPile.size() == 0) { //CP to empty PP
            moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
          } else if (cellPile.getTopCard().isRed() != playingPile.getTopCard().isRed()) {
            if (cellPile.getTopCard().value == playingPile.getTopCard().value - 1) {
              moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
            } else {
              print("Korten ska ligga i ordningen kung till äss!");
              errorSound.play();
            }
          } else {
            print("Korten ska ligga med växlande färg!");
            errorSound.play();
          }
        }
      } else if (cardSpot.pileNr > 3) {
        let endPile = piles[cardSpot.pileNr];
        let cellPile = piles[prevCardSpot.pileNr];
        if (endPile.getTopCard().value == cellPile.getTopCard().value - 1) {
          if (endPile.getTopCard().suit == cellPile.getTopCard().suit) {
            moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
          } else {
            print("Korten ska ha samma färg i bashögarna!");
            errorSound.play();
          }
        } else {
          print("Korten ska ligga i ordning äss till kung i bashögarna!");
          errorSound.play();
        }
      } else {
        let cellPile1 = piles[cardSpot.pileNr];
        let cellPile2 = piles[prevCardSpot.pileNr];
        if (cellPile1.size() == 0) {
          moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
        } else {
          print("Det får bara finnas ett kort här!");
          errorSound.play();
        }
      }
    }
    clearSelection();
  }
}

function moveCard(pileNr1, pileNr2) {
  piles[pileNr1].moveTopCard(piles[pileNr2]);
  moveHistory.push({
    pile1: pileNr1,
    pile2: pileNr2,
    cards: null
  });
  cardSound.play();
  autoMove();
  gameWon = checkIfWon();
}

function moveCards(pileNr1, pileNr2, cards) {
  piles[pileNr1].moveCards(piles[pileNr1].size() - cards.length, piles[pileNr2]);
  moveHistory.push({
    pile1: pileNr1,
    pile2: pileNr2,
    cards: cards
  });
  cardSound.play();
  autoMove();
  gameWon = checkIfWon();
}

function dealCards(dealDeck) {
  let size = dealDeck.size();
  for (let i = 0; i < size; i++) {
    dealDeck.moveTopCard(piles[(i % 8) + 8]);
  }
  autoMove();
  dealingSound.play(0.1, 2, 0.5, 0.2);
  resize();
}

function autoMove() {
  //Checks wich value the lowest topcar in the basepiles has
  let lowestCardVal = 14;
  for (let i = 4; i < 8; i++) {
    if (lowestCardVal >= piles[i].getTopCard().value) {
      lowestCardVal = piles[i].getTopCard().value;
    }
  }

  if (lowestCardVal >= 13) {
    gameWon = true;
    return;
  }


  for (let i = 8; i < 16; i++) {
    let topCard = piles[i].getTopCard();
    if (topCard.value == lowestCardVal + 1) {
      moveCard(i, topCard.suit + 4);
      setTimeout(autoMove, 350 - 18 * lowestCardVal);
      return;
    }
  }

  for (let i = 0; i < 4; i++) {
    let topCard = piles[i].getTopCard();
    if (topCard.value == lowestCardVal + 1) {
      moveCard(i, topCard.suit + 4);
      setTimeout(autoMove, 350 - 18 * lowestCardVal);
      return;
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
  dragedCardClicked = {
    x: 0,
    y: 0,
    dragging: false
  };
  for (let i = 0; i < selectedCards.length; i++) {
    selectedCards[i].selected = false;
  }
  selectedCards = [];
  if (dragedCard !== null) {
    dragedCard.dragged = false;
    dragedCard = null;
  }
  ppPressed = false;
  epPressed = false;
  cpPressed = false;
}

function getCard(cardSpot) {
  let card;
  if (cardSpot.pileNr > 7) {
    //Playinpile
    if (piles[cardSpot.pileNr].size() == 0) {
      print("Det finns inget kort här!");
      errorSound.play();
      return null;
    } else {
      card = piles[cardSpot.pileNr].deck[cardSpot.cardNr];
    }
  } else if (cardSpot.pileNr > 3) {
    //Endpiles
    if (piles[cardSpot.pileNr].size() == 0) {
      print("Det finns inget kort här!");
      errorSound.play();
      return null;
    } else {
      card = piles[cardSpot.pileNr].deck[cardSpot.cardNr];
    }
  } else {
    //Cellpiles
    if (piles[cardSpot.pileNr].size() == 0) {
      print("Det finns inget kort här!");
      errorSound.play();
      return null;
    } else {
      card = piles[cardSpot.pileNr].deck[cardSpot.cardNr];
    }
  }
  return card;
}

function findCardSpot(x, y) {
  let middleMargin = ppTopMargin - cardHeight - topMargin;

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
      if (piles[pileNr].size() == 0) {
        cardNr = 0;
      } else if (y < ppTopMargin + yspace * (piles[pileNr].size() - 1) + cardHeight) {
        //Checks wich card was pressed
        for (let i = 0; i < piles[pileNr].size(); i++) {
          if (y > ppTopMargin + yspace * i && y < ppTopMargin + yspace * (i + 1)) {
            cardNr = i;
            break;
          } else {
            cardNr = piles[pileNr].size() - 1;
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
  for (let i = 4; i < 8; i++) {
    if (piles[i].getTopCard().value != 13) {
      won = false;
    }
  }
  return won;
}

function restart() {
  startDeck = newDeckOfCards();
  startDeck.shuffle();

  piles = [new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([]),
        new Deck([])
    ];

  dealCards(startDeck);
  gameTime = 0;
  gameWon = false;
  prevGameWon = false;
  playAgainBtn.hide();
  restartBtn.show();
}

function movebleCards(pileNr) {
  let cellSpots = 0;
  let pileSpots = 0;
  let spots = 0;
  for (let i = 0; i < piles.length; i++) {
    if (piles[i].size() == 0) {
      cellSpots++;
    }
  }
  for (let i = 0; i < piles.length; i++) {
    if (i != pileNr - 8) {
      if (piles[i].size() == 0) {
        cellSpots++;
      }
    }
  }

  spots = (cellSpots + 1) * (pileSpots + 1);

  return spots;
}

function undoMove() {
  let move = moveHistory.pop();
  if (move.cards != null) {
    piles[move.pile2].moveCards(piles[move.pile2].size() - move.cards.length, piles[move.pile1]);
    cardSound.play();
  } else {
    piles[move.pile2].moveTopCard(piles[move.pile1]);
    cardSound.play();
  }
}

function resize() {
  //1400 900 1,55
  let ww = windowWidth - 20;
  let wh = windowHeight - 40;
  if (windowWidth > 1550) {
    ww = 1550;
  }
  resizeCanvas(ww, wh);

  ratio = floor((ww / wh) * 100) / 100;
  print("Ratio: " + ratio + ":1");

  if (ratio < 1.3) { //Om bredden är mindre än en halv gång större
    //korten anpassas efter bredden - smal skärm
    sideMargin = ww / 28;
    cardWidth = (ww / 12);
    cardHeight = cardWidth * 1.7;
    yspace = cardHeight / (ratio + 1);
    topMargin = wh / 18;
    ppTopMargin = topMargin * 1.8 + cardHeight;
    xspace = (width - 2 * sideMargin - 8 * cardWidth) / 7;
  } else {
    //Korten anpassas efter höjden - bredskärm
    sideMargin = ww / 28;
    yspace = cardHeight / 2.9;
    cardWidth = (wh / 7.2);
    cardHeight = cardWidth * 1.5;
    topMargin = wh / 22;
    ppTopMargin = topMargin * 1.8 + cardHeight;
    xspace = (width - 2 * sideMargin - 8 * cardWidth) / 7;
  }
  playAgainBtn.position((width - 200) / 2, height / 2 - 80);
  restartBtn.position(width - 180, 15);
}

function windowResized() {
  resize();
}

function test() {
  piles[0 + 8].sort();
  piles[1 + 8].sort();
  piles[2 + 8].sort();
  piles[3 + 8].sort();
  piles[4 + 8].sort();
  piles[5 + 8].sort();
  piles[6 + 8].sort();
  piles[7 + 8].sort();
}
