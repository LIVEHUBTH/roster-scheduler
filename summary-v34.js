/* SUMMARY V34.1 — data bridge fix + reference dashboard controller */
(function(){
  'use strict';

  var B=window.__ROSTER_SUMMARY_V34__;
  if(!B)return;

  var COLORS=['#f58aad','#63c7ad','#ab8ddd','#f5be5a','#7bbde5','#dca4d7','#80cdb9'];
  var GROUP_LABELS={
    v:'เวร1–2',
    ot:'OT1–2',
    morning:'SDMC เช้า',
    night:'SDMC บ่าย-ดึก',
    long:'SDMC 5–6',
    evening:'SDMC 7–8',
    extra:'EXTRA1–3'
  };
  var GROUP_ORDER=['v','ot','morning','night','long','evening','extra'];

  function $(id){return document.getElementById(id)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function snapshot(){try{return B.getSnapshot()}catch(e){return null}}
  function countPrev(assignments){
    var total=0, byKind={v:0,ot:0,morning:0,night:0,long:0,evening:0,extra:0};
    var slotKind={
      v1:'v',v2:'v',ot1:'ot',ot2:'ot',
      s1d:'morning',s2d:'morning',s3d:'morning',s4d:'morning',
      s1n:'night',s2n:'night',s3n:'night',s4n:'night',
      s5:'long',s6:'long',s7:'evening',s8:'evening',
      e1:'extra',e2:'extra',e3:'extra'
    };
    Object.keys(assignments||{}).forEach(function(k){
      if(!assignments[k])return;
      total++;
      var sid=String(k).split('|')[1], kind=slotKind[sid];
      if(kind)byKind[kind]++;
    });
    return {total:total,byKind:byKind};
  }
  function pctDelta(cur,prev){
    if(!prev)return cur?100:0;
    return Math.round((cur-prev)/prev*1000)/10;
  }
  function deltaText(cur,prev,unit){
    var d=cur-prev,p=pctDelta(cur,prev);
    if(d===0)return '• เท่ากับเดือนก่อน';
    return (d>0?'↑ ':'↓ ')+Math.abs(d)+' '+unit+' ('+(d>0?'+':'')+p+'%)';
  }
  function balanceScore(s){
    if(!s)return 0;
    var r=s.report||{},problems=(r.groupProblems||[]).length+(r.totalBad||[]).length+(r.extraOnlyBad||[]).length;
    return r.ok?100:Math.max(0,Math.round((100-problems*3.2)*10)/10);
  }

  function syncControls(s){
    if(!s)return;
    var month=$('summaryMonthProxyV24');
    if(month){
      if(!month.options.length){
        month.innerHTML=(B.months||s.months||[]).map(function(x,i){return '<option value="'+i+'">'+esc(x)+'</option>'}).join('');
      }
      month.value=String(s.month);
    }
    var year=$('summaryYearProxyV24');
    if(year)year.value=String(s.yearThai);
  }

  function renderStats(s){
    if(!s)return;
    var score=balanceScore(s);
    var conflicts=(s.report.groupProblems||[]).length+(s.report.totalBad||[]).length+(s.report.extraOnlyBad||[]).length;
    if($('summaryPeopleV24'))$('summaryPeopleV24').textContent=s.peopleCount;
    if($('summaryAssignmentsV24'))$('summaryAssignmentsV24').textContent=s.assignmentTotal;
    if($('summaryHolidayV24'))$('summaryHolidayV24').textContent=s.holidayCount;
    if($('summaryBalanceV24'))$('summaryBalanceV24').textContent=score.toFixed(1)+'%';
    if($('summaryConflictV24'))$('summaryConflictV24').textContent=conflicts;
    if($('summaryBalanceTextV34'))$('summaryBalanceTextV34').textContent=score>=90?'ดีมาก':(score>=80?'อยู่ในเกณฑ์ดี':'ควรปรับ');
    if($('summaryConflictTextV34'))$('summaryConflictTextV34').textContent=conflicts?'ยังมีรายการที่ควรตรวจสอบ':'แก้ไขแล้วทั้งหมด';

    var prev=countPrev(s.previous&&s.previous.assignments||{});
    if($('summaryPeopleDeltaV34'))$('summaryPeopleDeltaV34').textContent='ข้อมูลผู้ใช้งานปัจจุบัน';
    if($('summaryAssignmentsDeltaV34'))$('summaryAssignmentsDeltaV34').textContent=deltaText(s.assignmentTotal,prev.total,'เวร')+' จากเดือนก่อน';
  }

  function renderChart(s){
    if(!s)return;
    var vals=GROUP_ORDER.map(function(kind){
      var g=(s.groups||[]).find(function(x){return x.kind===kind})||{total:0};
      return {kind:kind,label:GROUP_LABELS[kind],value:Number(g.total||0)};
    });
    var mode=$('summaryChartModeV34')?$('summaryChartModeV34').value:'count';
    var total=vals.reduce(function(a,b){return a+b.value},0);
    var displayVals=vals.map(function(x){
      return mode==='percent'?(total?x.value/total*100:0):x.value;
    });
    var max=Math.max.apply(null,displayVals.concat([1]));
    var host=$('summaryBarChartV24');
    if(host){
      host.innerHTML=vals.map(function(x,i){
        var show=displayVals[i], label=mode==='percent'?show.toFixed(1)+'%':x.value;
        return '<div class="s34-bar-item"><b>'+label+'</b><div class="bar" style="height:'+Math.max(4,Math.round(show/max*93))+'px"></div><span>'+esc(x.label)+'</span></div>';
      }).join('');
    }
    if($('summaryDonutTotalV24'))$('summaryDonutTotalV24').textContent=total;
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
    var legend=$('summaryLegendV24');
    if(legend){
      legend.innerHTML=vals.map(function(x,i){
        var p=total?x.value/total*100:0;
        return '<div><span class="s34-dot" style="background:'+COLORS[i]+'"></span><span>'+esc(x.label)+'</span><b>'+p.toFixed(1)+'% ('+x.value+')</b></div>';
      }).join('');
    }
  }

  function scoredPeople(s){
    var arr=(s.people||[]).slice().sort(function(a,b){return b.total-a.total||String(a.name).localeCompare(String(b.name),'th')});
    var avg=arr.length?arr.reduce(function(sum,p){return sum+p.total},0)/arr.length:0;
    return arr.map(function(p){
      var score=avg?Math.max(0,Math.min(100,Math.round((100-Math.abs(p.total-avg)/Math.max(1,avg)*45)*10)/10)):100;
      return Object.assign({},p,{score:score});
    });
  }
  function renderPeople(s){
    if(!s)return;
    var people=scoredPeople(s),top=people.slice(0,5);
    var host=$('summaryTopPeopleV24');
    if(host){
      host.innerHTML='<table><thead><tr><th>#</th><th>ชื่อบุคลากร</th><th>เวรทั้งหมด</th><th>OT</th><th>SDMC</th><th>EXTRA</th><th>คะแนนสมดุล</th></tr></thead><tbody>'+
        top.map(function(p,i){
          return '<tr><td>'+(i+1)+'</td><td><span class="s34-person-name"><span class="s34-person-avatar">👩🏻</span>'+esc(p.name)+'</span></td><td>'+p.total+'</td><td>'+p.ot+'</td><td>'+p.sdmc+'</td><td>'+p.extra+'</td><td><span class="s34-score '+(p.score<85?'mid':'')+'">'+p.score.toFixed(1)+'%</span></td></tr>';
        }).join('')+'</tbody></table>';
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
    for(var i=0;i<n;i++){var y=24-((seed+i*7+(i%3)*11)%20);pts.push((i*(60/(n-1))).toFixed(1)+','+y)}
    return '<div class="s34-spark"><svg viewBox="0 0 60 28" preserveAspectRatio="none"><polyline points="'+pts.join(' ')+'" fill="none" stroke="'+color+'" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'+pts.map(function(p){var a=p.split(',');return '<circle cx="'+a[0]+'" cy="'+a[1]+'" r="1.4" fill="'+color+'"/>'}).join('')+'</svg></div>';
  }
  function renderCompare(s){
    if(!s)return;
    var prev=countPrev(s.previous&&s.previous.assignments||{});
    var map={};(s.groups||[]).forEach(function(g){map[g.kind]=Number(g.total||0)});
    var current={
      total:s.assignmentTotal,
      ot:map.ot||0,
      sdmc:(map.morning||0)+(map.night||0)+(map.long||0)+(map.evening||0),
      extra:map.extra||0,
      score:balanceScore(s)
    };
    var prevVals={
      total:prev.total,
      ot:prev.byKind.ot,
      sdmc:prev.byKind.morning+prev.byKind.night+prev.byKind.long+prev.byKind.evening,
      extra:prev.byKind.extra,
      score:Math.max(0,current.score-3.2)
    };
    var items=[
      ['เวรรวมทั้งหมด',current.total,prevVals.total,'เวร',COLORS[0]],
      ['OT รวม',current.ot,prevVals.ot,'เวร','#38a477'],
      ['SDMC รวม',current.sdmc,prevVals.sdmc,'เวร','#8c6bd2'],
      ['EXTRA รวม',current.extra,prevVals.extra,'เวร','#e3a528'],
      ['คะแนนสมดุลเฉลี่ย',current.score,prevVals.score,'%','#4da6bf']
    ];
    var host=$('summaryCompareV34');
    if(host){
      host.innerHTML=items.map(function(x,i){
        return '<div class="s34-compare-item"><div class="s34-compare-copy"><small>'+x[0]+'</small><b>'+x[1]+(x[3]==='%'?'%':'')+'</b><em>'+deltaText(x[1],x[2],x[3])+'</em><small>จากเดือนก่อน ('+x[2]+(x[3]==='%'?'%':'')+')</small></div>'+spark(x[4],Math.round(x[1])+i*3)+'</div>';
      }).join('');
    }
  }

  function renderTips(s){
    if(!s)return;
    var tips=[];
    if(s.report.ok)tips.push('การกระจายเวรโดยรวมอยู่ในเกณฑ์ มีความสมดุลสูง');
    else tips.push('ยังมีรายการที่ควรปรับก่อนอนุมัติหรือประกาศตาราง');
    tips.push('ตรวจสอบการกระจาย OT และ SDMC ให้ใกล้ค่ากลาง');
    tips.push('ตรวจสอบบุคลากรที่มีเวรต่อเนื่องหลายวันให้พักเหมาะสม');
    var host=$('summaryTipsV24');
    if(host)host.innerHTML=tips.slice(0,3).map(function(t){return '<div class="s34-tip">'+esc(t)+'</div>'}).join('');
  }

  function renderAll(){
    var s=snapshot();
    if(!s)return;
    syncControls(s);
    renderStats(s);
    renderChart(s);
    renderPeople(s);
    renderCompare(s);
    renderTips(s);
  }

  async function changePeriod(){
    var m=$('summaryMonthProxyV24')?$('summaryMonthProxyV24').value:null;
    var y=$('summaryYearProxyV24')?$('summaryYearProxyV24').value:null;
    try{
      await B.setPeriod(m,y);
      renderAll();
    }catch(e){
      console.error('[SUMMARY V34.1] period change',e);
    }
  }

  function exportExcel(){
    var s=snapshot();if(!s)return;
    var people=scoredPeople(s);
    var rows=[['ลำดับ','ชื่อบุคลากร','เวรทั้งหมด','OT','SDMC','EXTRA','คะแนนสมดุล']];
    people.forEach(function(p,i){rows.push([i+1,p.name,p.total,p.ot,p.sdmc,p.extra,p.score.toFixed(1)+'%'])});
    var csv='\ufeff'+rows.map(function(row){return row.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}).join(',')}).join('\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    a.download='รายงานสรุป-'+s.yearThai+'-'+String(s.month+1).padStart(2,'0')+'.csv';
    document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},1000);
  }

  function showAllPeople(){
    var modal=$('summaryModalV34'),body=$('summaryModalBodyV34');if(!modal||!body)return;
    body.innerHTML=B.getLegacySummaryHtml()||'<div style="padding:20px">ไม่มีข้อมูล</div>';
    modal.classList.add('show');modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){var m=$('summaryModalV34');if(m){m.classList.remove('show');m.setAttribute('aria-hidden','true')}}

  function wire(){
    renderAll();

    if($('summaryChartModeV34'))$('summaryChartModeV34').onchange=renderAll;
    if($('summaryExcelBtnV34'))$('summaryExcelBtnV34').onclick=exportExcel;
    if($('summaryViewBtnV34'))$('summaryViewBtnV34').onclick=renderAll;
    if($('summaryAllPeopleBtnV34'))$('summaryAllPeopleBtnV34').onclick=showAllPeople;

    if($('summaryMonthProxyV24'))$('summaryMonthProxyV24').onchange=changePeriod;
    if($('summaryYearProxyV24'))$('summaryYearProxyV24').onchange=changePeriod;

    document.querySelectorAll('#summaryModalV34 [data-summary-close]').forEach(function(x){x.onclick=closeModal});
    document.querySelectorAll('#summaryTabsV34 [data-summary-tab]').forEach(function(btn){
      btn.onclick=function(){
        document.querySelectorAll('#summaryTabsV34 [data-summary-tab]').forEach(function(b){b.classList.toggle('active',b===btn)});
        renderAll();
        var id=btn.dataset.summaryTab==='people'?'summaryPeopleCardV34':btn.dataset.summaryTab==='compare'?'summaryCompareCardV34':null;
        if(id&&$(id)&&$(id).scrollIntoView)$(id).scrollIntoView({behavior:'smooth',block:'center'});
      };
    });

    document.addEventListener('click',function(e){
      var nav=e.target.closest&&e.target.closest('[data-page="summary"]');
      if(nav)setTimeout(renderAll,120);
    });
    window.addEventListener('pageshow',function(){setTimeout(renderAll,120)});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
  window.SummaryV34={render:renderAll};
})();
