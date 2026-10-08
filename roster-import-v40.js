/* Roster photo/spreadsheet importer v40.0.0
 * Add-on only. Does not change schedule generation, approval, authentication, or cloud APIs.
 * Nothing is written until the user confirms an editable draft and reviews the preview.
 */
(function(){
 'use strict';
 var IDS=['v1','v2','ot1','ot2','s1d','s1n','s2d','s2n','s3d','s3n','s4d','s4n','s5','s6','s7','s8','e1','e2','e3'];
 var LABELS=['เวร1','เวร2','OT1','OT2','SDMC1 เช้า','SDMC1 บ่าย-ดึก','SDMC2 เช้า','SDMC2 บ่าย-ดึก','SDMC3 เช้า','SDMC3 บ่าย-ดึก','SDMC4 เช้า','SDMC4 บ่าย-ดึก','SDMC5 เช้า-บ่าย','SDMC6 เช้า-บ่าย','SDMC7 บ่าย','SDMC8 บ่าย','EXTRA1','EXTRA2','EXTRA3'];
 var R={open:false,raw:[],file:null,img:null,ocrBusy:false};
 // Transcribed identifiers from user-provided October photo; staged for review only.
 var OCT_2569_PHOTO_CANDIDATE=[[4,16,5,26,0,14,0,15,0,27,0,13,0,0,17,12,28,6,18],[19,11,4,24,0,7,0,22,0,8,0,12,0,0,20,16,21,0,25],[25,2,0,0,9,17,15,18,23,26,14,5,3,6,0,0,19,0,1],[20,21,0,0,12,16,1,4,13,6,22,25,11,24,0,0,7,14,8],[26,5,8,27,0,23,0,3,0,9,0,2,0,0,18,13,20,17,11],[15,6,7,25,0,21,0,1,0,11,0,24,0,0,19,14,13,4,12],[23,3,6,9,0,20,0,19,0,5,0,27,0,0,15,2,8,12,13],[24,1,11,21,0,18,0,17,0,7,0,8,0,0,22,25,3,15,14],[27,22,1,23,0,13,0,14,0,4,0,26,0,0,21,5,24,0,15],[17,18,0,0,19,12,20,16,7,15,8,6,9,27,0,0,23,0,24],[7,14,0,0,26,22,17,2,5,3,25,11,4,13,0,0,18,28,21],[8,12,16,15,0,19,0,20,0,1,0,23,0,0,24,9,5,13,6],[13,27,0,0,2,25,16,24,11,21,3,9,18,14,0,0,0,0,17],[1,26,19,20,0,6,0,12,0,22,0,4,0,0,7,8,16,27,3],[9,23,18,2,0,27,0,5,0,16,0,17,0,0,26,11,15,7,19],[6,4,0,0,21,8,18,13,24,14,12,15,25,1,0,0,0,0,22],[22,17,0,0,4,26,2,7,6,18,23,3,21,16,0,0,12,0,5],[2,20,0,0,22,11,8,25,9,19,13,1,23,12,0,0,4,24,16],[3,15,14,17,0,24,0,21,0,20,0,2,0,0,23,27,26,8,7],[5,25,22,6,0,9,0,23,0,13,0,7,0,0,1,4,11,3,27],[18,19,26,1,0,5,0,6,0,12,0,14,0,0,3,15,22,25,20],[11,24,13,7,0,4,0,27,0,17,0,16,0,0,2,20,9,1,26],[21,13,0,0,14,15,19,26,25,2,5,18,8,22,0,0,0,0,9],[16,7,0,0,17,3,11,8,20,24,1,22,19,5,0,0,14,0,4],[12,14,0,0,16,1,26,9,15,25,7,21,17,20,0,0,6,18,2],[8,4,12,3,0,19,0,11,0,23,0,20,0,0,13,17,27,2,28],[9,8,25,5,0,2,0,18,0,26,0,27,0,0,6,21,4,16,7],[14,9,24,4,0,16,0,22,0,15,0,19,0,0,12,23,25,21,6],[3,18,27,8,0,6,0,17,0,5,0,7,0,0,14,26,2,20,23],[11,16,21,22,0,13,0,4,0,12,0,14,0,0,27,19,26,0,8],[2,5,0,0,6,8,21,24,18,3,27,11,15,7,0,0,17,0,9]];
 function q(id){return document.getElementById(id)}
 function safe(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 function people(){return (typeof state!=='undefined'&&state.people)||[]}
 function monthDays(){return (typeof dim==='function')?dim():31}
 function ready(){return !!(q('page-roster')&&q('loadBtn')&&typeof SLOTS!=='undefined'&&typeof akey==='function')}
 function status(t,error){var e=q('ri40Status');if(e){e.textContent=t||'';e.style.color=error?'#b42338':'#567b78'}}
 function parseNum(val){var s=String(val||'').trim();var m=s.match(/^\s*(\d{1,2})(?:[\s.．)\-:]|$)/);return m?Number(m[1]):null}
 function clean(v){return String(v||'').toLowerCase().replace(/[\s\u200b\.\-_,()\[\]]/g,'')}
 function resolve(raw){
   var s=String(raw==null?'':raw).trim(); if(!s||s==='-'||s==='—'||s==='.')return {id:'',text:''};
   var ps=people(),n=parseNum(s),embedded=s.replace(/^\s*\d{1,2}[.．)\-:\s]*/,'').trim();
   if(n!==null&&n>0&&n<=ps.length){
     var p=ps[n-1]; if(!p||!p.id)return {error:'ไม่พบชื่อหมายเลข '+n};
     // A number-plus-name source must agree with the current roster, otherwise do not map silently.
     if(/[\u0E00-\u0E7F]/.test(embedded)&&clean(embedded).length>2&&clean(p.name)!==clean(embedded)&&!clean(p.name).includes(clean(embedded))&&!clean(embedded).includes(clean(p.name)))return {error:'ชื่อไม่ตรงกับลำดับบุคลากร: '+s};
     if(p.active===false&&currentKey()!=='2026-09')return {error:'บุคลากรพักเวร: '+p.name};
     return {id:p.id,text:(n+'. '+p.name)};
   }
   var same=ps.filter(function(p){return clean(p.name)===clean(s)});
   if(same.length===1){if(same[0].active===false&&currentKey()!=='2026-09')return {error:'บุคลากรพักเวร: '+s};return {id:same[0].id,text:same[0].name};}
   return {error:'ไม่รู้จักรายชื่อ: '+s};
 }
 function initEmpty(){R.raw=Array.from({length:monthDays()},function(){return Array(19).fill('')})}
 function rowTable(){
  var head='<table><thead><tr><th>วัน</th>'+LABELS.map(function(x){return '<th>'+safe(x)+'</th>'}).join('')+'</tr></thead><tbody>';
  for(var d=1;d<=R.raw.length;d++){
   head+='<tr><td>'+d+'</td>';
   for(var c=0;c<19;c++){
     var value=R.raw[d-1][c]||'',check=resolve(value);
     head+='<td class="'+(check.error?'ri40-bad':check.id?'ri40-good':'')+'"><input type="text" inputmode="text" aria-label="วันที่ '+d+' '+safe(LABELS[c])+'" data-d="'+(d-1)+'" data-c="'+c+'" value="'+safe(value)+'" title="'+safe(check.error||check.text||'เว้นว่างได้')+'"></td>';
   }
   head+='</tr>';
  }
  q('ri40Table').innerHTML=head+'</tbody></table>';
  q('ri40Table').onchange=function(ev){var t=ev.target;if(!t.matches('input[data-d]'))return;R.raw[+t.dataset.d][+t.dataset.c]=t.value;var ans=resolve(t.value),td=t.parentElement;td.className=ans.error?'ri40-bad':ans.id?'ri40-good':'';t.title=ans.error||ans.text||'';summary()};
  summary();
 }
 function summary(){var good=0,bad=0,total=0,dupes=0;
   R.raw.forEach(function(row,d){var seen={};row.forEach(function(v,c){if(!String(v).trim())return;total++;var p=resolve(v);if(p.error)bad++;else if(p.id){good++;if(seen[p.id])dupes++;seen[p.id]=true;}})});
   status('ข้อมูลที่อ่านได้ '+total+' ช่อง | จับคู่รายชื่อ '+good+' ช่อง | ต้องแก้ '+bad+' ช่อง | ชื่อซ้ำในวันเดียวกัน '+dupes+' จุด'+(R.ocrBusy?' | กำลังอ่านภาพ…':''),bad||dupes);
 }
 function open(){if(!ready())return;initEmpty();R.file=null;R.img=null;q('ri40File').value='';q('ri40ImageBox').hidden=true;q('ri40GridSettings').hidden=true;q('ri40Confirm').checked=false;q('ri40Modal').classList.add('ri40-open');q('ri40OctOptions').hidden=(currentKey()!=='2026-10');q('ri40OctHolidays').checked=false;q('ri40TitleMonth').textContent=(typeof MONTHS!=='undefined'?MONTHS[cm()]:'เดือน '+(cm()+1))+' '+py();rowTable();}
 function loadOctoberPhoto(){
  if(currentKey()!=='2026-10'){status('กรุณาเลือกตุลาคม 2569 ก่อน',true);return}
  R.raw=OCT_2569_PHOTO_CANDIDATE.map(function(r){return r.map(function(n){return n?String(n):''})});
  q('ri40Confirm').checked=false;rowTable();
  status('จัดเตรียมข้อมูลจากภาพ ต.ค. 2569 จำนวน 413 ช่องแล้ว • กรุณาเทียบรายชื่อกับภาพต้นฉบับทุกวันก่อนบันทึก');
 }
 function close(){q('ri40Modal').classList.remove('ri40-open');}
 function loadScript(url,globalName){return new Promise(function(resolveP,reject){if(window[globalName])return resolveP();var tag=document.createElement('script');tag.src=url;tag.async=true;tag.onload=function(){window[globalName]?resolveP():reject(new Error('โหลดโมดูล '+globalName+' ไม่สำเร็จ'))};tag.onerror=function(){reject(new Error('ไม่สามารถโหลดโมดูล '+globalName+' ได้ กรุณาตรวจสอบอินเทอร์เน็ต'))};document.head.appendChild(tag)});}
 function rowsFromMatrix(matrix){
  // Positional CSV/XLSX, official 20-column format: date + the 19 shift columns.
  // Skip 1-5 descriptive/header lines, and require a date in first column.
  var seen={};var populated=0;
  matrix.forEach(function(row){if(!Array.isArray(row)||!row.length)return;
   var rawDay=String(row[0]==null?'':row[0]).trim(),m=rawDay.match(/(?:^|[^\d])(\d{1,2})(?:\D|$)/);if(!m)return;var day=+m[1];
   if(day<1||day>R.raw.length||seen[day])return;
   if(row.length<18)return;seen[day]=true;
   for(var c=0;c<19;c++){var v=row[c+1];R.raw[day-1][c]=String(v==null?'':v).trim();if(R.raw[day-1][c])populated++;}
  });
  rowTable();return populated;
 }
 function parseCSV(text,sep){
  text=String(text).replace(/^\uFEFF/,'');sep=sep||((text.split('\n')[0].match(/\t/g)||[]).length>(text.split('\n')[0].match(/,/g)||[]).length?'\t':',');
  var rows=[],row=[],cell='',quote=false;
  for(var i=0;i<text.length;i++){var ch=text[i];if(ch==='"'){if(quote&&text[i+1]==='"'){cell+='"';i++}else quote=!quote}
    else if(ch===sep&&!quote){row.push(cell);cell=''}else if((ch==='\n'||ch==='\r')&&!quote){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}else cell+=ch;
  }row.push(cell);rows.push(row);return rows;
 }
 function downloadTemplate(){var data=[['วันที่'].concat(LABELS)];for(var d=1;d<=monthDays();d++)data.push([d].concat(Array(19).fill('')));
  var csv='\uFEFF'+data.map(function(r){return r.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n');var blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='roster-'+currentKey()+'-import-template.csv';a.click();setTimeout(function(){URL.revokeObjectURL(url)},10000);
 }
 async function selectFile(file){if(!file)return;R.file=file;initEmpty();q('ri40Confirm').checked=false;var filename=file.name.toLowerCase();
  if(/\.(png|jpe?g|webp|bmp)$/i.test(filename)||file.type.startsWith('image/')){
    R.img=await new Promise(function(ok,no){var i=new Image;i.onload=function(){ok(i)};i.onerror=function(){no(new Error('เปิดภาพไม่สำเร็จ'))};i.src=URL.createObjectURL(file)});
    q('ri40Photo').src=R.img.src;q('ri40ImageBox').hidden=false;q('ri40GridSettings').hidden=false;rowTable();status('เปิดรูปแล้ว • กด “อ่านรายชื่อจากรูป (OCR)” จากนั้นตรวจผลทีละช่องก่อนบันทึก');return;
  }
  R.img=null;q('ri40ImageBox').hidden=true;q('ri40GridSettings').hidden=true;
  if(/\.(xlsx|xls)$/i.test(filename)){
    try{status('กำลังอ่านไฟล์ Excel…');await loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js','XLSX');var ab=await file.arrayBuffer();var wb=window.XLSX.read(ab,{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]],arr=window.XLSX.utils.sheet_to_json(ws,{header:1,defval:''});var n=rowsFromMatrix(arr);status('อ่าน Excel แล้ว '+n+' ช่อง • ตรวจสอบรายชื่อก่อนบันทึก');}catch(e){status('อ่านไฟล์ Excel ไม่สำเร็จ: '+e.message,true)}return;
  }
  if(/\.(csv|tsv|txt)$/i.test(filename)||file.type.indexOf('text/')===0){
    var text=await file.text(),n=rowsFromMatrix(parseCSV(text));status('อ่าน CSV/TSV แล้ว '+n+' ช่อง • ตรวจสอบรายชื่อก่อนบันทึก');return;
  }
  status('รองรับ CSV, TSV, Excel (.xlsx/.xls) และภาพ JPG/PNG/WebP เท่านั้น',true);
 }
 function imageGrid(){var v={};['left','right','top','bottom'].forEach(function(k){v[k]=Number(q('ri40_'+k).value)/100});return v}
 function showGuides(){var g=imageGrid();q('ri40Guide').innerHTML='<rect x="'+(g.left*100)+'%" y="'+(g.top*100)+'%" width="'+((g.right-g.left)*100)+'%" height="'+((g.bottom-g.top)*100)+'%" fill="#fb71851a" stroke="#f43f5e" stroke-width="1.5"/>';
  // Overlay follows image area. Parent image natural ratio is respected.
 }
 function tesseractWords(out){var data=out&&out.data||{},w=data.words;if(Array.isArray(w)&&w.length)return w;
   var lines=data.blocks||[];var results=[];lines.forEach(function(b){(b.paragraphs||[]).forEach(function(p){(p.lines||[]).forEach(function(l){(l.words||[]).forEach(function(x){results.push(x)})})})});return results;
 }
 async function imageOCR(){if(!R.img||R.ocrBusy)return;R.ocrBusy=true;q('ri40OCR').disabled=true;status('กำลังโหลดระบบอ่านข้อความภาษาไทยและอังกฤษ…');
   try{
     await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js','Tesseract');
     var worker=await window.Tesseract.createWorker('tha+eng',1,{logger:function(m){if(m&&m.status)status('อ่านรูป: '+m.status+' '+(m.progress!=null?Math.round(m.progress*100)+'%':'') )}});
     var out;try{out=await worker.recognize(R.img)}finally{await worker.terminate()}
     var grid=imageGrid(),bounds={x1:grid.left*R.img.naturalWidth,x2:grid.right*R.img.naturalWidth,y1:grid.top*R.img.naturalHeight,y2:grid.bottom*R.img.naturalHeight};
     if(bounds.x2<=bounds.x1||bounds.y2<=bounds.y1)throw new Error('กรอบภาพไม่ถูกต้อง');
     var cells=Array.from({length:R.raw.length},function(){return Array.from({length:19},function(){return []})});
     tesseractWords(out).forEach(function(item){var box=item.bbox||{},text=String(item.text||'').trim();if(!text)return;
       var x=(Number(box.x0)+Number(box.x1))/2,y=(Number(box.y0)+Number(box.y1))/2;if(!Number.isFinite(x)||!Number.isFinite(y))return;
       // Left bound starts from the first DUTY column, excluding the DATE column.
       var c=Math.floor((x-bounds.x1)/(bounds.x2-bounds.x1)*19),d=Math.floor((y-bounds.y1)/(bounds.y2-bounds.y1)*R.raw.length);
       if(d>=0&&d<R.raw.length&&c>=0&&c<19)cells[d][c].push({x:x,t:text});
     });
     var count=0;cells.forEach(function(row,d){row.forEach(function(a,c){a.sort(function(l,r){return l.x-r.x});var s=a.map(function(x){return x.t}).join(' ').trim();if(s){R.raw[d][c]=s;count++}})});
     rowTable();status('OCR อ่านข้อความลง '+count+' ช่อง (ไม่ยืนยันว่าถูกต้อง) • ตรวจชื่อกับภาพต้นฉบับ แก้ช่องสีแดง และตรวจครบทั้ง 31 วันก่อนบันทึก');
   }catch(e){status('อ่านภาพอัตโนมัติไม่ได้: '+e.message+' • ยังสามารถพิมพ์เลขบุคลากรลงตารางตัวอย่าง หรือใช้ CSV/Excel ได้',true)}
   finally{R.ocrBusy=false;q('ri40OCR').disabled=false}
 }
 function commit(){
   if(!ready())return;
   if(!q('ri40Confirm').checked){status('กรุณาติ๊กว่าได้ตรวจสอบความถูกต้องกับเอกสารแล้ว',true);return}
   if(typeof requireRosterEdit==='function'&&!requireRosterEdit('นำเข้าตารางเวร')){status('นำเข้าได้เฉพาะ Admin/ผู้จัดตาราง ในสถานะร่างที่ยังไม่ล็อกเท่านั้น',true);return}
   var changes=[],errors=[],byDay={};
   R.raw.forEach(function(row,i){row.forEach(function(v,c){if(!String(v||'').trim())return;var d=i+1,resolveV=resolve(v);
     if(resolveV.error){errors.push('วันที่ '+d+' '+LABELS[c]+': '+resolveV.error);return}
     if(!resolveV.id)return;
     if(typeof active==='function'&&!active(SLOTS[c],d)&&!(currentKey()==='2026-10'&&q('ri40OctHolidays').checked&&(d===13||d===16||d===23)&&(SLOTS[c].kind==='morning'||SLOTS[c].kind==='long'))){errors.push('วันที่ '+d+' '+LABELS[c]+': ช่องนี้ไม่เปิดตามกฎวัน (กรุณาตรวจวันหยุด)');return}
     byDay[d]=byDay[d]||{};if(byDay[d][resolveV.id])errors.push('วันที่ '+d+': ชื่อซ้ำ '+resolveV.text);byDay[d][resolveV.id]=true;
     changes.push({key:akey(d,IDS[c]),id:resolveV.id});
   })});
   if(errors.length){status('ยังนำเข้าไม่ได้ ('+errors.length+' จุด) เช่น '+errors.slice(0,4).join(' / '),true);return}
   if(!changes.length){status('ไม่มีรายชื่อที่ตรวจผ่านสำหรับนำเข้า',true);return}
   var existing=Object.keys(state.assignments||{}).filter(function(k){return !!state.assignments[k]}).length;
   var mode=q('ri40Mode').value,overwrite=changes.filter(function(v){return !!state.assignments[v.key]&&state.assignments[v.key]!==v.id}).length;
   if(mode==='replace'&&overwrite&&!confirm('รายการใหม่จะแทนที่ '+overwrite+' ช่องในตารางเดิม โดยไม่ลบช่องที่ไม่ได้อยู่ในไฟล์ ยืนยันหรือไม่?'))return;
   if(existing&&mode==='blank'&&!confirm('เดือนนี้มีข้อมูลเดิม '+existing+' ช่อง ระบบจะเพิ่มเฉพาะช่องว่างโดยรักษารายชื่อเดิมทั้งหมด ยืนยันหรือไม่?'))return;
   var next=Object.assign({},state.assignments||{}),applied=0,skipped=0;
   changes.forEach(function(change){if(mode==='blank'&&next[change.key]){skipped++;return}if(next[change.key]!==change.id){next[change.key]=change.id;applied++}});
   // Validate all staff uniqueness, including already-existing assignments: do not force overwrite.
   var daySlots={};Object.keys(next).forEach(function(key){var pid=next[key];if(!pid)return;var parts=key.split('|'),day=Number(parts[0]);daySlots[day]=daySlots[day]||{};if(daySlots[day][pid])errors.push('วันที่ '+day+': บุคลากรซ้ำรวมกับข้อมูลเดิม');daySlots[day][pid]=true});
   if(errors.length){status('พบความขัดแย้งกับข้อมูลเดิม: '+errors.slice(0,4).join(', '),true);return}
   if(!applied){status('ไม่มีช่องใหม่ให้เพิ่ม (ข้ามช่องที่มีชื่ออยู่แล้ว '+skipped+' ช่อง)',true);return}
   try{
    // Local rollback snapshot, with unique key; does not overwrite any prior month data.
    var backup='roster_import_backup_'+currentKey()+'_'+Date.now();
    localStorage.setItem(backup,JSON.stringify({at:new Date().toISOString(),month:currentKey(),assignments:state.assignments,workflow:workflow}));
    if(currentKey()==='2026-10'&&q('ri40OctHolidays').checked){
      ['13','16','23'].forEach(function(ds){var key='2026-10-'+ds;if(!state.holidays[key])state.holidays[key]={name:'วันหยุดตามตารางที่นำเข้า',type:'official'}});
      if(typeof saveConfig==='function')saveConfig();
    }
    state.assignments=next;
    if(typeof auditWorkflow==='function')auditWorkflow('นำเข้าตารางเวรจากไฟล์ที่ตรวจสอบแล้ว '+applied+' ช่อง');
    if(typeof saveMonth==='function')saveMonth(true);
    if(typeof renderSheet==='function')renderSheet();
    if(typeof renderHistory==='function')renderHistory();
    if(typeof renderHomeV24==='function')renderHomeV24();
    close();
    if(typeof setStatus==='function')setStatus('นำเข้าข้อมูล '+applied+' ช่องแล้ว (ข้ามช่องเดิม '+skipped+' ช่อง) • กรุณากด “ตรวจสอบ” เพื่อตรวจทุกกฎก่อนส่งอนุมัติ',true);
   }catch(e){status('บันทึกไม่สำเร็จ: '+e.message,true)}
 }
 function init(){if(!ready())return;
   var old=q('ri40Open');if(old)return;
   var btn=document.createElement('button');btn.type='button';btn.id='ri40Open';btn.className='r29-action';btn.style.background='#fff1f7';btn.style.color='#b43d76';btn.textContent='📥 นำเข้าไฟล์ / รูปตาราง';btn.onclick=open;
   var parent=q('loadBtn');parent.parentNode.insertBefore(btn,parent.nextSibling);
   var modal=document.createElement('div');modal.id='ri40Modal';modal.className='no-print';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.innerHTML=
   '<div class="ri40-panel">'+
    '<div class="ri40-head"><h2>📥 นำเข้าตารางเวร <span id="ri40TitleMonth"></span></h2><button type="button" class="ri40-close" id="ri40Close" aria-label="ปิด">×</button></div>'+
    '<p>รองรับ Excel, CSV และภาพ JPG/PNG/WebP ตารางรูปแบบ <b>วันที่ + เวร 19 ช่อง</b> ตามตารางเดิม ภาพถ่ายจะใช้ OCR ช่วยอ่าน <b>ต้องตรวจทุกช่องก่อนบันทึก</b> ระบบจะไม่เปลี่ยนเดือนหรือรันเวรใหม่เอง</p>'+
    '<div class="ri40-tools"><button type="button" id="ri40FromOctober">📅 ใช้ข้อมูลจากภาพ ต.ค. 2569 (413 ช่อง)</button><label class="ri40-pick">📎 เลือกไฟล์ / รูปภาพ<input id="ri40File" class="ri40-file" type="file" accept=".xlsx,.xls,.csv,.tsv,.txt,.jpg,.jpeg,.png,.webp,.bmp,image/*"></label><button id="ri40Template" type="button">ดาวน์โหลด CSV ตัวอย่าง</button><button id="ri40OCR" class="ri40-main" type="button" disabled>🔎 อ่านรายชื่อจากรูป (OCR)</button></div>'+
    '<div class="ri40-guide">📌 เอกสารตัวอย่าง: แถว 1 = วันที่ 1, ช่องถัดไปเรียง เวร1, เวร2, OT1, OT2, SDMC1 เช้า/บ่ายดึก ... จนถึง EXTRA3 หากข้อมูลต้นฉบับมีหมายเลข 4.ชื่อ ระบบจะจับคู่กับบุคลากรลำดับ 4 และตรวจชื่อประกอบ</div>'+
    '<div id="ri40GridSettings" hidden><p>ตำแหน่งกรอบข้อมูลสำหรับภาพ: หากตารางในภาพไม่ตรง ให้ปรับเปอร์เซ็นต์ขอบ แล้วกดอ่านใหม่ (ขอบซ้ายเริ่ม <b>ช่องเวร1</b> ไม่รวมวันที่)</p><div class="ri40-gridsettings"><label>ซ้าย (%)<input id="ri40_left" type="number" step=".1" min="0" max="99" value="9.4"></label><label>ขวา (%)<input id="ri40_right" type="number" step=".1" min="1" max="100" value="96.5"></label><label>บน (%)<input id="ri40_top" type="number" step=".1" min="0" max="99" value="15.3"></label><label>ล่าง (%)<input id="ri40_bottom" type="number" step=".1" min="1" max="100" value="89.5"></label></div></div>'+
    '<div id="ri40ImageBox" hidden><img id="ri40Photo" alt="ภาพตารางเวรต้นฉบับ"><svg id="ri40Guide" aria-hidden="true"></svg></div>'+
    '<div id="ri40Status" class="ri40-state"></div><div class="ri40-tablebox" id="ri40Table"></div>'+
    '<div id="ri40OctOptions" style="margin-top:10px"><label style="font-size:12px;display:flex;align-items:center;gap:8px"><input type="checkbox" id="ri40OctHolidays"> ตั้งวันหยุด 13, 16 และ 23 ต.ค. 2569 ตามเอกสาร (เฉพาะกรณียังไม่ตั้งค่า)</label></div>'+
    '<div class="ri40-footer"><label>การนำเข้า: <select id="ri40Mode"><option value="blank">เพิ่มเฉพาะช่องว่าง (ปลอดภัยที่สุด)</option><option value="replace">แทนที่เฉพาะช่องที่มีข้อมูลในไฟล์</option></select></label><label><input type="checkbox" id="ri40Confirm"> ฉันตรวจรายชื่อและวันเวรตรงกับต้นฉบับแล้ว</label><button id="ri40Apply" class="ri40-main" type="button">✅ นำเข้าตารางที่ตรวจแล้ว</button></div>'+ 
    '<p class="ri40-danger">ข้อควรระวัง: OCR อาจอ่านชื่อและเลขผิด โดยเฉพาะภาพตารางเล็กหรือมืด ข้อมูลที่อ่านไม่ได้จะไม่ถูกนำเข้า ห้ามยืนยันก่อนตรวจครบ</p>'+ 
   '</div>';
   document.body.appendChild(modal);
   q('ri40Close').onclick=close;q('ri40Template').onclick=downloadTemplate;q('ri40FromOctober').onclick=loadOctoberPhoto;q('ri40OCR').onclick=imageOCR;q('ri40Apply').onclick=commit;
   q('ri40File').onchange=async function(){try{await selectFile(this.files&&this.files[0]);q('ri40OCR').disabled=!R.img}catch(e){status('เปิดไฟล์ไม่สำเร็จ: '+e.message,true)}};
   modal.addEventListener('click',function(e){if(e.target===modal)close()});
   ['ri40_left','ri40_right','ri40_top','ri40_bottom'].forEach(function(id){q(id).addEventListener('input',showGuides)});
   showGuides();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.RosterImportV40={open:open,parseCSV:parseCSV,resolve:resolve,rowsFromMatrix:rowsFromMatrix,preview:function(){return R.raw.map(function(a){return a.slice()})}};
})();
