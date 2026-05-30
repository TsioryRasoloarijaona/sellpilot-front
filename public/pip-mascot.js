/*!
 * <pip-mascot> · SellPilot animated mascot · v1.0
 * -----------------------------------------------------------
 * Drop-in Web Component. No dependencies. Works in any framework.
 *
 * Usage:
 *   <script src="pip-mascot.js"></script>
 *   <pip-mascot pose="wave" size="160"></pip-mascot>
 *
 * Attributes:
 *   pose        — wave | think | point | celebrate | sleep | oops   (default: wave)
 *   size        — px width/height (number or CSS length)             (default: 100%)
 *   speed       — animation speed multiplier (0.5 = slower, 2 = 2x)  (default: 1)
 *   autocycle   — ms between auto pose changes. Omit to disable.
 *   no-shadow   — set to disable the ground shadow ellipse.
 *
 * Property API:
 *   el.pose = 'celebrate';     // set programmatically
 *   el.cycle([...], 3000);     // cycle a custom pose list
 *   el.stopCycle();
 *
 * Events:
 *   'pose-change' — fired when pose changes ({ detail: { pose } })
 */
(function () {
  const POSES = ['wave', 'think', 'point', 'celebrate', 'sleep', 'oops'];

  const STYLES = `
:host{
  display:inline-block;
  width:160px;height:160px;
  contain:layout style;
  --pip-speed:1;
}
:host([size]){ width:var(--pip-size); height:var(--pip-size); }
svg{ width:100%; height:100%; display:block; overflow:visible; }

/* ---------- always-on animations ---------- */
.pip-shadow{
  transform-box: fill-box; transform-origin:center;
  animation: pip-shadow calc(2.6s / var(--pip-speed)) ease-in-out infinite;
}
@keyframes pip-shadow{
  0%,100%{ transform: scaleX(1); opacity:.22; }
  50%{ transform: scaleX(0.82); opacity:.12; }
}
.pip-body{
  transform-box: fill-box; transform-origin:50% 50%;
  animation: pip-float calc(2.6s / var(--pip-speed)) ease-in-out infinite;
}
@keyframes pip-float{
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-8px); }
}
.blink{
  transform-box: fill-box; transform-origin:center;
  animation: pip-blink calc(5s / var(--pip-speed)) ease-in-out infinite;
}
@keyframes pip-blink{
  0%, 92%, 100%{ transform: scaleY(1); }
  95%{ transform: scaleY(0.08); }
}

/* ---------- wave ---------- */
.pip--wave .arm-wave{
  transform-box: fill-box; transform-origin: 50% 100%;
  animation: pip-wave calc(1.1s / var(--pip-speed)) ease-in-out infinite;
}
@keyframes pip-wave{
  0%,100%{ transform: rotate(-10deg); }
  50%{ transform: rotate(22deg); }
}

/* ---------- think ---------- */
.pip--think .pip-body{ animation-duration: calc(3.2s / var(--pip-speed)); }
.think-dot{
  transform-box: fill-box; transform-origin:center;
  animation: pip-thinkDot calc(1.8s / var(--pip-speed)) ease-in-out infinite;
  opacity:0;
}
.think-dot:nth-of-type(2){ animation-delay: calc(0.25s / var(--pip-speed)); }
.think-dot:nth-of-type(3){ animation-delay: calc(0.5s / var(--pip-speed)); }
@keyframes pip-thinkDot{
  0%{ opacity:0; transform: translateY(10px) scale(.4); }
  25%{ opacity:1; transform: translateY(0) scale(1); }
  75%{ opacity:1; transform: translateY(-2px) scale(1); }
  100%{ opacity:0; transform: translateY(-10px) scale(.8); }
}

/* ---------- point ---------- */
.pip--point .arm-point{
  transform-box: fill-box; transform-origin: 0% 50%;
  animation: pip-point calc(1.6s / var(--pip-speed)) ease-in-out infinite;
}
@keyframes pip-point{
  0%,100%{ transform: translateX(0) rotate(0deg); }
  50%{ transform: translateX(10px) rotate(-6deg); }
}

/* ---------- celebrate ---------- */
.pip--celebrate .pip-body{ animation: pip-bounce calc(.55s / var(--pip-speed)) ease-in-out infinite; }
@keyframes pip-bounce{
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-18px); }
}
.arm-up-l{ transform-box: fill-box; transform-origin:50% 100%; animation: pip-armL calc(.55s / var(--pip-speed)) ease-in-out infinite; }
.arm-up-r{ transform-box: fill-box; transform-origin:50% 100%; animation: pip-armR calc(.55s / var(--pip-speed)) ease-in-out infinite; }
@keyframes pip-armL{ 0%,100%{ transform: rotate(-6deg);} 50%{ transform: rotate(8deg);} }
@keyframes pip-armR{ 0%,100%{ transform: rotate(6deg);} 50%{ transform: rotate(-8deg);} }
.spark{ transform-box: fill-box; transform-origin:center; animation: pip-spark calc(1.2s / var(--pip-speed)) ease-in-out infinite; opacity:.4; }
.spark.s2{ animation-delay: calc(.3s / var(--pip-speed)); }
.spark.s3{ animation-delay: calc(.6s / var(--pip-speed)); }
.spark.s4{ animation-delay: calc(.9s / var(--pip-speed)); }
@keyframes pip-spark{
  0%,100%{ opacity:.2; transform: scale(.5) rotate(0deg); }
  50%{ opacity:1; transform: scale(1.15) rotate(45deg); }
}

/* ---------- sleep ---------- */
.pip--sleep .pip-body{ animation: pip-breathe calc(4s / var(--pip-speed)) ease-in-out infinite; }
@keyframes pip-breathe{
  0%,100%{ transform: translateY(0) scale(1, 1); }
  50%{ transform: translateY(2px) scale(1.02, 0.98); }
}
.zzz{ transform-box: fill-box; transform-origin:center; opacity:0; animation: pip-zzz calc(2.4s / var(--pip-speed)) ease-out infinite; }
.zzz.z2{ animation-delay: calc(.8s / var(--pip-speed)); }
.zzz.z3{ animation-delay: calc(1.6s / var(--pip-speed)); }
@keyframes pip-zzz{
  0%{ opacity:0; transform: translate(0,0) scale(.4) rotate(-10deg); }
  25%{ opacity:1; }
  75%{ opacity:1; }
  100%{ opacity:0; transform: translate(28px, -50px) scale(1.3) rotate(10deg); }
}

/* ---------- oops ---------- */
.pip--oops .pip-body{ animation: pip-shake calc(.4s / var(--pip-speed)) ease-in-out infinite; }
@keyframes pip-shake{
  0%,100%{ transform: translateX(0); }
  25%{ transform: translateX(-5px) rotate(-1deg); }
  75%{ transform: translateX(5px) rotate(1deg); }
}
.oops-badge{ transform-box: fill-box; transform-origin:center; animation: pip-oops calc(.8s / var(--pip-speed)) ease-out infinite; }
@keyframes pip-oops{
  0%,100%{ transform: translateY(0) scale(1); }
  50%{ transform: translateY(-6px) scale(1.12); }
}

@media (prefers-reduced-motion: reduce){
  *{ animation-duration: .001ms !important; animation-iteration-count: 1 !important; }
}
`;

  // --- SVG part templates (vanilla strings) ---
  const DEFS = `
<defs>
  <linearGradient id="pip-grad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%"  stop-color="#6366F1"/>
    <stop offset="55%" stop-color="#8B5CF6"/>
    <stop offset="100%" stop-color="#EC4899"/>
  </linearGradient>
  <radialGradient id="pip-shine" cx="0.3" cy="0.3" r="0.6">
    <stop offset="0%"  stop-color="#ffffff" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
</defs>`;

  const BODY = `
<path d="M -110 -80 a 60 60 0 0 1 60 -60 h 100 a 60 60 0 0 1 60 60 v 90 a 60 60 0 0 1 -60 60 h -68 l -42 38 q -8 6 -10 -4 l -4 -34 a 60 60 0 0 1 -36 -54 z" fill="url(#pip-grad)"/>
<ellipse cx="-50" cy="-90" rx="80" ry="40" fill="url(#pip-shine)"/>
<path d="M -90 -10 q 80 60 200 0 v 30 q -90 50 -200 0 z" fill="#ffffff" fill-opacity="0.06"/>`;

  const GOGGLES_UP = `
<g transform="translate(0 -130)">
  <path d="M -80 0 q 80 -10 160 0" stroke="#0B0B14" stroke-width="8" fill="none" stroke-linecap="round"/>
  <circle cx="-46" cy="0" r="22" fill="#0B0B14"/>
  <circle cx="-46" cy="0" r="16" fill="#5b3aa8"/>
  <circle cx="-52" cy="-6" r="5" fill="#fff" opacity="0.65"/>
  <circle cx="46" cy="0" r="22" fill="#0B0B14"/>
  <circle cx="46" cy="0" r="16" fill="#5b3aa8"/>
  <circle cx="40" cy="-6" r="5" fill="#fff" opacity="0.65"/>
</g>`;

  const GOGGLES_DOWN = `
<g transform="translate(0 -30)">
  <path d="M -80 0 q 80 14 160 0" stroke="#0B0B14" stroke-width="8" fill="none" stroke-linecap="round"/>
  <circle cx="-46" cy="0" r="22" fill="#0B0B14"/>
  <circle cx="-46" cy="0" r="16" fill="#1f1f2e"/>
  <circle cx="46" cy="0" r="22" fill="#0B0B14"/>
  <circle cx="46" cy="0" r="16" fill="#1f1f2e"/>
</g>`;

  const EYES_OPEN = (dx=0, dy=0) => `
<g class="blink">
  <ellipse cx="-42" cy="-34" rx="12" ry="14" fill="#0B0B14"/>
  <circle  cx="${-42+dx}" cy="${-34+dy-4}" r="3.5" fill="#fff"/>
  <ellipse cx="42"  cy="-34" rx="12" ry="14" fill="#0B0B14"/>
  <circle  cx="${42+dx}"  cy="${-34+dy-4}" r="3.5" fill="#fff"/>
</g>`;

  const EYES_HAPPY = `
<path d="M -60 -36 q 18 -16 36 0" stroke="#0B0B14" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M  24 -36 q 18 -16 36 0" stroke="#0B0B14" stroke-width="6" fill="none" stroke-linecap="round"/>`;

  const EYES_SLEEP = `
<path d="M -60 -30 q 18 8 36 0" stroke="#0B0B14" stroke-width="6" fill="none" stroke-linecap="round"/>
<path d="M  24 -30 q 18 8 36 0" stroke="#0B0B14" stroke-width="6" fill="none" stroke-linecap="round"/>`;

  const MOUTH = {
    smile: `<path d="M -18 -8 q 18 18 36 0" stroke="#0B0B14" stroke-width="6" stroke-linecap="round" fill="none"/>`,
    open:  `<path d="M -16 -6 q 16 22 32 0 q -16 8 -32 0 z" fill="#0B0B14"/>`,
    o:     `<ellipse cx="0" cy="2" rx="9" ry="11" fill="#0B0B14"/>`,
    flat:  `<path d="M -14 -2 h 28" stroke="#0B0B14" stroke-width="6" stroke-linecap="round" fill="none"/>`,
  };

  const BLUSH = `
<g opacity="0.85">
  <ellipse cx="-58" cy="-14" rx="9" ry="5" fill="#FF8FB4"/>
  <ellipse cx="58"  cy="-14" rx="9" ry="5" fill="#FF8FB4"/>
</g>`;

  const ARM_STUB = (x) => `<ellipse cx="${x}" cy="0" rx="20" ry="12" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>`;

  const WAVE_ARM = `
<g transform="translate(100 0)">
  <g class="arm-wave">
    <rect x="-12" y="-58" width="24" height="58" rx="12" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>
    <circle cx="0" cy="-58" r="16" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>
    <path d="M -8 -68 q 8 -6 16 0" stroke="#0B0B14" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
</g>`;

  const POINT_ARM = `
<g transform="translate(100 0)">
  <g class="arm-point">
    <rect x="0" y="-10" width="60" height="20" rx="10" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>
    <circle cx="60" cy="0" r="10" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>
    <rect x="64" y="-4" width="14" height="8" rx="4" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="3"/>
  </g>
</g>`;

  const UP_ARM_L = `
<g transform="translate(-100 0)">
  <g class="arm-up-l">
    <rect x="-12" y="-58" width="24" height="58" rx="12" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>
    <circle cx="0" cy="-58" r="14" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>
  </g>
</g>`;

  const UP_ARM_R = `
<g transform="translate(100 0)">
  <g class="arm-up-r">
    <rect x="-12" y="-58" width="24" height="58" rx="12" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>
    <circle cx="0" cy="-58" r="14" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>
  </g>
</g>`;

  const CHIN_ARM = `
<g transform="translate(60 -10) rotate(-20)">
  <rect x="-10" y="-46" width="20" height="46" rx="10" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>
  <circle cx="0" cy="-46" r="14" fill="url(#pip-grad)" stroke="#0B0B14" stroke-width="4"/>
</g>`;

  // extras
  const THINK_DOTS = `
<g>
  <circle class="think-dot" cx="100" cy="-150" r="10" fill="#fff" opacity="0.95"/>
  <circle class="think-dot" cx="135" cy="-180" r="7"  fill="#fff" opacity="0.95"/>
  <circle class="think-dot" cx="160" cy="-205" r="5"  fill="#fff" opacity="0.95"/>
</g>`;

  const SPARK = (x,y,size=14) =>
    `<path d="M 0 ${-size} L ${size*0.22} ${-size*0.22} L ${size} 0 L ${size*0.22} ${size*0.22} L 0 ${size} L ${-size*0.22} ${size*0.22} L ${-size} 0 L ${-size*0.22} ${-size*0.22} Z" fill="#fff" transform="translate(${x} ${y})"/>`;

  const SPARKLES = `
<g>
  <g class="spark"    transform="translate(-180 -160)">${SPARK(0,0,14)}</g>
  <g class="spark s2" transform="translate(180 -140)">${SPARK(0,0,18)}</g>
  <g class="spark s3" transform="translate(-150 -30)">${SPARK(0,0,10)}</g>
  <g class="spark s4" transform="translate(160 20)">${SPARK(0,0,12)}</g>
</g>`;

  const ZZZ_GROUP = `
<g transform="translate(110 -110)">
  <g class="zzz"><text x="0" y="0" font-family="system-ui, sans-serif" font-weight="800" font-size="26" fill="#fff">z</text></g>
  <g class="zzz z2"><text x="0" y="0" font-family="system-ui, sans-serif" font-weight="800" font-size="26" fill="#fff">z</text></g>
  <g class="zzz z3"><text x="0" y="0" font-family="system-ui, sans-serif" font-weight="800" font-size="26" fill="#fff">z</text></g>
</g>`;

  const OOPS_BADGE = `
<g class="oops-badge" transform="translate(-140 -150)">
  <circle r="22" fill="#0B0B14"/>
  <circle r="22" fill="url(#pip-grad)" opacity="0.85"/>
  <text x="0" y="9" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="28" fill="#fff">!</text>
</g>`;

  // ---- Per-pose face + arms + extras
  function buildSvg(pose, withShadow){
    let face = '', arms = '', extras = '', goggles = GOGGLES_UP;

    switch (pose) {
      case 'wave':
        face = EYES_OPEN() + MOUTH.smile + BLUSH;
        arms = ARM_STUB(-100) + WAVE_ARM;
        break;
      case 'think':
        face = EYES_OPEN(4,-2) + MOUTH.flat;
        arms = ARM_STUB(-100) + CHIN_ARM;
        extras = THINK_DOTS;
        break;
      case 'point':
        face = EYES_OPEN(5,0) + MOUTH.smile;
        arms = ARM_STUB(-100) + POINT_ARM;
        break;
      case 'celebrate':
        face = EYES_HAPPY + MOUTH.open + BLUSH;
        arms = UP_ARM_L + UP_ARM_R;
        extras = SPARKLES;
        break;
      case 'sleep':
        goggles = GOGGLES_DOWN;
        face = EYES_SLEEP + MOUTH.o;
        arms = ARM_STUB(-100) + ARM_STUB(100);
        extras = ZZZ_GROUP;
        break;
      case 'oops':
        face = EYES_HAPPY + MOUTH.flat;
        arms = ARM_STUB(-100) + ARM_STUB(100);
        extras = OOPS_BADGE;
        break;
      default:
        face = EYES_OPEN() + MOUTH.smile;
        arms = ARM_STUB(-100) + ARM_STUB(100);
    }

    const shadow = withShadow
      ? `<ellipse class="pip-shadow" cx="0" cy="140" rx="130" ry="14" fill="#000" opacity="0.22"/>`
      : '';

    return `
<svg class="pip pip--${pose}" viewBox="-220 -240 440 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pip mascot — ${pose}">
  ${DEFS}
  ${shadow}
  <g class="pip-body">
    ${BODY}
    ${goggles}
    ${face}
    ${arms}
  </g>
  ${extras}
</svg>`;
  }

  // ===================== Web Component =====================
  class PipMascot extends HTMLElement {
    static get observedAttributes(){ return ['pose', 'size', 'speed', 'no-shadow']; }

    constructor(){
      super();
      this._root = this.attachShadow({ mode: 'open' });
      this._cycleTimer = null;
    }

    connectedCallback(){
      this._applySize();
      this._applySpeed();
      this._render();
      const autocycle = this.getAttribute('autocycle');
      if (autocycle) this.cycle(POSES, parseInt(autocycle, 10) || 3000);
    }

    disconnectedCallback(){
      this.stopCycle();
    }

    attributeChangedCallback(name, oldVal, newVal){
      if (oldVal === newVal) return;
      if (name === 'size')  this._applySize();
      if (name === 'speed') this._applySpeed();
      this._render();
      if (name === 'pose') {
        this.dispatchEvent(new CustomEvent('pose-change', { detail: { pose: newVal } }));
      }
    }

    /* --- Property API --- */
    get pose(){ return this.getAttribute('pose') || 'wave'; }
    set pose(v){ this.setAttribute('pose', v); }

    cycle(list = POSES, intervalMs = 3000){
      this.stopCycle();
      let i = list.indexOf(this.pose);
      if (i < 0) i = 0;
      this._cycleTimer = setInterval(() => {
        i = (i + 1) % list.length;
        this.pose = list[i];
      }, intervalMs);
    }

    stopCycle(){
      if (this._cycleTimer) clearInterval(this._cycleTimer);
      this._cycleTimer = null;
    }

    /* --- internals --- */
    _applySize(){
      const s = this.getAttribute('size');
      if (s) {
        const v = /^\d+$/.test(s) ? s + 'px' : s;
        this.style.setProperty('--pip-size', v);
      } else {
        this.style.removeProperty('--pip-size');
      }
    }

    _applySpeed(){
      const sp = parseFloat(this.getAttribute('speed') || '1') || 1;
      this.style.setProperty('--pip-speed', String(sp));
    }

    _render(){
      const pose = POSES.includes(this.pose) ? this.pose : 'wave';
      const noShadow = this.hasAttribute('no-shadow');
      this._root.innerHTML = `<style>${STYLES}</style>${buildSvg(pose, !noShadow)}`;
    }
  }

  if (!customElements.get('pip-mascot')) {
    customElements.define('pip-mascot', PipMascot);
  }

  // expose for programmatic use
  window.PipMascot = PipMascot;
  window.PipMascot.POSES = POSES;
})();
