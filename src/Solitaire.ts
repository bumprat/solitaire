import Card from './Card'
import Pile, { pileLayout, stackLayout } from './Pile'
import { Point } from './SharedTypes'

export default class Solitaire {
  stage: Element
  piles: Pile[] = []
  typePiles: Pile[] = []
  private initial:boolean = true
  constructor (
    stage: Element | string
  ) {
    const self = this
    if (typeof stage === 'string') {
      const find = document.querySelector(stage)
      if (find == null) {
        throw new Error(`stage '${stage}' not found!`)
      }
      this.stage = find
    } else {
      this.stage = stage
    }
    const poolHide = new Pile(
      'hide',
      self.stage,
      (c, i, l) => {
        pileLayout(c, i, l)
        c.faceUp = false
      },
      (c, i, l) => {
        if (i === l - 1) {
          c.ontap = function () {
            self.find('hide').exchange(c, self.find('show'), true)
          }
          c.onpanend = function (e) {
            const targetPile = self.findDrop(e.center, c)
            if (targetPile) {
              switch (targetPile.id) {
                case 'hide':
                  self.find('hide').updatePosition()
                  break
                case 'show':
                  self.find('hide').exchange(c, self.find('show'), true)
                  break
                default:
                  self.find('hide').updatePosition()
              }
            } else {
              self.find('hide').updatePosition()
            }
          }
        }
      },
      false,
      { left: 0.02, top: 0.02, zIndex: 0 }
    )
    const poolShow = new Pile(
      'show',
      stage,
      (c, i, l) => {
        pileLayout(c, i, l)
        c.faceUp = true
      },
      (c, i, l) => {
        if (i === l - 1) {
          c.ontap = function () {
            self.autoExchangeTypePools(self.find('show'), c)
            if (self.find('hide').cards.length === 0) {
              Array.from(self.find('show').cards).reverse()
                .forEach(c => {
                  self.find('show').exchange(c, self.find('hide'), true)
                })
            }
          }
          c.onpanend = function (e) {
            self.faceUpCardPanendHandler('show', self, e, c, [])
          }
        }
      },
      true,
      { left: 0.02, top: 0.2, zIndex: 1000 }
    )
    const poolSpade = new Pile(
      'spade',
      stage,
      pileLayout,
      (c, i, l) => {
        if (i === l - 1) {
          c.onpanend = function (e) {
            self.faceUpCardPanendHandler('spade', self, e, c, [])
          }
        }
      },
      true,
      { left: 0.4, top: 0.02, zIndex: 2000 }
    )
    const poolHeart = new Pile(
      'heart',
      stage,
      pileLayout,
      (c, i, l) => {
        if (i === l - 1) {
          c.onpanend = function (e) {
            self.faceUpCardPanendHandler('heart', self, e, c, [])
          }
        }
      },
      true,
      { left: 0.55, top: 0.02, zIndex: 2000 }
    )
    const poolClub = new Pile(
      'club',
      stage,
      pileLayout,
      (c, i, l) => {
        if (i === l - 1) {
          c.onpanend = function (e) {
            self.faceUpCardPanendHandler('club', self, e, c, [])
          }
        }
      },
      true,
      { left: 0.7, top: 0.02, zIndex: 2000 }
    )
    const poolDiamond = new Pile(
      'diamond',
      stage,
      pileLayout,
      (c, i, l) => {
        if (i === l - 1) {
          c.onpanend = function (e) {
            self.faceUpCardPanendHandler('diamond', self, e, c, [])
          }
        }
      },
      true,
      { left: 0.85, top: 0.02, zIndex: 2000 }
    )
    const poolLane1 = new Pile(
      'lane1',
      stage,
      (c, i, l) => {
        if (!self.initial) {
          if (i === l - 1) {
            c.faceUp = true
          }
        }
        stackLayout(c, i, l)
      },
      (c, i, l) => {
        self.laneInteract('lane1', c, i, l)
      },
      true,
      { left: 0.25, top: 0.2, zIndex: 2000 }
    )
    const poolLane2 = new Pile(
      'lane2',
      stage,
      (c, i, l) => {
        if (!self.initial) {
          if (i === l - 1) {
            c.faceUp = true
          }
        }
        stackLayout(c, i, l)
      },
      (c, i, l) => {
        self.laneInteract('lane2', c, i, l)
      },
      true,
      { left: 0.4, top: 0.2, zIndex: 2000 }
    )
    const poolLane3 = new Pile(
      'lane3',
      stage,
      (c, i, l) => {
        if (!self.initial) {
          if (i === l - 1) {
            c.faceUp = true
          }
        }
        stackLayout(c, i, l)
      },
      (c, i, l) => {
        self.laneInteract('lane3', c, i, l)
      },
      true,
      { left: 0.55, top: 0.2, zIndex: 2000 }
    )
    const poolLane4 = new Pile(
      'lane4',
      stage,
      (c, i, l) => {
        if (!self.initial) {
          if (i === l - 1) {
            c.faceUp = true
          }
        }
        stackLayout(c, i, l)
      },
      (c, i, l) => {
        self.laneInteract('lane4', c, i, l)
      },
      true,
      { left: 0.7, top: 0.2, zIndex: 2000 }
    )
    const poolLane5 = new Pile(
      'lane5',
      stage,
      (c, i, l) => {
        if (!self.initial) {
          if (i === l - 1) {
            c.faceUp = true
          }
        }
        stackLayout(c, i, l)
      },
      (c, i, l) => {
        self.laneInteract('lane5', c, i, l)
      },
      true,
      { left: 0.85, top: 0.2, zIndex: 2000 }
    )
    this.piles.push(poolShow, poolHide, poolSpade, poolHeart, poolClub, poolDiamond, poolLane1, poolLane2, poolLane3, poolLane4, poolLane5)
    this.typePiles.push(poolSpade, poolHeart, poolClub, poolDiamond)
  }

  find (id:string) {
    const result = this.piles.find(p => p.id === id)
    if (!result) {
      throw new Error()
    }
    return result
  }

  async init () {
    const self = this
    await self.find('hide').addDeck('deck-1')
    self.find('hide').shuffle()
    await self.find('hide').updatePosition()
    self.find('hide').show()
    self.find('hide').attachInteraction()
    for (let m = 1; m <= 5; m++) {
      for (let n = m; n <= 5; n++) {
        if (n === m) {
          await self.dispatch('lane' + n, true)
          console.log('lane' + n, true)
        } else {
          await self.dispatch('lane' + n, false)
          console.log('lane' + n, false)
        }
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    self.dispatch('show', true)
    self.initial = false
  }

  async dispatch (pileId:string, faceUp:boolean) {
    const self = this
    const card = self.find('hide').cards.slice(-1)
    card[0].faceUp = faceUp
    await self.find('hide').exchange(card[0], self.find(pileId), true)
  }

  findDrop (point: Point, card: Card) {
    return this.piles.filter(p => p.cards.indexOf(card) < 0).find(p => p.checkPoint(point))
  }

  exchangeTypePools (sourcePile: Pile, targetPileId: string, card: Card) {
    const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const targetPile = this.find(targetPileId)
    const cardNumber = card.type.slice(0, -1)
    const cardType = card.type.slice(-1)
    const lastCard = targetPile.cards.slice(-1)
    if (cardType.toUpperCase() === targetPileId[0].toUpperCase()) {
      if (lastCard.length === 0 && cardNumber === 'A') {
        sourcePile.exchange(card, targetPile, true)
      } else {
        const lastCardNumber = lastCard[0].type.slice(0, -1)
        if (numbers.indexOf(cardNumber) - numbers.indexOf(lastCardNumber) === 1) {
          sourcePile.exchange(card, targetPile, true)
        } else {
          sourcePile.updatePosition()
        }
      }
    } else {
      sourcePile.updatePosition()
    }
  }

  exchangeLanePools (sourcePile: Pile, targetPileId: string, card: Card) {
    const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const types = { S: 1, H: 2, C: 1, D: 2 } as {[x:string]:number}
    const targetPile = this.find(targetPileId)
    const cardNumber = card.type.slice(0, -1)
    const cardType = card.type.slice(-1)
    const lastCard = targetPile.cards.slice(-1)[0]
    if (!lastCard) {
      if (cardNumber === 'K') {
        sourcePile.exchange(card, targetPile, true)
      } else {
        sourcePile.updatePosition()
      }
    } else {
      const lastCardNumber = lastCard.type.slice(0, -1)
      const lastCardType = lastCard.type.slice(-1)
      if (!lastCard.faceUp) {
        if (cardNumber === 'K') {
          sourcePile.exchange(card, targetPile, true)
        } else {
          sourcePile.updatePosition()
        }
      } else {
        if (
          numbers.indexOf(lastCardNumber) - numbers.indexOf(cardNumber) === 1 &&
        types[cardType] !== types[lastCardType]
        ) {
          sourcePile.exchange(card, targetPile, true)
        } else {
          sourcePile.updatePosition()
        }
      }
    }
  }

  autoExchangeTypePools (sourcePile: Pile, card: Card) {
    const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const cardNumber = card.type.slice(0, -1)
    const cardType = card.type.slice(-1)
    const targetPile = this.typePiles.find(p => p.id[0].toUpperCase() === cardType.toUpperCase())
    if (targetPile) {
      const lastCard = targetPile.cards.slice(-1)[0]
      if (!lastCard) {
        if (cardNumber === 'A') {
          sourcePile.exchange(card, targetPile, true)
        } else {
          sourcePile.updatePosition()
        }
      } else {
        const lastCardNumber = lastCard.type.slice(0, -1)
        if (
          numbers.indexOf(cardNumber) - numbers.indexOf(lastCardNumber) === 1
        ) {
          sourcePile.exchange(card, targetPile, true)
        } else {
          sourcePile.updatePosition()
        }
      }
    } else {
      sourcePile.updatePosition()
    }
  }

  faceUpCardPanendHandler (sourcePoolId:string, self: Solitaire, e: globalThis.HammerInput, c:Card, belowCards: Card[]) {
    const targetPile = self.findDrop(e.center, c)
    if (targetPile) {
      switch (targetPile.id) {
        case 'hide':
          self.find(sourcePoolId).updatePosition()
          break
        case 'show':
          self.find(sourcePoolId).updatePosition()
          break
        case 'spade':
        case 'heart':
        case 'club':
        case 'diamond':
          if (belowCards.length === 0) {
            self.exchangeTypePools(self.find(sourcePoolId), targetPile.id, c)
          } else {
            self.find(sourcePoolId).updatePosition()
          }
          break
        case 'lane1':
        case 'lane2':
        case 'lane3':
        case 'lane4':
        case 'lane5':
          if (belowCards.length === 0) {
            self.exchangeLanePools(self.find(sourcePoolId), targetPile.id, c)
          } else {
            self.exchangeLanePools(self.find(sourcePoolId), targetPile.id, c)
            belowCards.forEach(c => {
              self.exchangeLanePools(self.find(sourcePoolId), targetPile.id, c)
            })
          }
          break
        default:
          self.find(sourcePoolId).updatePosition()
      }
    } else {
      self.find(sourcePoolId).updatePosition()
    }
  }

  laneInteract (lanePoolId:string, c:Card, i:number, l:number) {
    const self = this
    if (c.faceUp) {
      const index = self.find(lanePoolId).cards.indexOf(c)
      const belowCards = self.find(lanePoolId).cards.slice(index + 1)
      let startPosition: {left:number, top:number, zIndex:number}[]
      c.ontap = function (e) {
        if (belowCards.length === 0) {
          self.autoExchangeTypePools(self.find(lanePoolId), c)
        }
      }
      c.onpanstart = function (e) {
        startPosition = belowCards.map(c => Object.assign({}, c.position))
      }
      c.onpanmove = function (e) {
        belowCards.map((c, i) => {
          const clientRect = self.stage.getBoundingClientRect()
          c.position.left = startPosition[i].left + (e.deltaX / clientRect.width)
          c.position.top = startPosition[i].top + (e.deltaY / clientRect.width)
          c.dom.style.zIndex = '' + (999999999 + startPosition[i].zIndex)
          c.updatePosition(false, true)
        })
      }
      c.onpanend = function (e) {
        self.faceUpCardPanendHandler(lanePoolId, self, e, c, belowCards)
      }
    }
  }
}
