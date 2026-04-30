export const calculateFinalPrice = (product, campaigns = []) => {
  const itemDisc = product.discount || 0;
  
  // On cherche la promo la plus précise, par marque ou catégorie
  const specificRule = campaigns.find(rule => 
    (rule.campaign_type === 'category' && rule.campaign_target?.toLowerCase() === product.category?.toLowerCase()) ||
    (rule.campaign_type === 'brand' && rule.campaign_target?.toLowerCase() === product.brand?.toLowerCase())
  );


  const storewideRule = campaigns.find(rule => rule.campaign_type === 'all');

  const eventDisc = specificRule ? specificRule.campaign_value : 0;
  const globalDisc = storewideRule ? storewideRule.campaign_value : 0;
  
  // application successive des remises : item → event → global 
  const afterItem = product.price * (1 - itemDisc / 100);
  const afterEvent = afterItem * (1 - eventDisc / 100);
  const finalPrice = afterEvent * (1 - globalDisc / 100);

  return {
    // Formatage en string à 2 décimales pour l'affichage direct en boutique
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