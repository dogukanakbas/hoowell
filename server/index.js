const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Siparişler için geçici bellek
const orders = [];

// İş ortakları için geçici bellek
const partners = [];

const JWT_SECRET = 'supersecretkey';

function generatePassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Token gerekli' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
}

// Dashboard havuzlar endpointi
app.get('/api/pools', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'LİDERLİK HAVUZU',
      endDate: '31.03.2025',
      amount: 12000
    },
    {
      id: 2,
      name: 'BAŞKANLIK HAVUZU',
      endDate: '31.03.2025',
      amount: 8000
    },
    {
      id: 3,
      name: 'KAR PAYLAŞIMI HAVUZU',
      endDate: '31.03.2025',
      amount: 5000
    }
  ]);
});

// Haberler endpointi
app.get('/api/news', (req, res) => {
  res.json([
    { id: 1, title: 'Yeni Dönem Başladı!', content: 'Mart ayı itibariyle yeni dönem başladı.' },
    { id: 2, title: 'Sistem Güncellemesi', content: 'Platformda performans iyileştirmeleri yapıldı.' }
  ]);
});

// Promosyonlar endpointi
app.get('/api/promotions', (req, res) => {
  res.json([
    { id: 1, title: 'Mart Ayı Promosyonu', content: 'Mart ayında %10 ek kazanç fırsatı!' },
    { id: 2, title: 'Yeni Üye Bonusu', content: 'Her yeni üye için ekstra bonus!' }
  ]);
});

// Login endpointi
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const partner = partners.find(p => p.email === email);
  if (!partner) return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
  if (!bcrypt.compareSync(password, partner.password)) return res.status(401).json({ error: 'Şifre hatalı' });
  const token = jwt.sign({ id: partner.id, email: partner.email }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, id: partner.id, email: partner.email });
});

// İş ortağı kayıt endpointi
app.post('/api/partners', (req, res) => {
  const data = req.body;
  const id = partners.length + 1;
  const password = generatePassword(8);
  const hashedPassword = bcrypt.hashSync(password, 8);
  const username = data.email;
  const partner = { id, username, password: hashedPassword, rawPassword: password, ...data, createdAt: new Date() };
  partners.push(partner);
  res.status(201).json({ id, username, password });
});

// Sipariş oluşturma endpointi (auth)
app.post('/api/orders', authMiddleware, (req, res) => {
  const order = req.body;
  order.id = orders.length + 1;
  order.createdAt = new Date();
  order.partnerId = req.user.id;
  orders.push(order);
  res.status(201).json({ success: true, id: order.id });
});

// Siparişleri sadece login olan iş ortağına göre dönen endpoint
app.get('/api/orders', authMiddleware, (req, res) => {
  const userOrders = orders.filter(o => o.partnerId === req.user.id);
  res.json(userOrders);
});

// Kariyerim örnek verisi endpointi
app.get('/api/career', authMiddleware, (req, res) => {
  res.json({
    seviye: 'Bronz İş Ortağı',
    seviyeKodu: 'bronze',
    yapilan: 4500,
    hedef: 25000,
    kalan: 20500
  });
});

// Satış Takip Paneli endpointi (gerçek veri ve komisyon hesaplama)
app.get('/api/sales', authMiddleware, (req, res) => {
  const now = new Date();
  // Login olan iş ortağını bul
  const partner = partners.find(p => p.id === req.user.id);
  // Komisyon oranı belirle
  let oran = 0.14;
  if (partner) {
    const seviye = (partner.kariyer || partner.seviye || '').toLowerCase();
    if (seviye.includes('silver')) oran = 0.16;
    else if (seviye.includes('gold')) oran = 0.17;
    else if (seviye.includes('star lider') && !seviye.includes('süper')) oran = 0.18;
    else if (seviye.includes('süper star')) oran = 0.19;
    else if (seviye.includes('başkan')) oran = 0.20;
  }
  // Sadece bu iş ortağının siparişleri
  const userOrders = orders.filter(order => order.partnerId === req.user.id);
  // Satışlar
  const sales = userOrders.map(order => {
    const satisTarihi = new Date(order.createdAt);
    const urun = order.urun || order.urunBilgisi || '-';
    // Ürün fiyatı
    let fiyat = 0;
    if (urun === 'Ürün 1' || urun === 'Alkali İyonizer') fiyat = 2500;
    else if (urun === 'Ürün 2' || urun === 'Hava Arıtma') fiyat = 1500;
    else if (order.fiyat) fiyat = Number(order.fiyat);
    // Komisyon
    const bonus = fiyat * oran;
    return {
      urun,
      satisTarihi: satisTarihi.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
      fiyat,
      oran: (oran * 100).toFixed(0) + ' %',
      bonus: bonus.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' $',
      adSoyad: (order.isim || '') + ' ' + (order.soyisim || '')
    };
  });
  res.json({ sales });
});

// Memnun Müşteri Takip Paneli endpointi
app.get('/api/happy-customers', (req, res) => {
  // Her sipariş bir müşteri satırı
  const result = orders.map(order => {
    // Müşteri adı
    const musteri = (order.isim || order.firmaIsmi || '-') + (order.soyisim ? ' ' + order.soyisim : '');
    // Satın alma tarihi
    const satinAlmaTarihi = order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    // Ürün
    const urun = order.urunBilgisi || '-';
    // Referanslar (bireysel/kurumsal ayrımı)
    let referanslar = [];
    if (order.referanslar && Array.isArray(order.referanslar)) {
      referanslar = order.referanslar.filter(r => r.adSoyad).map(r => ({ adSoyad: r.adSoyad, telefon: r.telefon }));
    }
    // Dummy ödül isimleri (örnek)
    const odul1 = referanslar[0]?.adSoyad || '';
    const odul2 = referanslar[1]?.adSoyad || '';
    const odul3 = referanslar[2]?.adSoyad || '';
    return {
      musteri,
      satinAlmaTarihi,
      urun,
      odul1,
      odul2,
      odul3,
      referanslar
    };
  });
  res.json(result);
});

// Sponsorluk Takip Paneli endpointi
app.get('/api/sponsorships', (req, res) => {
  // Dummy örnek: Her partner için örnek veri
  const result = partners.map(partner => {
    const adSoyad = (partner.isim || partner.firmaIsmi || '-') + (partner.soyisim ? ' ' + partner.soyisim : '');
    const baslangicTarihi = partner.createdAt ? new Date(partner.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    // Dummy: ilk satış aktivasyonu (örnek: email'de a harfi varsa EVET, yoksa HAYIR)
    const ilkSatisAktivasyonu = partner.email && partner.email.includes('a') ? 'EVET' : 'HAYIR';
    // Dummy bonuslar
    const bronze = adSoyad.length % 2 === 0 ? '750 $' : '';
    const silver = adSoyad.length % 3 === 0 ? '1.000 $' : '';
    const gold = adSoyad.length % 4 === 0 ? '1.250 $' : '';
    const star = adSoyad.length % 5 === 0 ? '1.500 $' : '';
    const sstar = adSoyad.length % 6 === 0 ? '1.500 $' : '';
    return {
      adSoyad,
      baslangicTarihi,
      ilkSatisAktivasyonu,
      bronze,
      silver,
      gold,
      star,
      sstar
    };
  });
  res.json(result);
});

// Takım Takip Paneli - Performans Raporları endpointi
app.get('/api/team-performance', (req, res) => {
  // Dummy 10 kişilik veri
  const now = new Date();
  const data = Array.from({length: 10}).map((_, i) => ({
    adSoyad: `Takım Üyesi ${i+1}`,
    yeniIsOrtaki: Math.floor(Math.random()*5),
    aylikCiro: Math.floor(Math.random()*10000),
    satilanIonizer: Math.floor(Math.random()*3),
    satilanHava: Math.floor(Math.random()*2),
    toplananReferans: Math.floor(Math.random()*10),
    eklenmeTarihi: new Date(now.getTime() - i*86400000) // her biri 1 gün önce eklenmiş gibi
  }));
  // Sıralama eklenmeTarihi'ne göre azalan
  data.sort((a, b) => b.eklenmeTarihi - a.eklenmeTarihi);
  res.json(data);
});

// İş ortağı detayını dönen endpoint
app.get('/api/partners/:id', authMiddleware, (req, res) => {
  const partner = partners.find(p => p.id === Number(req.params.id));
  if (!partner) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  // Şifreleri döndürme
  const { password, rawPassword, ...safePartner } = partner;
  res.json(safePartner);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 