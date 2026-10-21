(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const make = (tag, cls, text) => { const node=document.createElement(tag); if(cls)node.className=cls; if(text!==undefined)node.textContent=String(text); return node; };
  let chapters=[], videos=[], collections=[], confessionals=[], active=0, player='all', search='', sort='oldest', shown=24, modalReturn=null;
  const videoFolder='https://drive.google.com/drive/folders/1UO90p2ypR8AkVN13VvVgnbAHxbM0S3Fc?usp=drive_link';
  const validURL = s => { try { const u=new URL(String(s||'').trim()); return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';} };
  const dateValue = s => { const m=String(s||'').match(/^(\d{4})-(\d\d)-(\d\d)/);return m?`${m[1]}-${m[2]}-${m[3]}`:''; };
  const asTime = s => {const n=new Date(s).getTime();return Number.isFinite(n)?n:0;};
  const formatDate = s => {const d=new Date(s);return Number.isFinite(+d)?d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):String(s||'');};
  const formatDay = s => {const d=new Date(s);return Number.isFinite(+d)?d.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):String(s||'');};
  const formatTime = s => {const d=new Date(s);return Number.isFinite(+d)?d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'';};
  const byChrono = (a,b) => asTime(a.date)-asTime(b.date);
  function chapterOf(date){const d=dateValue(date);if(!d)return null;return chapters.find(c=>d>=c.start && d<=c.end)||null;}
  async function json(path,fallback){try{const r=await fetch(path,{cache:'no-cache'});if(!r.ok)throw Error(r.status);return await r.json();}catch(e){console.warn('Unable to fetch',path,e);return fallback;}}
  async function csv(path){try{const r=await fetch(path,{cache:'no-cache'});if(!r.ok)throw Error(r.status);return await r.text();}catch(e){console.warn('Unable to fetch',path,e);return '';}}
  function parseCSV(input){
    const rows=[];let row=[],field='',quoted=false;const text=String(input||'').replace(/^\uFEFF/,'');
    for(let i=0;i<text.length;i++){const ch=text[i];
      if(quoted){if(ch==='"'&&text[i+1]==='"'){field+='"';i++;}else if(ch==='"')quoted=false;else field+=ch;}
      else if(ch==='"')quoted=true;else if(ch===','){row.push(field);field='';}
      else if(ch==='\r'||ch==='\n'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(field);field='';if(row.some(x=>x.trim()))rows.push(row);row=[];}
      else field+=ch;
    }
    row.push(field);if(row.some(x=>x.trim()))rows.push(row);return rows;
  }
  function loadConfCSV(str){const rows=parseCSV(str);if(rows.length<2)return [];const headers=rows.shift().map(x=>x.trim().toLowerCase());const find=pattern=>headers.findIndex(x=>pattern.test(x));const playerI=find(/^(name|player|player name)$/),dateI=find(/timestamp|date|time/),urlI=find(/video link|video|url|link|confessional/);
    if(playerI<0||dateI<0||urlI<0)return [];
    return rows.map((r,i)=>({id:i,player:(r[playerI]||'').trim(),date:(r[dateI]||'').trim(),url:validURL(r[urlI]||'')})).filter(r=>r.player&&r.date&&r.url).sort(byChrono);
  }
  function chapterLabel(c){return c.id==='preseason'?'The draft':c.id==='finale'?'The finale':c.short||`Week ${c.number}`;}
  function chapterOption(c){const name=c.id==='preseason'?'Opening / draft':c.id==='finale'?'The jury & fantasy final':c.title;return `${c.number===0?'00':String(c.number).padStart(2,'0')}  ·  ${name}`;}
  function buildChapters(){
    const select=el('chapterSelect');select.replaceChildren();chapters.forEach((c,i)=>{const opt=new Option(chapterOption(c),String(i));select.add(opt);});
    select.addEventListener('change',()=>selectChapter(+select.value));
    el('prevChapter').addEventListener('click',()=>selectChapter(active-1));el('nextChapter').addEventListener('click',()=>selectChapter(active+1));
    const progress=el('chapterProgress');progress.replaceChildren();chapters.forEach((c,i)=>{const b=make('button','');b.type='button';b.title=chapterOption(c);b.setAttribute('aria-label',`Go to chapter ${i+1}: ${c.title}`);b.addEventListener('click',()=>selectChapter(i));progress.append(b);});
  }
  function selectChapter(index){active=Math.max(0,Math.min(chapters.length-1,index));player='all';search='';shown=24;el('playerFilter').value='all';el('confSearch').value='';renderChapter();renderConfessionals();}
  function relevantVideos(c){return videos.filter(m=>m.phaseId===c.id).sort((a,b)=>({ 'Tribal':0,'Final Tribal Votes':0,'Produced Episode':1,'Rewards and Game Events':2,'Ponderosa':3}[a.kind]??4)-({'Tribal':0,'Final Tribal Votes':0,'Produced Episode':1,'Rewards and Game Events':2,'Ponderosa':3}[b.kind]??4));}
  function renderChapter(){
    const c=chapters[active];el('chapterSelect').value=String(active);el('prevChapter').disabled=active===0;el('nextChapter').disabled=active===chapters.length-1;
    [...el('chapterProgress').children].forEach((b,i)=>{b.className=i===active?'current':i<active?'past':'';b.setAttribute('aria-current',String(i===active));});
    el('chapterIndex').textContent=`${c.id==='preseason'?'Opening':c.id==='finale'?'Finale':`Chapter ${String(active).padStart(2,'0')}`}  ·  ${c.dateLabel||`${formatDate(c.start)} – ${formatDate(c.end)}`}`;
    el('chapterTitle').textContent=c.title;
    el('chapterLead').textContent=c.description;
    const outcome=el('chapterOutcome');if(c.outcome&&c.id!=='finale'){outcome.textContent=`Voted out: ${c.outcome}`;outcome.hidden=false;}else outcome.hidden=true;
    const story=el('chapterStory');story.replaceChildren();(c.story||[]).forEach(s=>story.append(make('p','',s.body||'')));
    el('finaleResults').hidden=c.id!=='finale';
    const relevant=relevantVideos(c);const container=el('chapterVideos');container.replaceChildren();el('watchInfo').textContent=relevant.length?`${relevant.length} recording${relevant.length===1?'':'s'}`:'';
    if(!relevant.length){container.append(make('p','chapter-no-video','No stand-alone event recording is listed for this chapter. Explore its confessionals below.'))}
    else {
      const lead=relevant[0];const card=make('div','video-feature');const poster=make('button','video-poster');poster.type='button';poster.title='Watch '+lead.title;poster.append(make('span','play-icon','▶'));poster.addEventListener('click',()=>openVideo(lead));card.append(poster);
      const info=make('div','video-description');info.append(make('strong','',lead.title));info.append(make('span','',lead.subtype||lead.kind||'Recording'));const open=make('button','','Watch recording ↗');open.type='button';open.addEventListener('click',()=>openVideo(lead));info.append(open);card.append(info);container.append(card);
      for(const m of relevant.slice(1)){const b=make('button','video-item');b.type='button';const left=make('span','');left.append(make('b','',m.title));left.append(make('small','',m.subtype||m.kind||'Recording'));b.append(left,make('span','arrow','↗'));b.addEventListener('click',()=>openVideo(m));container.append(b);}
    }
    el('votingLink').hidden=c.id==='preseason'||c.id==='finale';
    el('votingLink').href=videoFolder;
    el('confChapterLabel').textContent=`· ${chapterLabel(c)}`;
    if(c.id==='finale'){
      el('finaleResults').querySelectorAll('img').forEach(img=>{img.onerror=()=>img.closest('a')?.remove();});
    }
  }
  function updatePlayers(){const dropdown=el('playerFilter');dropdown.replaceChildren(new Option('All players','all'));[...new Set(confessionals.map(c=>c.player))].sort((a,b)=>a.localeCompare(b)).forEach(n=>dropdown.add(new Option(n,n)));dropdown.addEventListener('change',()=>{player=dropdown.value;shown=24;renderConfessionals();});el('confSearch').addEventListener('input',()=>{search=el('confSearch').value.trim().toLowerCase();shown=24;renderConfessionals();});el('confSort').addEventListener('change',()=>{sort=el('confSort').value;shown=24;renderConfessionals();});el('loadMore').addEventListener('click',()=>{shown+=24;renderConfessionals();});}
  function renderConfessionals(){
    const c=chapters[active],list=el('confList');list.replaceChildren();let rows=confessionals.filter(r=>{const d=dateValue(r.date);return d>=c.start&&d<=c.end;});
    if(player!=='all')rows=rows.filter(r=>r.player===player);
    if(search)rows=rows.filter(r=>`${r.player} ${r.date}`.toLowerCase().includes(search));
    rows.sort((a,b)=>sort==='oldest'?byChrono(a,b):byChrono(b,a));
    if(!rows.length){list.append(make('p','empty',confessionals.length?'No confessionals match those filters in this chapter.':'Unable to load the confessional library.'));el('loadMore').hidden=true;return;}
    let lastDay='';const count=Math.min(rows.length,shown);
    for(const r of rows.slice(0,count)){
      const day=dateValue(r.date);if(day!==lastDay){list.append(make('div','conf-date-heading',formatDay(r.date)));lastDay=day;}
      const entry=make('div','conf-entry');const main=make('div','conf-entry-main');main.append(make('strong','',r.player));main.append(make('small','',formatTime(r.date)));entry.append(main);
      const btn=make('button','conf-play','Play ↗');btn.type='button';btn.setAttribute('aria-label',`Play ${r.player}'s confessional from ${formatDate(r.date)}`);btn.addEventListener('click',()=>openVideo({title:`${r.player} · ${formatDate(r.date)} ${formatTime(r.date)}`,url:r.url}));entry.append(btn);list.append(entry);
    }
    const more=el('loadMore');more.hidden=rows.length<=shown;if(!more.hidden)more.textContent=`Show more confessionals (${count} of ${rows.length})`;
  }
  function driveEmbed(url){try{const u=new URL(url);if(!/(^|\.)drive\.google\.com$/.test(u.hostname))return '';const id=u.searchParams.get('id')||(u.pathname.match(/\/d\/([A-Za-z0-9_-]+)/)||[])[1];if(id&&/^[A-Za-z0-9_-]+$/.test(id))return `https://drive.google.com/file/d/${id}/preview`;return '';}catch{return '';}}
  function closeModal(){const modal=el('mediaModal');if(modal.hidden)return;modal.hidden=true;el('modalView').replaceChildren();document.body.style.overflow='';modalReturn?.focus?.();modalReturn=null;}
  function openVideo(record){const url=validURL(record.url);if(!url)return;modalReturn=document.activeElement;const modal=el('mediaModal');el('modalTitle').textContent=record.title||'Recording';el('modalSource').href=url;const holder=el('modalView');holder.replaceChildren();const embed=driveEmbed(url);
    function showEmbed(){holder.replaceChildren();if(embed){const iframe=make('iframe','embed-frame');iframe.src=embed;iframe.title=record.title||'Recording';iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.allowFullscreen=true;iframe.loading='lazy';holder.append(iframe);}else{holder.append(make('p','empty','This recording is available at the original source using the link below.'));}}
    if(matchMedia('(max-width: 650px)').matches){const hint=make('div','mobile-play-hint');hint.append(make('p','','Google Drive playback works best in its own browser tab on smaller screens.'));if(embed){const b=make('button','try-embed','Try embedded player');b.type='button';b.addEventListener('click',showEmbed);hint.append(b);}holder.append(hint);}else showEmbed();
    modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('.modal-close').focus();
  }
  function initModal(){document.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',closeModal));document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});}
  function renderSources(){const holder=el('sourceLinks');holder.replaceChildren();collections.forEach(c=>{if(!validURL(c.url))return;const a=make('a','',`${c.label} ↗`);a.href=c.url;a.target='_blank';a.rel='noopener noreferrer';holder.append(a);});}
  async function init(){initModal();const [p,m,s,c]=await Promise.all([json('data/phases.json',[]),json('data/media.json',{items:[]}),json('data/collections.json',[]),csv('data/confessionals.csv')]);
    chapters=Array.isArray(p)?p:[];videos=(Array.isArray(m)?m:m.items||[]).filter(x=>validURL(x.url));collections=Array.isArray(s)?s:[];confessionals=loadConfCSV(c);
    if(!chapters.length){el('chapterTitle').textContent='Unable to load chapters';el('chapterLead').textContent='Please publish the data folder alongside index.html and app.js.';return;}
    buildChapters();updatePlayers();renderSources();selectChapter(chapters.length>1?1:0);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
