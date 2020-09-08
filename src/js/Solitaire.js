import Pile from './Pile'

const Solitaire = function (stage) {
  const self = this
  self.poolHide = new Pile(
    stage,
    (c, i, l) => {
      c.position.top = i / 54 / 100
      c.position.left = i / 54 / 100
      c.position.zIndex = i + 1000
    },
    (c, i, l) => {
      if (i === l - 1) {
        c.ontap = function () {
          self.poolHide.exchange(c, self.poolShow, true)
        }
        c.onpanend = function (e) {
          const rect = c.dom.getBoundingClientRect()
          if (
            e.center.x > rect.x &&
            e.center.x < rect.x + rect.width &&
            e.center.y > rect.y &&
            e.center.y < rect.y + rect.width
          ) self.poolHide.exchange(c, self.poolShow, true)
        }
      }
    },
    false
  )
  self.poolShow = new Pile(
    stage,
    (c, i, l) => {
      c.position.top = i / 54 / 100 + 0.2
      c.position.left = i / 54 / 100
      c.position.zIndex = i + 2000
    },
    (c, i, l) => {
      if (i === l - 1) {
        c.ontap = function () {
          if (self.poolHide.cards.length === 0) {
            Array.from(self.poolShow.cards).reverse()
              .forEach(c => {
                self.poolShow.exchange(c, self.poolHide, true)
              })
          }
        }
        c.onpanstart = () => {}
        c.onpanmove = () => {}
        c.onpanend = () => {}
      }
    },
    true
  )
  self.init()
}

Solitaire.prototype.init = async function () {
  const self = this
  await self.poolHide.addDeck('deck-1')
  await self.poolHide.updatePosition()
  self.poolHide.show()
  self.poolShow.show()
  self.poolHide.attachInteraction()
}

window.Solitaire = Solitaire
