module.exports = (min, max, id, barClassList, bgClassList) => `
  <div class="progress ${bgClassList}" title="${min} / ${max}" ${id ? `id=${id}` : ''}>
    <div class="determinate ${barClassList}" style="width: ${Math.ceil((min / max) * 100)}%"></div>
    <p>${min} / ${max}</p>
  </div>
`