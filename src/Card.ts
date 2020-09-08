import Hammer from 'hammerjs'
import { ResizeObserver } from '@juggle/resize-observer'

type position = {left:number, top:number, zIndex:number}

export default class Card {
  stage: Element
  position: {left:number, top: number, zIndex:number}
  dom: HTMLElement
  img: HTMLImageElement = new Image()
  imgBack: HTMLImageElement = new Image()
  ratio: number = 0
  hammer:globalThis.HammerManager
  recognizers: globalThis.Recognizer[] = [
  ]

  draggable: boolean = false
  ontap: globalThis.HammerListener = (e) => {}
  ondoubletap: globalThis.HammerListener = (e) => {}
  onpress: globalThis.HammerListener = (e) => {}
  onpressup: globalThis.HammerListener = (e) => {}
  onpanstart: globalThis.HammerListener = (e) => {}
  onpanmove: globalThis.HammerListener = (e) => {}
  onpanend: globalThis.HammerListener = (e) => {}
  faceUp: boolean
  constructor (
    stage: Element | string,
    public id: string,
    public type: string,
    position: position = {
      left: 0, top: 0, zIndex: 0
    },
    public cardDomType: string = 'div',
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
    const defaultPosition:position = { left: 0, top: 0, zIndex: 0 }
    this.position = Object.assign({}, position, defaultPosition)
    this.cardDomType = cardDomType
    this.cardWidth = cardWidth
    this.dom = document.createElement(this.cardDomType)
    if (typeof this.dom === 'undefined') {
      throw new Error(`card cannot be created with dom type: ${this.cardDomType}`)
    }
    this.dom.classList.add('card')
    this.stage.append(this.dom)
    this.faceUp = true
    this.hammer = new Hammer(this.dom, { recognizers: [] })
    const pan = new Hammer.Pan({ threshold: 5 })
    // const press = new Hammer.Press({ time: 100 })
    const singleTap = new Hammer.Tap()
    // const doubleTap = new Hammer.Tap({ taps: 2, event: 'doubletap', time: 300, interval: 300 })
    // doubleTap.requireFailure(press)
    // singleTap.requireFailure(doubleTap)
    // doubleTap.recognizeWith(singleTap)
    this.recognizers = this.recognizers.concat([pan, singleTap])
    // this.hammer = new Hammer(this.dom)
    this.hammer.add(this.recognizers)
    new ResizeObserver(() => {
      this.updatePosition()
    }).observe(this.stage)
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
    await loadImage(self.img, `./cards/${self.type}.svg`)
    await loadImage(self.imgBack, './cards/RED_BACK.svg')
    self.ratio = self.img.height / self.img.width
    self.dom.append(self.img)
    self.dom.append(self.imgBack)
    self.dom.draggable = false
    self.img.draggable = false
    self.imgBack.draggable = false
    self.img.style.display = 'none'
    self.imgBack.style.display = 'none'
    self.dom.style.opacity = '0'
    self.updatePosition()

    const startPosition:{left:number, top:number} = { left: 0, top: 0 }
    self.hammer.on('tap', (e:globalThis.HammerInput) => {
      console.log(`${self.id} singletap`)
      self.ontap(e)
    })
    self.hammer.on('doubletap', (e:globalThis.HammerInput) => {
      console.log(`${self.id} doubletap`)
      self.ondoubletap(e)
    })
    self.hammer.on('press', function (e) {
      console.log(`${self.id} press`)
      self.onpress(e)
      if (self.draggable) {
        self.dom.style.zIndex = '' + 999999999
        self.updatePosition(false, true)
      }
    })
    self.hammer.on('pressup', function (e:globalThis.HammerInput) {
      console.log(`${self.id} pressup`)
      self.onpressup(e)
    })
    self.hammer.on('panstart', function (e) {
      console.log(`${self.id} panstart`)
      self.onpanstart(e)
      if (self.draggable) {
        startPosition.left = self.position.left
        startPosition.top = self.position.top
        self.dom.style.zIndex = '' + 999999999
        self.updatePosition(false, true)
      }
    })
    self.hammer.on('panmove', function (e:globalThis.HammerInput) {
      console.log(`${self.id} panmove`)
      self.onpanmove(e)
      if (self.draggable) {
        const clientRect = self.stage.getBoundingClientRect()
        self.position.left = startPosition.left + (e.deltaX / clientRect.width)
        self.position.top = startPosition.top + (e.deltaY / clientRect.width)
        self.updatePosition(false, true)
      }
    })
    self.hammer.on('panend', function (e:globalThis.HammerInput) {
      console.log(`${self.id} panend`)
      self.onpanend(e)
      if (self.draggable) {
        self.updatePosition()
      }
    })
  }

  updatePosition (animate:boolean = true, ignoreZ:boolean = false) {
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
      self.dom.width = cardWidthBase
      self.dom.height = cardHeightBase
      const context = self.dom.getContext('2d')
      context && context.drawImage(self.faceUp ? self.img : self.imgBack
        , 0, 0,
        cardWidthBase, cardHeightBase
      )
    }
    if (!ignoreZ) {
      self.dom.style.zIndex = '' + self.position.zIndex
    }
    animate
      ? self.dom.classList.add('animate')
      : self.dom.classList.remove('animate')
    self.dom.style.transform = `translate(${cardLeft}px,${cardTop}px)`
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
}
