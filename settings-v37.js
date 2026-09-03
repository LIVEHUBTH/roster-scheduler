/* SETTINGS V37.0 — isolated settings behavior; existing core handlers remain intact. */
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
function currentData(){
 return {
  programName:val('settingsProgramNameV37','โปรแกรมรันตารางเวร'), startYear:val('settingsStartYearV37','2569'), language:val('settingsLanguageV37','th'), timezone:val('settingsTimezoneV37','Asia/Bangkok'),
  autoBackup:bool('settingsAutoBackupV37',true), lockAfterSave:bool('settingsLockAfterSaveV37',false), duplicateWarning:bool('settingsDuplicateWarningV37',true), weekendAlternate:bool('settingsWeekendAlternateV37',true),
  balance:val('settingsBalanceV24','ความสมดุลสูง'), horizon:val('settingsHorizonV24','31 วัน'), rows:val('displayRowsV24','35 แถว'),
  printPaper:val('settingsPrintPaperV37','a4-landscape'), printFont:val('settingsPrintFontV37','normal'), printGrid:bool('settingsPrintGridV37',true),
  accent:(document.documentElement.style.getPropertyValue('--v24-pink')||'#f36f9f').trim()
 };
}
function applyExtra(s){
 document.documentElement.dataset.rosterPrintPaper=s.printPaper||'a4-landscape';
 document.documentElement.dataset.rosterPrintFont=s.printFont||'normal';
 document.documentElement.dataset.rosterPrintGrid=s.printGrid===false?'off':'on';
 document.documentElement.dataset.rosterDuplicateWarning=s.duplicateWarning===false?'off':'on';
 document.documentElement.dataset.rosterLockAfterSave=s.lockAfterSave?'on':'off';
 updatePrintSummary();
}
function load(){
 var s=read();
 setVal('settingsProgramNameV37',s.programName||'โปรแกรมรันตารางเวร');setVal('settingsStartYearV37',s.startYear||String(new Date().getFullYear()+543));setVal('settingsLanguageV37',s.language||'th');setVal('settingsTimezoneV37',s.timezone||'Asia/Bangkok');
 setBool('settingsAutoBackupV37',s.autoBackup!==false);setBool('settingsLockAfterSaveV37',!!s.lockAfterSave);setBool('settingsDuplicateWarningV37',s.duplicateWarning!==false);setBool('settingsWeekendAlternateV37',s.weekendAlternate!==false);
 setVal('settingsBalanceV24',s.balance||'ความสมดุลสูง');setVal('settingsHorizonV24',s.horizon||'31 วัน');setVal('displayRowsV24',s.rows||'35 แถว');
 setVal('settingsPrintPaperV37',s.printPaper||'a4-landscape');setVal('settingsPrintFontV37',s.printFont||'normal');setBool('settingsPrintGridV37',s.printGrid!==false);
 if(s.accent){document.documentElement.style.setProperty('--v24-pink',s.accent);markTheme(s.accent)}
 applyExtra(s);
}
function saveAll(){
 var s=currentData();write(s);applyExtra(s);
 /* Reuse the application's existing settings/unit save paths instead of duplicating core state logic. */
 try{var b=q('settingsSaveTimeV24');if(b&&typeof b.onclick==='function')b.onclick()}catch(e){}
 try{var u=q('settingsSaveUnitV24');if(u&&typeof u.onclick==='function')u.onclick()}catch(e){}
 toast('บันทึกการตั้งค่าแล้ว',true);
}
function resetAll(){
 if(!confirm('รีเซ็ตการตั้งค่าหน้านี้เป็นค่าเริ่มต้นหรือไม่?'))return;
 localStorage.removeItem(KEY);
 try{localStorage.removeItem('roster_ui_v24')}catch(e){}
 setVal('settingsProgramNameV37','โปรแกรมรันตารางเวร');setVal('settingsStartYearV37',String(new Date().getFullYear()+543));setBool('settingsAutoBackupV37',true);setBool('settingsLockAfterSaveV37',false);setBool('settingsDuplicateWarningV37',true);setBool('settingsWeekendAlternateV37',true);setVal('settingsPrintPaperV37','a4-landscape');setVal('settingsPrintFontV37','normal');setBool('settingsPrintGridV37',true);
 setBool('notifyRunV24',true);setBool('notifyConflictV24',true);setBool('notifyHolidayV24',true);setBool('notifyDeadlineV24',true);setBool('displayWeekendV24',true);setBool('displayHolidayV24',true);setBool('displayWatermarkV24',true);setVal('displayRowsV24','35 แถว');setVal('settingsDateFormatV24','thai');setVal('settingsWeekStartV24','1');
 document.documentElement.style.setProperty('--v24-pink','#f36f9f');markTheme('#f36f9f');saveAll();toast('รีเซ็ตเป็นค่าเริ่มต้นแล้ว',true);
}
function markTheme(color){document.querySelectorAll('#page-settings .s37-theme').forEach(function(b){b.classList.toggle('active',(b.dataset.v24Color||'').toLowerCase()===String(color).toLowerCase())})}
function updatePrintSummary(){var p=q('settingsPrintPaperV37'),f=q('settingsPrintFontV37'),g=q('settingsPrintGridV37');if(q('settingsPrintPaperSummaryV37'))q('settingsPrintPaperSummaryV37').textContent=p&&p.options[p.selectedIndex]?p.options[p.selectedIndex].text:'A4 (แนวนอน)';if(q('settingsPrintFontSummaryV37'))q('settingsPrintFontSummaryV37').textContent=f&&f.options[f.selectedIndex]?f.options[f.selectedIndex].text:'ปกติ';if(q('settingsPrintGridSummaryV37'))q('settingsPrintGridSummaryV37').textContent=g&&g.checked?'เปิด':'ปิด'}
function switchTab(name){document.querySelectorAll('#page-settings [data-s37-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.s37Tab===name)});document.querySelectorAll('#page-settings [data-s37-panel]').forEach(function(p){p.classList.toggle('active',p.dataset.s37Panel===name)});try{sessionStorage.setItem('roster_settings_tab_v37',name)}catch(e){}}
function wire(){
 if(!q('page-settings'))return;
 document.querySelectorAll('#page-settings [data-s37-tab]').forEach(function(b){b.addEventListener('click',function(){switchTab(this.dataset.s37Tab)})});
 document.querySelectorAll('#page-settings .s37-theme').forEach(function(b){b.addEventListener('click',function(){var c=this.dataset.v24Color;document.documentElement.style.setProperty('--v24-pink',c);markTheme(c);var s=read();s.accent=c;write(s);})});
 var save=q('settingsSaveAllV37');if(save)save.addEventListener('click',saveAll);var reset=q('settingsResetAllV37');if(reset)reset.addEventListener('click',resetAll);
 ['settingsAutoBackupV37','settingsLockAfterSaveV37','settingsDuplicateWarningV37','settingsWeekendAlternateV37','settingsBalanceV24','settingsHorizonV24','displayRowsV24','settingsPrintPaperV37','settingsPrintFontV37','settingsPrintGridV37'].forEach(function(id){var e=q(id);if(e)e.addEventListener('change',function(){var s=currentData();write(s);applyExtra(s)})});
 document.querySelectorAll('#page-settings [data-s37-proxy]').forEach(function(b){b.addEventListener('click',function(){var t=q(this.dataset.s37Proxy);if(t)t.click()})});
 load();
 var tab='general';try{tab=sessionStorage.getItem('roster_settings_tab_v37')||'general'}catch(e){}switchTab(tab);
 /* The old loader may run before/after this file; refresh once without touching other pages. */
 setTimeout(load,80);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
window.addEventListener('pageshow',function(){if(q('page-settings'))load()});
})();
