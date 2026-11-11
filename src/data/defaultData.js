export const INITIAL_POLYMERS = [
  { id: 'POL-01', code: 'PP', name: 'Polypropylene', category: 'Homopolymer / Copolymer', meltFlowIndex: '12 - 25', defaultForm: 'Afalan Karung / Emberan', description: 'Bahan karung semen, ember cor, perabot rumah tangga, furniture injeksi.' },
  { id: 'POL-02', code: 'HDPE', name: 'High Density Polyethylene', category: 'Rigid / Blow Grade', meltFlowIndex: '0.05 - 0.35', defaultForm: 'Botol Susu / Jerigen', description: 'Bahan botol oli, jerigen kimia, tutup galon, pipa spiral cor.' },
  { id: 'POL-03', code: 'LDPE', name: 'Low Density Polyethylene', category: 'Film / Flexible', meltFlowIndex: '1.5 - 4.0', defaultForm: 'Daun / Film Bening', description: 'Plastik wrapping pabrik, kantong kresek tebal, liner kemasan.' },
  { id: 'POL-04', code: 'LLDPE', name: 'Linear Low Density Polyethylene', category: 'Film / Rotomoulding', meltFlowIndex: '1.0 - 2.5', defaultForm: 'Bungkus Stretch Film', description: 'Pelapis stretch film, tangki toren air, karpet fleksibel.' },
  { id: 'POL-05', code: 'PET', name: 'Polyethylene Terephthalate', category: 'Polyester Flakes', meltFlowIndex: '0.7 - 0.85 IV', defaultForm: 'Botol Air Mineral Bening', description: 'Flakes bening pres botol air mineral, dakron serat benang sintesis.' },
  { id: 'POL-06', code: 'ABS', name: 'Acrylonitrile Butadiene Styrene', category: 'Engineering Polymer', meltFlowIndex: '8 - 18', defaultForm: 'Reject Casing Pabrik', description: 'Casing televisi, dashboard motor/mobil, komponen helm sni.' },
  { id: 'POL-07', code: 'HIPS', name: 'High Impact Polystyrene', category: 'Styrenics Sheet', meltFlowIndex: '3.0 - 6.0', defaultForm: 'Lembaran Tray Makanan', description: 'Tray makanan tebal, interior kulkas, gantungan baju pakaian.' },
  { id: 'POL-08', code: 'PVC', name: 'Polyvinyl Chloride', category: 'Rigid / Conduit', meltFlowIndex: 'K-Value 57-65', defaultForm: 'Pipa Paralon Reject', description: 'Pipa air wavin/rucika reject pabrik, talang air, profil lis pvc.' },
];

export const INITIAL_ADDITIVES = [
  { id: 'ADT-01', code: 'MB-BLK', name: 'Masterbatch Hitam Carbon Black (40%)', function: 'Pewarna Hitam Pekat', density: 1.25, unitPrice: 24000, description: 'Pigmen karbon konsentrat pekat untuk mewarnai pelet daur ulang jadi hitam doff mengkilap.' },
  { id: 'ADT-02', code: 'MB-WHT', name: 'Masterbatch Putih Titanium Dioxide (TiO2 60%)', function: 'Pewarna Putih Solid', density: 1.65, unitPrice: 32000, description: 'Pigmen putih pekat untuk pelet blow grade jerigen atau botol susu putih.' },
  { id: 'ADT-03', code: 'FLR-CA', name: 'Calcium Carbonate Filler (CaCO3 Coated 1250 Mesh)', function: 'Pengisi Bobot & Penstabil Dimensi', density: 1.80, unitPrice: 4200, description: 'Pengisi serbuk kalsium untuk menekan biaya formulasi dan menambah kekakuan part cetak.' },
  { id: 'ADT-04', code: 'OPT-BRT', name: 'Optical Brightener Agent (OB-1 Powder)', function: 'Pencerah Warna Flakes & Antikusam', density: 1.10, unitPrice: 85000, description: 'Bahan pencerah optik untuk menghilangkan warna kekuningan pada gilingan bening transparan.' },
  { id: 'ADT-05', code: 'CMP-MA', name: 'Compatibilizer (Maleic Anhydride PE-g-MA)', function: 'Perekat Kompatibilitas Campuran', density: 0.93, unitPrice: 48000, description: 'Aditif pengikat antar polimer (compatibilizer) saat blending PE dan PP agar tidak getas.' },
];

export const INITIAL_CONTACTS = [
  { id: 'CNT-01', code: 'SUP-001', name: 'Lapak Plastik Jaya Makmur', type: 'supplier', phone: '0812-3456-7890', address: 'Kawasan Pergudangan Romokalisari Blok B-12, Surabaya', pic: 'H. Sudirman', specNotes: 'Pengepul rutin afalan PP karung semen & emberan cor kotor' },
  { id: 'CNT-02', code: 'SUP-002', name: 'UD Sumber Rejeki Rongsok', type: 'supplier', phone: '0813-8899-1122', address: 'Jl. Raya Krian KM 28, Sidoarjo', pic: 'Bpk. Handoko', specNotes: 'Suplai botol HDPE susu putih dan jerigen oli bekas kuras' },
  { id: 'CNT-03', code: 'SUP-003', name: 'PT Dwijaya Scrap Polymer', type: 'supplier', phone: '0821-4567-9900', address: 'Kawasan Industri Jababeka 2 Blok C, Cikarang', pic: 'Ibu Ratna', specNotes: 'Reject pabrik otomotif & injeksi (ABS murni & PP Copolymer tanpa label)' },
  { id: 'CNT-04', code: 'CUS-001', name: 'PT Sinar Indah Injection Mold', type: 'customer', phone: '0811-9876-5432', address: 'Jl. Industri Manis IV No. 20, Tangerang', pic: 'Bpk. Johan Gunawan', specNotes: 'Butuh Biji PP Hitam MFI 12-16, bebas bintik arang untuk ember cor & pot bunga' },
  { id: 'CNT-05', code: 'CUS-002', name: 'CV Tri Bintang Plastindo', type: 'customer', phone: '0857-2233-4455', address: 'Kawasan Industri Terboyo Blok F, Semarang', pic: 'Bpk. Andreas', specNotes: 'Butuh Pelet HDPE Pipa Spiral MFI 0.2-0.5 warna abu-abu & hitam' },
  { id: 'CNT-06', code: 'CUS-003', name: 'PT Mitra Blow Moulding Pack', type: 'customer', phone: '0819-7766-3344', address: 'Ngoro Industrial Park (NIP), Mojokerto', pic: 'Ibu Linda Wijaya', specNotes: 'Butuh Pelet HDPE Blow Natural MFI 0.08 untuk jerigen pembersih lantai' },
];

export const INITIAL_COST_TARIFFS = {
  preProcessingRatePerKg: 1250, // Biaya listrik crusher, cuci drum sentrifugal, upah tenaga sortir manual, detergen
  extrusionRatePerKg: 1850      // Biaya listrik dinamo extruder, pemanas heater ceramic, screen mesh filter, operator pelletizer
};

export const INITIAL_RAW_PURCHASES = [
  {
    id: 'RAW-001',
    batchNo: 'REJ-PP-261101',
    date: '2026-11-01',
    supplierId: 'CNT-01',
    polymerId: 'POL-01',
    form: 'Afalan Karungan (Bale/Press)',
    colorBase: 'Warna Campur (Merah/Biru/Krem)',
    grossWeight: 5200,
    deductionKg: 208, // 4% potongan tali rafia & debu
    netWeight: 4992,
    pricePerKg: 8500,
    totalAmount: 42432000,
    status: 'Siap Giling',
    notes: 'Kotoran tali rafia dan tanah sekitar 4%. Karung padat press.'
  },
  {
    id: 'RAW-002',
    batchNo: 'REJ-HD-261102',
    date: '2026-11-02',
    supplierId: 'CNT-02',
    polymerId: 'POL-02',
    form: 'Botol / Jerigen Utuh',
    colorBase: 'Putih Susu / Natural',
    grossWeight: 3150,
    deductionKg: 157.5, // 5% air bilasan
    netWeight: 2992.5,
    pricePerKg: 9200,
    totalAmount: 27531000,
    status: 'Siap Giling',
    notes: 'Botol HDPE susu dan jerigen belum dicacah. Perlu buang tutup dan stiker label.'
  },
  {
    id: 'RAW-003',
    batchNo: 'REJ-PP-261103',
    date: '2026-11-04',
    supplierId: 'CNT-01',
    polymerId: 'POL-01',
    form: 'Reject Pabrik (Part Utuh)',
    colorBase: 'Bening Transparan',
    grossWeight: 4000,
    deductionKg: 100, // 2.5%
    netWeight: 3900,
    pricePerKg: 9800,
    totalAmount: 38220000,
    status: 'Siap Giling',
    notes: 'Gelas plastik & cup reject cetak pabrik, sangat bersih dan kering.'
  },
  {
    id: 'RAW-004',
    batchNo: 'REJ-LD-261104',
    date: '2026-11-05',
    supplierId: 'CNT-02',
    polymerId: 'POL-03',
    form: 'Daun / Film Bening',
    colorBase: 'Bening / Transparan',
    grossWeight: 2800,
    deductionKg: 168, // 6% tanah & lumpur lapak
    netWeight: 2632,
    pricePerKg: 8000,
    totalAmount: 21056000,
    status: 'Belum Sortir',
    notes: 'Plastik lembaran daun kotor bekas gudang, wajib pencucian drum ganda.'
  }
];

export const INITIAL_PRE_PROCESSINGS = [
  {
    id: 'PRC-001',
    processNo: 'PRC-2611-001',
    date: '2026-11-05',
    rawPurchaseId: 'RAW-001',
    polymerId: 'POL-01',
    outputFlakesBatchNo: 'FLK-PP-2611-01',
    flakesName: 'Cacahan Flakes PP Karung Bersih Kering',
    method: 'Wet Grinding + Hot Wash + Spin Drying',
    rawUsedKg: 3500,
    outputFlakesKg: 3290, // Timbangan hasil gilingan bersih
    wasteSortirKg: 210,   // Susut kotoran, label kertas, lumpur (6.0%)
    wastePercentage: 6.0,
    processCostRatePerKg: 1250,
    totalProcessCost: 4112500,
    totalStageCost: 33862500, // (3500 * 8500) + 4112500
    hppFlakesPerKg: 10292.55,
    operator: 'Supri & Regu Cuci Shift Pagi',
    status: 'Selesai',
    notes: 'Kadar air setelah sentrifugal spin dryer 0.7%. Lolos ayakan ukuran 10mm.'
  },
  {
    id: 'PRC-002',
    processNo: 'PRC-2611-002',
    date: '2026-11-06',
    rawPurchaseId: 'RAW-002',
    polymerId: 'POL-02',
    outputFlakesBatchNo: 'FLK-HD-2611-02',
    flakesName: 'Cacahan Flakes HDPE Botol Susu Putih',
    method: 'Crushing + Float-Sink Wash Tank + Dryer',
    rawUsedKg: 2000,
    outputFlakesKg: 1880,
    wasteSortirKg: 120, // 6% susut label plastik foil & minyak
    wastePercentage: 6.0,
    processCostRatePerKg: 1250,
    totalProcessCost: 2350000,
    totalStageCost: 20750000, // (2000 * 9200) + 2350000
    hppFlakesPerKg: 11037.23,
    operator: 'Herman & Tim Sortir Botol',
    status: 'Selesai',
    notes: 'Stiker label botol terbuang 120 Kg. Flakes putih cerah tanpa kontaminasi PVC.'
  },
  {
    id: 'PRC-003',
    processNo: 'PRC-2611-003',
    date: '2026-11-07',
    rawPurchaseId: 'RAW-003',
    polymerId: 'POL-01',
    outputFlakesBatchNo: 'FLK-PP-2611-03',
    flakesName: 'Cacahan Flakes PP Bening Kristal (Regrind)',
    method: 'Dry Grinding Direct (Tanpa Cuci Air)',
    rawUsedKg: 2500,
    outputFlakesKg: 2450,
    wasteSortirKg: 50, // 2% debu gilingan
    wastePercentage: 2.0,
    processCostRatePerKg: 850, // Dry grinding lebih hemat biaya
    totalProcessCost: 2082500,
    totalStageCost: 26582500, // (2500 * 9800) + 2082500
    hppFlakesPerKg: 10850.00,
    operator: 'Bambang (Operator Crusher 2)',
    status: 'Selesai',
    notes: 'Bahan reject pabrik bersih langsung giling kering ukuran 8 mm.'
  }
];

export const INITIAL_PRODUCTION_SPKS = [
  {
    id: 'SPK-001',
    spkNo: 'SPK-2611-101',
    date: '2026-11-08',
    mode: 'multi_blend',
    targetLotNo: 'LOT-PP-2611-01',
    targetProductName: 'Pelet Biji Plastik PP Hitam Compounding Injeksi Super',
    targetColor: 'Hitam Doff Mengkilap',
    polymerType: 'PP',
    // Komposisi resep blending dari Gudang Flakes & Gudang Aditif
    ingredients: [
      {
        sourceType: 'flakes',
        sourceId: 'PRC-001',
        batchCode: 'FLK-PP-2611-01',
        materialName: 'Flakes PP Karung Bersih',
        weightKg: 2000,
        unitCost: 10292.55,
        subtotalCost: 20585100
      },
      {
        sourceType: 'flakes',
        sourceId: 'PRC-003',
        batchCode: 'FLK-PP-2611-03',
        materialName: 'Flakes PP Bening Kristal',
        weightKg: 1000,
        unitCost: 10850.00,
        subtotalCost: 10850000
      },
      {
        sourceType: 'additive',
        sourceId: 'ADT-01',
        batchCode: 'MB-BLK',
        materialName: 'Masterbatch Hitam Carbon (40%)',
        weightKg: 60, // 1.95% rasio pewarna
        unitCost: 24000,
        subtotalCost: 1440000
      },
      {
        sourceType: 'additive',
        sourceId: 'ADT-03',
        batchCode: 'FLR-CA',
        materialName: 'Calcium Carbonate Filler (CaCO3)',
        weightKg: 100, // 3.16% filler kekakuan
        unitCost: 4200,
        subtotalCost: 420000
      }
    ],
    totalInputMixKg: 3160,
    totalMaterialCost: 33295100,
    // Parameter Ekstrusi & Pelletizing
    extruderLine: 'Extruder Double Degassing Line 2',
    barrelTempCelsius: 'Zone 1: 185°C | Zone 2: 205°C | Zone 3: 220°C | Die: 215°C',
    meshScreenSize: 'Mesh 80 Ganda (Hydraulic Screen Changer)',
    cuttingMethod: 'Strand Pelletizing (Tarik Untaian + Pisau Putar Rotari)',
    operator: 'Joko Widodo & Tim Shift 1',
    // Output Timbangan Nyata Karung Sak
    outputPelletKg: 3025, // Timbangan bersih hasil olah pelet
    wasteExtrusionKg: 135, // Susut kerak leleh, purging start, & gas degassing (4.27%)
    wastePercentage: 4.27,
    bagCount: 121, // 121 karung @ 25 Kg
    bagWeightKg: 25,
    extrusionRatePerKg: 1850,
    totalExtrusionCost: 5596250, // 3025 * 1850
    totalProductionCost: 38891350,
    hppFinalPelletPerKg: 12856.64,
    // QC & Lab Results
    qcResult: {
      mfiTest: '14.8 g/10min (230°C/2.16kg)',
      density: '0.94 g/cm3',
      porosity: 'Padat Bebas Rongga Gas',
      colorShade: 'Hitam Solid Doff (L: 12.1)',
      status: 'Lulus QC'
    },
    status: 'Selesai',
    notes: 'Hasil lelehan sangat homogen. Cocok untuk injeksi ember cor & part otomotif.'
  },
  {
    id: 'SPK-002',
    spkNo: 'SPK-2611-102',
    date: '2026-11-09',
    mode: 'single',
    targetLotNo: 'LOT-HD-2611-02',
    targetProductName: 'Pelet Biji Plastik HDPE Natural Blow Grade',
    targetColor: 'Natural Putih Susu',
    polymerType: 'HDPE',
    ingredients: [
      {
        sourceType: 'flakes',
        sourceId: 'PRC-002',
        batchCode: 'FLK-HD-2611-02',
        materialName: 'Flakes HDPE Botol Susu Putih',
        weightKg: 1500,
        unitCost: 11037.23,
        subtotalCost: 16555845
      },
      {
        sourceType: 'additive',
        sourceId: 'ADT-04',
        batchCode: 'OPT-BRT',
        materialName: 'Optical Brightener OB-1',
        weightKg: 1.5,
        unitCost: 85000,
        subtotalCost: 127500
      }
    ],
    totalInputMixKg: 1501.5,
    totalMaterialCost: 16683345,
    extruderLine: 'Extruder Single Screw Line 1',
    barrelTempCelsius: 'Zone 1: 175°C | Zone 2: 195°C | Die: 200°C',
    meshScreenSize: 'Mesh 100 Halus',
    cuttingMethod: 'Water-Ring Die-Face Cutting',
    operator: 'Supardi & Tim Shift 2',
    outputPelletKg: 1435,
    wasteExtrusionKg: 66.5, // 4.43%
    wastePercentage: 4.43,
    bagCount: 57,
    bagWeightKg: 25,
    extrusionRatePerKg: 1850,
    totalExtrusionCost: 2654750,
    totalProductionCost: 19338095,
    hppFinalPelletPerKg: 13476.02,
    qcResult: {
      mfiTest: '0.12 g/10min (190°C/2.16kg)',
      density: '0.95 g/cm3',
      porosity: 'Kering Padat Homogen',
      colorShade: 'Putih Natural Bening',
      status: 'Lulus QC'
    },
    status: 'Selesai',
    notes: 'Bahan jerigen kimia & botol oli. Lolos uji drop test botol 5 liter.'
  }
];

export const INITIAL_STOCK_ADJUSTMENTS = [
  {
    id: 'ADJ-001',
    date: '2026-11-10',
    targetLotNo: 'LOT-PP-2611-01',
    productName: 'Pelet Biji Plastik PP Hitam Compounding Injeksi Super',
    previousKg: 3025,
    adjustedKg: 3015,
    deltaKg: -10,
    reason: 'Koreksi sampling tara berat karung sak timbangan gudang',
    pic: 'Bambang (Kepala Gudang)'
  }
];

export const INITIAL_SALES_ORDERS = [
  {
    id: 'SLS-001',
    invoiceNo: 'INV-2611-001',
    doNo: 'DO-2611-001',
    date: '2026-11-10',
    customerId: 'CNT-04',
    customerName: 'PT Sinar Indah Injection Mold',
    targetLotNo: 'LOT-PP-2611-01',
    productName: 'Pelet Biji Plastik PP Hitam Compounding Injeksi Super',
    qtyKg: 1500, // 60 sak @ 25 kg
    bagCount: 60,
    pricePerKg: 15200,
    discount: 0,
    shippingCost: 350000,
    totalAmount: 23150000,
    cogsPerKg: 12856.64,
    totalCogs: 19284960,
    grossProfit: 3515040,
    marginPercent: 15.42,
    paymentStatus: 'Lunas',
    paymentAmount: 23150000,
    driverName: 'Pak Slamet',
    vehicleNo: 'B 9482 KDA (Colt Diesel Engkel)',
    notes: 'Pengiriman via Truk Bak Tertutup. Pembayaran lunas transfer BCA 100%.'
  }
];
