/* UNIT V36.0 — isolated redesign for #page-internal only */
(function(){'use strict';
  var STORAGE='roster_unit_directory_v1', MAPKEY='roster_unit_user_map_v1', selected='pacu-sk', users=[];
  var defaults=[
    {id:'cvt',name:'CVT',group:'งานการพยาบาล'},{id:'sdmc',name:'SDMC',group:'งานการพยาบาล'},{id:'pacu-sk',name:'PACU SK',group:'งานการพยาบาล'},
    {id:'pacu-sx',name:'PACU SX',group:'งานการพยาบาล'},{id:'pacu-ob',name:'PACU OB',group:'งานการพยาบาล'},{id:'pacu-ent',name:'PACU ENT',group:'งานการพยาบาล'},{id:'pacu-ortho',name:'PACU ORTHO',group:'งานการพยาบาล'}
  ];
  function q(s,r){return (r||document).querySelector(s)} function qa(s,r){return Array.from((r||document).querySelectorAll(s))}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function apiBase(){return String(localStorage.getItem('roster_cloud_api')||'https://roster-scheduler-api.supaporn-gf.workers.dev').replace(/\/+$/,'')}
  function token(){return localStorage.getItem('roster_auth_token')||''}
  async function api(path,opt){opt=opt||{};var h=Object.assign({'Content-Type':'application/json'},opt.headers||{});if(token())h.Authorization='Bearer '+token();var r=await fetch(apiBase()+path,Object.assign({},opt,{headers:h}));var d={};try{d=await r.json()}catch(e){}if(!r.ok)throw new Error(d.error||d.message||('HTTP '+r.status));return d}
  function loadUnits(){try{var x=JSON.parse(localStorage.getItem(STORAGE)||'null');if(Array.isArray(x)&&x.length)return x}catch(e){} localStorage.setItem(STORAGE,JSON.stringify(defaults));return defaults.slice()}
  function saveUnits(a){localStorage.setItem(STORAGE,JSON.stringify(a))}
  function current(){var a=loadUnits();return a.find(function(x){return x.id===selected})||a[0]}
  function saveCurrent(obj){var a=loadUnits(),i=a.findIndex(function(x){return x.id===selected});if(i<0)return;a[i]=Object.assign({},a[i],obj);saveUnits(a)}
  function toast(msg){var t=q('#u36Toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(t._tm);t._tm=setTimeout(function(){t.classList.remove('show')},2600)}
  function icon(type){var m={building:'<svg viewBox="0 0 24 24"><path d="M5 21V7l7-3 7 3v14M8 10h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2M3 21h18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',users:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" fill="currentColor"/><circle cx="17" cy="9" r="2.5" fill="currentColor" opacity=".65"/><path d="M3 20c.5-4.8 2.6-7 6-7s5.5 2.2 6 7H3Z" fill="currentColor"/><path d="M14 19c.4-3 1.8-4.7 4-4.7 2.1 0 3.4 1.5 3.8 4.7H14Z" fill="currentColor" opacity=".65"/></svg>',clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',bed:'<svg viewBox="0 0 24 24"><path d="M4 18v-7m16 7v-5H8a4 4 0 0 0-4 4v1h16ZM7 11V8h4a3 3 0 0 1 3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',search:'<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15 15 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'};return m[type]||m.building}
  function legacy(){return q('#u36Legacy')}
  function proxyValue(id,val){var n=q('#'+id,legacy());if(n){n.value=val==null?'':val;try{n.dispatchEvent(new Event('change',{bubbles:true}))}catch(e){}}}
  function proxyClick(id){var n=q('#'+id,legacy());if(n){n.click();return true}return false}
  function renderUnits(){
    var a=loadUnits(),sel=q('#u36UnitSelect');
    if(sel){
      sel.innerHTML=a.map(function(x){return '<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>'}).join('');
      sel.value=selected;
    }
    var stat=q('#u36StatUnits');if(stat)stat.textContent=a.length;
  }
  function renderInfo(){var u=current();if(!u)return;q('#u36SelectedName').textContent=u.name;q('#u36SelectedMeta').textContent=(u.group||'งานการพยาบาล')+'  •  ผู้ใช้งาน '+unitUserCount(u.id)+' คน';['name','organization','head','scheduler','phone','contact'].forEach(function(k){var n=q('#u36_'+k);if(n)n.value=u[k]||''});var img=q('#u36LogoImg'),ph=q('#u36LogoPh');if(u.logo){img.src=u.logo;img.style.display='block';ph.style.display='none'}else{img.removeAttribute('src');img.style.display='none';ph.style.display='grid'}}
  function userMap(){try{return JSON.parse(localStorage.getItem(MAPKEY)||'{}')||{}}catch(e){return {}}} function saveMap(m){localStorage.setItem(MAPKEY,JSON.stringify(m))}
  function unitUserCount(id){var m=userMap(),c=0;users.forEach(function(u){if((m[u.id]||m[u.username]||'pacu-sk')===id)c++});return c}
  function roleLabel(r){return {admin:'ผู้ดูแลระบบ',approver:'หัวหน้าหน่วยงาน',scheduler:'ผู้จัดตาราง',viewer:'ผู้ดูตาราง'}[r]||r}
  function userRef(u){return String((u&&(u.id||u.userId||u._id||u.username))||'')}
  function actionIcon(type){
    var m={
      edit:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18.5l3.6-.8 8.5-8.5-2.8-2.8-8.5 8.5-.8 3.6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="m12.9 6.4 2.8 2.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      view:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m15 15 4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      on:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 8.6a6.5 6.5 0 1 0 9.6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 4.5v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      off:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 8.6a6.5 6.5 0 1 0 9.6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 4.5v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      image:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="10" r="1.6" fill="currentColor"/><path d="m6.5 17 4.1-4.2 2.7 2.5 2.3-2.2 2.4 3.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      save:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h11.5L19.5 7v12.5H5V4.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 4.5v5h7v-5M8 19v-6h8v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
      delete:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4.8h6V7M8 10v7M12 10v7M16 10v7M7 7l.7 13h8.6L17 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    return m[type]||m.view;
  }
  function fmt(v){if(!v)return'-';try{return new Date(v).toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'})}catch(e){return v}}
  async function loadUsers(){try{var d=await api('/api/admin/users',{method:'GET'});users=d.users||[];renderStats();renderUsers();renderInfo()}catch(e){users=[];renderStats();renderUsers();toast('โหลดบัญชีผู้ใช้ไม่ได้: '+e.message)}}
  function renderStats(){q('#u36StatUsers').textContent=users.length;q('#u36StatActive').textContent=users.filter(function(x){return x.isActive}).length;q('#u36StatPending').textContent=users.filter(function(x){return !x.isActive}).length}
  function renderUsers(){
    var host=q('#u36UsersBody');if(!host)return;
    var m=userMap(),u=current();
    var rows=users.filter(function(x){return (m[x.id]||m[x.userId]||m[x._id]||m[x.username]||'pacu-sk')===u.id});
    host.innerHTML=rows.length?rows.map(function(x,i){
      var ref=userRef(x),gi=users.indexOf(x);
      return '<tr>'+
        '<td><div class="u36-person"><span class="u36-avatar">'+(['👩🏻','👩🏻‍⚕️','👨🏻','👩🏼'][i%4])+'</span><span><b>'+esc(x.displayName||x.username)+'</b><small>@'+esc(x.username||'')+'</small></span></div></td>'+
        '<td>'+esc(u.group||'งานการพยาบาล')+'</td>'+
        '<td><span class="u36-role '+esc(x.role)+'">'+esc(roleLabel(x.role))+'</span></td>'+
        '<td><span class="u36-status '+(x.isActive?'on':'off')+'"><i></i>'+(x.isActive?'ใช้งาน':'ปิดใช้งาน')+'</span></td>'+
        '<td>'+esc(fmt(x.lastLoginAt||x.updatedAt))+'</td>'+
        '<td><div class="u36-manage">'+
          '<button type="button" class="u36-icon-btn edit" data-edit-user="'+esc(ref)+'" data-user-index="'+gi+'" title="แก้ไขบัญชี" aria-label="แก้ไขบัญชี">'+actionIcon('edit')+'</button>'+
          '<button type="button" class="u36-icon-btn view" data-view-user="'+esc(ref)+'" data-user-index="'+gi+'" title="ดูข้อมูลบัญชี" aria-label="ดูข้อมูลบัญชี">'+actionIcon('view')+'</button>'+
          '<button type="button" class="u36-icon-btn delete" data-delete-user="'+esc(ref)+'" data-user-index="'+gi+'" title="ลบบัญชีผู้ใช้" aria-label="ลบบัญชีผู้ใช้">'+actionIcon('delete')+'</button>'+
          '<button type="button" class="u36-toggle-btn '+(x.isActive?'close':'open')+'" data-toggle-user="'+esc(ref)+'" data-active="'+(x.isActive?'1':'0')+'" title="'+(x.isActive?'ปิดบัญชี':'เปิดบัญชี')+'">'+actionIcon(x.isActive?'off':'on')+'<span>'+(x.isActive?'ปิด':'เปิด')+'</span></button>'+
        '</div></td></tr>'
    }).join(''):'<tr><td colspan="6" class="u36-empty">ยังไม่มีบัญชีผู้ใช้ในหน่วยงานนี้</td></tr>';
    qa('[data-toggle-user]',host).forEach(function(b){b.onclick=toggleUser});
    qa('[data-edit-user]',host).forEach(function(b){b.onclick=function(ev){if(ev){ev.preventDefault();ev.stopPropagation()}openEditFromButton(this)}});
    qa('[data-view-user]',host).forEach(function(b){b.onclick=function(ev){if(ev){ev.preventDefault();ev.stopPropagation()}openViewFromButton(this)}});
    qa('[data-delete-user]',host).forEach(function(b){b.onclick=function(ev){if(ev){ev.preventDefault();ev.stopPropagation()}deleteUserFromButton(this)}});
  }
  function userByIndex(v){
    var i=parseInt(v,10);
    return Number.isFinite(i)&&i>=0&&i<users.length?users[i]:null;
  }
  function openEditFromButton(btn){
    var u=userByIndex(btn&&btn.dataset.userIndex);
    if(!u){openEditUser(btn&&btn.dataset.editUser);return}
    populateUnitSelects();
    q('#u36EditUserId').value=userRef(u);
    q('#u36EditDisplay').value=u.displayName||'';
    q('#u36EditRole').value=u.role||'viewer';
    var m=userMap();
    q('#u36EditUnit').value=m[u.id]||m[u.userId]||m[u._id]||m[u.username]||selected;
    q('#u36EditUserModal').classList.add('show');
  }
  function openViewFromButton(btn){
    var u=userByIndex(btn&&btn.dataset.userIndex);
    if(!u){openViewUser(btn&&btn.dataset.viewUser);return}
    var m=userMap(),unitId=m[u.id]||m[u.userId]||m[u._id]||m[u.username]||selected;
    var unit=loadUnits().find(function(x){return x.id===unitId})||current();
    q('#u36ViewName').textContent=u.displayName||u.username||'-';
    q('#u36ViewUsername').textContent='@'+(u.username||'-');
    q('#u36ViewUnit').textContent=(unit&&unit.name)||'-';
    q('#u36ViewRole').textContent=roleLabel(u.role);
    q('#u36ViewStatus').textContent=u.isActive?'ใช้งาน':'ปิดใช้งาน';
    q('#u36ViewLast').textContent=fmt(u.lastLoginAt||u.updatedAt);
    q('#u36ViewEditBtn').dataset.userId=userRef(u);
    q('#u36ViewEditBtn').dataset.userIndex=btn.dataset.userIndex;
    q('#u36ViewUserModal').classList.add('show');
  }
  async function deleteUserFromButton(btn){
    var u=userByIndex(btn&&btn.dataset.userIndex);
    if(!u){
      var ref=btn&&btn.dataset.deleteUser;
      u=users.find(function(x){return userRef(x)===String(ref)});
    }
    if(!u){toast('ไม่พบข้อมูลบัญชีผู้ใช้');return}
    var id=userRef(u),label=u.displayName||u.username||'บัญชีนี้';
    if(!id){toast('บัญชีนี้ไม่มีรหัสผู้ใช้สำหรับลบ');return}
    if(!window.confirm('ลบบัญชี '+label+' ใช่หรือไม่?\nการลบไม่สามารถย้อนกลับได้'))return;
    try{
      await api('/api/admin/users/'+encodeURIComponent(id),{method:'DELETE'});
      var m=userMap();
      [u.id,u.userId,u._id,u.username,id].forEach(function(k){if(k!=null)delete m[k]});
      saveMap(m);
      toast('ลบบัญชีผู้ใช้แล้ว');
      await loadUsers();
    }catch(e){
      toast('ลบบัญชีไม่ได้: '+e.message);
    }
  }
  async function toggleUser(){var id=this.dataset.toggleUser,on=this.dataset.active==='1';try{await api('/api/admin/users/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify({isActive:!on})});toast((on?'ปิด':'เปิด')+'บัญชีแล้ว');await loadUsers()}catch(e){toast('จัดการบัญชีไม่ได้: '+e.message)}}
  function openEditUser(id){var u=users.find(function(x){return userRef(x)===String(id)});if(!u){toast('ไม่พบข้อมูลบัญชีผู้ใช้');return}q('#u36EditUserId').value=userRef(u);q('#u36EditDisplay').value=u.displayName||'';q('#u36EditRole').value=u.role||'viewer';var mm=userMap();q('#u36EditUnit').value=mm[u.id]||mm[u.userId]||mm[u._id]||mm[u.username]||selected;q('#u36EditUserModal').classList.add('show')}
  function openViewUser(id){
    var u=users.find(function(x){return userRef(x)===String(id)});
    if(!u){toast('ไม่พบข้อมูลบัญชีผู้ใช้');return}
    var m=userMap(),unitId=m[u.id]||m[u.userId]||m[u._id]||m[u.username]||selected;
    var unit=loadUnits().find(function(x){return x.id===unitId})||current();
    q('#u36ViewName').textContent=u.displayName||u.username||'-';
    q('#u36ViewUsername').textContent='@'+(u.username||'-');
    q('#u36ViewUnit').textContent=(unit&&unit.name)||'-';
    q('#u36ViewRole').textContent=roleLabel(u.role);
    q('#u36ViewStatus').textContent=u.isActive?'ใช้งาน':'ปิดใช้งาน';
    q('#u36ViewLast').textContent=fmt(u.lastLoginAt||u.updatedAt);
    q('#u36ViewEditBtn').dataset.userId=userRef(u);
    q('#u36ViewUserModal').classList.add('show');
  }
  function openPassword(id){q('#u36PassUserId').value=id;q('#u36NewPass').value='';q('#u36PasswordModal').classList.add('show')}
  async function saveEditUser(){var id=q('#u36EditUserId').value,payload={displayName:q('#u36EditDisplay').value.trim(),role:q('#u36EditRole').value};try{await api('/api/admin/users/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify(payload)});var m=userMap();m[id]=q('#u36EditUnit').value;saveMap(m);q('#u36EditUserModal').classList.remove('show');toast('บันทึกบัญชีแล้ว');await loadUsers()}catch(e){toast('แก้ไขบัญชีไม่ได้: '+e.message)}}
  async function savePassword(){var id=q('#u36PassUserId').value,p=q('#u36NewPass').value;if(p.length<8){toast('รหัสผ่านต้องมีอย่างน้อย 8 ตัว');return}try{await api('/api/admin/users/'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify({password:p})});q('#u36PasswordModal').classList.remove('show');toast('เปลี่ยนรหัสผ่านแล้ว')}catch(e){toast('เปลี่ยนรหัสผ่านไม่ได้: '+e.message)}}
  async function createUser(){var p={username:q('#u36NewUsername').value.trim(),displayName:q('#u36NewDisplay').value.trim(),password:q('#u36NewPassword').value,role:q('#u36NewRole').value};if(!p.username||!p.displayName||p.password.length<8){toast('กรอกข้อมูลให้ครบ และรหัสผ่านอย่างน้อย 8 ตัว');return}try{var d=await api('/api/admin/users',{method:'POST',body:JSON.stringify(p)});var m=userMap(),id=(d.user&&d.user.id)||p.username;m[id]=selected;saveMap(m);q('#u36NewUserModal').classList.remove('show');toast('สร้างบัญชีเรียบร้อย');await loadUsers()}catch(e){toast('สร้างบัญชีไม่ได้: '+e.message)}}
  function saveInfo(){var obj={name:q('#u36_name').value.trim()||current().name,organization:q('#u36_organization').value.trim(),head:q('#u36_head').value.trim(),scheduler:q('#u36_scheduler').value.trim(),phone:q('#u36_phone').value.trim(),contact:q('#u36_contact').value.trim()};saveCurrent(obj);proxyValue('unitInfoName',obj.name);proxyValue('unitInfoOrganization',obj.organization);proxyValue('unitInfoHead',obj.head);proxyValue('unitInfoScheduler',obj.scheduler);proxyValue('unitInfoPhone',obj.phone);proxyValue('unitInfoContact',obj.contact);proxyClick('saveUnitInfoBtn');renderUnits();renderInfo();toast('บันทึกข้อมูลหน่วยงานแล้ว')}
  function chooseLogo(){q('#u36LogoFile').click()} function handleLogo(f){if(!f)return;var r=new FileReader();r.onload=function(){saveCurrent({logo:String(r.result||'')});renderInfo();toast('บันทึกโลโก้หน่วยงานแล้ว')};r.readAsDataURL(f)}
  function addUnit(){q('#u36AddUnitName').value='';q('#u36AddUnitModal').classList.add('show')} function saveNewUnit(){var name=q('#u36AddUnitName').value.trim();if(!name){toast('กรุณากรอกชื่อหน่วยงาน');return}var a=loadUnits(),id=name.toLowerCase().replace(/[^a-z0-9ก-๙]+/g,'-')+'-'+Date.now().toString().slice(-4);a.push({id:id,name:name,group:'งานการพยาบาล'});saveUnits(a);selected=id;q('#u36AddUnitModal').classList.remove('show');renderUnits();renderInfo();renderUsers();toast('เพิ่มหน่วยงานแล้ว')}
  function deleteUnit(){
    var a=loadUnits(),u=current();
    if(!u)return;
    if(a.length<=1){toast('ต้องมีอย่างน้อย 1 หน่วยงาน');return}
    if(!window.confirm('ลบหน่วยงาน “'+u.name+'” ใช่หรือไม่?'))return;
    var remain=a.filter(function(x){return x.id!==u.id});
    var fallback=remain[0].id,m=userMap();
    Object.keys(m).forEach(function(k){if(m[k]===u.id)m[k]=fallback});
    saveMap(m);saveUnits(remain);selected=fallback;
    renderUnits();renderInfo();renderUsers();toast('ลบหน่วยงานแล้ว');
  }
  function populateUnitSelects(){var html=loadUnits().map(function(u){return '<option value="'+esc(u.id)+'">'+esc(u.name)+'</option>'}).join('');['#u36EditUnit','#u36NewUnit'].forEach(function(s){var n=q(s);if(n)n.innerHTML=html})}
  function mount(){var page=q('#page-internal');if(!page||page.dataset.u36==='1')return;page.dataset.u36='1';var old=document.createElement('div');old.id='u36Legacy';old.className='u36-legacy';while(page.firstChild)old.appendChild(page.firstChild);page.appendChild(old);var app=document.createElement('div');app.className='u36-app';app.innerHTML=markup();page.insertBefore(app,old);wire();populateUnitSelects();renderUnits();renderInfo();loadUsers()}
  function markup(){return '<div class="u36-head"><span class="u36-main-icon">'+icon('building')+'</span><div><h2>ระบบหน่วยงานและจัดการบัญชีผู้ใช้งาน</h2><p>จัดการหน่วยงาน โครงสร้าง และบัญชีผู้ใช้งานในระบบ</p></div></div>'+
    '<div class="u36-stats"><div class="u36-stat purple"><span class="u36-stat-ico">'+icon('building')+'</span><div><small>หน่วยงานทั้งหมด</small><b id="u36StatUnits">7</b></div></div><div class="u36-stat pink"><span class="u36-stat-ico">'+icon('users')+'</span><div><small>ผู้ใช้งานทั้งหมด</small><b id="u36StatUsers">0</b></div></div><div class="u36-stat mint"><span class="u36-stat-ico">'+icon('users')+'</span><div><small>กำลังใช้งาน</small><b id="u36StatActive">0</b></div></div><div class="u36-stat orange"><span class="u36-stat-ico">'+icon('clock')+'</span><div><small>รอเปิดใช้งาน</small><b id="u36StatPending">0</b></div></div></div>'+
    '<section class="u36-card u36-info-card"><div class="u36-content-head"><div class="u36-title-row"><span class="u36-unit-badge">'+icon('bed')+'</span><div><h3 id="u36SelectedName">PACU SK</h3><p id="u36SelectedMeta">งานการพยาบาล • ผู้ใช้งาน 0 คน</p></div></div><div class="u36-head-actions"><select id="u36UnitSelect" class="u36-unit-select" aria-label="เลือกหน่วยงาน"></select><button class="u36-add-unit-inline" id="u36AddUnitBtn">＋ เพิ่มหน่วยงาน</button><button class="u36-edit-btn" id="u36EditInfoBtn">✎ แก้ไขข้อมูล</button><button class="u36-delete-unit-btn" id="u36DeleteUnitBtn">⌫ ลบหน่วยงาน</button></div></div>'+
    '<div class="u36-section-title"><b>ข้อมูลหน่วยงาน</b></div>'+
    '<div class="u36-form"><div class="u36-grid"><label class="u36-field">ชื่อหน่วยงาน / กลุ่มงาน<input id="u36_name" placeholder="เช่น กลุ่มงานวิสัญญีวิทยา"></label><label class="u36-field">โรงพยาบาล / องค์กร<input id="u36_organization" placeholder="ชื่อโรงพยาบาลหรือองค์กร"></label><label class="u36-field">หัวหน้าหน่วยงาน<input id="u36_head" placeholder="ชื่อหัวหน้าหน่วยงาน"></label><label class="u36-field">ผู้รับผิดชอบจัดตารางเวร<input id="u36_scheduler" placeholder="ชื่อผู้จัดตารางเวร"></label><label class="u36-field">โทรศัพท์ / เบอร์ติดต่อ<input id="u36_phone" placeholder="ไม่บังคับ"></label><label class="u36-field">อีเมล / ช่องทางติดต่อ<input id="u36_contact" placeholder="ไม่บังคับ"></label></div><div class="u36-logo-row"><div class="u36-logo-preview"><span id="u36LogoPh">🏥</span><img id="u36LogoImg" style="display:none"></div><div class="u36-logo-copy"><b>โลโก้หน่วยงาน</b><small>รองรับรูปภาพจาก Photos/Files</small><button class="u36-btn pink u36-logo-pick-btn" id="u36ChooseLogoBtn">'+actionIcon('image')+'<span>เลือกรูปโลโก้</span></button><input id="u36LogoFile" type="file" accept="image/*" hidden></div></div><div class="u36-actions"><button class="u36-btn" id="u36CancelInfo">ยกเลิก</button><button class="u36-btn mint u36-save-info-btn" id="u36SaveInfo">'+actionIcon('save')+'<span>บันทึกข้อมูลหน่วยงาน</span></button></div></div></section>'+
    '<section class="u36-card u36-accounts-card"><div class="u36-account-head"><div><h3>จัดการบัญชีผู้ใช้งาน</h3><p>บัญชีผู้ใช้งานของหน่วยงานที่เลือก</p></div><button id="u36AddUserBtn">＋ เพิ่มบัญชีผู้ใช้</button></div><div class="u36-table-wrap"><table class="u36-table"><thead><tr><th>ผู้ใช้งาน</th><th>หน่วยงาน</th><th>บทบาท</th><th>สถานะ</th><th>เข้าใช้ล่าสุด</th><th>จัดการ</th></tr></thead><tbody id="u36UsersBody"></tbody></table></div></section>'+
    modals()+'<div class="u36-toast" id="u36Toast"></div>'}
  function modals(){return '<div class="u36-modal" id="u36AddUnitModal"><div class="u36-modal-card"><div class="u36-modal-head"><b>เพิ่มหน่วยงาน</b><button data-close-modal>×</button></div><label class="u36-field">ชื่อหน่วยงาน<input id="u36AddUnitName" placeholder="ชื่อหน่วยงาน"></label><div class="u36-actions"><button class="u36-btn" data-close-modal>ยกเลิก</button><button class="u36-btn mint" id="u36SaveNewUnit">เพิ่มหน่วยงาน</button></div></div></div>'+ 
    '<div class="u36-modal" id="u36NewUserModal"><div class="u36-modal-card"><div class="u36-modal-head"><b>เพิ่มบัญชีผู้ใช้</b><button data-close-modal>×</button></div><div class="u36-grid"><label class="u36-field">Username<input id="u36NewUsername"></label><label class="u36-field">ชื่อที่แสดง<input id="u36NewDisplay"></label><label class="u36-field">รหัสผ่าน<input id="u36NewPassword" type="password" placeholder="อย่างน้อย 8 ตัว"></label><label class="u36-field">บทบาท<select id="u36NewRole"><option value="scheduler">ผู้จัดตาราง</option><option value="approver">หัวหน้าหน่วยงาน</option><option value="viewer">ผู้ดูตาราง</option><option value="admin">ผู้ดูแลระบบ</option></select></label><label class="u36-field">หน่วยงาน<select id="u36NewUnit"></select></label></div><div class="u36-actions"><button class="u36-btn" data-close-modal>ยกเลิก</button><button class="u36-btn mint" id="u36CreateUser">สร้างบัญชี</button></div></div></div>'+ 
    '<div class="u36-modal" id="u36EditUserModal"><div class="u36-modal-card"><div class="u36-modal-head"><b>แก้ไขบัญชีผู้ใช้</b><button data-close-modal>×</button></div><input id="u36EditUserId" type="hidden"><div class="u36-grid"><label class="u36-field">ชื่อที่แสดง<input id="u36EditDisplay"></label><label class="u36-field">บทบาท<select id="u36EditRole"><option value="scheduler">ผู้จัดตาราง</option><option value="approver">หัวหน้าหน่วยงาน</option><option value="viewer">ผู้ดูตาราง</option><option value="admin">ผู้ดูแลระบบ</option></select></label><label class="u36-field">หน่วยงาน<select id="u36EditUnit"></select></label></div><div class="u36-actions"><button class="u36-btn" data-close-modal>ยกเลิก</button><button class="u36-btn mint" id="u36SaveEditUser">บันทึก</button></div></div></div>'+ 
    '<div class="u36-modal" id="u36PasswordModal"><div class="u36-modal-card"><div class="u36-modal-head"><b>ตั้งรหัสผ่านใหม่</b><button data-close-modal>×</button></div><input id="u36PassUserId" type="hidden"><label class="u36-field">รหัสผ่านใหม่<input id="u36NewPass" type="password" placeholder="อย่างน้อย 8 ตัว"></label><div class="u36-actions"><button class="u36-btn" data-close-modal>ยกเลิก</button><button class="u36-btn mint" id="u36SavePass">บันทึกรหัสผ่าน</button></div></div></div>'+
    '<div class="u36-modal" id="u36ViewUserModal"><div class="u36-modal-card u36-view-card"><div class="u36-modal-head"><b>ข้อมูลบัญชีผู้ใช้งาน</b><button data-close-modal>×</button></div><div class="u36-view-user-head"><span class="u36-view-user-icon">'+icon('users')+'</span><div><b id="u36ViewName">-</b><small id="u36ViewUsername">@-</small></div></div><div class="u36-view-grid"><div><small>หน่วยงาน</small><b id="u36ViewUnit">-</b></div><div><small>บทบาท</small><b id="u36ViewRole">-</b></div><div><small>สถานะ</small><b id="u36ViewStatus">-</b></div><div><small>เข้าใช้ล่าสุด</small><b id="u36ViewLast">-</b></div></div><div class="u36-actions"><button class="u36-btn" data-close-modal>ปิด</button><button type="button" class="u36-btn u36-view-edit" id="u36ViewEditBtn">'+actionIcon('edit')+' แก้ไขบัญชี</button></div></div></div>'}
  function wire(){
    var sel=q('#u36UnitSelect');
    if(sel)sel.onchange=function(){selected=this.value;renderInfo();renderUsers()};
    q('#u36AddUnitBtn').onclick=addUnit;
    q('#u36SaveNewUnit').onclick=saveNewUnit;
    q('#u36SaveInfo').onclick=saveInfo;
    q('#u36CancelInfo').onclick=renderInfo;
    q('#u36EditInfoBtn').onclick=function(){q('#u36_name').focus()};
    q('#u36DeleteUnitBtn').onclick=deleteUnit;
    q('#u36ChooseLogoBtn').onclick=chooseLogo;
    q('#u36LogoFile').onchange=function(){handleLogo(this.files&&this.files[0]);this.value=''};
    q('#u36AddUserBtn').onclick=function(){populateUnitSelects();q('#u36NewUnit').value=selected;q('#u36NewUserModal').classList.add('show')};
    q('#u36CreateUser').onclick=createUser;
    q('#u36SaveEditUser').onclick=saveEditUser;
    q('#u36SavePass').onclick=savePassword;
    q('#u36ViewEditBtn').onclick=function(ev){
      if(ev){ev.preventDefault();ev.stopPropagation()}
      var i=this.dataset.userIndex;
      q('#u36ViewUserModal').classList.remove('show');
      if(i!==undefined&&i!==''){
        openEditFromButton({dataset:{userIndex:i,editUser:this.dataset.userId}});
      }else{
        openEditUser(this.dataset.userId);
      }
    };
    qa('[data-close-modal]').forEach(function(b){b.onclick=function(){var m=this.closest('.u36-modal');if(m)m.classList.remove('show')}});
    var page=q('#page-internal');
    if(page&&!page.dataset.u364Actions){
      page.dataset.u364Actions='1';
      page.addEventListener('click',function(ev){
        var edit=ev.target.closest&&ev.target.closest('[data-edit-user]');
        if(edit){ev.preventDefault();ev.stopImmediatePropagation();openEditFromButton(edit);return}
        var view=ev.target.closest&&ev.target.closest('[data-view-user]');
        if(view){ev.preventDefault();ev.stopImmediatePropagation();openViewFromButton(view);return}
        var del=ev.target.closest&&ev.target.closest('[data-delete-user]');
        if(del){ev.preventDefault();ev.stopImmediatePropagation();deleteUserFromButton(del);return}
      },true);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(mount,120)});else setTimeout(mount,120);
})();
