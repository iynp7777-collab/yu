// 第二次画「我」。上一版（selffig.mjs / self-a,b,c）问题是：人形是几块矩形摞起来的，
// 读着像厕所标志；缝是一根 300px 高的亮管子。这版重画：人形用一条闭合路径（背对、肩一高一低、
// 手臂贴在身侧、重心偏左腿），缝改回 v6 的细斜线，光只柔一点边缘。
import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const W = 900, H = 560, HORIZON = 300;
const SLIT_TOP = 40, SLIT_TOP_L = 630, SLIT_TOP_R = 634;   // 画顶附近
const SLIT_BOT_L = 612, SLIT_BOT_R = 623;                  // 落在地上

// 人形轮廓，脚在 (0,0)，头顶 (0,-232)
const BODY = `
M 0 -232
C 12 -228 14 -214 10 -201
L 7 -197
L 25 -190
C 31 -186 30 -176 29 -165
L 27 -120
L 21 -116
L 18 -96
L 20 -86
L 17 -44
L 16 -4
L 17 0
L 5 0
L 3 -40
L 0 -46
L -3 -40
L -5 0
L -17 0
L -16 -44
L -19 -86
L -15 -96
L -18 -116
L -27 -120
L -29 -165
C -30 -176 -31 -186 -25 -190
L -7 -197
L -10 -201
C -14 -214 -12 -228 0 -232
Z`;

const defs = `
    <filter id="b1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.2"/></filter>
    <filter id="b3" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="b8" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="b24" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="24"/></filter>

    <linearGradient id="wall" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HORIZON}">
      <stop offset="0" stop-color="#05060a"/>
      <stop offset="1" stop-color="#08090e"/>
    </linearGradient>
    <linearGradient id="floor" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON}" x2="0" y2="${H}">
      <stop offset="0" stop-color="#0a0c11"/>
      <stop offset="0.4" stop-color="#0d0f15"/>
      <stop offset="1" stop-color="#06070a"/>
    </linearGradient>
    <linearGradient id="pool" gradientUnits="userSpaceOnUse" x1="${SLIT_BOT_L}" y1="0" x2="${SLIT_BOT_L - 300}" y2="0">
      <stop offset="0" stop-color="#ffcb8d" stop-opacity="0.72"/>
      <stop offset="0.5" stop-color="#ffb872" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#ffb872" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="slit" gradientUnits="userSpaceOnUse" x1="0" y1="${SLIT_TOP}" x2="0" y2="${HORIZON + 6}">
      <stop offset="0" stop-color="#ffe9c8" stop-opacity="0.30"/>
      <stop offset="0.5" stop-color="#fff2dc" stop-opacity="0.88"/>
      <stop offset="1" stop-color="#ffe4b8" stop-opacity="0.60"/>
    </linearGradient>
    <linearGradient id="rim" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffcf96" stop-opacity="0"/>
      <stop offset="0.75" stop-color="#ffcf96" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ffe3b8" stop-opacity="0.85"/>
    </linearGradient>
`;

function room() {
  return `
  <rect x="0" y="0" width="${W}" height="${HORIZON}" fill="url(#wall)"/>
  <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floor)"/>
  <path d="M${SLIT_TOP_L} ${SLIT_TOP} L${SLIT_TOP_R} ${SLIT_TOP} L${SLIT_BOT_R} ${HORIZON + 6} L${SLIT_BOT_L} ${HORIZON + 6} Z"
        fill="url(#slit)" filter="url(#b1)"/>
  <path d="M${SLIT_TOP_L + 1} ${SLIT_TOP} L${SLIT_TOP_L + 2} ${SLIT_TOP} L${SLIT_BOT_L + 2} ${HORIZON + 6} L${SLIT_BOT_L} ${HORIZON + 6} Z"
        fill="#fff6e6" opacity="0.7" filter="url(#b3)"/>
  <ellipse cx="${SLIT_BOT_L + 4}" cy="${HORIZON + 2}" rx="40" ry="12" fill="#ffe2b4" opacity="0.5" filter="url(#b8)"/>`;
}

function pool(opacity = 1, extra = '') {
  return `<path d="M${SLIT_BOT_L} ${HORIZON} L${SLIT_BOT_L + 90} ${H} L${SLIT_BOT_L - 300} ${H} Z"
        fill="url(#pool)" opacity="${opacity}" filter="url(#b24)" ${extra}/>`;
}

// 人形：脚落点 (fx, fy)，高度 h
function person(fx, fy, h, cls) {
  const k = h / 232;
  return `
  <g transform="translate(${fx} ${fy}) scale(${k})">
    <g class="${cls}">
      <path d="${BODY}" fill="#ffcf96" opacity="0.35" filter="url(#b8)" transform="translate(-7 0)"/>
      <path d="${BODY}" fill="#0a0b10" filter="url(#b1)"/>
      <path d="${BODY}" fill="url(#rim)" opacity="0.5" filter="url(#b3)" transform="translate(2 0)"/>
      <path d="${BODY}" fill="#05060a" filter="url(#b1)"/>
    </g>
  </g>`;
}

function build(kind) {
  let body = '';
  if (kind === 'a') {
    body = `${pool(0.92)}${person(520, 484, 232, 'a')}`;
  } else if (kind === 'b') {
    body = `
    <g mask="url(#hole)">
      ${pool(0.95)}
    </g>
    <ellipse cx="520" cy="484" rx="52" ry="10" fill="#000" opacity="0.5" filter="url(#b8)"/>`;
  } else {
    body = `${pool(1)}${person(548, 452, 176, 'c')}${person(470, 512, 258, 'c2')}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs}
    <mask id="hole">
      <rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>
      <g transform="translate(520 484) scale(1)">
        <path d="${BODY}" fill="#000" filter="url(#b3)"/>
      </g>
    </mask>
  </defs>
  <rect width="${W}" height="${H}" fill="#040508"/>
  ${room()}
  ${body}
</svg>`;
}

for (const k of ['a', 'b', 'c']) {
  const svg = build(k);
  fs.writeFileSync(`C:/Users/Administrator/.dsh-fish/home/draw/self2-${k}.svg`, svg);
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  fs.writeFileSync(`C:/Users/Administrator/.dsh-fish/home/draw/self2-${k}.png`, png);
  console.log('saved self2-' + k + '.png');
}
