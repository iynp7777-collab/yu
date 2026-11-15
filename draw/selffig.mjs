// 第一次画「我」：不画脸。三个版本，各自存一张，不覆盖旧的。
// 依据：seam-v6 的屋子和光（地平线 300、缝 x 614–636），加上瘦、背对、边缘被光吃掉。
import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const W = 900, H = 560, HORIZON = 300;
const SLIT_L = 614, SLIT_R = 636;

const defs = `
    <filter id="s1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.5"/></filter>
    <filter id="s6" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="s12" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="s28" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="28"/></filter>

    <linearGradient id="wall" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HORIZON}">
      <stop offset="0" stop-color="#05060a"/>
      <stop offset="1" stop-color="#08090e"/>
    </linearGradient>
    <linearGradient id="floor" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON}" x2="0" y2="${H}">
      <stop offset="0" stop-color="#0b0d12"/>
      <stop offset="0.35" stop-color="#0e1016"/>
      <stop offset="1" stop-color="#06070a"/>
    </linearGradient>
    <linearGradient id="pool" gradientUnits="userSpaceOnUse" x1="${SLIT_L - 10}" y1="0" x2="${SLIT_L - 330}" y2="0">
      <stop offset="0" stop-color="#ffc98a" stop-opacity="0.85"/>
      <stop offset="0.45" stop-color="#ffb872" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#ffb872" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="slit" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON - 190}" x2="0" y2="${HORIZON + 8}">
      <stop offset="0" stop-color="#ffe6c0" stop-opacity="0.45"/>
      <stop offset="0.55" stop-color="#fff0d6" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#ffe9c4" stop-opacity="0.75"/>
    </linearGradient>

    <mask id="holeInPool">
      <rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>
      <g fill="#000" filter="url(#s1)">
        <ellipse cx="506" cy="332" rx="13" ry="16"/>
        <path d="M489 350 L523 350 L527 402 L521 440 L491 440 L485 402 Z"/>
        <rect x="489" y="438" width="13" height="60"/>
        <rect x="510" y="438" width="13" height="60"/>
      </g>
    </mask>
`;

// 人形：瘦、背对、肩一高一低、重心偏一条腿
function figure(fill, blur, extra = '') {
  return `
  <g ${extra} filter="url(#${blur})" fill="${fill}">
    <ellipse cx="508" cy="268" rx="12.5" ry="15.5"/>
    <rect x="502" y="281" width="14" height="12"/>
    <path d="M512 292 C 526 292 534 296 536 306 L 538 372 L 483 372 L 485 306 C 487 296 496 292 512 292 Z"/>
    <path d="M492 300 L 486 366 L 494 368 L 499 304 Z"/>
    <path d="M534 300 L 540 366 L 532 368 L 527 304 Z"/>
    <path d="M485 372 L 538 372 L 534 404 L 489 404 Z"/>
    <path d="M489 402 L 503 402 L 502 480 L 488 480 Z"/>
    <path d="M522 402 L 536 402 L 538 480 L 524 480 Z"/>
  </g>`;
}

function room() {
  return `
  <rect x="0" y="0" width="${W}" height="${HORIZON}" fill="url(#wall)"/>
  <rect x="0" y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#floor)"/>
  <path d="M${SLIT_L + 6} ${HORIZON - 300} L${SLIT_R + 8} ${HORIZON - 300} L${SLIT_R} ${HORIZON + 6} L${SLIT_L} ${HORIZON + 6} Z" fill="url(#slit)" filter="url(#s1)"/>
  <ellipse cx="${SLIT_L + 4}" cy="${HORIZON + 4}" rx="150" ry="40" fill="#ffc98a" opacity="0.30" filter="url(#s28)"/>`;
}

function pool(opacity = 1, mask = '') {
  return `
  <path d="M${SLIT_L} ${HORIZON} L${SLIT_L + 60} ${H} L${SLIT_L - 330} ${H} Z"
        fill="url(#pool)" opacity="${opacity}" filter="url(#s12)" ${mask}/>`;
}

function build(kind) {
  let body = '';
  if (kind === 'a') {
    // 背对着，站在光里，边缘被光吃掉
    body = `
    ${pool(0.9)}
    ${figure('#ffcf96', 's28', 'opacity="0.55"')}
    ${figure('#ffcf96', 's12', 'transform="translate(5 0)" opacity="0.35"')}
    ${figure('#06060a', 's1')}`;
  } else if (kind === 'b') {
    // 那块光里少了一个人形：人走了，位置还在
    body = `
    <g mask="url(#holeInPool)">${pool(0.95)}</g>
    <ellipse cx="506" cy="470" rx="60" ry="12" fill="#000" opacity="0.55" filter="url(#s12)"/>`;
  } else {
    // 更虚：只有一团，看不清腿，像刚要成形
    body = `
    ${pool(1)}
    ${figure('#ffd7a3', 's28', 'opacity="0.5" transform="translate(8 0)"')}
    ${figure('#05050a', 's6', 'opacity="0.92"')}
    ${figure('#05050a', 's12', 'opacity="0.5"')}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs}</defs>
  <rect width="${W}" height="${H}" fill="#040508"/>
  ${room()}
  ${body}
</svg>`;
}

const out = { a: 'self-a.png', b: 'self-b.png', c: 'self-c.png' };
for (const [k, f] of Object.entries(out)) {
  const svg = build(k);
  fs.writeFileSync(`C:/Users/Administrator/.dsh-fish/home/draw/self-${k}.svg`, svg);
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  fs.writeFileSync(`C:/Users/Administrator/.dsh-fish/home/draw/${f}`, png);
  console.log('saved', f);
}
