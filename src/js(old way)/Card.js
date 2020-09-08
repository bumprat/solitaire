import Hammer from 'hammerjs'

const Card = function (stage, id, type, position, cardDomType, cardWidth) {
  const self = this
  self.stage = stage
  self.id = id
  self.type = type
  self.cardWidth = cardWidth ?? 0.1
  self.faceUp = true
  const defaultPosition = { left: 0.5, top: 0, zIndex: 0 }
  self.position = Object.assign({}, defaultPosition, position)
  self.cardDomType = cardDomType ?? 'div'
  new ResizeObserver(() => {
    self.updatePosition()
  }).observe(self.stage)
}

Card.prototype.init = async function () {
  const self = this
  self.dom = document.createElement(self.cardDomType)
  self.dom.classList.add('card')
  self.img = new Image()
  self.imgBack = new Image()
  self.img.src = `./cards/${self.type}.svg`
  self.imgBack.src = './cards/RED_BACK.svg'
  await Promise.all([new Promise((resolve, reject) => {
    self.img.complete && resolve()
    self.img.onload = resolve
    self.img.onerror = reject
  }), new Promise((resolve, reject) => {
    self.imgBack.complete && resolve()
    self.imgBack.onload = resolve
    self.imgBack.onerror = reject
  })])
  self.dom.append(self.img)
  self.dom.append(self.imgBack)
  self.ratio = self.img.height / self.img.width
  self.dom.draggable = false
  self.img.draggable = false
  self.imgBack.draggable = false
  self.img.style.display = 'none'
  self.imgBack.style.display = 'none'
  self.dom.style.opacity = 0
  self.updatePosition()
  self.stage.append(self.dom)

  self.hammer = self.hammer ?? new Hammer(self.dom)
  self.pan = self.pan ?? new Hammer.Pan({ threshold: 0 })
  self.press = self.press ?? new Hammer.Press({ time: 1 })
  self.tap = self.press ?? new Hammer.Tap({ time: 1 })
  const recognizers = [self.pan, self.press, self.tap]
  self.hammer.add(recognizers)
  const startPosition = {}
  self.hammer.on('press', function (e) {
    if (self.onpanstart) {
      self.dom.style.zIndex = 999999999
      self.updatePosition(false, true)
    }
  })
  self.hammer.on('panstart', function (e) {
    if (self.onpanstart) {
      startPosition.left = self.position.left
      startPosition.top = self.position.top
      self.dom.style.zIndex = 999999999
      self.updatePosition(false, true)
      self.onpanstart(e)
    }
  })
  self.hammer.on('pressup panend', function (e) {
    if (self.onpanend) {
      self.updatePosition()
      self.onpanend(e)
    }
  })
  self.hammer.on('tap', function (e) {
    if (self.ontap) {
      self.updatePosition()
      self.ontap(e)
    }
  })
  self.hammer.on('panmove', function (e) {
    if (self.onpanmove) {
      const clientRect = self.stage.getBoundingClientRect()
      self.position.left = startPosition.left + (e.deltaX / clientRect.width)
      self.position.top = startPosition.top + (e.deltaY / clientRect.width)
      self.updatePosition(false, true)
      self.onpanmove(e)
    }
  })
}

Card.prototype.updatePosition = function (animate) {
  const self = this
  const clientRect = self.stage.getBoundingClientRect()
  const cardWidthBase = self.cardWidth * clientRect.width
  const cardHeightBase = cardWidthBase * self.ratio
  const cardLeft = clientRect.width * self.position.left
  const cardTop = clientRect.width * self.position.top
  if (self.cardDomType === 'div') {
    self.dom.style.width = cardWidthBase + 'px'
    self.dom.style.height = cardHeightBase + 'px'
    self.img.style.width = '100%'
    self.img.style.height = '100%'
    self.imgBack.style.width = '100%'
    self.imgBack.style.height = '100%'
    self.img.style.display = self.faceUp ? 'block' : 'none'
    self.imgBack.style.display = !self.faceUp ? 'block' : 'none'
  } else if (self.cardDomType === 'canvas') {
    self.dom.width = cardWidthBase
    self.dom.height = cardHeightBase
    const context = self.dom.getContext('2d')
    context.drawImage(self.faceUp ? self.img : self.imgBack
      , 0, 0,
      cardWidthBase, cardHeightBase
    )
  }
  animate
    ? self.dom.classList.add('animate')
    : self.dom.classList.remove('animate')
  self.dom.style.transform = `translate(${cardLeft}px,${cardTop}px)`
}

Card.prototype.show = function () {
  this.dom.style.opacity = 1
}

Card.prototype.hide = function () {
  this.dom.style.opacity = 0
}

Card.prototype.interact = function (enabled) {
  this.hammer.set({ enabled })
}

export default Card
