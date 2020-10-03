import Card from './Card'
import Pile, { pileLayout, stackLayout } from './Pile'
import { Point } from './SharedTypes'
import ProgressBar from 'progressbar.js'
import './solitaire.css'

function canCardDropType (this: Pile, cards: Card[]): boolean {
  const numbers = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K'
  ]
  if (cards.length !== 1) return false
  const card = cards[0]
  const cardType = card && card.type.slice(-1)
  const cardNumber = card && card.type.slice(0, -1)
  if (card.faceUp && cardType.toUpperCase() === this.id[0].toUpperCase()) {
    if (this.cards.length === 0) {
      return cardNumber === 'A'
    } else {
      const lastCardNumber = this.cards.slice(-1)[0].type.slice(0, -1)
      if (numbers.indexOf(cardNumber) - numbers.indexOf(lastCardNumber) === 1) {
        return true
      }
    }
  }
  return false
}

function canCardDropLane (this: Pile, cards: Card[]) {
  const numbers = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K'
  ]
  const types = { S: 1, H: 2, C: 1, D: 2 } as { [x: string]: number }
  if (cards.length === 0) return false
  const card = cards[0]
  if (card && card.faceUp) {
    const cardType = card.type.slice(-1).toUpperCase()
    const cardNumber = card.type.slice(0, -1)
    if (this.cards.length === 0) {
      return cardNumber === 'K'
    }
    const lastCard = this.cards.slice(-1)[0]
    const lastCardType = lastCard.type.slice(-1).toUpperCase()
    const lastcardNumber = lastCard.type.slice(0, -1)
    if (
      types[cardType] !== types[lastCardType] &&
      numbers.indexOf(lastcardNumber) - numbers.indexOf(cardNumber) === 1
    ) {
      return true
    }
  }
  return false
}

export default class Solitaire {
  stage: HTMLElement;
  piles: Pile[] = [];
  typePiles: Pile[] = [];
  private initial: boolean = true;
  private progressbar: HTMLDivElement = document.createElement('div');
  private bar: any;
  private winAudio: HTMLAudioElement = new Audio('./cards/win.mp3');
  constructor (
    stage: HTMLElement | string,
    cardDomType: 'canvas' | 'svg' = 'canvas'
  ) {
    const self = this
    if (typeof stage === 'string') {
      const find = document.querySelector(stage) as HTMLElement
      if (find == null) {
        throw new Error(`stage '${stage}' not found!`)
      }
      this.stage = find
    } else {
      this.stage = stage
    }
    Card.cardDomType = cardDomType
    this.stage.appendChild(this.progressbar)
    const lefts = Array(7)
      .fill(0)
      .map((n, i) => i * 0.14 + 0.02)
    const pileHide = new Pile(
      'hide',
      self.stage,
      (c, i, l) => {
        pileLayout(c, i, l)
        c.faceUp = false
      },
      () => false,
      { left: lefts[0], top: 0.02, zIndex: 0 },
      '<div class="type">😀</div>'
    )
    const pileShow = new Pile(
      'show',
      stage,
      (c, i, l) => {
        pileLayout(c, i, l)
        c.faceUp = true
      },
      () => false,
      { left: lefts[1], top: 0.02, zIndex: 1000 },
      '<div class="type">😊</div>'
    )
    const pileSpade = new Pile(
      'spade',
      stage,
      (c, i, l) => {
        pileLayout(c, i, l)
        c.faceUp = true
      },
      canCardDropType,
      { left: lefts[3], top: 0.02, zIndex: 2000 },
      '<div class="type">♠</div>'
    )
    const pileHeart = new Pile(
      'heart',
      stage,
      pileLayout,
      canCardDropType,
      { left: lefts[4], top: 0.02, zIndex: 2000 },
      '<div class="type">♥</div>'
    )
    const pileClub = new Pile(
      'club',
      stage,
      pileLayout,
      canCardDropType,
      { left: lefts[5], top: 0.02, zIndex: 2000 },
      '<div class="type">♣</div>'
    )
    const pileDiamond = new Pile(
      'diamond',
      stage,
      pileLayout,
      canCardDropType,
      { left: lefts[6], top: 0.02, zIndex: 2000 },
      '<div class="type">♦</div>'
    )
    const pileLane1 = new Pile(
      'lane1',
      stage,
      (c, i, l) => {
        if (!self.initial && i === l - 1) {
          c.faceUp = true
        }
        stackLayout(c, i, l)
      },
      canCardDropLane,
      { left: lefts[1], top: 0.2, zIndex: 2000 },
      '<div class="type">1</div>'
    )
    const pileLane2 = new Pile(
      'lane2',
      stage,
      (c, i, l) => {
        if (!self.initial && i === l - 1) {
          c.faceUp = true
        }
        stackLayout(c, i, l)
      },
      canCardDropLane,
      { left: lefts[2], top: 0.2, zIndex: 2000 },
      '<div class="type">2</div>'
    )
    const pileLane3 = new Pile(
      'lane3',
      stage,
      (c, i, l) => {
        if (!self.initial && i === l - 1) {
          c.faceUp = true
        }
        stackLayout(c, i, l)
      },
      canCardDropLane,
      { left: lefts[3], top: 0.2, zIndex: 2000 },
      '<div class="type">3</div>'
    )
    const pileLane4 = new Pile(
      'lane4',
      stage,
      (c, i, l) => {
        if (!self.initial && i === l - 1) {
          c.faceUp = true
        }
        stackLayout(c, i, l)
      },
      canCardDropLane,
      { left: lefts[4], top: 0.2, zIndex: 2000 },
      '<div class="type">4</div>'
    )
    const pileLane5 = new Pile(
      'lane5',
      stage,
      (c, i, l) => {
        if (!self.initial && i === l - 1) {
          c.faceUp = true
        }
        stackLayout(c, i, l)
      },
      canCardDropLane,
      { left: lefts[5], top: 0.2, zIndex: 2000 },
      '<div class="type">5</div>'
    )
    const pileLane6 = new Pile(
      'lane6',
      stage,
      (c, i, l) => {
        if (!self.initial && i === l - 1) {
          c.faceUp = true
        }
        stackLayout(c, i, l)
      },
      canCardDropLane,
      { left: lefts[6], top: 0.2, zIndex: 2000 },
      '<div class="type">6</div>'
    )
    this.piles.push(
      pileShow,
      pileHide,
      pileSpade,
      pileHeart,
      pileClub,
      pileDiamond,
      pileLane1,
      pileLane2,
      pileLane3,
      pileLane4,
      pileLane5,
      pileLane6
    )
    this.typePiles.push(pileSpade, pileHeart, pileClub, pileDiamond)
  }

  find (id: string) {
    const result = this.piles.find((p) => p.id === id)
    if (!result) {
      throw new Error()
    }
    return result
  }

  async init () {
    const self = this
    self.progress(0)
    await self.find('hide').addDeck('deck-1', (p) => {
      self.progress(p)
    })
    self.progress()
    this.piles.forEach((p) => p.show())
    // self.find("hide").shuffle();
    await self.find('hide').updatePosition(false)
    self.find('hide').show()
    // for (let m = 1; m <= 6; m++) {
    //   for (let n = m; n <= 6; n++) {
    //     await self.dispatch("lane" + n, n === m);
    //   }
    // }
    self.dispatch('show', true)
    self.initial = false
    self.initInteraction()
  }

  async dispatch (pileId: string, faceUp: boolean) {
    const self = this
    const card = self.find('hide').cards.slice(-1)
    card[0].faceUp = faceUp
    await self.find('hide').exchange(card, self.find(pileId))
  }

  getTargetPile (point: Point, card: Card) {
    const result = this.piles
      .filter((p) => p.cards.indexOf(card) < 0)
      .filter((p) => p.isPointInPile(point))
    return result
  }

  getPileById (id: string) {
    return this.piles.find((p) => p.id === id)
  }

  getPileByCard (card: Card) {
    return this.piles.find((p) => p.cards.some((c) => c === card))
  }

  initInteraction () {
    const self = this
    const allCards: Card[] = []
    self.piles.forEach((p) => allCards.push(...p.cards))
    allCards.forEach((c) => {
      c.ontap.push({
        namespace: 'pile',
        handler: () => {
          const pile = self.getPileByCard(c)
          if (c.faceUp && pile && pile.isLast(c)) {
            if (
              self.typePiles.some((t) => {
                if (t.canCardDrop([c])) {
                  pile.exchange([c], t)
                  self.checkWin()
                  return true
                }
              })
            ) {
              return
            }
          }
          if (pile && pile.id === 'hide' && pile.isLast(c)) {
            pile.exchange([c], self.getPileById('show'))
            return
          }
          const hide = self.getPileById('hide')
          if (pile && pile.id === 'show' && hide && hide.cards.length === 0) {
            pile.exchange(Array.from(pile.cards), hide, false)
          }
        }
      })
      c.ondoubletap.push({
        namespace: 'pile',
        handler: () => {
          const pile = self.getPileByCard(c)
          if (c.faceUp && pile && pile.isLast(c)) {
            self.typePiles.some((t) => {
              if (t.canCardDrop([c])) {
                pile.exchange([c], t)
              }
            })
          }
        }
      })
      const pointerPile = {
        items: [] as {
          card: Card;
          startPosition: { left: number; top: number; zIndex: number };
        }[],
        sourcePile: null as Pile | null
      }
      c.onpanstart.push({
        namespace: 'pile',
        handler: (e: globalThis.HammerInput) => {
          const pile = self.getPileByCard(c)
          const hide = this.getPileById('hide')
          if (hide && hide.isPointInPile(e.center)) {
            pointerPile.sourcePile = hide
          }
          if (c.faceUp && pile) {
            const faceUpPiles = [self.getPileById('show'), ...self.typePiles]
            if (!(faceUpPiles.indexOf(pile) >= 0 && !pile.isLast(c))) {
              const index = pile.cards.indexOf(c)
              pointerPile.items = pile.cards.slice(index).map((c) => ({
                card: c,
                startPosition: Object.assign({}, c.position)
              }))
              pointerPile.sourcePile = pile
            }
          }
        }
      })
      c.onpanmove.push({
        namespace: 'pile',
        handler: (e: globalThis.HammerInput) => {
          if (pointerPile.items.length > 0) {
            const clientRect = self.stage.getBoundingClientRect()
            pointerPile.items.forEach((item) => {
              item.card.position.left =
                item.startPosition.left + e.deltaX / clientRect.width
              item.card.position.top =
                item.startPosition.top + e.deltaY / clientRect.width
              item.card.updatePosition(
                false,
                999999999 + item.startPosition.zIndex
              )
            })
            const targetPile = self.getTargetPile(e.center, c)[0]
            if (targetPile) {
              if (
                targetPile.canCardDrop(
                  pointerPile.items.map((item) => item.card)
                )
              ) {
                targetPile.glow('success')
              } else {
                targetPile.glow('fail')
              }
              self.piles
                .filter((p) => p !== targetPile)
                .forEach((p) => p.glow())
            } else {
              self.piles.forEach((p) => p.glow())
            }
          }
        }
      })
      c.onpanend.push({
        namespace: 'pile',
        handler: async (e: globalThis.HammerInput) => {
          const targetPile = self.getTargetPile(e.center, c)[0]
          if (pointerPile.sourcePile === null) return
          if (
            pointerPile.sourcePile.id === 'hide' &&
            pointerPile.sourcePile.isPointInPile(e.center)
          ) {
            pointerPile.sourcePile.exchange(
              pointerPile.sourcePile.cards.slice(-1),
              self.getPileById('show')
            )
            return
          }
          if (targetPile && pointerPile.items.length > 0) {
            if (
              targetPile.canCardDrop(pointerPile.items.map((item) => item.card))
            ) {
              await pointerPile.sourcePile.exchange(
                pointerPile.items.map((i) => i.card),
                targetPile
              )
              self.checkWin()
            }
          }
          if (pointerPile.sourcePile) {
            pointerPile.sourcePile.updatePosition()
          }
          self.piles.forEach((p) => p.glow())
        }
      })
    })
  }

  checkWin () {
    if (
      this.piles
        .filter((p) => this.typePiles.indexOf(p) < 0)
        .every((p) => p.cards.length === 0)
    ) {
      // this.piles.forEach(p => p.cards.forEach(c => c.fall()))
      this.piles.forEach((p) => p.cards.splice(0))
      this.piles.forEach((p) => p.updatePosition())
      this.winAudio.loop = true
      this.winAudio.play()
    }
  }

  progress (progress?: number) {
    if (progress !== undefined) {
      if (!this.bar) {
        this.progressbar.classList.add('progress')
        this.bar = new ProgressBar.Circle(this.progressbar, {
          color: '#ff0',
          strokeWidth: 3,
          trailWidth: 1,
          easing: 'easeInOut',
          duration: 1400,
          text: {
            autoStyleContainer: false
          },
          // from: { color: '#fff', width: 3 },
          // to: { color: '#fff', width: 3 },
          step: function (state: any, circle: any) {
            // circle.path.setAttribute('stroke', state.color)
            // circle.path.setAttribute('stroke-width', state.width)

            var value = Math.round(circle.value() * 100)
            if (value === 0) {
              circle.setText('')
            } else {
              circle.setText(value)
            }
          }
        })
        this.bar.text.style.fontSize = '2rem'
        this.bar.svg.style.overflow = 'visible'
      }
      this.bar.set(progress)
    } else {
      if (this.bar) {
        this.bar.destroy()
      }
    }
  }
}
