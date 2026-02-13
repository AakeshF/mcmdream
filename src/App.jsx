import { useState, useEffect, useCallback, useRef } from "react";

// ─── DATA ──────────────────────────────────────────────────────────────
const ROOMS = {
  "2nd Floor — Main Level": [
    { id: "living", name: "Living Room", dims: '22\'2" × 18\'1"', sqft: 401, floor: 2, icon: "◧" },
    { id: "dining", name: "Dining Area", dims: '16\'5" × 19\'0"', sqft: 312, floor: 2, icon: "◫" },
    { id: "kitchen", name: "Kitchen", dims: '17\'0" × 14\'0"', sqft: 238, floor: 2, icon: "⬡" },
    { id: "breakfast", name: "Breakfast Nook", dims: '9\'7" × 13\'2"', sqft: 126, floor: 2, icon: "◯" },
    { id: "foyer", name: "Foyer", dims: '23\'5" × 12\'1"', sqft: 283, floor: 2, icon: "⬢" },
    { id: "primary_bed", name: "Primary Bedroom", dims: '17\'0" × 17\'10"', sqft: 303, floor: 2, icon: "◈" },
    { id: "primary_bath", name: "Primary Bath", dims: '17\'0" × 8\'1"', sqft: 137, floor: 2, icon: "◇" },
    { id: "primary_wic", name: "Primary Closet", dims: '7\'9" × 6\'0"', sqft: 47, floor: 2, icon: "□" },
    { id: "laundry", name: "Laundry", dims: '6\'0" × 5\'11"', sqft: 36, floor: 2, icon: "○" },
    { id: "deck", name: "Deck", dims: '15\'0" × 11\'10"', sqft: 178, floor: 2, icon: "▽" },
    { id: "porch", name: "Porch", dims: '13\'7" × 6\'1"', sqft: 83, floor: 2, icon: "△" },
    { id: "garage", name: "Garage", dims: '22\'5" × 25\'9"', sqft: 577, floor: 2, icon: "▢" },
  ],
  "1st Floor — Lower Level": [
    { id: "family", name: "Family Room", dims: '22\'3" × 29\'6"', sqft: 657, floor: 1, icon: "◧" },
    { id: "rec", name: "Recreation Room", dims: '15\'5" × 20\'0"', sqft: 308, floor: 1, icon: "◈" },
    { id: "bed2", name: "Bedroom 2", dims: '12\'7" × 11\'10"', sqft: 149, floor: 1, icon: "◇" },
    { id: "bed3", name: "Bedroom 3", dims: '12\'8" × 13\'7"', sqft: 172, floor: 1, icon: "◇" },
    { id: "bonus", name: "Bonus Room", dims: '15\'1" × 11\'4"', sqft: 171, floor: 1, icon: "⬡" },
    { id: "bath2", name: "Bath 2", dims: '5\'9" × 6\'1"', sqft: 35, floor: 1, icon: "○" },
    { id: "bath3", name: "Bath 3", dims: '3\'5" × 5\'10"', sqft: 20, floor: 1, icon: "○" },
    { id: "wic2", name: "Closet 2", dims: '3\'5" × 5\'4"', sqft: 18, floor: 1, icon: "□" },
    { id: "wic3", name: "Closet 3", dims: '3\'5" × 3\'1"', sqft: 11, floor: 1, icon: "□" },
    { id: "storage", name: "Flex Space", dims: '32\'11" × 18\'11"', sqft: 623, floor: 1, icon: "⬢" },
  ]
};

const MCM_PALETTES = {
  "Warm Walnut": { primary: "#5C3D2E", secondary: "#D4A76A", accent: "#C75B12", bg: "#FAF3EB", muted: "#E8D5C4" },
  "Teak & Mustard": { primary: "#7A5C1F", secondary: "#D4A017", accent: "#B8860B", bg: "#FFFBE6", muted: "#F0E4B8" },
  "Avocado Revival": { primary: "#4A6234", secondary: "#8FBC8F", accent: "#DAA520", bg: "#F5F7F0", muted: "#D4E0C8" },
  "Desert Modern": { primary: "#A07850", secondary: "#E8D5B7", accent: "#8B4513", bg: "#FFF8F0", muted: "#ECDCC8" },
  "Atomic Ranch": { primary: "#C4622D", secondary: "#FF8C00", accent: "#006D6F", bg: "#FFF5EE", muted: "#F0D8C8" },
  "Scandinavian Light": { primary: "#8A7B6B", secondary: "#E8DDD0", accent: "#4A6741", bg: "#FAFAF7", muted: "#E8E2D8" },
  "Bold Contrast": { primary: "#1A1A1A", secondary: "#F5F5DC", accent: "#D4380D", bg: "#FFFFFF", muted: "#E8E8E0" },
  "Coastal Teak": { primary: "#2E7D7D", secondary: "#A0D2DB", accent: "#C4874D", bg: "#F0FAFA", muted: "#C8E4E8" },
};

const DESIGN_THEMES = [
  "Classic MCM", "MCM + Boho", "MCM + Industrial", "MCM + Japandi",
  "MCM + Maximalist", "MCM + Minimalist", "MCM + Scandinavian", "Retro Atomic",
];

const PRIORITIES = ["Not Started", "Planning", "In Progress", "Complete"];
const PRIORITY_COLORS = { "Not Started": "#A09080", "Planning": "#C4922A", "In Progress": "#C4622D", "Complete": "#4A6234" };

const FURNITURE_PRESETS = {
  living: ["Sofa", "Ball Chair ✦", "Coffee Table", "Media Console / Credenza", "Side Table", "Arc Floor Lamp", "Area Rug (8×10)", "Bookshelf / Display"],
  dining: ["Dining Table (72–84\")", "Dining Chairs (set of 6–8)", "Sideboard / Credenza", "Bar Cart", "Statement Pendant Light", "Area Rug"],
  kitchen: ["Counter Stools", "Pendant Lights", "Kitchen Island Cart", "Open Shelf Display"],
  breakfast: ["Small Table", "Chairs or Bench", "Pendant Light"],
  primary_bed: ["Platform Bed Frame", "Nightstands (pair)", "Dresser", "Accent Chair", "Table Lamps", "Area Rug (8×10)", "Curtains / Drapes"],
  foyer: ["Console Table", "Large Mirror or Art", "Bench with Storage", "Pendant / Fixture", "Runner Rug"],
  family: ["Sectional Sofa", "Entertainment Center", "Coffee Table", "Accent Chairs", "Floor Lamps", "Area Rugs (zoning)", "Bookshelves"],
  rec: ["TBD — Define Purpose First", "Lounge Seating", "Bar Cabinet", "Game Table", "Sound System", "Accent Lighting"],
  storage: ["TBD — This Room Is Your Wildcard"],
};

// ─── HOOKS ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "mcm-home-planner-v1";

function usePersistedState(key, initializer) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return typeof initializer === "function" ? initializer() : initializer;
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }, [key, state]);

  return [state, setState];
}

function initRoomData() {
  const init = {};
  Object.values(ROOMS).flat().forEach(r => {
    init[r.id] = {
      palette: null,
      theme: null,
      priority: "Not Started",
      notes: "",
      furniture: (FURNITURE_PRESETS[r.id] || []).map(f => ({ name: f, owned: f.includes("✦"), notes: "" })),
      vision: "",
    };
  });
  return init;
}

// ─── STYLES ────────────────────────────────────────────────────────────
const fonts = {
  display: "'Playfair Display', Georgia, serif",
  mono: "'DM Mono', 'Courier New', monospace",
};

const colors = {
  bg: "#F6F1EA",
  surface: "#FFFFFF",
  dark: "#2A1F17",
  accent: "#B8621B",
  teal: "#1A6B6B",
  border: "#D8CCBC",
  muted: "#9A8B7A",
  warmBg: "#F0E8DD",
};

// ─── COMPONENTS ────────────────────────────────────────────────────────
function Badge({ children, color = colors.muted, filled = false }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      fontSize: "10px",
      fontFamily: fonts.mono,
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: filled ? "#FFF" : color,
      background: filled ? color : "transparent",
      border: `1px solid ${color}`,
      lineHeight: "1.6",
    }}>
      {children}
    </span>
  );
}

function RoomCard({ room, data, onClick, index }) {
  const palette = data.palette ? MCM_PALETTES[data.palette] : null;
  const hasContent = data.theme || data.palette || data.vision || data.notes;
  
  return (
    <div onClick={onClick} style={{
      background: colors.surface,
      border: `1px solid ${hasContent ? (palette?.primary || colors.accent) : colors.border}`,
      padding: "22px 20px",
      cursor: "pointer",
      transition: "all 0.25s ease",
      position: "relative",
      opacity: 0,
      animation: `fadeSlideIn 0.4s ease ${index * 0.04}s forwards`,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = palette?.primary || colors.accent;
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 8px 24px rgba(42,31,23,0.1)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = hasContent ? (palette?.primary || colors.accent) : colors.border;
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <span style={{
          fontFamily: fonts.display,
          fontSize: "22px",
          color: palette?.primary || colors.dark,
          lineHeight: 1,
        }}>{room.icon}</span>
        <div style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: PRIORITY_COLORS[data.priority],
        }} />
      </div>
      <h3 style={{
        fontFamily: fonts.display,
        fontSize: "17px",
        fontWeight: 700,
        color: colors.dark,
        margin: "0 0 4px",
        lineHeight: 1.3,
      }}>{room.name}</h3>
      <p style={{
        fontFamily: fonts.mono,
        fontSize: "11px",
        color: colors.muted,
        margin: "0 0 12px",
        letterSpacing: "0.5px",
      }}>{room.dims} · {room.sqft} sq ft</p>
      
      {palette && (
        <div style={{ display: "flex", gap: "3px", marginBottom: "10px" }}>
          {[palette.primary, palette.secondary, palette.accent, palette.muted].map((c, i) => (
            <div key={i} style={{
              width: "18px", height: "10px", background: c,
              border: "1px solid rgba(0,0,0,0.06)",
            }} />
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <Badge color={PRIORITY_COLORS[data.priority]} filled={data.priority !== "Not Started"}>
          {data.priority}
        </Badge>
        {data.theme && <Badge color={colors.teal}>{data.theme}</Badge>}
      </div>
    </div>
  );
}

function PaletteSelector({ selected, onSelect }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {Object.entries(MCM_PALETTES).map(([name, pal]) => {
        const active = selected === name;
        return (
          <div key={name} onClick={() => onSelect(active ? null : name)} style={{
            border: active ? `2px solid ${pal.primary}` : `1px solid ${colors.border}`,
            padding: "12px",
            cursor: "pointer",
            background: active ? pal.bg : colors.surface,
            transition: "all 0.2s ease",
          }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
              {[pal.primary, pal.secondary, pal.accent, pal.bg, pal.muted].map((c, i) => (
                <div key={i} style={{
                  flex: 1, height: "18px", background: c,
                  border: "1px solid rgba(0,0,0,0.06)",
                }} />
              ))}
            </div>
            <div style={{
              fontFamily: fonts.mono,
              fontSize: "11px",
              letterSpacing: "0.5px",
              color: active ? pal.primary : colors.dark,
              fontWeight: active ? 500 : 400,
            }}>{name}</div>
          </div>
        );
      })}
    </div>
  );
}

function FurnitureList({ items, onToggle, onRemove, onAdd }) {
  const [newItem, setNewItem] = useState("");
  
  return (
    <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, padding: "16px" }}>
      {items.length === 0 && (
        <p style={{ fontFamily: fonts.mono, fontSize: "12px", color: colors.muted, margin: "0 0 12px" }}>
          No pieces tracked yet
        </p>
      )}
      {items.map((f, idx) => (
        <div key={idx} style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "8px 0",
          borderBottom: idx < items.length - 1 ? `1px solid ${colors.warmBg}` : "none",
        }}>
          <div onClick={() => onToggle(idx)} style={{
            width: "18px", height: "18px", border: `2px solid ${f.owned ? colors.teal : colors.border}`,
            background: f.owned ? colors.teal : "transparent",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}>
            {f.owned && <span style={{ color: "#FFF", fontSize: "12px", lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{
            flex: 1,
            fontFamily: fonts.mono,
            fontSize: "13px",
            textDecoration: f.owned ? "line-through" : "none",
            opacity: f.owned ? 0.45 : 1,
            color: colors.dark,
          }}>{f.name}</span>
          <Badge color={f.owned ? colors.teal : colors.accent} filled>
            {f.owned ? "owned" : "need"}
          </Badge>
          <span onClick={() => onRemove(idx)} style={{
            cursor: "pointer", color: colors.muted, fontSize: "16px",
            padding: "0 2px", lineHeight: 1,
          }}>×</span>
        </div>
      ))}
      <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && newItem.trim()) {
              onAdd(newItem);
              setNewItem("");
            }
          }}
          placeholder="Add a piece — press Enter"
          style={{
            flex: 1, padding: "10px 12px",
            border: `1px solid ${colors.border}`,
            fontFamily: fonts.mono, fontSize: "12px",
            background: colors.warmBg,
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = colors.accent}
          onBlur={e => e.target.style.borderColor = colors.border}
        />
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────
export default function App() {
  const [roomData, setRoomData] = usePersistedState(STORAGE_KEY, initRoomData);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeFloor, setActiveFloor] = useState(Object.keys(ROOMS)[0]);
  const [view, setView] = useState("rooms");

  // Ensure new rooms get initialized if data structure evolves
  useEffect(() => {
    const allRoomIds = Object.values(ROOMS).flat().map(r => r.id);
    const missing = allRoomIds.filter(id => !roomData[id]);
    if (missing.length > 0) {
      const fresh = initRoomData();
      setRoomData(prev => {
        const merged = { ...prev };
        missing.forEach(id => { merged[id] = fresh[id]; });
        return merged;
      });
    }
  }, []);

  const updateRoom = useCallback((roomId, field, value) => {
    setRoomData(prev => ({
      ...prev,
      [roomId]: { ...prev[roomId], [field]: value }
    }));
  }, [setRoomData]);

  const addFurniture = useCallback((roomId, name) => {
    setRoomData(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        furniture: [...prev[roomId].furniture, { name: name.trim(), owned: false, notes: "" }]
      }
    }));
  }, [setRoomData]);

  const toggleFurniture = useCallback((roomId, idx) => {
    setRoomData(prev => {
      const f = [...prev[roomId].furniture];
      f[idx] = { ...f[idx], owned: !f[idx].owned };
      return { ...prev, [roomId]: { ...prev[roomId], furniture: f } };
    });
  }, [setRoomData]);

  const removeFurniture = useCallback((roomId, idx) => {
    setRoomData(prev => ({
      ...prev,
      [roomId]: { ...prev[roomId], furniture: prev[roomId].furniture.filter((_, i) => i !== idx) }
    }));
  }, [setRoomData]);

  const room = activeRoom ? Object.values(ROOMS).flat().find(r => r.id === activeRoom) : null;
  const data = activeRoom ? roomData[activeRoom] : null;
  const totalRooms = Object.values(ROOMS).flat().length;
  const completedRooms = Object.values(roomData).filter(r => r.priority === "Complete").length;
  const startedRooms = Object.values(roomData).filter(r => r.priority !== "Not Started").length;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, color: colors.dark }}>
      {/* Inject keyframe animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        textarea:focus, select:focus { outline: none; border-color: ${colors.accent} !important; }
        ::selection { background: ${colors.accent}22; }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
          .room-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .overview-table-row { grid-template-columns: 2fr 1fr 1fr !important; }
          .overview-header { grid-template-columns: 2fr 1fr 1fr !important; }
          .palette-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── HEADER ──────────────────────────── */}
      <header style={{
        background: colors.dark,
        color: colors.bg,
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        borderBottom: `3px solid ${colors.accent}`,
      }}>
        <div>
          <h1 style={{
            fontFamily: fonts.display,
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "1px",
            margin: 0,
          }}>
            <span style={{ color: colors.accent }}>◈</span> Home Design Planner
          </h1>
          <p style={{
            fontFamily: fonts.mono,
            fontSize: "11px",
            opacity: 0.5,
            letterSpacing: "1.5px",
            margin: "2px 0 0",
          }}>
            3,129 SQ FT · MID-CENTURY MODERN
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { key: "rooms", label: "Rooms" },
            { key: "overview", label: "Overview" },
          ].map(({ key, label }) => (
            <button key={key}
              onClick={() => { setView(key); setActiveRoom(null); }}
              style={{
                fontFamily: fonts.mono,
                fontSize: "11px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                padding: "8px 16px",
                cursor: "pointer",
                background: view === key || (view === "detail" && key === "rooms") ? colors.accent : "transparent",
                color: colors.bg,
                border: `1px solid ${colors.accent}`,
                transition: "all 0.2s ease",
              }}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ─── PROGRESS ────────────────────────── */}
      <div style={{
        padding: "14px 28px",
        background: colors.warmBg,
        borderBottom: `1px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            height: "5px",
            background: colors.border,
            borderRadius: "3px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${(completedRooms / totalRooms) * 100}%`,
              background: `linear-gradient(90deg, ${colors.accent}, ${colors.teal})`,
              borderRadius: "3px",
              transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        </div>
        <span style={{
          fontFamily: fonts.mono, fontSize: "11px", color: colors.muted,
          letterSpacing: "1px", whiteSpace: "nowrap",
        }}>
          {startedRooms} started · {completedRooms} complete · {totalRooms} total
        </span>
      </div>

      {/* ─── CONTENT ─────────────────────────── */}
      <main style={{ padding: "28px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* ROOMS LIST */}
        {view === "rooms" && !activeRoom && (
          <div>
            <div style={{ display: "flex", gap: "0", marginBottom: "28px" }}>
              {Object.keys(ROOMS).map(floor => (
                <button key={floor} onClick={() => setActiveFloor(floor)} style={{
                  fontFamily: fonts.mono,
                  fontSize: "12px",
                  letterSpacing: "1px",
                  padding: "12px 20px",
                  cursor: "pointer",
                  background: activeFloor === floor ? colors.dark : "transparent",
                  color: activeFloor === floor ? colors.bg : colors.dark,
                  border: `1.5px solid ${colors.dark}`,
                  fontWeight: activeFloor === floor ? 500 : 400,
                  transition: "all 0.2s ease",
                }}>
                  {floor}
                </button>
              ))}
            </div>
            <div className="room-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "14px",
            }}>
              {ROOMS[activeFloor].map((r, i) => (
                <RoomCard key={r.id} room={r} data={roomData[r.id]} index={i}
                  onClick={() => { setActiveRoom(r.id); setView("detail"); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ROOM DETAIL */}
        {view === "detail" && room && data && (
          <div style={{ animation: "fadeSlideIn 0.3s ease forwards" }}>
            <button onClick={() => { setActiveRoom(null); setView("rooms"); }} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: fonts.mono, fontSize: "12px", color: colors.accent,
              padding: "0 0 20px", letterSpacing: "1px",
            }}>
              ← back to rooms
            </button>

            {/* Room header */}
            <div style={{
              background: data.palette ? MCM_PALETTES[data.palette].bg : colors.surface,
              border: `2px solid ${data.palette ? MCM_PALETTES[data.palette].primary : colors.dark}`,
              padding: "28px",
              marginBottom: "24px",
            }}>
              <span style={{ fontFamily: fonts.display, fontSize: "28px", color: data.palette ? MCM_PALETTES[data.palette].primary : colors.dark }}>
                {room.icon}
              </span>
              <h2 style={{
                fontFamily: fonts.display, fontSize: "28px", fontWeight: 700,
                margin: "8px 0 6px", color: colors.dark,
              }}>{room.name}</h2>
              <p style={{
                fontFamily: fonts.mono, fontSize: "13px", color: colors.muted, margin: 0,
              }}>
                {room.dims} · {room.sqft} sq ft · Floor {room.floor}
              </p>
            </div>

            <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* LEFT */}
              <div>
                {/* Status */}
                <Section label="Status">
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {PRIORITIES.map(p => (
                      <button key={p} onClick={() => updateRoom(activeRoom, "priority", p)} style={{
                        fontFamily: fonts.mono, fontSize: "11px", letterSpacing: "1px",
                        padding: "7px 14px", cursor: "pointer",
                        background: data.priority === p ? PRIORITY_COLORS[p] : "transparent",
                        color: data.priority === p ? "#FFF" : PRIORITY_COLORS[p],
                        border: `1px solid ${PRIORITY_COLORS[p]}`,
                        transition: "all 0.15s ease",
                      }}>{p}</button>
                    ))}
                  </div>
                </Section>

                {/* Theme */}
                <Section label="Design Theme">
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {DESIGN_THEMES.map(t => (
                      <button key={t} onClick={() => updateRoom(activeRoom, "theme", data.theme === t ? null : t)} style={{
                        fontFamily: fonts.mono, fontSize: "11px", letterSpacing: "0.5px",
                        padding: "7px 12px", cursor: "pointer",
                        background: data.theme === t ? colors.dark : "transparent",
                        color: data.theme === t ? colors.bg : colors.dark,
                        border: `1px solid ${data.theme === t ? colors.dark : colors.border}`,
                        transition: "all 0.15s ease",
                      }}>{t}</button>
                    ))}
                  </div>
                </Section>

                {/* Palette */}
                <Section label="Color Palette">
                  <div className="palette-grid">
                    <PaletteSelector selected={data.palette} onSelect={v => updateRoom(activeRoom, "palette", v)} />
                  </div>
                </Section>
              </div>

              {/* RIGHT */}
              <div>
                <Section label="Vision — How Should This Room Feel?">
                  <textarea
                    value={data.vision}
                    onChange={e => updateRoom(activeRoom, "vision", e.target.value)}
                    placeholder="The first thing someone notices when they walk in is..."
                    rows={4}
                    style={{
                      width: "100%", padding: "14px",
                      border: `1px solid ${colors.border}`,
                      fontFamily: fonts.mono, fontSize: "13px",
                      background: colors.warmBg, resize: "vertical",
                      lineHeight: 1.6, color: colors.dark,
                    }}
                  />
                </Section>

                <Section label="Practical Notes">
                  <textarea
                    value={data.notes}
                    onChange={e => updateRoom(activeRoom, "notes", e.target.value)}
                    placeholder="Measurements, constraints, things to fix, links to inspiration..."
                    rows={3}
                    style={{
                      width: "100%", padding: "14px",
                      border: `1px solid ${colors.border}`,
                      fontFamily: fonts.mono, fontSize: "13px",
                      background: colors.warmBg, resize: "vertical",
                      lineHeight: 1.6, color: colors.dark,
                    }}
                  />
                </Section>

                <Section label="Furniture & Pieces">
                  <FurnitureList
                    items={data.furniture}
                    onToggle={idx => toggleFurniture(activeRoom, idx)}
                    onRemove={idx => removeFurniture(activeRoom, idx)}
                    onAdd={name => addFurniture(activeRoom, name)}
                  />
                </Section>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW */}
        {view === "overview" && (
          <div style={{ animation: "fadeSlideIn 0.3s ease forwards" }}>
            <h2 style={{
              fontFamily: fonts.display, fontSize: "24px", fontWeight: 700,
              marginBottom: "24px",
            }}>
              Project Overview
            </h2>

            {/* Stats */}
            <div className="stats-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px", marginBottom: "32px",
            }}>
              {PRIORITIES.map(p => {
                const count = Object.values(roomData).filter(r => r.priority === p).length;
                return (
                  <div key={p} style={{
                    background: colors.surface,
                    border: `2px solid ${PRIORITY_COLORS[p]}`,
                    padding: "20px", textAlign: "center",
                  }}>
                    <div style={{
                      fontFamily: fonts.display, fontSize: "36px", fontWeight: 700,
                      color: PRIORITY_COLORS[p],
                    }}>{count}</div>
                    <div style={{
                      fontFamily: fonts.mono, fontSize: "10px",
                      letterSpacing: "1.5px", textTransform: "uppercase",
                      color: colors.muted, marginTop: "4px",
                    }}>{p}</div>
                  </div>
                );
              })}
            </div>

            {/* Room Table */}
            <div style={{ background: colors.surface, border: `1px solid ${colors.dark}`, marginBottom: "28px" }}>
              <div className="overview-header" style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                padding: "12px 16px", background: colors.dark, color: colors.bg,
                fontFamily: fonts.mono, fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase",
              }}>
                <div>Room</div><div>Dimensions</div><div>Theme</div><div>Palette</div><div>Status</div>
              </div>
              {Object.entries(ROOMS).map(([floor, rooms]) => (
                <div key={floor}>
                  <div style={{
                    padding: "8px 16px", background: colors.warmBg,
                    fontFamily: fonts.mono, fontSize: "10px",
                    letterSpacing: "2px", textTransform: "uppercase", fontWeight: 500,
                  }}>{floor}</div>
                  {rooms.map(r => {
                    const rd = roomData[r.id];
                    const pal = rd.palette ? MCM_PALETTES[rd.palette] : null;
                    return (
                      <div key={r.id}
                        className="overview-table-row"
                        onClick={() => { setActiveRoom(r.id); setView("detail"); }}
                        style={{
                          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                          padding: "10px 16px", borderBottom: `1px solid ${colors.warmBg}`,
                          cursor: "pointer", fontFamily: fonts.mono, fontSize: "12px",
                          transition: "background 0.15s",
                          alignItems: "center",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = colors.warmBg}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ fontWeight: 500 }}>{room?.icon} {r.name}</div>
                        <div style={{ color: colors.muted, fontSize: "11px" }}>{r.dims}</div>
                        <div style={{ fontSize: "11px" }}>{rd.theme || "—"}</div>
                        <div>
                          {pal ? (
                            <div style={{ display: "flex", gap: "2px" }}>
                              {[pal.primary, pal.secondary, pal.accent].map((c, i) => (
                                <div key={i} style={{ width: "14px", height: "8px", background: c, border: "1px solid rgba(0,0,0,0.06)" }} />
                              ))}
                            </div>
                          ) : <span style={{ color: colors.muted }}>—</span>}
                        </div>
                        <div>
                          <Badge color={PRIORITY_COLORS[rd.priority]} filled={rd.priority !== "Not Started"}>
                            {rd.priority}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Shopping List Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Owned Pieces", filter: f => f.owned, color: colors.teal, borderColor: colors.teal },
                { label: "Shopping List", filter: f => !f.owned, color: colors.accent, borderColor: colors.accent },
              ].map(({ label, filter, color, borderColor }) => (
                <div key={label} style={{ background: colors.surface, border: `2px solid ${borderColor}`, padding: "20px" }}>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: "10px", letterSpacing: "1.5px",
                    color, textTransform: "uppercase", marginBottom: "12px",
                  }}>{label}</div>
                  {Object.values(ROOMS).flat().map(r => {
                    const items = roomData[r.id].furniture.filter(filter);
                    if (!items.length) return null;
                    return (
                      <div key={r.id} style={{ marginBottom: "8px" }}>
                        <span style={{ fontFamily: fonts.mono, fontSize: "12px", fontWeight: 500 }}>{r.name}: </span>
                        <span style={{ fontFamily: fonts.mono, fontSize: "12px", color: colors.muted }}>
                          {items.map(f => f.name).join(", ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Reset */}
            <div style={{ marginTop: "40px", textAlign: "center" }}>
              <button onClick={() => {
                if (confirm("Reset all room data? This cannot be undone.")) {
                  setRoomData(initRoomData());
                }
              }} style={{
                fontFamily: fonts.mono, fontSize: "11px", letterSpacing: "1px",
                padding: "8px 20px", cursor: "pointer",
                background: "transparent", color: colors.muted,
                border: `1px solid ${colors.border}`,
              }}>
                Reset All Data
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ─── FOOTER ──────────────────────────── */}
      <footer style={{
        textAlign: "center", padding: "32px 28px",
        fontFamily: fonts.mono, fontSize: "10px",
        color: colors.muted, letterSpacing: "2px",
      }}>
        ◈ AAKESH & ASHTON · 2026 ◈
      </footer>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <label style={{
        display: "block",
        fontFamily: fonts.mono,
        fontSize: "10px",
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: colors.muted,
        marginBottom: "10px",
      }}>{label}</label>
      {children}
    </div>
  );
}
