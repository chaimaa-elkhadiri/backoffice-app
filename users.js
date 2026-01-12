// ============================================
// USERS.JS - Gestion CRUD des utilisateurs
// ============================================

console.log("Chargement du module utilisateurs...");

// Variables globales
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const itemsPerPage = 10;
let userToDelete = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    if (typeof checkAuth === 'function' && checkAuth()) {
        loadUsers();
        setupEventListeners();
    }
});

// Charger les utilisateurs
async function loadUsers() {
    try {
        showLoading();
        
        // Récupérer depuis l'API
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const apiUsers = await response.json();
        
        // Transformer les données
        allUsers = apiUsers.map((user, index) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '(non renseigné)',
            city: user.address.city,
            role: getRandomRole(),
            status: Math.random() > 0.2 ? 'active' : 'inactive',
            company: user.company.name,
            website: user.website
        }));
        
        // Ajouter des utilisateurs locaux
        allUsers.push(
            {
                id: 1001,
                name: 'Admin Principal',
                email: 'admin@backoffice.com',
                phone: '01 23 45 67 89',
                city: 'Paris',
                role: 'admin',
                status: 'active',
                company: 'BackOffice Inc.',
                website: 'backoffice.com'
            },
            {
                id: 1002,
                name: 'Gestionnaire Test',
                email: 'manager@backoffice.com',
                phone: '06 12 34 56 78',
                city: 'Lyon',
                role: 'manager',
                status: 'active',
                company: 'BackOffice Inc.',
                website: 'backoffice.com'
            }
        );
        
        filteredUsers = [...allUsers];
        renderUsersTable();
        updatePagination();
        updateStats();
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showError('Impossible de charger les utilisateurs');
    } finally {
        hideLoading();
    }
}

// Afficher le tableau des utilisateurs
function renderUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    // Calculer les utilisateurs à afficher pour la page courante
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    if (usersToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="empty-state">
                        <i class="bi bi-people display-4 text-muted"></i>
                        <h4 class="mt-3">Aucun utilisateur trouvé</h4>
                        <p class="text-muted">Essayez de modifier vos filtres de recherche</p>
                        <button class="btn btn-primary mt-2" onclick="resetFilters()">
                            <i class="bi bi-arrow-clockwise"></i> Réinitialiser les filtres
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    usersToShow.forEach(user => {
        const row = document.createElement('tr');
        
        // Déterminer la classe du badge de rôle
        let roleBadgeClass = 'badge-user';
        if (user.role === 'admin') roleBadgeClass = 'badge-admin';
        if (user.role === 'manager') roleBadgeClass = 'badge-manager';
        
        // Déterminer la classe du badge de statut
        let statusBadgeClass = user.status === 'active' ? 'badge-active' : 'badge-inactive';
        let statusIcon = user.status === 'active' ? 'bi-check-circle' : 'bi-x-circle';
        
        row.innerHTML = `
            <td>#${user.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar me-2">
                        ${user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <strong>${user.name}</strong><br>
                        <small class="text-muted">${user.company}</small>
                    </div>
                </div>
            </td>
            <td>
                <a href="mailto:${user.email}" class="text-decoration-none">
                    <i class="bi bi-envelope me-1"></i>${user.email}
                </a>
            </td>
            <td>${user.phone}</td>
            <td>
                <i class="bi bi-geo-alt me-1"></i>${user.city}
            </td>
            <td>
                <span class="badge ${roleBadgeClass}">
                    <i class="bi bi-shield me-1"></i>${user.role}
                </span>
            </td>
            <td>
                <span class="badge ${statusBadgeClass}">
                    <i class="bi ${statusIcon} me-1"></i>${user.status}
                </span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-info" onclick="viewUser(${user.id})" 
                            title="Voir détails">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editUser(${user.id})"
                            title="Modifier">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDelete(${user.id})"
                            title="Supprimer">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Mettre à jour la pagination
function updatePagination() {
    const pagination = document.getElementById('usersPagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    pagination.innerHTML = '';
    
    // Bouton précédent
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">
            <i class="bi bi-chevron-left"></i>
        </a>
    `;
    pagination.appendChild(prevLi);
    
    // Pages numérotées
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
        `;
        pagination.appendChild(li);
    }
    
    // Bouton suivant
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">
            <i class="bi bi-chevron-right"></i>
        </a>
    `;
    pagination.appendChild(nextLi);
}

// Changer de page
function changePage(page) {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderUsersTable();
    updatePagination();
    updateStats();
    
    // Scroll vers le haut du tableau
    document.getElementById('usersTable').scrollIntoView({ behavior: 'smooth' });
}

// Mettre à jour les statistiques
function updateStats() {
    const startRow = (currentPage - 1) * itemsPerPage + 1;
    const endRow = Math.min(currentPage * itemsPerPage, filteredUsers.length);
    
    document.getElementById('startRow').textContent = startRow;
    document.getElementById('endRow').textContent = endRow;
    document.getElementById('totalRows').textContent = filteredUsers.length;
}

// Filtrer les utilisateurs
function filterUsers() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const roleFilter = document.getElementById('filterRole').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    filteredUsers = allUsers.filter(user => {
        // Recherche par nom, email ou ville
        const matchesSearch = !searchTerm || 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.city.toLowerCase().includes(searchTerm);
        
        // Filtre par rôle
        const matchesRole = !roleFilter || user.role === roleFilter;
        
        // Filtre par statut
        const matchesStatus = !statusFilter || user.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    currentPage = 1;
    renderUsersTable();
    updatePagination();
    updateStats();
}

// Recherche en temps réel
function searchUsers() {
    filterUsers();
}

// Réinitialiser les filtres
function resetFilters() {
    document.getElementById('searchUsers').value = '';
    document.getElementById('filterRole').value = '';
    document.getElementById('filterStatus').value = '';
    filterUsers();
}

// Voir les détails d'un utilisateur
function viewUser(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;
    
    // Créer un modal de détails
    const modalHTML = `
        <div class="modal fade" id="viewUserModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-person-badge"></i> Détails de l'utilisateur
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-3 text-center">
                                <div class="avatar-large mb-3">
                                    ${user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h5>${user.name}</h5>
                                <span class="badge ${user.role === 'admin' ? 'badge-admin' : user.role === 'manager' ? 'badge-manager' : 'badge-user'}">
                                    ${user.role}
                                </span>
                            </div>
                            
                            <div class="col-md-9">
                                <h6 class="border-bottom pb-2">Informations personnelles</h6>
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong><i class="bi bi-envelope"></i> Email:</strong><br>${user.email}</p>
                                        <p><strong><i class="bi bi-telephone"></i> Téléphone:</strong><br>${user.phone}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong><i class="bi bi-geo-alt"></i> Ville:</strong><br>${user.city}</p>
                                        <p><strong><i class="bi bi-building"></i> Société:</strong><br>${user.company}</p>
                                    </div>
                                </div>
                                
                                <h6 class="border-bottom pb-2 mt-3">Informations système</h6>
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong>ID:</strong> #${user.id}</p>
                                        <p><strong>Statut:</strong> 
                                            <span class="badge ${user.status === 'active' ? 'badge-active' : 'badge-inactive'}">
                                                ${user.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong>Site web:</strong><br>
                                            <a href="http://${user.website}" target="_blank">${user.website}</a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle"></i> Fermer
                        </button>
                        <button type="button" class="btn btn-primary" onclick="editUser(${user.id})" data-bs-dismiss="modal">
                            <i class="bi bi-pencil"></i> Modifier
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="exportUserPDF(${user.id})">
                            <i class="bi bi-file-pdf"></i> Exporter PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter le modal au DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstChild);
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
    modal.show();
    
    // Nettoyer après fermeture
    document.getElementById('viewUserModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Éditer un utilisateur
function editUser(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;
    
    // Remplir le formulaire
    document.getElementById('modalTitle').textContent = 'Modifier l\'utilisateur';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone;
    document.getElementById('userCity').value = user.city;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    
    // Changer le texte du bouton
    const saveBtn = document.querySelector('#addUserModal .btn-primary');
    saveBtn.innerHTML = '<i class="bi bi-check-circle"></i> Mettre à jour';
    saveBtn.onclick = updateUser;
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
}

// Ajouter un nouvel utilisateur
function addNewUser() {
    // Réinitialiser le formulaire
    document.getElementById('modalTitle').textContent = 'Ajouter un utilisateur';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    
    // Changer le texte du bouton
    const saveBtn = document.querySelector('#addUserModal .btn-primary');
    saveBtn.innerHTML = '<i class="bi bi-check-circle"></i> Enregistrer';
    saveBtn.onclick = saveUser;
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
}

// Sauvegarder un nouvel utilisateur
function saveUser() {
    const form = document.getElementById('userForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const newId = Math.max(...allUsers.map(u => u.id)) + 1;
    
    const newUser = {
        id: newId,
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value,
        city: document.getElementById('userCity').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value,
        company: 'Nouvelle société',
        website: 'example.com'
    };
    
    allUsers.unshift(newUser); // Ajouter au début
    filteredUsers = [...allUsers];
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
    modal.hide();
    
    // Recharger le tableau
    currentPage = 1;
    renderUsersTable();
    updatePagination();
    updateStats();
    
    showSuccess('Utilisateur ajouté avec succès!');
}

// Mettre à jour un utilisateur
function updateUser() {
    const form = document.getElementById('userForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const userId = parseInt(document.getElementById('userId').value);
    const userIndex = allUsers.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        allUsers[userIndex] = {
            ...allUsers[userIndex],
            name: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            phone: document.getElementById('userPhone').value,
            city: document.getElementById('userCity').value,
            role: document.getElementById('userRole').value,
            status: document.getElementById('userStatus').value
        };
        
        filteredUsers = [...allUsers];
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        modal.hide();
        
        // Recharger le tableau
        renderUsersTable();
        
        showSuccess('Utilisateur mis à jour avec succès!');
    }
}

// Confirmer la suppression
function confirmDelete(id) {
    userToDelete = id;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
    
    // Configurer le bouton de confirmation
    document.getElementById('confirmDelete').onclick = deleteUser;
}

// Supprimer un utilisateur
function deleteUser() {
    if (!userToDelete) return;
    
    const userIndex = allUsers.findIndex(u => u.id === userToDelete);
    
    if (userIndex !== -1) {
        allUsers.splice(userIndex, 1);
        filteredUsers = [...allUsers];
        
        // Ajuster la pagination si nécessaire
        const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1;
        }
        
        // Recharger le tableau
        renderUsersTable();
        updatePagination();
        updateStats();
        
        showSuccess('Utilisateur supprimé avec succès!');
    }
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    modal.hide();
    userToDelete = null;
}

// Exporter en CSV
function exportUsers() {
    if (filteredUsers.length === 0) {
        showError('Aucun utilisateur à exporter');
        return;
    }
    
    // Créer le contenu CSV
    const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Ville', 'Rôle', 'Statut', 'Société'];
    const csvRows = [];
    
    // Ajouter les en-têtes
    csvRows.push(headers.join(','));
    
    // Ajouter les données
    filteredUsers.forEach(user => {
        const row = [
            user.id,
            `"${user.name}"`,
            user.email,
            user.phone,
            user.city,
            user.role,
            user.status,
            `"${user.company}"`
        ];
        csvRows.push(row.join(','));
    });
    
    // Créer le fichier
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Télécharger le fichier
    link.href = url;
    link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Export CSV terminé!');
}

// Exporter en PDF (simulé)
function exportUserPDF(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;
    
    // Simuler l'export PDF
    alert(`Export PDF pour ${user.name}\n\nCette fonctionnalité nécessiterait une bibliothèque comme jsPDF.`);
    
    // En production, vous utiliseriez jsPDF:
    // const doc = new jsPDF();
    // doc.text(`Fiche utilisateur: ${user.name}`, 20, 20);
    // doc.save(`user_${id}.pdf`);
}

// Fonctions utilitaires
function getRandomRole() {
    const roles = ['user', 'user', 'user', 'manager', 'admin'];
    return roles[Math.floor(Math.random() * roles.length)];
}

function showLoading() {
    // Ajouter un indicateur de chargement
    const loading = document.createElement('div');
    loading.id = 'loadingOverlay';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    loading.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3">Chargement des utilisateurs...</p>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.remove();
}

function showSuccess(message) {
    // Créer une notification de succès
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
    `;
    alert.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        if (alert.parentNode) alert.remove();
    }, 5000);
}

function showError(message) {
    // Créer une notification d'erreur
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
    `;
    alert.innerHTML = `
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
}

// Configurer les événements
function setupEventListeners() {
    // Recherche en temps réel
    const searchInput = document.getElementById('searchUsers');
    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }
    
    // Filtres
    const filterRole = document.getElementById('filterRole');
    const filterStatus = document.getElementById('filterStatus');
    
    if (filterRole) filterRole.addEventListener('change', filterUsers);
    if (filterStatus) filterStatus.addEventListener('change', filterUsers);
    
    // Bouton ajouter utilisateur
    const addBtn = document.querySelector('[data-bs-target="#addUserModal"]');
    if (addBtn) {
        addBtn.addEventListener('click', addNewUser);
    }
}

// Exporter pour les tests
if (typeof module !== 'undefined') {
    module.exports = {
        loadUsers,
        filterUsers,
        saveUser,
        updateUser,
        deleteUser,
        exportUsers
    };
}

