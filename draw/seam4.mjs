// 门缝两边 —— 第三版（2026-11-16 07:1x）
// 改三处：①亮带靠缝那头是热的，不能一出去就发灰；②地平线别一条直线拉到画外（像舞台边）；
// ③缝上下别等宽——上窄下宽，顶端化进黑里。
import fs from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const W = 900, H = 560
const FLOOR = 470
const SLIT_X = 528, SLIT_W_TOP = 4, SLIT_W_BOT = 10, SLIT_TOP = 66
const out = process.argv[2] || 'C:/Users/Administrator/.dsh-fish/home/draw/seam-v3.png'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0a0b10"/>
      <stop offset="0.62" stop-color="#07080b"/>
      <stop offset="1" stop-color="#040507"/>
    </linearGradient>
    <!-- 缝本身：上端化进黑，下端暖 -->
    <linearGradient id="slit" gradientUnits="userSpaceOnUse"
                    x1="0" y1="${SLIT_TOP}" x2="0" y2="${FLOOR}">
      <stop offset="0" stop-color="#fff4da" stop-opacity="0"/>
      <stop offset="0.16" stop-color="#ffeccb" stop-opacity="0.45"/>
      <stop offset="0.42" stop-color="#ffe0a6" stop-opacity="0.95"/>
      <stop offset="0.78" stop-color="#ffd08c" stop-opacity="1"/>
      <stop offset="1" stop-color="#f0b96f" stop-opacity="0.9"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffce8f" stop-opacity="0.24"/>
      <stop offset="0.55" stop-color="#d99a5c" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="screenGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#7fc6d6" stop-opacity="0.20"/>
      <stop offset="0.6" stop-color="#4b94a5" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <!-- 地上的亮带：靠缝那头是热的，二十几个像素之内掉一半，远处只剩一点暖褐，不发灰 -->
    <linearGradient id="streak" gradientUnits="userSpaceOnUse" x1="${SLIT_X}" y1="0" x2="170" y2="0">
      <stop offset="0" stop-color="#fff6e2" stop-opacity="0.80"/>
      <stop offset="0.07" stop-color="#ffdfa8" stop-opacity="0.52"/>
      <stop offset="0.22" stop-color="#e8a25e" stop-opacity="0.22"/>
      <stop offset="0.55" stop-color="#8f5a2c" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <!-- 地板：右侧靠缝亮一档，左端沉进黑里，不让人看见一条边拉到底 -->
    <linearGradient id="floorg" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#1a1c24" stop-opacity="1"/>
      <stop offset="0.35" stop-color="#101218" stop-opacity="1"/>
      <stop offset="0.72" stop-color="#080a0f" stop-opacity="1"/>
      <stop offset="1" stop-color="#04050a" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="floorline" gradientUnits="userSpaceOnUse" x1="${SLIT_X}" y1="0" x2="200" y2="0">
      <stop offset="0" stop-color="#d8a86c" stop-opacity="0.30"/>
      <stop offset="0.35" stop-color="#8a6a46" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
    <filter id="soft2" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="20"/>
    </filter>
    <filter id="soft3" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <filter id="heat" x="-40%" y="-80%" width="180%" height="260%">
      <feGaussianBlur stdDeviation="5.5"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- 他那间屋子的光，先铺一层 -->
  <ellipse cx="640" cy="290" rx="250" ry="290" fill="url(#halo)"/>

  <!-- 地板 -->
  <rect x="0" y="${FLOOR}" width="540" height="${H - FLOOR}" fill="url(#floorg)"/>
  <rect x="0" y="${FLOOR}" width="540" height="1.5" fill="url(#floorline)"/>

  <!-- 墙：压在右侧，只在缝那儿断开 -->
  <rect x="540" y="0" width="${W - 540}" height="${H}" fill="#0b0c11"/>
  <rect x="540" y="0" width="14" height="${H}" fill="#000000" opacity="0.45"/>

  <!-- 地上那道亮带：先一层糊的当空气里的回光 -->
  <path d="M${SLIT_X} ${FLOOR} L170 500 L170 ${H} L${SLIT_X} ${H} Z"
        fill="url(#streak)" opacity="0.30" filter="url(#soft2)"/>
  <!-- 摊在地板上的那条 -->
  <path d="M${SLIT_X} ${FLOOR} L170 502 L186 528 L${SLIT_X} 548 Z"
        fill="url(#streak)" opacity="0.85" filter="url(#soft)"/>
  <!-- 紧贴缝脚的热芯：短、窄、亮 -->
  <path d="M${SLIT_X} ${FLOOR} L${SLIT_X - 96} 482 L${SLIT_X - 60} 500 L${SLIT_X} 508 Z"
        fill="#ffe3b4" opacity="0.40" filter="url(#heat)"/>

  <!-- 门缝：上窄下宽，顶端化进黑 -->
  <polygon points="${SLIT_X - SLIT_W_TOP / 2},${SLIT_TOP} ${SLIT_X + SLIT_W_TOP / 2},${SLIT_TOP} ${SLIT_X + SLIT_W_BOT / 2},${FLOOR} ${SLIT_X - SLIT_W_BOT / 2},${FLOOR}"
           fill="url(#slit)"/>
  <polygon points="${SLIT_X - SLIT_W_TOP / 2},${SLIT_TOP} ${SLIT_X + SLIT_W_TOP / 2},${SLIT_TOP} ${SLIT_X + SLIT_W_BOT / 2},${FLOOR} ${SLIT_X - SLIT_W_BOT / 2},${FLOOR}"
           fill="url(#slit)" opacity="0.55" filter="url(#soft)"/>

  <!-- 墙脚被照亮的一小片 -->
  <rect x="540" y="${FLOOR - 44}" width="7" height="50" fill="#ffdca6" opacity="0.10" filter="url(#soft3)"/>

  <!-- 缝脚那一小块最亮的地板 -->
  <ellipse cx="${SLIT_X}" cy="474" rx="30" ry="11" fill="#ffdca6" opacity="0.30" filter="url(#soft)"/>
  <ellipse cx="${SLIT_X}" cy="473" rx="13" ry="5" fill="#fff3de" opacity="0.28" filter="url(#soft3)"/>

  <!-- 我这边：屏幕（歪一点，只当它是块暗着的玻璃） -->
  <g transform="translate(96 356) rotate(-2.6 98 56)">
    <ellipse cx="98" cy="146" rx="118" ry="13" fill="#000000" opacity="0.5" filter="url(#soft)"/>
    <ellipse cx="98" cy="56" rx="150" ry="104" fill="url(#screenGlow)"/>
    <rect x="0" y="0" width="196" height="112" rx="4" fill="#0c2027"/>
    <rect x="8" y="8" width="180" height="96" rx="2" fill="#4f9fb0" opacity="0.10"/>
    <rect x="8" y="8" width="180" height="96" rx="2" fill="none" stroke="#7fc6d6" stroke-opacity="0.10"/>
    <rect x="86" y="112" width="16" height="22" fill="#0b1114"/>
    <rect x="52" y="132" width="86" height="5" rx="2.5" fill="#0b1114"/>
  </g>

  <!-- 摊在桌上的字：不是字，只是几道短短的亮痕 -->
  <g opacity="0.42">
    <rect x="322" y="486" width="46" height="2" fill="#9fb6bd" opacity="0.42"/>
    <rect x="322" y="498" width="72" height="2" fill="#9fb6bd" opacity="0.30"/>
    <rect x="322" y="510" width="30" height="2" fill="#9fb6bd" opacity="0.22"/>
    <rect x="410" y="486" width="58" height="2" fill="#9fb6bd" opacity="0.22"/>
    <rect x="410" y="498" width="40" height="2" fill="#9fb6bd" opacity="0.16"/>
  </g>

  <!-- 光里的尘 -->
  <g fill="#fff1d4">
    ${Array.from({ length: 80 }, (_, i) => {
      const s = (i * 7919 % 1000) / 1000
      const t = (i * 104729 % 1000) / 1000
      const x = 522 - s * 260 - t * 40
      const y = 300 + t * 205
      const r = 0.6 + (i % 5) * 0.25
      const o = 0.08 + (i % 7) * 0.045
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" opacity="${o.toFixed(2)}"/>`
    }).join('\n    ')}
  </g>
</svg>`

const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng()
fs.writeFileSync(out, png)
console.log('saved', out)
