function moveCard(pileNr1, pileNr2, auto) {
  piles[pileNr1].moveTopCard(piles[pileNr2]);
  piles[pileNr2].getTopCard().moving = true;
  movingCards.push({
    card: piles[pileNr2].getTopCard(),
    prevPile: pileNr1,
    newPile: pileNr2,
    pileSpot: piles[pileNr2].size(),
  });
  moveHistory.push({
    pile1: pileNr1,
    pile2: pileNr2,
    cards: null,
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
      pileSpot: piles[pileNr2].size() + i,
    });
  }

  //Flyttar korten
  piles[pileNr1].moveCards(
    piles[pileNr1].size() - cards.length,
    piles[pileNr2]
  );

  //Lägger till draget i historiken
  moveHistory.push({
    pile1: pileNr1,
    pile2: pileNr2,
    cards: cards,
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
      dealCard(dealDeck, (i % 8) + 8);
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
    pileSpot: piles[pileNr].size(),
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
    let cardOne = piles[4 + ((topCard.suit + 1) % 4)].getTopCard();
    let cardTwo = piles[4 + ((topCard.suit + 3) % 4)].getTopCard();
    if (cardOne.value < cardTwo.value) {
      lowestOtherColor = cardOne.value;
    } else {
      lowestOtherColor = cardTwo.value;
    }

    if (
      topCard.value <= lowestOtherColor + 2 &&
      topCard.value == endCard.value + 1
    ) {
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
    cardNr: null,
  };
  dragedCardClicked = {
    x: 0,
    y: 0,
    dragging: false,
  };
  for (let i = 0; i < selectedCards.length; i++) {
    selectedCards[i].selected = false;
  }
  selectedCards = [];
  if (dragedCards !== []) {
    for (card of dragedCards) {
      card.dragged = false;
    }
    dragedCards = [];
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
        if (
          x > (cardWidth + xspace) * i &&
          x < cardWidth + (cardWidth + xspace) * i
        ) {
          pileNr = i;
          cardNr = 0;
          break;
        }
      }
    } else if (y > ppTopMargin && y < height) {
      //Playing piles area
      for (let i = 0; i < 8; i++) {
        if (
          x > (cardWidth + xspace) * i &&
          x < cardWidth + (cardWidth + xspace) * i
        ) {
          pileNr = i + 8;
          break;
        }
      }
      if (pileNr === null) {
        return null;
      }

      let pileYSpace = yspace;
      if (
        height <
        (piles[pileNr].size() - 1) * pileYSpace + ppTopMargin + cardHeight + 10
      ) {
        pileYSpace =
          (height - ppTopMargin - cardHeight - 10) / (piles[pileNr].size() - 1);
      }

      if (piles[pileNr].size() == 0) {
        cardNr = 0;
      } else if (
        y <
        ppTopMargin + pileYSpace * (piles[pileNr].size() - 1) + cardHeight
      ) {
        //Checks wich card was pressed
        for (let i = 0; i < piles[pileNr].size(); i++) {
          if (
            y > ppTopMargin + pileYSpace * i &&
            y < ppTopMargin + pileYSpace * (i + 1)
          ) {
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
      cardNr: cardNr,
    };
  } else {
    return null;
  }
}
