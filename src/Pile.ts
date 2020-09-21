import Card from './Card'
import { Point } from './SharedTypes'
import { ResizeObserver } from '@juggle/resize-observer'
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
  stage: Element;
  cards: Card[] = [];
  shadow: HTMLDivElement;
  interactExpand: number = 0.02;
  shadowImg?: HTMLImageElement;
  constructor (
    public id: string,
    stage: string | Element,
    private calculate: (card: Card, index: number, length: number) => void = (
      c,
      i,
      l
    ) => {
      c.position.left = i / 54 / 100
      c.position.top = i / 54 / 100
      c.position.zIndex = i
    },
    public canCardDrop: (cards: Card[], sourcePile?: Pile) => boolean,
    public position: Card['position'] = {
      left: 0,
      top: 0,
      zIndex: 0
    },
    shadowContent: string = ''
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
    this.shadow.style.opacity = '0'
    this.shadow.innerHTML = shadowContent
    this.updateShadow()
    this.stage.appendChild(this.shadow)
    new ResizeObserver(async () => {
      await this.updatePosition()
      await this.updateShadow()
    }).observe(this.stage)
  }

  async add (
    id: string,
    type: string,
    position: Card['position'] = {
      left: 0,
      top: 0,
      zIndex: 0
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

  async addDeck (idPrefix: string = '', progress: (progress: number) => void) {
    const self = this
    const types = ['S', 'H', 'C', 'D']
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
    const result = []
    const totalCards = types.length * numbers.length
    for (const t of types) {
      for (const n of numbers) {
        const card = await self.add(idPrefix + '-' + n + t, n + t)
        result.push(card)
        progress(result.length / totalCards)
      }
    }
    return result
  }

  shuffle () {
    const self = this
    for (let i = self.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [self.cards[i], self.cards[j]] = [self.cards[j], self.cards[i]]
    }
  }

  async exchange (
    cards: Card[],
    anotherPile?: Pile,
    animate: boolean = true,
    sound: boolean = true,
    atIndex?: number
  ) {
    const self = this
    if (anotherPile === undefined) return
    cards.forEach((card) => {
      if (self.cards.indexOf(card) > -1) {
        atIndex = atIndex || anotherPile.cards.length
        self.cards.splice(self.cards.indexOf(card), 1)
        anotherPile.cards.splice(atIndex, 0, card)
      }
    })
    if (cards.length > 0 && sound) {
      cards[0].audioPlaceCard.play()
    }
    await Promise.all([
      self.updatePosition(animate),
      anotherPile.updatePosition(animate)
    ])
  }

  async updatePosition (animate: boolean = true) {
    const self = this
    self.cards.forEach((c, i) => {
      self.calculate(c, i, self.cards.length)
      c.position.left += self.position.left
      c.position.top += self.position.top
      c.position.zIndex += self.position.zIndex
    })
    await Promise.all(self.cards.map((c) => c.updatePosition(animate)))
    self.updateShadow()
  }

  async updateShadow () {
    const clientRect = this.stage.getBoundingClientRect()
    async function loadImage (src: string): Promise<HTMLImageElement> {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = src
        img.complete && resolve(img)
        img.onload = () => resolve(img)
        img.onerror = (e) => reject(new Error(e instanceof Event ? e.type : e))
      })
    }
    this.shadowImg = this.shadowImg || (await loadImage(Card.imgBackSrc))
    this.shadow.style.position = 'absolute'
    const cardWidthBase = 0.1 * clientRect.width
    const cardHeightBase =
      (cardWidthBase * this.shadowImg.height) / this.shadowImg.width
    const padding = 0.01 * clientRect.width
    const pileTop = Math.min(
      ...this.cards.map((c) => c.dom.getBoundingClientRect().top)
    )
    const pileBottom = Math.max(
      ...this.cards.map((c) => c.dom.getBoundingClientRect().bottom)
    )
    const pileHeight = pileBottom - pileTop
    this.shadow.style.width = cardWidthBase + 2 * padding + 'px'
    this.shadow.style.height =
      Math.max(pileHeight, cardHeightBase) + 2 * padding + 'px'
    this.shadow.classList.add('shadow')
    const shadowLeft = this.position.left * clientRect.width - padding
    const shadowTop = this.position.top * clientRect.width - padding
    this.shadow.style.transform = `translate(${shadowLeft}px,${shadowTop}px)`
  }

  glow (classname?: string) {
    if (classname !== undefined) {
      if (!this.shadow.style.transform.match(/ scale\(1\.05\)/g)) {
        this.shadow.style.transform += ' scale(1.05)'
      }
      this.shadow.classList.add(classname)
    } else {
      this.shadow.style.transform = this.shadow.style.transform.replace(
        ' scale(1.05)',
        ''
      )
      this.shadow.classList.remove('success', 'fail')
    }
  }

  show () {
    this.cards.forEach((c) => c.show())
    this.shadow.style.opacity = '1'
  }

  hide () {
    this.cards.forEach((c) => c.hide())
    this.shadow.style.opacity = '0'
  }

  isPointInPile (point: Point) {
    const self = this
    const stageWidth = self.stage.getBoundingClientRect().width
    const expand = stageWidth * self.interactExpand
    const range = [this.shadow]
    return range.some((d) => {
      const rect = d.getBoundingClientRect()
      if (
        point.x > rect.x - expand &&
        point.x < rect.x + rect.width + expand &&
        point.y > rect.y - expand &&
        point.y < rect.y + rect.height + expand
      ) {
        return true
      }
    })
  }

  isLast (card: Card) {
    return this.cards.indexOf(card) === this.cards.length - 1
  }
}
