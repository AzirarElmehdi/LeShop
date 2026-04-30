# AZMethods Shop

E-commerce fullstack construit avec React, Supabase et Tailwind CSS. Le projet couvre l'ensemble du cycle d'une boutique en ligne : catalogue produits, panier, pages produit dynamiques, moteur de promotions et panel d'administration protégé.

**[→ Voir le site en live](https://le-shop.vercel.app/)**

---

## Stack technique

| Côté | Technologie |
|------|-------------|
| Frontend | React 19, React Router v7 |
| Styling | Tailwind CSS |
| Backend / BDD | Supabase (PostgreSQL + Auth) |
| Déploiement | Vercel |
| CI | ESLint (GitHub Actions) |

---

## Fonctionnalités

**Boutique**
- Catalogue avec pagination côté serveur (`.range()` Supabase)
- Filtrage par marque via `ShopContext` (zéro re-fetch)
- Badges de stock dynamiques : low stock / sold out
- Page produit dédiée avec galerie photos et description longue

**Panier**
- Persistance via `localStorage` avec hydratation au boot
- Contrôle de stock en temps réel (bloque si quantité > stock disponible)
- Calcul des promotions appliqué dynamiquement à chaque ligne

**Moteur de promotions (`priceEngine.js`)**
- 3 niveaux de remise cumulatifs : item → catégorie/marque → tout le site
- Pure function réutilisée côté boutique, panier et panel admin

**Panel Admin** *(accès protégé)*
- Gestion des produits : ajout, édition, suppression
- Gestion des stores / marques
- Page Builder : description longue + galerie secondaire par produit
- Déploiement de règles promotionnelles globales

---

## Architecture

```
src/
├── components/
│   ├── Admin/          # Panel admin (Admin.jsx, AdminCard.jsx)
│   ├── layout/         # Layout global avec header sticky et CartContext
│   └── UI/             # Composants réutilisables (AddToCartButton)
├── context/
│   ├── CartContext.jsx  # Panier global + calcul totalPrice
│   └── ShopContext.jsx  # Campaigns + stores fetchés une seule fois
├── pages/
│   ├── Home.jsx         # Catalogue avec pagination
│   ├── Cart.jsx         # Page panier
│   └── ProductDetail.jsx
├── utils/
│   └── priceEngine.js   # Moteur de calcul de prix isolé et testable
└── lib/
    └── supabase.js      # Instance client unique
```

---

## Démo Admin

```
URL     : https://le-shop.vercel.app/admin
Email   : demo@admin.fr
Password: 123456789
```

---

## Lancer le projet en local

```bash
git clone https://github.com/ton-username/LeShop.git
cd LeShop
npm install
```

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

---

## Améliorations prévues

Ce projet a été conçu dès le départ pour évoluer. L'architecture (contexts globaux, moteur de prix isolé, pagination serveur) a été pensée pour absorber ces ajouts sans refonte majeure.

**Comptes utilisateurs & profils**
Création de comptes publics avec authentification Supabase, profils clients, sauvegarde des adresses de livraison et historique de commandes.

**Paiement**
Intégration de Stripe pour gérer les paiements sécurisés, les webhooks de confirmation de commande et la gestion des remboursements.

**Moteur de recommandations**
Algorithme de suggestions basé sur les préférences de navigation de chaque utilisateur et les produits les plus consultés / ajoutés au panier du moment.

**Barre promotionnelle**
Bandeau dynamique en haut de page piloté depuis le panel admin pour mettre en avant les offres actives et les codes promo.

**Gestion des produits avancée**
Remplacement du système d'URL manuelles par un vrai uploader d'images (Supabase Storage), gestion des variantes produit (taille, couleur) et import en masse via CSV.

---