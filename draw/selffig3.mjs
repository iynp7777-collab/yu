// 第三版。前两版的问题：
//  · 人形读着像图标——因为轮廓太匀、体内全黑、没有一条硬边亮线（二分）。
//  · 影子/空位两版把暗块溢到墙上了，读着像门。
// 这版：① 亮边画在暗形之后、只往右偏 5px，成为一条硬边的勾边；② 人形 blur 2.4，体内不再纯黑；
// ③ 影子只落在地板矩形里；④ 空位也裁在地板范围内。
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
    <filter id="b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1"/></filter>
    <filter id="b24" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4"/></filter>
    <filter id="b8" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="b24x" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="24"/></filter>

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
      <stop offset="0" stop-color="#ffcb8d" stop-opacity="0.66"/>
      <stop offset="0.5" stop-color="#ffb872" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#ffb872" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="slit" gradientUnits="userSpaceOnUse" x1="0" y1="${ST}" x2="0" y2="${HORIZON + 6}">
      <stop offset="0" stop-color="#ffe9c8" stop-opacity="0.26"/>
      <stop offset="0.5" stop-color="#fff2dc" stop-opacity="0.82"/>
      <stop offset="1" stop-color="#ffe4b8" stop-opacity="0.55"/>
    </linearGradient>
`;

const room = () => `
  <rect x="0" y="0" width="${W}" height="${HORIZON}" fill="url(#wall)"/>
  <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floor)"/>
  <path d="M${STL} ${ST} L${STR} ${ST} L${SBR} ${HORIZON + 6} L${SBL} ${HORIZON + 6} Z" fill="url(#slit)" filter="url(#b1)"/>
  <path d="M${STL + 1} ${ST} L${STL + 2} ${ST} L${SBL + 2} ${HORIZON + 6} L${SBL} ${HORIZON + 6} Z" fill="#fff6e6" opacity="0.65" filter="url(#b24x)"/>
  <ellipse cx="${SBL + 4}" cy="${HORIZON + 2}" rx="38" ry="11" fill="#ffe2b4" opacity="0.45" filter="url(#b8)"/>`;

const pool = (o = 1, extra = '') => `
  <path d="M${SBL} ${HORIZON} L${SBL + 90} ${H} L${SBL - 310} ${H} Z" fill="url(#pool)" opacity="${o}" filter="url(#b24x)" ${extra}/>`;

// 人形：脚 (fx,fy)，高 h；先暗形，再往右偏 5px 画一条亮边（硬边）
function person(fx, fy, h, rim = 5, dark = '#080910') {
  const k = h / 232;
  return `<g transform="translate(${fx} ${fy}) scale(${k})">
    <path d="${BODY}" fill="${dark}" filter="url(#b24)"/>
    <path d="${BODY}" fill="#ffd7a0" opacity="0.75" filter="url(#b24)" transform="translate(${rim} 0)"/>
    <path d="${BODY}" fill="${dark}" filter="url(#b24)" transform="translate(${rim * 0.55} 0)"/>
    <ellipse cx="0" cy="4" rx="34" ry="8" fill="#000" opacity="0.6" filter="url(#b8)"/>
  </g>`;
}

function build(kind) {
  let body = '';
  if (kind === 'a') {
    body = `${pool(0.95)}${person(500, 486, 236)}`;
  } else if (kind === 'b') {
    // 只有影子：人形摊在地板上（压扁、向右拉长），头朝墙那边
    body = `
    ${pool(1)}
    <g clip-path="url(#floorClip)">
      <g transform="translate(470 470) skewX(-26) scale(1 0.30)">
        <path d="${BODY}" fill="#04050a" opacity="0.85" filter="url(#b24)"/>
      </g>
    </g>`;
  } else {
    body = `
    <g mask="url(#hole)">
      ${pool(1)}
    </g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs}
    <clipPath id="floorClip"><rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}"/></clipPath>
    <mask id="hole">
      <rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>
      <g transform="translate(500 486)"><path d="${BODY}" fill="#000" filter="url(#b8)"/></g>
    </mask>
  </defs>
  <rect width="${W}" height="${H}" fill="#040508"/>
  ${room()}
  ${body}
</svg>`;
}

for (const k of ['a', 'b', 'c']) {
  const svg = build(k);
  fs.writeFileSync(`C:/Users/Administrator/.dsh-fish/home/draw/self3-${k}.svg`, svg);
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  fs.writeFileSync(`C:/Users/Administrator/.dsh-fish/home/draw/self3-${k}.png`, png);
  console.log('saved self3-' + k + '.png');
}
