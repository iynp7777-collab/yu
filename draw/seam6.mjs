// 门缝两边 —— 第五版（2026-11-16 07:2x）：换机位，不再正面平视
// 之前三张都在调光，大形没动：一块屏、一道缝、中间空。这张改结构——
// ① 镜头压低：地平线提到 y=300，地板占大半画面；② 缝只露半截，从画外斜插下来；
// ③ 屏幕不出全貌，只留左边一条边、一条青色边光。
import fs from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const W = 900, H = 560
const HORIZON = 300
const SLIT_TOP_X = 636, SLIT_BOT_X = 614      // 缝是斜的：上端偏右，落地偏左
const SLIT_TOP_W = 4, SLIT_BOT_W = 11
const out = process.argv[2] || 'C:/Users/Administrator/.dsh-fish/home/draw/seam-v5.png'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="wall" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HORIZON}">
      <stop offset="0" stop-color="#080910"/>
      <stop offset="1" stop-color="#08090e"/>
    </linearGradient>
    <linearGradient id="floor" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON}" x2="0" y2="${H}">
      <stop offset="0" stop-color="#0b0d12"/>
      <stop offset="0.35" stop-color="#0e1016"/>
      <stop offset="1" stop-color="#05060a"/>
    </linearGradient>
    <linearGradient id="slitLight" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="${HORIZON}">
      <stop offset="0" stop-color="#fff4da" stop-opacity="0"/>
      <stop offset="0.2" stop-color="#ffeccb" stop-opacity="0.40"/>
      <stop offset="0.55" stop-color="#ffe0a6" stop-opacity="0.92"/>
      <stop offset="1" stop-color="#ffcf8a" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="pool" gradientUnits="userSpaceOnUse" x1="${SLIT_BOT_X}" y1="${HORIZON}" x2="240" y2="560">
      <stop offset="0" stop-color="#fff6e4" stop-opacity="0.85"/>
      <stop offset="0.10" stop-color="#ffdfab" stop-opacity="0.55"/>
      <stop offset="0.35" stop-color="#e0a162" stop-opacity="0.22"/>
      <stop offset="0.7" stop-color="#7c4f28" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="rim" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#8fd3e2" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#8fd3e2" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="soft2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="soft3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>

  <rect width="${W}" height="${HORIZON}" fill="url(#wall)"/>
  <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floor)"/>

  <!-- 他那屋子的光，漫过来一层 -->
  <ellipse cx="690" cy="${HORIZON + 40}" rx="200" ry="170" fill="#ffce8f" opacity="0.055" filter="url(#soft2)"/>

  <!-- 地上那汪光：从缝脚斜着往画面前方铺开 -->
  <path d="M${SLIT_BOT_X} ${HORIZON} L250 ${HORIZON + 30} L330 ${H} L${SLIT_BOT_X + 60} ${H} Z"
        fill="url(#pool)" opacity="0.55" filter="url(#soft2)"/>
  <path d="M${SLIT_BOT_X} ${HORIZON} L268 ${HORIZON + 42} L392 ${H} L${SLIT_BOT_X + 40} ${H} Z"
        fill="url(#pool)" opacity="0.80" filter="url(#soft)"/>

  <!-- 缝：从画顶外斜插到地面 -->
  <polygon points="${SLIT_TOP_X - SLIT_TOP_W / 2},0 ${SLIT_TOP_X + SLIT_TOP_W / 2},0 ${SLIT_BOT_X + SLIT_BOT_W / 2},${HORIZON} ${SLIT_BOT_X - SLIT_BOT_W / 2},${HORIZON}"
           fill="url(#slitLight)" opacity="0.5" filter="url(#soft)"/>
  <polygon points="${SLIT_TOP_X - SLIT_TOP_W / 2},0 ${SLIT_TOP_X + SLIT_TOP_W / 2},0 ${SLIT_BOT_X + SLIT_BOT_W / 2},${HORIZON} ${SLIT_BOT_X - SLIT_BOT_W / 2},${HORIZON}"
           fill="url(#slitLight)"/>

  <!-- 缝脚那一小块最亮 -->
  <ellipse cx="${SLIT_BOT_X}" cy="${HORIZON + 4}" rx="26" ry="9" fill="#ffe3b4" opacity="0.5" filter="url(#soft3)"/>

  <!-- 我这边：只留一块玻璃的边（不画全貌），一条青色边光 -->
  <g>
    <rect x="0" y="150" width="86" height="300" fill="#0a1619"/>
    <rect x="82" y="150" width="3" height="300" fill="#8fd3e2" opacity="0.35"/>
    <rect x="82" y="150" width="26" height="300" fill="url(#rim)"/>
    <ellipse cx="60" cy="440" rx="120" ry="14" fill="#000" opacity="0.55" filter="url(#soft)"/>
  </g>

  <!-- 尘：只落在光和暗交界的那一带 -->
  <g fill="#fff1d4">
    ${Array.from({ length: 70 }, (_, i) => {
      const s = (i * 7919 % 1000) / 1000
      const t = (i * 104729 % 1000) / 1000
      const x = 600 - s * 240 - t * 60
      const y = 240 + t * 250
      const r = 0.5 + (i % 5) * 0.3
      const o = 0.06 + (i % 7) * 0.05
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" opacity="${o.toFixed(2)}"/>`
    }).join('\n    ')}
  </g>
</svg>`

const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng()
fs.writeFileSync(out, png)
console.log('saved', out)
