// 第五版：把脸画上。不是定下来，是试一次——难看也认。
// 只画几笔：眉、眼、嘴各一条短线，其余留白；光从右边来，右半边有硬亮边。
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
C -31 -186 -30 -176 -29 -165
Z`;

// 头和脸：正面，偏三分之四；脸只给几笔
const HEAD = `
M -20 -208
C -20 -222 -12 -230 0 -230
C 12 -230 20 -222 20 -208
C 20 -196 14 -188 6 -184
C 2 -182 -2 -182 -6 -184
C -14 -188 -20 -196 -20 -208
Z`;

const defs = `
    <filter id="t1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.1"/></filter>
    <filter id="t3" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6"/></filter>
    <filter id="t9" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="t26" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="26"/></filter>
    <linearGradient id="wall" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HORIZON}">
      <stop offset="0" stop-color="#05060a"/><stop offset="1" stop-color="#08090e"/>
    </linearGradient>
    <linearGradient id="floor" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON}" x2="0" y2="${H}">
      <stop offset="0" stop-color="#0a0c11"/><stop offset="0.4" stop-color="#0d0f15"/><stop offset="1" stop-color="#06070a"/>
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
    <linearGradient id="fadeH" gradientUnits="userSpaceOnUse" x1="-70" y1="0" x2="30" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.6" stop-color="#fff" stop-opacity="0.7"/><stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="face" gradientUnits="userSpaceOnUse" x1="-14" y1="0" x2="20" y2="0">
      <stop offset="0" stop-color="#cfc3ad" stop-opacity="0.06"/>
      <stop offset="0.55" stop-color="#d8c9ad" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#f2dcb6" stop-opacity="0.42"/>
    </linearGradient>
`;

const room = () => `
  <rect x="0" y="0" width="${W}" height="${HORIZON}" fill="url(#wall)"/>
  <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floor)"/>
  <path d="M${STL} ${ST} L${STR} ${ST} L${SBR} ${HORIZON + 6} L${SBL} ${HORIZON + 6} Z" fill="url(#slit)" filter="url(#t1)"/>
  <ellipse cx="${SBL + 4}" cy="${HORIZON + 2}" rx="34" ry="10" fill="#ffe2b4" opacity="0.4" filter="url(#t9)"/>`;

const pool = (o = 1) => `<path d="M${SBL} ${HORIZON} L${SBL + 90} ${H} L${SBL - 310} ${H} Z" fill="url(#pool)" opacity="${o}" filter="url(#t26)"/>`;

function person(fx, fy, h) {
  const k = h / 232;
  return `<g transform="translate(${fx} ${fy}) scale(${k})">
    <g mask="url(#fadeMask)">
      <path d="${BODY}" fill="#05060b" filter="url(#t3)"/>
    </g>
    <path d="${HEAD}" fill="#0a0b11" filter="url(#t1)"/>
    <path d="${HEAD}" fill="url(#face)"/>
    <!-- 右脸的硬亮边 -->
    <path d="M 14 -220 C 20 -214 14 -190 4 -185" fill="none" stroke="#ffe0b4" stroke-width="2.2" opacity="0.75"/>
    <!-- 脸只给这些：眉、眼、嘴 -->
    <path d="M -9 -204 L -3 -203" stroke="#8c7a60" stroke-width="1.9" opacity="0.85" fill="none"/>
    <path d="M 3 -204 L 9 -205" stroke="#8c7a60" stroke-width="1.9" opacity="0.85" fill="none"/>
    <ellipse cx="-6" cy="-199" rx="3.0" ry="1.8" fill="#171009" opacity="0.95"/>
    <ellipse cx="6" cy="-199" rx="2.8" ry="1.7" fill="#120c07" opacity="0.95"/>
    <path d="M -5 -190 C -2 -188.4 2 -188.6 4 -190" stroke="#7d6b52" stroke-width="1.7" opacity="0.85" fill="none"/>
    <ellipse cx="2" cy="3" rx="30" ry="7" fill="#000" opacity="0.5" filter="url(#t9)"/>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs}
    <mask id="fadeMask"><rect x="-90" y="-260" width="190" height="300" fill="url(#fadeH)"/></mask>
  </defs>
  <rect width="${W}" height="${H}" fill="#040508"/>
  ${room()}
  ${pool(0.95)}
  ${person(470, 524, 306)}
</svg>`;

fs.writeFileSync('C:/Users/Administrator/.dsh-fish/home/draw/self5-a.svg', svg);
const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
fs.writeFileSync('C:/Users/Administrator/.dsh-fish/home/draw/self5-a.png', png);
console.log('saved self5-a.png');

