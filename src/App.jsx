import { useState, useEffect, useCallback, useRef } from "react";

const ROOMS = {
  "2nd Floor — Main Level": [
    { id: "living", name: "Living Room", dims: '22\'2" × 18\'1"', w: 266, h: 217, sqft: 401, floor: 2, icon: "◧" },
    { id: "dining", name: "Dining Area", dims: '16\'5" × 19\'0"', w: 197, h: 228, sqft: 312, floor: 2, icon: "◫" },
    { id: "kitchen", name: "Kitchen", dims: '17\'0" × 14\'0"', w: 204, h: 168, sqft: 238, floor: 2, icon: "⬡" },
    { id: "breakfast", name: "Breakfast Nook", dims: '9\'7" × 13\'2"', w: 115, h: 158, sqft: 126, floor: 2, icon: "◯" },
    { id: "foyer", name: "Foyer", dims: '23\'5" × 12\'1"', w: 281, h: 145, sqft: 283, floor: 2, icon: "⬢" },
    { id: "primary_bed", name: "Primary Bedroom", dims: '17\'0" × 17\'10"', w: 204, h: 214, sqft: 303, floor: 2, icon: "◈" },
    { id: "primary_bath", name: "Primary Bath", dims: '17\'0" × 8\'1"', w: 204, h: 97, sqft: 137, floor: 2, icon: "◇" },
    { id: "primary_wic", name: "Primary Closet", dims: '7\'9" × 6\'0"', w: 93, h: 72, sqft: 47, floor: 2, icon: "□" },
    { id: "laundry", name: "Laundry", dims: '6\'0" × 5\'11"', w: 72, h: 71, sqft: 36, floor: 2, icon: "○" },
    { id: "deck", name: "Deck", dims: '15\'0" × 11\'10"', w: 180, h: 142, sqft: 178, floor: 2, icon: "▽" },
    { id: "porch", name: "Porch", dims: '13\'7" × 6\'1"', w: 163, h: 73, sqft: 83, floor: 2, icon: "△" },
    { id: "garage", name: "Garage", dims: '22\'5" × 25\'9"', w: 269, h: 309, sqft: 577, floor: 2, icon: "▢" },
  ],
  "1st Floor — Lower Level": [
    { id: "family", name: "Family Room", dims: '22\'3" × 29\'6"', w: 267, h: 354, sqft: 657, floor: 1, icon: "◧" },
    { id: "rec", name: "Recreation Room", dims: '15\'5" × 20\'0"', w: 185, h: 240, sqft: 308, floor: 1, icon: "◈" },
    { id: "aakesh_office", name: "Aakesh's Office", dims: '12\'8" × 13\'7"', w: 152, h: 163, sqft: 172, floor: 1, icon: "⌘" },
    { id: "ashton_office", name: "Ashton's Office", dims: '12\'7" × 11\'10"', w: 151, h: 142, sqft: 149, floor: 1, icon: "⌘" },
    { id: "bonus", name: "Bonus Room", dims: '15\'1" × 11\'4"', w: 181, h: 136, sqft: 171, floor: 1, icon: "⬡" },
    { id: "lower_bath", name: "Lower Level Bath", dims: '9\'2" × 6\'1"', w: 110, h: 73, sqft: 56, floor: 1, icon: "○" },
    { id: "wic_aakesh", name: "Office Closet (A)", dims: '3\'5" × 3\'1"', w: 41, h: 37, sqft: 11, floor: 1, icon: "□" },
    { id: "wic_ashton", name: "Office Closet (Ash)", dims: '3\'5" × 5\'4"', w: 41, h: 64, sqft: 18, floor: 1, icon: "□" },
    { id: "storage", name: "Flex Space", dims: '32\'11" × 18\'11"', w: 395, h: 227, sqft: 623, floor: 1, icon: "⬢" },
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
  "Palm Springs": { primary: "#D4637A", secondary: "#F5CCD3", accent: "#2D8B72", bg: "#FFF5F6", muted: "#F0D8DC" },
  "Burnt Sienna": { primary: "#A0522D", secondary: "#DEB887", accent: "#2F4F4F", bg: "#FFF8F0", muted: "#E4CDB8" },
  "Harvest Gold": { primary: "#B8860B", secondary: "#F0DC82", accent: "#704214", bg: "#FFFDE8", muted: "#F0E4B0" },
  "Moody Library": { primary: "#2C3E50", secondary: "#8B7355", accent: "#C0392B", bg: "#F4F1EC", muted: "#D0C8BC" },
  "Olive & Brass": { primary: "#556B2F", secondary: "#C8B560", accent: "#8B6914", bg: "#F7F6F0", muted: "#D8D4B8" },
  "Terracotta Sun": { primary: "#CC5533", secondary: "#E8B88A", accent: "#1B5E4B", bg: "#FFF6F0", muted: "#F0D4C0" },
  "Nordic Frost": { primary: "#5B7B8A", secondary: "#C4D4DC", accent: "#A0522D", bg: "#F5F8FA", muted: "#D4DEE4" },
  "Chocolate & Cream": { primary: "#3E2723", secondary: "#EFEBE9", accent: "#BF8040", bg: "#FEFCFA", muted: "#E0D4C8" },
  "Sage & Rust": { primary: "#7A8B6F", secondary: "#D4CCBB", accent: "#B7532A", bg: "#F6F5F0", muted: "#D0D4C4" },
  "Sunset Strip": { primary: "#D35400", secondary: "#F5B041", accent: "#1A5276", bg: "#FFF8F2", muted: "#F0D8B8" },
  "Eames Era": { primary: "#C0392B", secondary: "#F8F4E8", accent: "#1A1A1A", bg: "#FDFCF8", muted: "#E8E0D0" },
  "Malibu Dusk": { primary: "#6C5B7B", secondary: "#C9B8D4", accent: "#D4874D", bg: "#F8F5FA", muted: "#DCD0E4" },
};

const DESIGN_THEMES = ["Classic MCM","MCM + Boho","MCM + Industrial","MCM + Japandi","MCM + Maximalist","MCM + Minimalist","MCM + Scandinavian","Retro Atomic"];
const PRIORITIES = ["Not Started","Planning","In Progress","Complete"];
const PRIORITY_COLORS = {"Not Started":"#A09080","Planning":"#C4922A","In Progress":"#C4622D","Complete":"#4A6234"};

const FURNITURE_PRESETS = {
  living:["Sofa","Ball Chair ✦","Coffee Table","Media Console / Credenza","Side Table","Arc Floor Lamp","Area Rug (8×10)","Bookshelf / Display"],
  dining:['Dining Table (84–96")','Dining Chairs (set of 8–10)',"Sideboard / Credenza","Bar Cart","Statement Pendant Light","Area Rug"],
  kitchen:["Counter Stools","Pendant Lights","Kitchen Island Cart","Open Shelf Display"],
  breakfast:["Small Table","Chairs or Bench","Pendant Light"],
  primary_bed:["King Platform Bed Frame",'Slim Nightstands (pair, 18–22")',"Dresser","Table Lamps","Area Rug (8×10)","Blackout Curtains"],
  foyer:["Console Table","Large Mirror or Art","Bench with Storage","Pendant / Fixture","Runner Rug"],
  family:["Sectional Sofa","Entertainment Center","Coffee Table","Accent Chairs","Floor Lamps","Area Rugs (zoning)","Bookshelves"],
  rec:["Lounge Seating","Bar Cabinet","Game Table","Sound System","Accent Lighting"],
  aakesh_office:['L-Desk or 72"+ Desk',"Ergonomic Chair","Dual Monitor Arms","MCM Daybed / Convertible Couch","Bookshelves","Sound Panels","Cable Management"],
  ashton_office:['Murphy Bed (Queen)','Desk (48–60")',"Ergonomic Chair","Monitor Arm","Bookshelf (video backdrop)","File Storage","Desk Lamp"],
  storage:["TBD — This Room Is Your Wildcard"],
};

const FURNITURE_PIECES = {
  "King Bed":{w:76,h:80,color:"#8B7355",label:"King"},"Queen Bed":{w:60,h:80,color:"#8B7355",label:"Queen"},
  "Murphy Bed (Q)":{w:64,h:84,color:"#8B7355",label:"Murphy"},"Nightstand":{w:20,h:18,color:"#A0845C",label:"NS"},
  "Dresser":{w:60,h:18,color:"#A0845C",label:"Dresser"},'Sofa (84")':{w:84,h:36,color:"#6B7B6B",label:"Sofa"},
  "Sectional L":{w:108,h:84,color:"#6B7B6B",label:"Sectional"},"Ball Chair":{w:42,h:42,color:"#C75B12",label:"Ball"},
  "Coffee Table":{w:48,h:24,color:"#A0845C",label:"Coffee"},'Dining Table (96")':{w:96,h:42,color:"#7A5C1F",label:"Dining"},
  "Dining Chair":{w:20,h:20,color:"#8B7355",label:"Ch"},'Credenza (72")':{w:72,h:18,color:"#A0845C",label:"Credenza"},
  'L-Desk (72")':{w:72,h:30,color:"#5C5C5C",label:"L-Desk"},'Desk (60")':{w:60,h:28,color:"#5C5C5C",label:"Desk"},
  'Desk (48")':{w:48,h:24,color:"#5C5C5C",label:"Desk"},"Office Chair":{w:24,h:24,color:"#444",label:"Chair"},
  "Bookshelf":{w:36,h:12,color:"#A0845C",label:"Books"},"Bar Cart":{w:30,h:18,color:"#B8860B",label:"Bar"},
  "Floor Lamp":{w:12,h:12,color:"#888",label:"Lamp"},"Area Rug (8×10)":{w:96,h:120,color:"rgba(160,132,92,0.25)",label:"Rug"},
  "Cat Tree":{w:24,h:24,color:"#8FBC8F",label:"Cat"},"Litter-Robot":{w:26,h:28,color:"#A09080",label:"LR"},
  "Accent Chair":{w:30,h:30,color:"#6B7B6B",label:"Accent"},"Daybed":{w:78,h:36,color:"#8B7355",label:"Daybed"},
  "MCM Chaise":{w:60,h:28,color:"#6B7B6B",label:"Chaise"},"Entertainment Center":{w:72,h:20,color:"#5C3D2E",label:"Media"},
  'Blackstone 36"':{w:42,h:22,color:"#333",label:"Griddle"},"Prep Table":{w:36,h:24,color:"#888",label:"Prep"},
};

function hexToHSL(hex){let r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max===min){h=s=0}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break}}return[h*360,s*100,l*100]}
function hslToHex(h,s,l){h/=360;s/=100;l/=100;let r,g,b;if(s===0){r=g=b=l}else{const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};r=f(p,q,h+1/3);g=f(p,q,h);b=f(p,q,h-1/3)}return"#"+[r,g,b].map(x=>Math.round(x*255).toString(16).padStart(2,"0")).join("")}
function generatePaletteFromColor(hex){const[h,s,l]=hexToHSL(hex);return{primary:hex,secondary:hslToHex(h,Math.max(s-25,10),Math.min(l+30,90)),accent:hslToHex((h+150)%360,Math.min(s+10,80),Math.max(l-10,30)),bg:hslToHex(h,Math.max(s-40,5),Math.min(l+40,97)),muted:hslToHex(h,Math.max(s-30,8),Math.min(l+25,88))}}

const STORAGE_KEY="mcm-home-planner-v2",PHOTOS_KEY="mcm-home-photos-v1",LAYOUTS_KEY="mcm-home-layouts-v1";
const fonts={display:"'Playfair Display',Georgia,serif",mono:"'DM Mono','Courier New',monospace"};
const C={bg:"#F6F1EA",surface:"#FFFFFF",dark:"#2A1F17",accent:"#B8621B",teal:"#1A6B6B",border:"#D8CCBC",muted:"#9A8B7A",warmBg:"#F0E8DD"};

function usePS(key,init){const[s,setS]=useState(()=>{try{const v=localStorage.getItem(key);if(v)return JSON.parse(v)}catch(e){}return typeof init==="function"?init():init});useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(s))}catch(e){}},[key,s]);return[s,setS]}
function initRD(){const o={};Object.values(ROOMS).flat().forEach(r=>{o[r.id]={palette:null,customPalette:null,theme:null,priority:"Not Started",notes:"",furniture:(FURNITURE_PRESETS[r.id]||[]).map(f=>({name:f,owned:f.includes("✦"),notes:""})),vision:""}});return o}

// ─── COMPONENTS ────────────────────────────────────────────────────────
const Badge=({children,color=C.muted,filled=false})=><span style={{display:"inline-block",padding:"3px 10px",fontSize:"10px",fontFamily:fonts.mono,letterSpacing:"1.5px",textTransform:"uppercase",color:filled?"#FFF":color,background:filled?color:"transparent",border:`1px solid ${color}`,lineHeight:"1.6"}}>{children}</span>;
const Section=({label,children})=><div style={{marginBottom:"22px"}}><label style={{display:"block",fontFamily:fonts.mono,fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:C.muted,marginBottom:"10px"}}>{label}</label>{children}</div>;

function RoomCard({room,data,onClick,index,photoUrl}){
  const pal=data.palette?MCM_PALETTES[data.palette]:data.customPalette;
  const has=data.theme||data.palette||data.customPalette||data.vision;
  return <div onClick={onClick} style={{background:C.surface,border:`1px solid ${has?(pal?.primary||C.accent):C.border}`,cursor:"pointer",transition:"all 0.25s ease",position:"relative",overflow:"hidden",opacity:0,animation:`fi 0.4s ease ${index*0.04}s forwards`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(42,31,23,0.1)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>
    {photoUrl&&<div style={{height:"100px",overflow:"hidden",borderBottom:`1px solid ${C.border}`}}><img src={photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}
    <div style={{padding:"18px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
        <span style={{fontFamily:fonts.display,fontSize:"20px",color:pal?.primary||C.dark,lineHeight:1}}>{room.icon}</span>
        <div style={{width:"8px",height:"8px",borderRadius:"50%",background:PRIORITY_COLORS[data.priority]}}/>
      </div>
      <h3 style={{fontFamily:fonts.display,fontSize:"16px",fontWeight:700,color:C.dark,margin:"0 0 4px",lineHeight:1.3}}>{room.name}</h3>
      <p style={{fontFamily:fonts.mono,fontSize:"11px",color:C.muted,margin:"0 0 10px",letterSpacing:"0.5px"}}>{room.dims} · {room.sqft} sq ft</p>
      {pal&&<div style={{display:"flex",gap:"3px",marginBottom:"8px"}}>{[pal.primary,pal.secondary,pal.accent,pal.muted].map((c,i)=><div key={i} style={{width:"18px",height:"10px",background:c,border:"1px solid rgba(0,0,0,0.06)"}}/>)}</div>}
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}><Badge color={PRIORITY_COLORS[data.priority]} filled={data.priority!=="Not Started"}>{data.priority}</Badge>{data.theme&&<Badge color={C.teal}>{data.theme}</Badge>}</div>
    </div>
  </div>;
}

function PaletteSelector({selected,customPalette,onSelectPreset,onSetCustom}){
  const[showC,setShowC]=useState(false);const[cc,setCc]=useState("#8B6914");const[search,setSearch]=useState("");
  const filtered=Object.entries(MCM_PALETTES).filter(([n])=>n.toLowerCase().includes(search.toLowerCase()));
  return <div>
    <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>
      <button onClick={()=>setShowC(false)} style={{fontFamily:fonts.mono,fontSize:"10px",letterSpacing:"1px",padding:"6px 12px",cursor:"pointer",background:!showC?C.dark:"transparent",color:!showC?C.bg:C.dark,border:`1px solid ${C.dark}`}}>Presets ({Object.keys(MCM_PALETTES).length})</button>
      <button onClick={()=>setShowC(true)} style={{fontFamily:fonts.mono,fontSize:"10px",letterSpacing:"1px",padding:"6px 12px",cursor:"pointer",background:showC?C.dark:"transparent",color:showC?C.bg:C.dark,border:`1px solid ${C.dark}`}}>Custom</button>
    </div>
    {!showC?<div>
      <input type="text" placeholder="Filter palettes..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",padding:"8px 12px",marginBottom:"10px",border:`1px solid ${C.border}`,fontFamily:fonts.mono,fontSize:"11px",background:C.warmBg,outline:"none",boxSizing:"border-box"}}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",maxHeight:"360px",overflowY:"auto"}}>
        {filtered.map(([name,pal])=>{const a=selected===name;return<div key={name} onClick={()=>{onSelectPreset(a?null:name);onSetCustom(null)}} style={{border:a?`2px solid ${pal.primary}`:`1px solid ${C.border}`,padding:"10px",cursor:"pointer",background:a?pal.bg:C.surface}}>
          <div style={{display:"flex",gap:"3px",marginBottom:"6px"}}>{[pal.primary,pal.secondary,pal.accent,pal.bg,pal.muted].map((c,i)=><div key={i} style={{flex:1,height:"16px",background:c,border:"1px solid rgba(0,0,0,0.06)"}}/>)}</div>
          <div style={{fontFamily:fonts.mono,fontSize:"10px",letterSpacing:"0.5px",color:a?pal.primary:C.dark}}>{name}</div>
        </div>})}
      </div>
    </div>:<div>
      <p style={{fontFamily:fonts.mono,fontSize:"11px",color:C.muted,marginBottom:"12px"}}>Pick an anchor color — accent and trim auto-generate.</p>
      <div style={{display:"flex",gap:"12px",alignItems:"flex-start",marginBottom:"16px"}}>
        <div><input type="color" value={cc} onChange={e=>setCc(e.target.value)} style={{width:"60px",height:"60px",border:"none",cursor:"pointer",padding:0,background:"none"}}/><div style={{fontFamily:fonts.mono,fontSize:"10px",color:C.muted,marginTop:"4px",textAlign:"center"}}>{cc}</div></div>
        <div style={{flex:1}}>{(()=>{const p=generatePaletteFromColor(cc);return<div>
          <div style={{display:"flex",gap:"4px",marginBottom:"8px"}}>{Object.entries(p).map(([role,c])=><div key={role} style={{flex:1,textAlign:"center"}}><div style={{height:"32px",background:c,border:"1px solid rgba(0,0,0,0.06)",marginBottom:"4px"}}/><div style={{fontFamily:fonts.mono,fontSize:"9px",color:C.muted,textTransform:"uppercase"}}>{role}</div></div>)}</div>
          <button onClick={()=>{onSetCustom(p);onSelectPreset(null)}} style={{fontFamily:fonts.mono,fontSize:"10px",letterSpacing:"1px",padding:"8px 16px",cursor:"pointer",background:cc,color:"#FFF",border:"none",width:"100%"}}>Apply This Palette</button>
        </div>})()}</div>
      </div>
      {customPalette&&<div style={{padding:"10px",border:`2px solid ${customPalette.primary}`,background:customPalette.bg,fontFamily:fonts.mono,fontSize:"10px"}}><span style={{color:customPalette.primary}}>✓ Custom palette active</span><button onClick={()=>onSetCustom(null)} style={{float:"right",background:"none",border:"none",cursor:"pointer",fontFamily:fonts.mono,fontSize:"11px",color:C.muted}}>clear</button></div>}
    </div>}
  </div>;
}

function PhotoManager({roomId,photos,onPhotosChange}){
  const ref=useRef(null);
  const handle=(e)=>{Array.from(e.target.files).forEach(file=>{const reader=new FileReader();reader.onload=(ev)=>{const img=new Image();img.onload=()=>{const canvas=document.createElement("canvas");const MAX=800;let w=img.width,h=img.height;if(w>MAX||h>MAX){if(w>h){h=h*MAX/w;w=MAX}else{w=w*MAX/h;h=MAX}}canvas.width=w;canvas.height=h;canvas.getContext("2d").drawImage(img,0,0,w,h);const d=canvas.toDataURL("image/jpeg",0.7);const rp=photos[roomId]||[];onPhotosChange({...photos,[roomId]:[...rp,d]})};img.src=ev.target.result};reader.readAsDataURL(file)});e.target.value=""};
  const rm=(idx)=>{onPhotosChange({...photos,[roomId]:(photos[roomId]||[]).filter((_,i)=>i!==idx)})};
  const rp=photos[roomId]||[];
  return<div>
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"10px"}}>
      {rp.map((url,i)=><div key={i} style={{position:"relative",width:"120px",height:"80px"}}><img src={url} alt="" style={{width:"100%",height:"100%",objectFit:"cover",border:`1px solid ${C.border}`}}/><button onClick={()=>rm(i)} style={{position:"absolute",top:"2px",right:"2px",background:"rgba(0,0,0,0.6)",color:"#FFF",border:"none",cursor:"pointer",width:"18px",height:"18px",fontSize:"11px",lineHeight:"1",padding:0}}>×</button></div>)}
      <div onClick={()=>ref.current?.click()} style={{width:"120px",height:"80px",border:`2px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,fontFamily:fonts.mono,fontSize:"11px"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>+ Add Photo</div>
    </div>
    <input ref={ref} type="file" accept="image/*" multiple onChange={handle} style={{display:"none"}}/>
    <p style={{fontFamily:fonts.mono,fontSize:"10px",color:C.muted,margin:0}}>Upload listing photos or inspiration. Stored locally on this device.</p>
  </div>;
}

function FurnitureList({items,onToggle,onRemove,onAdd}){
  const[n,setN]=useState("");
  return<div style={{background:C.surface,border:`1px solid ${C.border}`,padding:"16px"}}>
    {items.length===0&&<p style={{fontFamily:fonts.mono,fontSize:"12px",color:C.muted,margin:"0 0 12px"}}>No pieces tracked yet</p>}
    {items.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:i<items.length-1?`1px solid ${C.warmBg}`:"none"}}>
      <div onClick={()=>onToggle(i)} style={{width:"18px",height:"18px",border:`2px solid ${f.owned?C.teal:C.border}`,background:f.owned?C.teal:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{f.owned&&<span style={{color:"#FFF",fontSize:"12px"}}>✓</span>}</div>
      <span style={{flex:1,fontFamily:fonts.mono,fontSize:"13px",textDecoration:f.owned?"line-through":"none",opacity:f.owned?0.45:1}}>{f.name}</span>
      <Badge color={f.owned?C.teal:C.accent} filled>{f.owned?"owned":"need"}</Badge>
      <span onClick={()=>onRemove(i)} style={{cursor:"pointer",color:C.muted,fontSize:"16px"}}>×</span>
    </div>)}
    <div style={{marginTop:"12px",display:"flex",gap:"8px"}}>
      <input type="text" value={n} onChange={e=>setN(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&n.trim()){onAdd(n);setN("")}}} placeholder="Add a piece — press Enter" style={{flex:1,padding:"10px 12px",border:`1px solid ${C.border}`,fontFamily:fonts.mono,fontSize:"12px",background:C.warmBg,outline:"none"}}/>
    </div>
  </div>;
}

function RoomLayout({room,layouts,onLayoutsChange}){
  const canvasRef=useRef(null);
  const[pieces,setPR]=useState(()=>layouts[room.id]||[]);
  const[drag,setDrag]=useState(null);
  const[off,setOff]=useState({x:0,y:0});
  const[adding,setAdding]=useState(false);
  const setP=(v)=>{const val=typeof v==="function"?v(pieces):v;setPR(val);onLayoutsChange({...layouts,[room.id]:val})};
  const S=2,rW=room.w*S,rH=room.h*S;
  const add=(name)=>{const fp=FURNITURE_PIECES[name];if(!fp)return;setP(p=>[...p,{name,x:20,y:20,w:fp.w*S,h:fp.h*S,color:fp.color,label:fp.label,rotated:false}]);setAdding(false)};
  const rotate=(i)=>setP(p=>p.map((x,j)=>j===i?{...x,w:x.h,h:x.w,rotated:!x.rotated}:x));
  const rm=(i)=>setP(p=>p.filter((_,j)=>j!==i));
  const md=(e,i)=>{e.stopPropagation();const r=canvasRef.current.getBoundingClientRect();setDrag(i);setOff({x:e.clientX-r.left-pieces[i].x,y:e.clientY-r.top-pieces[i].y})};
  const mm=(e)=>{if(drag===null)return;const r=canvasRef.current.getBoundingClientRect();const x=Math.max(0,Math.min(rW-pieces[drag].w,e.clientX-r.left-off.x)),y=Math.max(0,Math.min(rH-pieces[drag].h,e.clientY-r.top-off.y));setPR(p=>p.map((v,i)=>i===drag?{...v,x,y}:v))};
  const mu=()=>{if(drag!==null)onLayoutsChange({...layouts,[room.id]:pieces});setDrag(null)};
  const ts=(e,i)=>{e.stopPropagation();const t=e.touches[0],r=canvasRef.current.getBoundingClientRect();setDrag(i);setOff({x:t.clientX-r.left-pieces[i].x,y:t.clientY-r.top-pieces[i].y})};
  const tmv=(e)=>{if(drag===null)return;e.preventDefault();const t=e.touches[0],r=canvasRef.current.getBoundingClientRect();const x=Math.max(0,Math.min(rW-pieces[drag].w,t.clientX-r.left-off.x)),y=Math.max(0,Math.min(rH-pieces[drag].h,t.clientY-r.top-off.y));setPR(p=>p.map((v,i)=>i===drag?{...v,x,y}:v))};
  const te=()=>{if(drag!==null)onLayoutsChange({...layouts,[room.id]:pieces});setDrag(null)};

  const cats={Seating:['Sofa (84")','Sectional L','Ball Chair','Accent Chair','MCM Chaise','Daybed','Office Chair','Dining Chair'],Tables:['Coffee Table','Dining Table (96")','Prep Table','Bar Cart'],Storage:['Credenza (72")','Bookshelf','Entertainment Center','Dresser','Nightstand'],Beds:['King Bed','Queen Bed','Murphy Bed (Q)'],Desks:['L-Desk (72")','Desk (60")','Desk (48")'],Other:['Floor Lamp','Area Rug (8×10)','Cat Tree','Litter-Robot','Blackstone 36"']};

  return<div>
    <div style={{marginBottom:"16px",overflowX:"auto"}}>
      <div ref={canvasRef} onMouseMove={mm} onMouseUp={mu} onMouseLeave={mu} onTouchMove={tmv} onTouchEnd={te} style={{width:rW,height:rH,background:"#FBF8F4",border:`3px solid ${C.dark}`,position:"relative",cursor:drag!==null?"grabbing":"default",touchAction:"none",backgroundImage:`linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)`,backgroundSize:`${S*12}px ${S*12}px`}}>
        <div style={{position:"absolute",bottom:"4px",right:"8px",fontFamily:fonts.mono,fontSize:"9px",color:C.muted,pointerEvents:"none"}}>{room.dims} — grid = 1ft</div>
        {pieces.map((p,i)=><div key={i} onMouseDown={e=>md(e,i)} onTouchStart={e=>ts(e,i)} style={{position:"absolute",left:p.x,top:p.y,width:p.w,height:p.h,background:p.color,border:drag===i?"2px solid #FFF":"1px solid rgba(255,255,255,0.4)",boxShadow:drag===i?"0 2px 8px rgba(0,0,0,0.3)":"0 1px 3px rgba(0,0,0,0.15)",cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.min(p.w,p.h)<30?"7px":"9px",fontFamily:fonts.mono,color:"#FFF",userSelect:"none",zIndex:drag===i?10:1,opacity:p.color.includes("rgba")?1:0.85}}>{p.label}</div>)}
      </div>
    </div>
    {pieces.length>0&&<div style={{marginBottom:"12px",display:"flex",gap:"6px",flexWrap:"wrap"}}>
      {pieces.map((p,i)=><div key={i} style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",background:C.warmBg,border:`1px solid ${C.border}`,fontFamily:fonts.mono,fontSize:"10px"}}>
        <span style={{width:"8px",height:"8px",background:p.color,display:"inline-block"}}/>{p.name}
        <button onClick={()=>rotate(i)} title="Rotate" style={{background:"none",border:"none",cursor:"pointer",fontSize:"12px",padding:"0 2px",color:C.muted}}>↻</button>
        <button onClick={()=>rm(i)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"12px",padding:"0 2px",color:C.muted}}>×</button>
      </div>)}
    </div>}
    {adding?<div style={{background:C.surface,border:`1px solid ${C.border}`,padding:"12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><span style={{fontFamily:fonts.mono,fontSize:"11px",fontWeight:500}}>Add Furniture</span><span onClick={()=>setAdding(false)} style={{cursor:"pointer",color:C.muted,fontFamily:fonts.mono,fontSize:"12px"}}>close</span></div>
      {Object.entries(cats).map(([cat,items])=><div key={cat} style={{marginBottom:"8px"}}>
        <div style={{fontFamily:fonts.mono,fontSize:"9px",letterSpacing:"1.5px",color:C.muted,textTransform:"uppercase",marginBottom:"4px"}}>{cat}</div>
        <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>{items.map(name=><button key={name} onClick={()=>add(name)} style={{fontFamily:fonts.mono,fontSize:"10px",padding:"4px 8px",background:C.warmBg,border:`1px solid ${C.border}`,cursor:"pointer",color:C.dark}}>{name}</button>)}</div>
      </div>)}
    </div>:<button onClick={()=>setAdding(true)} style={{fontFamily:fonts.mono,fontSize:"11px",letterSpacing:"1px",padding:"8px 16px",cursor:"pointer",background:"transparent",color:C.accent,border:`1px solid ${C.accent}`,width:"100%"}}>+ Add Furniture to Layout</button>}
  </div>;
}

// ─── MAIN APP ──────────────────────────────────────────────────────────
export default function App(){
  const[roomData,setRoomData]=usePS(STORAGE_KEY,initRD);
  const[photos,setPhotos]=usePS(PHOTOS_KEY,{});
  const[layouts,setLayouts]=usePS(LAYOUTS_KEY,{});
  const[activeRoom,setActiveRoom]=useState(null);
  const[activeFloor,setActiveFloor]=useState(Object.keys(ROOMS)[0]);
  const[view,setView]=useState("rooms");
  const[detailTab,setDetailTab]=useState("design");

  useEffect(()=>{const ids=Object.values(ROOMS).flat().map(r=>r.id);const miss=ids.filter(id=>!roomData[id]);if(miss.length>0){const f=initRD();setRoomData(p=>{const m={...p};miss.forEach(id=>{m[id]=f[id]});return m})}},[]);

  const upd=useCallback((id,f,v)=>setRoomData(p=>({...p,[id]:{...p[id],[f]:v}})),[setRoomData]);
  const addF=useCallback((id,n)=>setRoomData(p=>({...p,[id]:{...p[id],furniture:[...p[id].furniture,{name:n.trim(),owned:false,notes:""}]}})),[setRoomData]);
  const togF=useCallback((id,i)=>setRoomData(p=>{const f=[...p[id].furniture];f[i]={...f[i],owned:!f[i].owned};return{...p,[id]:{...p[id],furniture:f}}}),[setRoomData]);
  const rmF=useCallback((id,i)=>setRoomData(p=>({...p,[id]:{...p[id],furniture:p[id].furniture.filter((_,j)=>j!==i)}})),[setRoomData]);

  const room=activeRoom?Object.values(ROOMS).flat().find(r=>r.id===activeRoom):null;
  const data=activeRoom?roomData[activeRoom]:null;
  const tot=Object.values(ROOMS).flat().length;
  const done=Object.values(roomData).filter(r=>r.priority==="Complete").length;
  const started=Object.values(roomData).filter(r=>r.priority!=="Not Started").length;

  return<div style={{minHeight:"100vh",background:C.bg,color:C.dark}}>
    <style>{`@keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}textarea:focus,input:focus{outline:none;border-color:${C.accent}!important}::selection{background:${C.accent}22}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}@media(max-width:768px){.dg{grid-template-columns:1fr!important}.rg{grid-template-columns:1fr!important}.sg{grid-template-columns:1fr 1fr!important}.otr{grid-template-columns:2fr 1fr 1fr!important}.oh{grid-template-columns:2fr 1fr 1fr!important}}`}</style>

    <header style={{background:C.dark,color:C.bg,padding:"20px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px",borderBottom:`3px solid ${C.accent}`}}>
      <div><h1 style={{fontFamily:fonts.display,fontSize:"22px",fontWeight:700,letterSpacing:"1px",margin:0}}><span style={{color:C.accent}}>◈</span> MCM Dream</h1><p style={{fontFamily:fonts.mono,fontSize:"11px",opacity:0.5,letterSpacing:"1.5px",margin:"2px 0 0"}}>3,129 SQ FT · MID-CENTURY MODERN</p></div>
      <div style={{display:"flex",gap:"6px"}}>{[{k:"rooms",l:"Rooms"},{k:"overview",l:"Overview"}].map(({k,l})=><button key={k} onClick={()=>{setView(k);setActiveRoom(null)}} style={{fontFamily:fonts.mono,fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",padding:"8px 16px",cursor:"pointer",background:view===k||(view==="detail"&&k==="rooms")?C.accent:"transparent",color:C.bg,border:`1px solid ${C.accent}`}}>{l}</button>)}</div>
    </header>

    <div style={{padding:"14px 28px",background:C.warmBg,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:"16px"}}>
      <div style={{flex:1}}><div style={{height:"5px",background:C.border,borderRadius:"3px",overflow:"hidden"}}><div style={{height:"100%",width:`${(done/tot)*100}%`,background:`linear-gradient(90deg,${C.accent},${C.teal})`,borderRadius:"3px",transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)"}}/></div></div>
      <span style={{fontFamily:fonts.mono,fontSize:"11px",color:C.muted,letterSpacing:"1px",whiteSpace:"nowrap"}}>{started} started · {done} complete · {tot} total</span>
    </div>

    <main style={{padding:"28px",maxWidth:"1200px",margin:"0 auto"}}>
      {view==="rooms"&&!activeRoom&&<div>
        <div style={{display:"flex",gap:"0",marginBottom:"28px"}}>{Object.keys(ROOMS).map(f=><button key={f} onClick={()=>setActiveFloor(f)} style={{fontFamily:fonts.mono,fontSize:"12px",letterSpacing:"1px",padding:"12px 20px",cursor:"pointer",background:activeFloor===f?C.dark:"transparent",color:activeFloor===f?C.bg:C.dark,border:`1.5px solid ${C.dark}`,fontWeight:activeFloor===f?500:400}}>{f}</button>)}</div>
        <div className="rg" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"14px"}}>{ROOMS[activeFloor].map((r,i)=><RoomCard key={r.id} room={r} data={roomData[r.id]} index={i} photoUrl={(photos[r.id]||[])[0]} onClick={()=>{setActiveRoom(r.id);setView("detail");setDetailTab("design")}}/>)}</div>
      </div>}

      {view==="detail"&&room&&data&&<div style={{animation:"fi 0.3s ease forwards"}}>
        <button onClick={()=>{setActiveRoom(null);setView("rooms")}} style={{background:"none",border:"none",cursor:"pointer",fontFamily:fonts.mono,fontSize:"12px",color:C.accent,padding:"0 0 20px",letterSpacing:"1px"}}>← back to rooms</button>
        <div style={{background:(()=>{const p=data.palette?MCM_PALETTES[data.palette]:data.customPalette;return p?p.bg:C.surface})(),border:`2px solid ${(()=>{const p=data.palette?MCM_PALETTES[data.palette]:data.customPalette;return p?p.primary:C.dark})()}`,padding:"28px",marginBottom:"20px"}}>
          <span style={{fontFamily:fonts.display,fontSize:"28px"}}>{room.icon}</span>
          <h2 style={{fontFamily:fonts.display,fontSize:"28px",fontWeight:700,margin:"8px 0 6px"}}>{room.name}</h2>
          <p style={{fontFamily:fonts.mono,fontSize:"13px",color:C.muted,margin:0}}>{room.dims} · {room.sqft} sq ft · Floor {room.floor}</p>
        </div>
        <div style={{display:"flex",gap:"0",marginBottom:"24px"}}>{[{k:"design",l:"Design"},{k:"layout",l:"2D Layout"},{k:"photos",l:`Photos${(photos[room.id]?.length)?` (${photos[room.id].length})`:""}` }].map(({k,l})=><button key={k} onClick={()=>setDetailTab(k)} style={{fontFamily:fonts.mono,fontSize:"11px",letterSpacing:"1px",padding:"10px 18px",cursor:"pointer",background:detailTab===k?C.dark:"transparent",color:detailTab===k?C.bg:C.dark,border:`1.5px solid ${C.dark}`}}>{l}</button>)}</div>

        {detailTab==="design"&&<div className="dg" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px"}}>
          <div>
            <Section label="Status"><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{PRIORITIES.map(p=><button key={p} onClick={()=>upd(activeRoom,"priority",p)} style={{fontFamily:fonts.mono,fontSize:"11px",letterSpacing:"1px",padding:"7px 14px",cursor:"pointer",background:data.priority===p?PRIORITY_COLORS[p]:"transparent",color:data.priority===p?"#FFF":PRIORITY_COLORS[p],border:`1px solid ${PRIORITY_COLORS[p]}`}}>{p}</button>)}</div></Section>
            <Section label="Design Theme"><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{DESIGN_THEMES.map(t=><button key={t} onClick={()=>upd(activeRoom,"theme",data.theme===t?null:t)} style={{fontFamily:fonts.mono,fontSize:"11px",letterSpacing:"0.5px",padding:"7px 12px",cursor:"pointer",background:data.theme===t?C.dark:"transparent",color:data.theme===t?C.bg:C.dark,border:`1px solid ${data.theme===t?C.dark:C.border}`}}>{t}</button>)}</div></Section>
            <Section label="Color Palette"><PaletteSelector selected={data.palette} customPalette={data.customPalette} onSelectPreset={v=>upd(activeRoom,"palette",v)} onSetCustom={v=>upd(activeRoom,"customPalette",v)}/></Section>
          </div>
          <div>
            <Section label="Vision — How Should This Room Feel?"><textarea value={data.vision} onChange={e=>upd(activeRoom,"vision",e.target.value)} placeholder="The first thing someone notices when they walk in is..." rows={4} style={{width:"100%",padding:"14px",border:`1px solid ${C.border}`,fontFamily:fonts.mono,fontSize:"13px",background:C.warmBg,resize:"vertical",lineHeight:1.6,color:C.dark,boxSizing:"border-box"}}/></Section>
            <Section label="Practical Notes"><textarea value={data.notes} onChange={e=>upd(activeRoom,"notes",e.target.value)} placeholder="Measurements, constraints, links to inspiration..." rows={3} style={{width:"100%",padding:"14px",border:`1px solid ${C.border}`,fontFamily:fonts.mono,fontSize:"13px",background:C.warmBg,resize:"vertical",lineHeight:1.6,color:C.dark,boxSizing:"border-box"}}/></Section>
            <Section label="Furniture & Pieces"><FurnitureList items={data.furniture} onToggle={i=>togF(activeRoom,i)} onRemove={i=>rmF(activeRoom,i)} onAdd={n=>addF(activeRoom,n)}/></Section>
          </div>
        </div>}

        {detailTab==="layout"&&<div>
          <p style={{fontFamily:fonts.mono,fontSize:"12px",color:C.muted,marginBottom:"16px"}}>Drag furniture to arrange. Grid = 1 ft. Click ↻ to rotate, × to remove. All pieces are to scale.</p>
          <RoomLayout room={room} layouts={layouts} onLayoutsChange={setLayouts}/>
        </div>}

        {detailTab==="photos"&&<div>
          <p style={{fontFamily:fonts.mono,fontSize:"12px",color:C.muted,marginBottom:"16px"}}>Upload listing photos or design inspiration for this room.</p>
          <PhotoManager roomId={room.id} photos={photos} onPhotosChange={setPhotos}/>
        </div>}
      </div>}

      {view==="overview"&&<div style={{animation:"fi 0.3s ease forwards"}}>
        <h2 style={{fontFamily:fonts.display,fontSize:"24px",fontWeight:700,marginBottom:"24px"}}>Project Overview</h2>
        <div className="sg" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"32px"}}>{PRIORITIES.map(p=>{const c=Object.values(roomData).filter(r=>r.priority===p).length;return<div key={p} style={{background:C.surface,border:`2px solid ${PRIORITY_COLORS[p]}`,padding:"20px",textAlign:"center"}}><div style={{fontFamily:fonts.display,fontSize:"36px",fontWeight:700,color:PRIORITY_COLORS[p]}}>{c}</div><div style={{fontFamily:fonts.mono,fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted,marginTop:"4px"}}>{p}</div></div>})}</div>
        <div style={{background:C.surface,border:`1px solid ${C.dark}`,marginBottom:"28px"}}>
          <div className="oh" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"12px 16px",background:C.dark,color:C.bg,fontFamily:fonts.mono,fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase"}}><div>Room</div><div>Dims</div><div>Theme</div><div>Palette</div><div>Status</div></div>
          {Object.entries(ROOMS).map(([floor,rooms])=><div key={floor}>
            <div style={{padding:"8px 16px",background:C.warmBg,fontFamily:fonts.mono,fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",fontWeight:500}}>{floor}</div>
            {rooms.map(r=>{const rd=roomData[r.id];const pal=rd?.palette?MCM_PALETTES[rd.palette]:rd?.customPalette;return<div key={r.id} className="otr" onClick={()=>{setActiveRoom(r.id);setView("detail");setDetailTab("design")}} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",padding:"10px 16px",borderBottom:`1px solid ${C.warmBg}`,cursor:"pointer",fontFamily:fonts.mono,fontSize:"12px",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background=C.warmBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{fontWeight:500}}>{r.icon} {r.name}</div><div style={{color:C.muted,fontSize:"11px"}}>{r.dims}</div><div style={{fontSize:"11px"}}>{rd?.theme||"—"}</div>
              <div>{pal?<div style={{display:"flex",gap:"2px"}}>{[pal.primary,pal.secondary,pal.accent].map((c,i)=><div key={i} style={{width:"14px",height:"8px",background:c,border:"1px solid rgba(0,0,0,0.06)"}}/>)}</div>:<span style={{color:C.muted}}>—</span>}</div>
              <div><Badge color={PRIORITY_COLORS[rd?.priority||"Not Started"]} filled={rd?.priority!=="Not Started"}>{rd?.priority||"Not Started"}</Badge></div>
            </div>})}
          </div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>{[{l:"Owned Pieces",f:f=>f.owned,c:C.teal},{l:"Shopping List",f:f=>!f.owned,c:C.accent}].map(({l,f,c})=><div key={l} style={{background:C.surface,border:`2px solid ${c}`,padding:"20px"}}><div style={{fontFamily:fonts.mono,fontSize:"10px",letterSpacing:"1.5px",color:c,textTransform:"uppercase",marginBottom:"12px"}}>{l}</div>{Object.values(ROOMS).flat().map(r=>{const items=roomData[r.id]?.furniture.filter(f)||[];if(!items.length)return null;return<div key={r.id} style={{marginBottom:"8px"}}><span style={{fontFamily:fonts.mono,fontSize:"12px",fontWeight:500}}>{r.name}: </span><span style={{fontFamily:fonts.mono,fontSize:"12px",color:C.muted}}>{items.map(x=>x.name).join(", ")}</span></div>})}</div>)}</div>
        <div style={{marginTop:"40px",textAlign:"center"}}><button onClick={()=>{if(confirm("Reset all data? Cannot be undone.")){setRoomData(initRD());setPhotos({});setLayouts({})}}} style={{fontFamily:fonts.mono,fontSize:"11px",letterSpacing:"1px",padding:"8px 20px",cursor:"pointer",background:"transparent",color:C.muted,border:`1px solid ${C.border}`}}>Reset All Data</button></div>
      </div>}
    </main>

    <footer style={{textAlign:"center",padding:"32px 28px",fontFamily:fonts.mono,fontSize:"10px",color:C.muted,letterSpacing:"2px"}}>◈ AAKESH & ASHTON · MCM DREAM · 2026 ◈</footer>
  </div>;
}
