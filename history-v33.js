/* BUILD: HISTORY V33.8 FULL ICON + FOOTER 2026-08-25 */
/* HISTORY V33.8 — compact pastel layout + cute icons + bottom-right version */
(function(){
  'use strict';
  var B=window.__ROSTER_HISTORY_V33__;
  if(!B)return;

  var page=1,pageSize=5,records=[],filtered=[],recentAll=false,auditAll=false;
  var MONTHS=Array.isArray(B.months)?B.months:[];

  function $(id){return document.getElementById(id)}
  function esc(v){return B.escape?B.escape(String(v==null?'':v)):String(v==null?'':v)}
  function fmt(v){return v?(B.formatTime?B.formatTime(v):String(v)):'-'}
  function pct(n,d){return d?Math.round(n/d*100):0}
  function statusLabel(s){return {locked:'ล็อกแล้ว',approved:'อนุมัติแล้ว',submitted:'ส่งตรวจแล้ว',draft:'ร่างตาราง'}[s]||s}
  function workflowStatus(d){if(d&&d.workflow&&d.workflow.locked)return 'locked';return d&&d.workflow&&d.workflow.status||'draft'}
  function unitName(){var u=B.getUnit?B.getUnit():{};return u.name||'หน่วยงานหลัก'}
  function schedulerName(d){var a=d&&d.workflow&&Array.isArray(d.workflow.audit)?d.workflow.audit:[];for(var i=0;i<a.length;i++)if(a[i].user)return a[i].user;var u=B.getUnit?B.getUnit():{};return u.scheduler||'ผู้จัดตารางเวร'}
  function findAudit(d,words){var a=d&&d.workflow&&Array.isArray(d.workflow.audit)?d.workflow.audit:[];for(var i=0;i<a.length;i++){var t=String(a[i].action||'');if(words.some(function(w){return t.indexOf(w)>=0}))return a[i]}return null}
  function noteFor(d){var s=workflowStatus(d);if(s==='locked')return 'ตารางประจำเดือน';if(s==='approved')return 'อนุมัติแล้ว';if(s==='submitted')return 'รออนุมัติ';return 'ร่างแรก'}

  function iconSvg(name){
    var icons={
      clipboard:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="13" y="13" width="38" height="41" rx="12" fill="#ffdce9"/><rect x="22" y="8" width="20" height="11" rx="5.5" fill="#f47fac"/><rect x="20" y="27" width="24" height="4" rx="2" fill="#fff"/><rect x="20" y="35" width="20" height="4" rx="2" fill="#fff"/><rect x="20" y="43" width="15" height="4" rx="2" fill="#fff"/></svg>',
      calendarPink:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="11" y="14" width="42" height="39" rx="12" fill="#fff"/><path d="M11 25V20c0-3.3 2.7-6 6-6h30c3.3 0 6 2.7 6 6v5H11Z" fill="#f78eb5"/><rect x="20" y="8" width="4" height="11" rx="2" fill="#db6f9a"/><rect x="40" y="8" width="4" height="11" rx="2" fill="#db6f9a"/><rect x="19" y="32" width="8" height="8" rx="3" fill="#ffc7da"/><rect x="31" y="32" width="8" height="8" rx="3" fill="#ffe1ec"/><rect x="43" y="32" width="4" height="8" rx="2" fill="#ffe1ec"/></svg>',
      calendarMint:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="11" y="14" width="42" height="39" rx="12" fill="#fff"/><path d="M11 25V20c0-3.3 2.7-6 6-6h30c3.3 0 6 2.7 6 6v5H11Z" fill="#78d9be"/><rect x="20" y="8" width="4" height="11" rx="2" fill="#44b28f"/><rect x="40" y="8" width="4" height="11" rx="2" fill="#44b28f"/><rect x="19" y="32" width="8" height="8" rx="3" fill="#bdeedc"/><rect x="31" y="32" width="8" height="8" rx="3" fill="#dff8ef"/><rect x="43" y="32" width="4" height="8" rx="2" fill="#dff8ef"/></svg>',
      shield:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 9 50 16v12c0 12-7 20-18 26-11-6-18-14-18-26V16L32 9Z" fill="#e8dbff" stroke="#b48cf0" stroke-width="2.2"/><path d="m32 20 3.5 7.1 7.8 1.1-5.6 5.5 1.3 7.7-7-3.7-7 3.7 1.3-7.7-5.6-5.5 7.8-1.1L32 20Z" fill="#fff"/></svg>',
      lock:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="15" y="28" width="34" height="25" rx="9" fill="#ffe8a9"/><path d="M23 28v-5c0-6 3.8-10 9-10s9 4 9 10v5" fill="none" stroke="#e3ae1d" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="40" r="3.4" fill="#d79b00"/></svg>',
      check:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="20" fill="#d8f7e7"/><path d="m23 32 6 6 12-13" fill="none" stroke="#34ad82" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      send:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="20" fill="#ddecff"/><path d="m20 32 24-11-7 22-6-8-11-3Z" fill="#6aa8ef"/></svg>',
      edit:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="20" fill="#ffedc8"/><path d="m23 40 2-8 13-13 6 6-13 13-8 2Z" fill="#e0a526"/><path d="m36 21 6 6" fill="none" stroke="#bd8610" stroke-width="3" stroke-linecap="round"/></svg>',
      history:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="22" fill="#eaf5ff"/><circle cx="32" cy="32" r="16" fill="#fff" stroke="#69aee8" stroke-width="4"/><path d="M32 21v12l8 5" fill="none" stroke="#4b98d6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="32" r="2.8" fill="#4b98d6"/></svg>'
    };
    return icons[name]||'';
  }

  function shell(){
    var root=$('page-history');if(!root)return;
    root.innerHTML=''+
      '<div class="h33-shell">'+
        '<header class="h33-page-head">'+
          '<div class="h33-title-wrap">'+
            '<div class="h33-title-icon" aria-hidden="true">'+iconSvg('history')+'</div>'+
            '<div><h2>ประวัติการจัดเวร</h2><p>ค้นหา เปิดดู และตรวจสอบตารางเวรย้อนหลัง</p></div>'+
          '</div>'+
        '</header>'+
        '<section class="h33-card h33-filter-card"><div class="h33-filters">'+
          '<label class="h33-search"><span>ค้นหาชื่อหน่วยงาน, ผู้จัดเวร, หมายเหตุ...</span><div><input id="historySearchV24" type="search" placeholder="ค้นหา..."><b class="search-glyph">⌕</b></div></label>'+
          '<label><span>เดือน</span><select id="historyMonthV33"></select></label><label><span>ปี</span><select id="historyYearSelectV33"></select></label>'+
          '<label><span>สถานะ</span><select id="historyStatusV24"><option value="all">ทั้งหมด</option><option value="locked">ล็อกแล้ว</option><option value="approved">อนุมัติแล้ว</option><option value="submitted">ส่งตรวจแล้ว</option><option value="draft">ร่างตาราง</option></select></label>'+
          '<label><span>หน่วยงาน</span><select id="historyUnitV33"></select></label>'+
          '<div class="h33-filter-actions"><button id="historyRefreshBtn" class="h33-btn search">⌕ ค้นหา</button><button id="historyResetV33" class="h33-btn reset">ล้างตัวกรอง</button><button id="historyExportV33" class="h33-btn export">ส่งออก</button></div>'+
        '</div></section>'+
        '<section class="h33-stat-grid">'+
          '<article class="h33-stat pink"><div class="h33-stat-icon">'+iconSvg('clipboard')+'</div><div class="h33-stat-copy"><small>จำนวนประวัติทั้งหมด</small><b id="historyTotalV24">0</b><em>รายการ</em></div></article>'+
          '<article class="h33-stat mint"><div class="h33-stat-icon">'+iconSvg('calendarMint')+'</div><div class="h33-stat-copy"><small>เดือนที่บันทึกล่าสุด</small><b id="historyLatestV24">-</b><em id="historyLatestDateV33">-</em></div></article>'+
          '<article class="h33-stat purple"><div class="h33-stat-icon">'+iconSvg('shield')+'</div><div class="h33-stat-copy"><small>ตารางที่อนุมัติแล้ว</small><b id="historyApprovedV24">0</b><em id="historyApprovedPctV33">0%</em></div></article>'+
          '<article class="h33-stat yellow"><div class="h33-stat-icon">'+iconSvg('lock')+'</div><div class="h33-stat-copy"><small>ตารางที่ล็อกแล้ว</small><b id="historyLockedV24">0</b><em id="historyLockedPctV33">0%</em></div></article>'+
        '</section>'+
        '<section class="h33-card h33-table-card">'+
          '<div class="h33-card-head"><div class="h33-card-title"><span class="h33-card-mini-icon pink">'+iconSvg('calendarPink')+'</span><h3>ประวัติการจัดเวรย้อนหลัง</h3></div><span id="historyInfo" class="h33-muted"></span></div>'+
          '<div class="h33-table-wrap"><table class="h33-table"><thead><tr><th>เดือน/ปี</th><th>หน่วยงาน</th><th>สถานะ</th><th>ผู้จัดเวร</th><th>วันที่บันทึก</th><th>วันที่อนุมัติ</th><th>วันที่ล็อก</th><th>หมายเหตุ</th><th>จัดการ</th></tr></thead><tbody id="historyRowsV33"></tbody></table></div>'+
          '<div class="h33-table-footer"><span id="historyRangeV33">แสดง 0 - 0 จาก 0 รายการ</span><div id="historyPagerV33" class="h33-pagination"></div><label>แสดงต่อหน้า <select id="historyPageSizeV33"><option value="5">5</option><option value="10">10</option><option value="15">15</option></select></label></div>'+
          '<div id="historyViewer" class="history-viewer h33-viewer"><div class="history-viewer-head"><b id="historyViewerTitle">ประวัติ</b><button id="historyCloseViewerBtn" type="button">ปิด</button></div><div id="historyViewerBody" class="history-viewer-scroll"></div></div>'+
        '</section>'+
        '<section class="h33-bottom-grid">'+
          '<article class="h33-card h33-bottom-card"><div class="h33-card-head"><div class="h33-card-title"><span class="h33-card-mini-icon mint">'+iconSvg('calendarMint')+'</span><h3>ตารางที่เข้าดูล่าสุด</h3></div><button id="historyRecentAllV33" class="h33-link-btn">ดูทั้งหมด</button></div><div id="historyRecentV24" class="h33-recent-list"></div></article>'+
          '<article class="h33-card h33-bottom-card"><div class="h33-card-head"><div class="h33-card-title"><span class="h33-card-mini-icon purple">'+iconSvg('clipboard')+'</span><h3>ประวัติการทำรายการ (Audit Log)</h3></div><button id="historyAuditAllV33" class="h33-link-btn">ดูทั้งหมด</button></div><div id="historyAuditV24" class="h33-audit-list"></div></article>'+
        '</section>'+
        '<footer class="h33-history-footer"><span>V33.8 • History</span></footer>'+
      '</div>';
  }

  function buildRecords(){
    records=[];
    var years=B.getAvailableYears?B.getAvailableYears():[(B.getCurrent?B.getCurrent().year:2569)];
    years.forEach(function(y){
      var arr=B.getYearRecords?B.getYearRecords(y):[];
      arr.forEach(function(r){
        var d=r.data||{},ap=findAudit(d,['อนุมัติ']),lk=findAudit(d,['ล็อก']),sv=d.savedAt?{at:d.savedAt}:findAudit(d,['บันทึก']);
        records.push({year:y,month:r.month,data:d,status:workflowStatus(d),unit:unitName(),scheduler:schedulerName(d),savedAt:sv&&sv.at||d.savedAt||'',approvedAt:ap&&ap.at||'',lockedAt:lk&&lk.at||'',note:noteFor(d)});
      });
    });
    records.sort(function(a,b){
      if(Number(b.year)!==Number(a.year))return Number(b.year)-Number(a.year);
      if(Number(b.month)!==Number(a.month))return Number(b.month)-Number(a.month);
      return String(b.savedAt||'').localeCompare(String(a.savedAt||''));
    });
  }

  function setupFilters(){
    var ys=$('historyYearSelectV33'),ms=$('historyMonthV33'),unit=$('historyUnitV33');
    if(ms)ms.innerHTML='<option value="all">ทั้งหมด</option>'+MONTHS.map(function(x,i){return '<option value="'+i+'">'+esc(x)+'</option>'}).join('');
    if(ys){var years=B.getAvailableYears?B.getAvailableYears():[];ys.innerHTML='<option value="all">ทั้งหมด</option>'+years.map(function(y){return '<option value="'+y+'">'+y+'</option>'}).join('')}
    if(unit)unit.innerHTML='<option value="all">ทั้งหมด</option><option value="'+esc(unitName())+'">'+esc(unitName())+'</option>';
  }

  function applyFilters(){
    var q=($('historySearchV24')&&$('historySearchV24').value||'').trim().toLowerCase();
    var m=$('historyMonthV33')?$('historyMonthV33').value:'all';
    var y=$('historyYearSelectV33')?$('historyYearSelectV33').value:'all';
    var s=$('historyStatusV24')?$('historyStatusV24').value:'all';
    var u=$('historyUnitV33')?$('historyUnitV33').value:'all';
    filtered=records.filter(function(r){
      if(m!=='all'&&String(r.month)!==String(m))return false;
      if(y!=='all'&&String(r.year)!==String(y))return false;
      if(s!=='all'&&r.status!==s)return false;
      if(u!=='all'&&r.unit!==u)return false;
      if(q){var hay=[MONTHS[r.month],r.year,r.unit,r.scheduler,r.note,statusLabel(r.status)].join(' ').toLowerCase();if(hay.indexOf(q)<0)return false}
      return true;
    });
    page=1;renderAll();
  }

  function renderStats(){
    var total=filtered.length,approved=filtered.filter(function(r){return r.status==='approved'||r.status==='locked'}).length,locked=filtered.filter(function(r){return r.status==='locked'}).length,last=filtered[0];
    if($('historyTotalV24'))$('historyTotalV24').textContent=total;
    if($('historyLatestV24'))$('historyLatestV24').textContent=last?(MONTHS[last.month]+' '+last.year):'-';
    if($('historyLatestDateV33'))$('historyLatestDateV33').textContent=last&&last.savedAt?'บันทึกเมื่อ '+fmt(last.savedAt):'-';
    if($('historyApprovedV24'))$('historyApprovedV24').textContent=approved;
    if($('historyApprovedPctV33'))$('historyApprovedPctV33').textContent=approved+' รายการ ('+pct(approved,total)+'%)';
    if($('historyLockedV24'))$('historyLockedV24').textContent=locked;
    if($('historyLockedPctV33'))$('historyLockedPctV33').textContent=locked+' รายการ ('+pct(locked,total)+'%)';
  }

  function statusIcon(s){if(s==='locked')return '🔒';if(s==='approved')return '✅';if(s==='submitted')return '📨';return '📝'}

  function historyPeople(data){return Array.isArray(data&&data.peopleSnapshot)?data.peopleSnapshot:[]}
  function historyName(data,pid){var p=historyPeople(data).find(function(x){return x.id===pid});return p?p.name:(pid||'–')}
  function slotDefs(){
    return [
      {id:'v1',label:'เวร1'},{id:'v2',label:'เวร2'},{id:'ot1',label:'OT1'},{id:'ot2',label:'OT2'},
      {id:'s1d',label:'SDMC1 เช้า'},{id:'s1n',label:'SDMC1 บ่าย-ดึก'},{id:'s2d',label:'SDMC2 เช้า'},{id:'s2n',label:'SDMC2 บ่าย-ดึก'},
      {id:'s3d',label:'SDMC3 เช้า'},{id:'s3n',label:'SDMC3 บ่าย-ดึก'},{id:'s4d',label:'SDMC4 เช้า'},{id:'s4n',label:'SDMC4 บ่าย-ดึก'},
      {id:'s5l',label:'SDMC5 เช้า-บ่าย'},{id:'s6l',label:'SDMC6 เช้า-บ่าย'},{id:'s7e',label:'SDMC7 บ่าย'},{id:'s8e',label:'SDMC8 บ่าย'},
      {id:'e1',label:'EXTRA1'},{id:'e2',label:'EXTRA2'},{id:'e3',label:'EXTRA3'}
    ];
  }
  function keyFor(d,sid){return d+'|'+sid}
  function thaiDay(yThai,m,d){var w=new Date(yThai-543,m,d).getDay();return ['อ.','จ.','อ.','พ.','พฤ.','ศ.','ส.'][w]}
  function buildHistoryRosterTableHtml(r){
    var data=r&&r.data||{},a=data.assignments||{},slots=slotDefs(),days=new Date(r.year-543,r.month+1,0).getDate();
    var h='<div class="h33-full-roster-title">ตารางเวร เดือน'+esc(MONTHS[r.month])+' พ.ศ. '+esc(r.year)+'</div>'+
      '<div class="h33-full-roster-wrap"><table class="h33-full-roster-table"><thead><tr><th>วันที่</th><th>วัน</th>';
    slots.forEach(function(s){h+='<th>'+esc(s.label)+'</th>'});
    h+='</tr></thead><tbody>';
    for(var d=1;d<=days;d++){
      var wd=new Date(r.year-543,r.month,d).getDay(),rowClass=wd===0?' sun':wd===6?' sat':'';
      h+='<tr class="'+rowClass+'"><td>'+d+'</td><td>'+esc(thaiDay(r.year,r.month,d))+'</td>';
      slots.forEach(function(s){var pid=a[keyFor(d,s.id)];h+='<td>'+(pid?esc(historyName(data,pid)):'–')+'</td>'});
      h+='</tr>';
    }
    h+='</tbody></table></div>';
    if(data.pdfNote)h+='<div class="h33-full-roster-note"><b>หมายเหตุ:</b> '+esc(data.pdfNote)+'</div>';
    return h;
  }

  function prepareHistoryRosterPdfNode(r){
    var data=r.data||{},a=data.assignments||{},slots=slotDefs(),days=new Date(r.year-543,r.month+1,0).getDate();
    var wrap=document.createElement('div');
    wrap.style.position='fixed';wrap.style.left='-12000px';wrap.style.top='0';wrap.style.width='1700px';wrap.style.background='#fff';wrap.style.padding='0';
    var table=document.createElement('table');table.style.minWidth='0';table.style.width='1700px';table.style.tableLayout='fixed';table.style.borderCollapse='collapse';table.style.background='#fff';table.style.fontFamily='-apple-system,BlinkMacSystemFont,"Noto Sans Thai",Tahoma,Arial,sans-serif';
    var cap=document.createElement('caption');cap.textContent='ตารางเวร เดือน'+MONTHS[r.month]+' พ.ศ. '+r.year;cap.style.fontSize='21px';cap.style.fontWeight='800';cap.style.padding='4px 0 8px';table.appendChild(cap);
    var thead=document.createElement('thead'),tr=document.createElement('tr');['วันที่','วัน'].concat(slots.map(function(s){return s.label})).forEach(function(t){var th=document.createElement('th');th.textContent=t;th.style.position='static';th.style.fontWeight='800';th.style.fontSize='12.5px';th.style.lineHeight='1.08';th.style.padding='1.5px';th.style.height='23px';th.style.whiteSpace='nowrap';th.style.background='#e7e7ea';th.style.color='#111';th.style.border='1px solid #999';tr.appendChild(th)});thead.appendChild(tr);table.appendChild(thead);
    var tbody=document.createElement('tbody');
    for(var d=1;d<=days;d++){var row=document.createElement('tr');var wd=new Date(r.year-543,r.month,d).getDay();var shade=(wd===0||wd===6);[''+d,thaiDay(r.year,r.month,d)].concat(slots.map(function(s){var pid=a[keyFor(d,s.id)];return pid?historyName(data,pid):'–'})).forEach(function(v,i){var td=document.createElement('td');td.textContent=v;td.style.position='static';td.style.fontWeight=i===0?'800':'400';td.style.fontSize='12.2px';td.style.lineHeight='1.06';td.style.padding='1px';td.style.height='23px';td.style.whiteSpace='nowrap';td.style.textAlign='center';td.style.border='1px solid #999';td.style.background=shade?'#e6e6e6':'#fff';td.style.color='#111';if(i===0){td.style.width='50px';td.style.minWidth='50px';td.style.maxWidth='50px'}row.appendChild(td)});tbody.appendChild(row)}
    table.appendChild(tbody);wrap.appendChild(table);
    var noteBox=document.createElement('div');noteBox.style.marginTop='6px';noteBox.style.fontFamily='-apple-system,BlinkMacSystemFont,"Noto Sans Thai",Tahoma,Arial,sans-serif';noteBox.style.fontSize='13px';noteBox.style.lineHeight='1.25';noteBox.style.color='#111';noteBox.style.textAlign='left';noteBox.style.whiteSpace='pre-wrap';noteBox.innerHTML='<b>หมายเหตุ:</b> '+esc((data.pdfNote||'-'));wrap.appendChild(noteBox);
    document.body.appendChild(wrap);return wrap;
  }
  function saveHistoryRosterPdf(r){
    if(!r||!r.data)return;
    if(!(window.html2canvas&&window.jspdf&&window.jspdf.jsPDF)){alert('ไม่สามารถสร้าง PDF ได้ในขณะนี้');return}
    var wrap=prepareHistoryRosterPdfNode(r),table=wrap.querySelector('table');
    requestAnimationFrame(function(){
      try{
        var targetHeight=wrap.scrollWidth*(182/277),currentHeight=wrap.scrollHeight,rows=table.querySelectorAll('tbody tr');
        if(currentHeight<targetHeight&&rows.length){var extra=(targetHeight-currentHeight)/rows.length;rows.forEach(function(row){var h=row.getBoundingClientRect().height+extra;row.querySelectorAll('td').forEach(function(td){td.style.height=h+'px';td.style.verticalAlign='middle'})})}
      }catch(e){}
      html2canvas(wrap,{scale:2,useCORS:true,backgroundColor:'#fff',logging:false,windowWidth:1700}).then(function(canvas){
        var pdf=new window.jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
        var pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),maxW=pw-20,maxH=ph-28,scale=Math.min(maxW/canvas.width,maxH/canvas.height),w=canvas.width*scale,h=canvas.height*scale;
        pdf.addImage(canvas.toDataURL('image/jpeg',0.98),'JPEG',10,15,w,h,undefined,'FAST');
        pdf.save('ตารางเวร_'+MONTHS[r.month]+'_'+r.year+'.pdf');
        try{document.body.removeChild(wrap)}catch(e){}
      }).catch(function(err){try{document.body.removeChild(wrap)}catch(e){}alert('สร้าง PDF ไม่สำเร็จ: '+err.message)});
    });
  }

  function renderRows(){
    var body=$('historyRowsV33');if(!body)return;
    var start=(page-1)*pageSize,slice=filtered.slice(start,start+pageSize);
    body.innerHTML=slice.length?slice.map(function(r){return '<tr><td><div class="h33-month-cell"><span class="h33-month-ico h33-calendar-pink">'+iconSvg('calendarPink')+'</span><span>'+esc(MONTHS[r.month])+' '+r.year+'</span></div></td><td>'+esc(r.unit)+'</td><td><span class="h33-status '+r.status+'">'+statusIcon(r.status)+' '+statusLabel(r.status)+'</span></td><td><div class="h33-user"><span class="h33-avatar">👩🏻</span><span>'+esc(r.scheduler)+'</span></div></td><td>'+fmt(r.savedAt)+'</td><td>'+fmt(r.approvedAt)+'</td><td>'+fmt(r.lockedAt)+'</td><td>'+esc(r.note)+'</td><td><div class="h33-row-actions"><button class="h33-open" title="เปิดตารางเวรเต็มหน้า" data-open="'+r.year+'|'+r.month+'">เปิดดู</button><button class="h33-more h33-download" title="ดาวน์โหลด PDF ตารางเวร" aria-label="ดาวน์โหลด PDF ตารางเวร" data-download="'+r.year+'|'+r.month+'">↓</button></div></td></tr>'}).join(''):'<tr><td colspan="9" style="text-align:center;padding:34px;color:#98a1af">ไม่พบประวัติการจัดเวรตามตัวกรอง</td></tr>';
    body.querySelectorAll('[data-open]').forEach(function(b){b.onclick=function(){var p=this.dataset.open.split('|');openRecord(+p[0],+p[1],'roster')}});
    body.querySelectorAll('[data-download]').forEach(function(b){b.onclick=function(){var p=this.dataset.download.split('|'),y=+p[0],m=+p[1],r=records.find(function(x){return x.year===y&&x.month===m});if(r)saveHistoryRosterPdf(r)}});
    if($('historyRangeV33'))$('historyRangeV33').textContent='แสดง '+(slice.length?(start+1):0)+' - '+Math.min(start+pageSize,filtered.length)+' จาก '+filtered.length+' รายการ';
    renderPager();
  }

  function renderPager(){
    var host=$('historyPagerV33');if(!host)return;
    var pages=Math.max(1,Math.ceil(filtered.length/pageSize)),html='<button data-p="prev" '+(page<=1?'disabled':'')+'>‹</button>';
    for(var p=1;p<=pages;p++){if(p<=5||p===pages||Math.abs(p-page)<=1)html+='<button data-p="'+p+'" class="'+(p===page?'active':'')+'">'+p+'</button>';else if(p===6&&pages>7)html+='<span>…</span>'}
    html+='<button data-p="next" '+(page>=pages?'disabled':'')+'>›</button>';
    host.innerHTML=html;
    host.querySelectorAll('button').forEach(function(b){b.onclick=function(){var v=this.dataset.p;if(v==='prev')page=Math.max(1,page-1);else if(v==='next')page=Math.min(pages,page+1);else page=+v;renderRows()}});
  }

  function recentKey(){return 'roster_history_recent_v33'}
  function readRecent(){try{return JSON.parse(localStorage.getItem(recentKey())||'[]')}catch(e){return []}}
  function addRecent(y,m){var a=readRecent().filter(function(x){return !(x.year===y&&x.month===m)});a.unshift({year:y,month:m,at:new Date().toISOString()});try{localStorage.setItem(recentKey(),JSON.stringify(a.slice(0,30)))}catch(e){}renderRecent()}

  function openRecord(y,m,type){
    addRecent(y,m);
    var r=records.find(function(x){return x.year===y&&x.month===m});
    var v=$('historyViewer'),t=$('historyViewerTitle'),b=$('historyViewerBody');
    if(!v||!t||!b)return;
    if(!r||!r.data){t.textContent='ตารางรันเวร';b.innerHTML='<div class="h33-loading">ไม่พบข้อมูลตารางเวรของเดือนนี้</div>';v.classList.add('show');return}
    t.textContent='ตารางรันเวร • '+(MONTHS[m]||'')+' พ.ศ. '+y;
    b.innerHTML=buildHistoryRosterTableHtml(r);
    v.classList.add('show');
    document.documentElement.classList.add('h33-history-viewer-open');
  }

  function renderRecent(){
    var host=$('historyRecentV24');if(!host)return;
    var a=readRecent(),show=recentAll?a:a.slice(0,5);
    host.innerHTML=show.length?show.map(function(x){var r=records.find(function(z){return z.year===x.year&&z.month===x.month});return '<div class="h33-recent-item"><span class="h33-list-icon h33-calendar-mint">'+iconSvg('calendarMint')+'</span><span class="h33-list-main"><b>'+esc(MONTHS[x.month])+' '+x.year+'</b><small>'+esc(r?r.unit:unitName())+'</small></span><span class="h33-list-time">'+fmt(x.at)+' ›</span></div>'}).join(''):'<div style="padding:22px;text-align:center;color:#9aa3b1">ยังไม่มีรายการที่เข้าดูล่าสุด</div>';
  }

  function allAudit(){var out=[];records.forEach(function(r){var a=r.data&&r.data.workflow&&Array.isArray(r.data.workflow.audit)?r.data.workflow.audit:[];a.forEach(function(x){out.push({x:x,r:r})})});out.sort(function(a,b){return String(b.x.at||'').localeCompare(String(a.x.at||''))});return out}
  function auditStyle(action){var t=String(action||'');if(t.indexOf('ล็อก')>=0)return ['🔒','ล็อกตารางเวร','#8660d3'];if(t.indexOf('อนุมัติ')>=0)return ['✅','อนุมัติตารางเวร','#31aa80'];if(t.indexOf('ส่ง')>=0)return ['📨','ส่งตรวจตารางเวร','#4a9fe0'];if(t.indexOf('แก้')>=0)return ['✏️','แก้ไขตารางเวร','#ef6597'];return ['📝',t||'บันทึกร่างตารางเวร','#e3a12d']}
  function renderAudit(){var host=$('historyAuditV24');if(!host)return;var a=allAudit(),show=auditAll?a:a.slice(0,5);host.innerHTML=show.length?show.map(function(z){var st=auditStyle(z.x.action);return '<div class="h33-audit-item"><span class="h33-list-icon" style="background:'+st[2]+'16;color:'+st[2]+'">'+st[0]+'</span><span class="h33-list-main"><b style="color:'+st[2]+'">'+esc(st[1])+'</b><small>'+esc(MONTHS[z.r.month])+' '+z.r.year+' ('+esc(z.r.unit)+') · '+esc(z.x.user||z.r.scheduler)+'</small></span><span class="h33-list-time">'+fmt(z.x.at)+'</span></div>'}).join(''):'<div style="padding:22px;text-align:center;color:#9aa3b1">ยังไม่มี Audit Log</div>'}

  function renderAll(){renderStats();renderRows();renderRecent();renderAudit();if($('historyInfo'))$('historyInfo').textContent='พบ '+filtered.length+' รายการ'}
  function exportCsv(){var rows=[['เดือน/ปี','หน่วยงาน','สถานะ','ผู้จัดเวร','วันที่บันทึก','วันที่อนุมัติ','วันที่ล็อก','หมายเหตุ']];filtered.forEach(function(r){rows.push([MONTHS[r.month]+' '+r.year,r.unit,statusLabel(r.status),r.scheduler,fmt(r.savedAt),fmt(r.approvedAt),fmt(r.lockedAt),r.note])});var csv='\ufeff'+rows.map(function(row){return row.map(function(v){return '"'+String(v||'').replace(/"/g,'""')+'"'}).join(',')}).join('\n');var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='ประวัติการจัดเวร.csv';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)}
  function resetFilters(){if($('historySearchV24'))$('historySearchV24').value='';if($('historyMonthV33'))$('historyMonthV33').value='all';if($('historyYearSelectV33'))$('historyYearSelectV33').value='all';if($('historyStatusV24'))$('historyStatusV24').value='all';if($('historyUnitV33'))$('historyUnitV33').value='all';applyFilters()}

  function wire(){
    shell();setupFilters();buildRecords();filtered=records.slice();renderAll();
    ['historyMonthV33','historyYearSelectV33','historyStatusV24','historyUnitV33'].forEach(function(id){var e=$(id);if(e)e.onchange=applyFilters});
    if($('historySearchV24'))$('historySearchV24').oninput=applyFilters;
    if($('historyRefreshBtn'))$('historyRefreshBtn').onclick=function(){buildRecords();applyFilters()};
    if($('historyResetV33'))$('historyResetV33').onclick=resetFilters;
    if($('historyExportV33'))$('historyExportV33').onclick=exportCsv;
    if($('historyPageSizeV33'))$('historyPageSizeV33').onchange=function(){pageSize=+this.value||5;page=1;renderRows()};
    if($('historyRecentAllV33'))$('historyRecentAllV33').onclick=function(){recentAll=!recentAll;this.textContent=recentAll?'ย่อรายการ':'ดูทั้งหมด';renderRecent()};
    if($('historyAuditAllV33'))$('historyAuditAllV33').onclick=function(){auditAll=!auditAll;this.textContent=auditAll?'ย่อรายการ':'ดูทั้งหมด';renderAudit()};
    if($('historyCloseViewerBtn'))$('historyCloseViewerBtn').onclick=function(){var v=$('historyViewer');if(v)v.classList.remove('show');document.documentElement.classList.remove('h33-history-viewer-open')};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
  window.addEventListener('pageshow',function(){setTimeout(function(){buildRecords();applyFilters()},80)});
})();
