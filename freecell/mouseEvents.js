function touchStarted() {
  if (gameWon || gameWon === null || !gameStarted) {
    falsePress = true;
    return;
  }

  //Detect doubleclick
  if (millis() - mousePressedMillis < 200) {
    falsePress = true;
    console.log('Quick press');
    return;
  }
  falsePress = false;
  mousePressedMillis = millis();
  mousePressedSpot = { x: mouseX, y: mouseY };
  //Finds the card wich should be dragged
  let cardSpot = findCardSpot(mouseX, mouseY);
  //Checks if there was a card at the pressspot
  if (cardSpot == null || (cardSpot.pileNr > 3 && cardSpot.pileNr < 8)) {
    return;
  }

  //If a card is already selected and is not the same - skip drag
  if (ppPressed || cpPressed) {
    if (cardSpot.pileNr != prevCardSpot.pileNr) {
      //Don't return if selected card
      return;
    }
  }

  if (cardSpot.pileNr > 7) {
    if (cardSpot.cardNr == piles[cardSpot.pileNr].size() - 1) {
      dragedCards[0] = getCard(cardSpot);
    } else {
      /*Multiple cards selected*/
      //Creates an array of the selected cards
      selectedCards = piles[cardSpot.pileNr].deck.slice(cardSpot.cardNr);

      //The cards needs to be in order
      if (inOrderHL(selectedCards) && inAltColor(selectedCards)) {
        // console.log(selectedCards);
        if (movebleCards(cardSpot.pileNr) >= selectedCards.length) {
          dragedCards = selectedCards;
          for (card of dragedCards) {
            card.dragged = true;
          }
        } else {
          errorSound.play();
          clearSelection();
          return;
        }
      } else {
        errorSound.play();
        clearSelection();
        return;
      }
    }
  } else if (cardSpot.pileNr < 4) {
    if (cardSpot.cardNr == piles[cardSpot.pileNr].size() - 1) {
      dragedCards[0] = getCard(cardSpot);
      cpPressed = true;
    } else {
      clearSelection();
      return;
    }
  }

  if (dragedCards !== []) {
    if (getCard(cardSpot)) {
      dragedCardClicked = {
        x: dragedCards[0].x - mouseX,
        y: dragedCards[0].y - mouseY,
      };
      for (card of dragedCards) {
        card.dragged = true;
      }
      prevCardSpot = cardSpot;
      dragedCardClicked.dragged = true;
    }
  }
}

function touchEnded() {
  if (gameWon || gameWon === null || falsePress) {
    return;
  }

  let cardSpot = findCardSpot(mouseX, mouseY);
  if (cardSpot == null) {
    clearSelection();
    return;
  }

  //Kollar om det är ett vanligt tryck och inte ett tryck-dra-släpp
  let dist = getMouseTravelDist(mousePressedSpot, { x: mouseX, y: mouseY });
  if (dist < 30 || dragedCards == []) {
    if (dragedCards !== null) {
      for (card of dragedCards) {
        card.dragged = false;
      }
      dragedCards = [];
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

  if (dragedCards === []) {
    //If there was a drag but not a dragged card
    clearSelection();
    return;
  }

  //Check if it was the same pile
  if (cardSpot.pileNr == prevCardSpot.pileNr) {
    clearSelection();
    firstPress(cardSpot);
    console.log('Same');
    return;
  }
  //Finding the new card
  if (cardSpot.pileNr > 7) {
    newPile = piles[cardSpot.pileNr];
    newCard = newPile.getTopCard();
  } else if (cardSpot.pileNr > 3) {
    newPile = piles[cardSpot.pileNr];
    if (newPile.size() > 0) {
      newCard = newPile.getTopCard();
    }
  } else if (cardSpot.pileNr < 4) {
    newPile = piles[cardSpot.pileNr];
    if (newPile.size() > 0) {
      newCard = newPile.getTopCard();
    }
  } else {
    console.log('Något blev fel!');
    errorSound.play();
  }

  if (prevCardSpot.pileNr > 7) {
    prevPile = piles[prevCardSpot.pileNr];
  } else if (prevCardSpot.pileNr < 4) {
    prevPile = piles[prevCardSpot.pileNr];
  }

  if (cardSpot.pileNr < 4) {
    //Free cells
    //Om högen är tom flytta oavsett
    if (newPile.size() == 0 && dragedCards.length < 2) {
      moveCards(prevCardSpot.pileNr, cardSpot.pileNr, dragedCards);
    } else {
      console.log('Korten ska ligga med växlande färg!');
      errorSound.play();
    }
  } else if (cardSpot.pileNr < 8) {
    //Om kortet drars till bas högarna
    if (dragedCards[0].suit == cardSpot.pileNr - 4) {
      let val = 0;
      if (newPile.size > 0) {
        val = newCard.value;
      }
      if (dragedCards[0].value == val + 1) {
        moveCards(prevCardSpot.pileNr, cardSpot.pileNr, dragedCards);
      } else {
        console.log('Korten måste liggar i ordningen äss till kung!');
        errorSound.play();
      }
    } else {
      console.log('Korten måste liggar i rätt färg!');
      errorSound.play();
    }
  } else if (cardSpot.pileNr < 16) {
    if (newPile.size() == 0) {
      //Om högen är tom flytta oavsett
      moveCards(prevCardSpot.pileNr, cardSpot.pileNr, dragedCards);
    } else if (dragedCards[0].isRed() != newCard.isRed()) {
      //Annars kontrollera att det är rätt färg och värde
      if (dragedCards[0].value == newPile.getTopCard().value - 1) {
        moveCards(prevCardSpot.pileNr, cardSpot.pileNr, dragedCards);
      } else {
        console.log('Korten ska ligga i ordningen kung till äss!');
        errorSound.play();
      }
    } else {
      console.log('Korten ska ligga med växlande färg!');
      errorSound.play();
    }
  } else {
    clearSelection();
    return;
  }

  for (card of dragedCards) {
    card.dragged = false;
    dragedCards.selected = false;
  }
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
        if (
          card.suit == i - 4 &&
          card.value - 1 == piles[i].getTopCard().value
        ) {
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
              console.log(
                'Du kan max flytta ' + movebleCards(cardSpot.pileNr) + ' hit!'
              );
              errorSound.play();
            }
          } else {
            //If only one card just moved
            moveCard(prevCardSpot.pileNr, cardSpot.pileNr);
          }
        } else if (selectedCards.length > 0) {
          //The pile moving to is not empty and there are multiple cards moving
          if (
            pile1.deck[prevCardSpot.cardNr].isRed() !=
            pile2.getTopCard().isRed()
          ) {
            if (
              pile1.deck[prevCardSpot.cardNr].value ==
              pile2.getTopCard().value - 1
            ) {
              if (movebleCards(cardSpot.pileNr) >= selectedCards.length) {
                console.log('Moved');
                moveCards(prevCardSpot.pileNr, cardSpot.pileNr, selectedCards);
              } else {
                console.log(
                  'Du kan max flytta ' +
                    movebleCards(cardSpot.pileNr) +
                    ' kort hit!'
                );
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
          } else if (
            cellPile.getTopCard().isRed() != playingPile.getTopCard().isRed()
          ) {
            if (
              cellPile.getTopCard().value ==
              playingPile.getTopCard().value - 1
            ) {
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
