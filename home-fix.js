/* ROSTER SCHEDULER — HOME FIX V25 */
(function(){
  "use strict";

  function $(id){ return document.getElementById(id); }

  function go(page){
    if(typeof window.showPage === "function"){
      window.showPage(page, true);
      return;
    }
    var el = document.getElementById("page-" + page);
    if(!el) return;
    document.querySelectorAll(".page-view").forEach(function(p){
      p.classList.toggle("active", p === el);
    });
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function thaiMonth(m){
    return ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
            "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"][m];
  }

  function dateKey(y,m,d){
    return y + "-" + String(m+1).padStart(2,"0") + "-" + String(d).padStart(2,"0");
  }

  function getHolidays(){
    try{
      if(window.state && window.state.holidays) return window.state.holidays;
    }catch(e){}
    return {};
  }

  var viewDate = new Date();

  function renderCalendar(){
    var host = $("homeMiniCalendar");
    var label = $("homeCalendarMonth");
    if(!host) return;

    var y = viewDate.getFullYear();
    var m = viewDate.getMonth();
    var today = new Date();
    var holidays = getHolidays();
    var labels = ["อา","จ","อ","พ","พฤ","ศ","ส"];
    var html = "";

    labels.forEach(function(x){
      html += '<div class="head">' + x + "</div>";
    });

    var firstDay = new Date(y,m,1).getDay();
    var totalDays = new Date(y,m+1,0).getDate();

    for(var i=0;i<firstDay;i++) html += '<div class="blank"></div>';

    for(var d=1; d<=totalDays; d++){
      var dt = new Date(y,m,d);
      var key = dateKey(y,m,d);
      var cls = [];
      if(dt.getDay() === 0 || dt.getDay() === 6) cls.push("weekend");
      if(holidays[key]) cls.push("holiday");
      if(today.getFullYear()===y && today.getMonth()===m && today.getDate()===d) cls.push("today");

      var title = "";
      if(holidays[key] && typeof holidays[key] === "object" && holidays[key].name){
        title = String(holidays[key].name);
      }

      html += '<div class="' + cls.join(" ") + '" title="' +
              title.replace(/"/g,"&quot;") + '">' + d + "</div>";
    }

    host.innerHTML = html;
    if(label) label.textContent = thaiMonth(m) + " " + (y + 543);
  }

  function bind(id, fn){
    var el = $(id);
    if(!el) return;
    el.onclick = function(e){
      e.preventDefault();
      e.stopPropagation();
      fn();
    };
  }

  function bindStats(){
    var cards = document.querySelectorAll("#page-home .v244-stat");
    var targets = ["people","summary","holidays","rules"];
    cards.forEach(function(card, i){
      if(!targets[i]) return;
      card.setAttribute("role","button");
      card.setAttribute("tabindex","0");
      card.onclick = function(){ go(targets[i]); };
      card.onkeydown = function(e){
        if(e.key === "Enter" || e.key === " "){
          e.preventDefault();
          go(targets[i]);
        }
      };
    });
  }

  function bindKnownHomeButtons(){
    bind("homeStartRosterBtn", function(){ go("roster"); });

    bind("homeQuickRun", function(){ go("roster"); });
    bind("homeQuickOpen", function(){ go("history"); });
    bind("homeQuickCheck", function(){ go("rules"); });
    bind("homeQuickReport", function(){ go("summary"); });

    bind("homeCalPrev", function(){
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1);
      renderCalendar();
    });

    bind("homeCalNext", function(){
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1);
      renderCalendar();
    });

    bind("homeViewAlertsBtn", function(){ go("history"); });
  }

  function bindByText(){
    document.querySelectorAll("#page-home button, #page-home [role=button]").forEach(function(el){
      var t = (el.textContent || "").replace(/\s+/g," ").trim();

      if(t.includes("เริ่มจัดตาราง")){
        el.onclick = function(e){ e.preventDefault(); go("roster"); };
      }else if(t.includes("เปิดตารางเดิม")){
        el.onclick = function(e){ e.preventDefault(); go("history"); };
      }else if(t.includes("ตรวจสอบกฎ")){
        el.onclick = function(e){ e.preventDefault(); go("rules"); };
      }else if(t.includes("ดูรายงาน")){
        el.onclick = function(e){ e.preventDefault(); go("summary"); };
      }else if(t.includes("บุคลากรทั้งหมด")){
        el.onclick = function(e){ e.preventDefault(); go("people"); };
      }else if(t.includes("เวรเดือนนี้")){
        el.onclick = function(e){ e.preventDefault(); go("summary"); };
      }else if(t.includes("วันหยุดเดือนนี้")){
        el.onclick = function(e){ e.preventDefault(); go("holidays"); };
      }else if(t.includes("กฎสำคัญ") || t.includes("กฏสำคัญ")){
        el.onclick = function(e){ e.preventDefault(); go("rules"); };
      }
    });
  }

  function init(){
    renderCalendar();
    bindKnownHomeButtons();
    bindStats();
    bindByText();

    setTimeout(renderCalendar, 300);
    setTimeout(renderCalendar, 1000);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  }else{
    init();
  }
})();