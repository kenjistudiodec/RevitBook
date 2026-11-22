/* Skrip bersama Kas Bank & Kas Tunai — Simpel-Pay (memakai config.js & sesi login yang sama dengan adminbendahara.html) */
(function(){var S=null;try{S=JSON.parse(sessionStorage.getItem('simpelpay_session')||'null')}catch(e){}
  if(!S||S.role!=='bendahara')location.replace('index.html');window.SESI=S||{};})();
const CFG=window.SIMPELPAY_CONFIG,$=id=>document.getElementById(id);
const HD={apikey:CFG.SUPABASE_ANON_KEY,Authorization:'Bearer '+CFG.SUPABASE_ANON_KEY,'Content-Type':'application/json'};
async function api(path,method='GET',body){
  const r=await fetch(CFG.SUPABASE_URL+'/rest/v1/'+path,{method,headers:{...HD,Prefer:'return=minimal'},body:body?JSON.stringify(body):undefined});
  if(!r.ok){let t='';try{t=(await r.json()).message}catch(e){}throw new Error(t||('HTTP '+r.status))}
  return method==='GET'?r.json():null;
}
const rp0=n=>'Rp '+rp(n);
const pad=n=>String(n).padStart(2,'0'),rp=n=>{n=Math.round(Number(n)||0);return(n<0?'-':'')+String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.')};
/* Kolom uang: tampil 1.500.000 saat mengetik; angka() mengembalikan nilai numerik */
const angka=el=>Number(String(el.value).replace(/\D/g,''))||0;
function moneyInput(el){el.type='text';el.inputMode='numeric';el.autocomplete='off';el.placeholder='0';el.removeAttribute('min');el.removeAttribute('step');
  el.addEventListener('input',()=>{const d=el.value.replace(/\D/g,'').replace(/^0+(?=\d)/,'');el.value=d?rp(d):''})}
const BLN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const tgl=s=>{const[y,m,d]=s.split('-');return d+'/'+m+'/'+y};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hari=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};

const CSS=`
:root{--font:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif;
--text:#1d1d1f;--muted:#6e6e73;--accent:#0a7aff;--red:#ff453a;--glass:rgba(255,255,255,.72);--card:rgba(255,255,255,.88);--line:rgba(0,0,0,.1);--bar:rgba(255,255,255,.6);--track:rgba(120,120,128,.16);
--pos:#12822c;--neg:#c9302c;--wall:linear-gradient(135deg,#9cbcff 0%,#c4b0fb 40%,#f9c4de 72%,#fde3bd 100%);--shadow:0 14px 40px rgba(30,30,80,.2),0 0 0 .5px rgba(0,0,0,.14)}
@media(prefers-color-scheme:dark){:root{--pos:#5be37a;--neg:#ff6b60;--text:#f5f5f7;--muted:#a1a1a6;--accent:#2f8bff;--glass:rgba(40,40,46,.7);--card:rgba(44,44,50,.86);--line:rgba(255,255,255,.12);--bar:rgba(20,20,26,.55);--track:rgba(255,255,255,.14);
--wall:linear-gradient(135deg,#1e2a5a 0%,#3b2a6e 40%,#6b2d5c 75%,#7a4a3a 100%);--shadow:0 14px 40px rgba(0,0,0,.5),0 0 0 .5px rgba(255,255,255,.14)}}
*{box-sizing:border-box;margin:0;padding:0}html,body{overflow-x:hidden}
body{font-family:var(--font);color:var(--text);background:var(--wall) fixed;line-height:1.5;-webkit-font-smoothing:antialiased;min-height:100vh;padding-bottom:calc(120px + env(safe-area-inset-bottom))}
a{color:inherit;text-decoration:none}button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}:focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:10px}
.nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:12px;padding:8px 20px;padding-top:calc(8px + env(safe-area-inset-top));background:var(--bar);backdrop-filter:saturate(180%) blur(24px);-webkit-backdrop-filter:saturate(180%) blur(24px);border-bottom:.5px solid var(--line)}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;min-width:0}
.sch-logo{flex:none;width:36px;height:36px;border-radius:10px;display:grid;place-items:center;color:#fff;overflow:hidden;background:linear-gradient(160deg,#4da3ff,#0a5fe0);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),0 2px 6px rgba(0,0,0,.22)}
.sch-logo svg{width:20px;height:20px}.sch-logo img{width:100%;height:100%;object-fit:contain}
.sch-name{display:block;min-width:0;line-height:1.2}.sch-name b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sch-name small{display:block;font-size:11px;font-weight:500;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sp{flex:1}.acct{display:flex;align-items:center;gap:10px;padding:4px 6px 4px 12px;border-radius:99px;background:var(--track)}
.acct div{text-align:right;line-height:1.2}.acct b{display:block;font-size:13px;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.acct small{font-size:11px;color:var(--muted)}
.avatar{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;color:#fff;background:linear-gradient(160deg,#4da3ff,#7c3aed);overflow:hidden}.avatar img{width:100%;height:100%;object-fit:cover}
.wrap{padding:22px min(150px,12vw)}
.head{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:10px;margin-bottom:18px}
h1{font-size:clamp(26px,4.5vw,36px);letter-spacing:-.025em;line-height:1.1}.head p{color:var(--muted);font-size:14px;margin-top:4px}
.chip{font-size:13px;font-weight:600;padding:6px 14px;border-radius:99px;background:var(--glass);box-shadow:0 0 0 .5px var(--line)}
.panel{background:var(--glass);backdrop-filter:saturate(180%) blur(30px);-webkit-backdrop-filter:saturate(180%) blur(30px);border-radius:16px;box-shadow:var(--shadow)}
.box{padding:20px;margin-bottom:16px}.box h2{font-size:18px;letter-spacing:-.01em;margin-bottom:12px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
label{display:block;font-size:13px;color:var(--muted);margin-bottom:3px}
input,select{width:100%;padding:9px 11px;border-radius:10px;border:.5px solid var(--line);background:var(--card);color:var(--text);font:inherit}
.btn{padding:9px 20px;border-radius:10px;background:linear-gradient(160deg,#4da3ff,#0a5fe0);color:#fff;font-weight:600;box-shadow:0 3px 8px rgba(10,98,224,.3)}
.bar{display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin-top:14px}.msg{color:var(--red);font-size:13px;min-height:20px;margin-top:6px}
.scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:14px}
th,td{border:.5px solid var(--line);padding:7px 9px;vertical-align:top}th{background:var(--track);font-weight:600;text-align:center}
td.n{text-align:right;white-space:nowrap}td.dbt{color:var(--pos);font-weight:600}td.krd{color:var(--neg);font-weight:600}td.c{text-align:center}tr.tot td{font-weight:700;background:var(--track)}tr.op td{color:var(--muted);font-style:italic}.empty{text-align:center;color:var(--muted)}
.hdr{display:grid;grid-template-columns:120px 1fr;gap:2px 8px;font-size:14px;margin-bottom:10px}
.title{text-align:center;font-weight:700;font-size:18px;margin-top:8px}.subt{text-align:center;margin-bottom:12px}
.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:center;margin-top:26px;font-size:14px}
.sign input{margin-top:58px;text-align:center;border:0;border-bottom:1px dotted var(--muted);border-radius:0;background:none;padding:2px}
.dock{position:fixed;left:0;right:0;bottom:calc(10px + env(safe-area-inset-bottom));z-index:30;display:flex;justify-content:center;padding:0 12px;pointer-events:none}
.dock nav{--text:#1d1d1f;--track:rgba(120,120,128,.16);color:var(--text);display:flex;gap:6px;padding:8px 12px;pointer-events:auto;background:rgba(255,255,255,.45);backdrop-filter:saturate(180%) blur(28px);-webkit-backdrop-filter:saturate(180%) blur(28px);border:.5px solid rgba(255,255,255,.55);border-radius:32px;box-shadow:0 10px 30px rgba(30,30,80,.22),inset 0 1px 0 rgba(255,255,255,.5)}
@media(prefers-color-scheme:dark){.dock nav{--text:#f5f5f7;--track:rgba(255,255,255,.14);background:rgba(40,40,46,.5);border-color:rgba(255,255,255,.14)}}
.d{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:84px;padding:8px 14px;border-radius:16px;font-size:12px;font-weight:600;transition:background .15s,transform .15s}.d:hover{background:var(--track);transform:translateY(-3px)}
.d .ic{width:40px;height:40px;border-radius:11px;display:grid;place-items:center;color:#fff;box-shadow:0 3px 8px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.35)}.d .ic svg{width:21px;height:21px}
@media(max-width:520px){.wrap{padding:16px 5px}.nav{padding-left:5px;padding-right:5px}.acct div{display:none}.acct{padding:3px}.sch-name small{display:none}.sign{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}
.stat{padding:16px}.stat .ic{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;color:#fff;margin-bottom:10px}.stat .ic svg{width:18px;height:18px}
.stat small{color:var(--muted);font-size:13px;display:block}.stat b{display:block;font-size:clamp(18px,2.2vw,24px);letter-spacing:-.02em;font-variant-numeric:tabular-nums;word-break:break-word}
.stat .delta{font-size:12px;font-weight:600;color:var(--muted)}.stat b.neg{color:var(--neg)}
@media(max-width:900px){.stats{grid-template-columns:repeat(2,1fr)}}@media(max-width:420px){.stats{grid-template-columns:1fr}}
.tabs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px}
.tab{padding:6px 14px;border-radius:99px;background:var(--track);font-size:13px;font-weight:600;transition:background .15s}.tab:hover{background:var(--line)}
.tab.on{background:var(--accent);color:#fff}.tabs select{width:auto;margin-left:auto;padding:6px 10px}
.act{display:inline-flex;gap:6px;justify-content:center}
.ib{position:relative;width:30px;height:30px;border-radius:9px;display:inline-grid;place-items:center;background:var(--track);color:var(--text);transition:background .15s,transform .15s}
.ib svg{width:16px;height:16px}.ib:hover{background:var(--accent);color:#fff;transform:translateY(-1px)}.ib.dl:hover{background:var(--red)}.ib.lk{color:var(--muted);cursor:default}.ib.lk:hover{background:var(--track);color:var(--muted);transform:none}
[data-tip]:hover::after,[data-tip]:focus-visible::after{content:attr(data-tip);position:absolute;right:calc(100% + 8px);top:50%;transform:translateY(-50%);white-space:nowrap;z-index:5;pointer-events:none;font-size:12px;font-weight:500;padding:5px 10px;border-radius:8px;background:#1d1d1fe6;color:#fff}
#printArea{display:none}
.pp{color:#000;background:#fff;font:12.5px/1.45 Tahoma,Verdana,"Segoe UI",sans-serif;border:1px solid #000}
#pvPaper.pp{box-shadow:0 4px 18px rgba(0,0,0,.15)}
.pp .sr-kop{display:flex;align-items:center;gap:10px;padding:10px 12px 8px}
.pp .sr-kt{flex:1;text-align:center;min-width:0}.pp .sr-kt .b{font-weight:700;font-size:14px;line-height:1.3}.pp .sr-kt .i{font-style:italic;font-size:10.5px;line-height:1.3}.pp .sr-kt .u{font-size:10.5px;text-decoration:underline}
.pp .sr-logo{flex:none;width:60px;height:60px;display:block;overflow:hidden}.pp .sr-logo img{display:block;width:100%;height:100%;object-fit:contain}
.pp .sr-hr{border:0;border-top:1.5px solid #000;margin:0 12px}
.pp .miss{color:#b3261e;font-style:italic;font-size:10.5px}
.pp .pbody{padding:10px 12px 14px}
.pp .title{text-align:center;font-weight:700;text-decoration:underline;font-size:14px}.pp .subt{text-align:center;margin-bottom:12px}
.pp table{width:100%;border-collapse:collapse}.pp th,.pp td{border:1px solid #000;padding:4px 6px;color:#000}.pp th{background:#eee}
.pp td.n{text-align:right;white-space:nowrap}.pp td.c{text-align:center}.pp tr.tot td{font-weight:700;background:#eee}.pp tr.op td{font-style:italic}
.pp .sg{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;text-align:center;margin-top:22px;break-inside:avoid}.pp .sg .nm{margin-top:64px}
.pp .pin{height:auto;border:0;border-bottom:1px dotted #555;border-radius:0;background:#fff;color:#000;text-align:center;padding:1px 2px;width:85%}
#pvDlg{width:min(1060px,96vw);max-height:92vh;display:none;flex-direction:column}#pvDlg[open]{display:flex}
#pvDlg .pvn{font-size:13px;color:var(--muted);text-align:center;margin:-8px 0 12px}
#pvDlg .pvb{overflow:auto;border-radius:10px;border:.5px solid var(--line);padding:16px;background:#f2f2f5;margin-bottom:6px}#pvDlg .pvb .pp{min-width:760px}
.pp .nm.ed{display:flex;align-items:center;justify-content:center;gap:4px}.pp .nm.ed .pin{width:auto;flex:1;min-width:0}
.pp .pcari{flex:none;width:26px;height:26px;border-radius:7px;display:inline-grid;place-items:center;background:#e9e9ee;color:#333;transition:background .15s}
.pp .pcari svg{width:14px;height:14px}.pp .pcari:hover,.pp .pcari:focus-visible{background:var(--accent);color:#fff}
#ttdDlg{margin:auto;border:0;border-radius:22px;padding:22px;width:min(520px,94vw);max-height:80vh;color:var(--text);background:var(--card);backdrop-filter:saturate(200%) blur(28px);-webkit-backdrop-filter:saturate(200%) blur(28px);box-shadow:var(--shadow);display:none;flex-direction:column}
#ttdDlg[open]{display:flex}#ttdDlg::backdrop{background:rgba(0,0,0,.35)}
#ttdDlg h2{font-size:20px;text-align:center;margin-bottom:12px}#ttdDlg input{width:100%;height:42px;padding:0 12px}
#ttdDlg .lst{overflow:auto;display:grid;gap:8px;margin:12px 0}
#ttdDlg .it{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;padding:10px 14px;border-radius:12px;background:var(--track);transition:background .15s}
#ttdDlg .it:hover,#ttdDlg .it:focus-visible{background:var(--accent);color:#fff}
#ttdDlg .it .tn{display:grid;min-width:0}#ttdDlg .it .tn b{overflow-wrap:anywhere}
#ttdDlg .it .tj{flex:none;font-size:12px;font-weight:600;padding:3px 10px;border-radius:99px;background:rgba(10,122,255,.14);color:#0a62d1}
#ttdDlg .it:hover .tj,#ttdDlg .it:focus-visible .tj{background:rgba(255,255,255,.25);color:#fff}
#ttdDlg .ttdbar{display:flex;justify-content:flex-end}#ttdDlg .ttdx{padding:9px 20px;border-radius:10px;background:var(--track);font-weight:600}
@media print{body>*:not(#printArea){display:none!important}#printArea{display:block!important}#printArea .sg{margin-top:26px}
body{background:#fff;color:#000;padding:0}.nav,.dock,.noprint{display:none!important}.wrap{padding:0}.panel{background:none;box-shadow:none;backdrop-filter:none}.box{padding:0}
th,td,td.dbt,td.krd{border:1px solid #000;color:#000}th,tr.tot td{background:#eee}.sign input{color:#000}h1,.head{display:none}@page{size:A4 landscape;margin:12mm}}`;
const IC={down:'<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',up:'<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',list:'<path d="M4 6h16M4 12h16M4 18h10"/>',wallet:'<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19M6.5 15h4"/>',pen:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',home:'<path d="M3 10l9-6 9 6M5 10v9h14v-9M9 19v-5h6v5"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  print:'<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'};
const svg=n=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+IC[n]+'</svg>';

/* Kerangka halaman: navbar, judul, dock. Mengembalikan elemen <main>. */
function shell(judul,desk){
  document.head.insertAdjacentHTML('beforeend','<style>'+CSS+'</style>');
  const nm=SESI.nama||SESI.user||'Bendahara',p=String(nm).replace(/,.*$/,'').trim().split(/\s+/).filter(Boolean);
  document.body.innerHTML=`<header class="nav"><div class="brand"><span class="sch-logo" id="navLogo">${svg('home')}</span><span class="sch-name"><b id="navName">Sekolah</b><small id="navSub"></small></span></div><span class="sp"></span>
  <div class="acct"><div><b>${esc(nm)}</b><small>Bendahara</small></div><span class="avatar">${esc(((p[0]||'B')[0]+(p[1]?p[1][0]:'')).toUpperCase())}</span></div></header>
  <main class="wrap" id="main"><div class="head"><div><h1>${judul}</h1><p>${desk}</p></div><span class="chip" id="chip"></span></div></main>
  <div class="dock"><nav aria-label="Menu"><a class="d" href="adminbendahara.html"><span class="ic" style="background:linear-gradient(160deg,#4da3ff,#0a5fe0)">${svg('grid')}</span>Beranda</a>
  <button class="d" type="button" onclick="bukaPreview()"><span class="ic" style="background:linear-gradient(160deg,#5be37a,#1fa23c)">${svg('print')}</span>Cetak</button></nav></div>`;
  return $('main');
}

/* Identitas sekolah (tabel identitas_sekolah, sama dengan beranda) */
const SK={};
async function loadSekolah(){
  try{const r=(await api('identitas_sekolah?id=eq.1&select=*'))[0]||{};
    SK.nama=r.nama_sekolah||'';SK.npsn=r.npsn||'';SK.kab=r.kabupaten||'';SK.prov=r.provinsi||'';SK.logo=r.logo_url?r.logo_url+'?v='+encodeURIComponent(r.updated_at||''):'';
    /* Alamat kop: jalan, kelurahan, Kec. …, Kab. … (awalan ditambah bila belum ada); email apa adanya */
    const pre=(v,k)=>{v=String(v||'').trim();return v&&!/^(kab|kota|prov|kec)/i.test(v)?k+' '+v:v};
    SK.alamat=[r.jalan,r.kelurahan,pre(r.kecamatan,'Kec.'),pre(r.kabupaten,'Kab.')].map(x=>String(x||'').trim()).filter(Boolean).join(', ');
    SK.email=String(r.email||'').trim();SK.kepala=r.kepala_sekolah||r.nama_kepala_sekolah||'';
    $('navName').textContent=SK.nama||'Sekolah';$('navSub').textContent=[SK.kab,SK.prov].filter(Boolean).join(', ');
    if(r.logo_url){const i=new Image();i.alt='';i.onload=()=>{$('navLogo').innerHTML='';$('navLogo').appendChild(i)};i.src=r.logo_url}
  }catch(e){}
}

/* Kertas buku: tab filter + tabel riwayat. Format cetak dibuat di modal preview (bukaPreview). */
let JUDUL='',TTD={},PV={rows:[]};
function bukuHTML(judul){
  JUDUL=judul;
  return `<div class="tabs noprint" id="tabs" role="tablist" aria-label="Filter bulan"><button class="tab on" type="button" role="tab" data-m="">Semua Bulan</button>${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map((b,i)=>`<button class="tab" type="button" role="tab" data-m="${i+1}">${b}</button>`).join('')}<select id="thn" aria-label="Tahun" hidden><option>${new Date().getFullYear()}</option></select></div>
  <div class="scroll"><table><thead><tr><th>No</th><th>Tanggal</th><th>Uraian</th><th>No Bukti</th><th>Debet/Penerimaan (Rp.)</th><th>Kredit/Pengeluaran (Rp.)</th><th>Saldo (Rp.)</th><th class="noprint"></th></tr></thead><tbody id="tb"></tbody><tfoot id="tf"></tfoot></table></div>
  <div class="msg noprint" id="msg" role="alert"></div>`;
}
/* Nama penanda tangan (tersimpan di browser). Bila belum ada, diisi dari identitas sekolah / akun login. */
function isiBuku(){
  let T={};try{T=JSON.parse(localStorage.getItem('kas_ttd')||'{}')}catch(e){}
  const d=(k,v)=>k in T?T[k]:v;
  TTD={tempat:d('tempat',SK.kab),kepala:d('kepala',SK.kepala),ketua:d('ketua',''),bend:d('bend',SESI.nama||SESI.user||'')};
}

/* Kop surat — sama dengan Surat Order. Pemda & Dinas tetap (sama dengan transaksi-pembayaran.html);
   nama sekolah, alamat, dan email otomatis dari halaman Identitas Sekolah (tabel identitas_sekolah). */
const KOP={pemda:'PEMERINTAH KABUPATEN BANGKA BARAT',dinas:'DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA'};
const kopHTML=edit=>{
  const miss=t=>edit?`<div class="miss">(${t} belum diisi — lengkapi di Identitas Sekolah)</div>`:'';
  const logo=src=>`<div class="sr-logo"><img alt="" src="${esc(src)}" onerror="this.style.visibility='hidden'"></div>`;
  return `<div class="sr-kop">${logo('logokab.png')}<div class="sr-kt"><div class="b">${esc(KOP.pemda)}</div><div class="b">${esc(KOP.dinas)}</div><div class="b">${esc(String(SK.nama||'').toUpperCase())}</div>
    ${SK.alamat?`<div class="i">Alamat : ${esc(SK.alamat)}</div>`:miss('alamat')}${SK.email?`<div class="u">Email : ${esc(SK.email)}</div>`:miss('email')}</div>${logo(SK.logo||'logo.png')}</div><hr class="sr-hr">`;
};

/* Isi kertas cetak. edit=true -> kolom nama bisa diisi (preview); false -> teks biasa (cetak). */
function paperHTML(edit){
  const P=PV,dots='.'.repeat(38);
  const nm=(k,ph)=>`<div class="nm${edit?' ed':''}">(${edit?`<input class="pin" id="pv_${k}" value="${esc(TTD[k])}" placeholder="${ph}" maxlength="80">`:esc(TTD[k])||dots})${edit?`<button class="pcari" type="button" data-k="${k}" title="Cari dari daftar Penanda Tangan" aria-label="Cari ${ph}">${svg('search')}</button>`:''}</div>`;
  const rows=P.rows.map(r=>r.op?`<tr class="op"><td></td><td></td><td>Saldo bulan lalu</td><td></td><td></td><td></td><td class="n">${rp(r.saldo)}</td></tr>`
    :`<tr><td class="c">${r.no}</td><td class="c">${r.tgl}</td><td>${esc(r.uraian)}</td><td>${esc(r.bukti)}</td><td class="n">${r.debet>0?rp(r.debet):''}</td><td class="n">${r.kredit>0?rp(r.kredit):''}</td><td class="n">${rp(r.saldo)}</td></tr>`).join('')
    ||'<tr><td colspan="7" class="c">Belum ada transaksi.</td></tr>';
  const tmp=edit?`<input class="pin" id="pv_tempat" value="${esc(TTD.tempat)}" placeholder="Tempat" style="width:140px" maxlength="60">`:(esc(TTD.tempat)||'..............');
  return `${kopHTML(edit)}<div class="pbody">
  <div class="title">${JUDUL}</div><div class="subt">Bulan : ${esc(P.bulan)}</div>
  <table><thead><tr><th>No</th><th>Tanggal</th><th>Uraian</th><th>No Bukti</th><th>Debet/Penerimaan (Rp.)</th><th>Kredit/Pengeluaran (Rp.)</th><th>Saldo (Rp.)</th></tr></thead><tbody>${rows}</tbody>
  <tfoot><tr class="tot"><td colspan="4" class="c">Jumlah</td><td class="n">${rp(P.sd)}</td><td class="n">${rp(P.sk)}</td><td class="n">${rp(P.saldo)}</td></tr></tfoot></table>
  <div class="sg"><div>Mengetahui</div><div></div><div>${tmp}, ${esc(P.tgl)}</div>
  <div>Kepala ${esc(SK.nama)}${nm('kepala','Nama Kepala Sekolah')}</div><div>Ketua P2SP${nm('ketua','Nama Ketua P2SP')}</div><div>Bendahara${nm('bend','Nama Bendahara')}</div></div></div>`;
}

/* Modal preview cetak */
function bukaPreview(){
  if(!$('pvDlg')){
    document.body.insertAdjacentHTML('beforeend',`<dialog id="pvDlg" aria-labelledby="pvT"><h2 id="pvT">Preview Cetak</h2>
      <p class="pvn">Periksa tampilan cetak. Isi nama penanda tangan, atau klik ikon cari untuk memilih dari daftar Penanda Tangan; kolom yang dikosongkan dicetak titik-titik untuk ditulis tangan.</p>
      <div class="pvb"><div class="pp" id="pvPaper"></div></div>
      <div class="bar"><button class="btn sec" type="button" id="pvBatal">Batal</button><button class="btn" type="button" id="pvCetak">Cetak</button></div></dialog><div id="printArea" class="pp"></div>`);
    $('pvBatal').onclick=()=>$('pvDlg').close();
    $('pvDlg').addEventListener('click',e=>{if(e.target===$('pvDlg'))$('pvDlg').close()});
    $('pvCetak').onclick=()=>{$('printArea').innerHTML=paperHTML(false);$('pvDlg').close();setTimeout(()=>window.print(),60)};
    window.addEventListener('afterprint',()=>{$('printArea').innerHTML=''});
  }
  $('pvPaper').innerHTML=paperHTML(true);
  $('pvPaper').oninput=e=>{const k=(e.target.id||'').replace('pv_','');if(!(k in TTD))return;TTD[k]=e.target.value;try{localStorage.setItem('kas_ttd',JSON.stringify(TTD))}catch(x){}};
  $('pvPaper').onclick=e=>{const b=e.target.closest('.pcari');if(b)bukaCariTTD(b.dataset.k)};
  $('pvDlg').showModal();
}

/* Modal pilih penanda tangan (tabel penanda_tangan) -> mengisi nama pada kolom yang diklik */
let TTD_SLOT='',TTD_DATA=[];
const TTD_JAB={kepala:'kepala sekolah',bend:'bendahara'}; /* jabatan yang ditampilkan paling atas per kolom */
function simpanTTD(){try{localStorage.setItem('kas_ttd',JSON.stringify(TTD))}catch(x){}}
function renderCariTTD(){
  const q=($('ttdQ').value||'').trim().toLowerCase(),pref=TTD_JAB[TTD_SLOT]||'',jb=r=>String(r.jabatan||'').trim().toLowerCase();
  const L=TTD_DATA.map((r,i)=>({r,i})).filter(x=>!q||[x.r.nama,x.r.jabatan].some(v=>String(v||'').toLowerCase().includes(q)));
  L.sort((a,b)=>(jb(b.r)===pref)-(jb(a.r)===pref));
  $('ttdList').innerHTML=L.length?L.map(x=>`<button type="button" class="it" data-i="${x.i}"><span class="tn"><b>${esc(x.r.nama)}</b></span><span class="tj">${esc(x.r.jabatan)}</span></button>`).join('')
    :`<div class="empty">${TTD_DATA.length?'Tidak ditemukan.':'Belum ada data penanda tangan. Tambahkan di menu Penanda Tangan.'}</div>`;
}
async function bukaCariTTD(k){
  TTD_SLOT=k;
  if(!$('ttdDlg')){
    document.body.insertAdjacentHTML('beforeend',`<dialog id="ttdDlg" aria-labelledby="ttdT"><h2 id="ttdT">Pilih Penanda Tangan</h2>
      <input id="ttdQ" type="search" placeholder="Cari nama atau jabatan…" autocomplete="off" aria-label="Cari penanda tangan">
      <div class="lst" id="ttdList"></div>
      <div class="ttdbar"><button class="ttdx" type="button" id="ttdBatal">Batal</button></div></dialog>`);
    $('ttdBatal').onclick=()=>$('ttdDlg').close();
    $('ttdDlg').addEventListener('click',e=>{if(e.target===$('ttdDlg'))$('ttdDlg').close()});
    $('ttdQ').oninput=renderCariTTD;
    $('ttdList').onclick=e=>{
      const b=e.target.closest('.it');if(!b)return;const r=TTD_DATA[+b.dataset.i];if(!r)return;
      TTD[TTD_SLOT]=r.nama||'';simpanTTD();
      const a=$('pv_'+TTD_SLOT);if(a)a.value=TTD[TTD_SLOT];
      $('ttdDlg').close();
    };
  }
  $('ttdQ').value='';TTD_DATA=[];$('ttdList').innerHTML='<div class="empty">Memuat…</div>';$('ttdDlg').showModal();
  try{TTD_DATA=await api('penanda_tangan?select=id,nama,jabatan&order=id.asc')}
  catch(e){$('ttdList').innerHTML='<div class="empty">Gagal memuat: '+esc(e.message)+'</div>';return}
  renderCariTTD();
}

/* Filter tab bulan */
function ymNow(){const on=document.querySelector('#tabs .tab.on');return !on||on.dataset.m===''?'':$('thn').value+'-'+pad(on.dataset.m)}
function initTabs(cb){
  document.querySelectorAll('#tabs .tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('#tabs .tab').forEach(x=>x.classList.toggle('on',x===t));$('thn').hidden=t.dataset.m==='';cb()});
  $('thn').onchange=cb;
}
function gotoTanggal(iso){
  const on=document.querySelector('#tabs .tab.on');if(!on||on.dataset.m==='')return;
  const s=$('thn'),y=iso.slice(0,4);if(![...s.options].some(o=>o.value===y))s.add(new Option(y,y));s.value=y;
  document.querySelectorAll('#tabs .tab').forEach(t=>t.classList.toggle('on',t.dataset.m===String(+iso.slice(5,7))));
}
function fillYears(data){
  const s=$('thn');if(!s)return;const now=String(new Date().getFullYear()),cur=s.value||now,ys=new Set(data.map(r=>r.tanggal.slice(0,4)));ys.add(now);
  s.innerHTML=[...ys].sort().reverse().map(y=>`<option>${y}</option>`).join('');s.value=ys.has(cur)?cur:now;
}
/* Muat & tampilkan satu bulan dengan saldo berjalan */
const ROWS={};
async function renderBuku(table,ym,lockFn,onDel,onEdit){
  const all=!ym,now=new Date();let y=now.getFullYear(),m=now.getMonth()+1;if(!all)[y,m]=ym.split('-').map(Number);
  const akhir=all?now.getDate():new Date(y,m,0).getDate(),first=all?'':`${y}-${pad(m)}-01`,last=`${y}-${pad(m)}-${pad(akhir)}`;
  const bulanTxt=all?'Semua bulan':BLN[m-1]+' '+y,tglTxt=akhir+' '+BLN[m-1]+' '+y;
  let data;try{data=await api(`${table}?select=*&order=tanggal.asc,created_at.asc`)}
  catch(e){$('tb').innerHTML='<tr><td colspan="8" class="empty">Gagal memuat: '+esc(e.message)+'</td></tr>';return}
  fillYears(data);
  let saldo=0,sd=0,sk=0,no=0,nd=0,nk=0,pr=[],h='';for(const k in ROWS)delete ROWS[k];
  for(const r of data){
    if(!all&&r.tanggal>last)continue;saldo+=Number(r.debet)-Number(r.kredit);if(r.tanggal<first)continue;ROWS[r.id]=r;if(r.debet>0)nd++;if(r.kredit>0)nk++;sd+=Number(r.debet);sk+=Number(r.kredit);
    pr.push({no:no+1,tgl:tgl(r.tanggal),uraian:r.uraian,bukti:r.no_bukti,debet:r.debet,kredit:r.kredit,saldo});
    h+=`<tr><td class="c">${++no}</td><td class="c">${tgl(r.tanggal)}</td><td>${esc(r.uraian)}</td><td>${esc(r.no_bukti)}</td><td class="n dbt">${r.debet>0?rp(r.debet):''}</td><td class="n krd">${r.kredit>0?rp(r.kredit):''}</td><td class="n">${rp(saldo)}</td>
    <td class="c noprint"><span class="act">${lockFn(r)?`<span class="ib lk" tabindex="0" data-tip="${esc(lockFn(r))}" aria-label="${esc(lockFn(r))}">${svg('lock')}</span>`:`<button class="ib" data-act="edit" data-id="${r.id}" data-tip="Edit" aria-label="Edit">${svg('pen')}</button><button class="ib dl" data-act="del" data-id="${r.id}" data-tip="Hapus" aria-label="Hapus">${svg('trash')}</button>`}</span></td></tr>`;
  }
  const awal=saldo-sd+sk;if(awal)pr.unshift({op:1,saldo:awal});PV={bulan:bulanTxt,tgl:tglTxt,rows:pr,sd,sk,saldo};
  if(awal)h=`<tr class="op"><td></td><td></td><td>Saldo bulan lalu</td><td></td><td></td><td></td><td class="n">${rp(awal)}</td><td class="noprint"></td></tr>`+h;
  $('tb').innerHTML=h||'<tr><td colspan="8" class="empty">Belum ada transaksi.</td></tr>';
  $('tf').innerHTML=`<tr class="tot"><td colspan="4" class="c">Jumlah</td><td class="n dbt">${rp(sd)}</td><td class="n krd">${rp(sk)}</td><td class="n">${rp(saldo)}</td><td class="noprint"></td></tr>`;
  if($('stats')){const L=window.KAS_LABEL||'Total Penerimaan',per=all?'seluruh transaksi':BLN[m-1]+' '+y,jn=L.replace('Total ','').toLowerCase();
    const k=[[L,rp0(sd),nd+' transaksi '+jn,'down','linear-gradient(160deg,#5be37a,#1fa23c)',''],
      ['Total Pengeluaran',rp0(sk),nk+' transaksi pengeluaran','up','linear-gradient(160deg,#ff7a8a,#e11d48)',''],
      ['Jumlah Transaksi',String(nd+nk),nd+' '+jn+' · '+nk+' pengeluaran','list','linear-gradient(160deg,#4da3ff,#0a5fe0)',''],
      ['Sisa Kas',rp0(saldo),'Saldo akhir '+per,'wallet','linear-gradient(160deg,#ffb454,#f0780a)',saldo<0?'neg':'']];
    $('stats').innerHTML=k.map(x=>`<div class="panel stat"><div class="ic" style="background:${x[4]}">${svg(x[3])}</div><small>${x[0]}</small><b class="${x[5]}">${x[1]}</b><span class="delta">${x[2]}</span></div>`).join('')}
  $('tb').querySelectorAll('[data-act=del]').forEach(b=>b.onclick=()=>confirm('Hapus transaksi ini?')&&onDel(b.dataset.id));
  $('tb').querySelectorAll('[data-act=edit]').forEach(b=>b.onclick=()=>onEdit(ROWS[b.dataset.id]));
}