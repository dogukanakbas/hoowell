import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, Outlet } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState({});
  React.useEffect(() => {
    // Token'dan kullanıcı id'sini al
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      let id = payload.id;
      if (typeof id === 'string') {
        // Sadece rakamları al
        id = id.match(/^\d+/) ? Number(id.match(/^\d+/)[0]) : null;
      }
      if (!id || isNaN(id)) return;
      fetch('http://127.0.0.1:5001/api/partners/' + id, {
        headers: { Authorization: 'Bearer ' + token }
      })
        .then(res => res.json())
        .then(setProfile);
    } catch {}
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  let displayName = '...';
  if (profile.type === 'kurumsal' && profile.firmaIsmi) displayName = profile.firmaIsmi;
  else if (profile.isim && profile.soyisim) displayName = profile.isim + ' ' + profile.soyisim;
  else if (profile.isim) displayName = profile.isim;
  // Kariyer seviyesi
  const kariyerSeviye = profile.kariyer || profile.seviye || 'Bronz İş Ortağı';
  return (
    <div className="sidebar">
      <div className="profile-section">
        <div className="profile-pic" />
        <div className="profile-info">
          <strong>{displayName}</strong>
          <div className="profile-level">{kariyerSeviye}</div>
        </div>
      </div>
      <input className="search-input" placeholder="Ara..." />
      <button onClick={() => navigate('/career')}>Kariyerim</button>
      <button onClick={() => navigate('/sales')}>Satışlarım</button>
      <button>Franchise Ağı Yapısı</button>
      <button onClick={() => navigate('/happy-customers')}>Memnun Müşteri Takip Paneli</button>
      <button onClick={() => navigate('/sponsorships')}>Sponsorluk Takip Paneli</button>
      <button onClick={() => navigate('/team-panel')}>Takım Takip Paneli</button>
      <button onClick={() => navigate('/leadership-pools')}>Liderlik ve Başkanlık Takip Paneli</button>
      <button>Kar Paylaşım Promosyonu</button>
      <button>Global Seyahay Promosyonu</button>
      <button>Bilgi Bankası</button>
      <button>Muhasebe Takip Paneli</button>
      <button>Kişisel Bilgiler</button>
      <button className="logout-btn" onClick={handleLogout}>Çıkış Yap</button>
    </div>
  );
}

function Dashboard() {
  const [pools, setPools] = useState([]);
  const [news, setNews] = useState([]);
  const [promos, setPromos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://127.0.0.1:5001/api/pools')
      .then(res => res.json())
      .then(data => setPools(data));
    fetch('http://127.0.0.1:5001/api/news')
      .then(res => res.json())
      .then(data => setNews(data));
    fetch('http://127.0.0.1:5001/api/promotions')
      .then(res => res.json())
      .then(data => setPromos(data));
  }, []);

  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <button className="panel-btn" onClick={() => navigate('/siparis')}>Müşteri Sipariş Paneli</button>
        <div className="logo-section">
          <div className="logo">HOOWELL</div>
          <div className="slogan">INNOVATE YOUR LIFE</div>
        </div>
        <button className="panel-btn" onClick={() => navigate('/partner-register')}>İş Ortağı Kayıt Paneli</button>
      </div>
      <div className="dashboard-pools">
        {pools.map(pool => (
          <div className="pool-card" key={pool.id}>
            <div className="pool-title">{pool.name}</div>
            <div className="pool-date">Bitiş Tarihi: {pool.endDate}</div>
            <div className="pool-amount">₺{pool.amount.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-bottom">
        <div className="news-box">
          <div>
            <div style={{fontWeight:'bold', fontSize: '20px', marginBottom: 8}}>HABERLER</div>
            {news.map(item => (
              <div key={item.id} style={{marginBottom: 10}}>
                <div style={{fontWeight:'bold'}}>{item.title}</div>
                <div style={{fontSize:'15px'}}>{item.content}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="promo-box">
          <div>
            <div style={{fontWeight:'bold', fontSize: '20px', marginBottom: 8}}>PROMOSYONLAR</div>
            {promos.map(item => (
              <div key={item.id} style={{marginBottom: 10}}>
                <div style={{fontWeight:'bold'}}>{item.title}</div>
                <div style={{fontSize:'15px'}}>{item.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderPage() {
  const [tab, setTab] = useState('bireysel');
  const [successMsg, setSuccessMsg] = useState('');

  // Bireysel form state
  const [bireysel, setBireysel] = useState({
    isim: '',
    soyisim: '',
    tc: '',
    email: '',
    telefon: '',
    teslimatAdresi: '',
    faturaAdresi: '',
    urunBilgisi: '',
    referanslar: Array(10).fill({ adSoyad: '', telefon: '' })
  });

  // Kurumsal form state
  const [kurumsal, setKurumsal] = useState({
    firmaIsmi: '',
    faturaAdresi: '',
    vergiDairesi: '',
    vergiNo: '',
    yetkili: '',
    teslimatAdresi: '',
    email: '',
    telefon: '',
    referanslar: Array(10).fill({ adSoyad: '', telefon: '' })
  });

  // Bireysel input değişimi
  const handleBireyselChange = (e) => {
    setBireysel({ ...bireysel, [e.target.name]: e.target.value });
  };
  // Bireysel referans değişimi
  const handleBireyselRefChange = (idx, field, value) => {
    const newRefs = bireysel.referanslar.map((ref, i) =>
      i === idx ? { ...ref, [field]: value } : ref
    );
    setBireysel({ ...bireysel, referanslar: newRefs });
  };

  // Kurumsal input değişimi
  const handleKurumsalChange = (e) => {
    setKurumsal({ ...kurumsal, [e.target.name]: e.target.value });
  };
  // Kurumsal referans değişimi
  const handleKurumsalRefChange = (idx, field, value) => {
    const newRefs = kurumsal.referanslar.map((ref, i) =>
      i === idx ? { ...ref, [field]: value } : ref
    );
    setKurumsal({ ...kurumsal, referanslar: newRefs });
  };

  // Form submit
  const handleSubmit = async (type) => {
    setSuccessMsg('');
    const data = type === 'bireysel' ? bireysel : kurumsal;
    const payload = { ...data, type };
    try {
      const res = await fetch('http://127.0.0.1:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSuccessMsg('Sipariş başarıyla kaydedildi!');
      } else {
        setSuccessMsg('Bir hata oluştu.');
      }
    } catch {
      setSuccessMsg('Bağlantı hatası!');
    }
  };

  return (
    <div className="order-page">
      <div className="order-tabs">
        <button className={tab === 'bireysel' ? 'active' : ''} onClick={() => setTab('bireysel')}>BİREYSEL</button>
        <button className={tab === 'kurumsal' ? 'active' : ''} onClick={() => setTab('kurumsal')}>KURUMSAL</button>
      </div>
      <div className="order-form-area">
        {tab === 'bireysel' ? (
          <div className="order-form-content">
            <div className="order-form-left">
              <label>İsim<input name="isim" value={bireysel.isim} onChange={handleBireyselChange} /></label>
              <label>Soyisim<input name="soyisim" value={bireysel.soyisim} onChange={handleBireyselChange} /></label>
              <label>TC Kimlik No<input name="tc" value={bireysel.tc} onChange={handleBireyselChange} /></label>
              <label>E-mail<input name="email" value={bireysel.email} onChange={handleBireyselChange} /></label>
              <label>Telefon<input name="telefon" value={bireysel.telefon} onChange={handleBireyselChange} /></label>
              <label>Teslimat Adresi<input name="teslimatAdresi" value={bireysel.teslimatAdresi} onChange={handleBireyselChange} /></label>
              <label>Fatura Adresi<input name="faturaAdresi" value={bireysel.faturaAdresi} onChange={handleBireyselChange} /></label>
              <label>Ürün Bilgisi<input name="urunBilgisi" value={bireysel.urunBilgisi} onChange={handleBireyselChange} /></label>
              <button className="save-btn" type="button" onClick={() => handleSubmit('bireysel')}>Kaydet</button>
              {successMsg && <div className="success-msg">{successMsg}</div>}
            </div>
            <div className="order-form-right">
              <table className="ref-table">
                <thead>
                  <tr><th></th><th>Ad Soyad</th><th>Telefon</th></tr>
                </thead>
                <tbody>
                  {bireysel.referanslar.map((ref, i) => (
                    <tr key={i}>
                      <td><b>{i+1}. REFERANS</b></td>
                      <td><input value={ref.adSoyad} onChange={e => handleBireyselRefChange(i, 'adSoyad', e.target.value)} /></td>
                      <td><input value={ref.telefon} onChange={e => handleBireyselRefChange(i, 'telefon', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="order-form-content">
            <div className="order-form-left">
              <label>Firma İsmi<input name="firmaIsmi" value={kurumsal.firmaIsmi} onChange={handleKurumsalChange} /></label>
              <label>Fatura Adresi<input name="faturaAdresi" value={kurumsal.faturaAdresi} onChange={handleKurumsalChange} /></label>
              <label>Vergi Dairesi<input name="vergiDairesi" value={kurumsal.vergiDairesi} onChange={handleKurumsalChange} /></label>
              <label>Vergi No<input name="vergiNo" value={kurumsal.vergiNo} onChange={handleKurumsalChange} /></label>
              <label>Yetkili kişi Ad-Soyad<input name="yetkili" value={kurumsal.yetkili} onChange={handleKurumsalChange} /></label>
              <label>Teslimat Adresi<input name="teslimatAdresi" value={kurumsal.teslimatAdresi} onChange={handleKurumsalChange} /></label>
              <label>E-mail<input name="email" value={kurumsal.email} onChange={handleKurumsalChange} /></label>
              <label>Telefon<input name="telefon" value={kurumsal.telefon} onChange={handleKurumsalChange} /></label>
              <button className="save-btn" type="button" onClick={() => handleSubmit('kurumsal')}>Kaydet</button>
              {successMsg && <div className="success-msg">{successMsg}</div>}
            </div>
            <div className="order-form-right">
              <table className="ref-table">
                <thead>
                  <tr><th></th><th>Ad Soyad</th><th>Telefon</th></tr>
                </thead>
                <tbody>
                  {kurumsal.referanslar.map((ref, i) => (
                    <tr key={i}>
                      <td><b>{i+1}. REFERANS</b></td>
                      <td><input value={ref.adSoyad} onChange={e => handleKurumsalRefChange(i, 'adSoyad', e.target.value)} /></td>
                      <td><input value={ref.telefon} onChange={e => handleKurumsalRefChange(i, 'telefon', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PartnerRegisterPage() {
  const [tab, setTab] = useState('bireysel');
  const [success, setSuccess] = useState(null);

  // Bireysel form state
  const [bireysel, setBireysel] = useState({
    isim: '',
    soyisim: '',
    tc: '',
    email: '',
    telefon: '',
    teslimatAdresi: '',
    faturaAdresi: '',
    urunBilgisi: ''
  });
  // Kurumsal form state
  const [kurumsal, setKurumsal] = useState({
    firmaIsmi: '',
    faturaAdresi: '',
    vergiDairesi: '',
    vergiNo: '',
    yetkili: '',
    teslimatAdresi: '',
    email: '',
    telefon: ''
  });
  // Input değişimleri
  const handleBireyselChange = (e) => setBireysel({ ...bireysel, [e.target.name]: e.target.value });
  const handleKurumsalChange = (e) => setKurumsal({ ...kurumsal, [e.target.name]: e.target.value });
  // Submit
  const handleSubmit = async (type) => {
    setSuccess(null);
    const data = type === 'bireysel' ? bireysel : kurumsal;
    const payload = { ...data, type };
    try {
      const res = await fetch('http://127.0.0.1:5001/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.id && result.username && result.password) {
        setSuccess(result);
      } else {
        setSuccess({ error: 'Bir hata oluştu.' });
      }
    } catch {
      setSuccess({ error: 'Bağlantı hatası!' });
    }
  };
  return (
    <div className="order-page">
      <div className="order-tabs">
        <button className={tab === 'bireysel' ? 'active' : ''} onClick={() => setTab('bireysel')}>BİREYSEL</button>
        <button className={tab === 'kurumsal' ? 'active' : ''} onClick={() => setTab('kurumsal')}>KURUMSAL</button>
      </div>
      <div className="order-form-area">
        {success ? (
          <div className="success-msg">
            {success.error ? (
              <span>{success.error}</span>
            ) : (
              <>
                <div><b>Kayıt Başarılı!</b></div>
                <div>ID: {success.id}</div>
                <div>Kullanıcı Adı (E-posta): {success.username}</div>
                <div>Şifre: {success.password}</div>
              </>
            )}
          </div>
        ) : tab === 'bireysel' ? (
          <div className="order-form-content">
            <div className="order-form-left">
              <label>İsim<input name="isim" value={bireysel.isim} onChange={handleBireyselChange} /></label>
              <label>Soyisim<input name="soyisim" value={bireysel.soyisim} onChange={handleBireyselChange} /></label>
              <label>TC Kimlik No<input name="tc" value={bireysel.tc} onChange={handleBireyselChange} /></label>
              <label>E-mail<input name="email" value={bireysel.email} onChange={handleBireyselChange} /></label>
              <label>Telefon<input name="telefon" value={bireysel.telefon} onChange={handleBireyselChange} /></label>
              <label>Teslimat Adresi<input name="teslimatAdresi" value={bireysel.teslimatAdresi} onChange={handleBireyselChange} /></label>
              <label>Fatura Adresi<input name="faturaAdresi" value={bireysel.faturaAdresi} onChange={handleBireyselChange} /></label>
              <label>Ürün Bilgisi<input name="urunBilgisi" value={bireysel.urunBilgisi} onChange={handleBireyselChange} /></label>
              <button className="save-btn" type="button" onClick={() => handleSubmit('bireysel')}>Kaydet</button>
            </div>
          </div>
        ) : (
          <div className="order-form-content">
            <div className="order-form-left">
              <label>Firma İsmi<input name="firmaIsmi" value={kurumsal.firmaIsmi} onChange={handleKurumsalChange} /></label>
              <label>Fatura Adresi<input name="faturaAdresi" value={kurumsal.faturaAdresi} onChange={handleKurumsalChange} /></label>
              <label>Vergi Dairesi<input name="vergiDairesi" value={kurumsal.vergiDairesi} onChange={handleKurumsalChange} /></label>
              <label>Vergi No<input name="vergiNo" value={kurumsal.vergiNo} onChange={handleKurumsalChange} /></label>
              <label>Yetkili kişi Ad-Soyad<input name="yetkili" value={kurumsal.yetkili} onChange={handleKurumsalChange} /></label>
              <label>Teslimat Adresi<input name="teslimatAdresi" value={kurumsal.teslimatAdresi} onChange={handleKurumsalChange} /></label>
              <label>E-mail<input name="email" value={kurumsal.email} onChange={handleKurumsalChange} /></label>
              <label>Telefon<input name="telefon" value={kurumsal.telefon} onChange={handleKurumsalChange} /></label>
              <button className="save-btn" type="button" onClick={() => handleSubmit('kurumsal')}>Kaydet</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CareerPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('http://127.0.0.1:5001/api/career')
      .then(res => res.json())
      .then(setData);
  }, []);
  if (!data) return <div className="career-page">Yükleniyor...</div>;
  const percent = Math.min(1, data.yapilan / data.hedef);
  // Renkler
  const bronze = '#888';
  const red = '#b80000';
  const yellow = '#FFD700';
  return (
    <div className="career-page" style={{background:'#000', minHeight:'100vh', color:'#fff', padding:0, margin:0, fontFamily:'Segoe UI, sans-serif'}}>
      {/* Üst başlık ve logo */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'32px 48px 0 48px'}}>
        <div style={{fontSize:44, fontWeight:'bold', color:yellow, letterSpacing:2}}>KARİYER TAKİP PANELİ</div>
        <img src="https://i.ibb.co/3Ww2Qw2/hoowell-logo.png" alt="logo" style={{height:60}} />
      </div>
      {/* Kariyer seviyesi kutusu */}
      <div style={{display:'flex', justifyContent:'center', marginTop:24}}>
        <div style={{background:red, color:'#fff', borderRadius:20, padding:'22px 64px', fontSize:28, fontWeight:'bold', boxShadow:'0 2px 12px #0008', letterSpacing:1, textAlign:'center'}}>
          KARİYER SEVİYESİ<br/>{data.seviye}
        </div>
      </div>
      {/* Ciro Hedefi başlığı */}
      <div style={{fontSize:36, fontWeight:'bold', color:yellow, textAlign:'center', marginTop:36, letterSpacing:2}}>CİRO HEDEFİ</div>
      {/* Bar ve daire alanı */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'center', marginTop:36, gap:80}}>
        {/* Bar ve kutular */}
        <div>
          {/* Üst bar: YAPILAN - KALAN - ok */}
          <div style={{display:'flex', alignItems:'center'}}>
            <div style={{background:bronze, color:'#fff', fontWeight:'bold', fontSize:36, width:220, height:70, textAlign:'center', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', borderTopLeftRadius:8, borderBottomLeftRadius:8, marginRight:2, border:'2px solid #fff'}}>YAPILAN</div>
            <div style={{background:red, color:'#fff', fontWeight:'bold', fontSize:36, width:420, height:70, textAlign:'center', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', borderTopRightRadius:8, borderBottomRightRadius:8, marginLeft:2, border:'2px solid #fff', position:'relative'}}>
              KALAN
              {/* Ok şekli */}
              <div style={{position:'absolute', right:-38, top:'50%', transform:'translateY(-50%)'}}>
                <svg width="60" height="70"><polygon points="0,0 60,35 0,70" fill={red} stroke="#fff" strokeWidth="2" /></svg>
              </div>
            </div>
          </div>
          {/* Alt bar: yapılan/kalan puan */}
          <div style={{display:'flex', alignItems:'center', marginTop:0}}>
            <div style={{background:bronze, color:'#fff', fontWeight:'bold', fontSize:32, width:220, height:70, textAlign:'center', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', borderBottomLeftRadius:8, marginRight:2, border:'2px solid #fff'}}>
              {data.yapilan?.toLocaleString()}<br/>Puan
            </div>
            {/* Barın kalan kısmı kırmızı, yapılan kısmı bronze */}
            <div style={{position:'relative', width:480, height:70, display:'flex', alignItems:'center', borderBottomRightRadius:8, border:'2px solid #fff', overflow:'hidden', marginLeft:2}}>
              {/* Bronze (yapılan) bar */}
              <div style={{position:'absolute', left:0, top:0, height:'100%', width:`${percent*100}%`, background:bronze, zIndex:2, transition:'width 0.5s'}}></div>
              {/* Kırmızı (kalan) bar */}
              <div style={{position:'absolute', left:`${percent*100}%`, top:0, height:'100%', width:`${(1-percent)*100}%`, background:red, zIndex:1, transition:'width 0.5s'}}></div>
              {/* Yazı */}
              <div style={{position:'absolute', left:'60%', top:'50%', transform:'translate(-50%,-50%)', color:'#fff', fontWeight:'bold', fontSize:32, zIndex:3}}>{(data.kalan ?? 0).toLocaleString()} Puan</div>
            </div>
          </div>
        </div>
        {/* Daire */}
        <div style={{position:'relative', width:260, height:260, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <svg width="260" height="260">
            {/* Kırmızı tam halka */}
            <circle cx="130" cy="130" r="110" stroke={red} strokeWidth="28" fill={bronze} />
            {/* Bronze ilerleme */}
            <circle cx="130" cy="130" r="110" stroke={bronze} strokeWidth="28" fill="none" strokeDasharray={2*Math.PI*110} strokeDashoffset={(1-percent)*2*Math.PI*110} style={{transition:'stroke-dashoffset 0.5s'}} />
          </svg>
          <div style={{position:'absolute', left:0, top:0, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, fontWeight:'bold', color:'#fff', flexDirection:'column'}}>
            {(data.hedef ?? 0).toLocaleString()}<br/>PUAN
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesPage() {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetch('http://127.0.0.1:5001/api/sales', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(res => setData(res.sales || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="panel"><h2>Satışlarım</h2><div>Yükleniyor...</div></div>;
  if (!data || data.length === 0) return <div className="panel"><h2>Satışlarım</h2><div>Satış bulunamadı.</div></div>;

  return (
    <div className="panel sales-panel">
      <h2>Satışlarım</h2>
      <table className="sales-table">
        <thead>
          <tr>
            <th>Satılan Ürün</th>
            <th>Satış Tarihi</th>
            <th>Fiyat</th>
            <th>Komisyon Oranı</th>
            <th>Kazanılan Komisyon</th>
            <th>Müşteri Adı</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => (
            <tr key={i}>
              <td>{s.urun}</td>
              <td>{s.satisTarihi}</td>
              <td>{s.fiyat ? s.fiyat.toLocaleString() + ' $' : '-'}</td>
              <td>{s.oran}</td>
              <td>{s.bonus}</td>
              <td>{s.adSoyad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerHappinessPage() {
  const [data, setData] = React.useState([]);
  const [openIdx, setOpenIdx] = React.useState(null);
  React.useEffect(() => {
    fetch('http://127.0.0.1:5001/api/happy-customers')
      .then(res => res.json())
      .then(setData);
  }, []);
  return (
    <div className="panel happy-panel">
      <h2>Memnun Müşteri Takip Paneli</h2>
      <div className="desc" style={{marginBottom:18}}>
        Hoowell Memnun Müşteri Programı ile müşterilerinizin referanslarını ve ödül seviyelerini takip edebilirsiniz. Referanslar sütununda tıklayarak detayları görebilirsiniz.
      </div>
      <div className="happy-table-wrap">
        <table className="happy-table">
          <thead>
            <tr>
              <th>MÜŞTERİ</th>
              <th>SATIN ALMA TARİHİ</th>
              <th>SATIN ALDIĞI ÜRÜN</th>
              <th>1. SEVİYE ÖDÜL</th>
              <th>2. SEVİYE ÖDÜL</th>
              <th>3. SEVİYE ÖDÜL</th>
              <th>VERİLMİŞ REFERANSLAR</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={7}>Kayıt yok</td></tr>
            ) : data.map((row, i) => (
              <tr key={i}>
                <td>{row.musteri}</td>
                <td>{row.satinAlmaTarihi}</td>
                <td>{row.urun}</td>
                <td>{row.odul1}</td>
                <td>{row.odul2}</td>
                <td>{row.odul3}</td>
                <td>
                  {row.referanslar.length === 0 ? (
                    <span>Yok</span>
                  ) : (
                    <>
                      <button className="ref-list-btn" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                        Tıklayınca Liste
                      </button>
                      {openIdx === i && (
                        <div className="ref-list-popup">
                          <ul>
                            {row.referanslar.map((ref, j) => (
                              <li key={j}><b>{ref.adSoyad}</b> {ref.telefon && <span>({ref.telefon})</span>}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SponsorshipPanelPage() {
  const [data, setData] = React.useState([]);
  React.useEffect(() => {
    fetch('http://127.0.0.1:5001/api/sponsorships')
      .then(res => res.json())
      .then(setData);
  }, []);
  return (
    <div className="panel sponsorship-panel">
      <h2>Sponsorluk Takip Paneli</h2>
      <div className="desc" style={{marginBottom:18}}>
        ORTAKLIK BONUSU / 15.GÜNDE KAZANILIR. Sadece 1 adet şahsi satışınız varsa getirdiğiniz kişiler satış yaptıkça onların satışından aşağıdaki mekanikler ile düzenli olarak para kazanabilirsiniz. Detaylı mekanik için üstteki açıklamayı inceleyin.
      </div>
      <div className="sponsorship-table-wrap">
        <table className="sponsorship-table">
          <thead>
            <tr>
              <th>AD SOYADI</th>
              <th>BAŞLANGIÇ TARİHİ</th>
              <th>İLK SATIŞ AKTİVASYONU</th>
              <th>BRONZE SEVİYE %5..Max. 750 $</th>
              <th>SILVER SEVİYE %4..Max. 1.000 $</th>
              <th>GOLD SEVİYE %3..Max. 1.250 $</th>
              <th>STAR SEVİYE %2..Max. 1.500 $</th>
              <th>S.STAR SEVİYE %1..Max. 1.500 $</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={8}>Kayıt yok</td></tr>
            ) : data.map((row, i) => (
              <tr key={i}>
                <td>{row.adSoyad}</td>
                <td>{row.baslangicTarihi}</td>
                <td>{row.ilkSatisAktivasyonu}</td>
                <td className={row.bronze ? 'bonus-cell' : ''}>{row.bronze}</td>
                <td className={row.silver ? 'bonus-cell' : ''}>{row.silver}</td>
                <td className={row.gold ? 'bonus-cell' : ''}>{row.gold}</td>
                <td className={row.star ? 'bonus-cell' : ''}>{row.star}</td>
                <td className={row.sstar ? 'bonus-cell' : ''}>{row.sstar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamPanelPage() {
  const [tab, setTab] = React.useState('performance');
  const [data, setData] = React.useState([]);
  React.useEffect(() => {
    if (tab === 'performance') {
      fetch('http://127.0.0.1:5001/api/team-performance')
        .then(res => res.json())
        .then(setData);
    }
  }, [tab]);
  return (
    <div className="panel team-panel">
      <h2>Takım Takip Paneli</h2>
      <div className="team-tabs">
        <button className={tab==='performance' ? 'active' : ''} onClick={()=>setTab('performance')}>Takım Performans Raporları</button>
        <button className={tab==='franchise' ? 'active' : ''} onClick={()=>setTab('franchise')}>Franchise Ağı Komisyonları</button>
      </div>
      {tab === 'performance' ? (
        <div className="team-table-wrap">
          <table className="team-table">
            <thead>
              <tr>
                <th>#</th>
                <th>AD SOYAD</th>
                <th>YENİ İŞ ORTAĞI</th>
                <th>AYLIK CİRO</th>
                <th>SATILAN İYONİZER</th>
                <th>SATILAN HAVA ARITMASI</th>
                <th>TOPLANAN REFERANS</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7}>Kayıt yok</td></tr>
              ) : data.map((row, i) => (
                <tr key={i}>
                  <td>{i+1}</td>
                  <td>{row.adSoyad}</td>
                  <td>{row.yeniIsOrtaki}</td>
                  <td>{row.aylikCiro.toLocaleString()}</td>
                  <td>{row.satilanIonizer}</td>
                  <td>{row.satilanHava}</td>
                  <td>{row.toplananReferans}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="team-warning">Bu rapor her gün yenilenecektir.</div>
        </div>
      ) : (
        <div className="franchise-warning-panel">
          <div className="franchise-level-box">KARİYER SEVİYESİ<br/>BRONZE İŞ ORTAĞI... HAK EDİŞ: %0</div>
          <div className="franchise-info-box">
            FRANCHAISE AĞINIZDAN gelir elde etmeye başlamak için, lütfen kariyerinizi SILVER kariyerine yükseltin.<br/>
            Sizlere Kariyer Yolculuğunuzda başarılar diliyoruz.
          </div>
        </div>
      )}
    </div>
  );
}

function LeadershipPoolsPage() {
  const [tab, setTab] = React.useState('leadership');
  const [amounts, setAmounts] = React.useState({ leadershipPoolAmount: 0, presidentPoolAmount: 0 });
  const [career, setCareer] = React.useState(null);
  React.useEffect(() => {
    fetch('http://127.0.0.1:5001/api/pools-leadership')
      .then(res => res.json())
      .then(setAmounts);
    fetch('http://127.0.0.1:5001/api/career')
      .then(res => res.json())
      .then(setCareer);
  }, []);
  return (
    <div className="panel leadership-pools-panel">
      <h2>Liderlik ve Başkanlık Takip Paneli</h2>
      <div className="leadership-tabs">
        <button className={tab==='leadership' ? 'active' : ''} onClick={()=>setTab('leadership')}>Liderlik Havuzu</button>
        <button className={tab==='president' ? 'active' : ''} onClick={()=>setTab('president')}>Başkanlık Havuzu</button>
      </div>
      {tab === 'leadership' ? (
        <div className="pool-section">
          <div className="pool-amount-box">Bu ay Liderlik Havuzunda biriken para: <b>{amounts.leadershipPoolAmount.toLocaleString()} ₺</b></div>
          <div className="pool-warning-box">
            LİDERLİK HAVUZUNDAN gelir elde etmeye başlamak için, lütfen kariyerinizi STAR kariyerine yükseltin. Sizlere Kariyer Yolculuğunuzda başarılar diliyoruz.
          </div>
        </div>
      ) : (
        <div className="pool-section">
          <div className="pool-amount-box">Bu ay Başkanlık Havuzunda biriken para: <b>{amounts.presidentPoolAmount.toLocaleString()} ₺</b></div>
          <div className="pool-warning-box">
            BAŞKANLIK HAVUZUNDAN gelir elde etmeye başlamak için, lütfen kariyerinizi BAŞKANLIK TAKIMI kariyerine yükseltin. Sizlere Kariyer Yolculuğunuzda başarılar diliyoruz.
          </div>
        </div>
      )}
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        setError(data.error || 'Giriş başarısız');
      }
    } catch {
      setError('Bağlantı hatası');
    }
  };

  if (localStorage.getItem('token')) return <Navigate to="/" />;

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>İş Ortağı Girişi</h2>
        <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Giriş Yap</button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  );
}

function PrivateRoute() {
  return localStorage.getItem('token') ? <Outlet /> : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/*" element={
            <div className="app-container">
              <Sidebar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/siparis" element={<OrderPage />} />
                <Route path="/partner-register" element={<PartnerRegisterPage />} />
                <Route path="/career" element={<CareerPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/happy-customers" element={<CustomerHappinessPage />} />
                <Route path="/sponsorships" element={<SponsorshipPanelPage />} />
                <Route path="/team-panel" element={<TeamPanelPage />} />
                <Route path="/leadership-pools" element={<LeadershipPoolsPage />} />
              </Routes>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
