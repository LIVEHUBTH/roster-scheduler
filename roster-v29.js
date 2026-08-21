/* ROSTER SCHEDULER — ROSTER PAGE V29.1 */
(function(){
  'use strict';

  var MONTHS=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  var GROUP_MAP={
    v1:'v',v2:'v',ot1:'ot',ot2:'ot',
    s1d:'morning',s2d:'morning',s3d:'morning',s4d:'morning',
    s1n:'night',s2n:'night',s3n:'night',s4n:'night',
    s5:'long',s6:'long',s7:'evening',s8:'evening',
    e1:'extra',e2:'extra',e3:'extra'
  };
  var GROUP_KEYS=['v','ot','morning','night','long','evening','extra'];
  var refreshTimer=0;

  function q(id){return document.getElementById(id)}
  function clean(v){return String(v||'').trim()}
  function setText(id,val){var el=q(id);if(el)el.textContent=String(val)}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]})}

  function scheduleRefresh(delay){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(refresh,delay||60);
  }

  function displayNameFromOption(text){
    return clean(text).replace(/^\\d+\\.\\s*/, '');
  }

  function readPeople(){
    var people=[],seen={};

    function addPerson(id,name){
      id=clean(id);name=clean(name);
      if(!id||seen[id])return;
      seen[id]=1;
      people.push({id:id,name:name||id});
    }

    /* Primary source: the real personnel editor. This keeps the exact
       names that the scheduler uses while preserving p1/p2/... as IDs. */
    document.querySelectorAll('#names .name-row input[data-pid]').forEach(function(input){
      addPerson(input.dataset.pid,input.value);
    });

    /* Fallback: read ID + visible name from roster select options. */
    var first=document.querySelector('#sheet tbody select');
    if(first){
      Array.prototype.forEach.call(first.options,function(o){
        var id=clean(o.value);
        if(id)addPerson(id,displayNameFromOption(o.textContent));
      });
    }

    /* Last fallback for any ID that appears in assignments but is not
       currently in the personnel list. */
    document.querySelectorAll('#sheet tbody select').forEach(function(sel){
      var id=clean(sel.value);
      if(!id||seen[id])return;
      var opt=sel.options[sel.selectedIndex];
      addPerson(id,opt?displayNameFromOption(opt.textContent):id);
    });
    return people;
  }

  function buildSummary(){
    var body=q('r29SummaryBody'),foot=q('r29SummaryFoot');
    if(!body||!foot)return;
    var people=readPeople();
    var counts={};
    people.forEach(function(p){counts[p.id]={v:0,ot:0,morning:0,night:0,long:0,evening:0,extra:0,total:0}});

    document.querySelectorAll('#sheet tbody select').forEach(function(sel){
      var id=clean(sel.value);if(!id)return;
      if(!counts[id])counts[id]={v:0,ot:0,morning:0,night:0,long:0,evening:0,extra:0,total:0};
      var g=GROUP_MAP[sel.dataset.s]||'';
      if(g)counts[id][g]++;
      counts[id].total++;
    });

    var totals={v:0,ot:0,morning:0,night:0,long:0,evening:0,extra:0,total:0};
    var rows=[];
    people.forEach(function(person){
      var c=counts[person.id]||{v:0,ot:0,morning:0,night:0,long:0,evening:0,extra:0,total:0};
      GROUP_KEYS.forEach(function(g){totals[g]+=c[g]});
      totals.total+=c.total;
      rows.push('<tr><td>'+escapeHtml(person.name)+'</td><td>'+c.v+'</td><td>'+c.ot+'</td><td>'+c.morning+'</td><td>'+c.night+'</td><td>'+c.long+'</td><td>'+c.evening+'</td><td>'+c.extra+'</td><td><b>'+c.total+'</b></td><td>'+((c.total/7)||0).toFixed(1)+'</td></tr>');
    });
    body.innerHTML=rows.join('')||'<tr><td colspan="10" class="r29-empty">ยังไม่มีข้อมูลเวรในเดือนนี้</td></tr>';

    var peopleCount=Math.max(1,people.length);
    foot.innerHTML='<tr><th>เฉลี่ยรวม</th><th>'+(totals.v/peopleCount).toFixed(1)+'</th><th>'+(totals.ot/peopleCount).toFixed(1)+'</th><th>'+(totals.morning/peopleCount).toFixed(1)+'</th><th>'+(totals.night/peopleCount).toFixed(1)+'</th><th>'+(totals.long/peopleCount).toFixed(1)+'</th><th>'+(totals.evening/peopleCount).toFixed(1)+'</th><th>'+(totals.extra/peopleCount).toFixed(1)+'</th><th>'+(totals.total/peopleCount).toFixed(1)+'</th><th>'+(totals.total/peopleCount/7).toFixed(1)+'</th></tr>';
    setText('r29SummaryBadge',people.length+' คน');
  }

  function refresh(){
    try{
      var month=q('month'),year=q('year');
      if(month&&year){
        var m=parseInt(month.value,10)||0;
        setText('r29MonthTitle',MONTHS[m]+' '+(year.value||''));
      }
      var people=readPeople();
      setText('r29People',people.length+' คน');

      var duty=0;
      document.querySelectorAll('#sheet tbody select').forEach(function(sel){if(clean(sel.value))duty++});
      setText('r29Duty',duty+' เวร');

      var holidayRows=document.querySelectorAll('#sheet tbody tr.saturday,#sheet tbody tr.sunday,#sheet tbody tr.holiday').length;
      setText('r29Holiday',holidayRows+' วัน');
      setText('r29Rules',document.querySelectorAll('#ruleList .rule-item').length||21);
      buildSummary();
    }catch(err){
      /* Roster summary is supplementary. Never break the scheduler. */
    }
  }

  function moveMonth(delta){
    var month=q('month'),year=q('year');if(!month||!year)return;
    var m=parseInt(month.value,10)||0;
    var y=parseInt(year.value,10)||2569;
    m+=delta;
    if(m<0){m=11;y--}
    if(m>11){m=0;y++}
    month.value=String(m);year.value=String(y);
    month.dispatchEvent(new Event('change',{bubbles:true}));
    scheduleRefresh(80);
  }

  function go(page){
    if(typeof window.showPage==='function'){window.showPage(page,true);return}
    location.hash='#'+page;
  }

  function toggleFullscreen(){
    var card=q('r29TableCard');if(!card)return;
    var on=!card.classList.contains('is-fullscreen');
    card.classList.toggle('is-fullscreen',on);
    document.body.classList.toggle('r29-fullscreen-open',on);
    var btn=q('r29FullscreenBtn');if(btn)btn.textContent=on?'✕':'⛶';
  }

  function wire(){
    var prev=q('r29PrevMonth'),next=q('r29NextMonth');
    if(prev)prev.addEventListener('click',function(){moveMonth(-1)});
    if(next)next.addEventListener('click',function(){moveMonth(1)});

    ['month','year','runBtn','saveBtn','loadBtn','validateBtn','clearBtn'].forEach(function(id){
      var el=q(id);if(!el)return;
      el.addEventListener('change',function(){scheduleRefresh(70)});
      el.addEventListener('click',function(){scheduleRefresh(120);setTimeout(refresh,700)});
    });

    document.querySelectorAll('#page-roster [data-r29-go]').forEach(function(el){
      el.addEventListener('click',function(){go(el.dataset.r29Go)});
    });
    document.querySelectorAll('#page-roster [data-r29-focus="table"]').forEach(function(el){
      el.addEventListener('click',function(){var card=q('r29TableCard');if(card)card.scrollIntoView({behavior:'smooth',block:'start'})});
    });

    var listBtn=q('r29ListViewBtn');
    if(listBtn)listBtn.addEventListener('click',function(){var s=q('r29RosterSummary');if(s)s.scrollIntoView({behavior:'smooth',block:'start'})});
    var tableBtn=q('r29TableViewBtn');
    if(tableBtn)tableBtn.addEventListener('click',function(){var c=q('r29TableCard');if(c)c.scrollIntoView({behavior:'smooth',block:'start'})});
    var fs=q('r29FullscreenBtn');if(fs)fs.addEventListener('click',toggleFullscreen);

    document.addEventListener('keydown',function(ev){
      if(ev.key==='Escape'&&q('r29TableCard')&&q('r29TableCard').classList.contains('is-fullscreen'))toggleFullscreen();
    });

    var sheet=q('sheet');
    if(sheet){
      sheet.addEventListener('change',function(){scheduleRefresh(40)});
      /* Observe only the roster table, not the whole app. */
      new MutationObserver(function(){scheduleRefresh(50)}).observe(sheet,{childList:true,subtree:true});
    }

    refresh();
    setTimeout(refresh,450);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(wire,100)},{once:true});
  else setTimeout(wire,100);
  window.addEventListener('hashchange',function(){scheduleRefresh(80)});
})();
