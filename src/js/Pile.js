import Card from './Card'

const Pile = function (stage, calculate, interaction, faceUp) {
  const self = this
  self.stage = typeof stage === 'string'
    ? document.querySelector(stage)
    : stage
  self.stage.classList.add('stage')
  self.calculate = calculate || ((c, i, l) => {
    c.position.left = i / 54 / 100
    c.position.top = i / 54 / 100
    c.position.zIndex = i
  })
  self.interaction = interaction || ((c, i, l) => {
    c.onpanstart = function () {}
    c.onpanmove = function () {}
    c.onpanend = function () {}
    c.ontap = function () {}
  })
  self.cards = []
  self.faceUp = faceUp
}

Pile.prototype.add = async function (id, type, position, atIndex) {
  const self = this
  atIndex = atIndex || self.cards.length
  position = Object.assign({}, position)
  const card = new Card(self.stage, id, type, position)
  await card.init()
  card.interact(true)
  self.cards.splice(atIndex, 0, card)
  return card
}

Pile.prototype.addDeck = async function (idPrefix) {
  const self = this
  const types = ['S', 'H', 'C', 'D']
  idPrefix = idPrefix || ''
  const result = []
  const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  for (const t of types) {
    for (const n of numbers) {
      const card = await self.add(
        idPrefix + '-' + n + t,
        n + t
      )
      result.push(card)
    }
  }
  return result
}

Pile.prototype.shuffle = function (cards) {
  self.detachInteraction()
  for (let i = self.cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [self.cards[i], self.cards[j]] = [self.cards[j], self.cards[i]]
  }
  self.updatePosition()
  self.attachInteraction()
}

Pile.prototype.exchange = function (card, anotherPile, animate, atIndex) {
  const self = this
  if (self.cards.indexOf(card) > -1) {
    atIndex = atIndex || anotherPile.cards.length
    self.detachInteraction()
    anotherPile.detachInteraction()
    self.cards.splice(self.cards.indexOf(card), 1)
    anotherPile.cards.splice(atIndex, 0, card)
    self.updatePosition(animate)
    anotherPile.updatePosition(animate)
    self.attachInteraction()
    anotherPile.attachInteraction()
  }
}

Pile.prototype.updatePosition = async function (animate) {
  const self = this
  self.cards.forEach((c, i) => self.calculate(c, i, self.cards.length))
  this.cards.forEach(c => { c.isBack = !self.faceUp })
  await Promise.all(self.cards.map(c => c.updatePosition(animate)))
}

Pile.prototype.show = async function () {
  this.cards.forEach(c => c.show())
}

Pile.prototype.hide = async function () {
  this.cards.forEach(c => c.hide())
}

Pile.prototype.attachInteraction = async function () {
  const self = this
  self.cards.forEach((c, i) => self.interaction(c, i, self.cards.length))
}

Pile.prototype.detachInteraction = async function () {
  const self = this
  self.cards.forEach(c => {
    c.onpanstart = undefined
    c.onpanmove = undefined
    c.onpanend = undefined
    c.ontap = undefined
  })
}

export default Pile
