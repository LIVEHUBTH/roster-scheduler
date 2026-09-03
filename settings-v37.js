/* SETTINGS V37.1 — settings-only behavior + live pastel theme */
(function(){
'use strict';
var KEY='roster_settings_v37';
function q(id){return document.getElementById(id)}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
function write(v){localStorage.setItem(KEY,JSON.stringify(v))}
function bool(id,def){var e=q(id);return e?!!e.checked:def}
function val(id,def){var e=q(id);return e?e.value:def}
function setVal(id,v){var e=q(id);if(e&&v!==undefined&&v!==null)e.value=String(v)}
function setBool(id,v){var e=q(id);if(e&&v!==undefined)e.checked=!!v}
function toast(msg,ok){try{if(typeof window.setStatus==='function')window.setStatus(msg,ok!==false);else console.log(msg)}catch(e){console.log(msg)}}

function svg(name){
 var p={
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14v-4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1v4a1.7 1.7 0 0 0-1.6 1Z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 9h18M7 13h3M14 13h3M7 17h3M14 17h3"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.3-3.5 1.5 1.5 0 0 1 1-2.6H18A3 3 0 0 0 21 12a9 9 0 0 0-9-9Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="6.8" r="1"/><circle cx="14" cy="6.8" r="1"/><circle cx="16.5" cy="10" r="1"/>',
  bell:'<path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 8H3c0-1 3-1 3-8Z"/><path d="M10 20h4"/>',
  cloud:'<path d="M7 18h10a4 4 0 0 0 .6-7.9A6 6 0 0 0 6.4 8.5 4.5 4.5 0 0 0 7 18Z"/><path d="M12 10v6M9.5 13l2.5-3 2.5 3"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7h.01"/>',
  document:'<path d="M6 3h9l3 3v15H6Z"/><path d="M15 3v4h4M9 11h6M9 15h6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  warning:'<path d="M12 3 2.8 20h18.4Z"/><path d="M12 9v4M12 17h.01"/>',
  rows:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8M8 13h8M8 17h8"/>',
  printer:'<path d="M7 8V3h10v5M6 17H4V9h16v8h-2M7 14h10v7H7Z"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  reset:'<path d="M4 4v6h6M5.5 17A8 8 0 1 0 6 7"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
  users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20v-2.3A4.7 4.7 0 0 1 8.2 13h1.6a4.7 4.7 0 0 1 4.7 4.7V20M14.5 14.2a4 4 0 0 1 6 3.5V20"/>',
  search:'<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4.5 4.5"/>',
  download:'<path d="M12 4v11M8 11l4 4 4-4M5 20h14"/>',
  upload:'<path d="M12 16V5M8 9l4-4 4 4M5 20h14"/>',
  save:'<path d="M5 4h12l2 2v14H5Z"/><path d="M8 4v6h7V4M8 20v-6h8v6"/>'
 };
 return '<svg class="s37-svg" viewBox="0 0 24 24" aria-hidden="true">'+(p[name]||p.info)+'</svg>';
}
function iconify(){
 var tabs=['gear','calendar','palette','bell','cloud','info'];document.querySelectorAll('#page-settings .s37-tab-icon').forEach(function(e,i){e.innerHTML=svg(tabs[i]||'info')});
 var map=[['ข้อมูลโปรแกรม','document'],['ตั้งค่าวันและเวลา','clock'],['ตั้งค่าอื่น ๆ','gear'],['ตัวอย่างการแสดงผล','palette'],['สีประจำโปรแกรม','palette'],['การตั้งค่าการพิมพ์','printer'],['การตั้งค่าการจัดเวร','calendar'],['เครื่องมือจัดการตาราง','gear'],['การตั้งค่าการแสดงผล','palette'],['การพิมพ์และรูปแบบ','printer'],['การแจ้งเตือน','bell'],['สถานะการแจ้งเตือน','info'],['การสำรองข้อมูลและกู้คืน','cloud'],['จัดการข้อมูลระบบ','rows'],['เปลี่ยนรหัสผ่านแอดมิน','lock'],['เกี่ยวกับโปรแกรม','info']];
 document.querySelectorAll('#page-settings .s37-card h3').forEach(function(h){var t=h.textContent.trim();var hit=map.find(function(x){return t.indexOf(x[0])>=0});var sp=h.querySelector('.s37-icon');if(sp&&hit)sp.innerHTML=svg(hit[1])});
 var minis=['upload','lock','warning','palette'];document.querySelectorAll('#page-settings .s37-mini').forEach(function(e,i){e.innerHTML=svg(minis[i]||'gear')});
 document.querySelectorAll('#page-settings button').forEach(function(b){var t=b.textContent.trim();if(t.indexOf('ล้างตาราง')>=0)b.innerHTML=svg('trash')+'ล้างตารางเดือนนี้';else if(t.indexOf('ตรวจสอบความสมบูรณ์')>=0)b.innerHTML=svg('check')+'ตรวจสอบความสมบูรณ์ข้อมูล';else if(t.indexOf('จัดการข้อมูลพนักงาน')>=0)b.innerHTML=svg('users')+'จัดการข้อมูลพนักงาน';else if(t.indexOf('รีเซ็ตค่าหน้าจอ')>=0)b.innerHTML=svg('reset')+'รีเซ็ตค่าหน้าจอ';else if(t.indexOf('เปิดหน้ากฎ')>=0)b.innerHTML=svg('calendar')+'เปิดหน้ากฎการจัดเวร';else if(t.indexOf('เชื่อมฐานข้อมูล')>=0)b.innerHTML=svg('cloud')+'เชื่อมฐานข้อมูล';else if(t.indexOf('สำรองข้อมูลตอนนี้')>=0)b.innerHTML=svg('upload')+'สำรองข้อมูลตอนนี้';else if(t.indexOf('กู้คืนข้อมูลออนไลน์')>=0)b.innerHTML=svg('download')+'กู้คืนข้อมูลออนไลน์';else if(t.indexOf('บันทึกการตั้งค่า')>=0)b.innerHTML=svg('save')+'บันทึกการตั้งค่า';else if(t.indexOf('รีเซ็ตเป็นค่าเริ่มต้น')>=0)b.innerHTML=svg('reset')+'รีเซ็ตเป็นค่าเริ่มต้น';else if(t.indexOf('บันทึกรหัสผ่านใหม่')>=0)b.innerHTML=svg('save')+'บันทึกรหัสผ่านใหม่'});
}
function makeTopbarTitle(){var left=document.querySelector('.header-clean-left');if(!left)return;var old=q('s37TopbarTitle');if(!old){old=document.createElement('div');old.id='s37TopbarTitle';old.className='s37-topbar-title';old.innerHTML='<span class="s37-topbar-gear">'+svg('gear')+'</span><span class="s37-topbar-title-copy"><b>ตั้งค่าโปรแกรม</b><small>ปรับแต่งการทำงานของโปรแกรมให้ตรงกับความต้องการ</small></span>';left.appendChild(old)}syncTopbar()}
function syncTopbar(){var isSettings=(location.hash||'').replace('#','')==='settings'||(q('page-settings')&&q('page-settings').classList.contains('active'));document.body.classList.toggle('s37-settings-open',!!isSettings)}
function hexToRgb(hex){hex=String(hex||'').replace('#','');if(hex.length===3)hex=hex.split('').map(function(x){return x+x}).join('');var n=parseInt(hex,16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}}
function mix(hex,whiteAmt){var c=hexToRgb(hex),w=255,a=Math.max(0,Math.min(1,whiteAmt));function m(v){return Math.round(v*(1-a)+w*a)}return 'rgb('+m(c.r)+','+m(c.g)+','+m(c.b)+')'}
function themePairs(name,color){var second={pink:'#8fdcc8',blue:'#b7d6f3',mint:'#f6bfd2',purple:'#cdbcf0',yellow:'#f4c6a2',peach:'#f6c1d0'}[name]||'#8fdcc8';return {a:mix(color,.72),b:mix(second,.68),bgA:mix(color,.91),bgB:mix(second,.92),sideA:mix(color,.84),sideB:mix(second,.86),topA:mix(color,.88),topB:mix(second,.89)}}
function markTheme(color){document.querySelectorAll('#page-settings .s37-theme').forEach(function(b){b.addEventListener('click',function(){
 var s=read();s.accent=this.dataset.v24Color;s.color1=this.dataset.c1||this.dataset.v24Color;s.color2=this.dataset.c2||s.color2||'#8fdcc8';s.color3=this.dataset.c3||s.color3||'#b9d7f4';s.tones=parseInt((document.querySelector('#page-settings [data-s37-tones].active')||{dataset:{s37Tones:'1'}}).dataset.s37Tones,10)||1;s.gradientDirection=val('settingsGradientDirectionV37','135deg');
 setVal('settingsThemeColor1V37',s.color1);setVal('settingsThemeColor2V37',s.color2);setVal('settingsThemeColor3V37',s.color3);write(s);applyTheme(s,true)
})});
document.querySelectorAll('#page-settings [data-s37-tones]').forEach(function(b){b.addEventListener('click',function(){var s=read();s.tones=parseInt(this.dataset.s37Tones,10)||1;s.color1=val('settingsThemeColor1V37',s.color1||'#f36f9f');s.color2=val('settingsThemeColor2V37',s.color2||'#8fdcc8');s.color3=val('settingsThemeColor3V37',s.color3||'#b9d7f4');s.gradientDirection=val('settingsGradientDirectionV37',s.gradientDirection||'135deg');write(s);applyTheme(s,true)})});
['settingsThemeColor1V37','settingsThemeColor2V37','settingsThemeColor3V37'].forEach(function(id){var e=q(id);if(e)e.addEventListener('input',function(){var s=read();s.color1=val('settingsThemeColor1V37','#f36f9f');s.color2=val('settingsThemeColor2V37','#8fdcc8');s.color3=val('settingsThemeColor3V37','#b9d7f4');s.accent=s.color1;s.tones=parseInt((document.querySelector('#page-settings [data-s37-tones].active')||{dataset:{s37Tones:'1'}}).dataset.s37Tones,10)||1;s.gradientDirection=val('settingsGradientDirectionV37','135deg');write(s);applyTheme(s,true)})});
document.querySelectorAll('#page-settings [data-s37-dir]').forEach(function(b){b.addEventListener('click',function(){var s=read();s.gradientDirection=this.dataset.s37Dir;setVal('settingsGradientDirectionV37',s.gradientDirection);s.color1=val('settingsThemeColor1V37',s.color1||'#f36f9f');s.color2=val('settingsThemeColor2V37',s.color2||'#8fdcc8');s.color3=val('settingsThemeColor3V37',s.color3||'#b9d7f4');s.tones=parseInt((document.querySelector('#page-settings [data-s37-tones].active')||{dataset:{s37Tones:'1'}}).dataset.s37Tones,10)||1;write(s);applyTheme(s,true)})});
var gd=q('settingsGradientDirectionV37');if(gd)gd.addEventListener('change',function(){var s=read();s.gradientDirection=this.value;write(s);applyTheme(Object.assign(currentData(),s),true)});
var save=q('settingsSaveAllV37');if(save)save.addEventListener('click',saveAll);var reset=q('settingsResetAllV37');if(reset)reset.addEventListener('click',resetAll);['settingsAutoBackupV37','settingsLockAfterSaveV37','settingsDuplicateWarningV37','settingsWeekendAlternateV37','settingsBalanceV24','settingsHorizonV24','displayRowsV24','settingsPrintPaperV37','settingsPrintFontV37','settingsPrintGridV37'].forEach(function(id){var e=q(id);if(e)e.addEventListener('change',function(){var s=currentData();write(s);applyExtra(s)})});document.querySelectorAll('#page-settings [data-s37-proxy]').forEach(function(b){b.addEventListener('click',function(){var t=q(this.dataset.s37Proxy);if(t)t.click()})});load();var tab='general';try{tab=sessionStorage.getItem('roster_settings_tab_v37')||'general'}catch(e){}switchTab(tab);syncTopbar();setTimeout(function(){load();syncTopbar()},100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
window.addEventListener('hashchange',syncTopbar);window.addEventListener('pageshow',function(){if(q('page-settings')){load();syncTopbar()}});document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('[data-page]'))setTimeout(syncTopbar,0)},true);
})();
