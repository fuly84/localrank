import { ArrowUpRight, Check, MapPin, Navigation, Store } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="logo-mark" aria-hidden="true">
        <MapPin size={22} strokeWidth={2.2} />
        <span />
      </span>
      {!compact && (
        <span className="text-[21px] font-semibold tracking-[-0.8px]">
          LocalRank<span className="text-primary">.</span>
        </span>
      )}
    </span>
  );
}

export function LocalMap() {
  return (
    <div className="local-map" aria-hidden="true">
      <div className="map-orbit orbit-one" />
      <div className="map-orbit orbit-two" />
      <svg className="map-grid" viewBox="0 0 560 360" fill="none">
        <defs>
          <pattern
            id="blocks"
            width="116"
            height="90"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-25 280 180)"
          >
            <rect
              x="8"
              y="8"
              width="100"
              height="74"
              rx="9"
              fill="#f0f0ee"
              stroke="#e8e9e7"
            />
            <path d="M58 8V82M8 45H108" stroke="#fafaf9" strokeWidth="5" />
          </pattern>
          <radialGradient id="mapFade">
            <stop stopColor="white" />
            <stop offset=".72" stopColor="white" />
            <stop offset="1" stopColor="black" />
          </radialGradient>
          <mask id="mapMask">
            <rect width="560" height="360" fill="url(#mapFade)" />
          </mask>
        </defs>
        <g mask="url(#mapMask)">
          <rect width="560" height="360" fill="url(#blocks)" />
          <path
            d="M-20 300C130 210 115 190 230 200S365 60 580 20"
            stroke="#e0e9fd"
            strokeWidth="29"
          />
          <path
            d="M10 190L550 310M175-10L330 370"
            stroke="#fafaf9"
            strokeWidth="14"
          />
          <path
            d="M290 190L373 237L440 201"
            stroke="#8fa3fb"
            strokeWidth="2"
            strokeDasharray="5 6"
          />
          <circle
            cx="290"
            cy="190"
            r="82"
            fill="#4969ed"
            fillOpacity=".045"
            stroke="#4969ed"
            strokeOpacity=".14"
          />
          <circle
            cx="290"
            cy="190"
            r="47"
            fill="#4969ed"
            fillOpacity=".05"
            stroke="#4969ed"
            strokeOpacity=".15"
            strokeDasharray="3 4"
          />
        </g>
      </svg>
      <span className="map-small-pin pin-one">
        <MapPin size={15} />
      </span>
      <span className="map-small-pin pin-two">
        <MapPin size={15} />
      </span>
      <span className="map-small-pin pin-three">
        <MapPin size={15} />
      </span>
      <div className="map-main-pin">
        <Store size={28} strokeWidth={1.7} />
        <span />
      </div>
      <div className="map-business-label">
        <span className="green-dot" /> Votre commerce <ArrowUpRight size={13} />
      </div>
      <div className="map-float float-top">
        <span className="float-icon">
          <Navigation size={16} />
        </span>
        <span>
          Votre quartier.
          <br />
          <strong>Vos futurs clients.</strong>
        </span>
      </div>
      <div className="map-float float-bottom">
        <span className="float-check">
          <Check size={14} />
        </span>{" "}
        Relevés manuels, suivi local.
      </div>
      <span className="map-caption">ILLUSTRATION · AUCUNE DONNÉE GOOGLE</span>
    </div>
  );
}
