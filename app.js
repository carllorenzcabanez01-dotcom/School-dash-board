// ============================================================
// Classroom AI — shared site script (runs on every page)
// ============================================================

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>e.target.classList.add('in'), i*40);
      io.unobserve(e.target);
    }
  });
},{threshold:0.12});
revealEls.forEach(el=>io.observe(el));

// ---------- Mobile nav ----------
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if(navToggle && mainNav){
  navToggle.addEventListener('click', ()=> mainNav.classList.toggle('open'));
  mainNav.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=> mainNav.classList.remove('open'));
  });
}

// ---------- Generic tab/filter groups ----------
// Works for the Home schedule preview (data-type) and the
// Activities page (data-status) — pass in the right dataset key.
function initFilterTabs(tabsWrapId, itemsSelector, dataKey){
  const wrap = document.getElementById(tabsWrapId);
  if(!wrap) return;
  const tabs = wrap.querySelectorAll('.tab-btn');
  const items = document.querySelectorAll(itemsSelector);
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter;
      items.forEach(it=>{
        const show = f==='all' || it.dataset[dataKey]===f;
        it.style.display = show ? 'flex' : 'none';
      });
    });
  });
}
initFilterTabs('scheduleTabs', '#scheduleList .sched-item', 'type');
initFilterTabs('activityTabs', '#activityList .activity-item', 'status');

// ---------- Upload button (Home / AI Study Assistant — connect AI backend later) ----------
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
if(uploadBtn && fileInput){
  uploadBtn.addEventListener('click', ()=> fileInput.click());
  fileInput.addEventListener('change', (e)=>{
    if(e.target.files.length){
      // TODO: connect to AI processing backend
      alert('"' + e.target.files[0].name + '" ready to upload. Connect this to the AI backend to generate a reviewer, flashcards, and quizzes.');
    }
  });
}

// ---------- Group chat (floating widget, present on every page) ----------
const chatFab = document.getElementById('chatFab');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

if(chatFab && chatPanel){
  chatFab.addEventListener('click', ()=>{
    chatPanel.classList.toggle('open');
    const badge = chatFab.querySelector('.badge');
    if(badge) badge.style.display='none';
  });
}
if(chatClose && chatPanel){
  chatClose.addEventListener('click', ()=> chatPanel.classList.remove('open'));
}
function sendMsg(){
  const val = chatInput.value.trim();
  if(!val) return;
  const div = document.createElement('div');
  div.className = 'msg me';
  div.innerHTML = `<div class="msg-avatar" style="background:var(--violet);">C</div><div><div class="bubble"></div></div>`;
  div.querySelector('.bubble').textContent = val;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
  chatInput.value='';
}
if(chatSend && chatInput && chatBody){
  chatSend.addEventListener('click', sendMsg);
  chatInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendMsg(); });
}

// ---------- AI card constellation canvas (Home only) ----------
const canvas = document.getElementById('constellation');
if(canvas){
  const ctx = canvas.getContext('2d');
  let W,H,nodes=[];
  function resize(){
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width * devicePixelRatio;
    H = canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width+'px';
    canvas.style.height = rect.height+'px';
  }
  function initNodes(){
    nodes = Array.from({length:26}, ()=>({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*0.25*devicePixelRatio, vy: (Math.random()-.5)*0.25*devicePixelRatio,
      r: Math.random()*1.6+1
    }));
  }
  function tick(){
    ctx.clearRect(0,0,W,H);
    nodes.forEach(n=>{
      n.x+=n.vx; n.y+=n.vy;
      if(n.x<0||n.x>W) n.vx*=-1;
      if(n.y<0||n.y>H) n.vy*=-1;
    });
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j];
        const d = Math.hypot(a.x-b.x,a.y-b.y);
        const maxD = 120*devicePixelRatio;
        if(d<maxD){
          ctx.strokeStyle = `rgba(120,180,255,${(1-d/maxD)*0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    nodes.forEach(n=>{
      ctx.beginPath();
      ctx.arc(n.x,n.y,n.r*devicePixelRatio,0,Math.PI*2);
      ctx.fillStyle='rgba(160,210,255,0.85)';
      ctx.shadowColor='rgba(34,211,238,0.8)';
      ctx.shadowBlur=6;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  resize(); initNodes(); tick();
  window.addEventListener('resize', ()=>{ resize(); initNodes(); });
}
