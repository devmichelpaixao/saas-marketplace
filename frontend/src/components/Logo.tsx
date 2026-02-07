export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ícone geométrico moderno - cubo/caixa estilizada */}
      <g transform="translate(0, 5)">
        {/* Face frontal */}
        <path
          d="M10 15 L25 7 L25 23 L10 31 Z"
          fill="url(#gradient1)"
          opacity="0.9"
        />
        {/* Face direita */}
        <path
          d="M25 7 L40 15 L40 31 L25 23 Z"
          fill="url(#gradient2)"
          opacity="0.8"
        />
        {/* Face superior */}
        <path
          d="M10 15 L25 7 L40 15 L25 23 Z"
          fill="url(#gradient3)"
        />
        
        {/* Detalhe interno - linha de conexão */}
        <line x1="25" y1="7" x2="25" y2="23" stroke="#ffffff" strokeWidth="1.5" opacity="0.4"/>
      </g>

      {/* Texto "SaaS" */}
      <text x="52" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="24" fontWeight="700" fill="#1e293b" letterSpacing="-0.5">
        SaaS
      </text>

      {/* Texto "Marketplace" */}
      <text x="115" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="500" fill="#64748b" letterSpacing="0">
        Marketplace
      </text>

      {/* Detalhe decorativo - ponto de conexão */}
      <circle cx="108" cy="27" r="2.5" fill="#3b82f6" opacity="0.6"/>

      {/* Gradientes */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Versão compacta (apenas ícone)
export function LogoIcon({ className = "h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(5, 5)">
        {/* Face frontal */}
        <path
          d="M10 15 L25 7 L25 23 L10 31 Z"
          fill="url(#iconGradient1)"
          opacity="0.9"
        />
        {/* Face direita */}
        <path
          d="M25 7 L40 15 L40 31 L25 23 Z"
          fill="url(#iconGradient2)"
          opacity="0.8"
        />
        {/* Face superior */}
        <path
          d="M10 15 L25 7 L40 15 L25 23 Z"
          fill="url(#iconGradient3)"
        />
        
        {/* Detalhe interno */}
        <line x1="25" y1="7" x2="25" y2="23" stroke="#ffffff" strokeWidth="2" opacity="0.4"/>
      </g>

      <defs>
        <linearGradient id="iconGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="iconGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="iconGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  )
}
