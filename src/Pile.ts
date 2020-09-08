import Card from './Card'
import { Point } from './SharedTypes'
import { ResizeObserver } from '@juggle/resize-observer'
type positionCalculation = (card: Card, index: number, length: number) => void
type interactionCaculation = (card: Card, index: number, length: number) => void
export function pileLayout (c: Card, i: number, l: number) {
  c.position.top = i / 54 / 100
  c.position.left = i / 54 / 100
  c.position.zIndex = i
  if (i === l - 1) {
    c.draggable = true
  } else {
    c.draggable = false
  }
}

export function stackLayout (c: Card, i: number, l: number) {
  c.position.top = i * 0.025
  c.position.left = 0
  c.position.zIndex = i
  if (c.faceUp) {
    c.draggable = true
  } else {
    c.draggable = false
  }
}

export default class Pile {
  stage: Element
  cards: Card[] = []
  shadow: HTMLDivElement
  constructor (
    public id: string,
    stage: string | Element,
    private calculate: positionCalculation = (c, i, l) => {
      c.position.left = i / 54 / 100
      c.position.top = i / 54 / 100
      c.position.zIndex = i
    },
    private interaction: interactionCaculation,
    public faceUp: boolean = true,
    public position: Card['position'] = {
      left: 0, top: 0, zIndex: 0
    }
  ) {
    if (typeof stage === 'string') {
      const find = document.querySelector(stage)
      if (find == null) {
        throw new Error(`stage '${stage}' not found!`)
      }
      this.stage = find
    } else {
      this.stage = stage
    }
    this.shadow = document.createElement('div') as HTMLDivElement
    this.updateShadow()
    this.stage.append(this.shadow)
    new ResizeObserver(() => {
      this.updateShadow()
    }).observe(this.stage)
  }

  async add (
    id: string,
    type: string,
    position: Card['position'] = {
      left: 0, top: 0, zIndex: 0
    },
    atIndex: number = this.cards.length
  ) {
    const self = this
    position = Object.assign({}, position)
    const card = new Card(self.stage, id, type, position)
    await card.init()
    card.interact(true)
    self.cards.splice(atIndex, 0, card)
    return card
  }

  async addDeck (idPrefix: string = '') {
    const self = this
    const types = ['S', 'H', 'C', 'D']
    const numbers = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    const result = []
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

  shuffle () {
    const self = this
    self.detachInteraction()
    for (let i = self.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [self.cards[i], self.cards[j]] = [self.cards[j], self.cards[i]]
    }
    self.updatePosition()
    self.attachInteraction()
  }

  exchange (
    card: Card,
    anotherPile: Pile,
    animate: boolean,
    atIndex: number = anotherPile.cards.length
  ) {
    const self = this
    if (!card) return
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

  async updatePosition (animate: boolean = true) {
    const self = this
    self.cards.forEach((c, i) => {
      self.calculate(c, i, self.cards.length)
      c.position.left += self.position.left
      c.position.top += self.position.top
      c.position.zIndex += self.position.zIndex
    })
    // this.cards.forEach(c => { c.faceUp = self.faceUp })
    await Promise.all(self.cards.map(c => c.updatePosition(animate)))
  }

  async updateShadow () {
    const clientRect = this.stage.getBoundingClientRect()
    const img = new Image()
    async function loadImage (img:HTMLImageElement, src:string) {
      return new Promise((resolve, reject) => {
        img.src = src
        img.complete && resolve()
        img.onload = () => resolve()
        img.onerror = (e) => reject(new Error(e instanceof Event ? e.type : e))
      })
    }
    await loadImage(img, './cards/RED_BACK.svg')
    this.shadow.style.position = 'absolute'
    const cardWidthBase = 0.1 * clientRect.width
    const cardHeightBase = cardWidthBase * img.height / img.width
    const padding = 0.01 * clientRect.width
    this.shadow.style.width = cardWidthBase + 2 * padding + 'px'
    this.shadow.style.height = cardHeightBase + 2 * padding + 'px'
    const shadowLeft = this.position.left * clientRect.width - padding
    const shadowTop = this.position.top * clientRect.width - padding
    this.shadow.style.transform = `translate(${shadowLeft}px,${shadowTop}px)`
    this.shadow.classList.add('shadow')
  }

  show () {
    this.cards.forEach(c => c.show())
  }

  hide () {
    this.cards.forEach(c => c.hide())
  }

  async attachInteraction () {
    const self = this
    self.cards.forEach((c, i) => {
      self.interaction(c, i, self.cards.length)
      c.interact(true)
    })
  }

  async detachInteraction () {
    const self = this
    self.cards.forEach(c => {
      c.interact(false)
    })
  }

  checkPoint (point: Point) {
    const self = this
    return [...self.cards.map(c => c.dom), this.shadow].some(d => {
      const rect = d.getBoundingClientRect()
      if (
        point.x > rect.x &&
        point.x < rect.x + rect.width &&
        point.y > rect.y &&
        point.y < rect.y + rect.width
      ) return true
    })
  }
}
