// ------- Dummy Data -------
const store = {
    customers:[
      {id:'C001',name:'Bayi A Gıda',code:'BA-001',email:'odeme@bayia.com',phone:'+90 532 000 00 01',tax_no:'1234567890',address:'İstanbul – İkitelli OSB'},
      {id:'C002',name:'Bayi B Unlu Mam.',code:'BB-014',email:'finans@bayib.com',phone:'+90 532 000 00 02',tax_no:'9876543210',address:'Ankara – Sincan'},
      {id:'C003',name:'Bayi C Fırıncılık',code:'BC-031',email:'muhasebe@bayic.com',phone:'+90 532 000 00 03',tax_no:'5566778899',address:'İzmir – Kemalpaşa'}
    ],
    links:[
      {id:'L001',customer_id:'C001',amount:12450,description:'Ekim Sevkiyat 1023',expires_at:addDays(15),single_use:true,status:'pending',token:'abc123'},
      {id:'L002',customer_id:'C002',amount:22500,description:'Kasım Sipariş 771',expires_at:addDays(30),single_use:false,status:'pending',token:'def456'},
      {id:'L003',customer_id:'C003',amount:7500,description:'Kasım Avans',expires_at:addDays(7),single_use:true,status:'pending',token:'ghi789'}
    ],
    payments:[
      {id:'P001',link_id:'L001',nkolay_txn_id:'TST-90011',amount:12450,status:'succeeded',installment:1,three_d:true,created_at:agoHours(72)},
      {id:'P002',link_id:'L002',nkolay_txn_id:'TST-90012',amount:11250,status:'failed',installment:1,three_d:true,created_at:agoHours(5)},
      {id:'P003',link_id:'L003',nkolay_txn_id:'TST-90013',amount:7500,status:'pending',installment:1,three_d:true,created_at:agoHours(1)}
    ]
  };
  
  // ------- Helpers -------
  function addDays(d){return new Date(Date.now()+d*864e5).toISOString()}
  function agoHours(h){return new Date(Date.now()-h*36e5).toISOString()}
  function fmtTL(n){return n.toLocaleString('tr-TR',{style:'currency',currency:'TRY'})}
  function byId(id){return document.getElementById(id)}
  function customerById(id){return store.customers.find(c=>c.id===id)}
  function linkById(id){return store.links.find(l=>l.id===id)}
  function paymentsAll(){return store.payments.slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))}
  function statusPill(s){
    const cls=s==='succeeded'?'ok':s==='failed'?'fail':'wait';
    const t=s==='succeeded'?'Onaylandı':s==='failed'?'Başarısız':'Bekliyor';
    return `<span class="pill ${cls}">${t}</span>`;
  }
  function setActive(href){
    document.querySelectorAll('#nav a').forEach(a=>{
      a.classList.toggle('active', href.startsWith(a.getAttribute('href')))
    });
  }
  
  // ------- Views -------
  function showCustomerModal(id){
    const c=customerById(id);
    const html = `
      <div class="row">
        <div class="col-12"><div class="muted">Ad</div><div>${c.name}</div></div>
        <div class="col-6"><div class="muted">Telefon</div><div>${c.phone}</div></div>
        <div class="col-6"><div class="muted">E-posta</div><div>${c.email}</div></div>
        <div class="col-12"><div class="muted">Adres</div><div>${c.address}</div></div>
        <div class="col-6"><div class="muted">Vergi No</div><div>${c.tax_no}</div></div>
        <div class="col-6"><div class="muted">Bayi Kodu</div><div>${c.code}</div></div>
      </div>`;
    byId('modalBody').innerHTML = html;
    byId('modal').classList.add('open');
  }
  
  function viewDashboard(){
    const list=paymentsAll();
    byId('view').innerHTML = `
      <div class="toolbar"><h2 style="margin:0">Dashboard</h2><a class="btn" href="#/links/new">🔗 Yeni Link</a></div>
      <div class="card">
        <h3 style="margin-top:0">Gelen Ödemeler</h3>
        <table>
          <thead><tr><th>Tarih</th><th>Müşteri</th><th>Tutar</th><th>Durum</th><th>TxnID</th></tr></thead>
          <tbody>
            ${list.map(p=>{
              const l=linkById(p.link_id); const c=customerById(l.customer_id);
              return `
                <tr>
                  <td>${new Date(p.created_at).toLocaleString('tr-TR')}</td>
                  <td><a class="link" href="#" data-cid="${c.id}">${c.name}</a></td>
                  <td>${fmtTL(p.amount)}</td>
                  <td>${statusPill(p.status)}</td>
                  <td class="small muted">${p.nkolay_txn_id}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
    setActive('#/dashboard');
  }
  
  function viewCustomers(){
    byId('view').innerHTML = `
      <div class="toolbar">
        <h2 style="margin:0">Müşteriler</h2>
        <input id="q" class="input" placeholder="Ara: isim / kod / vergi no" style="width:260px">
      </div>
      <div class="split">
        <div class="card" id="custList"></div>
        <div class="card" id="custDetail"><div class="muted">Sağdan bir müşteri seçtiğinizde geçmiş hareketler görünür.</div></div>
      </div>`;
  
    function totalByCustomer(id){
      const linkIds=store.links.filter(l=>l.customer_id===id).map(l=>l.id);
      return store.payments
        .filter(p=>p.status==='succeeded' && linkIds.includes(p.link_id))
        .reduce((s,p)=>s+p.amount,0);
    }
    function renderList(items){
      byId('custList').innerHTML = `
        <table>
          <thead><tr><th>Kod</th><th>Ad</th><th>Toplam</th><th></th></tr></thead>
          <tbody>
            ${items.map(c=>`
              <tr>
                <td>${c.code}</td><td>${c.name}</td><td>${fmtTL(totalByCustomer(c.id))}</td>
                <td><a href="#" class="btn" data-view="${c.id}">Görüntüle</a></td>
              </tr>`).join('')}
          </tbody>
        </table>`;
    }
    renderList(store.customers);
    byId('q').addEventListener('input', (e)=>{
      const v=e.target.value.toLowerCase();
      renderList(store.customers.filter(c=>(c.name+c.code+(c.tax_no||'')).toLowerCase().includes(v)));
    });
    setActive('#/customers');
  }
  
  function selectCustomer(id){
    const c=customerById(id);
    const linkIds=store.links.filter(l=>l.customer_id===id).map(l=>l.id);
    const pays=store.payments
      .filter(p=>linkIds.includes(p.link_id))
      .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  
    byId('custDetail').innerHTML = `
      <h3 style="margin-top:0">${c.name}</h3>
      <div class="row">
        <div class="col-6"><div class="muted small">Telefon</div>${c.phone}</div>
        <div class="col-6"><div class="muted small">E-posta</div>${c.email}</div>
        <div class="col-12"><div class="muted small">Adres</div>${c.address}</div>
      </div>
      <div class="hr"></div>
      <h4 style="margin:6px 0">Geçmiş Ödemeler</h4>
      <table>
        <thead><tr><th>Tarih</th><th>Tutar</th><th>Durum</th><th>TxnID</th></tr></thead>
        <tbody>
          ${pays.map(p=>`
            <tr>
              <td>${new Date(p.created_at).toLocaleString('tr-TR')}</td>
              <td>${fmtTL(p.amount)}</td>
              <td>${statusPill(p.status)}</td>
              <td class="small muted">${p.nkolay_txn_id}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }
  
  function viewNewLink(){
    byId('view').innerHTML = `
      <div class="toolbar"><h2 style="margin:0">Link Oluştur</h2></div>
      <div class="card">
        <div class="row">
          <div class="col-6">
            <label class="muted">Müşteri</label>
            <select id="lk_customer" class="input">
              ${store.customers.map(c=>`<option value="${c.id}">${c.name} (${c.code})</option>`).join('')}
            </select>
          </div>
          <div class="col-3">
            <label class="muted">Tutar (TL)</label>
            <input id="lk_amount" type="number" class="input" value="12450" />
          </div>
          <div class="col-3">
            <label class="muted">Son Ödeme Tarihi</label>
            <input id="lk_exp" type="date" class="input" />
          </div>
          <div class="col-12">
            <label class="muted">Açıklama</label>
            <input id="lk_desc" class="input" placeholder="Örn. Ekim Sevkiyat 1023" />
          </div>
          <div class="col-12">
            <label><input type="checkbox" id="lk_single" checked /> Tek kullanımlık</label>
          </div>
        </div>
        <div class="hr"></div>
        <a class="btn" id="btn_create" href="#">🔗 Oluştur</a> <span id="result" class="muted"></span>
      </div>
      <div id="preview"></div>`;
  
    byId('btn_create').addEventListener('click', (e)=>{
      e.preventDefault();
      const id='L'+Math.random().toString(36).slice(2,6).toUpperCase();
      const token=Math.random().toString(36).slice(2,8);
      const obj={
        id,
        customer_id:byId('lk_customer').value,
        amount:Number(byId('lk_amount').value||0),
        description:byId('lk_desc').value||'Ödeme',
        expires_at:new Date(byId('lk_exp').value||addDays(15)).toISOString(),
        single_use:byId('lk_single').checked,
        status:'pending',
        token
      };
      store.links.push(obj);
      byId('result').textContent='Link oluşturuldu';
      const c=customerById(obj.customer_id);
      byId('preview').innerHTML = `
        <div class="card">
          <h3 style="margin:0 0 8px">Önizleme</h3>
          <div class="row">
            <div class="col-6"><div class="muted small">Müşteri</div>${c.name}</div>
            <div class="col-6"><div class="muted small">Tutar</div>${fmtTL(obj.amount)}</div>
            <div class="col-12"><div class="muted small">Açıklama</div>${obj.description}</div>
            <div class="col-6"><div class="muted small">Tek Kullanımlık</div>${obj.single_use?'Evet':'Hayır'}</div>
            <div class="col-6"><div class="muted small">Son Tarih</div>${new Date(obj.expires_at).toLocaleDateString('tr-TR')}</div>
          </div>
          <div class="hr"></div>
          <div class="small muted">Bağlantı:</div>
          <div class="small"><code>${location.origin+location.pathname}#/pay/${obj.token}</code></div>
        </div>`;
    });
    setActive('#/links/new');
  }
  
  // ------- Router & Delegation -------
  function router(){
    const h=location.hash||'#/dashboard';
    if(h.startsWith('#/customers')) viewCustomers();
    else if(h.startsWith('#/links/new')) viewNewLink();
    else if(h.startsWith('#/payments')) viewPayments();
    else viewDashboard();
  }
  
  function viewPayments(){
    const list=paymentsAll();
    byId('view').innerHTML = `
      <div class="toolbar"><h2 style="margin:0">Ödemeler</h2></div>
      <div class="card">
        <table>
          <thead><tr><th>Tarih</th><th>Müşteri</th><th>Tutar</th><th>Durum</th><th>TxnID</th></tr></thead>
          <tbody>
            ${list.map(p=>{
              const l=linkById(p.link_id); const c=customerById(l.customer_id);
              return `
                <tr>
                  <td>${new Date(p.created_at).toLocaleString('tr-TR')}</td>
                  <td><a class="link" href="#" data-cid="${c.id}">${c.name}</a></td>
                  <td>${fmtTL(p.amount)}</td>
                  <td>${statusPill(p.status)}</td>
                  <td class="small muted">${p.nkolay_txn_id}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
    setActive('#/payments');
  }
  
  // Tek noktadan tıklama yakalama (nav, müşteri linki, müşteri görüntüleme)
  document.addEventListener('click',(e)=>{
    const a = e.target.closest('a');
    if(a && a.getAttribute('href') && a.getAttribute('href').startsWith('#/')){
      e.preventDefault();
      location.hash = a.getAttribute('href');
    }
    const custLink = e.target.closest('[data-cid]');
    if(custLink){ e.preventDefault(); showCustomerModal(custLink.getAttribute('data-cid')); }
    const viewBtn = e.target.closest('[data-view]');
    if(viewBtn){ e.preventDefault(); selectCustomer(viewBtn.getAttribute('data-view')); }
  });
  document.getElementById('modalCloseBtn').addEventListener('click',()=>document.getElementById('modal').classList.remove('open'));
  
  window.addEventListener('hashchange', router);
  window.addEventListener('DOMContentLoaded', router);