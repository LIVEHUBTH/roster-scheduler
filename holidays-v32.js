/* BUILD: HOLIDAYS V32.9.5 RESTORE CALENDAR DATA HOTFIX */
/* HOLIDAYS V32.6 — independent calendar render + reliable month navigation */
(function(){
  'use strict';

  var bootAttempts=0;
  function startHolidaysV325(){
    var B=window.__ROSTER_HOLIDAYS_V32__;
    if(!B){
      bootAttempts++;
      if(bootAttempts<80)setTimeout(startHolidaysV325,100);
      return;
    }
    if(window.__HOLIDAYS_V325_BOOTED__)return;
    window.__HOLIDAYS_V325_BOOTED__=true;

  var editKey='';
  var auditKey='roster_holiday_audit_v32';
  var AUTO_YEAR=2026;

  function $(id){return document.getElementById(id)}
  function esc(s){return B.escape?B.escape(String(s==null?'':s)):String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
  function state(){
    try{
      var s=B&&typeof B.getState==='function'?B.getState():null;
      if(s)return s;
    }catch(e){}
    return {holidays:{}};
  }
  function pad(n){return String(n).padStart(2,'0')}
  function iso(y,m,d){return y+'-'+pad(m+1)+'-'+pad(d)}
  function current(){
    try{
      if(B&&typeof B.current==='function'){
        var c=B.current();
        if(c&&isFinite(Number(c.year))&&isFinite(Number(c.month))){
          c.year=Number(c.year); c.month=Number(c.month);
          c.thaiYear=Number(c.thaiYear||c.year+543);
          c.key=c.key||(c.year+'-'+pad(c.month+1));
          return c;
        }
      }
    }catch(e){}
    var ms=document.getElementById('monthSelect');
    var yi=document.getElementById('yearInput');
    var m=ms?parseInt(ms.value,10):(new Date()).getMonth();
    var ty=yi?parseInt(yi.value,10):(new Date()).getFullYear()+543;
    if(!isFinite(m)||m<0||m>11)m=(new Date()).getMonth();
    if(!isFinite(ty))ty=(new Date()).getFullYear()+543;
    var y=ty>2400?ty-543:ty;
    return {year:y,month:m,thaiYear:y+543,key:y+'-'+pad(m+1)};
  }
  function typeLabel(t){
    return t==='substitute'?'วันหยุดชดเชย':
      t==='special'?'วันหยุดพิเศษ':
      t==='buddhist'?'วันพระ':
      t==='important'?'วันสำคัญ':'นักขัตฤกษ์';
  }

  /* Official/government holidays for B.E.2569 (2026).
     Bangkok-only Oct 16 special holiday is explicitly labelled. */
  var OFFICIAL_2026=[
    ['2026-01-01','วันขึ้นปีใหม่','official'],
    ['2026-01-02','วันหยุดราชการเพิ่มเป็นกรณีพิเศษ','special'],
    ['2026-03-03','วันมาฆบูชา','official'],
    ['2026-04-06','วันจักรี','official'],
    ['2026-04-13','วันสงกรานต์','official'],
    ['2026-04-14','วันสงกรานต์','official'],
    ['2026-04-15','วันสงกรานต์','official'],
    ['2026-05-04','วันฉัตรมงคล','official'],
    ['2026-05-13','วันพืชมงคล','official'],
    ['2026-05-31','วันวิสาขบูชา','official'],
    ['2026-06-01','วันหยุดชดเชยวันวิสาขบูชา','substitute'],
    ['2026-06-03','วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี','official'],
    ['2026-07-28','วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว','official'],
    ['2026-07-29','วันอาสาฬหบูชา','official'],
    ['2026-07-30','วันเข้าพรรษา','official'],
    ['2026-08-12','วันเฉลิมพระชนมพรรษาสมเด็จพระบรมราชชนนีพันปีหลวง / วันแม่แห่งชาติ','official'],
    ['2026-10-13','วันนวมินทรมหาราช','official'],
    ['2026-10-16','วันหยุดราชการกรณีพิเศษ (เฉพาะกรุงเทพมหานคร)','special'],
    ['2026-10-23','วันปิยมหาราช','official'],
    ['2026-12-05','วันคล้ายวันพระบรมราชสมภพ ร.9 / วันชาติ / วันพ่อแห่งชาติ','official'],
    ['2026-12-07','วันหยุดชดเชยวันคล้ายวันพระบรมราชสมภพ ร.9','substitute'],
    ['2026-12-10','วันรัฐธรรมนูญ','official'],
    ['2026-12-31','วันสิ้นปี','official']
  ];

  /* Buddhist holy days B.E.2569 from the Thai lunar calendar. */
  var BUDDHIST_2026={
    '2026-01-03':'ขึ้น ๑๕ ค่ำ เดือนยี่','2026-01-11':'แรม ๘ ค่ำ เดือนยี่','2026-01-18':'แรม ๑๕ ค่ำ เดือนยี่','2026-01-26':'ขึ้น ๘ ค่ำ เดือนสาม',
    '2026-02-02':'ขึ้น ๑๕ ค่ำ เดือนสาม','2026-02-10':'แรม ๘ ค่ำ เดือนสาม','2026-02-16':'แรม ๑๔ ค่ำ เดือนสาม','2026-02-24':'ขึ้น ๘ ค่ำ เดือนสี่',
    '2026-03-03':'ขึ้น ๑๕ ค่ำ เดือนสี่ · วันมาฆบูชา','2026-03-11':'แรม ๘ ค่ำ เดือนสี่','2026-03-18':'แรม ๑๕ ค่ำ เดือนสี่','2026-03-26':'ขึ้น ๘ ค่ำ เดือนห้า',
    '2026-04-02':'ขึ้น ๑๕ ค่ำ เดือนห้า','2026-04-10':'แรม ๘ ค่ำ เดือนห้า','2026-04-16':'แรม ๑๔ ค่ำ เดือนห้า','2026-04-24':'ขึ้น ๘ ค่ำ เดือนหก',
    '2026-05-01':'ขึ้น ๑๕ ค่ำ เดือนหก','2026-05-09':'แรม ๘ ค่ำ เดือนหก','2026-05-16':'แรม ๑๕ ค่ำ เดือนหก','2026-05-24':'ขึ้น ๘ ค่ำ เดือนเจ็ด','2026-05-31':'ขึ้น ๑๕ ค่ำ เดือนเจ็ด · วันวิสาขบูชา',
    '2026-06-08':'แรม ๘ ค่ำ เดือนเจ็ด · วันอัฏฐมีบูชา','2026-06-14':'แรม ๑๔ ค่ำ เดือนเจ็ด','2026-06-22':'ขึ้น ๘ ค่ำ เดือนแปด','2026-06-29':'ขึ้น ๑๕ ค่ำ เดือนแปด',
    '2026-07-07':'แรม ๘ ค่ำ เดือนแปด','2026-07-14':'แรม ๑๕ ค่ำ เดือนแปด','2026-07-22':'ขึ้น ๘ ค่ำ เดือนแปดหลัง','2026-07-29':'ขึ้น ๑๕ ค่ำ เดือนแปดหลัง · วันอาสาฬหบูชา',
    '2026-08-06':'แรม ๘ ค่ำ เดือนแปดหลัง','2026-08-13':'แรม ๑๕ ค่ำ เดือนแปดหลัง','2026-08-21':'ขึ้น ๘ ค่ำ เดือนเก้า','2026-08-28':'ขึ้น ๑๕ ค่ำ เดือนเก้า',
    '2026-09-05':'แรม ๘ ค่ำ เดือนเก้า','2026-09-11':'แรม ๑๔ ค่ำ เดือนเก้า','2026-09-19':'ขึ้น ๘ ค่ำ เดือนสิบ','2026-09-26':'ขึ้น ๑๕ ค่ำ เดือนสิบ',
    '2026-10-04':'แรม ๘ ค่ำ เดือนสิบ','2026-10-11':'แรม ๑๕ ค่ำ เดือนสิบ','2026-10-19':'ขึ้น ๘ ค่ำ เดือนสิบเอ็ด','2026-10-26':'ขึ้น ๑๕ ค่ำ เดือนสิบเอ็ด · วันออกพรรษา',
    '2026-11-03':'แรม ๘ ค่ำ เดือนสิบเอ็ด','2026-11-09':'แรม ๑๔ ค่ำ เดือนสิบเอ็ด','2026-11-17':'ขึ้น ๘ ค่ำ เดือนสิบสอง','2026-11-24':'ขึ้น ๑๕ ค่ำ เดือนสิบสอง · วันลอยกระทง',
    '2026-12-02':'แรม ๘ ค่ำ เดือนสิบสอง','2026-12-09':'แรม ๑๕ ค่ำ เดือนสิบสอง','2026-12-17':'ขึ้น ๘ ค่ำ เดือนอ้าย','2026-12-24':'ขึ้น ๑๕ ค่ำ เดือนอ้าย'
  };

  /* Curated Thai national / social / professional important dates.
     These are shown for reference only and are NOT automatically treated as off-duty holidays. */
  var IMPORTANT_2026={
    '2026-01-10':'วันเด็กแห่งชาติ','2026-01-16':'วันครู','2026-01-18':'วันกองทัพไทย',
    '2026-02-02':'วันนักประดิษฐ์','2026-02-06':'วันมวยไทย',
    '2026-03-13':'วันช้างไทย',
    '2026-04-01':'วันข้าราชการพลเรือน','2026-04-02':'วันอนุรักษ์มรดกไทย','2026-04-07':'วันอนามัยโลก','2026-04-22':'วันคุ้มครองโลก','2026-04-24':'วันเทศบาล',
    '2026-05-01':'วันแรงงานแห่งชาติ','2026-05-08':'วันกาชาดสากล','2026-05-12':'วันพยาบาลสากล','2026-05-13':'วันพืชมงคล','2026-05-31':'วันงดสูบบุหรี่โลก / วันต้นไม้แห่งชาติ',
    '2026-06-05':'วันสิ่งแวดล้อมโลก','2026-06-09':'วันอานันทมหิดล','2026-06-24':'วันเปลี่ยนแปลงการปกครอง','2026-06-26':'วันสุนทรภู่ / วันต่อต้านยาเสพติด',
    '2026-07-01':'วันสถาปนาลูกเสือแห่งชาติ','2026-07-29':'วันภาษาไทยแห่งชาติ','2026-07-30':'วันเข้าพรรษา',
    '2026-08-01':'วันสตรีไทย','2026-08-04':'วันสื่อสารแห่งชาติ / วันสัตวแพทย์ไทย','2026-08-07':'วันรพี','2026-08-12':'วันแม่แห่งชาติ','2026-08-16':'วันสันติภาพไทย','2026-08-18':'วันวิทยาศาสตร์แห่งชาติ','2026-08-27':'วันสารทจีน',
    '2026-09-01':'วันสืบ นาคะเสถียร','2026-09-20':'วันเยาวชนแห่งชาติ','2026-09-24':'วันมหิดล','2026-09-28':'วันพระราชทานธงชาติไทย',
    '2026-10-13':'วันคล้ายวันสวรรคต ร.9','2026-10-14':'วันประชาธิปไตย','2026-10-17':'วันตำรวจ','2026-10-21':'วันพยาบาลแห่งชาติ / วันทันตสาธารณสุขแห่งชาติ','2026-10-23':'วันปิยมหาราช',
    '2026-11-14':'วันพระบิดาแห่งฝนหลวง','2026-11-20':'วันกองทัพเรือ','2026-11-24':'วันลอยกระทง','2026-11-25':'วันวชิราวุธ','2026-11-27':'วันสาธารณสุขแห่งชาติ',
    '2026-12-04':'วันสิ่งแวดล้อมไทย','2026-12-05':'วันชาติ / วันพ่อแห่งชาติ','2026-12-10':'วันรัฐธรรมนูญ','2026-12-16':'วันกีฬาแห่งชาติ','2026-12-25':'วันคริสต์มาส','2026-12-26':'วันคุ้มครองสัตว์ป่าแห่งชาติ','2026-12-28':'วันสมเด็จพระเจ้าตากสินมหาราช','2026-12-31':'วันสิ้นปี'
  };

  function iconFor(name,type,kind){
    var s=String(name||'');
    if(kind==='buddhist')return 'lotus';
    if(kind==='important'){
      if(/รพี|กฎหมาย|ยุติธรรม|ศาล|ประชาธิปไตย|รัฐธรรมนูญ/.test(s))return 'scales';
      if(/สตรี|สงกรานต์|พืชมงคล|ดอกไม้|ชมพู/.test(s))return 'flower';
      if(/แม่|วันแม่|ราชินี|เฉลิมพระชนมพรรษา/.test(s))return 'crown';
      if(/ชาติ|ธง|แรงงาน|ฉัตรมงคล|สื่อสาร|สัตวแพทย์|วันเด็ก/.test(s))return 'flag';
      return 'spark';
    }
    if(/พรรษา|มาฆ|วิสาข|อาสาฬห|บูชา|วันพระ/.test(s))return 'lotus';
    if(/แม่|วันแม่|ราชินี|เฉลิมพระชนมพรรษา/.test(s))return 'crown';
    if(/รพี|กฎหมาย|ยุติธรรม|ศาล|รัฐธรรมนูญ/.test(s))return 'scales';
    if(/สตรี|สงกรานต์|พืชมงคล|ดอกไม้|ชมพู/.test(s))return 'flower';
    if(/ชาติ|ธง|แรงงาน|ฉัตรมงคล|จักรี|สื่อสาร|สัตวแพทย์/.test(s))return 'flag';
    if(type==='substitute')return 'refresh';
    if(type==='special')return 'spark';
    return 'calendar';
  }

  function seedOfficial2569(){
    var s=state();s.holidays=s.holidays||{};
    var changed=false;
    OFFICIAL_2026.forEach(function(x){
      if(!s.holidays[x[0]]){
        s.holidays[x[0]]={name:x[1],type:x[2],source:'TH-2569'};
        changed=true;
      }
    });
    if(changed){try{B.saveConfig()}catch(e){console.warn('[V32.3] seed save',e)}}
  }

  function readAudit(){try{return JSON.parse(localStorage.getItem(auditKey)||'[]')}catch(e){return []}}
  function writeAudit(action,name){
    var u=B.getUser?B.getUser():{name:'ผู้จัดตารางเวร',username:'admin'};
    var arr=readAudit();
    arr.unshift({at:new Date().toISOString(),who:u.name||u.username||'ผู้จัดตารางเวร',action:action,name:name||''});
    arr=arr.slice(0,30);
    try{localStorage.setItem(auditKey,JSON.stringify(arr))}catch(e){}
  }

  function formatThaiDate(k){
    var p=k.split('-'),d=parseInt(p[2],10),m=parseInt(p[1],10),y=parseInt(p[0],10)+543;
    var days=['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];
    var wd=new Date(+p[0],m-1,d).getDay();
    return days[wd]+' '+d+' '+['','ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][m]+' '+y;
  }

  function eventsForDate(key){
    var a=[],h=(state().holidays||{})[key];
    if(h)a.push({kind:'holiday',type:h.type||'official',name:h.name||'วันหยุด'});
    if(BUDDHIST_2026[key])a.push({kind:'buddhist',type:'buddhist',name:'วันพระ · '+BUDDHIST_2026[key]});
    if(IMPORTANT_2026[key])a.push({kind:'important',type:'important',name:IMPORTANT_2026[key]});
    return a;
  }

  function monthDates(){
    var c=current(),prefix=c.key+'-',set={};
    Object.keys(state().holidays||{}).forEach(function(k){if(k.indexOf(prefix)===0)set[k]=1});
    Object.keys(BUDDHIST_2026).forEach(function(k){if(k.indexOf(prefix)===0)set[k]=1});
    Object.keys(IMPORTANT_2026).forEach(function(k){if(k.indexOf(prefix)===0)set[k]=1});
    return Object.keys(set).sort();
  }


  function applyCalendarIconsV323(){
    var titleIcon=document.querySelector('#page-holidays .h32-title-icon');
    if(titleIcon){
      titleIcon.textContent='🗓️';
      titleIcon.setAttribute('aria-label','ปฏิทินวันหยุด');
      titleIcon.title='ปฏิทินวันหยุด';
    }
    var cardIcon=document.querySelector('#page-holidays .h32-head-icon.pink');
    if(cardIcon){
      cardIcon.textContent='📅';
      cardIcon.setAttribute('aria-label','ปฏิทิน');
      cardIcon.title='ปฏิทิน';
    }
  }

  function renderLegendV323(){
    var host=document.querySelector('#page-holidays .h32-legend');
    if(!host)return;
    host.innerHTML=[
      '<span class="legend-saturday"><i class="dot saturday"></i>วันเสาร์</span>',
      '<span class="legend-sunday"><i class="dot sunday"></i>วันอาทิตย์</span>',
      '<span class="legend-buddhist"><i class="legend-monk">🧘‍♂️</i><i class="dot buddhist"></i>วันพระ</span>',
      '<span class="legend-today"><i class="dot today"></i>วันปัจจุบัน</span>',
      '<span class="legend-official"><i class="dot official"></i>นักขัตฤกษ์</span>',
      '<span class="legend-important"><i class="dot important"></i>วันสำคัญ</span>',
      '<span class="legend-substitute"><i class="dot substitute"></i>วันหยุดชดเชย</span>',
      '<span class="legend-special"><i class="dot special"></i>วันหยุดพิเศษ</span>'
    ].join('');
  }

  function shortCalendarCaption(evs){
    if(!evs||!evs.length)return '';
    var holiday=evs.find(function(x){return x.kind==='holiday'});
    var important=evs.find(function(x){return x.kind==='important'});
    var buddhist=evs.find(function(x){return x.kind==='buddhist'});
    if(holiday)return holiday.name||'วันหยุด';
    if(important)return important.name||'วันสำคัญ';
    if(buddhist)return 'วันพระ';
    return '';
  }

  function renderCalendarV322(){
    var host=$('holidayCalendarV24');if(!host)return;
    var c=current()||{},y=Number(c.year),m=Number(c.month);
    if(!isFinite(y)||y<1900||y>2200)y=(new Date()).getFullYear();
    if(!isFinite(m)||m<0||m>11)m=(new Date()).getMonth();
    var first=new Date(y,m,1);
    var start=new Date(y,m,1-first.getDay());
    var today=new Date();
    var html='';

    for(var i=0;i<42;i++){
      var d=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);
      var key=iso(d.getFullYear(),d.getMonth(),d.getDate());
      var evs=eventsForDate(key);
      var h=(state().holidays||{})[key];
      var hasBuddhist=!!BUDDHIST_2026[key];
      var hasImportant=!!IMPORTANT_2026[key];
      var isToday=today.getFullYear()===d.getFullYear()&&today.getMonth()===d.getMonth()&&today.getDate()===d.getDate();
      var classes=['h32-day'];

      if(d.getMonth()!==m)classes.push('is-muted');
      if(d.getDay()===0)classes.push('is-sunday');
      if(d.getDay()===6)classes.push('is-saturday');

      if(h){
        if(h.type==='substitute')classes.push('is-substitute');
        else if(h.type==='special')classes.push('is-special');
        else classes.push('is-official');
      }else if(hasImportant){
        classes.push('is-important');
      }else if(hasBuddhist){
        classes.push('is-buddhist');
      }

      if(hasBuddhist)classes.push('has-buddhist');
      if(hasImportant)classes.push('has-important');
      if(isToday)classes.push('is-today');

      var markers=[];
      if(d.getDay()===6)markers.push('<i class="h32-mini-dot saturday" title="วันเสาร์"></i>');
      if(d.getDay()===0)markers.push('<i class="h32-mini-dot sunday" title="วันอาทิตย์"></i>');
      if(hasBuddhist)markers.push('<span class="h32-buddha-mark" title="วันพระ" aria-label="วันพระ">🧘‍♂️</span>');
      if(h){
        markers.push('<i class="h32-mini-dot '+esc(h.type||'official')+'" title="'+esc(typeLabel(h.type||'official'))+'"></i>');
      }
      if(hasImportant)markers.push('<i class="h32-mini-dot important" title="วันสำคัญ"></i>');
      if(isToday)markers.push('<i class="h32-mini-dot today" title="วันปัจจุบัน"></i>');

      var caption=shortCalendarCaption(evs);
      var title=evs.map(function(x){return x.name}).join(' • ');
      var aria=formatThaiDate(key)+(title?' '+title:'')+(isToday?' วันปัจจุบัน':'');

      html+='<button type="button" class="'+classes.join(' ')+'" data-date="'+key+'" title="'+esc(title)+'" aria-label="'+esc(aria)+'">'+
        '<span class="h32-day-number">'+d.getDate()+'</span>'+
        '<span class="h32-day-caption">'+(caption?esc(caption):'&nbsp;')+'</span>'+
        '<span class="h32-day-markers">'+markers.join('')+'</span>'+
      '</button>';
    }

    host.innerHTML=html;

    host.querySelectorAll('.h32-day').forEach(function(btn){
      btn.addEventListener('click',function(){
        var key=this.dataset.date;
        if($('holidayDate'))$('holidayDate').value=key;
        var h=(state().holidays||{})[key];
        if(h&&key.indexOf(current().key+'-')===0)loadEdit(key);
      });
    });
  }

  function renderSummary(){
    var c=current(),prefix=c.key+'-',hol=state().holidays||{},keys=Object.keys(hol).filter(function(k){return k.indexOf(prefix)===0});
    var official=0,substitute=0,special=0;
    keys.forEach(function(k){
      var t=(hol[k]&&hol[k].type)||'official';
      if(t==='official')official++;else if(t==='substitute')substitute++;else special++;
    });
    var weekend=0,days=new Date(c.year,c.month+1,0).getDate();
    for(var d=1;d<=days;d++){var wd=new Date(c.year,c.month,d).getDay();if(wd===0||wd===6)weekend++}
    if($('holidayTotalV24'))$('holidayTotalV24').textContent=keys.length;
    if($('holidayOfficialV24'))$('holidayOfficialV24').textContent=official;
    if($('holidayWeekendV24'))$('holidayWeekendV24').textContent=weekend;
    if($('holidaySpecialV24'))$('holidaySpecialV24').textContent=special;
    var b=Object.keys(BUDDHIST_2026).filter(function(k){return k.indexOf(prefix)===0}).length;
    var im=Object.keys(IMPORTANT_2026).filter(function(k){return k.indexOf(prefix)===0}).length;
    if($('holidaySummaryNoteV32'))$('holidaySummaryNoteV32').textContent='* พ.ศ. '+c.thaiYear+' · วันพระ '+b+' วัน · วันสำคัญ '+im+' วัน';
  }

  function renderUpcoming(){
    var box=$('holidayUpcomingV24');if(!box)return;
    var keys=monthDates(),all=$('holidayShowAllV32')&&$('holidayShowAllV32').dataset.all==='1';
    var show=all?keys:keys.slice(0,5);
    if(!show.length){
      box.innerHTML='<div style="display:block;padding:18px;text-align:center;color:#9aa1ad">เดือนนี้ยังไม่มีรายการวันหยุดหรือวันสำคัญ</div>';
      if($('holidayUpcomingFootV32'))$('holidayUpcomingFootV32').textContent='ไม่มีรายการในเดือนนี้';
      return;
    }
    box.innerHTML=show.map(function(k){
      var evs=eventsForDate(k),holiday=evs.find(function(x){return x.kind==='holiday'}),buddhist=evs.find(function(x){return x.kind==='buddhist'}),important=evs.find(function(x){return x.kind==='important'});
      var main=holiday||buddhist||important;
      var names=evs.map(function(x){return x.name}).join(' / ');
      var type=holiday?(holiday.type||'official'):(buddhist?'buddhist':'important');
      var label=holiday?typeLabel(type):(buddhist?'วันพระ':'วันสำคัญ');
      var edit=holiday?'<button type="button" class="h32-edit-event" data-edit="'+k+'">แก้ไข</button>':'';
      var iconKey=iconFor(main&&main.name,type,main&&main.kind);
      return '<div data-key="'+k+'" class="h32-up-item">'+
        '<span class="h32-event-icon icon-'+iconKey+' '+type+'" aria-hidden="true"></span>'+
        '<span class="h32-event-name"><b>'+esc(names)+'</b></span>'+
        '<span class="h32-event-date">'+esc(formatThaiDate(k))+'</span>'+
        '<span class="h32-type-badge '+type+'">'+label+'</span>'+edit+'</div>';
    }).join('');
    box.querySelectorAll('[data-edit]').forEach(function(btn){btn.onclick=function(){loadEdit(this.dataset.edit)}});
    if($('holidayUpcomingFootV32'))$('holidayUpcomingFootV32').textContent='มีวันหยุด/วันพระ/วันสำคัญ '+keys.length+' วันที่ในเดือนนี้';
  }

  function renderAudit(){
    var box=$('holidayAuditV24');if(!box)return;
    var arr=readAudit(),all=$('holidayAuditAllV32')&&$('holidayAuditAllV32').dataset.all==='1';
    arr=all?arr:arr.slice(0,4);
    box.innerHTML=arr.length?arr.map(function(x){
      var d=new Date(x.at),date=d.getDate()+'/'+(d.getMonth()+1)+'/'+String(d.getFullYear()+543).slice(-2)+' '+pad(d.getHours())+':'+pad(d.getMinutes());
      return '<div><span class="h32-audit-avatar">👤</span><span class="h32-audit-main"><b>'+esc(x.who)+'</b><span>'+esc(x.action)+' “'+esc(x.name)+'”</span></span><span class="h32-audit-time">'+date+'</span></div>';
    }).join(''):'<div style="display:block;text-align:center;color:#9aa1ad">ยังไม่มีประวัติการแก้ไข</div>';
  }

  function renderMonthTitle(){
    var c=current(),months=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    if($('holidayMonthTitleV24'))$('holidayMonthTitleV24').textContent=months[c.month]+' '+c.thaiYear;
  }

  function refresh(){
    try{seedOfficial2569()}catch(e){console.warn('[V32.5] seed',e)}
    try{applyCalendarIconsV323()}catch(e){console.warn('[V32.5] icons',e)}
    try{renderMonthTitle()}catch(e){console.warn('[V32.5] month title',e)}
    try{renderCalendarV322()}catch(e){console.error('[V32.5] calendar',e)}
    try{renderLegendV323()}catch(e){console.warn('[V32.5] legend',e)}
    try{renderSummary()}catch(e){console.warn('[V32.5] summary',e)}
    try{renderUpcoming()}catch(e){console.warn('[V32.5] upcoming',e)}
    try{renderAudit()}catch(e){console.warn('[V32.5] audit',e)}
  }

  function clearForm(){
    editKey='';
    if($('holidayName'))$('holidayName').value='';
    if($('holidayDate'))$('holidayDate').value='';
    if($('holidayTypeV24'))$('holidayTypeV24').value='official';
    if($('holidayEditHintV32'))$('holidayEditHintV32').hidden=true;
    if($('addHolidayBtn'))$('addHolidayBtn').textContent='＋ เพิ่มวันหยุด';
  }

  function loadEdit(k){
    var item=(state().holidays||{})[k];if(!item)return;
    editKey=k;
    if($('holidayName'))$('holidayName').value=item.name||'';
    if($('holidayDate'))$('holidayDate').value=k;
    if($('holidayTypeV24'))$('holidayTypeV24').value=item.type||'official';
    if($('holidayEditHintV32'))$('holidayEditHintV32').hidden=false;
    if($('addHolidayBtn'))$('addHolidayBtn').textContent='✓ บันทึกวันหยุด';
    if($('holidayName'))$('holidayName').focus();
  }

  function saveFromForm(ev){
    if(ev)ev.preventDefault();
    var name=$('holidayName')?$('holidayName').value.trim():'';
    var date=$('holidayDate')?$('holidayDate').value:'';
    var type=$('holidayTypeV24')?$('holidayTypeV24').value||'official':'official';
    if(!date){alert('กรุณาเลือกวันที่');return}
    if(!name){alert('กรุณากรอกชื่อวันหยุด');return}
    var s=state();s.holidays=s.holidays||{};
    if(editKey&&editKey!==date)delete s.holidays[editKey];
    s.holidays[date]={name:name,type:type,source:'manual'};
    try{B.saveConfig()}catch(e){}
    writeAudit(editKey?'แก้ไขวันหยุด':'เพิ่มวันหยุด',name);
    editKey='';clearForm();
    try{B.renderSheet()}catch(e){}
    setTimeout(refresh,20);
  }

  function setToday(){
    var d=new Date();B.setMonth(d.getFullYear(),d.getMonth());setTimeout(refresh,30);
  }

  function wireMonthPicker(){
    var btn=$('holidayMonthPickerV32');if(!btn)return;
    var input=document.createElement('input');
    input.type='month';input.setAttribute('aria-label','เลือกเดือน');
    input.style.position='fixed';input.style.left='-9999px';input.style.top='-9999px';
    document.body.appendChild(input);
    btn.addEventListener('click',function(){
      var c=current();input.value=c.year+'-'+pad(c.month+1);
      if(typeof input.showPicker==='function'){try{input.showPicker();return}catch(e){}}
      input.click();
    });
    input.addEventListener('change',function(){
      if(!this.value)return;
      var p=this.value.split('-'),y=parseInt(p[0],10),m=parseInt(p[1],10)-1;
      if(isFinite(y)&&isFinite(m)){B.setMonth(y,m);setTimeout(refresh,30)}
    });
  }

  function wire(){
    seedOfficial2569();

    var add=$('addHolidayBtn');
    if(add){add.onclick=saveFromForm;add.style.pointerEvents='auto'}

    if($('holidayClearV32'))$('holidayClearV32').onclick=clearForm;
    if($('holidayTodayV32'))$('holidayTodayV32').onclick=setToday;

    if($('holidayShowAllV32'))$('holidayShowAllV32').onclick=function(){
      this.dataset.all=this.dataset.all==='1'?'0':'1';
      this.textContent=this.dataset.all==='1'?'ย่อรายการ':'ดูทั้งหมด';
      renderUpcoming();
    };
    if($('holidayAuditAllV32'))$('holidayAuditAllV32').onclick=function(){
      this.dataset.all=this.dataset.all==='1'?'0':'1';
      this.textContent=this.dataset.all==='1'?'ย่อรายการ':'ดูทั้งหมด';
      renderAudit();
    };

    var prev=$('holidayPrevMonthV24');
    if(prev)prev.onclick=function(ev){
      if(ev)ev.preventDefault();
      var c=current(),m=c.month-1,y=c.year;
      if(m<0){m=11;y--;}
      if(B&&typeof B.setMonth==='function')B.setMonth(y,m);
      else{if($('monthSelect'))$('monthSelect').value=String(m);if($('yearInput'))$('yearInput').value=String(y+543);}
      setTimeout(refresh,20);
    };
    var next=$('holidayNextMonthV24');
    if(next)next.onclick=function(ev){
      if(ev)ev.preventDefault();
      var c=current(),m=c.month+1,y=c.year;
      if(m>11){m=0;y++;}
      if(B&&typeof B.setMonth==='function')B.setMonth(y,m);
      else{if($('monthSelect'))$('monthSelect').value=String(m);if($('yearInput'))$('yearInput').value=String(y+543);}
      setTimeout(refresh,20);
    };

    wireMonthPicker();
    refresh();
    setTimeout(refresh,120);
    setTimeout(refresh,500);
    setTimeout(refresh,1200);
    setInterval(function(){
      var host=$('holidayCalendarV24');
      if(host&&host.querySelectorAll('.h32-day').length<28)refresh();
    },1500);

    var page=$('page-holidays');
    if(page&&window.MutationObserver){
      new MutationObserver(function(){
        if(page.classList.contains('active')||page.classList.contains('show')){
          setTimeout(refresh,30);
          setTimeout(refresh,180);
        }
      }).observe(page,{attributes:true,attributeFilter:['class','style']});
    }
  }

  window.HolidaysV32={refresh:refresh,loadEdit:loadEdit,clearForm:clearForm};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});
  else wire();

  window.addEventListener('pageshow',function(){setTimeout(refresh,60)});
  }

  startHolidaysV325();
})();
