// ============================================
// ORDERS.JS - Gestion CRUD des commandes
// ============================================

console.log("Chargement du module commandes...");

// Variables globales
let allOrders = [];
let filteredOrders = [];
let allCustomers = [];
let currentPage = 1;
const itemsPerPage = 10;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    if (typeof checkAuth === 'function' && checkAuth()) {
        loadOrders();
        setupEventListeners();
    }
});

// Charger les commandes
async function loadOrders() {
    try {
        showLoading('Chargement des commandes...');
        
        // Récupérer les clients d'abord
        await loadCustomers();
        
        // Récupérer les commandes depuis l'API
        const response = await fetch('https://dummyjson.com/carts?limit=20');
        const data = await response.json();
        
        // Transformer les données
        allOrders = data.carts.map((cart, index) => {
            const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
            
            const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            const paymentMethods = ['credit_card', 'paypal', 'bank_transfer', 'cash'];
            const paymentStatuses = ['paid', 'pending', 'failed'];
            
            return {
                id: cart.id,
                orderNumber: `CMD-${(cart.id + 1000).toString().padStart(6, '0')}`,
                customerId: customer.id,
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone,
                customerAddress: customer.address,
                date: orderDate.toISOString().split('T')[0],
                total: cart.total,
                discountedTotal: cart.discountedTotal,
                products: cart.products.map(p => ({
                    id: p.id,
                    name: `Produit ${p.id}`,
                    quantity: p.quantity,
                    price: p.price,
                    total: p.total
                })),
                status: status,
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
                shippingAddress: generateRandomAddress(),
                shippingMethod: ['standard', 'express', 'priority'][Math.floor(Math.random() * 3)],
                notes: Math.random() > 0.7 ? 'Commande spéciale avec instructions particulières' : '',
                trackingNumber: status === 'shipped' || status === 'delivered' ? 
                    `TRK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}` : null
            };
        });
        
        // Ajouter des commandes locales
        allOrders.push(
            {
                id: 1001,
                orderNumber: 'CMD-2023001',
                customerId: 1,
                customerName: 'Jean Dupont',
                customerEmail: 'jean.dupont@email.com',
                customerPhone: '01 23 45 67 89',
                customerAddress: '12 Rue de la Paix, 75001 Paris',
                date: '2023-10-15',
                total: 299.99,
                discountedTotal: 269.99,
                products: [
                    { id: 1, name: 'Smartphone Android', quantity: 1, price: 299.99, total: 299.99 }
                ],
                status: 'delivered',
                paymentMethod: 'credit_card',
                paymentStatus: 'paid',
                shippingAddress: '12 Rue de la Paix, 75001 Paris',
                shippingMethod: 'express',
                notes: '',
                trackingNumber: 'TRK123456'
            },
            {
                id: 1002,
                orderNumber: 'CMD-2023002',
                customerId: 2,
                customerName: 'Marie Martin',
                customerEmail: 'marie.martin@email.com',
                customerPhone: '06 12 34 56 78',
                customerAddress: '45 Avenue des Champs, 69000 Lyon',
                date: '2023-10-20',
                total: 549.50,
                discountedTotal: 494.55,
                products: [
                    { id: 2, name: 'Casque Bluetooth', quantity: 1, price: 199.99, total: 199.99 },
                    { id: 3, name: 'Livre JavaScript', quantity: 2, price: 39.99, total: 79.98 },
                    { id: 4, name: 'T-shirt Logo', quantity: 3, price: 29.99, total: 89.97 }
                ],
                status: 'processing',
                paymentMethod: 'paypal',
                paymentStatus: 'pending',
                shippingAddress: '45 Avenue des Champs, 69000 Lyon',
                shippingMethod: 'standard',
                notes: 'Livraison en point relais',
                trackingNumber: null
            },
            {
                id: 1003,
                orderNumber: 'CMD-2023003',
                customerId: 3,
                customerName: 'Pierre Leroy',
                customerEmail: 'pierre.leroy@email.com',
                customerPhone: '04 98 76 54 32',
                customerAddress: '78 Boulevard Maritime, 13000 Marseille',
                date: '2023-10-25',
                total: 1299.99,
                discountedTotal: 1169.99,
                products: [
                    { id: 5, name: 'iPhone 14 Pro', quantity: 1, price: 1299.99, total: 1299.99 }
                ],
                status: 'pending',
                paymentMethod: 'bank_transfer',
                paymentStatus: 'pending',
                shippingAddress: '78 Boulevard Maritime, 13000 Marseille',
                shippingMethod: 'priority',
                notes: 'Cadeau d\'anniversaire',
                trackingNumber: null
            }
        );
        
        filteredOrders = [...allOrders];
        renderOrdersTable();
        updatePagination();
        updateOrderStats();
        populateCustomerFilter();
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showError('Impossible de charger les commandes');
        loadFallbackOrders();
    } finally {
        hideLoading();
    }
}

// Charger les clients
async function loadCustomers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const users = await response.json();
        
        allCustomers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: `${user.address.street}, ${user.address.zipcode} ${user.address.city}`
        }));
        
        // Ajouter des clients locaux
        allCustomers.push(
            { id: 101, name: 'Client Entreprise', email: 'entreprise@client.com', phone: '01 11 22 33 44', address: '1 Avenue des Affaires, 75008 Paris' },
            { id: 102, name: 'Particulier VIP', email: 'vip@client.com', phone: '06 99 88 77 66', address: '22 Rue du Luxe, 75016 Paris' }
        );
        
    } catch (error) {
        console.error('Erreur chargement clients:', error);
        allCustomers = [
            { id: 1, name: 'Jean Dupont', email: 'jean@email.com', phone: '01 23 45 67 89', address: '12 Rue de la Paix, Paris' },
            { id: 2, name: 'Marie Martin', email: 'marie@email.com', phone: '06 12 34 56 78', address: '45 Avenue des Champs, Lyon' },
            { id: 3, name: 'Pierre Leroy', email: 'pierre@email.com', phone: '04 98 76 54 32', address: '78 Boulevard Maritime, Marseille' }
        ];
    }
}

// Données de secours
function loadFallbackOrders() {
    allOrders = [
        {
            id: 1,
            orderNumber: 'CMD-20231001',
            customerId: 1,
            customerName: 'Client Test',
            customerEmail: 'test@email.com',
            customerPhone: '01 11 22 33 44',
            customerAddress: '123 Rue Test, 75000 Paris',
            date: '2023-10-01',
            total: 149.99,
            discountedTotal: 134.99,
            products: [
                { id: 1, name: 'Produit A', quantity: 2, price: 49.99, total: 99.98 },
                { id: 2, name: 'Produit B', quantity: 1, price: 50.00, total: 50.00 }
            ],
            status: 'delivered',
            paymentMethod: 'credit_card',
            paymentStatus: 'paid',
            shippingAddress: '123 Rue Test, 75000 Paris',
            shippingMethod: 'standard',
            notes: '',
            trackingNumber: 'TRK000001'
        }
    ];
    
    filteredOrders = [...allOrders];
    renderOrdersTable();
    updatePagination();
    updateOrderStats();
}

// Générer une adresse aléatoire
function generateRandomAddress() {
    const streets = ['Rue de la Paix', 'Avenue des Champs', 'Boulevard Haussmann', 'Rue du Commerce', 'Avenue de la République'];
    const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes'];
    
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 100) + 1;
    const city = cities[Math.floor(Math.random() * cities.length)];
    const zipcode = city === 'Paris' ? '75000' : 
                   city === 'Lyon' ? '69000' : 
                   city === 'Marseille' ? '13000' : 
                   city === 'Toulouse' ? '31000' : 
                   city === 'Nice' ? '06000' : '44000';
    
    return `${number} ${street}, ${zipcode} ${city}`;
}

// Afficher le tableau des commandes
function renderOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    // Calculer les commandes à afficher
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const ordersToShow = filteredOrders.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    if (ordersToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="empty-state">
                        <i class="bi bi-cart display-4 text-muted"></i>
                        <h4 class="mt-3">Aucune commande trouvée</h4>
                        <p class="text-muted">Essayez de modifier vos filtres de recherche</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    ordersToShow.forEach(order => {
        const row = document.createElement('tr');
        
        // Déterminer la classe du badge de statut
        const statusInfo = getOrderStatusInfo(order.status);
        const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
        
        // Formatage de la date
        const dateFormatted = new Date(order.date).toLocaleDateString('fr-FR');
        
        // Formatage du montant
        const amountFormatted = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(order.total);
        
        // Nombre de produits
        const productCount = order.products.reduce((sum, p) => sum + p.quantity, 0);
        
        row.innerHTML = `
            <td>
                <strong>${order.orderNumber}</strong><br>
                <small class="text-muted">ID: ${order.id}</small>
            </td>
            <td>
                <div>
                    <strong>${order.customerName}</strong><br>
                    <small class="text-muted">${order.customerEmail}</small>
                </div>
            </td>
            <td>
                ${dateFormatted}<br>
                <small class="text-muted">${order.shippingMethod}</small>
            </td>
            <td>
                <strong>${amountFormatted}</strong>
                ${order.discountedTotal < order.total ? `
                    <br><small class="text-success">
                        <s>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(order.discountedTotal)}</s>
                    </small>
                ` : ''}
            </td>
            <td>
                <span class="badge bg-light text-dark">
                    <i class="bi bi-box"></i> ${productCount} article(s)
                </span>
            </td>
            <td>
                <span class="badge ${statusInfo.class}">
                    <i class="bi ${statusInfo.icon}"></i> ${statusInfo.text}
                </span>
            </td>
            <td>
                <span class="badge ${paymentInfo.class}">
                    ${paymentInfo.text}
                </span><br>
                <small class="text-muted">${getPaymentMethodText(order.paymentMethod)}</small>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-info" onclick="viewOrder(${order.id})" 
                            title="Voir détails">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="changeStatus(${order.id})"
                            title="Changer statut">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="cancelOrder(${order.id})"
                            title="Annuler">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Mettre à jour la pagination
function updatePagination() {
    const pagination = document.getElementById('ordersPagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    
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
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
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
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderOrdersTable();
    updatePagination();
}

// Mettre à jour les statistiques
function updateOrderStats() {
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
    const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length;
    
    // Calculer le chiffre d'affaires
    const totalRevenue = allOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0);
    
    document.getElementById('totalOrdersCount').textContent = totalOrders;
    document.getElementById('pendingOrdersCount').textContent = pendingOrders;
    document.getElementById('deliveredOrdersCount').textContent = deliveredOrders;
    document.getElementById('totalRevenue').textContent = 
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalRevenue);
    
    // Mettre à jour le badge dans la sidebar
    const pendingBadge = document.getElementById('pendingOrdersBadge');
    if (pendingBadge) {
        pendingBadge.textContent = pendingOrders;
    }
}

// Remplir le filtre clients
function populateCustomerFilter() {
    const filterSelect = document.getElementById('filterCustomer');
    if (!filterSelect) return;
    
    // Garder l'option "Tous les clients"
    filterSelect.innerHTML = '<option value="">Tous les clients</option>';
    
    // Ajouter les clients uniques
    const uniqueCustomers = [...new Set(allOrders.map(o => o.customerId))];
    uniqueCustomers.forEach(customerId => {
        const order = allOrders.find(o => o.customerId === customerId);
        if (order) {
            const option = document.createElement('option');
            option.value = customerId;
            option.textContent = order.customerName;
            filterSelect.appendChild(option);
        }
    });
}

// Filtrer les commandes
function filterOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const customerFilter = document.getElementById('filterCustomer').value;
    
    filteredOrders = allOrders.filter(order => {
        // Recherche par numéro de commande, client ou email
        const matchesSearch = !searchTerm || 
            order.orderNumber.toLowerCase().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.customerEmail.toLowerCase().includes(searchTerm);
        
        // Filtre par statut
        const matchesStatus = !statusFilter || order.status === statusFilter;
        
        // Filtre par date
        let matchesDate = true;
        if (dateFrom) {
            matchesDate = matchesDate && order.date >= dateFrom;
        }
        if (dateTo) {
            matchesDate = matchesDate && order.date <= dateTo;
        }
        
        // Filtre par client
        const matchesCustomer = !customerFilter || order.customerId.toString() === customerFilter;
        
        return matchesSearch && matchesStatus && matchesDate && matchesCustomer;
    });
    
    currentPage = 1;
    renderOrdersTable();
    updatePagination();
}

// Recherche en temps réel
function searchOrders() {
    filterOrders();
}

// Voir les détails d'une commande
function viewOrder(id) {
    const order = allOrders.find(o => o.id === id);
    if (!order) return;
    
    const statusInfo = getOrderStatusInfo(order.status);
    const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
    const dateFormatted = new Date(order.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Calculer les totaux
    const subtotal = order.products.reduce((sum, p) => sum + p.total, 0);
    const discount = order.total - order.discountedTotal;
    const shippingCost = 4.99; // Exemple
    
    const content = `
        <div class="row">
            <div class="col-md-8">
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="bi bi-box"></i> Articles commandés</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th>Prix unitaire</th>
                                        <th>Quantité</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${order.products.map(product => `
                                        <tr>
                                            <td>${product.name}</td>
                                            <td>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}</td>
                                            <td>${product.quantity}</td>
                                            <td>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.total)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                ${order.notes ? `
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="bi bi-chat"></i> Notes</h6>
                    </div>
                    <div class="card-body">
                        <p>${order.notes}</p>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="col-md-4">
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="bi bi-info-circle"></i> Informations commande</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Numéro:</strong> ${order.orderNumber}</p>
                        <p><strong>Date:</strong> ${dateFormatted}</p>
                        <p><strong>Statut:</strong> 
                            <span class="badge ${statusInfo.class}">
                                ${statusInfo.text}
                            </span>
                        </p>
                        <p><strong>Livraison:</strong> ${getShippingMethodText(order.shippingMethod)}</p>
                        ${order.trackingNumber ? `
                            <p><strong>Numéro de suivi:</strong> ${order.trackingNumber}</p>
                        ` : ''}
                    </div>
                </div>
                
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="bi bi-person"></i> Client</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Nom:</strong> ${order.customerName}</p>
                        <p><strong>Email:</strong> ${order.customerEmail}</p>
                        <p><strong>Téléphone:</strong> ${order.customerPhone}</p>
                        <p><strong>Adresse:</strong><br>${order.shippingAddress}</p>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="bi bi-cash"></i> Paiement</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Méthode:</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
                        <p><strong>Statut:</strong> 
                            <span class="badge ${paymentInfo.class}">
                                ${paymentInfo.text}
                            </span>
                        </p>
                        
                        <hr>
                        <div class="d-flex justify-content-between">
                            <span>Sous-total:</span>
                            <span>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(subtotal)}</span>
                        </div>
                        ${discount > 0 ? `
                        <div class="d-flex justify-content-between text-success">
                            <span>Remise:</span>
                            <span>-${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(discount)}</span>
                        </div>
                        ` : ''}
                        <div class="d-flex justify-content-between">
                            <span>Livraison:</span>
                            <span>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(shippingCost)}</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between fw-bold">
                            <span>Total:</span>
                            <span class="h5">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(order.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('orderModalTitle').textContent = `Commande ${order.orderNumber}`;
    document.getElementById('orderDetailsContent').innerHTML = content;
    
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

// Changer le statut d'une commande
function changeStatus(orderId) {
    document.getElementById('currentOrderId').value = orderId;
    
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        document.getElementById('newStatus').value = order.status;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    modal.show();
}

// Mettre à jour le statut
function updateOrderStatus() {
    const orderId = parseInt(document.getElementById('currentOrderId').value);
    const newStatus = document.getElementById('newStatus').value;
    const comment = document.getElementById('statusComment').value;
    
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        allOrders[orderIndex].status = newStatus;
        
        // Ajouter un numéro de suivi si expédiée
        if (newStatus === 'shipped' && !allOrders[orderIndex].trackingNumber) {
            allOrders[orderIndex].trackingNumber = `TRK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
        }
        
        filteredOrders = [...allOrders];
        
        // Recharger le tableau
        renderOrdersTable();
        updateOrderStats();
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('statusModal'));
        modal.hide();
        
        showSuccess('Statut de commande mis à jour!');
        
        // Journaliser l'action
        if (comment) {
            console.log(`Commentaire pour la commande ${orderId}: ${comment}`);
        }
    }
}

// Annuler une commande
function cancelOrder(id) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
        const orderIndex = allOrders.findIndex(o => o.id === id);
        
        if (orderIndex !== -1) {
            allOrders[orderIndex].status = 'cancelled';
            filteredOrders = [...allOrders];
            
            renderOrdersTable();
            updateOrderStats();
            
            showSuccess('Commande annulée avec succès!');
        }
    }
}

// Créer une nouvelle commande
function createNewOrder() {
    // Simuler la création d'une commande
    const newId = Math.max(...allOrders.map(o => o.id)) + 1;
    const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
    const today = new Date().toISOString().split('T')[0];
    
    const newOrder = {
        id: newId,
        orderNumber: `CMD-${new Date().getFullYear()}${(newId + 1000).toString().padStart(4, '0')}`,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        date: today,
        total: Math.floor(Math.random() * 500) + 50,
        discountedTotal: Math.floor(Math.random() * 450) + 45,
        products: [
            { id: 1, name: 'Nouveau Produit', quantity: 1, price: 99.99, total: 99.99 }
        ],
        status: 'pending',
        paymentMethod: 'credit_card',
        paymentStatus: 'pending',
        shippingAddress: customer.address,
        shippingMethod: 'standard',
        notes: 'Nouvelle commande créée manuellement',
        trackingNumber: null
    };
    
    allOrders.unshift(newOrder);
    filteredOrders = [...allOrders];
    
    currentPage = 1;
    renderOrdersTable();
    updatePagination();
    updateOrderStats();
    
    showSuccess('Nouvelle commande créée!');
}

// Exporter les commandes
function exportOrders() {
    if (filteredOrders.length === 0) {
        showError('Aucune commande à exporter');
        return;
    }
    
    const headers = ['Numéro', 'Client', 'Date', 'Montant', 'Statut', 'Paiement', 'Produits'];
    const csvRows = [];
    
    csvRows.push(headers.join(';'));
    
    filteredOrders.forEach(order => {
        const productCount = order.products.reduce((sum, p) => sum + p.quantity, 0);
        const statusInfo = getOrderStatusInfo(order.status);
        
        const row = [
            order.orderNumber,
            `"${order.customerName}"`,
            order.date,
            order.total.toString().replace('.', ','),
            statusInfo.text,
            getPaymentStatusInfo(order.paymentStatus).text,
            productCount
        ];
        csvRows.push(row.join(';'));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `commandes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Export CSV terminé!');
}

// Imprimer une commande
function printOrder() {
    window.print();
}

// Générer une facture
function generateInvoice() {
    alert('Génération de facture - Cette fonctionnalité nécessiterait une bibliothèque comme jsPDF pour générer un PDF.');
    // En production: générer un PDF avec jsPDF
}

// Fonctions utilitaires
function getOrderStatusInfo(status) {
    switch(status) {
        case 'pending':
            return { class: 'bg-warning text-dark', icon: 'bi-clock', text: 'En attente' };
        case 'processing':
            return { class: 'bg-info text-white', icon: 'bi-gear', text: 'En traitement' };
        case 'shipped':
            return { class: 'bg-primary text-white', icon: 'bi-truck', text: 'Expédiée' };
        case 'delivered':
            return { class: 'bg-success text-white', icon: 'bi-check-circle', text: 'Livrée' };
        case 'cancelled':
            return { class: 'bg-danger text-white', icon: 'bi-x-circle', text: 'Annulée' };
        default:
            return { class: 'bg-secondary', icon: 'bi-question', text: 'Inconnu' };
    }
}

function getPaymentStatusInfo(status) {
    switch(status) {
        case 'paid':
            return { class: 'bg-success text-white', text: 'Payé' };
        case 'pending':
            return { class: 'bg-warning text-dark', text: 'En attente' };
        case 'failed':
            return { class: 'bg-danger text-white', text: 'Échoué' };
        default:
            return { class: 'bg-secondary', text: 'Inconnu' };
    }
}

function getPaymentMethodText(method) {
    const methods = {
        'credit_card': 'Carte de crédit',
        'paypal': 'PayPal',
        'bank_transfer': 'Virement bancaire',
        'cash': 'Espèces'
    };
    return methods[method] || method;
}

function getShippingMethodText(method) {
    const methods = {
        'standard': 'Standard (3-5 jours)',
        'express': 'Express (24h)',
        'priority': 'Prioritaire (1-2 jours)'
    };
    return methods[method] || method;
}

// Fonctions d'affichage
function showLoading(message) {
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
            <p class="mt-3">${message}</p>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.remove();
}

function showSuccess(message) {
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
    
    setTimeout(() => {
        if (alert.parentNode) alert.remove();
    }, 5000);
}

function showError(message) {
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
    const searchInput = document.getElementById('searchOrders');
    if (searchInput) {
        searchInput.addEventListener('input', filterOrders);
    }
    
    const filterStatus = document.getElementById('filterStatus');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    const filterCustomer = document.getElementById('filterCustomer');
    
    if (filterStatus) filterStatus.addEventListener('change', filterOrders);
    if (filterDateFrom) filterDateFrom.addEventListener('change', filterOrders);
    if (filterDateTo) filterDateTo.addEventListener('change', filterOrders);
    if (filterCustomer) filterCustomer.addEventListener('change', filterOrders);
    
    // Définir la date d'aujourd'hui par défaut pour "Au"
    if (filterDateTo) {
        const today = new Date().toISOString().split('T')[0];
        filterDateTo.value = today;
    }
    
    // Définir la date d'il y a 30 jours par défaut pour "Du"
    if (filterDateFrom) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filterDateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
    }
}

// Exporter pour les tests
if (typeof module !== 'undefined') {
    module.exports = {
        loadOrders,
        filterOrders,
        createNewOrder,
        updateOrderStatus,
        cancelOrder,
        exportOrders
    };
}