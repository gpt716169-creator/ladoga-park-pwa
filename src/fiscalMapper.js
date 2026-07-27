/**
 * Fiscal Mapping Engine (USN 6% Compliance)
 * Groups cart items by fiscalName and aggregates total cost
 */

export function computeFiscalSummary(cartItems) {
  const map = new Map();

  cartItems.forEach(item => {
    const fiscalName = item.fiscalName || "Услуги проживания";
    const subtotal = item.price * item.quantity;
    
    if (map.has(fiscalName)) {
      const existing = map.get(fiscalName);
      existing.totalPrice += subtotal;
      existing.itemNames.push(`${item.displayName} (x${item.quantity})`);
    } else {
      map.set(fiscalName, {
        fiscalName: fiscalName,
        totalPrice: subtotal,
        itemNames: [`${item.displayName} (x${item.quantity})`]
      });
    }
  });

  return Array.from(map.values());
}
