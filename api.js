// ============================================
// API.JS - Fonctions API communes
// ============================================

const API_CONFIG = {
    jsonPlaceholder: 'https://jsonplaceholder.typicode.com',
    dummyJson: 'https://dummyjson.com',
    timeout: 10000
};

// Fonction fetch avec timeout
async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Récupérer les utilisateurs
async function getUsers(limit = 10) {
    return fetchWithTimeout(`${API_CONFIG.jsonPlaceholder}/users?_limit=${limit}`);
}

// Récupérer les produits
async function getProducts(limit = 10) {
    return fetchWithTimeout(`${API_CONFIG.dummyJson}/products?limit=${limit}`);
}

// Récupérer les commandes
async function getOrders(limit = 10) {
    return fetchWithTimeout(`${API_CONFIG.dummyJson}/carts?limit=${limit}`);
}

// Sauvegarder les données localement
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Erreur sauvegarde localStorage:', error);
        return false;
    }
}

// Charger depuis localStorage
function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Erreur chargement localStorage:', error);
        return null;
    }
}

// Simuler un délai (pour les tests)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Exporter
if (typeof module !== 'undefined') {
    module.exports = {
        fetchWithTimeout,
        getUsers,
        getProducts,
        getOrders,
        saveToLocalStorage,
        loadFromLocalStorage,
        delay
    };
}