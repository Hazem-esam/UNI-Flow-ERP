export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export const hasUnit = (product) =>
  !!(product.unitOfMeasureId || product.unitOfMeasureName);

export const getUnitSymbol = (unitsOfMeasure, unitId, product = null) => {
  if (product?.unitOfMeasureName) {
    const unit = unitsOfMeasure.find((u) => u.name === product.unitOfMeasureName);
    return unit?.symbol || "units";
  }
  const unit = unitsOfMeasure.find((u) => u.id === unitId);
  return unit?.symbol || "units";
};

export const getUnitName = (unitsOfMeasure, unitId, product = null) => {
  if (product?.unitOfMeasureName) return product.unitOfMeasureName;
  const unit = unitsOfMeasure.find((u) => u.id === unitId);
  return unit?.name || "Unit";
};

export const getUnitId = (unitsOfMeasure, product) => {
  if (product.unitOfMeasureId) return product.unitOfMeasureId;
  if (product.unitOfMeasureName) {
    const unit = unitsOfMeasure.find((u) => u.name === product.unitOfMeasureName);
    return unit?.id || null;
  }
  return null;
};

export const getProductStock = (stockBalances, productId, warehouseId = null) => {
  if (warehouseId) {
    const balance = stockBalances.find(
      (b) => b.productId === productId && b.warehouseId === warehouseId
    );
    return balance?.quantityOnHand ?? balance?.quantity ?? balance?.currentQuantity ?? 0;
  }
  return stockBalances
    .filter((b) => b.productId === productId)
    .reduce((sum, b) => sum + (b.quantityOnHand ?? b.quantity ?? b.currentQuantity ?? 0), 0);
};