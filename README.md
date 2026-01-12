# 🏢 BackOffice Application
## 👤 Auteur
Chaimaa El-khadiri

## 📋 Description
Application web complète de gestion back-office avec système d'authentification, dashboard interactif et modules CRUD (Utilisateurs, Produits, Factures).

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité
- Système de connexion sécurisé
- Rôles hiérarchiques (Admin, Manager, User)
- Protection des routes
- Session avec localStorage

### 📊 Dashboard
- Graphiques interactifs avec Chart.js
- KPI (Key Performance Indicators)
- Tableau d'activités récentes
- Design responsive

### 👥 Gestion Utilisateurs
- CRUD complet (Create, Read, Update, Delete)
- Filtres et recherche avancée
- Pagination
- Export CSV

### 📦 Gestion Produits
- Catalogue produits avec images
- Gestion des stocks
- Catégories et marques
- Alertes stock faible

### 🧾 Gestion Factures
- Création de factures détaillées
- Calculs automatiques (HT, TVA, TTC)
- Suivi des paiements
- Rapports financiers

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript Vanilla
- **UI Framework** : Bootstrap 5
- **Icons** : Bootstrap Icons
- **Charts** : Chart.js
- **Storage** : localStorage / IndexedDB
- **APIs** : JSONPlaceholder, DummyJSON

## 📁 Structure du Projet
backoffice-app/
├── index.html # Page de connexion
├── dashboard.html # Tableau de bord principal
├── users.html # Gestion des utilisateurs
├── products.html # Gestion des produits
├── invoices.html # Gestion des factures
├── style.css # Feuille de style principale
├── auth.js # Module d'authentification
├── dashboard.js # Graphiques du dashboard
├── users.js # CRUD des utilisateurs
├── products.js # CRUD des produits
├── invoices.js # CRUD des factures
├── api.js # Centralisation des appels API
└── README.md # Ce fichier de documentation


## 🔧 Comment l'utiliser ?

### Méthode 1 : Directement dans le navigateur
1. Téléchargez tous les fichiers
2. Ouvrez `index.html` avec votre navigateur
3. Connectez-vous avec :
   - **Administrateur** : `admin` / `admin`
   - **Utilisateur** : `user` / `user123`
   - **Manager** : `manager` / `manager123`

### Méthode 2 : En ligne (GitHub Pages)
1. Allez sur : `https://chaimaa-elkhadiri.github.io/backoffice-app`
2. Connectez-vous avec les identifiants ci-dessus


### APIs utilisées :
Utilisateurs : https://jsonplaceholder.typicode.com/users

Produits : https://dummyjson.com/products

Données sauvegardées localement dans le navigateur

## 🔗 Liens importants

| Lien | Description |
|------|-------------|
| 📁 **Code source** | https://github.com/chaimaa-elkhadiri/backoffice-app |
| 🌐 **Démo en ligne** | https://chaimaa-elkhadiri.github.io/backoffice-app |


## 📞 Contact
Pour toute question concernant ce projet :
- 📧 Email :chaimaeelkhadiri874@gmail.com
- 💼 LinkedIn : www.linkedin.com/in/chaimaa-el-khadiri-b0b986349


---

<div align="center">

**⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile sur GitHub !**

</div>