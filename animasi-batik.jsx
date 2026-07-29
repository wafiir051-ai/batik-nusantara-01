/* Animasi "Batik Nusantara" — scene components for SceneStage (animations-v2.jsx). */
const { SceneStage, useScene, Easing, clamp, useTweaks, TweaksPanel, TweakSection, TweakToggle } = window;
const R = React;
const W = 1280, H = 720;
const C = { bg: '#F5EFE2', ink: '#2B2118', soga: '#7A5427', indigo: '#44507E', gold: '#B99C5E', cream: '#EAD9B6', deep: '#3D2E19' };

// motion helpers — the ONLY easing/transform sources
const MOTION = {
  enter: (p, a, b) => Easing.easeOutCubic(clamp((p - a) / (b - a), 0, 1)),
  pop: (p, a, b) => Easing.easeOutBack(clamp((p - a) / (b - a), 0, 1)),
  draw: (p, a, b) => Easing.easeInOutSine(clamp((p - a) / (b - a), 0, 1))
};
const fadeWindow = (p, inA, inB, outA, outB) =>
  MOTION.enter(p, inA, inB) * (1 - Easing.easeInCubic(clamp((p - outA) / (outB - outA), 0, 1)));

// pattern backgrounds (same stylized language as the website)
const PAT = {
  kawung: (a, b) => ({ backgroundColor: a, backgroundImage: `radial-gradient(circle at 25% 25%, ${b} 0 9px, transparent 10px), radial-gradient(circle at 75% 75%, ${b} 0 9px, transparent 10px), radial-gradient(circle at 75% 25%, ${b}88 0 9px, transparent 10px), radial-gradient(circle at 25% 75%, ${b}88 0 9px, transparent 10px)`, backgroundSize: '48px 48px' }),
  parang: (a, b) => ({ backgroundColor: a, backgroundImage: `repeating-linear-gradient(45deg, ${b} 0px, ${b} 9px, transparent 9px, transparent 26px), repeating-linear-gradient(45deg, ${b}66 13px, ${b}66 17px, transparent 17px, transparent 26px)` }),
  mega: (a, b) => ({ backgroundColor: a, backgroundImage: `repeating-radial-gradient(circle at 15% 115%, ${b} 0 11px, transparent 11px 24px), repeating-radial-gradient(circle at 85% -15%, ${b}77 0 11px, transparent 11px 24px)` }),
  truntum: (a, b) => ({ backgroundColor: a, backgroundImage: `radial-gradient(circle, ${b} 0 3px, transparent 4px), radial-gradient(circle, ${b}88 0 2px, transparent 3px)`, backgroundSize: '28px 28px, 14px 14px', backgroundPosition: '0 0, 7px 7px' })
};

// ── persistent stage chrome (identical in every scene) ──────────────────────
function Frame({ children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden', fontFamily: "'Alegreya Sans', sans-serif", color: C.ink }}>
      <div style={{ position: 'absolute', top: 28, left: 40, fontFamily: 'Marcellus, serif', fontSize: 20, letterSpacing: '0.28em', color: C.soga }}>BATIK NUSANTARA</div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 14, ...PAT.parang(C.cream, C.soga) }} />
      {children}
    </div>
  );
}
function Caption({ p, text, showCaptions }) {
  if (!showCaptions) return null;
  const o = fadeWindow(p, 0.12, 0.24, 0.86, 0.97);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 64, textAlign: 'center', opacity: o, transform: `translateY(${(1 - MOTION.enter(p, 0.12, 0.24)) * 14}px)` }}>
      <span style={{ fontSize: 27, color: C.ink, background: 'rgba(245,239,226,0.85)', padding: '6px 22px', borderRadius: 4 }}>{text}</span>
    </div>
  );
}

// ── Scene 1: Canting draws wax on cloth ─────────────────────────────────────
function SceneCanting({ showCaptions }) {
  const { progress: p } = useScene();
  const clothO = fadeWindow(p, 0.02, 0.14, 0.8, 0.95);
  const draw = MOTION.draw(p, 0.14, 0.74);
  const cw = 720, ch = 380, cx = (W - cw) / 2, cy = 150;
  const tipX = 40 + draw * (cw - 80);
  const bob = Math.sin(draw * Math.PI * 6) * 10;
  return (
    <Frame>
      <div style={{ position: 'absolute', left: cx, top: cy, width: cw, height: ch, background: C.cream, border: `1px solid ${C.gold}`, borderRadius: 4, boxShadow: '0 24px 40px rgba(43,33,24,0.18)', transform: 'rotate(-1.5deg)', opacity: clothO, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, ...PAT.parang('transparent', C.soga), width: `${draw * 100}%`, transition: 'none' }} />
      </div>
      {/* canting: handle + reservoir + spout, simple shapes only */}
      <div style={{ position: 'absolute', left: cx + tipX, top: cy + 150 + bob, opacity: clothO, transform: 'rotate(24deg)' }}>
        <div style={{ position: 'absolute', left: 10, top: -78, width: 14, height: 84, background: '#8A5A2B', borderRadius: 7, transform: 'rotate(28deg)', transformOrigin: 'bottom center' }} />
        <div style={{ position: 'absolute', left: -8, top: -14, width: 30, height: 22, background: '#B0722F', borderRadius: '50% 50% 45% 45%' }} />
        <div style={{ position: 'absolute', left: -16, top: 2, width: 18, height: 4, background: '#B0722F', borderRadius: 2, transform: 'rotate(32deg)' }} />
      </div>
      <Caption p={p} showCaptions={showCaptions} text="Batik ditulis dengan malam panas — titik demi titik, garis demi garis." />
    </Frame>
  );
}

// ── Scene 2: motif cards flip in (CSS 3D) ───────────────────────────────────
const CARDS = [
  { n: 'Kawung', s: PAT.kawung(C.cream, '#6B4A1F') },
  { n: 'Mega Mendung', s: PAT.mega('#D8DCEA', '#3D4870') },
  { n: 'Parang', s: PAT.parang('#F1DFD2', '#A34A3F') },
  { n: 'Truntum', s: PAT.truntum('#F0D9A8', '#8E3B2F') }
];
function SceneMotif({ showCaptions }) {
  const { progress: p } = useScene();
  const out = fadeWindow(p, 0.02, 0.1, 0.86, 0.97);
  return (
    <Frame>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 130, display: 'flex', justifyContent: 'center', gap: 36, perspective: 1200, opacity: out }}>
        {CARDS.map((c, i) => {
          const t = MOTION.pop(p, 0.06 + i * 0.1, 0.34 + i * 0.1);
          const rot = (1 - t) * 90;
          return (
            <div key={c.n} style={{ width: 210, transform: `rotateY(${rot}deg)`, transformStyle: 'preserve-3d', opacity: clamp(t * 1.4, 0, 1) }}>
              <div style={{ height: 270, borderRadius: 6, border: `1px solid ${C.gold}`, boxShadow: '0 18px 30px rgba(43,33,24,0.2)', ...c.s }} />
              <div style={{ textAlign: 'center', fontFamily: 'Marcellus, serif', fontSize: 24, marginTop: 16 }}>{c.n}</div>
            </div>
          );
        })}
      </div>
      <Caption p={p} showCaptions={showCaptions} text="Setiap motif membawa doa, harapan, dan filosofi." />
    </Frame>
  );
}

// ── Scene 3: dots of the archipelago ────────────────────────────────────────
const PTS = [
  [100.35, -0.95], [103.61, -1.61], [104.75, -2.99], [102.26, -3.79],
  [106.15, -6.12], [106.85, -6.21], [108.22, -7.33], [108.56, -6.73], [109.68, -6.89],
  [110.36, -7.8], [110.83, -7.57], [111.45, -6.69], [112.06, -6.9], [113.48, -7.16],
  [114.59, -3.32], [113.92, -2.21], [115.19, -8.54], [116.12, -8.58],
  [119.87, -0.9], [119.85, -3.05], [131.3, -7.97], [140.7, -2.53]
];
function SceneNusantara({ showCaptions }) {
  const { progress: p } = useScene();
  const out = fadeWindow(p, 0.03, 0.14, 0.86, 0.97);
  const n = Math.round(MOTION.draw(p, 0.08, 0.72) * 22);
  return (
    <Frame>
      <div style={{ position: 'absolute', left: 100, right: 100, top: 150, height: 330, opacity: out }}>
        {PTS.map(([lon, lat], i) => {
          const t = MOTION.pop(p, 0.06 + i * 0.028, 0.2 + i * 0.028);
          const x = ((lon - 98) / (142 - 98)) * 100;
          const y = ((2 - lat) / 12) * 100;
          return (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) scale(${t})` }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(68,80,126,0.16)', display: 'grid', placeItems: 'center' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: i % 3 ? C.indigo : C.soga, border: `2px solid ${C.bg}` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 92, textAlign: 'center', opacity: out }}>
        <span style={{ fontFamily: 'Marcellus, serif', fontSize: 64, color: C.indigo }}>{n}</span>
        <span style={{ fontSize: 26, color: C.soga, marginLeft: 14 }}>daerah sentra batik</span>
      </div>
      <Caption p={p} showCaptions={showCaptions} text="Dari pesisir Sumatera hingga tanah Papua." />
    </Frame>
  );
}

// ── Scene 4: 3D batik cube + title ──────────────────────────────────────────
const FACES = [PAT.kawung(C.cream, '#6B4A1F'), PAT.mega('#D8DCEA', '#3D4870'), PAT.parang('#F1DFD2', '#A34A3F'), PAT.truntum('#F0D9A8', '#8E3B2F')];
function SceneJudul({ showCaptions }) {
  const { progress: p } = useScene();
  const out = 1 - Easing.easeInCubic(clamp((p - 0.88) / 0.11, 0, 1));
  const spin = MOTION.draw(p, 0.02, 0.86);
  const rotY = 45 + spin * 360; // full turn, settles before exit
  const s = 150;
  const titleT = MOTION.enter(p, 0.3, 0.5);
  const faceStyle = (i) => ({ position: 'absolute', width: s, height: s, border: `1px solid ${C.gold}`, backfaceVisibility: 'hidden', ...FACES[i % 4] });
  return (
    <Frame>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 118, display: 'flex', justifyContent: 'center', perspective: 900, opacity: out }}>
        <div style={{ width: s, height: s, transformStyle: 'preserve-3d', transform: `rotateX(-18deg) rotateY(${rotY}deg)`, opacity: MOTION.enter(p, 0.02, 0.16) }}>
          <div style={{ ...faceStyle(0), transform: `translateZ(${s / 2}px)` }} />
          <div style={{ ...faceStyle(1), transform: `rotateY(90deg) translateZ(${s / 2}px)` }} />
          <div style={{ ...faceStyle(2), transform: `rotateY(180deg) translateZ(${s / 2}px)` }} />
          <div style={{ ...faceStyle(3), transform: `rotateY(270deg) translateZ(${s / 2}px)` }} />
          <div style={{ ...faceStyle(0), transform: `rotateX(90deg) translateZ(${s / 2}px)` }} />
          <div style={{ ...faceStyle(1), transform: `rotateX(-90deg) translateZ(${s / 2}px)` }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 340, textAlign: 'center', opacity: titleT * out, transform: `translateY(${(1 - titleT) * 24}px)` }}>
        <div style={{ fontFamily: 'Marcellus, serif', fontSize: 76, lineHeight: 1.05 }}>Batik Nusantara</div>
        <div style={{ fontSize: 22, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.soga, marginTop: 16, opacity: MOTION.enter(p, 0.42, 0.6) }}>
          Warisan Budaya Takbenda UNESCO · 2009
        </div>
      </div>
      <Caption p={p} showCaptions={showCaptions} text="Selembar kain, seribu makna." />
    </Frame>
  );
}

// ── App ─────────────────────────────────────────────────────────────────────
function BatikAnimasi() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const sc = t.captions;
  const scenes = {
    'Canting': (props) => <SceneCanting {...props} showCaptions={sc} />,
    'Motif': (props) => <SceneMotif {...props} showCaptions={sc} />,
    'Nusantara': (props) => <SceneNusantara {...props} showCaptions={sc} />,
    'Judul': (props) => <SceneJudul {...props} showCaptions={sc} />
  };
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#E7DCC4', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ boxShadow: '0 30px 60px rgba(43,33,24,0.3)', borderRadius: 6, overflow: 'hidden', maxWidth: '100%' }}>
        <SceneStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={C.bg}>
          {scenes}
        </SceneStage>
      </div>
      <TweaksPanel>
        <TweakSection label="Animasi" />
        <TweakToggle label="Teks keterangan" value={t.captions} onChange={(v) => setTweak('captions', v)} />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
}
window.BatikAnimasi = BatikAnimasi;
