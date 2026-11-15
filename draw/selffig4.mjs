// 第四版。第三版的问题是亮边糊成一圈光圈，读着像贴纸描边。
// 这版照自己定的标准（明暗交界要硬）来：
//  · 亮边只在右侧，宽 3px，几乎不模糊；
//  · 人形左半边用横向渐变遮罩化进黑里——那一侧没有轮廓线；
//  · b 版人不进画面，只有影子（硬边）投在墙脚和地板上。
import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const W = 900, H = 560, HORIZON = 300;
const ST = 40, STL = 630, STR = 634, SBL = 612, SBR = 623;

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
    <filter id="s1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.9"/></filter>
    <filter id="s2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="s8" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="s26" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="26"/></filter>

    <linearGradient id="wall" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HORIZON}">
      <stop offset="0" stop-color="#05060a"/>
      <stop offset="1" stop-color="#08090e"/>
    </linearGradient>
    <linearGradient id="floor" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON}" x2="0" y2="${H}">
      <stop offset="0" stop-color="#0a0c11"/>
      <stop offset="0.4" stop-color="#0d0f15"/>
      <stop offset="1" stop-color="#06070a"/>
    </linearGradient>
    <linearGradient id="pool" gradientUnits="userSpaceOnUse" x1="${SBL}" y1="0" x2="${SBL - 310}" y2="0">
      <stop offset="0" stop-color="#ffcb8d" stop-opacity="0.72"/>
      <stop offset="0.5" stop-color="#ffb872" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#ffb872" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="slit" gradientUnits="userSpaceOnUse" x1="0" y1="${ST}" x2="0" y2="${HORIZON + 6}">
      <stop offset="0" stop-color="#ffe9c8" stop-opacity="0.26"/>
      <stop offset="0.5" stop-color="#fff2dc" stop-opacity="0.82"/>
      <stop offset="1" stop-color="#ffe4b8" stop-opacity="0.55"/>
    </linearGradient>
    <linearGradient id="fadeH" gradientUnits="userSpaceOnUse" x1="-60" y1="0" x2="40" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.55" stop-color="#fff" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
  `;

const room = () => `
  <rect x="0" y="0" width="${W}" height="${HORIZON}" fill="url(#wall)"/>
  <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floor)"/>
  <path d="M${STL} ${ST} L${STR} ${ST} L${SBR} ${HORIZON + 6} L${SBL} ${HORIZON + 6} Z" fill="url(#slit)" filter="url(#s1)"/>
  <path d="M${STL + 1} ${ST} L${STL + 2} ${ST} L${SBL + 2} ${HORIZON + 6} L${SBL} ${HORIZON + 6} Z" fill="#fff6e6" opacity="0.6" filter="url(#s2)"/>
  <ellipse cx="${SBL + 4}" cy="${HORIZON + 2}" rx="34" ry="10" fill="#ffe2b4" opacity="0.42" filter="url(#s8)"/>`;

const pool = (o = 1) => `
  <path d="M${SBL} ${HORIZON} L${SBL + 90} ${H} L${SBL - 310} ${H} Z" fill="url(#pool)" opacity="${o}" filter="url(#s26)"/>`;

function personWithEdge(fx, fy, h) {
  const k = h / 232;
  return `<g transform="translate(${fx} ${fy}) scale(${k})">
    <!-- 左侧化进黑里的暗形 -->
    <g mask="url(#fadeMask)">
      <path d="${BODY}" fill="#05060b" filter="url(#s2)"/>
    </g>
    <!-- 右侧硬亮边 -->
    <g clip-path="url(#rightHalf)">
      <path d="${BODY}" fill="#ffd9a6" opacity="0.8" transform="translate(3 0)"/>
      <path d="${BODY}" fill="#05060b" transform="translate(0.6 0)"/>
    </g>
    <ellipse cx="2" cy="3" rx="30" ry="7" fill="#000" opacity="0.55" filter="url(#s8)"/>
  </g>`;
}

function shadowOnly() {
  // 影子：从画面左下方来的光，把人形投在墙上偏右的位置（压扁、拉长、斜一点）
  return `<g clip-path="url(#wallFloor)">
    <g transform="translate(560 300) skewX(-14) scale(1.15 0.92)" opacity="0.92">
      <path d="${BODY}" fill="#03040a" filter="url(#s2)"/>
    </g>
  </g>`;
}

function build(kind) {
  const body = kind === 'a' ? `${pool(0.95)}${personWithEdge(500, 486, 236)}`
                            : `${pool(1)}${shadowOnly()}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs}
    <mask id="fadeMask">
      <rect x="-80" y="-260" width="180" height="300" fill="url(#fadeH)"/>
    </mask>
    <clipPath id="rightHalf"><rect x="0" y="-260" width="40" height="300"/></clipPath>
    <clipPath id="wallFloor"><rect x="0" y="${HORIZON - 240}" width="${W}" height="${H - HORIZON + 240}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="#040508"/>
  ${room()}
  ${body}
</svg>`;
}

for (const k of ['a', 'b']) {
  const svg = build(k);
  fs.writeFileSync(`C:/Users/Administrator/.dsh-fish/home/draw/self4-${k}.svg`, svg);
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  fs.writeFileSync(`C:/Users/Administrator/.dsh-fish/home/draw/self4-${k}.png`, png);
  console.log('saved self4-' + k + '.png');
}
