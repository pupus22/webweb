/**
 * Core recalculation engine for PolyComp ERP.
 * Dynamically re-evaluates raw material inventory, batch HPP, finished goods stock,
 * and sales gross profit whenever any historical transaction is created or edited.
 */

export function recalculateAll(database) {
  const {
    purchases = [],
    productions = [],
    stockAdjustments = [],
    sales = [],
    plasticTypes = [],
    contacts = []
  } = database;

  // 1. Create lookup maps
  const purchaseMap = new Map();
  purchases.forEach(p => purchaseMap.set(p.id, p));

  const plasticTypeMap = new Map();
  plasticTypes.forEach(pt => plasticTypeMap.set(pt.id, pt));

  const contactMap = new Map();
  contacts.forEach(c => contactMap.set(c.id, c));

  // 2. Compute Raw Material usage from Productions
  const rawUsageMap = new Map(); // purchaseId -> totalKgUsed
  productions.forEach(prod => {
    if (Array.isArray(prod.inputs)) {
      prod.inputs.forEach(inp => {
        if (inp.purchaseBatchId) {
          const current = rawUsageMap.get(inp.purchaseBatchId) || 0;
          rawUsageMap.set(inp.purchaseBatchId, current + Number(inp.weightUsedKg || 0));
        }
      });
    }
  });

  // 3. Process Raw Purchases with dynamic stock balance & recalibrated totals
  const recalibratedPurchases = purchases.map(p => {
    const gross = Number(p.grossWeight || 0);
    const deductionPct = Number(p.tareOrDeductionPercent || 0);
    const deductionKg = p.deductionWeight !== undefined && p.deductionWeight !== null
      ? Number(p.deductionWeight)
      : (gross * deductionPct / 100);
    const netWeight = Math.max(0, gross - deductionKg);
    const pricePerKg = Number(p.pricePerKg || 0);
    const totalAmount = netWeight * pricePerKg;

    const usedKg = rawUsageMap.get(p.id) || 0;
    const remainingKg = Math.max(0, netWeight - usedKg);
    const stockStatus = remainingKg <= 0 ? 'Habis' : (remainingKg < netWeight * 0.2 ? 'Menipis' : 'Tersedia');

    const plastic = plasticTypeMap.get(p.plasticTypeId);
    const supplier = contactMap.get(p.supplierId);

    return {
      ...p,
      grossWeight: gross,
      tareOrDeductionPercent: deductionPct,
      deductionWeight: deductionKg,
      netWeight,
      pricePerKg,
      totalAmount,
      usedKg,
      remainingKg,
      stockStatus,
      plasticName: plastic ? `${plastic.code} - ${plastic.name}` : p.plasticTypeId,
      supplierName: supplier ? supplier.name : p.supplierId
    };
  });

  // Map for fast recalibrated purchase lookup
  const recalPurchaseMap = new Map();
  recalibratedPurchases.forEach(p => recalPurchaseMap.set(p.id, p));

  // 4. Recalibrate Productions (Input costs reflect live purchase prices, HPP recomputed)
  const recalibratedProductions = productions.map(prod => {
    let computedInputKg = 0;
    let computedMaterialCost = 0;

    const recalibratedInputs = (prod.inputs || []).map(inp => {
      const livePurchase = recalPurchaseMap.get(inp.purchaseBatchId);
      // Auto-recalibrate: Use live purchase price if available, fallback to stored costPerKg
      const unitCost = livePurchase ? livePurchase.pricePerKg : Number(inp.costPerKg || 0);
      const weight = Number(inp.weightUsedKg || 0);
      const subtotal = weight * unitCost;

      computedInputKg += weight;
      computedMaterialCost += subtotal;

      const pType = plasticTypeMap.get(inp.plasticTypeId) || (livePurchase ? plasticTypeMap.get(livePurchase.plasticTypeId) : null);

      return {
        ...inp,
        costPerKg: unitCost,
        subtotalCost: subtotal,
        weightUsedKg: weight,
        materialName: inp.materialName || (livePurchase ? `${livePurchase.batchNo} (${livePurchase.plasticName})` : 'Bahan Baku'),
        plasticCode: pType ? pType.code : ''
      };
    });

    const totalInputKg = computedInputKg > 0 ? computedInputKg : Number(prod.totalInputKg || 0);
    const totalMaterialCost = computedMaterialCost > 0 ? computedMaterialCost : Number(prod.totalMaterialCost || 0);

    const outputKg = Number(prod.outputKg || 0);
    const opCostPerKg = Number(prod.operationalCostPerKg || 0);
    const totalOperationalCost = outputKg * opCostPerKg;
    const totalProductionCost = totalMaterialCost + totalOperationalCost;

    const shrinkageKg = Math.max(0, totalInputKg - outputKg);
    const shrinkagePercent = totalInputKg > 0 ? (shrinkageKg / totalInputKg) * 100 : 0;
    const hppPerKg = outputKg > 0 ? (totalProductionCost / outputKg) : 0;

    return {
      ...prod,
      inputs: recalibratedInputs,
      totalInputKg,
      totalMaterialCost,
      operationalCostPerKg: opCostPerKg,
      totalOperationalCost,
      totalProductionCost,
      outputKg,
      shrinkageKg,
      shrinkagePercent,
      hppPerKg
    };
  });

  // Map for fast production lookup (by spkNo)
  const productionBySpk = new Map();
  recalibratedProductions.forEach(prd => productionBySpk.set(prd.spkNo, prd));

  // 5. Compute Finished Goods stock usage from Sales & Adjustments
  const salesByBatch = new Map(); // spkNo -> totalSoldKg
  sales.forEach(sale => {
    if (sale.batchNo) {
      const cur = salesByBatch.get(sale.batchNo) || 0;
      salesByBatch.set(sale.batchNo, cur + Number(sale.qtyKg || 0));
    }
  });

  const adjustmentsByBatch = new Map(); // spkNo -> totalDeltaKg
  stockAdjustments.forEach(adj => {
    if (adj.batchNo) {
      const cur = adjustmentsByBatch.get(adj.batchNo) || 0;
      adjustmentsByBatch.set(adj.batchNo, cur + Number(adj.deltaKg || 0));
    }
  });

  // 6. Build Finished Goods Inventory list
  const finishedGoodsInventory = recalibratedProductions.map(prod => {
    const soldKg = salesByBatch.get(prod.spkNo) || 0;
    const adjustmentKg = adjustmentsByBatch.get(prod.spkNo) || 0;
    const currentStockKg = Math.max(0, prod.outputKg + adjustmentKg - soldKg);
    const totalAssetValue = currentStockKg * prod.hppPerKg;
    const bagCapacity = Number(prod.bagWeightKg || 25);
    const availableBags = bagCapacity > 0 ? Math.floor(currentStockKg / bagCapacity) : 0;

    return {
      batchNo: prod.spkNo,
      productName: prod.targetProductName,
      targetType: prod.targetType,
      targetColor: prod.targetColor,
      productionDate: prod.date,
      originalOutputKg: prod.outputKg,
      adjustmentKg,
      soldKg,
      currentStockKg,
      availableBags,
      bagWeightKg: bagCapacity,
      hppPerKg: prod.hppPerKg,
      totalAssetValue,
      status: currentStockKg <= 0 ? 'Habis Terjual' : (currentStockKg < 250 ? 'Stok Rendah' : 'Siap Kirim')
    };
  });

  // Map for fast finished goods batch lookup
  const fgMap = new Map();
  finishedGoodsInventory.forEach(fg => fgMap.set(fg.batchNo, fg));

  // 7. Recalibrate Sales (HPP & Profit dynamically tied to production batch)
  const recalibratedSales = sales.map(s => {
    const fg = fgMap.get(s.batchNo);
    const cogsPerKg = fg ? fg.hppPerKg : Number(s.cogsPerKg || 0);
    const qtyKg = Number(s.qtyKg || 0);
    const pricePerKg = Number(s.pricePerKg || 0);
    const discount = Number(s.discount || 0);
    const shippingCost = Number(s.shippingCost || 0);

    const subtotal = qtyKg * pricePerKg;
    const netRevenue = subtotal - discount;
    const totalAmount = netRevenue + shippingCost;
    const totalCogs = qtyKg * cogsPerKg;
    const grossProfit = netRevenue - totalCogs;
    const profitMarginPercent = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    const customer = contactMap.get(s.customerId);

    return {
      ...s,
      qtyKg,
      pricePerKg,
      discount,
      shippingCost,
      subtotal,
      netRevenue,
      totalAmount,
      cogsPerKg,
      totalCogs,
      grossProfit,
      profitMarginPercent,
      customerName: customer ? customer.name : s.customerId,
      customerPhone: customer ? customer.phone : '',
      customerAddress: customer ? customer.address : ''
    };
  });

  // 8. Aggregate Overall KPIs
  const totalRawStockKg = recalibratedPurchases.reduce((acc, p) => acc + p.remainingKg, 0);
  const totalRawStockValue = recalibratedPurchases.reduce((acc, p) => acc + (p.remainingKg * p.pricePerKg), 0);

  const totalFinishedGoodsStockKg = finishedGoodsInventory.reduce((acc, fg) => acc + fg.currentStockKg, 0);
  const totalFinishedGoodsStockValue = finishedGoodsInventory.reduce((acc, fg) => acc + fg.totalAssetValue, 0);

  const totalProductionInputKg = recalibratedProductions.reduce((acc, p) => acc + p.totalInputKg, 0);
  const totalProductionOutputKg = recalibratedProductions.reduce((acc, p) => acc + p.outputKg, 0);
  const totalProductionShrinkageKg = recalibratedProductions.reduce((acc, p) => acc + p.shrinkageKg, 0);
  const avgShrinkagePercent = totalProductionInputKg > 0 ? (totalProductionShrinkageKg / totalProductionInputKg) * 100 : 0;

  const totalSalesRevenue = recalibratedSales.reduce((acc, s) => acc + s.netRevenue, 0);
  const totalSalesGrossProfit = recalibratedSales.reduce((acc, s) => acc + s.grossProfit, 0);
  const avgGrossProfitMargin = totalSalesRevenue > 0 ? (totalSalesGrossProfit / totalSalesRevenue) * 100 : 0;

  return {
    recalibratedPurchases,
    recalibratedProductions,
    finishedGoodsInventory,
    recalibratedSales,
    kpis: {
      totalRawStockKg,
      totalRawStockValue,
      totalFinishedGoodsStockKg,
      totalFinishedGoodsStockValue,
      totalProductionInputKg,
      totalProductionOutputKg,
      totalProductionShrinkageKg,
      avgShrinkagePercent,
      totalSalesRevenue,
      totalSalesGrossProfit,
      avgGrossProfitMargin,
      totalOrdersCount: recalibratedSales.length,
      totalProductionsCount: recalibratedProductions.length
    }
  };
}
