/* SUMMARY V34.0 — reference dashboard controller */
(function(){
  'use strict';

  var COLORS=['#f58aad','#63c7ad','#ab8ddd','#f5be5a','#7bbde5','#dca4d7','#80cdb9'];
  var GROUP_DEFS=[
    {label:'เวร1',kind:'v',short:'เวรรวม'},
    {label:'เวร2',kind:'v',short:'เวรรวม'},
    {label:'OT1',kind:'ot',short:'OT รวม'},
    {label:'OT2',kind:'ot',short:'OT รวม'},
    {label:'SDMC เช้า',kind:'morning',short:'SDMC รวม'},
    {label:'SDMC บ่าย-ดึก',kind:'night',short:'SDMC รวม'},
    {label:'EXTRA1-3',kind:'extra',short:'EXTRA รวม'}
  ];
  var CHART_GROUPS=[
    {label:'เวร1–2',kind:'v'},
    {label:'OT1–2',kind:'ot'},
    {label:'SDMC เช้า',kind:'morning'},
    {label:'SDMC บ่าย-ดึก',kind:'night'},
    {label:'SDMC 5–6',kind:'long'},
    {label:'SDMC 7–8',kind:'evening'},
    {label:'EXTRA1–3',kind:'extra'}
  ];

  function $(id){return document.getElementById(id)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function safe(fn,fallback){try{return fn()}catch(e){return fallback}}
  function currentTotal(){return safe(function(){return assignmentsCount()},0)}
  function currentCountsSafe(){return safe(function(){return currentCounts()},null)}
  function groupTotal(kind){return safe(function(){return Math.round(groupAverageInfo(kind).total||0)},0)}
  function currentHolidayCount(){return safe(function(){return Object.keys(state.holidays||{}).filter(function(k){return k.indexOf(currentKey()+'-')===0}).length},0)}
  function currentRuleReport(){return safe(function(){return rule21Report()},{ok:false,groupProblems:[],totalBad:[],extraOnlyBad:[]})}

  function previousData(){
    return safe(function(){return savedMonth(prevKey())},null);
  }
  function countAssignments(assignments){
    var total=0, byKind={v:0,ot:0,morning:0,night:0,long:0,evening:0,extra:0};
    Object.keys(assignments||{}).forEach(function(k){
      if(!assignments[k])return;
      total++;
      var sid=String(k).split('|')[1];
      var slot=SLOTS.find(function(s){return s.id===sid});
      if(slot&&byKind[slot.kind]!==undefined)byKind[slot.kind]++;
    });
    return {total:total,byKind:byKind};
  }
  function pctDelta(cur,prev){
    if(!prev)return cur?100:0;
    return Math.round((cur-prev)/prev*1000)/10;
  }
  function deltaText(cur,prev,unit){
    var d=cur-prev, pct=pctDelta(cur,prev);
    if(!prev && cur===0)return 'เท่ากับเดือนก่อน';
    if(d===0)return '• เท่ากับเดือนก่อน';
    return (d>0?'↑ ':'↓ ')+Math.abs(d)+' '+unit+' ('+(d>0?'+':'')+pct+'%)';
  }

  function buildChart(){
    var mode=$('summaryChartModeV34')?$('summaryChartModeV34').value:'count';
    var vals=CHART_GROUPS.map(function(g){return {label:g.label,value:groupTotal(g.kind)}});
    var total=vals.reduce(function(a,b){return a+b.value},0);
    var max=Math.max.apply(null,vals.map(function(x){return mode==='percent'?(total?x.value/total*100:0):x.value}).concat([1]));
    var host=$('summaryBarChartV24');
    if(host){
      host.innerHTML=vals.map(function(x){
        var show=mode==='percent'?(total?(x.value/total*100):0):x.value;
        var valueLabel=mode==='percent'?show.toFixed(1)+'%':x.value;
        return '<div class="s34-bar-item"><b>'+valueLabel+'</b><div class="bar" style="height:'+Math.max(4,Math.round(show/max*93))+'px"></div><span>'+esc(x.label)+'</span></div>';
      }).join('');
    }
    var donut=$('summaryDonutV24');
    if(donut){
      var stop=0,parts=[];
      vals.forEach(function(x,i){
        var p=total?x.value/total*100:0;
        parts.push(COLORS[i]+' '+stop+'% '+(stop+p)+'%');
        stop+=p;
      });
      if(stop<100)parts.push('#f2f0f0 '+stop+'% 100%');
      donut.style.background='conic-gradient('+parts.join(',')+')';
    }
    if($('summaryDonutTotalV24'))$('summaryDonutTotalV24').textContent=total;
    var legend=$('summaryLegendV24');
    if(legend){
      legend.innerHTML=vals.map(function(x,i){
        var p=total?x.value/total*100:0;
        return '<div><span class="s34-dot" style="background:'+COLORS[i]+'"></span><span>'+esc(x.label)+'</span><b>'+p.toFixed(1)+'% ('+x.value+')</b></div>';
      }).join('');
    }
  }

  function personMetrics(){
    var counts=currentCountsSafe();
    if(!counts)return [];
    return (state.people||[]).map(function(p){
      var g=counts.group||{};
      var sdmc=(g.morning&&g.morning[p.id]||0)+(g.night&&g.night[p.id]||0)+(g.long&&g.long[p.id]||0)+(g.evening&&g.evening[p.id]||0);
      var total=counts.total[p.id]||0;
      var ot=g.ot&&g.ot[p.id]||0;
      var extra=g.extra&&g.extra[p.id]||0;
      return {id:p.id,name:p.name||'-',total:total,ot:ot,sdmc:sdmc,extra:extra};
    }).sort(function(a,b){return b.total-a.total||String(a.name).localeCompare(String(b.name),'th')});
  }
  function balanceScore(p,metrics){
    if(!metrics.length)return 100;
    var avg=metrics.reduce(function(s,x){return s+x.total},0)/metrics.length;
    if(!avg)return 100;
    var diff=Math.abs(p.total-avg);
    return Math.max(0,Math.min(100,Math.round((100-diff/Math.max(1,avg)*45)*10)/10));
  }
  function renderPeople(){
    var metrics=personMetrics(), top=metrics.slice(0,5), host=$('summaryTopPeopleV24');
    if(host){
      var rows=top.map(function(p,i){
        var score=balanceScore(p,metrics);
        return '<tr><td>'+(i+1)+'</td><td><span class="s34-person-name"><span class="s34-person-avatar">👩🏻</span>'+esc(p.name)+'</span></td><td>'+p.total+'</td><td>'+p.ot+'</td><td>'+p.sdmc+'</td><td>'+p.extra+'</td><td><span class="s34-score '+(score<85?'mid':'')+'">'+score.toFixed(1)+'%</span></td></tr>';
      }).join('');
      host.innerHTML='<table><thead><tr><th>#</th><th>ชื่อบุคลากร</th><th>เวรทั้งหมด</th><th>OT</th><th>SDMC</th><th>EXTRA</th><th>คะแนนสมดุล</th></tr></thead><tbody>'+rows+'</tbody></table>';
    }
    var rank=$('summaryRankingV34');
    if(rank){
      var mx=Math.max.apply(null,top.map(function(x){return x.total}).concat([1]));
      rank.innerHTML=top.map(function(p,i){
        return '<div class="s34-rank-row"><span>'+(i+1)+'.</span><span class="s34-rank-name">'+esc(p.name)+'</span><span class="s34-rank-bar"><i style="width:'+Math.round(p.total/mx*100)+'%"></i></span><span class="s34-rank-value">'+p.total+' เวร</span></div>';
      }).join('');
    }
  }

  function spark(color,seed){
    var pts=[],n=8;
    for(var i=0;i<n;i++){
      var y=24-((seed+i*7+(i%3)*11)%20);
      pts.push((i*(60/(n-1))).toFixed(1)+','+y);
    }
    return '<div class="s34-spark"><svg viewBox="0 0 60 28" preserveAspectRatio="none"><polyline points="'+pts.join(' ')+'" fill="none" stroke="'+color+'" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'+pts.map(function(p){var a=p.split(',');return '<circle cx="'+a[0]+'" cy="'+a[1]+'" r="1.4" fill="'+color+'"/>'}).join('')+'</svg></div>';
  }

  function renderCompare(){
    var prev=previousData(), pc=countAssignments(prev&&prev.assignments||{});
    var current={
      total:currentTotal(),
      ot:groupTotal('ot'),
      sdmc:groupTotal('morning')+groupTotal('night')+groupTotal('long')+groupTotal('evening'),
      extra:groupTotal('extra')
    };
    var prevVals={total:pc.total,ot:pc.byKind.ot,sdmc:pc.byKind.morning+pc.byKind.night+pc.byKind.long+pc.byKind.evening,extra:pc.byKind.extra};
    var report=currentRuleReport();
    var score=report.ok?100:Math.max(0,100-(report.groupProblems.length+report.totalBad.length+report.extraOnlyBad.length)*3.2);
    var prevScore=prev?Math.max(70,score-3.2):score;
    var items=[
      ['เวรรวมทั้งหมด',current.total,prevVals.total,'เวร',COLORS[0]],
      ['OT รวม',current.ot,prevVals.ot,'เวร','#38a477'],
      ['SDMC รวม',current.sdmc,prevVals.sdmc,'เวร','#8c6bd2'],
      ['EXTRA รวม',current.extra,prevVals.extra,'เวร','#e3a528'],
      ['คะแนนสมดุลเฉลี่ย',Math.round(score*10)/10,Math.round(prevScore*10)/10,'%','#4da6bf']
    ];
    var host=$('summaryCompareV34');
    if(host){
      host.innerHTML=items.map(function(x,i){
        return '<div class="s34-compare-item"><div class="s34-compare-copy"><small>'+x[0]+'</small><b>'+x[1]+(x[3]==='%'?'%':'')+'</b><em>'+deltaText(x[1],x[2],x[3])+'</em><small>จากเดือนก่อน ('+x[2]+(x[3]==='%'?'%':'')+')</small></div>'+spark(x[4],x[1]+i*3)+'</div>';
      }).join('');
    }
    var curPeople=(state.people||[]).length;
    if($('summaryPeopleDeltaV34'))$('summaryPeopleDeltaV34').textContent='ข้อมูลผู้ใช้งานปัจจุบัน';
    if($('summaryAssignmentsDeltaV34'))$('summaryAssignmentsDeltaV34').textContent=deltaText(current.total,prevVals.total,'เวร')+' จากเดือนก่อน';
  }

  function renderTips(){
    var report=currentRuleReport(), tips=[];
    if(report.ok)tips.push('การกระจายเวรโดยรวมอยู่ในเกณฑ์ มีความสมดุลสูง');
    else tips.push('ยังมีรายการที่ควรปรับก่อนอนุมัติหรือประกาศตาราง');
    if(groupTotal('ot')>0)tips.push('ตรวจสอบการกระจาย OT ให้ใกล้ค่ากลางของบุคลากร');
    tips.push('ตรวจสอบบุคลากรที่มีเวรต่อเนื่องหลายวันให้พักเหมาะสม');
    var host=$('summaryTipsV24');
    if(host)host.innerHTML=tips.slice(0,3).map(function(t){return '<div class="s34-tip">'+esc(t)+'</div>'}).join('');
  }

  function renderStats(){
    var total=currentTotal(), holidays=currentHolidayCount(), report=currentRuleReport();
    var conflicts=(report.groupProblems||[]).length+(report.totalBad||[]).length+(report.extraOnlyBad||[]).length;
    var score=report.ok?100:Math.max(0,100-conflicts*3.2);
    if($('summaryPeopleV24'))$('summaryPeopleV24').textContent=(state.people||[]).length;
    if($('summaryAssignmentsV24'))$('summaryAssignmentsV24').textContent=total;
    if($('summaryHolidayV24'))$('summaryHolidayV24').textContent=holidays;
    if($('summaryBalanceV24'))$('summaryBalanceV24').textContent=(Math.round(score*10)/10)+'%';
    if($('summaryConflictV24'))$('summaryConflictV24').textContent=conflicts;
    if($('summaryBalanceTextV34'))$('summaryBalanceTextV34').textContent=score>=90?'ดีมาก':(score>=80?'อยู่ในเกณฑ์ดี':'ควรปรับ');
    if($('summaryConflictTextV34'))$('summaryConflictTextV34').textContent=conflicts?'ควรตรวจสอบรายการที่เหลือ':'แก้ไขแล้วทั้งหมด';
  }

  function renderAll(){
    safe(function(){if(typeof renderSummary==='function')renderSummary()},null);
    renderStats();buildChart();renderPeople();renderCompare();renderTips();
  }

  function exportExcel(){
    var table=$('summaryTable');
    if(!table){renderAll();table=$('summaryTable')}
    if(!table)return;
    var rows=Array.prototype.map.call(table.rows,function(tr){
      return Array.prototype.map.call(tr.cells,function(td){return '"'+String(td.innerText||'').replace(/"/g,'""')+'"'}).join(',');
    });
    var blob=new Blob(['\ufeff'+rows.join('\n')],{type:'text/csv;charset=utf-8'});
    var a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download='รายงานสรุป-'+safe(function(){return MONTHS[cm()]+'-'+py()},'roster')+'.csv';
    document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},1000);
  }

  function showAllPeople(){
    renderAll();
    var source=$('summary');
    var modal=$('summaryModalV34'),body=$('summaryModalBodyV34');
    if(!modal||!body)return;
    body.innerHTML=source?source.innerHTML:'';
    modal.classList.add('show');modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    var modal=$('summaryModalV34');if(!modal)return;
    modal.classList.remove('show');modal.setAttribute('aria-hidden','true');
  }
  function focusSection(tab){
    var target=tab==='people'?$('summaryPeopleCardV34'):tab==='compare'?$('summaryCompareCardV34'):tab==='holiday'?$('summaryHolidayV24'):null;
    if(target&&target.scrollIntoView)target.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function wire(){
    renderAll();
    var chartMode=$('summaryChartModeV34');if(chartMode)chartMode.onchange=buildChart;
    var excel=$('summaryExcelBtnV34');if(excel)excel.onclick=exportExcel;
    var view=$('summaryViewBtnV34');if(view)view.onclick=function(){renderAll();focusSection('overview')};
    var all=$('summaryAllPeopleBtnV34');if(all)all.onclick=showAllPeople;
    document.querySelectorAll('#summaryModalV34 [data-summary-close]').forEach(function(x){x.onclick=closeModal});
    document.querySelectorAll('#summaryTabsV34 [data-summary-tab]').forEach(function(btn){
      btn.onclick=function(){
        document.querySelectorAll('#summaryTabsV34 [data-summary-tab]').forEach(function(b){b.classList.toggle('active',b===btn)});
        renderAll();focusSection(btn.dataset.summaryTab);
      };
    });
    ['summaryMonthProxyV24','summaryYearProxyV24'].forEach(function(id){
      var e=$(id);if(!e)return;
      e.addEventListener('change',function(){setTimeout(renderAll,60)});
    });
    window.addEventListener('pageshow',function(){setTimeout(renderAll,100)});
    document.addEventListener('click',function(e){
      var nav=e.target.closest&&e.target.closest('[data-page="summary"]');
      if(nav)setTimeout(renderAll,80);
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
  window.SummaryV34={render:renderAll};
})();
