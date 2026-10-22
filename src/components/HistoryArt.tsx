/**
 * 오늘의 수학사 삽화 — 이야기 내용을 나타내는 간단한 선 그림.
 * math-history.ts 의 art 값과 아래 ART 의 키가 같아야 한다. 없는 키면 두루마리 그림이 나온다.
 * 모두 120×120 좌표, 선 색은 바깥에서 text 색으로 정한다 (currentColor).
 */
const T = { fontFamily: 'Pretendard Variable, Pretendard, system-ui, sans-serif', fontWeight: 700 } as const

const ART: Record<string, React.ReactNode> = {
  sqrt2: (
    <>
      <rect x="28" y="28" width="64" height="64" />
      <line x1="28" y1="92" x2="92" y2="28" strokeWidth="3.5" />
      <text x="60" y="106" textAnchor="middle" fontSize="13" style={T} fill="currentColor" stroke="none">1</text>
      <text x="74" y="56" fontSize="14" style={T} fill="currentColor" stroke="none">√2</text>
    </>
  ),
  euclid: (
    <>
      <circle cx="42" cy="68" r="34" strokeDasharray="3 4" />
      <circle cx="78" cy="68" r="34" strokeDasharray="3 4" />
      <polygon points="42,68 78,68 60,37" strokeWidth="3.5" />
      <path d="M60 14 L60 26 M52 20 L60 26 L68 20" />
    </>
  ),
  'pi-polygon': (
    <>
      <circle cx="60" cy="60" r="42" />
      <polygon points="102,60 90,90 60,102 30,90 18,60 30,30 60,18 90,30" />
      <line x1="60" y1="60" x2="102" y2="60" strokeDasharray="3 3" />
      <text x="60" y="68" textAnchor="middle" fontSize="26" style={T} fill="currentColor" stroke="none">π</text>
    </>
  ),
  earth: (
    <>
      <circle cx="60" cy="72" r="38" />
      <line x1="60" y1="34" x2="60" y2="18" strokeWidth="3.5" />
      <line x1="88" y1="46" x2="99" y2="35" strokeWidth="3.5" />
      <line x1="60" y1="72" x2="60" y2="34" strokeDasharray="3 3" />
      <line x1="60" y1="72" x2="88" y2="46" strokeDasharray="3 3" />
      <path d="M60 52 A20 20 0 0 1 74 58" />
      <text x="70" y="52" fontSize="10" style={T} fill="currentColor" stroke="none">7.2°</text>
      <g strokeWidth="2">
        <line x1="10" y1="20" x2="26" y2="20" />
        <line x1="10" y1="30" x2="30" y2="30" />
        <line x1="10" y1="40" x2="26" y2="40" />
      </g>
    </>
  ),
  conic: (
    <>
      <path d="M60 14 L22 104 L98 104 Z" />
      <ellipse cx="60" cy="104" rx="38" ry="9" />
      <path d="M30 62 L96 48" strokeWidth="3" />
      <ellipse cx="62" cy="55" rx="22" ry="6" transform="rotate(-12 62 55)" fill="currentColor" fillOpacity="0.18" />
    </>
  ),
  zero: (
    <>
      <ellipse cx="60" cy="46" rx="22" ry="30" strokeWidth="4" />
      <line x1="14" y1="98" x2="106" y2="98" />
      <path d="M100 92 L106 98 L100 104" />
      <g fontSize="11" style={T} fill="currentColor" stroke="none" textAnchor="middle">
        <text x="30" y="114">−2</text>
        <text x="45" y="114">−1</text>
        <text x="60" y="114">0</text>
        <text x="75" y="114">1</text>
        <text x="90" y="114">2</text>
      </g>
      <g strokeWidth="2">
        <line x1="30" y1="94" x2="30" y2="102" />
        <line x1="45" y1="94" x2="45" y2="102" />
        <line x1="60" y1="92" x2="60" y2="104" />
        <line x1="75" y1="94" x2="75" y2="102" />
        <line x1="90" y1="94" x2="90" y2="102" />
      </g>
    </>
  ),
  algebra: (
    <>
      <rect x="18" y="18" width="52" height="52" />
      <rect x="70" y="18" width="30" height="52" fill="currentColor" fillOpacity="0.15" />
      <rect x="18" y="70" width="52" height="30" fill="currentColor" fillOpacity="0.15" />
      <rect x="70" y="70" width="30" height="30" strokeDasharray="3 3" />
      <g fontSize="13" style={T} fill="currentColor" stroke="none" textAnchor="middle">
        <text x="44" y="49">x²</text>
        <text x="85" y="49">5x</text>
        <text x="44" y="90">5x</text>
        <text x="85" y="90">25</text>
      </g>
    </>
  ),
  fibonacci: (
    <>
      <rect x="14" y="14" width="52" height="52" />
      <rect x="66" y="14" width="32" height="32" />
      <rect x="66" y="46" width="20" height="20" />
      <rect x="86" y="46" width="12" height="12" />
      <rect x="14" y="66" width="84" height="40" />
      <path d="M14 66 A52 52 0 0 1 66 14 A32 32 0 0 1 98 46 A20 20 0 0 1 86 66 A12 12 0 0 1 86 58" strokeWidth="3" />
      <g fontSize="12" style={T} fill="currentColor" stroke="none" textAnchor="middle">
        <text x="40" y="44">5</text>
        <text x="82" y="34">3</text>
        <text x="56" y="90">8</text>
      </g>
    </>
  ),
  cubic: (
    <>
      <line x1="12" y1="60" x2="108" y2="60" />
      <line x1="60" y1="12" x2="60" y2="108" />
      <path d="M18 100 C40 20 50 110 60 60 C70 10 80 100 102 20" strokeWidth="3" />
      <text x="84" y="98" fontSize="22" style={T} fill="currentColor" stroke="none">i</text>
      <text x="80" y="78" fontSize="11" style={T} fill="currentColor" stroke="none">√−1</text>
    </>
  ),
  log: (
    <>
      <line x1="16" y1="100" x2="108" y2="100" />
      <line x1="16" y1="100" x2="16" y2="14" />
      <path d="M18 108 C24 60 40 36 108 22" strokeWidth="3" />
      <text x="62" y="80" fontSize="13" style={T} fill="currentColor" stroke="none">log x</text>
      <text x="30" y="34" fontSize="11" style={T} fill="currentColor" stroke="none">× → +</text>
    </>
  ),
  coordinates: (
    <>
      <line x1="12" y1="78" x2="108" y2="78" />
      <line x1="34" y1="108" x2="34" y2="12" />
      <path d="M102 72 L108 78 L102 84 M28 18 L34 12 L40 18" />
      <line x1="82" y1="78" x2="82" y2="38" strokeDasharray="3 3" />
      <line x1="34" y1="38" x2="82" y2="38" strokeDasharray="3 3" />
      <circle cx="82" cy="38" r="5" fill="currentColor" />
      <text x="88" y="34" fontSize="12" style={T} fill="currentColor" stroke="none">(3, 2)</text>
      <text x="100" y="94" fontSize="12" style={T} fill="currentColor" stroke="none">x</text>
      <text x="20" y="22" fontSize="12" style={T} fill="currentColor" stroke="none">y</text>
    </>
  ),
  fermat: (
    <>
      <path d="M22 16 H86 L98 28 V104 H22 Z" />
      <path d="M86 16 V28 H98" />
      <g strokeWidth="2">
        <line x1="34" y1="44" x2="72" y2="44" />
        <line x1="34" y1="56" x2="72" y2="56" />
        <line x1="34" y1="68" x2="72" y2="68" />
        <line x1="34" y1="80" x2="60" y2="80" />
      </g>
      <line x1="78" y1="36" x2="78" y2="98" strokeDasharray="2 3" />
      <text x="82" y="70" fontSize="9" style={T} fill="currentColor" stroke="none" transform="rotate(90 82 70)">xⁿ+yⁿ≠zⁿ</text>
    </>
  ),
  dice: (
    <>
      <rect x="14" y="40" width="44" height="44" rx="8" />
      <g fill="currentColor" stroke="none">
        <circle cx="26" cy="52" r="4" />
        <circle cx="46" cy="72" r="4" />
        <circle cx="36" cy="62" r="4" />
      </g>
      <rect x="62" y="40" width="44" height="44" rx="8" />
      <g fill="currentColor" stroke="none">
        <circle cx="74" cy="52" r="4" />
        <circle cx="94" cy="52" r="4" />
        <circle cx="74" cy="72" r="4" />
        <circle cx="94" cy="72" r="4" />
      </g>
      <text x="60" y="26" textAnchor="middle" fontSize="12" style={T} fill="currentColor" stroke="none">P = ?</text>
    </>
  ),
  tangent: (
    <>
      <line x1="12" y1="100" x2="108" y2="100" />
      <path d="M14 96 C40 92 60 70 70 40 C76 24 84 16 104 12" strokeWidth="3" />
      <line x1="40" y1="92" x2="100" y2="22" />
      <circle cx="70" cy="40" r="4" fill="currentColor" />
      <text x="24" y="40" fontSize="13" style={T} fill="currentColor" stroke="none">dy/dx</text>
    </>
  ),
  graph: (
    <>
      <g fill="currentColor">
        <circle cx="60" cy="24" r="7" />
        <circle cx="24" cy="60" r="7" />
        <circle cx="96" cy="60" r="7" />
        <circle cx="60" cy="96" r="7" />
      </g>
      <path d="M60 24 Q34 36 24 60 M60 24 Q50 42 24 60" />
      <path d="M60 96 Q34 84 24 60 M60 96 Q50 78 24 60" />
      <path d="M60 24 Q84 40 96 60 M60 96 Q84 80 96 60" />
      <line x1="24" y1="60" x2="96" y2="60" />
    </>
  ),
  sum: (
    <>
      <g fill="currentColor" fillOpacity="0.2">
        <rect x="16" y="88" width="14" height="14" />
        <rect x="32" y="74" width="14" height="28" />
        <rect x="48" y="60" width="14" height="42" />
        <rect x="64" y="46" width="14" height="56" />
        <rect x="80" y="32" width="14" height="70" />
      </g>
      <path d="M16 102 H94 M16 102 L16 88 L30 88 L30 74 L46 74 L46 60 L62 60 L62 46 L78 46 L78 32 L94 32 L94 102" />
      <path d="M22 20 Q55 2 88 20" strokeDasharray="3 3" />
      <path d="M84 14 L88 20 L82 22" />
      <text x="60" y="118" textAnchor="middle" fontSize="12" style={T} fill="currentColor" stroke="none">n(n+1)/2</text>
    </>
  ),
  galois: (
    <>
      <polygon points="60,16 102,46 86,96 34,96 18,46" />
      <polygon points="60,16 86,96 18,46 102,46 34,96" strokeWidth="1.5" />
      <text x="60" y="116" textAnchor="middle" fontSize="12" style={T} fill="currentColor" stroke="none">x⁵ : 공식 없음</text>
    </>
  ),
  hyperbolic: (
    <>
      <path d="M22 96 Q60 70 98 96 Q78 56 60 20 Q42 56 22 96 Z" strokeWidth="3" />
      <path d="M30 88 A10 10 0 0 1 38 82" />
      <path d="M90 88 A10 10 0 0 0 82 82" />
      <path d="M56 32 A8 8 0 0 0 64 32" />
      <text x="60" y="112" textAnchor="middle" fontSize="11" style={T} fill="currentColor" stroke="none">합 &lt; 180°</text>
    </>
  ),
  riemann: (
    <>
      <line x1="12" y1="100" x2="108" y2="100" />
      <line x1="16" y1="104" x2="16" y2="16" />
      <g fill="currentColor" fillOpacity="0.2">
        <rect x="22" y="70" width="12" height="30" />
        <rect x="34" y="58" width="12" height="42" />
        <rect x="46" y="48" width="12" height="52" />
        <rect x="58" y="44" width="12" height="56" />
        <rect x="70" y="46" width="12" height="54" />
        <rect x="82" y="54" width="12" height="46" />
      </g>
      <path d="M22 72 C40 50 60 36 94 54" strokeWidth="3" />
      <text x="100" y="28" textAnchor="end" fontSize="20" style={T} fill="currentColor" stroke="none">∫</text>
    </>
  ),
  infinity: (
    <>
      <path d="M30 60 C30 40 56 40 60 60 C64 80 90 80 90 60 C90 40 64 40 60 60 C56 80 30 80 30 60 Z" strokeWidth="3.5" />
      <g fontSize="11" style={T} fill="currentColor" stroke="none">
        <text x="14" y="104">0.1 2 3 …</text>
        <text x="14" y="116">0.4 5 6 …</text>
      </g>
      <line x1="16" y1="94" x2="70" y2="118" strokeDasharray="2 2" />
    </>
  ),
  hilbert: (
    <>
      <rect x="22" y="14" width="76" height="92" rx="4" />
      <g strokeWidth="2">
        <line x1="34" y1="34" x2="86" y2="34" />
        <line x1="34" y1="50" x2="86" y2="50" />
        <line x1="34" y1="66" x2="70" y2="66" />
      </g>
      <text x="60" y="98" textAnchor="middle" fontSize="26" style={T} fill="currentColor" stroke="none">23?</text>
    </>
  ),
  symmetry: (
    <>
      <g strokeWidth="3">
        <line x1="60" y1="14" x2="60" y2="106" />
        <line x1="20" y1="37" x2="100" y2="83" />
        <line x1="20" y1="83" x2="100" y2="37" />
      </g>
      <g strokeWidth="2">
        <path d="M60 26 L52 34 M60 26 L68 34 M60 94 L52 86 M60 94 L68 86" />
        <path d="M30 43 L32 54 M30 43 L41 41 M90 77 L88 66 M90 77 L79 79" />
        <path d="M30 77 L32 66 M30 77 L41 79 M90 43 L88 54 M90 43 L79 41" />
      </g>
      <circle cx="60" cy="60" r="8" fill="currentColor" fillOpacity="0.2" />
    </>
  ),
  taxi: (
    <>
      <path d="M18 76 L28 56 H74 L88 76 H102 V96 H18 Z" />
      <circle cx="34" cy="96" r="8" fill="white" />
      <circle cx="86" cy="96" r="8" fill="white" />
      <rect x="40" y="38" width="40" height="18" rx="3" fill="currentColor" fillOpacity="0.15" />
      <text x="60" y="52" textAnchor="middle" fontSize="12" style={T} fill="currentColor" stroke="none">1729</text>
      <text x="60" y="114" textAnchor="middle" fontSize="10" style={T} fill="currentColor" stroke="none">1³+12³ = 9³+10³</text>
    </>
  ),
  godel: (
    <>
      <path d="M20 24 H100 V74 H58 L40 92 V74 H20 Z" />
      <path d="M60 48 A14 14 0 1 1 74 62" strokeWidth="3" />
      <path d="M70 56 L74 62 L80 58" strokeWidth="3" />
      <text x="60" y="112" textAnchor="middle" fontSize="11" style={T} fill="currentColor" stroke="none">증명할 수 없다</text>
    </>
  ),
  turing: (
    <>
      <g>
        <rect x="8" y="50" width="20" height="24" />
        <rect x="28" y="50" width="20" height="24" />
        <rect x="48" y="50" width="20" height="24" />
        <rect x="68" y="50" width="20" height="24" />
        <rect x="88" y="50" width="20" height="24" />
      </g>
      <g fontSize="13" style={T} fill="currentColor" stroke="none" textAnchor="middle">
        <text x="18" y="67">0</text>
        <text x="38" y="67">1</text>
        <text x="58" y="67">1</text>
        <text x="78" y="67">0</text>
        <text x="98" y="67">1</text>
      </g>
      <path d="M50 30 H66 L58 44 Z" fill="currentColor" />
      <line x1="58" y1="16" x2="58" y2="30" strokeWidth="3" />
      <path d="M8 62 H4 M108 62 H116" strokeDasharray="2 2" />
    </>
  ),
  sangaji: (
    <>
      <g strokeWidth="4" strokeLinecap="round">
        <line x1="22" y1="30" x2="22" y2="58" />
        <line x1="34" y1="30" x2="34" y2="58" />
        <line x1="46" y1="30" x2="46" y2="58" />
        <line x1="64" y1="44" x2="98" y2="44" />
        <line x1="22" y1="76" x2="52" y2="76" />
        <line x1="22" y1="90" x2="52" y2="90" />
        <line x1="70" y1="70" x2="70" y2="98" />
        <line x1="84" y1="70" x2="84" y2="98" />
      </g>
      <text x="60" y="116" textAnchor="middle" fontSize="11" style={T} fill="currentColor" stroke="none">천원술 · 산가지</text>
    </>
  ),
  'magic-square': (
    <>
      <rect x="20" y="20" width="80" height="80" />
      <line x1="46.7" y1="20" x2="46.7" y2="100" />
      <line x1="73.3" y1="20" x2="73.3" y2="100" />
      <line x1="20" y1="46.7" x2="100" y2="46.7" />
      <line x1="20" y1="73.3" x2="100" y2="73.3" />
      <g fontSize="13" style={T} fill="currentColor" stroke="none" textAnchor="middle">
        <text x="33" y="38">2</text><text x="60" y="38">7</text><text x="87" y="38">6</text>
        <text x="33" y="65">9</text><text x="60" y="65">5</text><text x="87" y="65">1</text>
        <text x="33" y="92">4</text><text x="60" y="92">3</text><text x="87" y="92">8</text>
      </g>
    </>
  ),
  sejong: (
    <>
      <path d="M22 22 H98 V98 H22 Z" />
      <path d="M22 22 L28 16 H104 V92 L98 98" />
      <text x="60" y="76" textAnchor="middle" fontSize="40" style={T} fill="currentColor" stroke="none">算</text>
    </>
  ),
  textbook: (
    <>
      <path d="M60 30 C44 20 28 22 14 28 V96 C28 90 44 88 60 98 C76 88 92 90 106 96 V28 C92 22 76 20 60 30 Z" />
      <line x1="60" y1="30" x2="60" y2="98" />
      <g strokeWidth="2">
        <line x1="24" y1="44" x2="50" y2="40" />
        <line x1="24" y1="56" x2="50" y2="52" />
        <line x1="24" y1="68" x2="50" y2="64" />
        <line x1="70" y1="40" x2="96" y2="44" />
        <line x1="70" y1="52" x2="96" y2="56" />
      </g>
    </>
  ),
  'pi-digits': (
    <>
      <circle cx="60" cy="60" r="42" />
      <text x="60" y="56" textAnchor="middle" fontSize="20" style={T} fill="currentColor" stroke="none">3.14159</text>
      <text x="60" y="78" textAnchor="middle" fontSize="12" style={T} fill="currentColor" stroke="none">26535…</text>
    </>
  ),
  primes: (
    <>
      {[0, 1, 2, 3, 4].map((r) =>
        [0, 1, 2, 3, 4].map((c) => {
          const n = r * 5 + c + 1
          const prime = [2, 3, 5, 7, 11, 13, 17, 19, 23].includes(n)
          return (
            <g key={n}>
              <rect x={14 + c * 19} y={14 + r * 19} width="17" height="17" fill={prime ? 'currentColor' : 'none'} fillOpacity={prime ? 0.22 : 1} strokeWidth="1.5" />
              <text x={22.5 + c * 19} y={26.5 + r * 19} textAnchor="middle" fontSize="9" style={T} fill="currentColor" stroke="none">
                {n}
              </text>
            </g>
          )
        }),
      )}
    </>
  ),
  map4: (
    <>
      <path d="M14 30 Q40 14 60 30 L54 60 L20 66 Z" fill="#fbbf24" fillOpacity="0.5" />
      <path d="M60 30 Q90 18 106 38 L92 62 L54 60 Z" fill="#60a5fa" fillOpacity="0.5" />
      <path d="M20 66 L54 60 L62 96 Q36 108 18 92 Z" fill="#f87171" fillOpacity="0.5" />
      <path d="M54 60 L92 62 Q104 86 84 102 L62 96 Z" fill="#4ade80" fillOpacity="0.5" />
    </>
  ),
  spheres: (
    <>
      <g fill="currentColor" fillOpacity="0.12">
        <circle cx="30" cy="90" r="14" />
        <circle cx="60" cy="90" r="14" />
        <circle cx="90" cy="90" r="14" />
        <circle cx="45" cy="64" r="14" />
        <circle cx="75" cy="64" r="14" />
        <circle cx="60" cy="38" r="14" />
      </g>
      <text x="60" y="116" textAnchor="middle" fontSize="11" style={T} fill="currentColor" stroke="none">약 74%</text>
    </>
  ),
  torus: (
    <>
      <ellipse cx="38" cy="64" rx="26" ry="20" />
      <ellipse cx="38" cy="62" rx="9" ry="6" />
      <circle cx="90" cy="62" r="20" />
      <path d="M72 62 A18 8 0 0 0 108 62" strokeDasharray="3 3" />
      <text x="64" y="104" textAnchor="middle" fontSize="16" style={T} fill="currentColor" stroke="none">≠</text>
    </>
  ),
  medal: (
    <>
      <path d="M44 14 L60 44 L76 14" />
      <path d="M36 14 L52 44 M84 14 L68 44" />
      <circle cx="60" cy="72" r="28" />
      <circle cx="60" cy="72" r="20" strokeDasharray="3 3" />
      <text x="60" y="78" textAnchor="middle" fontSize="16" style={T} fill="currentColor" stroke="none">2022</text>
    </>
  ),
  golden: (
    <>
      <rect x="12" y="24" width="96" height="60" />
      <line x1="72" y1="24" x2="72" y2="84" />
      <line x1="72" y1="60" x2="108" y2="60" />
      <line x1="94" y1="60" x2="94" y2="84" />
      <path d="M12 84 A60 60 0 0 1 72 24 A36 36 0 0 1 108 60 A22 22 0 0 1 94 84" strokeWidth="3" />
      <text x="60" y="108" textAnchor="middle" fontSize="13" style={T} fill="currentColor" stroke="none">φ ≈ 1.618</text>
    </>
  ),
  rose: (
    <>
      <g fill="currentColor" strokeWidth="1.5">
        <path d="M60 60 L60 18 A42 42 0 0 1 96 39 Z" fillOpacity="0.45" />
        <path d="M60 60 L96 39 A42 42 0 0 1 96 81 Z" fillOpacity="0.3" />
        <path d="M60 60 L96 81 A42 42 0 0 1 60 102 Z" fillOpacity="0.55" />
        <path d="M60 60 L60 102 A42 42 0 0 1 24 81 Z" fillOpacity="0.2" />
        <path d="M60 60 L24 81 A42 42 0 0 1 24 39 Z" fillOpacity="0.35" />
        <path d="M60 60 L24 39 A42 42 0 0 1 60 18 Z" fillOpacity="0.15" />
      </g>
    </>
  ),
  coin: (
    <>
      <line x1="14" y1="98" x2="108" y2="98" />
      <line x1="14" y1="60" x2="108" y2="60" strokeDasharray="4 3" />
      <path d="M16 30 L26 90 L36 40 L46 76 L56 52 L66 68 L76 56 L86 63 L96 58 L106 61" strokeWidth="2.5" />
      <text x="110" y="64" fontSize="11" style={T} fill="currentColor" stroke="none" textAnchor="end">½</text>
      <circle cx="30" cy="24" r="10" />
      <text x="30" y="28" textAnchor="middle" fontSize="11" style={T} fill="currentColor" stroke="none">H</text>
    </>
  ),
  'unit-circle': (
    <>
      <circle cx="60" cy="64" r="40" />
      <line x1="12" y1="64" x2="108" y2="64" />
      <line x1="60" y1="112" x2="60" y2="16" />
      <line x1="60" y1="64" x2="92" y2="40" strokeWidth="3" />
      <line x1="92" y1="40" x2="92" y2="64" strokeWidth="3" />
      <path d="M72 64 A12 12 0 0 0 70 57" />
      <text x="96" y="56" fontSize="11" style={T} fill="currentColor" stroke="none">sin</text>
      <text x="72" y="76" fontSize="11" style={T} fill="currentColor" stroke="none">θ</text>
    </>
  ),
  letter: (
    <>
      <rect x="14" y="30" width="92" height="60" rx="4" />
      <path d="M14 34 L60 66 L106 34" />
      <text x="60" y="112" textAnchor="middle" fontSize="12" style={T} fill="currentColor" stroke="none">p, 2p+1 모두 소수</text>
    </>
  ),
  equals: (
    <>
      <g strokeWidth="6" strokeLinecap="round">
        <line x1="30" y1="50" x2="90" y2="50" />
        <line x1="30" y1="70" x2="90" y2="70" />
      </g>
      <g fontSize="16" style={T} fill="currentColor" stroke="none" textAnchor="middle">
        <text x="24" y="28">+</text>
        <text x="60" y="28">−</text>
        <text x="96" y="28">×</text>
        <text x="60" y="110">1557</text>
      </g>
    </>
  ),
  mountain: (
    <>
      <path d="M8 100 L44 40 L60 62 L76 30 L112 100 Z" />
      <path d="M76 30 L70 40 L76 44 L82 38 Z" fill="currentColor" fillOpacity="0.3" />
      <line x1="20" y1="100" x2="76" y2="30" strokeDasharray="3 3" />
      <line x1="100" y1="100" x2="76" y2="30" strokeDasharray="3 3" />
      <path d="M32 100 A12 12 0 0 0 30 88" />
      <text x="60" y="116" textAnchor="middle" fontSize="11" style={T} fill="currentColor" stroke="none">8,840 m</text>
    </>
  ),
}

const FALLBACK = (
  <>
    <path d="M30 20 H96 V92 A8 8 0 0 1 88 100 H22 A8 8 0 0 0 30 92 Z" />
    <path d="M22 100 A8 8 0 0 1 14 92 V84 H30" />
    <g strokeWidth="2">
      <line x1="44" y1="40" x2="84" y2="40" />
      <line x1="44" y1="54" x2="84" y2="54" />
      <line x1="44" y1="68" x2="72" y2="68" />
    </g>
  </>
)

export function HistoryArt({ name, className = '' }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ART[name] ?? FALLBACK}
    </svg>
  )
}
