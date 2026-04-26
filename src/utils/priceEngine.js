export const calculateFinalPrice = (product, campaigns = []) => {
  const itemDisc = product.discount || 0;
  
  // 1. Cherche une règle spécifique (Marque ou Catégorie)
  const specificRule = campaigns.find(rule => 
    (rule.campaign_type === 'category' && rule.campaign_target?.toLowerCase() === product.category?.toLowerCase()) ||
    (rule.campaign_type === 'brand' && rule.campaign_target?.toLowerCase() === product.brand?.toLowerCase())
  );

  // 2. Cherche la règle "Storewide" (Tout le site)
  const storewideRule = campaigns.find(rule => rule.campaign_type === 'all');

  const eventDisc = specificRule ? specificRule.campaign_value : 0;
  const globalDisc = storewideRule ? storewideRule.campaign_value : 0;
  
  // Calcul successif (Compound)
  const afterItem = product.price * (1 - itemDisc / 100);
  const afterEvent = afterItem * (1 - eventDisc / 100);
  const finalPrice = afterEvent * (1 - globalDisc / 100);

  return {
    finalPrice: finalPrice.toFixed(2),
    hasDiscount: itemDisc > 0 || eventDisc > 0 || globalDisc > 0,
    details: { 
      itemDisc, 
      eventDisc, 
      globalDisc, 
      specificType: specificRule?.campaign_type 
    }
  };
};