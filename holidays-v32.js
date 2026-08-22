/* HOLIDAYS V32 — isolated UI controller */
(function(){
  'use strict';
  var B=window.__ROSTER_HOLIDAYS_V32__;
  if(!B)return;
  var editKey='';
  var auditKey='roster_holiday_audit_v32';
  function $(id){return document.getElementById(id)}
  function esc(s){return B.escape?B.escape(String(s==null?'':s)):String(s==null?'':s)}
  function state(){return B.getState()||{holidays:{}}}
  function typeLabel(t){return t==='substitute'?'วันหยุดชดเชย':t==='special'?'วันหยุดพิเศษ':'นักขัตฤกษ์'}
  function iconFor(name,type){
    var s=String(name||'');
    if(/วิสาข|มาฆ|อาสาฬห/.test(s))return '🛕';
    if(/ฉัตรมงคล|จักรี|ราช/.test(s))return '♛';
    if(/พืชมงคล/.test(s))return '🌼';
    if(/เฉลิม|วันแม่|วันพ่อ/.test(s))return '🎗️';
    return type==='special'?'✨':type==='substitute'?'🌟':'🎁';
  }
  function current(){return B.current()}
  function monthKeys(){
    var c=current(),prefix=c.key+'-';
    return Object.keys(state().holidays||{}).filter(function(k){return k.indexOf(prefix)===0}).sort();
  }
  function readAudit(){try{return JSON.parse(localStorage.getItem(auditKey)||'[]')}catch(e){return []}}
  function writeAudit(action,name){
    var u=B.getUser?B.getUser():{name:'ผู้จัดตารางเวร',username:'admin'};
    var arr=readAudit();arr.unshift({at:new Date().toISOString(),who:u.name||u.username||'ผู้จัดตารางเวร',action:action,name:name||''});arr=arr.slice(0,20);
    try{localStorage.setItem(auditKey,JSON.stringify(arr))}catch(e){}
  }
  function formatThaiDate(k){
    var p=k.split('-'),d=parseInt(p[2],10),m=parseInt(p[1],10),y=parseInt(p[0],10)+543;
    var days=['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
    var wd=new Date(parseInt(p[0],10),parseInt(p[1],10)-1,d).getDay();
    return days[wd]+' '+d+'/'+m+'/'+y;
  }
  function renderUpcoming(){
    var box=$('holidayUpcomingV24');if(!box)return;
    var keys=monthKeys(),all=$('holidayShowAllV32')&&$('holidayShowAllV32').dataset.all==='1';
    var show=all?keys:keys.slice(0,5);
    if(!show.length){box.innerHTML='<div style="display:block;padding:18px;text-align:center;color:#9aa1ad">เดือนนี้ยังไม่มีวันหยุดที่เพิ่มไว้</div>';return}
    box.innerHTML=show.map(function(k){var item=state().holidays[k]||{},t=item.type||'official';return '<div data-key="'+k+'"><span class="h32-event-icon">'+iconFor(item.name,t)+'</span><span class="h32-event-name"><b>'+esc(item.name||'วันหยุด')+'</b></span><span class="h32-event-date">'+formatThaiDate(k)+'</span><span class="h32-type-badge '+t+'">'+typeLabel(t)+'</span><button type="button" class="h32-edit-event" data-edit="'+k+'">แก้ไข</button></div>'}).join('');
    box.querySelectorAll('[data-edit]').forEach(function(btn){btn.onclick=function(){loadEdit(this.dataset.edit)}});
    if($('holidayUpcomingFootV32'))$('holidayUpcomingFootV32').textContent='▦ มีวันหยุดที่กำลังจะมาถึง '+keys.length+' รายการในเดือนนี้';
  }
  function renderAudit(){
    var box=$('holidayAuditV24');if(!box)return;var arr=readAudit(),all=$('holidayAuditAllV32')&&$('holidayAuditAllV32').dataset.all==='1';arr=(all?arr:arr.slice(0,4));
    box.innerHTML=arr.length?arr.map(function(x){var d=new Date(x.at),date=(d.getDate()+'/'+(d.getMonth()+1)+'/'+String(d.getFullYear()+543).slice(-2)+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'));return '<div><span class="h32-audit-avatar">👤</span><span class="h32-audit-main"><b>'+esc(x.who)+'</b><span>'+esc(x.action)+' “'+esc(x.name)+'”</span></span><span class="h32-audit-time">'+date+'</span></div>'}).join(''):'<div style="display:block;text-align:center;color:#9aa1ad">ยังไม่มีประวัติการแก้ไข</div>';
  }
  function renderSummaryNote(){var c=current();if($('holidaySummaryNoteV32'))$('holidaySummaryNoteV32').textContent='* ข้อมูลสำหรับเดือน '+(c.month+1)+' / '+c.thaiYear}
  function refresh(){try{B.renderHoliday()}catch(e){}renderUpcoming();renderAudit();renderSummaryNote()}
  function clearForm(){editKey='';if($('holidayName'))$('holidayName').value='';if($('holidayDate'))$('holidayDate').value='';if($('holidayTypeV24'))$('holidayTypeV24').value='official';if($('holidayEditHintV32'))$('holidayEditHintV32').hidden=true;if($('addHolidayBtn'))$('addHolidayBtn').textContent='＋ เพิ่มวันหยุด'}
  function loadEdit(k){var item=state().holidays[k];if(!item)return;editKey=k;$('holidayName').value=item.name||'';$('holidayDate').value=k;$('holidayTypeV24').value=item.type||'official';$('holidayEditHintV32').hidden=false;$('addHolidayBtn').textContent='✓ บันทึกวันหยุด';$('holidayName').focus();window.scrollTo({top:$('holidayName').getBoundingClientRect().top+window.scrollY-160,behavior:'smooth'})}
  function saveFromForm(ev){
    if(ev)ev.preventDefault();var name=$('holidayName').value.trim(),date=$('holidayDate').value,type=$('holidayTypeV24').value||'official';if(!date){alert('กรุณาเลือกวันที่');return}
    if(!name){alert('กรุณากรอกชื่อวันหยุด');return}
    var s=state();s.holidays=s.holidays||{};if(editKey&&editKey!==date)delete s.holidays[editKey];s.holidays[date]={name:name,type:type};
    try{B.saveConfig()}catch(e){};writeAudit(editKey?'แก้ไขวันหยุด':'เพิ่มวันหยุด',name);editKey='';clearForm();try{B.renderHolidays()}catch(e){refresh()}try{B.renderSheet()}catch(e){}setTimeout(refresh,20)
  }
  function setToday(){var d=new Date(),m=d.getMonth(),y=d.getFullYear();B.setMonth(y,m);setTimeout(refresh,20)}
  function wire(){
    var add=$('addHolidayBtn');if(add){add.onclick=saveFromForm;add.style.pointerEvents='auto'}
    if($('holidayClearV32'))$('holidayClearV32').onclick=clearForm;
    if($('holidayTodayV32'))$('holidayTodayV32').onclick=setToday;
    if($('holidayShowAllV32'))$('holidayShowAllV32').onclick=function(){this.dataset.all=this.dataset.all==='1'?'0':'1';this.textContent=this.dataset.all==='1'?'ย่อรายการ':'ดูทั้งหมด';renderUpcoming()};
    if($('holidayAuditAllV32'))$('holidayAuditAllV32').onclick=function(){this.dataset.all=this.dataset.all==='1'?'0':'1';this.textContent=this.dataset.all==='1'?'ย่อรายการ':'ดูทั้งหมด';renderAudit()};
    ['holidayPrevMonthV24','holidayNextMonthV24'].forEach(function(id){var b=$(id);if(b)b.addEventListener('click',function(){setTimeout(refresh,30)})});
    var cal=$('holidayCalendarV24');if(cal)cal.addEventListener('click',function(ev){var cell=ev.target.closest('[title]');if(!cell)return});
    refresh();
  }
  window.HolidaysV32={refresh:refresh,loadEdit:loadEdit,clearForm:clearForm};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
  window.addEventListener('pageshow',function(){setTimeout(refresh,20)});
})();
