declare const Solitaire: any
async function start (domtype: 'canvas' | 'svg') {
  const stage = document.querySelector('#stage')
  const btns = document.querySelectorAll('.load')
  if (stage === null) return
  if (btns.length === 0) return
  Array.from(btns).forEach((btn) => {
    (btn as HTMLElement).style.display = 'none'
  });
  (stage as HTMLElement).style.display = 'block'
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    await stage.requestFullscreen()
    await screen.orientation.lock('landscape')
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  const solitaire = new Solitaire(stage, domtype)
  await solitaire.init();
  (window as any).solitaire = solitaire
}
(window as any).start = start
export default start
