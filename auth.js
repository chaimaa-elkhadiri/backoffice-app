// ============================================
// AUTH.JS - Gestion de l'authentification
// ============================================

console.log("Chargement du module d'authentification...");

// Stockage des utilisateurs (simulé)
const users = [
    { username: 'admin', password: 'admin', role: 'admin', name: 'Administrateur Principal' },
    { username: 'user', password: 'user123', role: 'user', name: 'Utilisateur Standard' },
    { username: 'manager', password: 'manager123', role: 'manager', name: 'Gestionnaire' }
];

// Fonction pour vérifier les identifiants
function checkCredentials(username, password) {
    return users.find(user => 
        user.username === username && user.password === password
    );
}

// Gestion du formulaire de login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        const user = checkCredentials(username, password);
        
        if (user) {
            // Stocker les infos de session
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('loginTime', new Date().toISOString());
            
            // Redirection vers le dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Afficher erreur
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.innerHTML = `
                <i class="bi bi-exclamation-triangle"></i>
                Identifiants incorrects ! Essayez : admin / admin
            `;
            
            // Retirer ancienne erreur si elle existe
            const oldError = document.querySelector('.alert-danger');
            if (oldError) oldError.remove();
            
            // Ajouter la nouvelle erreur
            document.querySelector('#loginForm').appendChild(errorDiv);
            
            // Effacer après 5 secondes
            setTimeout(() => errorDiv.remove(), 5000);
        }
    });
}

// Vérifier l'authentification sur les pages protégées
function checkAuth() {
    // Pages qui nécessitent une authentification
    const protectedPages = ['dashboard.html', 'users.html', 'products.html', 'orders.html', 'invoices.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        
        if (!isAuthenticated || isAuthenticated !== 'true') {
            // Rediriger vers la page de login
            window.location.href = 'index.html';
            return false;
        }
        
        // Afficher le nom de l'utilisateur connecté
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (userData.name) {
            const userElements = document.querySelectorAll('.current-username');
            userElements.forEach(el => {
                el.textContent = userData.name;
            });
        }
        
        return true;
    }
    return null; // Page non protégée
}

// Fonction de déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('loginTime');
        
        // Redirection vers la page de login
        window.location.href = 'index.html';
    }
}

// Fonction pour obtenir l'utilisateur courant
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Fonction pour vérifier les permissions
function hasPermission(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Hiérarchie des rôles
    const roleHierarchy = {
        'user': 1,
        'manager': 2,
        'admin': 3
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

// Initialiser la vérification d'authentification
document.addEventListener('DOMContentLoaded', function() {
    if (typeof checkAuth === 'function') {
        checkAuth();
    }
});

// Exporter les fonctions pour les autres fichiers
if (typeof module !== 'undefined') {
    module.exports = { checkAuth, logout, getCurrentUser, hasPermission };
}