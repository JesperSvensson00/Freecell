/*
Dra flera kort
Fixa bugg med essen i början
Fixa bugg med korten när dem delas ut första rundan
*/

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
	cardNr: null
};
var prevCard = null;
var selectedCards = [];
var dragedCard = null;
var dragedCardClicked = {
	x: 0,
	y: 0,
	dragging: false
};

var mousePressedMillis = 0;
var falsePress = false;

var moveHistory = [];

//Spacings and graphics info
var sideMargin = 50;
var xspace = 0;
var yspace = 55;
var ppTopMargin = 260;
var topMargin = 40;
var ratio;
var symbols = [ '♥', '♠', '♦', '♣' ];
var movingCards = [];
var animationSpeed = 200;

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
	// Disable scrolling.
	document.ontouchmove = function(e) {
		e.preventDefault();
	};
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
	returnBtn.mousePressed(function() {
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
				dealCard(startDeck, (52 - startDeck.size()) % 8 + 8);
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
		let time = floor(minutesSinceStart / 60) + ':' + minutesSinceStart % 60;
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
		let time = floor(minutesSinceStart / 60) + ':' + minutesSinceStart % 60;
		text(time + '', width - 50, 8);

		//Om ett kort flyttas med musen ritas det vid muspekaren över de andra korten.
		if (mouseIsPressed && dragedCard !== null) {
			dragedCard.show(mouseX + dragedCardClicked.x, mouseY + dragedCardClicked.y, cardWidth, cardHeight);
		}

		//Kollar om ett kort flyttas och ökar då fps:en
		let cardMoving = false;
		for (let i = 0; i < piles.length; i++) {
			if (piles[i].getTopCard().moving) {
				cardMoving = true;
				break;
			}
		}
		if (cardMoving || dragedCard !== null) {
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
			rect(sideMargin + (cardWidth + xspace) * cd, topMargin, cardWidth, cardHeight, radius);
		} else {
			let card = piles[cd].getTopCard();
			if (!card.dragged && !card.moving) {
				//Shadow
				fill(10, 10, 10, 80);
				noStroke();
				rect(sideMargin + (cardWidth + xspace) * cd + 5, topMargin + 3, cardWidth, cardHeight, radius);

				//Card
				card.show(sideMargin + (cardWidth + xspace) * cd, topMargin, cardWidth, cardHeight);
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
			rect(sideMargin + (cardWidth + xspace) * ed + 3, topMargin + 3, cardWidth - 6, cardHeight - 6, radius);

			//Symbol
			fill(0, 0, 0, 100);
			noStroke();
			if (highScreen) {
				textSize(22);
			} else {
				textSize(80);
			}
			textAlign(CENTER, CENTER);
			text(symbols[ed - 4], sideMargin + (cardWidth + xspace) * ed + cardWidth / 2, topMargin + cardHeight / 2);
		} else {
			//Shadow
			fill(10, 10, 10, 100);
			noStroke();
			rect(sideMargin + (cardWidth + xspace) * ed + 5, topMargin + 3, cardWidth, cardHeight, radius);
			if (!piles[ed].getTopCard().moving) {
				piles[ed].getTopCard().show(sideMargin + (cardWidth + xspace) * ed, topMargin, cardWidth, cardHeight);
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
			if (height < (pile.size() - 1) * pileYSpace + ppTopMargin + cardHeight + 10) {
				pileYSpace = (height - ppTopMargin - cardHeight - 10) / (pile.size() - 1);
			}
			let pileSize =
				pile.getTopCard().dragged || pile.getTopCard().moving ? piles[pd].size() - 2 : piles[pd].size() - 1;
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
			if (height < (piles[movingCards[i].newPile].size() - 1) * pileYSpace + ppTopMargin + cardHeight + 10) {
				pileYSpace = (height - ppTopMargin - cardHeight - 10) / (piles[movingCards[i].newPile].size() - 1);
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
			card.show(card.x + card.speed.x, card.y + card.speed.y, cardWidth, cardHeight);
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

function touchStarted() {
	if (gameWon || gameWon === null || !gameStarted) {
		falsePress = true;
		return;
	}
	if (millis() - mousePressedMillis < 200) {
		falsePress = true;
		return;
	}
	falsePress = false;
	mousePressedMillis = millis();
	//Finds the card wich should be dragged
	let cardSpot = findCardSpot(mouseX, mouseY);
	//Checks if there was a card at the pressspot
	if (cardSpot == null || (cardSpot.pileNr > 3 && cardSpot.pileNr < 8)) {
		return;
	}

	//If a card is already selected and is not the same - skip drag
	if (ppPressed || cpPressed) {
		//    if (prevCardSpot !== null) {
		if (cardSpot.pileNr != prevCardSpot.pileNr) {
			//Don't return if selected card
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

function touchEnded() {
	if (gameWon || gameWon === null || falsePress) {
		return;
	}

	let cardSpot = findCardSpot(mouseX, mouseY);
	if (cardSpot == null) {
		if (dragedCard !== null) {
			cardSound.play();
		}

		clearSelection();
		return;
	}
	//Check if it was a short press and then preform a regular press
	if (millis() - mousePressedMillis < 100 || cardSpot.pileNr == prevCardSpot.pileNr || dragedCard === null) {
		if (dragedCard !== null) {
			dragedCard.dragged = false;
			dragedCard = null;
		}

		//Check if it is the first or second press
		if (!ppPressed && !epPressed && !cpPressed) {
			/*First press*/

			firstPress(cardSpot);
		} else {
			/*Second press*/ secondPress(cardSpot);
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
			console.log('Korten ska ligga i ordningen kung till äss!');
			errorSound.play();
			dragedCard.moving = true;
			movingCards.push({
				card: dragedCard,
				prevPile: null,
				newPile: prevCardSpot.pileNr
			});
		}
	} else {
		console.log('Korten ska ligga med växlande färg!');
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
	if (gameWon || gameWon === null) {
		return;
	}
	clearSelection();
	let cardSpot;
	cardSpot = findCardSpot(mouseX, mouseY);

	if (cardSpot === null) {
		clearSelection();
		return;
	}
	if (cardSpot.pileNr > 7) {
		//If it is in the playing piles
		if (cardSpot.cardNr == piles[cardSpot.pileNr].size() - 1) {
			//If it is the top card

			let card = piles[cardSpot.pileNr].getTopCard();

			//Tries to move it to the basepiles
			for (let i = 4; i < 8; i++) {
				if (card.suit == i - 4 && card.value - 1 == piles[i].getTopCard().value) {
					moveCard(cardSpot.pileNr, i);
					return;
				}
			}

			//Moves the clicked card to the cellpiles if there is a spot
			for (let i = 0; i < 4; i++) {
				//Loops through the cellpiles
				if (piles[i].size() == 0) {
					//If the pile is empty
					moveCard(cardSpot.pileNr, i);
					return;
				}
			}
		} else {
			//Not the top card - then move top card to cellpile
			//Moves the clicked card to the cellpiles if there is a spot
			let card = piles[cardSpot.pileNr].getTopCard();
			for (let i = 0; i < 4; i++) {
				//Loops through the cellpiles
				if (piles[i].size() == 0) {
					//If the pile is empty
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
		console.log('First fail');
		errorSound.play();
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
				console.log(selectedCards);
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
		console.log('Du kan inte flytta kort från bashögarna!');
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
				//If the move is to a playingpile
				let pile1 = piles[prevCardSpot.pileNr];
				let pile2 = piles[cardSpot.pileNr];
				if (pile2.size() == 0) {
					//PP to empty PP
					if (selectedCards.length > 0) {
						//If there is multiple cards moving
						if (movebleCards(cardSpot.pileNr) >= selectedCards.length) {
							moveCards(prevCardSpot.pileNr, cardSpot.pileNr, selectedCards);
						} else {
							console.log('Du kan max flytta ' + movebleCards(cardSpot.pileNr) + ' hit!');
							errorSound.play();
						}
					} else {
						//If only one card just move
						moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
					}
				} else if (selectedCards.length > 0) {
					//The pile moving to is not empty and there are multiple cards moving
					if (pile1.deck[prevCardSpot.cardNr].isRed() != pile2.getTopCard().isRed()) {
						if (pile1.deck[prevCardSpot.cardNr].value == pile2.getTopCard().value - 1) {
							if (movebleCards(cardSpot.pileNr) >= selectedCards.length) {
								console.log('Moved');
								moveCards(prevCardSpot.pileNr, cardSpot.pileNr, selectedCards);
							} else {
								console.log('Du kan max flytta ' + movebleCards(cardSpot.pileNr) + ' kort hit!');
								errorSound.play();
							}
						} else {
							console.log('Korten ska ligga i ordningen kung till äss!');
							errorSound.play();
						}
					} else {
						console.log('Korten ska ligga med växlande färg!');
						errorSound.play();
					}
				} else if (pile1.getTopCard().isRed() != pile2.getTopCard().isRed()) {
					//One card PP to PP
					if (pile1.getTopCard().value == pile2.getTopCard().value - 1) {
						moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
					} else {
						console.log('Korten ska ligga i ordningen kung till äss!');
						errorSound.play();
					}
				} else {
					console.log('Korten ska ligga med växlande färg!');
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
						console.log('Korten ska ha samma färg i bashögarna!');
						errorSound.play();
					}
				} else {
					console.log('Korten ska ligga i ordning äss till kung i bashögarna!');
					errorSound.play();
				}
			} else {
				//PP to CP
				let cellPile = piles[cardSpot.pileNr];
				let playingPile = piles[prevCardSpot.pileNr];
				if (cellPile.size() == 0) {
					moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
				} else {
					console.log('Det får bara finnas ett kort här!');
					errorSound.play();
				}
			}
		} else if (cpPressed) {
			//Try move from cell piles
			if (cardSpot.pileNr > 7) {
				if (cardSpot.pileNr > 7) {
					let cellPile = piles[prevCardSpot.pileNr];
					let playingPile = piles[cardSpot.pileNr];
					if (playingPile.size() == 0) {
						//CP to empty PP
						moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
					} else if (cellPile.getTopCard().isRed() != playingPile.getTopCard().isRed()) {
						if (cellPile.getTopCard().value == playingPile.getTopCard().value - 1) {
							moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
						} else {
							console.log('Korten ska ligga i ordningen kung till äss!');
							errorSound.play();
						}
					} else {
						console.log('Korten ska ligga med växlande färg!');
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
						console.log('Korten ska ha samma färg i bashögarna!');
						errorSound.play();
					}
				} else {
					console.log('Korten ska ligga i ordning äss till kung i bashögarna!');
					errorSound.play();
				}
			} else {
				let cellPile1 = piles[cardSpot.pileNr];
				let cellPile2 = piles[prevCardSpot.pileNr];
				if (cellPile1.size() == 0) {
					moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
				} else {
					console.log('Det får bara finnas ett kort här!');
					errorSound.play();
				}
			}
		}
		clearSelection();
	}
}

function moveCard(pileNr1, pileNr2, auto) {
	piles[pileNr1].moveTopCard(piles[pileNr2]);
	piles[pileNr2].getTopCard().moving = true;
	movingCards.push({
		card: piles[pileNr2].getTopCard(),
		prevPile: pileNr1,
		newPile: pileNr2,
		pileSpot: piles[pileNr2].size()
	});
	moveHistory.push({
		pile1: pileNr1,
		pile2: pileNr2,
		cards: null
	});
	cardSound.play();
	if (auto !== true) {
		autoMove();
	}
	gameWon = checkIfWon();
}

function moveCards(pileNr1, pileNr2, cards) {
	//Lägger till alla flyttade kort i animations listan
	for (let i = 0; i < cards.length; i++) {
		cards[i].moving = true;
		movingCards.push({
			card: cards[i],
			prevPile: pileNr1,
			newPile: pileNr2,
			pileSpot: piles[pileNr2].size() + i
		});
	}

	//Flyttar korten
	piles[pileNr1].moveCards(piles[pileNr1].size() - cards.length, piles[pileNr2]);

	//Lägger till draget i historiken
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
	// let size = dealDeck.size();
	// for (let i = 0; i < size; i++) {
	//   //Denna ska aktiveras i intervaller
	//   dealCard(dealDeck, (i % 8) + 8);
	// }
	let time = gameStartedTime;
	let i = 0;
	while (dealDeck.size() > 0) {
		if (millis() > time + 40) {
			time = millis();
			dealCard(dealDeck, i % 8 + 8);
		}
		i++;
	}

	dealingSound.play(0.1, 2, 0.5, 0.2);
	resize();
	setTimeout(autoMove, 500);
}

function dealCard(deck, pileNr) {
	let card = deck.moveTopCard(piles[pileNr]);

	card.moving = true;
	movingCards.push({
		card: card,
		prevPile: null,
		newPile: pileNr,
		pileSpot: piles[pileNr].size()
	});
	if (pileNr == 8 || pileNr == 12) {
		cardSound.play();
	}
}

function autoMove() {
	//Checks wich value the lowest topcard in the basepiles has
	let lowestCardVal = 14;
	for (let i = 4; i < 8; i++) {
		if (lowestCardVal >= piles[i].getTopCard().value) {
			lowestCardVal = piles[i].getTopCard().value;
		}
	}

	//If the lowest card is 13(king) the game is over
	if (lowestCardVal >= 13) {
		gameWon = true;
		return;
	}

	for (let i = 0; i < 16; i++) {
		//Loops throug the piles
		if (i > 3 && i < 8) {
			//Skipps the endpiles
			continue;
		}

		let topCard = piles[i].getTopCard(); //Top card of the pile

		//Move ace
		if (piles[topCard.suit + 4].size() == 0 && topCard.value == 1) {
			moveCard(i, topCard.suit + 4, true);
			setTimeout(autoMove, 350 - 18 * lowestCardVal); //Speeds up at the end
			return;
		}

		let endCard = piles[topCard.suit + 4].getTopCard(); //Where the topCard is going if in order

		//Lowest value of the other color of the topCard
		let lowestOtherColor = 0;
		let cardOne = piles[4 + (topCard.suit + 1) % 4].getTopCard();
		let cardTwo = piles[4 + (topCard.suit + 3) % 4].getTopCard();
		if (cardOne.value < cardTwo.value) {
			lowestOtherColor = cardOne.value;
		} else {
			lowestOtherColor = cardTwo.value;
		}

		if (topCard.value <= lowestOtherColor + 2 && topCard.value == endCard.value + 1) {
			moveCard(i, topCard.suit + 4, true);
			setTimeout(autoMove, 350 - 18 * lowestCardVal); //Speeds up at the end
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
			console.log('Det finns inget kort här!');
			return null;
		} else {
			card = piles[cardSpot.pileNr].deck[cardSpot.cardNr];
		}
	} else if (cardSpot.pileNr > 3) {
		//Endpiles
		if (piles[cardSpot.pileNr].size() == 0) {
			console.log('Det finns inget kort här!');
			return null;
		} else {
			card = piles[cardSpot.pileNr].deck[cardSpot.cardNr];
		}
	} else {
		//Cellpiles
		if (piles[cardSpot.pileNr].size() == 0) {
			console.log('Det finns inget kort här!');
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
		} else if (y > ppTopMargin && y < height) {
			//Playing piles area
			for (let i = 0; i < 8; i++) {
				if (x > (cardWidth + xspace) * i && x < cardWidth + (cardWidth + xspace) * i) {
					pileNr = i + 8;
					break;
				}
			}
			if (pileNr === null) {
				return null;
			}

			let pileYSpace = yspace;
			if (height < (piles[pileNr].size() - 1) * pileYSpace + ppTopMargin + cardHeight + 10) {
				pileYSpace = (height - ppTopMargin - cardHeight - 10) / (piles[pileNr].size() - 1);
			}

			if (piles[pileNr].size() == 0) {
				cardNr = 0;
			} else if (y < ppTopMargin + pileYSpace * (piles[pileNr].size() - 1) + cardHeight) {
				//Checks wich card was pressed
				for (let i = 0; i < piles[pileNr].size(); i++) {
					if (y > ppTopMargin + pileYSpace * i && y < ppTopMargin + pileYSpace * (i + 1)) {
						cardNr = i;
						break;
					} else {
						cardNr = piles[pileNr].size() - 1;
					}
				}
			}
		}
		if (pileNr === null) {
			return null;
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
		new Deck([])
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

	setTimeout(function() {
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

	ratio = floor(ww / wh * 100) / 100;

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
