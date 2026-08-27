/* =========================================================
   ROSTER SCHEDULER — HOME V28.3 (filename kept for drop-in replacement)
   Rebuilds only Home, preserves existing app pages/functions
   ========================================================= */
(function(){
  "use strict";

  const $ = (id)=>document.getElementById(id);

  const svg = {
    people:`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="25" cy="22" r="10" fill="#f45f97"/><circle cx="42" cy="24" r="8" fill="#ff9ec0"/><path d="M10 51c1-13 8-19 16-19s16 6 17 19" fill="#f45f97"/><path d="M34 51c1-10 6-15 12-15 7 0 11 5 12 15" fill="#ff9ec0"/></svg>`,
    calendar:`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="14" width="44" height="40" rx="8" fill="#74d9c6"/><rect x="10" y="20" width="44" height="9" fill="#54c7b2"/><rect x="18" y="9" width="5" height="12" rx="2.5" fill="#358f82"/><rect x="41" y="9" width="5" height="12" rx="2.5" fill="#358f82"/><g fill="#fff"><rect x="17" y="34" width="7" height="6" rx="2"/><rect x="28" y="34" width="7" height="6" rx="2"/><rect x="39" y="34" width="7" height="6" rx="2"/><rect x="17" y="43" width="7" height="6" rx="2"/><rect x="28" y="43" width="7" height="6" rx="2"/></g></svg>`,
    umbrella:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 31C13 16 24 9 32 9s19 7 22 22c-5-4-9-4-13 0-4-4-8-4-13 0-4-4-9-4-18 0z" fill="#f0b74d"/><path d="M32 31v17c0 6 8 7 10 1" fill="none" stroke="#d68c35" stroke-width="4" stroke-linecap="round"/></svg>`,
    shield:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 7l20 8v14c0 14-9 23-20 29C21 52 12 43 12 29V15z" fill="#9a7be2"/><path d="M32 17l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffe48b"/></svg>`,
    wand:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 50L43 21" stroke="#ef75a3" stroke-width="7" stroke-linecap="round"/><path d="M40 12l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM52 32l1.5 4.5L58 38l-4.5 1.5L52 44l-1.5-4.5L46 38l4.5-1.5zM18 15l1.2 3.8L23 20l-3.8 1.2L18 25l-1.2-3.8L13 20l3.8-1.2z" fill="#f4b5d0"/></svg>`,
    folder:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 19h18l5 6h25v25c0 4-3 7-7 7H15c-4 0-7-3-7-7z" fill="#54cbb6"/><path d="M8 25h48v9H8z" fill="#91e2d3"/><rect x="20" y="32" width="29" height="18" rx="4" fill="#fff" opacity=".8"/></svg>`,
    clipboard:`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="13" y="10" width="38" height="46" rx="7" fill="#a385e7"/><rect x="23" y="7" width="18" height="9" rx="4" fill="#7659c5"/><path d="M22 27l4 4 7-8M22 39l4 4 7-8" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M37 28h8M37 40h8" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
    report:`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 8h27l10 10v38H14z" fill="#fff" stroke="#e3d9bd" stroke-width="2"/><path d="M41 8v12h10" fill="#f6e7b5"/><rect x="21" y="39" width="6" height="10" rx="2" fill="#efb84e"/><rect x="31" y="32" width="6" height="17" rx="2" fill="#7dbde2"/><rect x="41" y="25" width="6" height="24" rx="2" fill="#9a7be2"/><path d="M21 22h15M21 27h9" stroke="#9ea6b4" stroke-width="3" stroke-linecap="round"/></svg>`,
    search:`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="27" cy="27" r="15" fill="#fff" stroke="#8f78d8" stroke-width="5"/><path d="M39 39l13 13" stroke="#8f78d8" stroke-width="6" stroke-linecap="round"/></svg>`,
    approve:`<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="29" cy="25" r="12" fill="#efbd54"/><path d="M12 53c2-12 9-18 17-18s15 6 17 18" fill="#efbd54"/><circle cx="47" cy="44" r="11" fill="#67cdb9"/><path d="M42 44l4 4 7-8" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    lock:`<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="28" width="36" height="29" rx="8" fill="#66b8df"/><path d="M22 29v-8c0-8 5-13 10-13s10 5 10 13v8" fill="none" stroke="#3c8eb6" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="42" r="4" fill="#fff"/></svg>`
  };

  function heroSvg(){
    return `<svg class="h26-hero-svg" viewBox="0 0 560 270" aria-hidden="true">
      <defs>
        <linearGradient id="rb1" x1="0" x2="1"><stop offset="0" stop-color="#ffb4cf"/><stop offset="1" stop-color="#ffdce8"/></linearGradient>
        <linearGradient id="rb2" x1="0" x2="1"><stop offset="0" stop-color="#ffd87c"/><stop offset="1" stop-color="#ffeaae"/></linearGradient>
        <linearGradient id="rb3" x1="0" x2="1"><stop offset="0" stop-color="#82ddc9"/><stop offset="1" stop-color="#c4f1e7"/></linearGradient>
        <linearGradient id="rb4" x1="0" x2="1"><stop offset="0" stop-color="#b59af0"/><stop offset="1" stop-color="#ded2ff"/></linearGradient>
      </defs>
      <path d="M332 191c0-86 66-145 145-145" fill="none" stroke="url(#rb1)" stroke-width="18" stroke-linecap="round"/>
      <path d="M350 191c0-70 54-126 127-126" fill="none" stroke="url(#rb2)" stroke-width="16" stroke-linecap="round"/>
      <path d="M369 191c0-55 43-106 108-106" fill="none" stroke="url(#rb3)" stroke-width="15" stroke-linecap="round"/>
      <path d="M389 191c0-43 32-86 88-86" fill="none" stroke="url(#rb4)" stroke-width="14" stroke-linecap="round"/>
      <ellipse cx="294" cy="231" rx="162" ry="24" fill="#efbed0" opacity=".24"/>
      <g transform="translate(155,36)">
        <rect x="0" y="20" width="225" height="174" rx="24" fill="#fff" stroke="#d8d4df" stroke-width="3"/>
        <rect x="0" y="20" width="225" height="48" rx="24" fill="#f875a7"/>
        <rect x="0" y="52" width="225" height="16" fill="#f875a7"/>
        <g fill="#444b61"><rect x="34" y="0" width="13" height="42" rx="7"/><rect x="81" y="0" width="13" height="42" rx="7"/><rect x="128" y="0" width="13" height="42" rx="7"/><rect x="175" y="0" width="13" height="42" rx="7"/></g>
        <g stroke="#e6e2ea" stroke-width="2"><path d="M20 96h185M20 132h185M20 168h185"/><path d="M66 76v104M112 76v104M158 76v104"/></g>
        <path d="M39 102c7-12 24-5 24 6 0 12-12 20-24 29-12-9-24-17-24-29 0-11 17-18 24-6z" fill="#f46594"/>
        <circle cx="89" cy="112" r="10" fill="#59cbb7"/><path d="M76 139c2-12 8-17 13-17s11 5 13 17" fill="#59cbb7"/>
        <path d="M141 103l6 11 12 2-9 8 3 12-12-7-11 7 3-12-9-8 12-2z" fill="#f4be4e"/>
        <circle cx="84" cy="157" r="7" fill="#58b6df"/>
        <path d="M124 153l10 10 20-24" fill="none" stroke="#9a7be2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="179" cy="158" r="7" fill="#f07aa6"/>
      </g>
      <g transform="translate(347,140)">
        <circle cx="70" cy="70" r="63" fill="#fff" stroke="#ef86ad" stroke-width="11"/>
        <circle cx="70" cy="70" r="47" fill="#fff7fb"/>
        <path d="M70 70V38M70 70l23 13" stroke="#ef5f98" stroke-width="7" stroke-linecap="round"/>
        <g stroke="#ef5f98" stroke-width="4" stroke-linecap="round"><path d="M70 20v8M70 112v8M20 70h8M112 70h8"/></g>
      </g>
      <g fill="#fff"><circle cx="455" cy="211" r="24"/><circle cx="486" cy="204" r="32"/><circle cx="518" cy="215" r="22"/><rect x="447" y="211" width="89" height="25" rx="12"/></g>
      <g fill="#64cdbb"><path d="M122 198c-8-34 1-66 27-90 0 39-7 68-27 90z"/><path d="M121 199c-30-23-46-53-38-88 29 28 42 57 38 88z"/><path d="M122 199c18-28 43-45 73-48-14 33-39 48-73 48z"/></g>
    </svg>`;
  }

  let routeBusy = false;

  function go(page){
    if(routeBusy) return;
    routeBusy = true;

    document.documentElement.classList.add("v271-routing");

    /* Let Safari paint the pressed state first, then switch page. */
    requestAnimationFrame(function(){
      try{
        if(typeof window.showPage==="function"){
          window.showPage(page,true);
        }else{
          document.querySelectorAll(".page-view").forEach(function(v){
            v.classList.toggle("active",v.dataset.view===page);
          });
          document.querySelectorAll(".side-nav a[data-page]").forEach(function(a){
            a.classList.toggle("active",a.dataset.page===page);
          });
          if(location.hash!=="#"+page) history.replaceState(null,"","#"+page);
          window.scrollTo(0,0);
        }
      }finally{
        setTimeout(function(){
          routeBusy = false;
          document.documentElement.classList.remove("v271-routing");
        }, 80);
      }
    });
  }

  let calDate=new Date();

  function holidayData(){
    try{
      if(window.state && window.state.holidays) return window.state.holidays;
      if(window.holidays) return window.holidays;
    }catch(e){}
    return {};
  }

  function renderCalendar(){
    const host=$("h26Calendar"), label=$("h26Month");
    if(!host) return;
    const y=calDate.getFullYear(), m=calDate.getMonth(), now=new Date();
    const names=["อา","จ","อ","พ","พฤ","ศ","ส"];
    const holidays=holidayData();
    let html=names.map(x=>`<div class="h26-day hd">${x}</div>`).join("");
    const first=new Date(y,m,1).getDay(), total=new Date(y,m+1,0).getDate();
    for(let i=0;i<first;i++) html+=`<div class="h26-day"></div>`;
    for(let d=1;d<=total;d++){
      const dt=new Date(y,m,d);
      const k=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const cls=["h26-day"];
      if(dt.getDay()===0||dt.getDay()===6) cls.push("weekend");
      if(holidays && holidays[k]) cls.push("holiday");
      if(now.getFullYear()===y&&now.getMonth()===m&&now.getDate()===d) cls.push("today");
      html+=`<div class="${cls.join(" ")}">${d}</div>`;
    }
    host.innerHTML=html;
    label.textContent=["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"][m]+" "+(y+543);
  }

  function val(id,fallback){
    const e=$(id);
    if(!e) return fallback;
    return (e.textContent||"").trim()||fallback;
  }

  function rebuild(){
    const page=$("page-home");
    if(!page || page.dataset.h26Built==="1") return;

    /* V28.3 IMPORTANT:
       #status belongs to the main app/login flow.
       Preserve it before rebuilding Home so setStatus() never receives null. */
    let statusNode = document.getElementById("status");
    if(!statusNode){
      statusNode = document.createElement("div");
      statusNode.id = "status";
      statusNode.className = "status no-print";
      statusNode.style.display = "none";
      statusNode.textContent = "กำลังเริ่มระบบ...";
    }else{
      statusNode.remove();
    }

    page.dataset.h26Built="1";

    page.innerHTML=`
    <div class="h26">
      <section class="h26-hero">
        <span class="h26-spark a">✦</span><span class="h26-spark b">✧</span><span class="h26-spark c">✦</span>
        <div class="h26-hero-copy">
          <div class="h26-eyebrow">ยินดีต้อนรับสู่</div>
          <div class="h26-title">ระบบจัดตารางเวร</div>
          <div class="h26-sub">ช่วยจัดเวรให้ง่าย ยุติธรรม แม่นยำ</div>
          <div class="h26-desc">ประหยัดเวลา ลดความซับซ้อน จัดตารางเวรได้อย่างเป็นระบบ</div>
          <button class="h26-start" id="h26Start">☆ เริ่มจัดเวรง่ายๆ ได้เลย!</button>
        </div>
        <div class="h26-hero-art">${heroSvg()}</div>
      </section>

      <section class="h26-stats">
        <div class="h26-card h26-stat pink" data-go="people">
          <div class="h26-stat-icon">${svg.people}</div>
          <div><div class="h26-stat-label">บุคลากรทั้งหมด</div><div class="h26-stat-value"><span id="h26People">27</span><small>คน</small></div><div class="h26-stat-note">ข้อมูลผู้ใช้งานปัจจุบัน</div></div>
        </div>
        <div class="h26-card h26-stat mint" data-go="summary">
          <div class="h26-stat-icon">${svg.calendar}</div>
          <div><div class="h26-stat-label">เวรเดือนนี้</div><div class="h26-stat-value"><span id="h26Duty">414</span><small>เวร</small></div><div class="h26-stat-note">กำลังอัปเดตตามตาราง</div></div>
        </div>
        <div class="h26-card h26-stat yellow" data-go="holidays">
          <div class="h26-stat-icon">${svg.umbrella}</div>
          <div><div class="h26-stat-label">วันหยุดเดือนนี้</div><div class="h26-stat-value"><span id="h26Holiday">0</span><small>วัน</small></div><div class="h26-stat-note">รวมวันหยุดที่บันทึก</div></div>
        </div>
        <div class="h26-card h26-stat violet" data-go="rules">
          <div class="h26-stat-icon">${svg.shield}</div>
          <div><div class="h26-stat-label">กฎสำคัญ</div><div class="h26-stat-value"><span id="h26Rules">21</span><small>ข้อ</small></div><div class="h26-stat-note">กฎที่ใช้ตรวจเวร</div></div>
        </div>
      </section>

      <section class="h26-middle">
        <div class="h26-card h26-section">
          <div class="h26-head">
            <h3>🗓 ปฏิทินเดือนนี้</h3>
            <div class="h26-monthnav"><button id="h26Prev">‹</button><b id="h26Month"></b><button id="h26Next">›</button></div>
          </div>
          <div class="h26-calendar" id="h26Calendar"></div>
          <div class="h26-legends"><span><i class="h26-dot p"></i>วันหยุด/นักขัตฤกษ์</span><span><i class="h26-dot m"></i>วันนี้</span></div>
        </div>

        <div class="h26-card h26-shortcuts-wrap">
          <div class="h26-head"><h3>⭐ ทางลัดการใช้งาน</h3></div>
          <div class="h26-shortcuts">
            <button class="h26-shortcut pink" data-go="roster"><span class="h26-shortcut-icon">${svg.wand}</span><span><b>เริ่มจัดตาราง</b><small>สร้างตารางเวรใหม่</small></span></button>
            <button class="h26-shortcut mint" data-go="history"><span class="h26-shortcut-icon">${svg.folder}</span><span><b>เปิดตารางเดิม</b><small>แก้ไข/ดูตารางเดิม</small></span></button>
            <button class="h26-shortcut violet" data-go="rules"><span class="h26-shortcut-icon">${svg.clipboard}</span><span><b>ตรวจสอบกฎ</b><small>เช็กความถูกต้องก่อนจัด</small></span></button>
            <button class="h26-shortcut yellow" data-go="summary"><span class="h26-shortcut-icon">${svg.report}</span><span><b>ดูรายงาน</b><small>สรุปผลการจัดเวร</small></span></button>
          </div>
        </div>
      </section>

      <section class="h26-bottom">
        <div class="h26-card h26-section">
          <div class="h26-head"><h3>📣 ประกาศ / แจ้งเตือนล่าสุด</h3><button class="h26-more" id="h26More">ดูทั้งหมด</button></div>
          <div class="h26-news">
            <div class="h26-news-item"><i class="h26-news-dot" style="background:#f26999"></i><span>ตรวจสอบวันหยุดและข้อมูลบุคลากรก่อนเริ่มจัดตาราง</span><span class="h26-news-time">ล่าสุด</span></div>
            <div class="h26-news-item"><i class="h26-news-dot" style="background:#5dcdb9"></i><span>ระบบบันทึก Workflow และ Audit Log อัตโนมัติ</span><span class="h26-news-time">ระบบ</span></div>
            <div class="h26-news-item"><i class="h26-news-dot" style="background:#f1bd4d"></i><span>กฎสำคัญพร้อมใช้ตรวจสอบการจัดเวร</span><span class="h26-news-time">กฎ</span></div>
            <div class="h26-news-item"><i class="h26-news-dot" style="background:#9c7fe1"></i><span>ตรวจสอบประวัติการจัดเวรย้อนหลังได้ทุกเดือน</span><span class="h26-news-time">ประวัติ</span></div>
          </div>
        </div>

        <div class="h26-card h26-section">
          <div class="h26-head"><h3>✨ ภาพรวมขั้นตอนการทำงาน</h3></div>
          <div class="h26-flow">
            <div class="h26-step"><div class="h26-num h26-n1">1</div><div class="h26-step-icon h26-i1">${svg.folder}</div><b>เตรียมข้อมูล</b><small>นำเข้าข้อมูลพนักงาน</small></div>
            <div class="h26-arrow">→</div>
            <div class="h26-step"><div class="h26-num h26-n2">2</div><div class="h26-step-icon h26-i2">${svg.calendar}</div><b>จัดตาราง</b><small>จัดเวรตามกฎ</small></div>
            <div class="h26-arrow">→</div>
            <div class="h26-step"><div class="h26-num h26-n3">3</div><div class="h26-step-icon h26-i3">${svg.search}</div><b>ตรวจเวร</b><small>ตรวจสอบความถูกต้อง</small></div>
            <div class="h26-arrow">→</div>
            <div class="h26-step"><div class="h26-num h26-n4">4</div><div class="h26-step-icon h26-i4">${svg.approve}</div><b>อนุมัติ</b><small>ผู้มีอำนาจอนุมัติ</small></div>
            <div class="h26-arrow">→</div>
            <div class="h26-step"><div class="h26-num h26-n5">5</div><div class="h26-step-icon h26-i5">${svg.lock}</div><b>ล็อกตาราง</b><small>ยืนยันและล็อกตาราง</small></div>
          </div>
        </div>

        <div class="h26-card h26-section">
          <div class="h26-head"><h3>💡 เคล็ดลับการจัดเวร</h3></div>
          <div class="h26-tips">
            <div class="h26-tip"><span class="h26-check">✓</span><span>กำหนดกฎให้ชัดเจน ลดปัญหาการจัดเวรซ้ำซ้อน</span></div>
            <div class="h26-tip"><span class="h26-check">✓</span><span>ตรวจสอบความสมดุลของเวรแต่ละคน</span></div>
            <div class="h26-tip"><span class="h26-check">✓</span><span>ใช้การวิเคราะห์เพื่อวางแผนเวรให้เหมาะสม</span></div>
            <div class="h26-tip"><span class="h26-check">✓</span><span>สื่อสารและประกาศตารางล่วงหน้าอย่างน้อย 7 วัน</span></div>
            <div class="h26-tip"><span class="h26-check">✓</span><span>ทบทวนและปรับปรุงกฎอย่างสม่ำเสมอ</span></div>
          </div>
          <div class="h26-watermark">Supaporn ✧ MALAWAS</div>
        </div>
      </section>

      <div class="h26-version">V28.3 • Home One Frame</div>
    </div>`;

    /* Put the shared app status node back after rebuilding Home. */
    page.prepend(statusNode);

    page.querySelectorAll("[data-go]").forEach(el=>el.addEventListener("click",()=>go(el.dataset.go)));
    $("h26Start").onclick=()=>go("roster");
    $("h26More").onclick=()=>go("history");
    $("h26Prev").onclick=()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()-1,1);renderCalendar()};
    $("h26Next").onclick=()=>{calDate=new Date(calDate.getFullYear(),calDate.getMonth()+1,1);renderCalendar()};
    renderCalendar();
    syncStats();
  }

  function syncStats(){
    // Best-effort sync with existing data/functions without breaking anything.
    try{
      const st=window.state||{};
      if(Array.isArray(st.names) && st.names.length) $("h26People").textContent=st.names.filter(Boolean).length;
      else if(Array.isArray(st.people) && st.people.length) $("h26People").textContent=st.people.length;

      const h=holidayData();
      if(h && typeof h==="object"){
        const y=calDate.getFullYear(), m=calDate.getMonth();
        let n=0;
        Object.keys(h).forEach(k=>{
          const d=new Date(k+"T00:00:00");
          if(!isNaN(d)&&d.getFullYear()===y&&d.getMonth()===m)n++;
        });
        $("h26Holiday").textContent=n;
      }

      const knownPeople = val("dashPeople","");
      if(knownPeople) $("h26People").textContent=knownPeople;
      const knownTotal = val("dashTotal","");
      if(knownTotal) $("h26Duty").textContent=knownTotal;
    }catch(e){}
  }

  function updateVersionEverywhere(){
    document.querySelectorAll("body *").forEach(el=>{
      if(el.children.length===0 && /V24\.5/.test(el.textContent||"")){
        el.textContent=(el.textContent||"").replace(/V24\\.5/g,"V28.3");
      }
    });
  }

  function init(){
    rebuild();
    updateVersionEverywhere();
    setTimeout(function(){
      syncStats();
      renderCalendar();
      updateVersionEverywhere();
    }, 300);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();