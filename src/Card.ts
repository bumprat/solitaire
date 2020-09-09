import Hammer from 'hammerjs'

type position = { left:number, top:number, zIndex:number }
type NamespacedEventHandler = { namespace:string, handler:globalThis.HammerListener }
type velocity = { x:number, y:number}
export default class Card {
  stage: Element
  position: {left:number, top: number, zIndex:number}
  dom: HTMLElement
  img: HTMLImageElement = new Image()
  imgBack: HTMLImageElement = new Image()
  ratio: number = 0
  hammer:globalThis.HammerManager
  draggable: boolean = false
  ontap: NamespacedEventHandler[] = []
  ondoubletap: NamespacedEventHandler[] = []
  onpress: NamespacedEventHandler[] = []
  onpressup: NamespacedEventHandler[] = []
  onpanstart: NamespacedEventHandler[] = []
  onpanmove: NamespacedEventHandler[] = []
  onpanend: NamespacedEventHandler[] = []
  eventHandlers: {[x:string]: NamespacedEventHandler[]}
  faceUp: boolean
  private prevTransform: string = ''
  static imgSrc: string = './cards/{type}.svg'
  static imgBackSrc: string = './cards/RED_BACK.svg'
  static cardDomType: 'canvas' | 'svg' = 'canvas'
  velocity: velocity = { x: Math.random() * 0.01, y: Math.random() * 0.01 }
  firstY?: number
  constructor (
    stage: Element | string,
    public id: string,
    public type: string,
    position: position = {
      left: 0, top: 0, zIndex: 0
    },
    public cardWidth: number = 0.1
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
    this.id = id
    this.type = type
    this.eventHandlers = {
      ontap: this.ontap,
      ondoubletap: this.ondoubletap,
      onpress: this.onpress,
      onpressup: this.onpressup,
      onpanstart: this.onpanstart,
      onpanmove: this.onpanmove,
      onpanend: this.onpanend
    }
    const defaultPosition:position = { left: 0, top: 0, zIndex: 0 }
    this.position = Object.assign({}, position, defaultPosition)
    this.cardWidth = cardWidth
    if (Card.cardDomType === 'svg') {
      this.dom = document.createElement('div')
    } else {
      this.dom = document.createElement('canvas')
    }
    if (typeof this.dom === 'undefined') {
      throw new Error(`card cannot be created with dom type: ${Card.cardDomType}`)
    }
    this.dom.classList.add('card')
    this.stage.append(this.dom)
    this.faceUp = true
    this.hammer = new Hammer(this.dom, {
      recognizers: []
    })
    const pan = new Hammer.Pan({ threshold: 5 })
    const singleTap = new Hammer.Tap({ event: 'singletap' })
    this.hammer.add([pan, singleTap])
    // const doubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, threshold: 100 })
    // this.hammer.add([pan, doubleTap, singleTap])
    // doubleTap.recognizeWith(singleTap)
    // singleTap.requireFailure(doubleTap)

    const self = this
    self.hammer.on('singletap', (e:globalThis.HammerInput) => {
      console.log(`${self.id} singletap`)
      self.ontap.forEach(h => h.handler(e))
    })
    self.hammer.on('doubletap', (e:globalThis.HammerInput) => {
      console.log(`${self.id} doubletap`)
      self.ondoubletap.forEach(h => h.handler(e))
    })
    self.hammer.on('panstart', function (e) {
      console.log(`${self.id} panstart`)
      self.onpanstart.forEach(h => h.handler(e))
    })
    self.hammer.on('panmove', function (e) {
      console.log(`${self.id} panmove`)
      self.onpanmove.forEach(h => h.handler(e))
    })
    self.hammer.on('panend', function (e) {
      console.log(`${self.id} panend`)
      self.onpanend.forEach(h => h.handler(e))
    })
  }

  async init () {
    const self = this
    async function loadImage (img:HTMLImageElement, src:string) {
      return new Promise((resolve, reject) => {
        img.src = src
        img.complete && resolve()
        img.onload = () => resolve()
        img.onerror = (e) => reject(new Error(e instanceof Event ? e.type : e))
      })
    }
    await loadImage(self.img, Card.imgSrc.replace('{type}', self.type))
    await loadImage(self.imgBack, Card.imgBackSrc)
    self.ratio = self.img.height / self.img.width
    self.dom.append(self.img)
    self.dom.append(self.imgBack)
    self.dom.draggable = false
    self.img.draggable = false
    self.imgBack.draggable = false
    self.img.style.display = 'none'
    self.imgBack.style.display = 'none'
    self.dom.style.opacity = '0'
    await self.updatePosition(false)
  }

  async updatePosition (animate: boolean = true, forceZIndex: number = 0) {
    const self = this
    const clientRect = self.stage.getBoundingClientRect()
    const cardWidthBase = self.cardWidth * clientRect.width
    const cardHeightBase = cardWidthBase * self.ratio
    const cardLeft = clientRect.width * self.position.left
    const cardTop = clientRect.width * self.position.top
    if (self.dom instanceof HTMLDivElement) {
      self.dom.style.width = cardWidthBase + 'px'
      self.dom.style.height = cardHeightBase + 'px'
      self.img.style.width = '100%'
      self.img.style.height = '100%'
      self.imgBack.style.width = '100%'
      self.imgBack.style.height = '100%'
      self.img.style.display = self.faceUp ? 'block' : 'none'
      self.imgBack.style.display = !self.faceUp ? 'block' : 'none'
    } else if (self.dom instanceof HTMLCanvasElement) {
      self.dom.style.width = cardWidthBase + 'px'
      self.dom.style.height = cardHeightBase + 'px'
      self.dom.width = self.img.width
      self.dom.height = self.img.height
      const context = self.dom.getContext('2d')
      context && context.drawImage(self.faceUp ? self.img : self.imgBack
        , 0, 0
      )
    }
    self.dom.style.zIndex = '' + (+self.position.zIndex + forceZIndex)
    if (animate) {
      await Promise.race([new Promise(resolve => {
        self.dom.classList.add('animate')
        self.dom.style.transform = `translate(${cardLeft}px, ${cardTop}px)`
        self.dom.addEventListener('transitionend', function () {
          self.dom.classList.remove('animate')
          resolve()
        }, { once: true })
      }),
      new Promise(resolve => {
        setTimeout(() => {
          self.dom.classList.remove('animate')
          resolve()
        }, 100)
      })])
    } else {
      self.dom.style.transform = `translate(${cardLeft}px,${cardTop}px)`
    }
    self.prevTransform = self.dom.style.transform
  }

  show () {
    this.dom.style.opacity = '' + 1
  }

  hide () {
    this.dom.style.opacity = '' + 0
  }

  interact (enable: boolean) {
    this.hammer.set({ enable })
  }

  clearEvents (namespace?:string, eventType?: string) {
    if (eventType && `on${eventType}` in this.eventHandlers) {
      const eh = this.eventHandlers[`on${eventType}`]
      if (namespace) {
        const match = eh.filter(h => h.namespace === namespace)
        match.forEach(h => eh.splice(eh.indexOf(h), 1))
      } else {
        eh.splice(0)
      }
    } else {
      if (namespace) {
        for (const onevent in this.eventHandlers) {
          const eh = this.eventHandlers[onevent]
          const match = eh.filter(h => h.namespace === namespace)
          match.forEach(h => eh.splice(eh.indexOf(h), 1))
        }
      } else {
        for (const onevent in this.eventHandlers) {
          this.eventHandlers[onevent].splice(0)
        }
      }
    }
  }

  fall () {
    this.position.left = this.position.left + this.velocity.x
    this.position.top = this.position.top + this.velocity.y
    if (this.position.left + this.cardWidth > 1) {
      this.velocity.x = -Math.abs(this.velocity.x)
    }
    if (this.position.left < 0) {
      this.velocity.x = Math.abs(this.velocity.x)
    }
    if (this.position.top + this.cardWidth * this.ratio > 1) {
      if (this.firstY === undefined) {
        this.firstY = this.velocity.y
      }
      this.velocity.y = -Math.abs(this.firstY)
    }
    if (this.position.top < 0) {
      this.velocity.y = Math.abs(this.velocity.y)
    }
    this.velocity.y += 0.0002
    this.updatePosition(false)
    setTimeout(() => this.fall(), 30)
  }
}
