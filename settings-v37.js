/* SETTINGS V37.3 — clean rebuild: functional tabs, icons, theme, tones, directions */
(function(){
'use strict';

var KEY='roster_settings_v37';
function q(id){return document.getElementById(id)}
function qa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
function val(id,def){var e=q(id);return e?e.value:def}
function setVal(id,v){var e=q(id);if(e&&v!==undefined&&v!==null)e.value=String(v)}
function bool(id,def){var e=q(id);return e?!!e.checked:def}
function setBool(id,v){var e=q(id);if(e&&v!==undefined)e.checked=!!v}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function notify(msg,ok){try{if(typeof window.setStatus==='function')window.setStatus(msg,ok!==false);else console.log(msg)}catch(e){console.log(msg)}}

function svg(name){
 var p={
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.3 15a1.8 1.8 0 0 0 .4 2l-2.7 2.7a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.7h-4a1.8 1.8 0 0 0-1-1.7 1.8 1.8 0 0 0-2 .4L4.3 17a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 3 14v-4a1.8 1.8 0 0 0 1.7-1 1.8 1.8 0 0 0-.4-2L7 4.3a1.8 1.8 0 0 0 2 .4A1.8 1.8 0 0 0 10 3h4a1.8 1.8 0 0 0 1 1.7 1.8 1.8 0 0 0 2-.4L19.7 7a1.8 1.8 0 0 0-.4 2A1.8 1.8 0 0 0 21 10v4a1.8 1.8 0 0 0-1.7 1Z"/>',
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
  download:'<path d="M12 4v11M8 11l4 4 4-4M5 20h14"/>',
  upload:'<path d="M12 16V5M8 9l4-4 4 4M5 20h14"/>',
  save:'<path d="M5 4h12l2 2v14H5Z"/><path d="M8 4v6h7V4M8 20v-6h8v6"/>'
 };
 return '<svg class="s37-svg" viewBox="0 0 24 24" aria-hidden="true">'+(p[name]||p.info)+'</svg>';
}

function iconify(){
 var tabs=['gear','calendar','palette','bell','cloud','info'];
 qa('#page-settings .s37-tab-icon').forEach(function(e,i){e.innerHTML=svg(tabs[i]||'info')});
 var map=[
  ['ข้อมูลโปรแกรม','document'],['ตั้งค่าวันและเวลา','clock'],['ตั้งค่าอื่น ๆ','gear'],['ตัวอย่างการแสดงผล','palette'],
  ['สีประจำโปรแกรม','palette'],['การตั้งค่าการพิมพ์','printer'],['การตั้งค่าการจัดเวร','calendar'],
  ['เครื่องมือจัดการตาราง','gear'],['การตั้งค่าการแสดงผล','palette'],['การพิมพ์และรูปแบบ','printer'],
  ['การแจ้งเตือน','bell'],['สถานะการแจ้งเตือน','info'],['การสำรองข้อมูลและกู้คืน','cloud'],
  ['จัดการข้อมูลระบบ','rows'],['เปลี่ยนรหัสผ่านแอดมิน','lock'],['เกี่ยวกับโปรแกรม','info']
 ];
 qa('#page-settings .s37-card h3').forEach(function(h){
  var hit=map.find(function(x){return h.textContent.indexOf(x[0])>=0}),sp=h.querySelector('.s37-icon');
  if(hit&&sp)sp.innerHTML=svg(hit[1]);
 });
 var minis=['upload','lock','warning','palette'];
 qa('#page-settings .s37-mini').forEach(function(e,i){e.innerHTML=svg(minis[i]||'gear')});
 function decorate(id,name){var b=q(id);if(!b)return;var txt=b.textContent.trim();b.innerHTML=svg(name)+'<span>'+txt.replace(/^[^\u0E00-\u0E7FA-Za-z0-9]+/,'')+'</span>'}
 decorate('settingsClearV24','trash');decorate('settingsValidateV24','check');decorate('settingsPeopleV24','users');decorate('settingsResetV24','reset');
 decorate('settingsGoRulesV24','calendar');decorate('cloudConnectBtn','cloud');decorate('cloudUploadBtn','upload');decorate('cloudDownloadBtn','download');
 decorate('settingsSaveAllV37','save');decorate('settingsResetAllV37','reset');decorate('settingsChangePasswordBtn','save');
}

function makeTopbarTitle(){
 var left=document.querySelector('.header-clean-left');if(!left)return;
 var box=q('s37TopbarTitle');
 if(!box){
  box=document.createElement('div');box.id='s37TopbarTitle';box.className='s37-topbar-title';
  box.innerHTML='<span class="s37-topbar-gear">'+svg('gear')+'</span><span class="s37-topbar-title-copy"><b>ตั้งค่าโปรแกรม</b><small>ปรับแต่งการทำงานของโปรแกรมให้ตรงกับความต้องการ</small></span>';
  left.appendChild(box);
 }
}
function syncTopbar(){
 var p=q('page-settings'),on=!!(p&&p.classList.contains('active'));
 document.body.classList.toggle('s37-settings-open',on);
 if(on)makeTopbarTitle();
}
function observePage(){
 var p=q('page-settings');if(!p||!window.MutationObserver)return;
 new MutationObserver(syncTopbar).observe(p,{attributes:true,attributeFilter:['class']});
}

function hexRgb(hex){
 hex=String(hex||'#f36f9f').replace('#','');if(hex.length===3)hex=hex.replace(/(.)/g,'$1$1');
 var n=parseInt(hex,16);if(!isFinite(n))n=0xf36f9f;
 return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}
function mix(hex,w){
 var c=hexRgb(hex),a=Math.max(0,Math.min(1,w));
 function m(v){return Math.round(v*(1-a)+255*a)}
 return 'rgb('+m(c.r)+','+m(c.g)+','+m(c.b)+')';
}
function gradient(dir,colors,pale){
 var arr=colors.map(function(c){return mix(c,pale)});
 if(arr.length===1)arr=[arr[0],mix(colors[0],Math.min(.98,pale+.09))];
 if(arr.length===2)return 'linear-gradient('+dir+','+arr[0]+' 0%,'+arr[1]+' 100%)';
 return 'linear-gradient('+dir+','+arr[0]+' 0%,'+arr[1]+' 50%,'+arr[2]+' 100%)';
}
function toneCount(){
 var b=document.querySelector('#page-settings [data-s37-tones].active');
 return b?parseInt(b.dataset.s37Tones,10)||1:1;
}
function colorsFromUI(){
 var n=toneCount(),a=[val('settingsThemeColor1V37','#f36f9f'),val('settingsThemeColor2V37','#8fdcc8'),val('settingsThemeColor3V37','#b9d7f4')];
 return a.slice(0,n);
}
function data(){
 return {
  programName:val('settingsProgramNameV37','โปรแกรมรันตารางเวร'),
  startYear:val('settingsStartYearV37',String(new Date().getFullYear()+543)),
  language:val('settingsLanguageV37','th'),timezone:val('settingsTimezoneV37','Asia/Bangkok'),
  autoBackup:bool('settingsAutoBackupV37',true),lockAfterSave:bool('settingsLockAfterSaveV37',false),
  duplicateWarning:bool('settingsDuplicateWarningV37',true),weekendAlternate:bool('settingsWeekendAlternateV37',true),
  balance:val('settingsBalanceV24','ความสมดุลสูง'),horizon:val('settingsHorizonV24','31 วัน'),
  rows:val('displayRowsV24','35 แถว'),printPaper:val('settingsPrintPaperV37','a4-landscape'),
  printFont:val('settingsPrintFontV37','normal'),printGrid:bool('settingsPrintGridV37',true),
  tones:toneCount(),colors:colorsFromUI(),direction:val('settingsGradientDirectionV37','135deg')
 };
}
function syncTone(n){
 n=parseInt(n,10)||1;
 qa('#page-settings [data-s37-tones]').forEach(function(b){b.classList.toggle('active',parseInt(b.dataset.s37Tones,10)===n)});
 var c=document.querySelector('#page-settings .s37-custom-colors');
 if(c){c.classList.remove('is-1','is-2','is-3');c.classList.add('is-'+n)}
}
function syncDir(d){
 setVal('settingsGradientDirectionV37',d);
 qa('#page-settings [data-s37-dir]').forEach(function(b){b.classList.toggle('active',b.dataset.s37Dir===d)});
}
function markPreset(first){
 qa('#page-settings .s37-theme').forEach(function(b){b.classList.toggle('active',(b.dataset.c1||b.dataset.v24Color||'').toLowerCase()===String(first||'').toLowerCase())});
}
function setImportant(el,prop,value){
 if(el)el.style.setProperty(prop,value,'important');
}
function applyTheme(s){
 var colors=(s.colors&&s.colors.length?s.colors:['#f36f9f']).slice(0,s.tones||1),dir=s.direction||'135deg';
 var bodyG=gradient(dir,colors,.92),sideG=gradient(dir,colors,.78),topG=gradient(dir,colors,.84),contentG=gradient(dir,colors,.95);
 document.body.classList.add('s37-theme-applied');
 document.documentElement.style.setProperty('--v24-pink',colors[0]||'#f36f9f');
 document.documentElement.style.setProperty('--s37-body-gradient',bodyG);
 document.documentElement.style.setProperty('--s37-sidebar-gradient',sideG);
 document.documentElement.style.setProperty('--s37-top-gradient',topG);
 document.documentElement.style.setProperty('--s37-content-gradient',contentG);
 setImportant(document.body,'background-image',bodyG);
 setImportant(q('appSidebar'),'background-image',sideG);
 var shell=document.querySelector('.main-shell');setImportant(shell,'background-image',contentG);
 var header=document.querySelector('.main-shell>header');setImportant(header,'background-image',topG);
 var page=q('page-settings');if(page){page.style.setProperty('--s37-demo-c1',mix(colors[0],.60));page.style.setProperty('--s37-demo-c2',mix(colors[Math.min(1,colors.length-1)],.60));page.style.setProperty('--s37-demo-c3',mix(colors[Math.min(2,colors.length-1)],.60))}
 var pv=q('settingsThemePreviewV37');if(pv){pv.style.setProperty('--s37-preview-dir',dir);pv.style.setProperty('--s37-preview-a',mix(colors[0],.65));pv.style.setProperty('--s37-preview-b',mix(colors[Math.min(1,colors.length-1)],.65));pv.style.setProperty('--s37-preview-c',mix(colors[Math.min(2,colors.length-1)],.65));pv.style.setProperty('--s37-preview-bg',mix(colors[0],.93))}
}
function load(){
 var s=read(),colors=s.colors||[s.color1||s.accent||'#f36f9f',s.color2||'#8fdcc8',s.color3||'#b9d7f4'];
 setVal('settingsProgramNameV37',s.programName||'โปรแกรมรันตารางเวร');
 setVal('settingsStartYearV37',s.startYear||String(new Date().getFullYear()+543));
 setVal('settingsLanguageV37',s.language||'th');setVal('settingsTimezoneV37',s.timezone||'Asia/Bangkok');
 setBool('settingsAutoBackupV37',s.autoBackup!==false);setBool('settingsLockAfterSaveV37',!!s.lockAfterSave);
 setBool('settingsDuplicateWarningV37',s.duplicateWarning!==false);setBool('settingsWeekendAlternateV37',s.weekendAlternate!==false);
 setVal('settingsBalanceV24',s.balance||'ความสมดุลสูง');setVal('settingsHorizonV24',s.horizon||'31 วัน');
 setVal('displayRowsV24',s.rows||'35 แถว');setVal('settingsPrintPaperV37',s.printPaper||'a4-landscape');setVal('settingsPrintFontV37',s.printFont||'normal');setBool('settingsPrintGridV37',s.printGrid!==false);
 setVal('settingsThemeColor1V37',colors[0]||'#f36f9f');setVal('settingsThemeColor2V37',colors[1]||'#8fdcc8');setVal('settingsThemeColor3V37',colors[2]||'#b9d7f4');
 syncTone(s.tones||1);syncDir(s.direction||s.gradientDirection||'135deg');markPreset(colors[0]);
 applyTheme(Object.assign({},s,{colors:colors,tones:s.tones||1,direction:s.direction||s.gradientDirection||'135deg'}));
 updatePrintSummary();
}
function updatePrintSummary(){
 var p=q('settingsPrintPaperV37'),f=q('settingsPrintFontV37'),g=q('settingsPrintGridV37');
 if(q('settingsPrintPaperSummaryV37'))q('settingsPrintPaperSummaryV37').textContent=p&&p.options[p.selectedIndex]?p.options[p.selectedIndex].text:'A4 (แนวนอน)';
 if(q('settingsPrintFontSummaryV37'))q('settingsPrintFontSummaryV37').textContent=f&&f.options[f.selectedIndex]?f.options[f.selectedIndex].text:'ปกติ';
 if(q('settingsPrintGridSummaryV37'))q('settingsPrintGridSummaryV37').textContent=g&&g.checked?'เปิด':'ปิด';
}
function save(){
 var s=data();write(s);applyTheme(s);updatePrintSummary();
 try{var b=q('settingsSaveTimeV24');if(b&&typeof b.onclick==='function')b.onclick()}catch(e){}
 try{var u=q('settingsSaveUnitV24');if(u&&typeof u.onclick==='function')u.onclick()}catch(e){}
 notify('บันทึกการตั้งค่าแล้ว',true);
}
function reset(){
 if(!confirm('รีเซ็ตการตั้งค่าหน้านี้เป็นค่าเริ่มต้นหรือไม่?'))return;
 localStorage.removeItem(KEY);
 setVal('settingsThemeColor1V37','#f36f9f');setVal('settingsThemeColor2V37','#8fdcc8');setVal('settingsThemeColor3V37','#b9d7f4');
 syncTone(1);syncDir('135deg');
 setBool('settingsAutoBackupV37',true);setBool('settingsLockAfterSaveV37',false);setBool('settingsDuplicateWarningV37',true);setBool('settingsWeekendAlternateV37',true);
 setVal('settingsPrintPaperV37','a4-landscape');setVal('settingsPrintFontV37','normal');setBool('settingsPrintGridV37',true);
 var s=data();write(s);applyTheme(s);notify('รีเซ็ตเป็นค่าเริ่มต้นแล้ว',true);
}
function switchTab(name){
 qa('#page-settings [data-s37-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.s37Tab===name)});
 qa('#page-settings [data-s37-panel]').forEach(function(p){p.classList.toggle('active',p.dataset.s37Panel===name)});
 try{sessionStorage.setItem('roster_settings_tab_v37',name)}catch(e){}
}
function themeChanged(){
 var s=data();write(s);applyTheme(s);markPreset(s.colors[0]);
}
function wire(){
 if(!q('page-settings')||document.documentElement.dataset.s37v373==='1')return;
 document.documentElement.dataset.s37v373='1';
 iconify();makeTopbarTitle();observePage();

 qa('#page-settings [data-s37-tab]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();switchTab(this.dataset.s37Tab)})});
 qa('#page-settings .s37-theme').forEach(function(b){b.addEventListener('click',function(e){
  e.preventDefault();
  var n=toneCount();
  setVal('settingsThemeColor1V37',this.dataset.c1||this.dataset.v24Color||'#f36f9f');
  setVal('settingsThemeColor2V37',this.dataset.c2||'#8fdcc8');
  setVal('settingsThemeColor3V37',this.dataset.c3||'#b9d7f4');
  syncTone(n);themeChanged();
 })});
 qa('#page-settings [data-s37-tones]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();syncTone(this.dataset.s37Tones);themeChanged()})});
 ['settingsThemeColor1V37','settingsThemeColor2V37','settingsThemeColor3V37'].forEach(function(id){var e=q(id);if(e)e.addEventListener('input',themeChanged)});
 qa('#page-settings [data-s37-dir]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();syncDir(this.dataset.s37Dir);themeChanged()})});
 var dir=q('settingsGradientDirectionV37');if(dir)dir.addEventListener('change',themeChanged);

 var saveBtn=q('settingsSaveAllV37');if(saveBtn)saveBtn.addEventListener('click',function(e){e.preventDefault();save()});
 var resetBtn=q('settingsResetAllV37');if(resetBtn)resetBtn.addEventListener('click',function(e){e.preventDefault();reset()});
 ['settingsAutoBackupV37','settingsLockAfterSaveV37','settingsDuplicateWarningV37','settingsWeekendAlternateV37','settingsBalanceV24','settingsHorizonV24','displayRowsV24','settingsPrintPaperV37','settingsPrintFontV37','settingsPrintGridV37'].forEach(function(id){var e=q(id);if(e)e.addEventListener('change',function(){var s=data();write(s);applyTheme(s);updatePrintSummary()})});
 qa('#page-settings [data-s37-proxy]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();var t=q(this.dataset.s37Proxy);if(t)t.click()})});

 load();
 var tab='general';try{tab=sessionStorage.getItem('roster_settings_tab_v37')||'general'}catch(e){}
 switchTab(tab);syncTopbar();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
window.addEventListener('pageshow',function(){wire();load();syncTopbar()});
window.addEventListener('hashchange',function(){setTimeout(syncTopbar,0)});
document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('[data-page]'))setTimeout(syncTopbar,10)},true);
})();
