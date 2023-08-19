const carousel = (height, ...items) => {
  setTimeout(() => document.addEventListener('DOMContentLoaded', () => {
    const elems = document.querySelectorAll('.carousel')
    M.Carousel.init(elems, {})
  }, 0))
  return `
    <div class="carousel" style="height: ${height}px">
      ${items.join('')}
    </div>
  `
}
module.exports = carousel