import { useState, useEffect, useCallback, useRef } from "react";
import { ROOMS, ROOM_OBSERVATIONS, ROOM_FEATURES, FURNITURE_PRESETS, ACTION_PLAN, MCM_PALETTES, FURNITURE_PIECES, DESIGN_THEMES, PRIORITIES, PRIORITY_COLORS } from "./roomData.js";

function hexToHSL(hex){let r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h,s,l=(max+min)/2;if(max===min){h=s=0}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break}}return[h*360,s*100,l*100]}
function hslToHex(h,s,l){h/=360;s/=100;l/=100;let r,g,b;if(s===0){r=g=b=l}else{const q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;const f=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p};r=f(p,q,h+1/3);g=f(p,q,h);b=f(p,q,h-1/3)}return"#"+[r,g,b].map(x=>Math.round(x*255).toString(16).padStart(2,"0")).join("")}
function genPalette(hex){const[h,s,l]=hexToHSL(hex);return{primary:hex,secondary:hslToHex(h,Math.max(s-25,10),Math.min(l+30,90)),accent:hslToHex((h+150)%360,Math.min(s+10,80),Math.max(l-10,30)),bg:hslToHex(h,Math.max(s-40,5),Math.min(l+40,97)),muted:hslToHex(h,Math.max(s-30,8),Math.min(l+25,88))}}

const SK="mcm-v3",PK="mcm-photos-v2",LK="mcm-layouts-v2";
const F={display:"'Playfair Display',Georgia,serif",mono:"'DM Mono','Courier New',monospace"};
const C={bg:"#F6F1EA",surface:"#FFFFFF",dark:"#2A1F17",accent:"#B8621B",teal:"#1A6B6B",border:"#D8CCBC",muted:"#9A8B7A",warmBg:"#F0E8DD"};

function usePS(key,init){const[s,setS]=useState(()=>{try{const v=localStorage.getItem(key);if(v)return JSON.parse(v)}catch(e){}return typeof init==="function"?init():init});useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(s))}catch(e){}},[key,s]);return[s,setS]}
function initRD(){const o={};Object.values(ROOMS).flat().forEach(r=>{const obs=ROOM_OBSERVATIONS[r.id];o[r.id]={palette:null,customPalette:null,theme:null,priority:obs?.priority||"Not Started",notes:"",furniture:(FURNITURE_PRESETS[r.id]||[]).map(f=>({name:f,owned:f.includes("\u2726"),notes:""})),vision:""}});return o}

const Badge=({children,color=C.muted,filled})=><span style={{display:"inline-block",padding:"3px 10px",fontSize:"10px",fontFamily:F.mono,letterSpacing:"1.5px",textTransform:"uppercase",color:filled?"#FFF":color,background:filled?color:"transparent",border:`1px solid ${color}`,lineHeight:"1.6"}}>{children}</span>;
const Sec=({label,children})=><div style={{marginBottom:"22px"}}><label style={{display:"block",fontFamily:F.mono,fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:C.muted,marginBottom:"10px"}}>{label}</label>{children}</div>;
const Btn=({active,onClick,children,color=C.dark,activeBg})=><button onClick={onClick} style={{fontFamily:F.mono,fontSize:"11px",letterSpacing:"1px",padding:"7px 14px",cursor:"pointer",background:active?(activeBg||color):"transparent",color:active?"#FFF":color,border:`1px solid ${color}`,transition:"all 0.15s"}}>{children}</button>;

function RoomCard({room,data,onClick,index,photoUrl}){
  const pal=data.palette?MCM_PALETTES[data.palette]:data.customPalette;
  const has=data.theme||data.palette||data.customPalette||data.vision;
  const obs=ROOM_OBSERVATIONS[room.id];
  return <div onClick={onClick} style={{background:C.surface,border:`1px solid ${has?(pal?.primary||C.accent):C.border}`,cursor:"pointer",transition:"all 0.25s ease",overflow:"hidden",opacity:0,animation:`fi 0.4s ease ${index*0.04}s forwards`}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(42,31,23,0.1)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>
    {photoUrl&&<div style={{height:"100px",overflow:"hidden",borderBottom:`1px solid ${C.border}`}}><img src={photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}
    <div style={{padding:"18px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
        <span style={{fontFamily:F.display,fontSize:"20px",color:pal?.primary||C.dark}}>{room.icon}</span>
        <div style={{width:"8px",height:"8px",borderRadius:"50%",background:PRIORITY_COLORS[data.priority]}}/>
      </div>
      <h3 style={{fontFamily:F.display,fontSize:"16px",fontWeight:700,color:C.dark,margin:"0 0 4px"}}>{room.name}</h3>
      <p style={{fontFamily:F.mono,fontSize:"11px",color:C.muted,margin:"0 0 8px"}}>{room.dims} \u00b7 {room.sqft} sq ft</p>
      {obs&&<p style={{fontFamily:F.mono,fontSize:"10px",color:C.muted,margin:"0 0 10px",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{obs.summary}</p>}
      {pal&&<div style={{display:"flex",gap:"3px",marginBottom:"8px"}}>{[pal.primary,pal.secondary,pal.accent,pal.muted].map((c,i)=><div key={i} style={{width:"18px",height:"10px",background:c,border:"1px solid rgba(0,0,0,0.06)"}}/>)}</div>}
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}><Badge color={PRIORITY_COLORS[data.priority]} filled={data.priority!=="Not Started"}>{data.priority}</Badge>{data.theme&&<Badge color={C.teal}>{data.theme}</Badge>}</div>
    </div>
  </div>;
}

function ObservationsPanel({roomId}){
  const obs=ROOM_OBSERVATIONS[roomId];
  if(!obs)return<p style={{fontFamily:F.mono,fontSize:"12px",color:C.muted}}>No observations yet. Assess in person after move-in.</p>;
  return<div>
    <p style={{fontFamily:F.mono,fontSize:"13px",lineHeight:1.7,marginBottom:"16px"}}>{obs.summary}</p>
    {obs.whatsGood.length>0&&<div style={{marginBottom:"14px"}}><div style={{fontFamily:F.mono,fontSize:"10px",letterSpacing:"1.5px",color:C.teal,marginBottom:"6px"}}>WHAT WORKS</div>{obs.whatsGood.map((item,i)=><div key={i} style={{fontFamily:F.mono,fontSize:"12px",lineHeight:1.6,paddingLeft:"12px",borderLeft:`2px solid ${C.teal}22`,marginBottom:"4px"}}>{item}</div>)}</div>}
    {obs.whatsDateOr?.length>0&&<div style={{marginBottom:"14px"}}><div style={{fontFamily:F.mono,fontSize:"10px",letterSpacing:"1.5px",color:C.accent,marginBottom:"6px"}}>WHAT'S DATED</div>{obs.whatsDateOr.map((item,i)=><div key={i} style={{fontFamily:F.mono,fontSize:"12px",lineHeight:1.6,paddingLeft:"12px",borderLeft:`2px solid ${C.accent}22`,marginBottom:"4px"}}>{item}</div>)}</div>}
    <div style={{padding:"14px",background:C.warmBg,border:`1px solid ${C.border}`,marginBottom:"14px"}}><div style={{fontFamily:F.mono,fontSize:"10px",letterSpacing:"1.5px",fontWeight:500,marginBottom:"6px"}}>VERDICT</div><p style={{fontFamily:F.mono,fontSize:"12px",lineHeight:1.6,margin:0}}>{obs.verdict}</p></div>
    {obs.suggestedPalettes?.length>0&&<div><div style={{fontFamily:F.mono,fontSize:"10px",letterSpacing:"1.5px",color:C.muted,marginBottom:"6px"}}>RECOMMENDED PALETTES</div><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{obs.suggestedPalettes.map(name=>{const p=MCM_PALETTES[name];return p?<div key={name} style={{display:"flex",alignItems:"center",gap:"6px",padding:"4px 10px",border:`1px solid ${C.border}`,background:C.surface}}><div style={{display:"flex",gap:"2px"}}>{[p.primary,p.accent,p.secondary].map((c,i)=><div key={i} style={{width:"12px",height:"12px",background:c}}/>)}</div><span style={{fontFamily:F.mono,fontSize:"10px"}}>{name}</span></div>:null})}</div></div>}
  </div>;
}

function PaletteSel({selected,customPalette,onPre,onCust,roomId}){
  const[mode,setMode]=useState("presets");const[cc,setCc]=useState("#8B6914");const[search,setSearch]=useState("");
  const obs=ROOM_OBSERVATIONS[roomId];const suggested=obs?.suggestedPalettes||[];
  const entries=Object.entries(MCM_PALETTES);
  const sorted=[...entries].sort((a,b)=>{const aS=suggested.includes(a[0])?0:1,bS=suggested.includes(b[0])?0:1;return aS-bS});
  const filtered=sorted.filter(([n])=>n.toLowerCase().includes(search.toLowerCase()));
  return<div>
    <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}><Btn active={mode==="presets"} onClick={()=>setMode("presets")}>Presets ({entries.length})</Btn><Btn active={mode==="custom"} onClick={()=>setMode("custom")}>Custom</Btn></div>
    {mode==="presets"?<div>
      <input type="text" placeholder="Filter palettes..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",padding:"8px 12px",marginBottom:"10px",border:`1px solid ${C.border}`,fontFamily:F.mono,fontSize:"11px",background:C.warmBg,outline:"none",boxSizing:"border-box"}}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",maxHeight:"320px",overflowY:"auto"}}>{filtered.map(([name,pal])=>{const a=selected===name;const isSugg=suggested.includes(name);return<div key={name} onClick={()=>{onPre(a?null:name);onCust(null)}} style={{border:a?`2px solid ${pal.primary}`:`1px solid ${isSugg?pal.primary+"66":C.border}`,padding:"10px",cursor:"pointer",background:a?pal.bg:C.surface,position:"relative"}}>
        {isSugg&&<div style={{position:"absolute",top:"4px",right:"6px",fontFamily:F.mono,fontSize:"8px",color:pal.primary,letterSpacing:"1px"}}>{"\u2605"} REC</div>}
        <div style={{display:"flex",gap:"3px",marginBottom:"6px"}}>{[pal.primary,pal.secondary,pal.accent,pal.bg,pal.muted].map((c,i)=><div key={i} style={{flex:1,height:"16px",background:c,border:"1px solid rgba(0,0,0,0.06)"}}/>)}</div>
        <div style={{fontFamily:F.mono,fontSize:"10px",color:a?pal.primary:C.dark}}>{name}</div>
      </div>})}</div>
    </div>:<div>
      <p style={{fontFamily:F.mono,fontSize:"11px",color:C.muted,marginBottom:"12px"}}>Pick an anchor color. Accent and trim auto-generate.</p>
      <div style={{display:"flex",gap:"12px",alignItems:"flex-start",marginBottom:"16px"}}>
        <div><input type="color" value={cc} onChange={e=>setCc(e.target.value)} style={{width:"60px",height:"60px",border:"none",cursor:"pointer",padding:0,background:"none"}}/><div style={{fontFamily:F.mono,fontSize:"10px",color:C.muted,marginTop:"4px",textAlign:"center"}}>{cc}</div></div>
        <div style={{flex:1}}>{(()=>{const p=genPalette(cc);return<div>
          <div style={{display:"flex",gap:"4px",marginBottom:"8px"}}>{Object.entries(p).map(([role,c])=><div key={role} style={{flex:1,textAlign:"center"}}><div style={{height:"32px",background:c,border:"1px solid rgba(0,0,0,0.06)",marginBottom:"4px"}}/><div style={{fontFamily:F.mono,fontSize:"9px",color:C.muted,textTransform:"uppercase"}}>{role}</div></div>)}</div>
          <button onClick={()=>{onCust(p);onPre(null)}} style={{fontFamily:F.mono,fontSize:"10px",letterSpacing:"1px",padding:"8px 16px",cursor:"pointer",background:cc,color:"#FFF",border:"none",width:"100%"}}>Apply This Palette</button>
        </div>})()}</div>
      </div>
      {customPalette&&<div style={{padding:"10px",border:`2px solid ${customPalette.primary}`,background:customPalette.bg,fontFamily:F.mono,fontSize:"10px"}}><span style={{color:customPalette.primary}}>{"\u2713"} Custom palette active</span><button onClick={()=>onCust(null)} style={{float:"right",background:"none",border:"none",cursor:"pointer",fontFamily:F.mono,color:C.muted}}>clear</button></div>}
    </div>}
  </div>;
}

function Photos({roomId,photos,onChange}){
  const ref=useRef(null);
  const add=(e)=>{Array.from(e.target.files).forEach(file=>{const r=new FileReader();r.onload=(ev)=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");const M=800;let w=img.width,h=img.height;if(w>M||h>M){if(w>h){h=h*M/w;w=M}else{w=w*M/h;h=M}}c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);const d=c.toDataURL("image/jpeg",0.7);onChange({...photos,[roomId]:[...(photos[roomId]||[]),d]})};img.src=ev.target.result};r.readAsDataURL(file)});e.target.value=""};
  const rm=(i)=>onChange({...photos,[roomId]:(photos[roomId]||[]).filter((_,j)=>j!==i)});
  return<div>
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"10px"}}>
      {(photos[roomId]||[]).map((url,i)=><div key={i} style={{position:"relative",width:"140px",height:"95px"}}><img src={url} alt="" style={{width:"100%",height:"100%",objectFit:"cover",border:`1px solid ${C.border}`}}/><button onClick={()=>rm(i)} style={{position:"absolute",top:"2px",right:"2px",background:"rgba(0,0,0,0.6)",color:"#FFF",border:"none",cursor:"pointer",width:"18px",height:"18px",fontSize:"11px",padding:0}}>{"\u00d7"}</button></div>)}
      <div onClick={()=>ref.current?.click()} style={{width:"140px",height:"95px",border:`2px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.muted,fontFamily:F.mono,fontSize:"11px"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>+ Add Photo</div>
    </div>
    <input ref={ref} type="file" accept="image/*" multiple onChange={add} style={{display:"none"}}/>
  </div>;
}

function FurnList({items,onToggle,onRemove,onAdd}){
  const[n,setN]=useState("");
  return<div style={{background:C.surface,border:`1px solid ${C.border}`,padding:"16px"}}>
    {items.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:i<items.length-1?`1px solid ${C.warmBg}`:"none"}}>
      <div onClick={()=>onToggle(i)} style={{width:"18px",height:"18px",border:`2px solid ${f.owned?C.teal:C.border}`,background:f.owned?C.teal:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{f.owned&&<span style={{color:"#FFF",fontSize:"12px"}}>{"\u2713"}</span>}</div>
      <span style={{flex:1,fontFamily:F.mono,fontSize:"13px",textDecoration:f.owned?"line-through":"none",opacity:f.owned?0.45:1}}>{f.name}</span>
      <Badge color={f.owned?C.teal:C.accent} filled>{f.owned?"owned":"need"}</Badge>
      <span onClick={()=>onRemove(i)} style={{cursor:"pointer",color:C.muted,fontSize:"16px"}}>{"\u00d7"}</span>
    </div>)}
    <div style={{marginTop:"12px",display:"flex",gap:"8px"}}><input type="text" value={n} onChange={e=>setN(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&n.trim()){onAdd(n);setN("")}}} placeholder="Add a piece \u2014 Enter" style={{flex:1,padding:"10px 12px",border:`1px solid ${C.border}`,fontFamily:F.mono,fontSize:"12px",background:C.warmBg,outline:"none"}}/></div>
  </div>;
}

function Layout({room,layouts,onLayout}){
  const ref=useRef(null);const[pieces,setPR]=useState(()=>layouts[room.id]||[]);const[drag,setDrag]=useState(null);const[off,setOff]=useState({x:0,y:0});const[adding,setAdding]=useState(false);
  const setP=(v)=>{const val=typeof v==="function"?v(pieces):v;setPR(val);onLayout({...layouts,[room.id]:val})};
  const S=2,rW=room.w*S,rH=room.h*S;
  const features=ROOM_FEATURES[room.id]||[];
  const addPc=(name)=>{const fp=FURNITURE_PIECES[name];if(!fp)return;setP(p=>[...p,{name,x:20,y:20,w:fp.w*S,h:fp.h*S,color:fp.color,label:fp.label}]);setAdding(false)};
  const rot=(i)=>setP(p=>p.map((x,j)=>j===i?{...x,w:x.h,h:x.w}:x));
  const rm=(i)=>setP(p=>p.filter((_,j)=>j!==i));
  const md=(e,i)=>{e.stopPropagation();const r=ref.current.getBoundingClientRect();setDrag(i);setOff({x:e.clientX-r.left-pieces[i].x,y:e.clientY-r.top-pieces[i].y})};
  const mm=(e)=>{if(drag===null)return;const r=ref.current.getBoundingClientRect();setPR(p=>p.map((v,i)=>i===drag?{...v,x:Math.max(0,Math.min(rW-v.w,e.clientX-r.left-off.x)),y:Math.max(0,Math.min(rH-v.h,e.clientY-r.top-off.y))}:v))};
  const mu=()=>{if(drag!==null)onLayout({...layouts,[room.id]:pieces});setDrag(null)};
  const ts=(e,i)=>{e.stopPropagation();const t=e.touches[0],r=ref.current.getBoundingClientRect();setDrag(i);setOff({x:t.clientX-r.left-pieces[i].x,y:t.clientY-r.top-pieces[i].y})};
  const tmv=(e)=>{if(drag===null)return;e.preventDefault();const t=e.touches[0],r=ref.current.getBoundingClientRect();setPR(p=>p.map((v,i)=>i===drag?{...v,x:Math.max(0,Math.min(rW-v.w,t.clientX-r.left-off.x)),y:Math.max(0,Math.min(rH-v.h,t.clientY-r.top-off.y))}:v))};
  const te=()=>{if(drag!==null)onLayout({...layouts,[room.id]:pieces});setDrag(null)};
  const cats={Seating:['Sofa (84")','Sectional L','Ball Chair','Accent Chair','MCM Chaise','Daybed','Office Chair','Dining Chair'],Tables:['Coffee Table','Dining Table (96")','Prep Table','Bar Cart','Console Table','Bench'],Storage:['Credenza (72")','Bookshelf','Entertainment Center','Dresser','Nightstand','Bar Cabinet'],Beds:['King Bed','Queen Bed','Murphy Bed (Q)'],Desks:['L-Desk (72")','Desk (60")','Desk (48")'],Other:['Floor Lamp','Arc Lamp','Area Rug (8\u00d710)','Cat Tree','Litter-Robot','Blackstone 36"','Bar Stool']};
  return<div>
    <div style={{marginBottom:"16px",overflowX:"auto"}}>
      <div ref={ref} onMouseMove={mm} onMouseUp={mu} onMouseLeave={mu} onTouchMove={tmv} onTouchEnd={te} style={{width:rW,height:rH,background:"#FBF8F4",border:`3px solid ${C.dark}`,position:"relative",cursor:drag!==null?"grabbing":"default",touchAction:"none",backgroundImage:"linear-gradient(rgba(0,0,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.03) 1px,transparent 1px)",backgroundSize:`${S*12}px ${S*12}px`}}>
        {features.map((f,i)=><div key={`f${i}`} style={{position:"absolute",left:`${f.x}%`,top:`${f.y}%`,width:`${f.w}%`,height:`${f.h}%`,background:f.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"7px",fontFamily:F.mono,color:f.type==="fireplace"?"#FFF":C.muted,pointerEvents:"none",zIndex:0,border:f.type==="fireplace"?`1px solid #8B7355`:f.type==="window"?"1px dashed #87CEEB":"none"}}>{f.label}</div>)}
        <div style={{position:"absolute",bottom:"4px",right:"8px",fontFamily:F.mono,fontSize:"9px",color:C.muted,pointerEvents:"none"}}>{room.dims} \u2014 grid = 1ft</div>
        {pieces.map((p,i)=><div key={i} onMouseDown={e=>md(e,i)} onTouchStart={e=>ts(e,i)} style={{position:"absolute",left:p.x,top:p.y,width:p.w,height:p.h,background:p.color,border:drag===i?"2px solid #FFF":"1px solid rgba(255,255,255,0.4)",boxShadow:drag===i?"0 2px 8px rgba(0,0,0,0.3)":"0 1px 3px rgba(0,0,0,0.15)",cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.min(p.w,p.h)<30?"7px":"9px",fontFamily:F.mono,color:"#FFF",userSelect:"none",zIndex:drag===i?10:1,opacity:p.color.includes("rgba")?1:0.85}}>{p.label}</div>)}
      </div>
    </div>
    {pieces.length>0&&<div style={{marginBottom:"12px",display:"flex",gap:"6px",flexWrap:"wrap"}}>{pieces.map((p,i)=><div key={i} style={{display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 8px",background:C.warmBg,border:`1px solid ${C.border}`,fontFamily:F.mono,fontSize:"10px"}}><span style={{width:"8px",height:"8px",background:p.color,display:"inline-block"}}/>{p.name}<button onClick={()=>rot(i)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"12px",padding:"0 2px",color:C.muted}}>{"\u21bb"}</button><button onClick={()=>rm(i)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"12px",padding:"0 2px",color:C.muted}}>{"\u00d7"}</button></div>)}</div>}
    {adding?<div style={{background:C.surface,border:`1px solid ${C.border}`,padding:"12px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><span style={{fontFamily:F.mono,fontSize:"11px",fontWeight:500}}>Add Furniture</span><span onClick={()=>setAdding(false)} style={{cursor:"pointer",color:C.muted,fontFamily:F.mono}}>close</span></div>
      {Object.entries(cats).map(([cat,items])=><div key={cat} style={{marginBottom:"8px"}}><div style={{fontFamily:F.mono,fontSize:"9px",letterSpacing:"1.5px",color:C.muted,textTransform:"uppercase",marginBottom:"4px"}}>{cat}</div><div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>{items.map(name=><button key={name} onClick={()=>addPc(name)} style={{fontFamily:F.mono,fontSize:"10px",padding:"4px 8px",background:C.warmBg,border:`1px solid ${C.border}`,cursor:"pointer",color:C.dark}}>{name}</button>)}</div></div>)}
    </div>:<button onClick={()=>setAdding(true)} style={{fontFamily:F.mono,fontSize:"11px",letterSpacing:"1px",padding:"8px 16px",cursor:"pointer",background:"transparent",color:C.accent,border:`1px solid ${C.accent}`,width:"100%"}}>+ Add Furniture to Layout</button>}
  </div>;
}

function ActionPlanView(){
  const[checked,setChecked]=usePS("mcm-actions-v1",{});
  const toggle=(w,i)=>{const k=`${w}-${i}`;setChecked(p=>({...p,[k]:!p[k]}))};
  const total=ACTION_PLAN.reduce((s,w)=>s+w.items.length,0);
  const done=Object.values(checked).filter(Boolean).length;
  return<div style={{animation:"fi 0.3s ease forwards"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}><h2 style={{fontFamily:F.display,fontSize:"24px",fontWeight:700,margin:0}}>First 30 Days</h2><span style={{fontFamily:F.mono,fontSize:"12px",color:C.muted}}>{done}/{total} complete</span></div>
    {ACTION_PLAN.map((week,wi)=><div key={wi} style={{marginBottom:"24px"}}>
      <h3 style={{fontFamily:F.mono,fontSize:"13px",fontWeight:500,letterSpacing:"1px",marginBottom:"12px",paddingBottom:"8px",borderBottom:`2px solid ${C.accent}`}}>{week.week}</h3>
      {week.items.map((item,ii)=>{const k=`${wi}-${ii}`;const isDone=checked[k];return<div key={ii} style={{display:"flex",alignItems:"flex-start",gap:"10px",padding:"8px 0",borderBottom:`1px solid ${C.warmBg}`}}>
        <div onClick={()=>toggle(wi,ii)} style={{width:"18px",height:"18px",border:`2px solid ${isDone?C.teal:C.border}`,background:isDone?C.teal:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:"2px"}}>{isDone&&<span style={{color:"#FFF",fontSize:"12px"}}>{"\u2713"}</span>}</div>
        <div style={{flex:1}}><span style={{fontFamily:F.mono,fontSize:"13px",textDecoration:isDone?"line-through":"none",opacity:isDone?0.5:1}}>{item.task}</span>
          {item.room&&<span style={{fontFamily:F.mono,fontSize:"10px",color:C.muted,marginLeft:"8px"}}>{"\u2014"} {Object.values(ROOMS).flat().find(r=>r.id===item.room)?.name}</span>}</div>
        <Badge color={item.priority==="high"?C.accent:item.priority==="medium"?C.muted:"#BBB"} filled={item.priority==="high"}>{item.priority}</Badge>
      </div>})}
    </div>)}
  </div>;
}

export default function App(){
  const[rd,setRD]=usePS(SK,initRD);const[photos,setPhotos]=usePS(PK,{});const[layouts,setLayouts]=usePS(LK,{});
  const[ar,setAR]=useState(null);const[af,setAF]=useState(Object.keys(ROOMS)[0]);const[view,setView]=useState("rooms");const[dt,setDT]=useState("observe");

  useEffect(()=>{const ids=Object.values(ROOMS).flat().map(r=>r.id);const miss=ids.filter(id=>!rd[id]);if(miss.length){const f=initRD();setRD(p=>{const m={...p};miss.forEach(id=>{m[id]=f[id]});return m})}},[]);

  const upd=useCallback((id,f,v)=>setRD(p=>({...p,[id]:{...p[id],[f]:v}})),[setRD]);
  const addF=useCallback((id,n)=>setRD(p=>({...p,[id]:{...p[id],furniture:[...p[id].furniture,{name:n.trim(),owned:false,notes:""}]}})),[setRD]);
  const togF=useCallback((id,i)=>setRD(p=>{const f=[...p[id].furniture];f[i]={...f[i],owned:!f[i].owned};return{...p,[id]:{...p[id],furniture:f}}}),[setRD]);
  const rmF=useCallback((id,i)=>setRD(p=>({...p,[id]:{...p[id],furniture:p[id].furniture.filter((_,j)=>j!==i)}})),[setRD]);

  const room=ar?Object.values(ROOMS).flat().find(r=>r.id===ar):null;
  const data=ar?rd[ar]:null;
  const tot=Object.values(ROOMS).flat().length;
  const done=Object.values(rd).filter(r=>r.priority==="Complete").length;
  const started=Object.values(rd).filter(r=>r.priority!=="Not Started").length;

  return<div style={{minHeight:"100vh",background:C.bg,color:C.dark}}>
    <style>{`@keyframes fi{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}textarea:focus,input:focus{outline:none;border-color:${C.accent}!important}::selection{background:${C.accent}22}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}@media(max-width:768px){.dg{grid-template-columns:1fr!important}.rg{grid-template-columns:1fr!important}.sg{grid-template-columns:1fr 1fr!important}}`}</style>

    <header style={{background:C.dark,color:C.bg,padding:"20px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px",borderBottom:`3px solid ${C.accent}`}}>
      <div><h1 style={{fontFamily:F.display,fontSize:"22px",fontWeight:700,margin:0}}><span style={{color:C.accent}}>{"\u25c8"}</span> MCM Dream</h1><p style={{fontFamily:F.mono,fontSize:"11px",opacity:0.5,letterSpacing:"1.5px",margin:"2px 0 0"}}>3,129 SQ FT {"\u00b7"} MID-CENTURY MODERN</p></div>
      <div style={{display:"flex",gap:"6px"}}>{["rooms","plan","overview"].map(k=><button key={k} onClick={()=>{setView(k);setAR(null)}} style={{fontFamily:F.mono,fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",padding:"8px 16px",cursor:"pointer",background:view===k||(view==="detail"&&k==="rooms")?C.accent:"transparent",color:C.bg,border:`1px solid ${C.accent}`}}>{k==="plan"?"30-Day Plan":k.charAt(0).toUpperCase()+k.slice(1)}</button>)}</div>
    </header>

    <div style={{padding:"14px 28px",background:C.warmBg,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:"16px"}}>
      <div style={{flex:1}}><div style={{height:"5px",background:C.border,borderRadius:"3px",overflow:"hidden"}}><div style={{height:"100%",width:`${(done/tot)*100}%`,background:`linear-gradient(90deg,${C.accent},${C.teal})`,borderRadius:"3px",transition:"width 0.6s"}}/></div></div>
      <span style={{fontFamily:F.mono,fontSize:"11px",color:C.muted,letterSpacing:"1px",whiteSpace:"nowrap"}}>{started} started {"\u00b7"} {done} complete {"\u00b7"} {tot} total</span>
    </div>

    <main style={{padding:"28px",maxWidth:"1200px",margin:"0 auto"}}>
      {view==="rooms"&&!ar&&<div>
        <div style={{display:"flex",gap:"0",marginBottom:"28px"}}>{Object.keys(ROOMS).map(f=><button key={f} onClick={()=>setAF(f)} style={{fontFamily:F.mono,fontSize:"12px",letterSpacing:"1px",padding:"12px 20px",cursor:"pointer",background:af===f?C.dark:"transparent",color:af===f?C.bg:C.dark,border:`1.5px solid ${C.dark}`}}>{f}</button>)}</div>
        <div className="rg" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"14px"}}>{ROOMS[af].map((r,i)=><RoomCard key={r.id} room={r} data={rd[r.id]} index={i} photoUrl={(photos[r.id]||[])[0]} onClick={()=>{setAR(r.id);setView("detail");setDT("observe")}}/>)}</div>
      </div>}

      {view==="detail"&&room&&data&&<div style={{animation:"fi 0.3s ease forwards"}}>
        <button onClick={()=>{setAR(null);setView("rooms")}} style={{background:"none",border:"none",cursor:"pointer",fontFamily:F.mono,fontSize:"12px",color:C.accent,padding:"0 0 20px",letterSpacing:"1px"}}>{"\u2190"} back to rooms</button>
        <div style={{background:(()=>{const p=data.palette?MCM_PALETTES[data.palette]:data.customPalette;return p?p.bg:C.surface})(),border:`2px solid ${(()=>{const p=data.palette?MCM_PALETTES[data.palette]:data.customPalette;return p?p.primary:C.dark})()}`,padding:"28px",marginBottom:"20px"}}>
          <span style={{fontFamily:F.display,fontSize:"28px"}}>{room.icon}</span>
          <h2 style={{fontFamily:F.display,fontSize:"28px",fontWeight:700,margin:"8px 0 6px"}}>{room.name}</h2>
          <p style={{fontFamily:F.mono,fontSize:"13px",color:C.muted,margin:0}}>{room.dims} {"\u00b7"} {room.sqft} sq ft {"\u00b7"} Floor {room.floor}</p>
        </div>
        <div style={{display:"flex",gap:"0",marginBottom:"24px",flexWrap:"wrap"}}>{[{k:"observe",l:"Observations"},{k:"design",l:"Design"},{k:"layout",l:"2D Layout"},{k:"photos",l:`Photos${(photos[room.id]?.length)?` (${photos[room.id].length})`:""}` }].map(({k,l})=><button key={k} onClick={()=>setDT(k)} style={{fontFamily:F.mono,fontSize:"11px",letterSpacing:"1px",padding:"10px 16px",cursor:"pointer",background:dt===k?C.dark:"transparent",color:dt===k?C.bg:C.dark,border:`1.5px solid ${C.dark}`}}>{l}</button>)}</div>

        {dt==="observe"&&<ObservationsPanel roomId={room.id}/>}

        {dt==="design"&&<div className="dg" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px"}}>
          <div>
            <Sec label="Status"><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{PRIORITIES.map(p=><Btn key={p} active={data.priority===p} onClick={()=>upd(ar,"priority",p)} color={PRIORITY_COLORS[p]} activeBg={PRIORITY_COLORS[p]}>{p}</Btn>)}</div></Sec>
            <Sec label="Design Theme"><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{DESIGN_THEMES.map(t=><Btn key={t} active={data.theme===t} onClick={()=>upd(ar,"theme",data.theme===t?null:t)}>{t}</Btn>)}</div></Sec>
            <Sec label="Color Palette"><PaletteSel selected={data.palette} customPalette={data.customPalette} onPre={v=>upd(ar,"palette",v)} onCust={v=>upd(ar,"customPalette",v)} roomId={room.id}/></Sec>
          </div>
          <div>
            <Sec label="Vision"><textarea value={data.vision} onChange={e=>upd(ar,"vision",e.target.value)} placeholder="How should this room feel?" rows={4} style={{width:"100%",padding:"14px",border:`1px solid ${C.border}`,fontFamily:F.mono,fontSize:"13px",background:C.warmBg,resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}}/></Sec>
            <Sec label="Notes"><textarea value={data.notes} onChange={e=>upd(ar,"notes",e.target.value)} placeholder="Measurements, constraints, links..." rows={3} style={{width:"100%",padding:"14px",border:`1px solid ${C.border}`,fontFamily:F.mono,fontSize:"13px",background:C.warmBg,resize:"vertical",lineHeight:1.6,boxSizing:"border-box"}}/></Sec>
            <Sec label="Furniture"><FurnList items={data.furniture} onToggle={i=>togF(ar,i)} onRemove={i=>rmF(ar,i)} onAdd={n=>addF(ar,n)}/></Sec>
          </div>
        </div>}

        {dt==="layout"&&<div><p style={{fontFamily:F.mono,fontSize:"12px",color:C.muted,marginBottom:"16px"}}>Drag furniture to arrange. Shaded areas = fixed features (fireplace, windows, doors). Grid = 1 ft.</p><Layout room={room} layouts={layouts} onLayout={setLayouts}/></div>}
        {dt==="photos"&&<Photos roomId={room.id} photos={photos} onChange={setPhotos}/>}
      </div>}

      {view==="plan"&&<ActionPlanView/>}

      {view==="overview"&&<div style={{animation:"fi 0.3s ease forwards"}}>
        <h2 style={{fontFamily:F.display,fontSize:"24px",fontWeight:700,marginBottom:"24px"}}>Project Overview</h2>
        <div className="sg" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"12px",marginBottom:"32px"}}>{PRIORITIES.map(p=>{const c=Object.values(rd).filter(r=>r.priority===p).length;return<div key={p} style={{background:C.surface,border:`2px solid ${PRIORITY_COLORS[p]}`,padding:"20px",textAlign:"center"}}><div style={{fontFamily:F.display,fontSize:"36px",fontWeight:700,color:PRIORITY_COLORS[p]}}>{c}</div><div style={{fontFamily:F.mono,fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted,marginTop:"4px"}}>{p}</div></div>})}</div>
        <div style={{background:C.surface,border:`1px solid ${C.dark}`,marginBottom:"28px"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"12px 16px",background:C.dark,color:C.bg,fontFamily:F.mono,fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase"}}><div>Room</div><div>Theme</div><div>Palette</div><div>Status</div></div>
          {Object.entries(ROOMS).map(([floor,rooms])=><div key={floor}>
            <div style={{padding:"8px 16px",background:C.warmBg,fontFamily:F.mono,fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",fontWeight:500}}>{floor}</div>
            {rooms.map(r=>{const d=rd[r.id];const pal=d?.palette?MCM_PALETTES[d.palette]:d?.customPalette;return<div key={r.id} onClick={()=>{setAR(r.id);setView("detail");setDT("observe")}} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"10px 16px",borderBottom:`1px solid ${C.warmBg}`,cursor:"pointer",fontFamily:F.mono,fontSize:"12px",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background=C.warmBg} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{fontWeight:500}}>{r.icon} {r.name}</div><div style={{fontSize:"11px"}}>{d?.theme||"\u2014"}</div>
              <div>{pal?<div style={{display:"flex",gap:"2px"}}>{[pal.primary,pal.secondary,pal.accent].map((c,i)=><div key={i} style={{width:"14px",height:"8px",background:c,border:"1px solid rgba(0,0,0,0.06)"}}/>)}</div>:<span style={{color:C.muted}}>{"\u2014"}</span>}</div>
              <div><Badge color={PRIORITY_COLORS[d?.priority||"Not Started"]} filled={d?.priority!=="Not Started"}>{d?.priority||"Not Started"}</Badge></div>
            </div>})}
          </div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>{[{l:"Owned",f:f=>f.owned,c:C.teal},{l:"Shopping List",f:f=>!f.owned,c:C.accent}].map(({l,f,c})=><div key={l} style={{background:C.surface,border:`2px solid ${c}`,padding:"20px"}}><div style={{fontFamily:F.mono,fontSize:"10px",letterSpacing:"1.5px",color:c,textTransform:"uppercase",marginBottom:"12px"}}>{l}</div>{Object.values(ROOMS).flat().map(r=>{const items=rd[r.id]?.furniture.filter(f)||[];if(!items.length)return null;return<div key={r.id} style={{marginBottom:"8px"}}><span style={{fontFamily:F.mono,fontSize:"12px",fontWeight:500}}>{r.name}: </span><span style={{fontFamily:F.mono,fontSize:"12px",color:C.muted}}>{items.map(x=>x.name).join(", ")}</span></div>})}</div>)}</div>
        <div style={{marginTop:"40px",textAlign:"center"}}><button onClick={()=>{if(confirm("Reset all data?")){setRD(initRD());setPhotos({});setLayouts({})}}} style={{fontFamily:F.mono,fontSize:"11px",padding:"8px 20px",cursor:"pointer",background:"transparent",color:C.muted,border:`1px solid ${C.border}`}}>Reset All Data</button></div>
      </div>}
    </main>
    <footer style={{textAlign:"center",padding:"32px 28px",fontFamily:F.mono,fontSize:"10px",color:C.muted,letterSpacing:"2px"}}>{"\u25c8"} AAKESH & ASHTON {"\u00b7"} MCM DREAM {"\u00b7"} 2026 {"\u25c8"}</footer>
  </div>;
}
