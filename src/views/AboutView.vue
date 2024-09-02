<template>
  <div class="about">
    <h1>Forty thieves solitaire</h1>
    <p>
      <strong class="subhead">Game</strong>
      Forty Thieves (the name comes from the fact that 40 cards are initially dealt with the tableau) is also known as
      Big Forty, Le Cadran, Napoleon at St. Helena, and Roosevelt at San Juan.

      <strong class="subhead">Deck</strong>
      Forty Thieves is played with two standard 52-card decks, for a total of 104 cards. Ace is low, King is high.

      <strong class="subhead">Goal</strong>
      The goal of Forty Thieves is to build eight foundations up from Ace to King, keeping the suit.

      <strong class="subhead">Moving Cards</strong>
      Only one card at a time may be moved.<br />

      In the tableau, only the top card of each column is available to be moved. Cards in the tableau may be moved
      either to a foundation or to another column in the tableau.<br /><br />

      In the tableau, a card can only be added to a column if it is one rank lower and the same suit as the card it is
      being played on.<br />
      <b>EXAMPLE</b>: The 10 of Hearts can only be played on the Jack of Hearts.<br /><br />

      A foundation must be started with an Ace. A card can only be added to a foundation if it is one rank higher and
      the same suit as the card it is being played on.<br />
      <b>EXAMPLE</b>: The 4 of Spades can only be played on the 3 of Spades.<br /><br />

      The top card of the stock can be drawn at any time and played to a foundation, played to a column in the tableau,
      or added face up to the discard pile.<br />

      The top card of the discard pile can be played to a foundation or to a column in the tableau at any time.<br />

      If there is an empty column in the tableau, any card which can be legally moved may be played to that
      column.<br />

      There is never a redeal in Forty Thieves.<br />

      <strong class="subhead">Winning</strong>
      A player wins Forty Thieves if all eight foundations are completely built, from Ace to King.

      <strong class="subhead">Controls</strong>
      To move cards, simply click on it.<br />
      If card can be moved, it will be highlighted (only if helper enabled).<br /><br />

      To cancel (or undo) the move, click <b>mouse right button</b> anywhere on game field.<br /><br />

      To disable automation (auto move cards to foundation), uncheck <b>"Auto Mode"</b> on settings page.
    </p>
  </div>
</template>

<style scoped>
.about {
  height: calc(100vh - 40px);
  padding: calc(var(--default-padding) * 4);
  overflow-y: scroll;
}

b {
  font-weight: 700;
}

.about h1 {
  margin: 0 auto;
  max-width: 40vw;
}

.about p {
  margin: 0 auto;
  max-width: 40vw;
  margin-top: 1em;
  font-size: 1.1em;
  padding-top: calc(var(--default-padding) * 4) 0;
}

.subhead {
  display: block;
  margin-top: 1em;
  font-size: 1.2em;
  font-weight: bold;
  color: var(--primary-color);
}
</style>
