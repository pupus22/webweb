export const INITIAL_PLASTIC_TYPES = [
  { id: 'PT-01', code: 'PP', name: 'Polypropylene', category: 'Homopolymer / Copolymer', defaultForm: 'Afalan Karungan', description: 'Bahan baku karung semen, ember, perabot rumah tangga' },
  { id: 'PT-02', code: 'HDPE', name: 'High Density Polyethylene', category: 'Rigid Container', defaultForm: 'Gilingan Kasar', description: 'Botol susu, tutup botol, jerigen, pipa PE' },
  { id: 'PT-03', code: 'LDPE', name: 'Low Density Polyethylene', category: 'Film / Flexible', defaultForm: 'Daun / Film', description: 'Plastik pembungkus bening, kantong kresek pabrik' },
  { id: 'PT-04', code: 'PET', name: 'Polyethylene Terephthalate', category: 'Polyester Flakes', defaultForm: 'Gilingan Kasar', description: 'Botol mineral bening, preform reject' },
  { id: 'PT-05', code: 'ABS', name: 'Acrylonitrile Butadiene Styrene', category: 'Engineering Plastic', defaultForm: 'Reject Pabrik', description: 'Casing elektronik, sparepart motor/mobil' },
  { id: 'PT-06', code: 'HIPS', name: 'High Impact Polystyrene', category: 'Styrenics', defaultForm: 'Lembaran Sheet', description: 'Tray makanan tebal, interior kulkas' },
  { id: 'PT-07', code: 'PVC', name: 'Polyvinyl Chloride', category: 'Rigid / Flexible', defaultForm: 'Pipa Reject', description: 'Pipa paralon, kabel selongsong, talang' },
  { id: 'PT-08', code: 'MB-BLK', name: 'Masterbatch Hitam Karbon', category: 'Additive & Colorant', defaultForm: 'Pelet Konsentrat', description: 'Pewarna hitam karbon pekat untuk compounding' },
  { id: 'PT-09', code: 'MB-WHT', name: 'Masterbatch Putih Titanium', category: 'Additive & Colorant', defaultForm: 'Pelet Konsentrat', description: 'Pewarna putih pekat TiO2 untuk biji blow' },
  { id: 'PT-10', code: 'CA-FLR', name: 'Calcium Carbonate Filler (CaCO3)', category: 'Filler Additive', defaultForm: 'Serbuk Padat', description: 'Pengisi bobot & kekakuan biji plastik compound' },
];

export const INITIAL_PLASTIC_FORMS = [
  { id: 'PF-01', name: 'Reject Pabrik (Part Utuh)', description: 'Barang gagal cetak/short shoot dari pabrik injeksi' },
  { id: 'PF-02', name: 'Afalan Karungan (Bale/Press)', description: 'Sortiran lapak dalam karung belum dicuci' },
  { id: 'PF-03', name: 'Gilingan Kasar (Crushed Flakes)', description: 'Hasil giling mesin crusher ukuran 8-12 mm' },
  { id: 'PF-04', name: 'Daun / Film Bening (Sheet/Film)', description: 'Lembaran plastik fleksibel tipis' },
  { id: 'PF-05', name: 'Monofilament / Serabut Tali', description: 'Sisa tali rafia atau jaring benang rajut' },
  { id: 'PF-06', name: 'Pelet Konsentrat (Additive)', description: 'Bahan pembantu aditif atau masterbatch' }
];

export const INITIAL_CONTACTS = [
  { id: 'C-01', code: 'SUP-001', name: 'Lapak Plastik Jaya Makmur', type: 'supplier', phone: '0812-3456-7890', address: 'Kawasan Pergudangan Romokalisari, Surabaya', pic: 'H. Sudirman', specNotes: 'Spesialis afalan PP karung dan emberan bersih' },
  { id: 'C-02', code: 'SUP-002', name: 'UD Sumber Rejeki Rongsok', type: 'supplier', phone: '0813-8899-1122', address: 'Jl. Raya Krian KM 28, Sidoarjo', pic: 'Bpk. Handoko', specNotes: 'Suplai rutin botol HDPE susu dan LDPE lembaran' },
  { id: 'C-03', code: 'SUP-003', name: 'PT Dwijaya Polymer Scrap', type: 'supplier', phone: '0821-4567-9900', address: 'Kawasan Industri Jababeka 2, Cikarang', pic: 'Ibu Ratna', specNotes: 'Reject pabrik otomotif (ABS & PP Copolymer murni)' },
  { id: 'C-04', code: 'CUS-001', name: 'PT Sinar Indah Injection', type: 'customer', phone: '0811-9876-5432', address: 'Jl. Industri Manis IV, Tangerang', pic: 'Bpk. Johan Gunawan', specNotes: 'MFI 12-18, Mesh filter 80, warna hitam doff untuk ember cor' },
  { id: 'C-05', code: 'CUS-002', name: 'CV Tri Bintang Plastik', type: 'customer', phone: '0857-2233-4455', address: 'Kawasan Industri Terboyo, Semarang', pic: 'Bpk. Andreas', specNotes: 'Biji PP daur ulang warna abu-abu & hitam untuk pot tanaman' },
  { id: 'C-06', code: 'CUS-003', name: 'PT Mitra Blow Moulding', type: 'customer', phone: '0819-7766-3344', address: 'Ngoro Industrial Park (NIP), Mojokerto', pic: 'Ibu Linda Wijaya', specNotes: 'HDPE Blow Natural, MFI 0.05-0.1 untuk jerigen kimia' },
];

export const INITIAL_COST_COMPONENTS = [
  { id: 'CC-01', name: 'Listrik Mesin Pelletizing / Extruder', category: 'electricity', ratePerKg: 850, unit: 'Rp/Kg', notes: 'Beban daya pemanas heater & motor dinamo extruder' },
  { id: 'CC-02', name: 'Upah Tenaga Cuci, Sortir & Operator', category: 'labor', ratePerKg: 550, unit: 'Rp/Kg', notes: 'Gaji borongan pilah bahan kotor dan operator mesin pelet' },
  { id: 'CC-03', name: 'Perawatan Mesin, Pisau & Screen Kasa', category: 'maintenance', ratePerKg: 200, unit: 'Rp/Kg', notes: 'Penggantian mesh filter kasa kawat & asah pisau crusher' },
  { id: 'CC-04', name: 'Air, Pengolahan Limbah & Detergen', category: 'overhead', ratePerKg: 150, unit: 'Rp/Kg', notes: 'Sirkulasi kolam cuci dan chemical pembersih lemak' },
];

export const INITIAL_PURCHASES = [
  {
    id: 'PB-001',
    invoiceNo: 'NOTA-SUP-081',
    batchNo: 'RAW-PP-261101',
    date: '2026-11-01',
    supplierId: 'C-01',
    plasticTypeId: 'PT-01',
    form: 'Afalan Karungan (Bale/Press)',
    grossWeight: 5200,
    tareOrDeductionPercent: 4,
    deductionWeight: 208,
    netWeight: 4992,
    pricePerKg: 8500,
    totalAmount: 42432000,
    status: 'Siap Blending',
    notes: 'Kotoran tanah dan tali rafia sekitar 4%. Warna campur merah/biru.'
  },
  {
    id: 'PB-002',
    invoiceNo: 'NOTA-SUP-084',
    batchNo: 'RAW-HD-261102',
    date: '2026-11-02',
    supplierId: 'C-02',
    plasticTypeId: 'PT-02',
    form: 'Gilingan Kasar (Crushed Flakes)',
    grossWeight: 3150,
    tareOrDeductionPercent: 5,
    deductionWeight: 157.5,
    netWeight: 2992.5,
    pricePerKg: 9200,
    totalAmount: 27531000,
    status: 'Siap Blending',
    notes: 'Flakes botol HDPE susu putih, kadar air 3%, sudah digiling bersih.'
  },
  {
    id: 'PB-003',
    invoiceNo: 'INV-DWJ-441',
    batchNo: 'RAW-MB-261103',
    date: '2026-11-03',
    supplierId: 'C-03',
    plasticTypeId: 'PT-08',
    form: 'Pelet Konsentrat (Additive)',
    grossWeight: 250,
    tareOrDeductionPercent: 0,
    deductionWeight: 0,
    netWeight: 250,
    pricePerKg: 24000,
    totalAmount: 6000000,
    status: 'Siap Blending',
    notes: 'Karbon black masterbatch grade pekat 40% carbon content.'
  },
  {
    id: 'PB-004',
    invoiceNo: 'NOTA-SUP-090',
    batchNo: 'RAW-PP-261104',
    date: '2026-11-04',
    supplierId: 'C-01',
    plasticTypeId: 'PT-01',
    form: 'Gilingan Kasar (Crushed Flakes)',
    grossWeight: 4000,
    tareOrDeductionPercent: 2.5,
    deductionWeight: 100,
    netWeight: 3900,
    pricePerKg: 9800,
    totalAmount: 38220000,
    status: 'Siap Blending',
    notes: 'PP bening gelas air mineral, sangat bersih langsung ayak.'
  },
  {
    id: 'PB-005',
    invoiceNo: 'NOTA-SUP-099',
    batchNo: 'RAW-LD-261105',
    date: '2026-11-05',
    supplierId: 'C-02',
    plasticTypeId: 'PT-03',
    form: 'Daun / Film Bening (Sheet/Film)',
    grossWeight: 2800,
    tareOrDeductionPercent: 6,
    deductionWeight: 168,
    netWeight: 2632,
    pricePerKg: 8000,
    totalAmount: 21056000,
    status: 'Proses Cuci/Giling',
    notes: 'Sedang tahap cuci drum sentrifugal dan perajangan cutter.'
  }
];

export const INITIAL_PRODUCTIONS = [
  {
    id: 'PRD-001',
    spkNo: 'SPK-2611-101',
    date: '2026-11-06',
    mode: 'multi_blend',
    targetProductName: 'Pelet Biji Plastik PP Hitam Injection Grade',
    targetColor: 'Hitam Doff',
    targetType: 'PP',
    inputs: [
      {
        purchaseBatchId: 'PB-001',
        plasticTypeId: 'PT-01',
        batchNo: 'RAW-PP-261101',
        materialName: 'PP Afalan Karungan',
        weightUsedKg: 2500,
        costPerKg: 8500,
        subtotalCost: 21250000
      },
      {
        purchaseBatchId: 'PB-004',
        plasticTypeId: 'PT-01',
        batchNo: 'RAW-PP-261104',
        materialName: 'PP Gilingan Kasar Bening',
        weightUsedKg: 1600,
        costPerKg: 9800,
        subtotalCost: 15680000
      },
      {
        purchaseBatchId: 'PB-003',
        plasticTypeId: 'PT-08',
        batchNo: 'RAW-MB-261103',
        materialName: 'Masterbatch Hitam Karbon',
        weightUsedKg: 100,
        costPerKg: 24000,
        subtotalCost: 2400000
      }
    ],
    totalInputKg: 4200,
    totalMaterialCost: 39330000,
    operationalCostPerKg: 1750,
    totalOperationalCost: 7000000,
    totalProductionCost: 46330000,
    outputKg: 4000,
    bagCount: 160,
    bagWeightKg: 25,
    shrinkageKg: 200,
    shrinkagePercent: 4.76,
    hppPerKg: 11582.5,
    operator: 'Joko & Tim Shift 1',
    machine: 'Extruder Double Degassing Line 2',
    status: 'Selesai',
    notes: 'Kadar leleh MFI 14.5. Screen filter 80 mesh diganti 2 kali.'
  },
  {
    id: 'PRD-002',
    spkNo: 'SPK-2611-102',
    date: '2026-11-08',
    mode: 'single',
    targetProductName: 'Pelet Biji Plastik HDPE Natural Blow Grade',
    targetColor: 'Natural / Putih Susu',
    targetType: 'HDPE',
    inputs: [
      {
        purchaseBatchId: 'PB-002',
        plasticTypeId: 'PT-02',
        batchNo: 'RAW-HD-261102',
        materialName: 'HDPE Flakes Botol Susu',
        weightUsedKg: 1500,
        costPerKg: 9200,
        subtotalCost: 13800000
      }
    ],
    totalInputKg: 1500,
    totalMaterialCost: 13800000,
    operationalCostPerKg: 1750,
    totalOperationalCost: 2502500,
    totalProductionCost: 16302500,
    outputKg: 1430,
    bagCount: 57,
    bagWeightKg: 25,
    shrinkageKg: 70,
    shrinkagePercent: 4.67,
    hppPerKg: 11400.35,
    operator: 'Supardi & Tim Shift 2',
    machine: 'Pelletizer Line 1',
    status: 'Selesai',
    notes: 'Kualitas bening natural, sangat minim bau dan bebas bintik.'
  }
];

export const INITIAL_STOCK_ADJUSTMENTS = [
  {
    id: 'ADJ-001',
    date: '2026-11-09',
    batchNo: 'SPK-2611-101',
    productName: 'Pelet Biji Plastik PP Hitam Injection Grade',
    previousKg: 4000,
    adjustedKg: 3990,
    deltaKg: -10,
    reason: 'Koreksi timbangan sampling tara karung sak dan susut dingin',
    adjustedBy: 'Kepala Gudang (Bambang)'
  }
];

export const INITIAL_SALES = [
  {
    id: 'SLS-001',
    invoiceNo: 'INV-SLS-2611-001',
    doNo: 'SJ-2611-001',
    date: '2026-11-10',
    customerId: 'C-04',
    batchNo: 'SPK-2611-101',
    productName: 'Pelet Biji Plastik PP Hitam Injection Grade',
    qtyKg: 2000,
    bagCount: 80,
    pricePerKg: 14500,
    discount: 0,
    shippingCost: 350000,
    totalAmount: 29350000,
    cogsPerKg: 11582.5,
    totalCogs: 23165000,
    grossProfit: 5835000,
    paymentStatus: 'Lunas',
    paymentAmount: 29350000,
    driverName: 'Pak Slamet',
    vehicleNo: 'B 9482 KDA',
    notes: 'Pengiriman via Truk Colt Diesel bak tertutup, lunas via transfer BCA.'
  }
];
