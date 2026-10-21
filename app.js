/* Survivor Fantasy Football Season Three — static site, no account or server required */
(() => {
  'use strict';
  const SHEET_ID = '1HgUC_VY2PF-MvQ6gclII0GeMVvmWJ81z_7ul9eqw1n8';
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`;
  const PODCAST_URL = 'https://open.spotify.com/show/4i1Q3URl0U2S4MZho9Xllm';
  const $ = (s, root=document) => root.querySelector(s);
  const el = (tag, cls, txt) => { const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n; };
  const E = (id) => document.getElementById(id);
  let collections = [], media = [], confessionals = [], phases = [], currentPhase='all', collectionActive = 'all', mediaQuery = '', confQuery = '', confPlayer = 'all', confSort='oldest';
  let confSource = 'none', activeModalSource = null;
  const validURL = value => { try { const u = new URL(String(value || '').trim()); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch {return '';} };
  const fmtDate = value => {
    if(!value)return 'DATE NOT LISTED';
    const s=String(value).trim(); let d;
    if(/^\d{4}-\d{2}-\d{2}/.test(s)) d=new Date(`${s.slice(0,10)}T12:00:00`);
    else d=new Date(s);
    return !Number.isNaN(d?.getTime()) ? d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : s;
  };
  const mkLink = (text, href, cls='') => {const a=el('a',cls,text);a.href=validURL(href)||'#';a.target='_blank';a.rel='noopener noreferrer';return a;};
  function setStatus(heading, detail, state) { E('confStatus').textContent=heading;E('confStatusNote').textContent=detail;E('confStatusLight').className='status-light '+(state||''); }
  async function fetchJSON(path, fallback) {try{const res=await fetch(path,{cache:'no-cache'});if(!res.ok)throw Error('Missing resource');return await res.json();}catch(err){console.warn('Could not load',path,err);return fallback;}}
  function iconContent(text) { return text || '✦'; }
  function showCollections() {
    const holder=E('collectionGrid');holder.replaceChildren();
    collections.forEach((c,i)=>{
      const card=el('article','collection-card');
      const top=el('span','collection-index',`0${i+1} / ${c.eyebrow}`);card.append(top);
      card.append(el('div','collection-icon',iconContent(c.icon)));
      card.append(el('h3','',c.label));card.append(el('p','',c.description));
      const actions=el('div','collection-actions');
      if(c.folderId) {
        const browse=el('button','collection-action primary','BROWSE HERE ↗');browse.type='button';browse.addEventListener('click',()=>openFolder(c));actions.append(browse);
      } else {
        const scroll=el('a','collection-action primary','FILTER & LISTEN ↗');scroll.href='#confessionals';actions.append(scroll);
      }
      actions.append(mkLink(c.folderId?'OPEN DRIVE FOLDER ↗':'OPEN GOOGLE SHEET ↗',c.url,'collection-action'));
      card.append(actions);holder.append(card);
    });
  }
  function openFolder(c) {
    const src=`https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(c.folderId)}#grid`;
    openModal({title:c.label,label:'EXPLORE THE COLLECTION',url:c.url,iframe:src,isFolder:true});
  }
  function bindModal() {
    document.querySelectorAll('[data-close-modal]').forEach(n=>n.addEventListener('click',closeModal));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!E('mediaModal').hidden)closeModal();});
  }
  function guessEmbed(url) {
    try {
      const u=new URL(url); const host=u.hostname.replace(/^www\./,'');
      if(host==='drive.google.com' || host==='docs.google.com'){
        let id=u.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || u.searchParams.get('id');
        if(id && /^[\w-]+$/.test(id))return `https://drive.google.com/file/d/${id}/preview`;
      }
      if(host==='open.spotify.com') {const m=u.pathname.match(/^\/(episode|show)\/([A-Za-z0-9]+)/);if(m)return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;}
      if(host==='youtube.com'||host==='m.youtube.com'||host==='youtu.be'){
        let id=host==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');if(id&&/^[A-Za-z0-9_-]{11}$/.test(id))return `https://www.youtube-nocookie.com/embed/${id}`;
      }
      if(host==='vimeo.com') {const id=u.pathname.replace(/\//g,'');if(/^\d+$/.test(id))return `https://player.vimeo.com/video/${id}`;}
    } catch {}
    return '';
  }
  function openModal({title,label,url,iframe,isFolder}){
    const safeUrl=validURL(url); if(!safeUrl)return;
    const modal=E('mediaModal');E('modalTitle').textContent=title||'PLAY RECORDING';E('modalType').textContent=label||'THE FOOTAGE';
    const source=E('modalExternal');source.href=safeUrl;source.textContent=isFolder?'OPEN FOLDER IN GOOGLE DRIVE ↗':'PLAY AT ORIGINAL SOURCE ↗';
    const body=E('modalPlayer');body.replaceChildren();
    const note=el('p','browser-note',isFolder?'Browse the full collection in Google Drive, or use the embedded folder view below.':'This recording is hosted on Google Drive. For the most reliable mobile playback, open it directly in Drive.');body.append(note);
    const embed=iframe||guessEmbed(safeUrl);
    if(embed){
      const cover=el('div','embedded-media-cover');
      cover.append(el('span','embed-mark','▶'));
      cover.append(el('strong','',isFolder?'BROWSE THE GOOGLE DRIVE FOLDER':'PLAY THIS RECORDING'));
      const direct=mkLink(isFolder?'OPEN FOLDER IN DRIVE ↗':'OPEN VIDEO IN DRIVE ↗',safeUrl,'btn btn-fire');cover.append(direct);
      const inside=el('button','embed-trigger','TRY EMBEDDED VIEW ↓');inside.type='button';cover.append(inside);body.append(cover);
      inside.addEventListener('click',()=>{cover.remove();const wrap=el('div','embed-shell');const frame=el('iframe',isFolder?'media-folder-frame':'');frame.src=embed;frame.title=title||'Media browser';frame.loading='eager';frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';wrap.append(frame);body.append(wrap);});
    } else body.append(mkLink('OPEN THE RECORDING AT ITS SOURCE ↗',safeUrl,'standalone-link'));
    activeModalSource=document.activeElement;modal.hidden=false;document.body.style.overflow='hidden';$('.modal-close')?.focus();
  }
  function closeModal(){const modal=E('mediaModal');if(modal.hidden)return;modal.hidden=true;E('modalPlayer').replaceChildren();document.body.style.overflow='';activeModalSource?.focus?.();activeModalSource=null;}
  function normalizeMedia(obj,i) {
    if(!obj || typeof obj!=='object')return null;
    const url=validURL(obj.url || obj.link || obj.URL);if(!url)return null;
    const category=String(obj.category || obj.type || obj.collection || 'episodes').toLowerCase().trim();
    return {id:String(obj.id||i),category, title:String(obj.title||obj.name||`Recording ${i+1}`), date:String(obj.date||obj.timestamp||''),player:String(obj.player||''),note:String(obj.description||obj.note||''),phaseId:String(obj.phaseId||''),kind:String(obj.kind||''),subtype:String(obj.subtype||''),url};
  }
  function renderVaultTabs() {
    const holder=E('vaultTabs');holder.replaceChildren();
    const opts=[['all','ALL'], ...collections.filter(c=>c.folderId).map(c=>[c.id,c.label.toUpperCase()])];
    opts.forEach(([id,label])=>{const b=el('button','tab-btn'+(collectionActive===id?' active':''),label);b.type='button';b.setAttribute('aria-pressed',String(collectionActive===id));b.addEventListener('click',()=>{collectionActive=id;renderVaultTabs();renderMedia();});holder.append(b);});
  }
  function renderMedia() {
    const visible=media.filter(m=> (currentPhase==='all'||m.phaseId===currentPhase) && (collectionActive==='all'||m.category===collectionActive) && [m.title,m.player,m.note,m.date,m.category].join(' ').toLowerCase().includes(mediaQuery));
    E('mediaCount').textContent=`${visible.length} INDEXED RECORDING${visible.length===1?'':'S'}`;
    const holder=E('mediaGrid');holder.replaceChildren();
    const empty=E('vaultEmpty');empty.hidden=visible.length>0;
    if(!visible.length) { const c=collections.find(c=>c.id===collectionActive);const link=$('.vault-empty .text-link');if(link){link.textContent=c?.folderId?`BROWSE ${c.label.toUpperCase()} ↗`:'ABOUT THIS ARCHIVE ↗';link.onclick=c?.folderId?(ev=>{ev.preventDefault();openFolder(c);}):null;link.href=c?.url||'README.md';link.target=c?.folderId?'_blank':'_self';} }
    visible.forEach(m=>{
      const card=el('article','media-card');
      const thumb=el('div','media-thumb');thumb.append(el('div','media-play','▶'));thumb.append(el('span','media-label',(collections.find(c=>c.id===m.category)?.label||m.category).toUpperCase()));card.append(thumb);
      const info=el('div','media-info');info.append(el('h4','',m.title));const p=el('p','', [m.subtype,m.note].filter(Boolean).join(' · '));info.append(p);const phase=phases.find(ph=>ph.id===m.phaseId);if(phase)info.append(el('span','meta-pill',phase.kicker||phase.title));
      const b=el('button','text-link','WATCH FOOTAGE ↗');b.type='button';b.addEventListener('click',()=>openModal({title:m.title,label:m.category.toUpperCase(),url:m.url}));info.append(b);card.append(info);holder.append(card);
      thumb.style.cursor='pointer';thumb.addEventListener('click',()=>b.click());
    });
  }
  function parseCSV(input) {
    const rows=[],line=[];let field='',quote=false;const s=String(input).replace(/^\uFEFF/,'');
    for(let i=0;i<s.length;i++){
      const c=s[i];
      if(quote){if(c==='"'&&s[i+1]==='"'){field+='"';i++;}else if(c==='"')quote=false;else field+=c;}
      else if(c==='"')quote=true;
      else if(c===','){line.push(field);field='';}
      else if(c==='\n'||c==='\r'){if(c==='\r'&&s[i+1]==='\n')i++;line.push(field);field='';if(line.some(v=>v.trim()!==''))rows.push([...line]);line.length=0;}
      else field+=c;
    }
    line.push(field);if(line.some(v=>v.trim()!==''))rows.push([...line]);
    return rows;
  }
  // Read the actual player, date/time and recording link from the public Google Sheet.
  // This parser searches for a header row rather than assuming it is row 1.
  function findColumn(headers, patterns) {for(const re of patterns){const i=headers.findIndex(h=>re.test(h));if(i>=0)return i;}return -1;}
  function columnIndexes(headers) {
    return {
      date:findColumn(headers,[/^timestamp$/, /submission.*(date|time)/, /^date(\s*\/?\s*time)?$/, /submitted/, /when.*recorded/, /recorded.*(date|time)/]),
      player:findColumn(headers,[/^player name$/, /^player$/, /^name$/, /your name/, /player.*name/, /contestant/, /^who are you/]),
      title:findColumn(headers,[/^title$/, /confessional.*title/, /description/, /topic/]),
      gist:findColumn(headers,[/^gist$/, /^summary$/, /^written notes?$/]),
      link:findColumn(headers,[/upload.*confess/,/confessional.*(url|link|video|audio)/,/(video|audio).*(url|link)/,/^url$/,/^link$/,/(upload|recording)/])
    };
  }
  function getURL(raw) {
    const s=String(raw ?? '').trim();
    if(!s)return '';
    const match=s.match(/https?:\/\/[^\s<>"']+/i);
    if(match)return validURL(match[0].replace(/[\],;.)]+$/,''));
    // Google Forms occasionally produces file IDs rather than full URLs.
    if(/^[a-zA-Z0-9_-]{25,}$/.test(s))return `https://drive.google.com/file/d/${s}/view`;
    return '';
  }
  function sheetCellText(cell) {
    if(cell instanceof Date)return cell.toISOString();
    if(cell&&typeof cell==='object')return String(cell.f??cell.v??'');
    return String(cell??'');
  }
  function cleanSheetRows(input) {
    const rows=input.map(row=>(Array.isArray(row)?row:[]).map(sheetCellText));
    if(rows.length<2)return [];
    let headers=[], rowStart=0, ix=null;
    for(let i=0;i<Math.min(12,rows.length);i++){
      const h=rows[i].map(v=>v.trim().toLowerCase().replace(/\s+/g,' '));
      const columns=columnIndexes(h);
      if(columns.link>=0&&(columns.player>=0||columns.date>=0)){
        headers=h;ix=columns;rowStart=i+1;break;
      }
    }
    if(!ix){headers=rows[0].map(v=>v.trim().toLowerCase());ix=columnIndexes(headers);rowStart=1;}
    let urlIx=ix.link;
    if(urlIx<0){
      const widths=Math.max(...rows.slice(0,15).map(r=>r.length));
      const scores=Array.from({length:widths},(_,i)=>rows.slice(rowStart,rowStart+15).filter(r=>getURL(r[i])).length);
      urlIx=scores.indexOf(Math.max(...scores));
      if(scores[urlIx]===0)return [];
    }
    const result=[];
    for(const [i,r] of rows.slice(rowStart).entries()){
      const url=getURL(r[urlIx]);if(!url)continue;
      const player=ix.player>=0?String(r[ix.player]||'').trim():'';
      const date=ix.date>=0?String(r[ix.date]||'').trim():'';
      const title=ix.title>=0?String(r[ix.title]||'').trim():'';
      let gist=ix.gist>=0?String(r[ix.gist]||'').trim():'';
      if(/^(?:paste\s*here\s*\.?|tbd|n\/?a|none|-+)$/i.test(gist))gist='';
      result.push({id:i,date,player:player||'Unattributed',title,gist,url});
    }
    // Keep every genuine submission. Do not infer player identities from email.
    return result;
  }
  // For a live public sheet, use anonymous CSV endpoints or JSONP as a CORS fallback.
  async function loadSheetCSV() {
    const urls=[
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=0`,
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?output=csv`
    ];
    for(const u of urls){try{
      const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),6500);let res;
      try{res=await fetch(u,{signal:ctrl.signal,redirect:'follow',cache:'no-store'});}finally{clearTimeout(timeout);}
      if(!res.ok)continue;
      const txt=await res.text();
      if(/^\s*<(?:!doctype|html)/i.test(txt))continue;
      const list=cleanSheetRows(parseCSV(txt));if(list.length)return list;
    }catch(e){console.debug('Google Sheet CSV read unavailable:',e);}}
    return loadSheetJSONP();
  }
  function loadSheetJSONP(){return new Promise(resolve=>{
    const callbackName='__sffSheetsResponse'+Math.floor(Math.random()*1e9);
    const script=document.createElement('script');let done=false;
    const finish=(result)=>{if(done)return;done=true;delete window[callbackName];script.remove();clearTimeout(timer);resolve(result);};
    window[callbackName]=resp=>{
      try{
        const table=resp?.table;
        if(!table?.rows?.length)return finish([]);
        const cols=(table.cols||[]).map(c=>c.label||c.id||'');
        const rows=table.rows.map(row=>(row.c||[]).map(cell=>cell?.f??cell?.v??''));
        const firstHasHeader=rows.slice(0,5).some(row=>{
          const c=columnIndexes(row.map(x=>String(x||'').toLowerCase()));
          return c.link>=0&&(c.player>=0||c.date>=0);
        });
        finish(cleanSheetRows(firstHasHeader?rows:[cols,...rows]));
      }catch(e){console.warn('Google Sheet JSONP parse failed:',e);finish([]);}
    };
    const timer=setTimeout(()=>finish([]),8500);
    script.src=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?headers=0&tqx=${encodeURIComponent('out:json;responseHandler:'+callbackName)}`;
    script.onerror=()=>finish([]);document.head.append(script);
  });}
  function parseConfDate(value){
    if(!value)return null;
    const s=String(value).trim();let m;
    if((m=s.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})(?:,(\d{1,2}),(\d{1,2}),(\d{1,2}))?\)$/)))
      return new Date(+m[1],+m[2],+m[3],+(m[4]||0),+(m[5]||0),+(m[6]||0));
    if((m=s.match(/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d)(?::(\d\d)(?:\.\d+)?)?)?/)))
      return new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0),+(m[6]||0));
    if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,]+(\d{1,2}):(\d\d)(?::(\d\d))?\s*(AM|PM)?)?/i))){
      let hour=+(m[4]||0);if(m[7])hour=(hour%12)+(m[7].toUpperCase()==='PM'?12:0);
      return new Date(+m[3],+m[1]-1,+m[2],hour,+(m[5]||0),+(m[6]||0));
    }
    const fallback=new Date(s);return Number.isFinite(fallback.getTime())?fallback:null;
  }
  function chronologicalValue(s){return parseConfDate(s)?.getTime()??0;}
  function formattedConfTimestamp(s){
    if(!s)return 'DATE NOT LISTED';
    const d=parseConfDate(s);
    if(!d||Number.isNaN(d.getTime()))return s;
    const hasTime=/\d{1,2}:\d{2}/.test(s)||/^Date\(\d+,\d+,\d+,\d+/.test(s);
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+
      (hasTime?' · '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'');
  }
  function dayBucket(s){
    const d=parseConfDate(s);return d&&!Number.isNaN(d.getTime())?d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}):'Undated submissions';
  }

  // The Tuesday chapter dates are inferred from the organizer's weekly schedule.
  function getPhaseId(s) {
    const d=parseConfDate(s); if(!d || !Number.isFinite(d.getTime()))return 'unknown';
    const iso=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
    return phases.find(p=>iso>=p.start && iso<=p.end)?.id || 'unknown';
  }
  function phaseRecords(){return confessionals.filter(c=>currentPhase==='all'||getPhaseId(c.date)===currentPhase);}
  function phaseDateRange(p){if(!p)return 'Aug–Dec 2025';
    const short=iso=>new Date(`${iso}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'});
    return `${short(p.start)} – ${short(p.end)}`;
  }
  function buildPhaseUI(){
    const rail=E('phaseRail'), main=E('phaseSelect'), conf=E('confPhase');
    if(!rail||!main||!conf)return;
    rail.replaceChildren();main.replaceChildren();conf.replaceChildren();
    [['all','FULL SEASON'],...phases.map(p=>[p.id,p.short||p.kicker||p.title])].forEach(([id,label])=>{
      main.add(new Option(label,id));conf.add(new Option(label,id));
      const b=el('button','phase-tab',label);b.type='button';b.dataset.phase=id;
      b.addEventListener('click',()=>setPhase(id));rail.append(b);
    });
    main.value=conf.value=currentPhase;
    E('phasePrev').addEventListener('click',()=>shiftPhase(-1));
    E('phaseNext').addEventListener('click',()=>shiftPhase(1));
    main.addEventListener('change',()=>setPhase(main.value));
    conf.addEventListener('change',()=>setPhase(conf.value));
    renderPhase();
  }
  function shiftPhase(dir){const ids=['all',...phases.map(p=>p.id)];const idx=ids.indexOf(currentPhase);setPhase(ids[Math.min(ids.length-1,Math.max(0,idx+dir))]);}
  function setPhase(id){currentPhase= id==='all'||phases.some(p=>p.id===id)?id:'all';
    const main=E('phaseSelect'),conf=E('confPhase');if(main)main.value=currentPhase;if(conf)conf.value=currentPhase;
    renderPhase();renderConfessionals();renderMedia();
  }
  function renderPhase(){
    if(!E('phaseRail'))return;
    E('phaseRail').querySelectorAll('.phase-tab').forEach(button=>{const active=button.dataset.phase===currentPhase;
      button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    const current=phases.find(p=>p.id===currentPhase)||null;
    const rows=phaseRecords(); const players=new Set(rows.map(r=>r.player));
    E('phaseIndex').textContent=current?`CHAPTER ${String(current.number).padStart(2,'0')} · ${current.kicker||'THE SEASON'}`:'THE COMPLETE 2025 SEASON';
    E('phaseTitle').textContent=current?current.title:'Every week has a story.';
    E('phaseDescription').textContent=current?current.description:'Nineteen distinct chapters connect the draft, the weekly Tribal Councils, the merge, and the two-week fantasy championship. Select a chapter to watch its footage, read its story, and hear players in their own words.';
    const outcome=E('phaseOutcome');outcome.replaceChildren();if(current?.outcome){outcome.append(el('span','',current.id==='final-15'?'THE WINNER':'THE OUTCOME'));outcome.append(el('strong','',current.outcome));}
    const story=E('phaseStory');story.replaceChildren();
    if(current?.story?.length){
      story.append(el('span','phase-story-label','INSIDE THE GAME'));
      for(const beat of current.story){
        const block=el('div','phase-story-beat');
        block.append(el('h4','',beat.heading));
        block.append(el('p','',beat.body));
        story.append(block);
      }
    }
    renderChapterVideos(current);
    E('phaseConfCount').textContent=String(rows.length);
    E('phasePlayerCount').textContent=String(players.size);
    E('phaseDate').textContent=current?.dateLabel || phaseDateRange(current);
    const notes=E('phaseGists');notes.replaceChildren();
    const items=rows.filter(r=>r.gist&&r.gist.length>18).sort((a,b)=>chronologicalValue(a.date)-chronologicalValue(b.date));
    if(!current){notes.append(el('p','phase-empty','Select a chapter to read verified notes from the confessional log, where provided.'));return;}
    if(!items.length){notes.append(el('p','phase-empty','No player-submitted written gist is available for this chapter. Browse the original video recordings and the timestamped confessionals below.'));return;}
    // Keep the editorial digest small. Use the original notes verbatim, never generated conclusions.
    const picks=items.filter(r=>r.gist.length<850).slice(0,3);
    (picks.length?picks:items.slice(0,2)).forEach(r=>{
      const card=el('div','phase-note-card');
      const top=el('div','phase-note-person');top.append(el('strong','',r.player));top.append(el('span','',formattedConfTimestamp(r.date)));
      card.append(top);
      const t=String(r.gist).trim();
      if(t.length>360){const details=el('details','phase-note-details');details.append(el('summary','',t.slice(0,290).trimEnd()+'… Read full note'));details.append(el('p','',t));card.append(details);}
      else card.append(el('p','',t));
      notes.append(card);
    });
  }

  function renderChapterVideos(phase){
    const holder=E('phaseVideos');if(!holder)return;holder.replaceChildren();
    const relevant=phase?media.filter(m=>m.phaseId===phase.id):media.filter(m=>['week-1','week-7','week-11','week-13b','jury'].includes(m.phaseId)).slice(0,5);
    if(!relevant.length){
      const status=el('div','chapter-media-empty',phase?.id==='preseason'?'The preseason lives in the player confessionals. Choose a player below to hear the early game.':'No individual video is indexed for this chapter. Explore its timestamped confessional recordings below.');
      holder.append(status);return;
    }
    const prioritized=[...relevant].sort((a,b)=>{
      const score=m=>m.kind==='Tribal'||m.kind==='Final Tribal Votes'?0:m.kind==='Produced Episode'?1:m.kind==='Rewards and Game Events'?2:3;
      return score(a)-score(b);
    });
    const lead=prioritized[0];
    const featured=el('div','featured-recording');featured.append(el('span','featured-rec-tag','FEATURED FOOTAGE · '+(lead.subtype||lead.category).toUpperCase()));
    featured.append(el('strong','featured-rec-title',lead.title));
    if(lead.note)featured.append(el('p','',lead.note));
    const play=el('button','btn btn-fire','▶ WATCH RECORDING ↗');play.type='button';play.addEventListener('click',()=>openModal({title:lead.title,label:lead.subtype||lead.category,url:lead.url}));featured.append(play);
    holder.append(featured);
    if(phase?.id.startsWith('week-') || phase?.id==='jury'){
      const voting=mkLink('BROWSE ALL VOTING CONFESSIONALS ↗','https://drive.google.com/drive/folders/1UO90p2ypR8AkVN13VvVgnbAHxbM0S3Fc?usp=drive_link','chapter-voting-link');
      voting.title='Opens the complete voting confessional folder; individual ballot recordings are not yet indexed to their Tribal week.';
      holder.append(voting);
    }
    if(prioritized.length>1){
      const others=el('div','chapter-other');others.append(el('span','chapter-more-label',`${prioritized.length-1} MORE RECORDING${prioritized.length>2?'S':''} IN THIS CHAPTER`));
      for(const m of prioritized.slice(1)){
        const b=el('button','chapter-media-link');b.type='button';b.append(el('span','',m.title));b.append(el('em','','▶'));
        b.addEventListener('click',()=>openModal({title:m.title,label:m.subtype||m.category,url:m.url}));others.append(b);
      }
      holder.append(others);
    }
  }

  function updatePlayerOptions(){
    const vals=[...new Set(confessionals.map(c=>c.player).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const holder=E('playerSelect');const prev=confPlayer;holder.replaceChildren(new Option('ALL PLAYERS','all'));vals.forEach(v=>holder.add(new Option(v.toUpperCase(),v)));
    if(vals.includes(prev))holder.value=prev;else {holder.value='all';confPlayer='all';}
  }
  function setConfessionals(list,source){confessionals=list;confSource=source;updatePlayerOptions();renderConfessionals();renderPhase();}
  function renderConfessionals(){
    const visible=confessionals.filter(c=>(currentPhase==='all'||getPhaseId(c.date)===currentPhase)&&(confPlayer==='all'||c.player===confPlayer)&&[c.player,c.title,c.date,c.gist||''].join(' ').toLowerCase().includes(confQuery));
    visible.sort((a,b)=>confSort==='player'?a.player.localeCompare(b.player)||chronologicalValue(a.date)-chronologicalValue(b.date):(chronologicalValue(a.date)-chronologicalValue(b.date))*(confSort==='newest'?-1:1));
    E('confCount').textContent=`${visible.length} SHOWN · ${confessionals.length} TOTAL CONFESSIONAL${confessionals.length===1?'':'S'}`;
    E('confessionStat').textContent=confessionals.length||'—';
    E('confSourceLabel').textContent=confSource==='live'?'SOURCE: LIVE GOOGLE SHEET':confSource==='csv'?'SOURCE: UPLOADED SEASON LOG':'SOURCE: PUBLIC GOOGLE SHEET';
    const holder=E('confList');holder.replaceChildren();
    if(!visible.length){
      const msg=el('div','list-message');msg.append(el('strong','',confessionals.length?'No confessionals match those filters.':'Confessional records are not yet available to the site.'));
      const p=el('p','',confessionals.length?'Try another player or search term.':'The Google Sheet may block anonymous reads. Open it directly or import its CSV export below.');msg.append(p);
      if(!confessionals.length)msg.append(mkLink('OPEN THE SOURCE SPREADSHEET ↗',SHEET_URL,'text-link'));
      holder.append(msg);return;
    }
    let lastSection='';
    visible.forEach((c,i)=>{
      const section=confSort==='player'?c.player:dayBucket(c.date);
      if(section!==lastSection){
        const header=el('div','conf-day-heading');header.append(el('span','',section));
        holder.append(header);lastSection=section;
      }
      const row=el('article','conf-entry');row.append(el('div','conf-number',String(i+1).padStart(2,'0')));
      const main=el('div','conf-entry-main');main.append(el('strong','',c.player));
      main.append(el('span','conf-meta',[formattedConfTimestamp(c.date),c.title].filter(Boolean).join(' · ')));
      if(c.gist){const details=el('details','conf-gist');const summary=el('summary','',c.gist.length>140?c.gist.slice(0,137).trimEnd()+'…':c.gist);details.append(summary);if(c.gist.length>140)details.append(el('p','',c.gist));main.append(details);}
      row.append(main);
      const actions=el('div','conf-entry-actions');
      const play=el('button','btn btn-fire','PLAY ↗');play.type='button';play.addEventListener('click',()=>openModal({title:`${c.player} · ${formattedConfTimestamp(c.date)}`,label:'PLAYER CONFESSIONAL',url:c.url}));actions.append(play);
      row.append(actions);holder.append(row);
    });
  }
  async function bootConfessionals(forceLive=false){
    setStatus('LOADING CONFESSIONAL LOG','Reading player names, timestamps and recording links…','');
    if(!forceLive){
      const local=await fetch('data/confessionals.csv',{cache:'no-cache'}).then(r=>r.ok?r.text():'').catch(()=>'');
      const bundled=cleanSheetRows(parseCSV(local));
      if(bundled.length){setConfessionals(bundled,'csv');setStatus('CONFESSIONALS READY',`${bundled.length} timestamped recordings available.`, 'live');return;}
    }
    const live=await loadSheetCSV();
    if(live.length){setConfessionals(live,'live');setStatus('CONFESSIONALS READY',`${live.length} recordings loaded with player names and submission times.`,'live');}
    else if(confessionals.length){setStatus('SHOWING EXISTING CONFESSIONALS','Could not refresh Google Sheets; retaining the previous list.','fail');}
    else{setConfessionals([],'none');setStatus('GOOGLE SHEET ACCESS UNAVAILABLE','View the sheet or import its CSV export to load the entries.','fail');}
  }
  function bindControls(){
    E('mediaSearch').addEventListener('input',e=>{mediaQuery=e.target.value.toLowerCase().trim();renderMedia();});
    E('confSearch').addEventListener('input',e=>{confQuery=e.target.value.toLowerCase().trim();renderConfessionals();});
    E('playerSelect').addEventListener('change',e=>{confPlayer=e.target.value;renderConfessionals();});
    E('confSort').addEventListener('change',e=>{confSort=e.target.value;renderConfessionals();});
    E('csvImport').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;const text=await file.text();const parsed=cleanSheetRows(parseCSV(text));if(!parsed.length){setStatus('CSV COULD NOT BE READ','Include at least one public media URL in a URL, Link, Video or Confessional column.','fail');return;}setConfessionals(parsed,'csv');setStatus('CONFESSIONALS READY',`${parsed.length} rows loaded locally; nothing was uploaded.`,'live');});
    E('sheetLink').href=SHEET_URL;
    E('retryConfessionals').addEventListener('click',()=>bootConfessionals(true));
    const menu=E('menuToggle'),mobile=E('mobileNav');menu.addEventListener('click',()=>{mobile.hidden=!mobile.hidden;menu.setAttribute('aria-expanded',String(!mobile.hidden));});
    mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.hidden=true;menu.setAttribute('aria-expanded','false');}));
  }
  async function init(){
    bindControls();bindModal();
    phases=await fetchJSON('data/phases.json',[]);
    buildPhaseUI();
    collections=await fetchJSON('data/collections.json',[]);
    showCollections();
    const raw=await fetchJSON('data/media.json',{items:[],podcastEpisodes:[]});
    media=Array.isArray(raw)?raw.map(normalizeMedia).filter(Boolean):(raw.items||[]).map(normalizeMedia).filter(Boolean);
    const episodes=Array.isArray(raw)?[]:raw.podcastEpisodes||[];
    const epHolder=E('podcastEntries');epHolder.replaceChildren();
    episodes.filter(e=>e?.season===3 && validURL(e.url)).forEach(e=>epHolder.append(mkLink(`${e.title || 'Season 3 episode'} ↗`,e.url,'text-link')));
    renderVaultTabs();renderMedia();renderPhase();
    bootConfessionals();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
