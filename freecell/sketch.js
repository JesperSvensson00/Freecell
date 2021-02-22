var piles; //0-3 cellPiles //4-7 basepiles //7-15 playingpiles
var startDeck;

var cardWidth;
var cardHeight;

var gameStartedTime = 0;

var highScreen = false;

//Buttons
var playAgainBtn;
var restartBtn;
var returnBtn;

//Game info
var gameWon = null;
var gameStarted = false;
var dealing = false;
var ppPressed,
  epPressed,
  cpPressed = false;
var prevCardSpot = {
  pileNr: null,
  cardNr: null,
};
var prevCard = null;
var selectedCards = [];
var dragedCards = [];
var testCards = [];
var dragedCardClicked = {
  x: 0,
  y: 0,
  dragging: false,
};

var mousePressedMillis = 0;
var mousePressedSpot = { x: 0, y: 0 };
var falsePress = false;

var moveHistory = [];

//Spacings and graphics info
var sideMargin = 50;
var xspace = 0;
var yspace = 55;
var ppTopMargin = 260;
var topMargin = 40;
var ratio;
var symbols = ['♥', '♠', '♦', '♣'];
var movingCards = [];
var animationSpeed = 200;
var fontRatio = 1;

function preload() {
  let soundIndex = '' + floor(random(1, 5));
  cardSound = loadSound('/freecell/res/sounds/cardPlace' + soundIndex + '.wav');
  cardSound.setVolume(0.6);

  dealingSound = loadSound('/freecell/res/sounds/cardFan2.wav');
  dealingSound.setVolume(0.6);

  winningSound = loadSound('/freecell/res/sounds/winning.wav');
  winningSound.setVolume(0.6);

  errorSound = loadSound('/freecell/res/sounds/error.wav');
  errorSound.setVolume(0.6);
}

function setup() {
  createCanvas(windowWidth - 200, windowHeight - 50);
  gameTime = 0;

  playAgainBtn = createButton('Spela igen?');
  playAgainBtn.position((width - 200) / 2, height / 2 - 80);
  playAgainBtn.mousePressed(restart);
  playAgainBtn.size(200, 50);
  playAgainBtn.addClass('playAgain');

  restartBtn = createButton('Börja om');
  restartBtn.position(width - 180, 15);
  restartBtn.mousePressed(restart);
  restartBtn.size(80, 20);
  restartBtn.addClass('menu');
  restartBtn.hide();

  returnBtn = createButton('Tillbaka');
  returnBtn.position(width - 280, 15);
  returnBtn.mousePressed(function () {
    location.replace(location.origin + '/index.html');
  });
  returnBtn.size(80, 20);
  returnBtn.addClass('menu');
  returnBtn.hide();

  undoBtn = createButton('Ångra');
  undoBtn.position(width - 380, 15);
  undoBtn.mousePressed(undoMove);
  undoBtn.size(80, 20);
  undoBtn.addClass('menu');
  undoBtn.hide();

  if (gameWon == false) {
    restart();
  }

  //Set sizes, margins and spaces
  resize();

  noLoop();
  redraw();
}

function draw() {
  background(45, 170, 45);
  if (dealing) {
    drawDecks();
    if (startDeck.size() > 0) {
      if (millis() > gameStartedTime + 2 * (53 - startDeck.size())) {
        dealCard(startDeck, ((52 - startDeck.size()) % 8) + 8);
      }
    } else {
      //Delat färdigt
      // dealingSound.play(0.1, 2, 0.5, 0.2);
      dealing = false;
      gameStarted = true;
      gameStartedTime = millis();
      resize();
      setTimeout(autoMove, 500);
      frameRate(5);
    }
    return;
  }
  if (gameWon === null) {
    //Draws start screen
    noStroke();
    fill(0);

    if (highScreen) {
      textSize(20);
    } else {
      textSize(40);
    }
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text('Tryck på knappen för att börja!', width / 2, height / 2 - 180);
    playAgainBtn.show();
    playAgainBtn.html('Börja');
  } else if (gameWon) {
    if (gameStarted) {
      console.log('Grattis!');
      winningSound.play();
      gameStarted = false;
    }
    noLoop(); //Stop looping draw function
    playAgainBtn.show();
    playAgainBtn.html('Spela igen?');
    restartBtn.hide();
    returnBtn.hide();
    undoBtn.hide();

    //Draws congratz message
    noStroke();
    fill(0);
    if (highScreen) {
      textSize(20);
    } else {
      textSize(40);
    }
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text('Grattis, du klarade det!', width / 2, height / 2 - 180);

    let minutesSinceStart = floor((millis() - gameStartedTime) / 1000);
    let time = floor(minutesSinceStart / 60) + ':' + (minutesSinceStart % 60);
    if (highScreen) {
      textSize(15);
    } else {
      textSize(30);
    }
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text('Din tid blev: ' + time + ' min.', width / 2, height / 2 - 140);
  } else {
    drawDecks();

    //Draws timer
    noStroke();
    fill(0);
    textSize(20);
    textAlign(RIGHT, TOP);
    let minutesSinceStart = floor((millis() - gameStartedTime) / 1000);
    let time = floor(minutesSinceStart / 60) + ':' + (minutesSinceStart % 60);
    text(time + '', width - 50, 8);

    //Om ett kort flyttas med musen ritas det vid muspekaren över de andra korten.
    if (mouseIsPressed && dragedCards !== []) {
      for (let i = 0; i < dragedCards.length; i++) {
        dragedCards[i].show(
          mouseX + dragedCardClicked.x,
          mouseY + dragedCardClicked.y + i * 40,
          cardWidth,
          cardHeight
        );
      }
    }

    //Kollar om ett kort flyttas och ökar då fps:en
    let cardMoving = false;
    for (let i = 0; i < piles.length; i++) {
      if (piles[i].getTopCard().moving) {
        cardMoving = true;
        break;
      }
    }
    if (cardMoving || dragedCards !== []) {
      frameRate(30);
    } else {
      frameRate(5);
    }
  }
}

function drawDecks() {
  let radius = 10;
  if (highScreen) {
    radius = 6;
  }
  //Cell piles
  for (let cd = 0; cd < 4; cd++) {
    if (piles[cd].size() == 0 || piles[cd].getTopCard().moving) {
      noFill();
      stroke(10, 240, 20);
      strokeWeight(2);
      rect(
        sideMargin + (cardWidth + xspace) * cd,
        topMargin,
        cardWidth,
        cardHeight,
        radius
      );
    } else {
      let card = piles[cd].getTopCard();
      if (!card.dragged && !card.moving) {
        //Shadow
        fill(10, 10, 10, 80);
        noStroke();
        rect(
          sideMargin + (cardWidth + xspace) * cd + 5,
          topMargin + 3,
          cardWidth,
          cardHeight,
          radius
        );

        //Card
        card.show(
          sideMargin + (cardWidth + xspace) * cd,
          topMargin,
          cardWidth,
          cardHeight
        );
      }
    }
  }
  //End piles
  for (let ed = 4; ed < 8; ed++) {
    if (piles[ed].size() == 0 || piles[ed].getTopCard().moving) {
      //Inner shadow
      fill(45, 170, 45);
      if (highScreen) {
        strokeWeight(3);
      } else {
        strokeWeight(6);
      }
      stroke(10, 10, 10, 100);
      rect(
        sideMargin + (cardWidth + xspace) * ed + 3,
        topMargin + 3,
        cardWidth - 6,
        cardHeight - 6,
        radius
      );

      //Symbol
      fill(0, 0, 0, 100);
      noStroke();
      if (highScreen) {
        textSize(22);
      } else {
        textSize(80);
      }
      textAlign(CENTER, CENTER);
      text(
        symbols[ed - 4],
        sideMargin + (cardWidth + xspace) * ed + cardWidth / 2,
        topMargin + cardHeight / 2
      );
    } else {
      //Shadow
      fill(10, 10, 10, 100);
      noStroke();
      rect(
        sideMargin + (cardWidth + xspace) * ed + 5,
        topMargin + 3,
        cardWidth,
        cardHeight,
        radius
      );
      if (!piles[ed].getTopCard().moving) {
        piles[ed]
          .getTopCard()
          .show(
            sideMargin + (cardWidth + xspace) * ed,
            topMargin,
            cardWidth,
            cardHeight
          );
      }
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
      rect(xPos, ppTopMargin, cardWidth, cardHeight, radius);
    } else {
      //Draws the shadow of the pile
      let pileYSpace = yspace;
      if (
        height <
        (pile.size() - 1) * pileYSpace + ppTopMargin + cardHeight + 10
      ) {
        pileYSpace =
          (height - ppTopMargin - cardHeight - 10) / (pile.size() - 1);
      }
      let pileSize =
        pile.getTopCard().dragged || pile.getTopCard().moving
          ? piles[pd].size() - 2
          : piles[pd].size() - 1;
      let shadowHeight = pileYSpace * pileSize + cardHeight;
      fill(10, 10, 10, 80);
      noStroke();
      rect(xPos + 8, ppTopMargin + 5, cardWidth, shadowHeight, radius);

      //Draws all the cards for every pile
      for (let c = 0; c < pile.size(); c++) {
        let card = pile.deck[c];
        if (!card.dragged && !card.moving) {
          card.show(xPos, ppTopMargin + pileYSpace * c, cardWidth, cardHeight);
        }
      }
    }
  }

  drawMovingCards();
}

function drawMovingCards() {
  for (let i = 0; i < movingCards.length; i++) {
    // console.log("Rita");
    const data = movingCards[i];
    const card = data.card;
    if (card.dragged) {
      continue;
    }

    let newX = 0;
    let newY = 0;

    if (data.newPile < 8) {
      newX = sideMargin + (cardWidth + xspace) * movingCards[i].newPile;
      newY = topMargin;
    } else {
      let pileYSpace = yspace;
      if (
        height <
        (piles[movingCards[i].newPile].size() - 1) * pileYSpace +
          ppTopMargin +
          cardHeight +
          10
      ) {
        pileYSpace =
          (height - ppTopMargin - cardHeight - 10) /
          (piles[movingCards[i].newPile].size() - 1);
      }
      newX = sideMargin + (cardWidth + xspace) * (movingCards[i].newPile - 8);
      newY = ppTopMargin + pileYSpace * (data.pileSpot - 1);
    }

    // console.log("NewX " + newX + " & NewY " + newY);

    let d = dist(card.x, card.y, newX, newY);
    // console.log(d + " & " + card.x + " && " + card.y);

    if (d < animationSpeed) {
      card.moving = false;
      card.show(newX, newY, cardWidth, cardHeight);
      movingCards.splice(i, 1);
    } else {
      card.speed.set(newX - card.x, newY - card.y);
      card.speed.setMag(animationSpeed);
      card.show(
        card.x + card.speed.x,
        card.y + card.speed.y,
        cardWidth,
        cardHeight
      );
    }
  }
}

function keyPressed() {
  if (keyCode == '32') {
    if (!gameWon && moveHistory.length != 0) {
      undoMove();
    }
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
  resize();
  gameWon = false;
  dealing = true;
  frameRate(60);
  piles = [
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
    new Deck([]),
    new Deck([]),
  ];
  movingCards = [];
  startDeck = newDeckOfCards();
  startDeck.shuffle();
  gameStartedTime = millis();
  // dealCards(startDeck);

  playAgainBtn.hide();
  restartBtn.show();
  returnBtn.show();
  undoBtn.show();

  loop();

  setTimeout(function () {
    gameStarted = true;
  }, 1);
}

function movebleCards(pileNr) {
  let cellSpots = 0;
  let pileSpots = 0;
  let spots = 0;
  for (let i = 0; i < 4; i++) {
    if (piles[i].size() == 0) {
      cellSpots++;
    }
  }
  for (let i = 8; i < 16; i++) {
    if (i != pileNr) {
      if (piles[i].size() == 0) {
        pileSpots++;
      }
    }
  }

  spots = (cellSpots + 1) * (pileSpots + 1);

  return spots;
}

function undoMove() {
  if (moveHistory.length < 1) {
    return;
  }
  let move = moveHistory.pop();
  if (move.cards != null) {
    piles[move.pile2].moveCards(
      piles[move.pile2].size() - move.cards.length,
      piles[move.pile1]
    );
    cardSound.play();
  } else {
    piles[move.pile2].moveTopCard(piles[move.pile1]);
    cardSound.play();
  }
}

function resize() {
  //1400 900 1,55
  let ww = windowWidth;
  let wh = windowHeight;
  if (windowWidth > 1550) {
    ww = 1550;
  }
  resizeCanvas(ww, wh);

  ratio = floor((ww / wh) * 100) / 100;

  if (ratio < 1.3) {
    //Om bredden är mindre än en halv gång större
    //korten anpassas efter bredden - smal skärm
    highScreen = true;
    sideMargin = ww / 28;
    cardWidth = ww / 12;
    cardHeight = cardWidth * 1.7;
    yspace = cardHeight / (ratio + 1);
    topMargin = wh / 18;
    ppTopMargin = topMargin * 1.8 + cardHeight;
    xspace = (width - 2 * sideMargin - 8 * cardWidth) / 7;

    //Buttons
    let btnSpace = 10;
    let btnW = (width - btnSpace * 5) / 4;
    playAgainBtn.size(200, 50);
    playAgainBtn.position((width - 200) / 2, height / 2 - 80);

    undoBtn.size(btnW, 20);
    undoBtn.position(btnSpace * 2, 15);
    restartBtn.size(btnW, 20);
    restartBtn.position(btnW + btnSpace * 3, 15);
    returnBtn.size(btnW, 20);
    returnBtn.position(btnW * 2 + btnSpace * 4, 15);

    fontRatio = ww / 500;
  } else {
    //Korten anpassas efter höjden - bredskärm
    highScreen = false;
    sideMargin = ww / 28;
    yspace = cardHeight / 2.9;
    cardWidth = wh / 7.2;
    cardHeight = cardWidth * 1.5;
    topMargin = wh / 22;
    ppTopMargin = topMargin * 1.8 + cardHeight;
    xspace = (width - 2 * sideMargin - 8 * cardWidth) / 7;
    playAgainBtn.position((width - 200) / 2, height / 2 - 80);
    playAgainBtn.size(200, 50);
    restartBtn.size(80, 20);
    restartBtn.position(width - 180, 15);
    returnBtn.size(80, 20);
    returnBtn.position(width - 280, 15);
    undoBtn.size(80, 20);
    undoBtn.position(width - 380, 15);

    fontRatio = (wh * 1.5) / 1200;
  }
  resizeCanvas(ww, wh);
}

function windowResized() {
  resize();
}

function fusk() {
  piles[0 + 8].sort();
  piles[1 + 8].sort();
  piles[2 + 8].sort();
  piles[3 + 8].sort();
  piles[4 + 8].sort();
  piles[5 + 8].sort();
  piles[6 + 8].sort();
  piles[7 + 8].sort();
}

function getMouseTravelDist(pos1, pos2) {
  let x = pos1.x - pos2.x;
  let y = pos1.y - pos2.y;
  return floor(sqrt(x ** 2 + y ** 2));
}
