const LOOP =
  'M 230 54 H 96 Q 60 54 60 90 V 430 Q 60 458 96 458 H 664 Q 700 458 700 430 V 90 Q 700 54 664 54 H 530'

function CompoundDiagram() {
  return (
    <svg className="compound" viewBox="0 0 760 490" role="img" aria-label="Marketing, ventas, producto y sistemas conectados">
      <defs>
        <marker id="compound-white" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 1 L 9 5 L 0 9 Z" fill="#f7f7f7" />
        </marker>
        <marker id="compound-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 9 5 L 0 9 Z" fill="#ff4d54" />
        </marker>
        <path id="compound-loop" d={LOOP} />
      </defs>

      <use href="#compound-loop" className="compound-loop" />
      <path className="compound-loop" d="M 120 54 H 226" markerEnd="url(#compound-white)" />
      <path className="compound-loop" d="M 640 54 H 534" markerEnd="url(#compound-white)" />
      <path className="compound-loop" d="M 60 250 V 352" markerEnd="url(#compound-white)" />
      <path className="compound-loop" d="M 700 250 V 352" markerEnd="url(#compound-white)" />
      <path className="compound-loop" d="M 420 458 H 150" markerEnd="url(#compound-white)" />

      <g className="compound-core">
        <circle cx="380" cy="230" r="112" className="compound-dashed" />
        <path className="compound-link" d="M 380 146 L 380 100" markerEnd="url(#compound-red)" />
        <path className="compound-link" d="M 308 286 Q 220 320 150 360" markerEnd="url(#compound-red)" />
        <path className="compound-link" d="M 452 286 Q 540 320 610 360" markerEnd="url(#compound-red)" />
        <circle cx="380" cy="230" r="88" className="compound-glow" />
        <circle cx="380" cy="230" r="76" className="compound-hub" />
        <text x="380" y="226" className="compound-title" textAnchor="middle">SISTEMAS</text>
        <text x="380" y="248" className="compound-sub" textAnchor="middle">MIDE Y CONECTA</text>
      </g>

      <g className="compound-node">
        <rect x="230" y="16" width="300" height="76" rx="8" />
        <text x="380" y="46" className="compound-title" textAnchor="middle">MARKETING</text>
        <text x="380" y="68" className="compound-sub" textAnchor="middle">GENERA DEMANDA</text>
      </g>
      <g className="compound-node">
        <rect x="24" y="360" width="250" height="76" rx="8" />
        <text x="149" y="390" className="compound-title" textAnchor="middle">VENTAS</text>
        <text x="149" y="412" className="compound-sub" textAnchor="middle">CONVIERTE LEADS</text>
      </g>
      <g className="compound-node">
        <rect x="486" y="360" width="250" height="76" rx="8" />
        <text x="611" y="390" className="compound-title" textAnchor="middle">PRODUCTO</text>
        <text x="611" y="412" className="compound-sub" textAnchor="middle">ENTREGA RESULTADOS</text>
      </g>

      <circle r="4" className="compound-dot" />
      <circle r="4" className="compound-dot" />
      <circle r="4" className="compound-dot" />
    </svg>
  )
}

export default CompoundDiagram
