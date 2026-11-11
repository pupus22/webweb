/**
 * Multi-Stage End-to-End Recalibration Engine for PolyComp ERP.
 * Cascades price & weight edits from Raw Purchases -> Flakes Pre-Processing -> Blending/Extrusion -> FG Pellets -> Sales.
 */

export function recalculateERP(database) {
  const {
    polymers = [],
    additives = [],
    contacts = [],
    costTariffs = { preProcessingRatePerKg: 1250, extrusionRatePerKg: 1850 },
    rawPurchases = [],
    preProcessings = [],
    productionSPKs = [],
    stockAdjustments = [],
    salesOrders = []
  } = database;

  // 1. Dictionaries for fast lookup
  const polymerMap = new Map();
  polymers.forEach(p => polymerMap.set(p.id, p));

  const contactMap = new Map();
  contacts.forEach(c => contactMap.set(c.id, c));

  const additiveMap = new Map();
  additives.forEach(a => additiveMap.set(a.id, a));

  // 2. Compute Raw Material usage in Tahap 2 (Pre-Processing / Giling & Cuci)
  const rawUsageMap = new Map(); // rawPurchaseId -> totalKgUsed
  preProcessings.forEach(prc => {
    if (prc.rawPurchaseId) {
      const cur = rawUsageMap.get(prc.rawPurchaseId) || 0;
      rawUsageMap.set(prc.rawPurchaseId, cur + Number(prc.rawUsedKg || 0));
    }
  });

  // 3. Tahap 1: Recalibrate Inbound Raw Purchases
  const recalibratedRawPurchases = rawPurchases.map(r => {
    const gross = Number(r.grossWeight || 0);
    const deduction = Number(r.deductionKg || 0);
    const netWeight = Math.max(0, gross - deduction);
    const pricePerKg = Number(r.pricePerKg || 0);
    const totalAmount = netWeight * pricePerKg;

    const usedKg = rawUsageMap.get(r.id) || 0;
    const remainingKg = Math.max(0, netWeight - usedKg);
    const stockStatus = remainingKg <= 0 ? 'Habis' : (remainingKg < netWeight * 0.25 ? 'Menipis' : 'Tersedia');

    const polymer = polymerMap.get(r.polymerId);
    const supplier = contactMap.get(r.supplierId);

    return {
      ...r,
      grossWeight: gross,
      deductionKg: deduction,
      netWeight,
      pricePerKg,
      totalAmount,
      usedKg,
      remainingKg,
      stockStatus,
      polymerCode: polymer ? polymer.code : 'PLASTIC',
      polymerName: polymer ? `${polymer.code} - ${polymer.name}` : r.polymerId,
      supplierName: supplier ? supplier.name : r.supplierId,
      assetValue: remainingKg * pricePerKg
    };
  });

  const rawPurchaseMap = new Map();
  recalibratedRawPurchases.forEach(r => rawPurchaseMap.set(r.id, r));

  // 4. Compute Flakes Usage in Tahap 3 (Blending & Ekstrusi)
  const flakesUsageMap = new Map(); // preProcessingId -> totalKgUsed
  productionSPKs.forEach(spk => {
    if (Array.isArray(spk.ingredients)) {
      spk.ingredients.forEach(ing => {
        if (ing.sourceType === 'flakes' && ing.sourceId) {
          const cur = flakesUsageMap.get(ing.sourceId) || 0;
          flakesUsageMap.set(ing.sourceId, cur + Number(ing.weightKg || 0));
        }
      });
    }
  });

  // 5. Tahap 2: Recalibrate Pre-Processing (Sortir, Crushing/Giling, Cuci & Drying)
  const recalibratedPreProcessings = preProcessings.map(prc => {
    const matchedRaw = rawPurchaseMap.get(prc.rawPurchaseId);
    // Live purchase price cascading
    const liveRawPricePerKg = matchedRaw ? matchedRaw.pricePerKg : Number(prc.rawUnitPrice || 8500);
    const rawUsedKg = Number(prc.rawUsedKg || 0);
    const rawMaterialCost = rawUsedKg * liveRawPricePerKg;

    const outputFlakesKg = Number(prc.outputFlakesKg || 0);
    const ratePerKg = Number(prc.processCostRatePerKg || costTariffs.preProcessingRatePerKg || 1250);
    const totalProcessCost = outputFlakesKg * ratePerKg;
    const totalStageCost = rawMaterialCost + totalProcessCost;

    const wasteSortirKg = Math.max(0, rawUsedKg - outputFlakesKg);
    const wastePercentage = rawUsedKg > 0 ? (wasteSortirKg / rawUsedKg) * 100 : 0;
    const hppFlakesPerKg = outputFlakesKg > 0 ? (totalStageCost / outputFlakesKg) : 0;

    const usedInExtrusionKg = flakesUsageMap.get(prc.id) || 0;
    const remainingFlakesKg = Math.max(0, outputFlakesKg - usedInExtrusionKg);
    const flakesStockStatus = remainingFlakesKg <= 0 ? 'Habis Terolah' : (remainingFlakesKg < 300 ? 'Flakes Menipis' : 'Siap Blending');

    const polymer = polymerMap.get(prc.polymerId) || (matchedRaw ? polymerMap.get(matchedRaw.polymerId) : null);

    return {
      ...prc,
      rawUsedKg,
      rawUnitPrice: liveRawPricePerKg,
      rawMaterialCost,
      outputFlakesKg,
      processCostRatePerKg: ratePerKg,
      totalProcessCost,
      totalStageCost,
      wasteSortirKg,
      wastePercentage,
      hppFlakesPerKg,
      usedInExtrusionKg,
      remainingFlakesKg,
      flakesStockStatus,
      rawBatchNo: matchedRaw ? matchedRaw.batchNo : '-',
      polymerCode: polymer ? polymer.code : 'PLASTIC',
      assetValue: remainingFlakesKg * hppFlakesPerKg
    };
  });

  const preProcessingMap = new Map();
  recalibratedPreProcessings.forEach(p => preProcessingMap.set(p.id, p));

  // 6. Tahap 3: Recalibrate Blending & Extrusion SPKs
  const recalibratedProductionSPKs = productionSPKs.map(spk => {
    let computedInputKg = 0;
    let computedMaterialCost = 0;

    const recalibratedIngredients = (spk.ingredients || []).map(ing => {
      let liveUnitCost = Number(ing.unitCost || 0);
      let materialName = ing.materialName || 'Material';
      let batchCode = ing.batchCode || '';

      if (ing.sourceType === 'flakes') {
        const matchedFlakes = preProcessingMap.get(ing.sourceId);
        if (matchedFlakes) {
          liveUnitCost = matchedFlakes.hppFlakesPerKg;
          materialName = matchedFlakes.flakesName;
          batchCode = matchedFlakes.outputFlakesBatchNo;
        }
      } else if (ing.sourceType === 'additive') {
        const matchedAdditive = additiveMap.get(ing.sourceId);
        if (matchedAdditive) {
          liveUnitCost = Number(matchedAdditive.unitPrice || ing.unitCost);
          materialName = matchedAdditive.name;
          batchCode = matchedAdditive.code;
        }
      }

      const weightKg = Number(ing.weightKg || 0);
      const subtotalCost = weightKg * liveUnitCost;

      computedInputKg += weightKg;
      computedMaterialCost += subtotalCost;

      return {
        ...ing,
        materialName,
        batchCode,
        weightKg,
        unitCost: liveUnitCost,
        subtotalCost
      };
    });

    const totalInputMixKg = computedInputKg > 0 ? computedInputKg : Number(spk.totalInputMixKg || 0);
    const totalMaterialCost = computedMaterialCost > 0 ? computedMaterialCost : Number(spk.totalMaterialCost || 0);

    const outputPelletKg = Number(spk.outputPelletKg || 0);
    const extrusionRate = Number(spk.extrusionRatePerKg || costTariffs.extrusionRatePerKg || 1850);
    const totalExtrusionCost = outputPelletKg * extrusionRate;
    const totalProductionCost = totalMaterialCost + totalExtrusionCost;

    const wasteExtrusionKg = Math.max(0, totalInputMixKg - outputPelletKg);
    const wastePercentage = totalInputMixKg > 0 ? (wasteExtrusionKg / totalInputMixKg) * 100 : 0;
    const hppFinalPelletPerKg = outputPelletKg > 0 ? (totalProductionCost / outputPelletKg) : 0;
    const bagWeight = Number(spk.bagWeightKg || 25);
    const bagCount = bagWeight > 0 ? Math.floor(outputPelletKg / bagWeight) : 0;

    return {
      ...spk,
      ingredients: recalibratedIngredients,
      totalInputMixKg,
      totalMaterialCost,
      extrusionRatePerKg: extrusionRate,
      totalExtrusionCost,
      totalProductionCost,
      outputPelletKg,
      wasteExtrusionKg,
      wastePercentage,
      hppFinalPelletPerKg,
      bagWeightKg: bagWeight,
      bagCount
    };
  });

  const spkByLotMap = new Map();
  recalibratedProductionSPKs.forEach(spk => {
    if (spk.targetLotNo) spkByLotMap.set(spk.targetLotNo, spk);
    spkByLotMap.set(spk.spkNo, spk);
  });

  // 7. Tahap 4: Compute FG Pellet Stock Usage from Sales & Opname
  const salesByLotMap = new Map();
  salesOrders.forEach(so => {
    if (so.targetLotNo) {
      const cur = salesByLotMap.get(so.targetLotNo) || 0;
      salesByLotMap.set(so.targetLotNo, cur + Number(so.qtyKg || 0));
    }
  });

  const adjustmentsByLotMap = new Map();
  stockAdjustments.forEach(adj => {
    if (adj.targetLotNo) {
      const cur = adjustmentsByLotMap.get(adj.targetLotNo) || 0;
      adjustmentsByLotMap.set(adj.targetLotNo, cur + Number(adj.deltaKg || 0));
    }
  });

  // Build Finished Goods Pellet Inventory List
  const finishedGoodsPelletInventory = recalibratedProductionSPKs.map(spk => {
    const lotKey = spk.targetLotNo || spk.spkNo;
    const soldKg = salesByLotMap.get(lotKey) || 0;
    const adjustmentKg = adjustmentsByLotMap.get(lotKey) || 0;
    const currentStockKg = Math.max(0, spk.outputPelletKg + adjustmentKg - soldKg);
    const totalAssetValue = currentStockKg * spk.hppFinalPelletPerKg;
    const bagCapacity = Number(spk.bagWeightKg || 25);
    const availableBags = bagCapacity > 0 ? Math.floor(currentStockKg / bagCapacity) : 0;
    const sisaKg = currentStockKg % bagCapacity;

    const stockStatus = currentStockKg <= 0 ? 'Habis Terjual' : (currentStockKg < 250 ? 'Stok Kritis' : 'Siap Kirim');

    return {
      lotNo: lotKey,
      spkNo: spk.spkNo,
      productName: spk.targetProductName,
      targetColor: spk.targetColor,
      polymerType: spk.polymerType,
      qcStatus: spk.qcResult?.status || 'Lulus QC',
      mfi: spk.qcResult?.mfiTest || '-',
      productionDate: spk.date,
      originalOutputKg: spk.outputPelletKg,
      adjustmentKg,
      soldKg,
      currentStockKg,
      availableBags,
      sisaKg,
      bagWeightKg: bagCapacity,
      hppFinalPelletPerKg: spk.hppFinalPelletPerKg,
      totalAssetValue,
      stockStatus
    };
  });

  const fgPelletMap = new Map();
  finishedGoodsPelletInventory.forEach(fg => fgPelletMap.set(fg.lotNo, fg));

  // 8. Tahap 5: Recalibrate Sales Orders (Margin tied to Live Pellet HPP)
  const recalibratedSalesOrders = salesOrders.map(so => {
    const matchedPellet = fgPelletMap.get(so.targetLotNo);
    const liveCogsPerKg = matchedPellet ? matchedPellet.hppFinalPelletPerKg : Number(so.cogsPerKg || 0);

    const qtyKg = Number(so.qtyKg || 0);
    const pricePerKg = Number(so.pricePerKg || 0);
    const discount = Number(so.discount || 0);
    const shippingCost = Number(so.shippingCost || 0);

    const subtotal = qtyKg * pricePerKg;
    const netRevenue = Math.max(0, subtotal - discount);
    const totalAmount = netRevenue + shippingCost;
    const totalCogs = qtyKg * liveCogsPerKg;
    const grossProfit = netRevenue - totalCogs;
    const marginPercent = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    const customer = contactMap.get(so.customerId);
    const bagCount = Number(so.bagCount || Math.floor(qtyKg / 25));

    return {
      ...so,
      qtyKg,
      bagCount,
      pricePerKg,
      discount,
      shippingCost,
      subtotal,
      netRevenue,
      totalAmount,
      cogsPerKg: liveCogsPerKg,
      totalCogs,
      grossProfit,
      marginPercent,
      customerName: customer ? customer.name : (so.customerName || so.customerId),
      customerPhone: customer ? customer.phone : '',
      customerAddress: customer ? customer.address : ''
    };
  });

  // 9. Aggregate Pipeline Analytics & KPIs
  // Buffer 1: Raw Reject
  const rawStockKg = recalibratedRawPurchases.reduce((acc, r) => acc + r.remainingKg, 0);
  const rawStockValue = recalibratedRawPurchases.reduce((acc, r) => acc + r.assetValue, 0);

  // Buffer 2: Clean Flakes
  const flakesStockKg = recalibratedPreProcessings.reduce((acc, p) => acc + p.remainingFlakesKg, 0);
  const flakesStockValue = recalibratedPreProcessings.reduce((acc, p) => acc + p.assetValue, 0);

  // Buffer 3: FG Pellets
  const pelletStockKg = finishedGoodsPelletInventory.reduce((acc, fg) => acc + fg.currentStockKg, 0);
  const pelletStockValue = finishedGoodsPelletInventory.reduce((acc, fg) => acc + fg.totalAssetValue, 0);

  // Multi-tier Shrinkage
  const totalRawInputStage1 = recalibratedPreProcessings.reduce((acc, p) => acc + p.rawUsedKg, 0);
  const totalWasteStage1 = recalibratedPreProcessings.reduce((acc, p) => acc + p.wasteSortirKg, 0);
  const avgSusutStage1 = totalRawInputStage1 > 0 ? (totalWasteStage1 / totalRawInputStage1) * 100 : 0;

  const totalInputStage2 = recalibratedProductionSPKs.reduce((acc, spk) => acc + spk.totalInputMixKg, 0);
  const totalWasteStage2 = recalibratedProductionSPKs.reduce((acc, spk) => acc + spk.wasteExtrusionKg, 0);
  const avgSusutStage2 = totalInputStage2 > 0 ? (totalWasteStage2 / totalInputStage2) * 100 : 0;

  // Sales & Profit
  const totalRevenue = recalibratedSalesOrders.reduce((acc, so) => acc + so.netRevenue, 0);
  const totalGrossProfit = recalibratedSalesOrders.reduce((acc, so) => acc + so.grossProfit, 0);
  const avgProfitMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

  const totalFactoryAssetValuation = rawStockValue + flakesStockValue + pelletStockValue;

  return {
    recalibratedRawPurchases,
    recalibratedPreProcessings,
    recalibratedProductionSPKs,
    finishedGoodsPelletInventory,
    recalibratedSalesOrders,
    kpis: {
      rawStockKg,
      rawStockValue,
      flakesStockKg,
      flakesStockValue,
      pelletStockKg,
      pelletStockValue,
      totalFactoryAssetValuation,
      totalRawInputStage1,
      totalWasteStage1,
      avgSusutStage1,
      totalInputStage2,
      totalWasteStage2,
      avgSusutStage2,
      totalRevenue,
      totalGrossProfit,
      avgProfitMargin,
      totalSalesCount: recalibratedSalesOrders.length,
      totalProductionCount: recalibratedProductionSPKs.length
    }
  };
}
