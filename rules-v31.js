/* RULES PAGE V31.1 — functional UI bridge + pastel animal tabs */
(function(){
'use strict';
var activeTab='general';
var lastValidationErrors=0;
var updatedAt=Date.now();
var DISABLED_KEY='roster_rules_disabled_v31';
var BACKUP_KEY='roster_rules_backup_v31';
var tabSets={
  general:['r1','r2','r3','r4','r5','r6','r7','r8'],
  constraints:['r9','r10','r11','r12','r13','r14','r15'],
  rotation:['r16','r17','r18','r19','r20','r21'],
  rest:['r1','r3','r5','r20']
};
var tabLabels={
 general:['กฎการจัดเวรทั่วไป','กำหนดกฎหลักที่ใช้กับทุกคนในระบบ'],
 personal:['กฎรายบุคคล','กำหนดเงื่อนไขเฉพาะสำหรับบุคลากรแต่ละคน'],
 constraints:['ข้อจำกัดเวร','กำหนดวันและเงื่อนไขของแต่ละประเภทเวร'],
 rotation:['การหมุนเวร','ควบคุมความยุติธรรม การหมุนคิว และข้อมูลเดือนก่อนหน้า'],
 rest:['การพักผ่อน','ตรวจเงื่อนไขการพักหลังเวรหนักและรอยต่อของตาราง'],
 other:['กฎอื่น ๆ','เพิ่มหรือจัดการเงื่อนไขเพิ่มเติมของระบบ']
};

var tabVisuals={
 general:{label:'กฎทั่วไป',cls:'r31-tab-general',animal:'dog'},
 personal:{label:'กฎรายบุคคล',cls:'r31-tab-personal',animal:'cat'},
 constraints:{label:'ข้อจำกัดเวร',cls:'r31-tab-constraints',animal:'pig'},
 rotation:{label:'การหมุนเวร',cls:'r31-tab-rotation',animal:'rabbit'},
 rest:{label:'การพักผ่อน',cls:'r31-tab-rest',animal:'elephant'},
 other:{label:'อื่นๆ',cls:'r31-tab-other',animal:'bear'}
};
function animalSvg(kind){
 var p={
  dog:'<path d="M12 17 7 11c-1.2-1.4-.6-3.5 1.2-4l5.8-1.6M36 17l5-6c1.2-1.4.6-3.5-1.2-4L34 5.4"/><path d="M13 14c3-5 7-7 11-7s8 2 11 7v12c0 8-5 14-11 14S13 34 13 26Z"/><circle cx="19" cy="22" r="1.4" fill="currentColor" stroke="none"/><circle cx="29" cy="22" r="1.4" fill="currentColor" stroke="none"/><path d="M21 28h6l-3 3Z"/><path d="M19 33c1.7 1.5 3.3 2 5 2s3.3-.5 5-2"/>',
  cat:'<path d="M13 16 10 7l9 5M35 16l3-9-9 5"/><path d="M12 18c0-6 5-10 12-10s12 4 12 10v9c0 8-5 13-12 13S12 35 12 27Z"/><circle cx="19" cy="23" r="1.3" fill="currentColor" stroke="none"/><circle cx="29" cy="23" r="1.3" fill="currentColor" stroke="none"/><path d="M21 28h6l-3 3Z"/><path d="M8 27h10M30 27h10M9 32l9-2M39 32l-9-2"/>',
  pig:'<path d="M14 14 10 8c5-.4 8 .8 10 3M34 14l4-6c-5-.4-8 .8-10 3"/><path d="M11 23c0-9 5-15 13-15s13 6 13 15v5c0 8-5 12-13 12S11 36 11 28Z"/><circle cx="18.5" cy="22" r="1.3" fill="currentColor" stroke="none"/><circle cx="29.5" cy="22" r="1.3" fill="currentColor" stroke="none"/><ellipse cx="24" cy="30" rx="7" ry="5"/><circle cx="21.5" cy="30" r="1" fill="currentColor" stroke="none"/><circle cx="26.5" cy="30" r="1" fill="currentColor" stroke="none"/>',
  rabbit:'<path d="M18 13C14 6 15 2 18 2c3 0 5 5 6 11M30 13c4-7 3-11 0-11-3 0-5 5-6 11"/><path d="M12 24c0-8 5-13 12-13s12 5 12 13v5c0 7-5 11-12 11S12 36 12 29Z"/><circle cx="19" cy="24" r="1.3" fill="currentColor" stroke="none"/><circle cx="29" cy="24" r="1.3" fill="currentColor" stroke="none"/><path d="M21 29h6l-3 3Z"/><path d="M24 32v4M20 35h8"/>',
  elephant:'<path d="M13 17c-4 0-7 3-7 8s4 9 9 9h2M35 17c4 0 7 3 7 8s-4 9-9 9h-2"/><path d="M13 19c0-7 4-11 11-11s11 4 11 11v8c0 4-2 7-5 9"/><path d="M18 36c-3-2-5-5-5-9"/><circle cx="19" cy="21" r="1.3" fill="currentColor" stroke="none"/><circle cx="29" cy="21" r="1.3" fill="currentColor" stroke="none"/><path d="M24 25v11c0 5 4 7 7 4 1.4-1.3 1.5-3 .8-4.5"/>',
  bear:'<circle cx="14" cy="13" r="6"/><circle cx="34" cy="13" r="6"/><path d="M11 23c0-9 5-14 13-14s13 5 13 14v5c0 8-5 12-13 12S11 36 11 28Z"/><circle cx="19" cy="22" r="1.3" fill="currentColor" stroke="none"/><circle cx="29" cy="22" r="1.3" fill="currentColor" stroke="none"/><ellipse cx="24" cy="29" rx="6" ry="5"/><path d="M22 28h4l-2 2Z"/><path d="M21 33c1 .8 2 .9 3 .9s2-.1 3-.9"/>'
 };
 return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">'+(p[kind]||p.bear)+'</svg>';
}
function decorateTabs(){
 document.querySelectorAll('#page-rules [data-r31-tab]').forEach(function(btn){
   var key=btn.dataset.r31Tab,v=tabVisuals[key];if(!v)return;
   Object.keys(tabVisuals).forEach(function(k){btn.classList.remove(tabVisuals[k].cls)});
   btn.classList.add(v.cls);
   btn.setAttribute('aria-label',v.label);
   btn.innerHTML='<span class="r31-tab-animal">'+animalSvg(v.animal)+'</span><span class="r31-tab-label">'+v.label+'</span>';
 });
}
var meta={
 r1:['เวลาราชการ (จันทร์–ศุกร์ ไม่รวมวันหยุดนักขัตฤกษ์)','◷','purple'],
 r2:['ห้ามชื่อซ้ำในวันเดียวกัน','♟','pink'],
 r3:['หลังขึ้นเวรบ่าย–ดึก วันถัดไปต้องพัก','☾','purple'],
 r4:['รายชื่อสุดท้าย จัดได้เฉพาะ EXTRA1–3','★','green'],
 r5:['หลีกเลี่ยงการจัดเวรหนักติดต่อกัน','⚖','blue'],
 r6:['แยกจัดเวรตามประเภท','▦','pink'],
 r7:['เวร1–2 จัดทุกวัน','◷','purple'],
 r8:['OT1–2 เฉพาะวันจันทร์–ศุกร์','▥','yellow'],
 r9:['SDMC เช้า1–4 เฉพาะวันหยุด','☀','blue'],
 r10:['SDMC บ่าย–ดึก1–4 จัดทุกวัน','☾','purple'],
 r11:['SDMC เช้า–บ่าย5–6 เฉพาะวันหยุด','◫','yellow'],
 r12:['SDMC บ่าย7–8 เฉพาะวันจันทร์–ศุกร์','◷','blue'],
 r13:['EXTRA1 จัดทุกวัน ยกเว้นนักขัตฤกษ์','1','pink'],
 r14:['EXTRA2 ไม่จัดศุกร์ เสาร์ และนักขัตฤกษ์','2','yellow'],
 r15:['EXTRA3 จัดทุกวัน','3','green'],
 r16:['กระจายเวรแต่ละประเภทอย่างยุติธรรม','⚖','blue'],
 r17:['หมุนเวียนตามลำดับรายชื่อ','↻','purple'],
 r18:['หมุนเวียนตำแหน่งภายในประเภทเวร','⟳','pink'],
 r19:['อ้างอิงตารางเวรของเดือนก่อนหน้า','▦','yellow'],
 r20:['ตรวจรอยต่อปลายเดือนกับต้นเดือนใหม่','⇄','green'],
 r21:['ควบคุมค่าเฉลี่ย 7 กลุ่มประเภทเวร','★','purple']
};
function A(){return window.__ROSTER_RULES_V31__||null}
function state(){var a=A();return a?a.getState():null}
function user(){var a=A();return a?a.getUser():{role:'viewer'}}
function isAdmin(){return user().role==='admin'}
function canEditCustom(){var r=user().role;return r==='admin'||r==='scheduler'}
function parseJSON(k,f){try{var x=JSON.parse(localStorage.getItem(k)||'');return x||f}catch(e){return f}}
function disabled(){return parseJSON(DISABLED_KEY,[])}
function backups(){return parseJSON(BACKUP_KEY,{})}
function setDisabledList(x){localStorage.setItem(DISABLED_KEY,JSON.stringify(x))}
function setBackups(x){localStorage.setItem(BACKUP_KEY,JSON.stringify(x))}
function activeMap(){var s=state(),m={};if(s)(s.rules||[]).forEach(function(r){m[r.id]=r});return m}
function defaultMap(){var a=A(),m={};if(a)(a.defaults||[]).forEach(function(r){m[r.id]=r});return m}
function allCatalog(){
 var am=activeMap(),dm=defaultMap(),bm=backups(),ids={};Object.keys(dm).forEach(function(k){ids[k]=1});Object.keys(am).forEach(function(k){ids[k]=1});Object.keys(bm).forEach(function(k){ids[k]=1});
 return Object.keys(ids).sort(function(a,b){return (parseInt(a.replace(/\D/g,''),10)||999)-(parseInt(b.replace(/\D/g,''),10)||999)}).map(function(id){return am[id]||bm[id]||dm[id]||{id:id,text:'กฎเพิ่มเติม'}});
}
function isActive(id){var s=state();return !!(s&&(s.rules||[]).some(function(r){return r.id===id}))}
function updateBackup(rule){var b=backups();b[rule.id]={id:rule.id,text:rule.text};setBackups(b)}
function saveAll(msg){var a=A();if(!a)return;updatedAt=Date.now();a.saveConfig();try{a.renderSheet()}catch(e){}try{a.applyPermissions()}catch(e){}if(msg)a.setStatus(msg,true);refreshSummary()}
function setRuleEnabled(id,on){
 var a=A(),s=state();if(!a||!s)return;
 if(!isAdmin()){a.setStatus('เปิด/ปิดกฎหลักได้เฉพาะ Admin',false);renderRules();return}
 var d=disabled(),am=activeMap();
 if(on){
   if(!am[id]){var r=backups()[id]||defaultMap()[id];if(r)s.rules.push({id:r.id,text:r.text})}
   d=d.filter(function(x){return x!==id})
 }else{
   if(am[id])updateBackup(am[id]);s.rules=s.rules.filter(function(r){return r.id!==id});if(d.indexOf(id)<0)d.push(id)
 }
 s.rules.sort(function(x,y){return (parseInt(x.id.replace(/\D/g,''),10)||999)-(parseInt(y.id.replace(/\D/g,''),10)||999)});
 setDisabledList(d);saveAll(on?'เปิดใช้งานกฎแล้ว':'ปิดใช้งานกฎแล้ว');renderRules();
}
function ruleIdsForTab(){
 var all=allCatalog(),defaultIds=Object.keys(defaultMap());
 if(activeTab==='other')return all.map(function(r){return r.id}).filter(function(id){return defaultIds.indexOf(id)<0});
 return tabSets[activeTab]||[];
}
function metaFor(rule,idx){var m=meta[rule.id];if(m)return m;var colors=['pink','purple','yellow','green','blue'];return ['กฎเพิ่มเติม '+(idx+1),'⚙',colors[idx%colors.length]]}
function ruleRow(rule,idx){
 var m=metaFor(rule,idx),on=isActive(rule.id),n=parseInt(rule.id.replace(/\D/g,''),10)||idx+1;
 return '<div class="r31-rule-row '+(on?'':'off')+'" data-rule-row="'+rule.id+'">'+
   '<span class="r31-rule-num">'+n+'</span><span class="r31-rule-icon '+m[2]+'">'+m[1]+'</span>'+
   '<div class="r31-rule-copy"><b>'+escapeHtml(m[0])+'</b><p>'+escapeHtml(rule.text)+'</p></div>'+
   '<label class="r31-switch" title="'+(on?'ปิดใช้งาน':'เปิดใช้งาน')+'"><input type="checkbox" data-rule-toggle="'+rule.id+'" '+(on?'checked':'')+' '+(isAdmin()?'':'disabled')+'><i style="--switch:'+switchColor(m[2])+'"></i></label>'+
   '<span class="r31-status '+(on?'':'off')+'">'+(on?'เปิดใช้งาน':'ปิดใช้งาน')+'</span>'+
   '<button type="button" class="r31-chevron" data-rule-expand="'+rule.id+'">⌄</button>'+
   '<div class="r31-rule-detail"><span>รหัสกฎ: <b>'+escapeHtml(rule.id)+'</b> • กฎนี้มีผลกับระบบจัดตารางตามเงื่อนไขที่กำหนด</span><div class="r31-detail-actions"><button type="button" data-rule-edit="'+rule.id+'">✎ แก้ไขข้อความ</button><button type="button" class="danger" data-rule-delete="'+rule.id+'">ลบกฎ</button></div></div>'+
 '</div>';
}
function escapeHtml(v){var a=A();return a?a.escape(String(v)):String(v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}
function switchColor(c){return {pink:'#ef6496',purple:'#8e69d0',yellow:'#f0aa2e',green:'#45af87',blue:'#4aa4d7'}[c]||'#ef6496'}
function renderRules(){
 var host=document.getElementById('ruleList');if(!host)return;
 var personal=document.getElementById('rulesPersonalPanelV31'),other=document.getElementById('rulesOtherPanelV31');
 personal.hidden=activeTab!=='personal';other.hidden=activeTab!=='other';host.style.display=(activeTab==='personal')?'none':'grid';
 var lab=tabLabels[activeTab]||tabLabels.general;var t=document.getElementById('rulesSectionTitleV31'),sub=document.getElementById('rulesSectionSubV31');if(t)t.textContent=lab[0];if(sub)sub.textContent=lab[1];
 decorateTabs();
 document.querySelectorAll('#page-rules [data-r31-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.r31Tab===activeTab);b.setAttribute('aria-selected',b.dataset.r31Tab===activeTab?'true':'false')});
 if(activeTab!=='personal'){
   var cat={};allCatalog().forEach(function(r){cat[r.id]=r});var ids=ruleIdsForTab();var rows=ids.map(function(id,i){return cat[id]?ruleRow(cat[id],i):''}).filter(Boolean);
   host.innerHTML=rows.length?rows.join(''):'<div class="r31-empty">ยังไม่มีกฎในหมวดนี้</div>';
   bindRuleRows(host);
 }
 if(activeTab==='personal'){buildCustomOptions();renderCustomRules()}
 refreshSummary();
}
function bindRuleRows(host){
 host.querySelectorAll('[data-rule-toggle]').forEach(function(x){x.onchange=function(){setRuleEnabled(this.dataset.ruleToggle,this.checked)}});
 host.querySelectorAll('[data-rule-expand]').forEach(function(b){b.onclick=function(){var row=host.querySelector('[data-rule-row="'+this.dataset.ruleExpand+'"]');if(row)row.classList.toggle('expanded')}});
 host.querySelectorAll('[data-rule-edit]').forEach(function(b){b.onclick=function(){editRule(this.dataset.ruleEdit)}});
 host.querySelectorAll('[data-rule-delete]').forEach(function(b){b.onclick=function(){deleteRule(this.dataset.ruleDelete)}});
}
function editRule(id){var a=A(),s=state();if(!a||!s)return;if(!isAdmin()){a.setStatus('แก้ไขกฎหลักได้เฉพาะ Admin',false);return}var all=allCatalog(),r=all.find(function(x){return x.id===id});if(!r)return;var txt=prompt('แก้ไขข้อความกฎ',r.text);if(txt===null||!txt.trim())return;var ar=s.rules.find(function(x){return x.id===id});if(ar)ar.text=txt.trim();else{var b=backups();b[id]={id:id,text:txt.trim()};setBackups(b)}updateBackup({id:id,text:txt.trim()});saveAll('แก้ไขกฎแล้ว');renderRules()}
function deleteRule(id){var a=A(),s=state();if(!a||!s)return;if(!isAdmin()){a.setStatus('ลบกฎได้เฉพาะ Admin',false);return}if(!confirm('ลบกฎข้อนี้หรือไม่? สามารถคืนค่ากฎมาตรฐานได้ภายหลัง'))return;s.rules=s.rules.filter(function(r){return r.id!==id});var b=backups();delete b[id];setBackups(b);var d=disabled();if(d.indexOf(id)<0)d.push(id);setDisabledList(d);saveAll('ลบ/ปิดกฎแล้ว');renderRules()}
function refreshSummary(){
 var a=A(),s=state();if(!a||!s)return;var catalog=allCatalog(),total=catalog.length,active=catalog.filter(function(r){return isActive(r.id)}).length,off=Math.max(0,total-active),pct=total?Math.round(active*100/total):0;
 setText('ruleTotalV24',total+' ข้อ');setText('ruleActiveV24',active+' ข้อ');setText('ruleCustomV24',(s.customRules||[]).length+' ข้อ');setText('rulePercentV24',pct+'%');setText('ruleActiveOverviewV31',active+' ข้อ');setText('ruleDisabledV31',off+' ข้อ');setText('ruleNeedCheckV31',lastValidationErrors+' ข้อ');
 var ring=document.getElementById('ruleRingV31');if(ring)ring.style.setProperty('--pct',String(pct));setText('ruleHealthLabelV31',pct===100?'ตั้งค่ากฎครบถ้วน':'มีกฎที่ปิดใช้งาน');setText('ruleHealthSubV31',active+' / '+total+' กฎเปิดใช้งาน');setText('ruleUpdatedV31',formatThaiDate(updatedAt));
}
function setText(id,v){var x=document.getElementById(id);if(x)x.textContent=v}
function formatThaiDate(ms){var d=new Date(ms),thY=d.getFullYear()+543;return d.getDate()+' '+['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][d.getMonth()]+' '+thY+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+' น.'}
function buildCustomOptions(){
 var a=A(),s=state();if(!a||!s)return;var p=document.getElementById('customPerson'),slots=document.getElementById('customSlots');
 if(p){var keep=p.value;p.innerHTML=(s.people||[]).map(function(x){return '<option value="'+escapeHtml(x.id)+'">'+escapeHtml(x.name)+'</option>'}).join('');if(keep&&Array.from(p.options).some(function(o){return o.value===keep}))p.value=keep}
 if(slots&&!slots.options.length)slots.innerHTML=(a.slots||[]).map(function(x){return '<option value="'+escapeHtml(x.id)+'">'+escapeHtml(x.label)+'</option>'}).join('');
}
function renderCustomRules(){
 var s=state(),host=document.getElementById('customRules');if(!host||!s)return;var people={};(s.people||[]).forEach(function(p){people[p.id]=p.name});var slots={};var a=A();(a?a.slots:[]).forEach(function(x){slots[x.id]=x.label});
 if(!(s.customRules||[]).length){host.innerHTML='<div class="r31-empty">ยังไม่มีกฎรายบุคคล</div>';return}
 host.innerHTML=s.customRules.map(function(r){var labels=(r.slots||[]).map(function(id){return slots[id]||id}).join(', ');return '<div class="r31-custom-chip"><span><b>'+escapeHtml(people[r.personId]||r.personId)+'</b> • '+(r.type==='only'?'อนุญาตเฉพาะ':'ห้าม')+' '+escapeHtml(labels)+'</span><button type="button" data-custom-delete="'+escapeHtml(r.id)+'">×</button></div>'}).join('');
 host.querySelectorAll('[data-custom-delete]').forEach(function(b){b.onclick=function(){if(!canEditCustom())return;var id=this.dataset.customDelete;s.customRules=s.customRules.filter(function(r){return String(r.id)!==String(id)});saveAll('ลบกฎรายบุคคลแล้ว');renderCustomRules()}});
}
function addCustomRule(){
 var a=A(),s=state();if(!a||!s)return;if(!canEditCustom()){a.setStatus('เพิ่มกฎรายบุคคลได้เฉพาะผู้จัดตารางหรือ Admin',false);return}var p=document.getElementById('customPerson'),t=document.getElementById('customRuleType'),sl=document.getElementById('customSlots');if(!p||!p.value)return;var arr=Array.from(sl.selectedOptions).map(function(o){return o.value});if(!arr.length){alert('กรุณาเลือกเวรอย่างน้อย 1 รายการ');return}s.customRules.push({id:'cr_'+Date.now(),personId:p.value,type:t.value,slots:arr});saveAll('เพิ่มกฎรายบุคคลแล้ว');renderCustomRules();
}
function addRule(){
 var a=A(),s=state(),ta=document.getElementById('newRuleText');if(!a||!s||!ta)return;if(!isAdmin()){a.setStatus('เพิ่มกฎหลักได้เฉพาะ Admin',false);return}var txt=ta.value.trim();if(!txt){alert('กรุณาพิมพ์ข้อความกฎ');return}var max=21;allCatalog().forEach(function(r){max=Math.max(max,parseInt(r.id.replace(/\D/g,''),10)||0)});var r={id:'r'+(max+1),text:txt};s.rules.push(r);updateBackup(r);ta.value='';saveAll('เพิ่มกฎใหม่แล้ว');activeTab='other';renderRules();
}
function resetRules(){var a=A(),s=state();if(!a||!s)return;if(!isAdmin()){a.setStatus('คืนค่ากฎหลักได้เฉพาะ Admin',false);return}if(!confirm('คืนค่ากฎหลักเป็นค่ามาตรฐานทั้งหมดหรือไม่?'))return;s.rules=(a.defaults||[]).map(function(r){return {id:r.id,text:r.text}});setDisabledList([]);setBackups({});saveAll('คืนค่ากฎมาตรฐานแล้ว');renderRules()}
function checkRules(){var a=A();if(!a)return;lastValidationErrors=a.validate(true)||0;updatedAt=Date.now();refreshSummary();if(lastValidationErrors===0)a.setStatus('ตรวจสอบกฎแล้ว ไม่พบข้อขัดแย้ง',true);else a.setStatus('ตรวจสอบแล้ว พบข้อขัดแย้ง '+lastValidationErrors+' จุด',false)}
function saveRules(){var a=A();if(!a)return;a.saveConfig();updatedAt=Date.now();refreshSummary();a.setStatus('บันทึกกฎทั้งหมดแล้ว',true)}
function wire(){
 decorateTabs();
 document.querySelectorAll('#page-rules [data-r31-tab]').forEach(function(b){b.onclick=function(){activeTab=this.dataset.r31Tab;renderRules();try{this.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})}catch(e){}}});
 var reset=document.getElementById('rulesResetBtnV24'),save=document.getElementById('rulesSaveBtnV24'),check=document.getElementById('rulesCheckBtnV24'),bottom=document.getElementById('rulesSaveBottomV31'),report=document.getElementById('rulesReportBtnV31');
 if(reset)reset.onclick=resetRules;if(save)save.onclick=saveRules;if(check)check.onclick=checkRules;if(bottom)bottom.onclick=saveRules;if(report)report.onclick=checkRules;
 var ar=document.getElementById('addRuleBtn'),ac=document.getElementById('addCustomRuleBtn');if(ar)ar.onclick=addRule;if(ac)ac.onclick=addCustomRule;
 renderRules();buildCustomOptions();renderCustomRules();
}
window.buildCustomOptions=buildCustomOptions;
window.renderCustomRules=renderCustomRules;
window.addCustomRule=addCustomRule;
window.addRule=addRule;
window.RulesV31={renderRules:renderRules,refreshSummary:refreshSummary,decorateTabs:decorateTabs};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
window.addEventListener('pageshow',function(){setTimeout(function(){decorateTabs();renderRules();refreshSummary()},0)});
})();
