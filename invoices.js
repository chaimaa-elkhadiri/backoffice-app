// ============================================
// INVOICES.JS - Gestion CRUD des factures
// ============================================

console.log("Chargement du module factures...");

// Variables globales
let allInvoices = [];
let filteredInvoices = [];
let allInvoiceClients = [];
let currentPage = 1;
const itemsPerPage = 10;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    if (typeof checkAuth === 'function' && checkAuth()) {
        loadInvoices();
        setupEventListeners();
    }
});

// Charger les factures
async function loadInvoices() {
    try {
        showLoading('Chargement des factures...');
        
        // Charger les clients d'abord
        await loadInvoiceClients();
        
        // Générer des factures simulées
        generateSampleInvoices();
        
        filteredInvoices = [...allInvoices];
        renderInvoicesTable();
        updatePagination();
        updateInvoiceStats();
        updateInvoiceTotals();
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showError('Impossible de charger les factures');
        loadFallbackInvoices();
    } finally {
        hideLoading();
    }
}

// Charger les clients pour les factures
async function loadInvoiceClients() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const users = await response.json();
        
        allInvoiceClients = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: `${user.address.street}, ${user.address.zipcode} ${user.address.city}`,
            company: user.company.name,
            taxNumber: `FR${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`
        }));
        
        // Ajouter des clients locaux
        allInvoiceClients.push(
            {
                id: 101,
                name: 'Entreprise Client SARL',
                email: 'facturation@entreprise.com',
                phone: '01 11 22 33 44',
                address: '1 Avenue des Affaires, 75008 Paris',
                company: 'Entreprise Client SARL',
                taxNumber: 'FR123456789'
            },
            {
                id: 102,
                name: 'Particulier VIP',
                email: 'vip@client.com',
                phone: '06 99 88 77 66',
                address: '22 Rue du Luxe, 75016 Paris',
                company: 'Indépendant',
                taxNumber: 'FR987654321'
            }
        );
        
    } catch (error) {
        console.error('Erreur chargement clients:', error);
        allInvoiceClients = [
            {
                id: 1,
                name: 'Client Entreprise',
                email: 'client@entreprise.com',
                phone: '01 23 45 67 89',
                address: '12 Rue de la Paix, 75001 Paris',
                company: 'Entreprise Client SA',
                taxNumber: 'FR123456789'
            }
        ];
    }
}

// Générer des factures d'exemple
function generateSampleInvoices() {
    allInvoices = [];
    
    // Statuts possibles
    const statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    const statusWeights = [1, 3, 4, 1, 1]; // Probabilités
    
    // TVA rates
    const vatRates = [20, 10, 5.5, 2.1];
    
    // Générer 30 factures
    for (let i = 1; i <= 30; i++) {
        const client = allInvoiceClients[Math.floor(Math.random() * allInvoiceClients.length)];
        const invoiceDate = new Date();
        invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 90));
        
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);
        
        // Choisir un statut aléatoire selon les poids
        let statusIndex = weightedRandom(statusWeights);
        let status = statuses[statusIndex];
        
        // Ajuster la date d'échéance si en retard
        if (status === 'overdue') {
            dueDate.setDate(dueDate.getDate() - 15);
        }
        
        // Montants
        const subtotal = Math.floor(Math.random() * 5000) + 100;
        const vatRate = vatRates[Math.floor(Math.random() * vatRates.length)];
        const vatAmount = (subtotal * vatRate) / 100;
        const total = subtotal + vatAmount;
        
        // Générer des lignes de facture
        const lineItems = [];
        const itemCount = Math.floor(Math.random() * 5) + 1;
        
        for (let j = 0; j < itemCount; j++) {
            lineItems.push({
                id: j + 1,
                description: `Produit/service ${j + 1}`,
                quantity: Math.floor(Math.random() * 10) + 1,
                unitPrice: Math.floor(Math.random() * 100) + 10,
                total: 0 // Calculé après
            });
            
            // Calculer le total de la ligne
            lineItems[j].total = lineItems[j].quantity * lineItems[j].unitPrice;
        }
        
        allInvoices.push({
            id: i,
            invoiceNumber: `FAC-${(new Date().getFullYear() - 2000).toString().padStart(2, '0')}${i.toString().padStart(6, '0')}`,
            clientId: client.id,
            clientName: client.name,
            clientEmail: client.email,
            clientAddress: client.address,
            clientCompany: client.company,
            clientTaxNumber: client.taxNumber,
            invoiceDate: invoiceDate.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            subtotal: subtotal,
            vatRate: vatRate,
            vatAmount: vatAmount,
            total: total,
            status: status,
            paymentMethod: ['bank_transfer', 'credit_card', 'check', 'cash'][Math.floor(Math.random() * 4)],
            paymentDate: status === 'paid' ? 
                new Date(invoiceDate.getTime() + Math.random() * (dueDate.getTime() - invoiceDate.getTime()))
                    .toISOString().split('T')[0] : null,
            lineItems: lineItems,
            notes: Math.random() > 0.7 ? 'Facture avec notes spéciales' : '',
            currency: 'EUR',
            language: 'fr'
        });
    }
    
    // Ajouter quelques factures importantes
    allInvoices.push(
        {
            id: 1001,
            invoiceNumber: 'FAC-230001',
            clientId: 101,
            clientName: 'Entreprise Client SARL',
            clientEmail: 'facturation@entreprise.com',
            clientAddress: '1 Avenue des Affaires, 75008 Paris',
            clientCompany: 'Entreprise Client SARL',
            clientTaxNumber: 'FR123456789',
            invoiceDate: '2023-10-01',
            dueDate: '2023-10-31',
            subtotal: 12999.99,
            vatRate: 20,
            vatAmount: 2599.998,
            total: 15599.988,
            status: 'paid',
            paymentMethod: 'bank_transfer',
            paymentDate: '2023-10-15',
            lineItems: [
                { id: 1, description: 'Développement application BackOffice', quantity: 1, unitPrice: 12999.99, total: 12999.99 }
            ],
            notes: 'Facture pour projet de développement',
            currency: 'EUR',
            language: 'fr'
        },
        {
            id: 1002,
            invoiceNumber: 'FAC-230002',
            clientId: 102,
            clientName: 'Particulier VIP',
            clientEmail: 'vip@client.com',
            clientAddress: '22 Rue du Luxe, 75016 Paris',
            clientCompany: 'Indépendant',
            clientTaxNumber: 'FR987654321',
            invoiceDate: '2023-10-15',
            dueDate: '2023-11-14',
            subtotal: 2499.99,
            vatRate: 20,
            vatAmount: 499.998,
            total: 2999.988,
            status: 'sent',
            paymentMethod: 'credit_card',
            paymentDate: null,
            lineItems: [
                { id: 1, description: 'Formation JavaScript avancé', quantity: 1, unitPrice: 1499.99, total: 1499.99 },
                { id: 2, description: 'Support technique 1 mois', quantity: 1, unitPrice: 1000, total: 1000 }
            ],
            notes: 'Formation et support technique',
            currency: 'EUR',
            language: 'fr'
        },
        {
            id: 1003,
            invoiceNumber: 'FAC-230003',
            clientId: 1,
            clientName: 'Client Entreprise',
            clientEmail: 'client@entreprise.com',
            clientAddress: '12 Rue de la Paix, 75001 Paris',
            clientCompany: 'Entreprise Client SA',
            clientTaxNumber: 'FR123456789',
            invoiceDate: '2023-09-01',
            dueDate: '2023-09-30',
            subtotal: 499.99,
            vatRate: 20,
            vatAmount: 99.998,
            total: 599.988,
            status: 'overdue',
            paymentMethod: 'bank_transfer',
            paymentDate: null,
            lineItems: [
                { id: 1, description: 'Maintenance mensuelle', quantity: 1, unitPrice: 499.99, total: 499.99 }
            ],
            notes: 'Facture en retard - relancer client',
            currency: 'EUR',
            language: 'fr'
        }
    );
}

// Données de secours
function loadFallbackInvoices() {
    allInvoices = [
        {
            id: 1,
            invoiceNumber: 'FAC-230001',
            clientId: 1,
            clientName: 'Client Test',
            clientEmail: 'test@client.com',
            clientAddress: '123 Rue Test, 75000 Paris',
            clientCompany: 'Entreprise Test',
            clientTaxNumber: 'FR123456789',
            invoiceDate: '2023-10-01',
            dueDate: '2023-10-31',
            subtotal: 1000,
            vatRate: 20,
            vatAmount: 200,
            total: 1200,
            status: 'paid',
            paymentMethod: 'bank_transfer',
            paymentDate: '2023-10-15',
            lineItems: [
                { id: 1, description: 'Service de consultation', quantity: 1, unitPrice: 1000, total: 1000 }
            ],
            notes: '',
            currency: 'EUR',
            language: 'fr'
        }
    ];
    
    filteredInvoices = [...allInvoices];
    renderInvoicesTable();
    updatePagination();
    updateInvoiceStats();
    updateInvoiceTotals();
}

// Fonction pour choisir aléatoirement avec poids
function weightedRandom(weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
        if (random < weights[i]) return i;
        random -= weights[i];
    }
    
    return weights.length - 1;
}

// Afficher le tableau des factures
function renderInvoicesTable() {
    const tableBody = document.getElementById('invoicesTableBody');
    if (!tableBody) return;
    
    // Calculer les factures à afficher
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const invoicesToShow = filteredInvoices.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    if (invoicesToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5">
                    <div class="empty-state">
                        <i class="bi bi-receipt display-4 text-muted"></i>
                        <h4 class="mt-3">Aucune facture trouvée</h4>
                        <p class="text-muted">Essayez de modifier vos filtres de recherche</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    invoicesToShow.forEach(invoice => {
        const row = document.createElement('tr');
        
        // Déterminer la classe du badge de statut
        const statusInfo = getInvoiceStatusInfo(invoice.status);
        
        // Formatage des dates
        const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('fr-FR');
        const dueDate = new Date(invoice.dueDate).toLocaleDateString('fr-FR');
        
        // Vérifier si la facture est en retard
        const today = new Date();
        const due = new Date(invoice.dueDate);
        const isOverdue = invoice.status !== 'paid' && invoice.status !== 'cancelled' && today > due;
        
        // Ajouter une classe si en retard
        const dueDateClass = isOverdue ? 'text-danger' : '';
        
        // Formatage des montants
        const subtotalFormatted = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: invoice.currency
        }).format(invoice.subtotal);
        
        const vatFormatted = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: invoice.currency
        }).format(invoice.vatAmount);
        
        const totalFormatted = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: invoice.currency
        }).format(invoice.total);
        
        row.innerHTML = `
            <td>
                <strong>${invoice.invoiceNumber}</strong><br>
                <small class="text-muted">ID: ${invoice.id}</small>
            </td>
            <td>
                <div>
                    <strong>${invoice.clientName}</strong><br>
                    <small class="text-muted">${invoice.clientCompany}</small>
                </div>
            </td>
            <td>${invoiceDate}</td>
            <td class="${dueDateClass}">
                ${dueDate}
                ${isOverdue ? '<br><small class="text-danger">En retard!</small>' : ''}
            </td>
            <td>${subtotalFormatted}</td>
            <td>
                ${vatFormatted}<br>
                <small class="text-muted">${invoice.vatRate}%</small>
            </td>
            <td>
                <strong>${totalFormatted}</strong>
            </td>
            <td>
                <span class="badge ${statusInfo.class}">
                    <i class="bi ${statusInfo.icon}"></i> ${statusInfo.text}
                </span>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-info" onclick="viewInvoice(${invoice.id})" 
                            title="Voir détails">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editInvoice(${invoice.id})"
                            title="Modifier">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="markAsPaid(${invoice.id})"
                            title="Marquer comme payée">
                        <i class="bi bi-check-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteInvoice(${invoice.id})"
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
    const pagination = document.getElementById('invoicesPagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    
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
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderInvoicesTable();
    updatePagination();
}

// Mettre à jour les statistiques
function updateInvoiceStats() {
    const totalInvoices = allInvoices.length;
    const unpaidInvoices = allInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').length;
    const paidInvoices = allInvoices.filter(i => i.status === 'paid').length;
    
    // Calculer le montant total
    const totalAmount = allInvoices
        .filter(i => i.status !== 'cancelled')
        .reduce((sum, invoice) => sum + invoice.total, 0);
    
    document.getElementById('totalInvoicesCount').textContent = totalInvoices;
    document.getElementById('unpaidInvoicesCount').textContent = unpaidInvoices;
    document.getElementById('paidInvoicesCount').textContent = paidInvoices;
    document.getElementById('totalAmount').textContent = 
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalAmount);
    
    // Mettre à jour le badge dans la sidebar
    const unpaidBadge = document.getElementById('unpaidInvoicesBadge');
    if (unpaidBadge) {
        unpaidBadge.textContent = unpaidInvoices;
    }
}

// Mettre à jour les totaux
function updateInvoiceTotals() {
    const totalHT = filteredInvoices
        .filter(i => i.status !== 'cancelled')
        .reduce((sum, invoice) => sum + invoice.subtotal, 0);
    
    const totalTVA = filteredInvoices
        .filter(i => i.status !== 'cancelled')
        .reduce((sum, invoice) => sum + invoice.vatAmount, 0);
    
    const totalTTC = filteredInvoices
        .filter(i => i.status !== 'cancelled')
        .reduce((sum, invoice) => sum + invoice.total, 0);
    
    document.getElementById('totalHT').textContent = 
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalHT);
    
    document.getElementById('totalTVA').textContent = 
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalTVA);
    
    document.getElementById('totalTTC').textContent = 
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalTTC);
}

// Filtrer les factures
function filterInvoices() {
    const searchTerm = document.getElementById('searchInvoices').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const periodFilter = document.getElementById('filterPeriod').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    
    filteredInvoices = allInvoices.filter(invoice => {
        // Recherche par numéro de facture, client ou email
        const matchesSearch = !searchTerm || 
            invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
            invoice.clientName.toLowerCase().includes(searchTerm) ||
            invoice.clientCompany.toLowerCase().includes(searchTerm) ||
            invoice.clientEmail.toLowerCase().includes(searchTerm);
        
        // Filtre par statut
        const matchesStatus = !statusFilter || invoice.status === statusFilter;
        
        // Filtre par période
        let matchesPeriod = true;
        if (periodFilter) {
            const invoiceDate = new Date(invoice.invoiceDate);
            const today = new Date();
            
            switch(periodFilter) {
                case 'today':
                    matchesPeriod = invoiceDate.toDateString() === today.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date();
                    weekAgo.setDate(today.getDate() - 7);
                    matchesPeriod = invoiceDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date();
                    monthAgo.setMonth(today.getMonth() - 1);
                    matchesPeriod = invoiceDate >= monthAgo;
                    break;
                case 'quarter':
                    const quarterAgo = new Date();
                    quarterAgo.setMonth(today.getMonth() - 3);
                    matchesPeriod = invoiceDate >= quarterAgo;
                    break;
                case 'year':
                    const yearAgo = new Date();
                    yearAgo.setFullYear(today.getFullYear() - 1);
                    matchesPeriod = invoiceDate >= yearAgo;
                    break;
            }
        }
        
        // Filtre par date
        let matchesDate = true;
        if (dateFrom) {
            matchesDate = matchesDate && invoice.invoiceDate >= dateFrom;
        }
        if (dateTo) {
            matchesDate = matchesDate && invoice.invoiceDate <= dateTo;
        }
        
        return matchesSearch && matchesStatus && matchesPeriod && matchesDate;
    });
    
    currentPage = 1;
    renderInvoicesTable();
    updatePagination();
    updateInvoiceTotals();
}

// Recherche en temps réel
function searchInvoices() {
    filterInvoices();
}

// Voir les détails d'une facture
function viewInvoice(id) {
    const invoice = allInvoices.find(i => i.id === id);
    if (!invoice) return;
    
    const statusInfo = getInvoiceStatusInfo(invoice.status);
    const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const dueDate = new Date(invoice.dueDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const paymentDate = invoice.paymentDate ? 
        new Date(invoice.paymentDate).toLocaleDateString('fr-FR') : 'Non payée';
    
    // Calculer les jours de retard
    const today = new Date();
    const due = new Date(invoice.dueDate);
    const daysOverdue = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
    
    const content = `
        <div class="invoice-header mb-4">
            <div class="row">
                <div class="col-md-6">
                    <h4>Facture ${invoice.invoiceNumber}</h4>
                    <p class="text-muted">Date d'émission: ${invoiceDate}</p>
                </div>
                <div class="col-md-6 text-end">
                    <span class="badge ${statusInfo.class} fs-6">
                        <i class="bi ${statusInfo.icon}"></i> ${statusInfo.text}
                    </span>
                    ${daysOverdue > 0 ? `
                        <div class="mt-2">
                            <span class="badge bg-danger">
                                En retard de ${daysOverdue} jour(s)
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="bi bi-building"></i> Émetteur</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>BackOffice Solutions</strong><br>
                        123 Avenue de la Technologie<br>
                        75015 Paris, France<br>
                        SIRET: 123 456 789 00012<br>
                        TVA Intra: FR12345678901</p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="bi bi-person"></i> Client</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>${invoice.clientCompany}</strong><br>
                        ${invoice.clientName}<br>
                        ${invoice.clientAddress}<br>
                        ${invoice.clientEmail}<br>
                        ${invoice.clientPhone || 'Tél: Non renseigné'}<br>
                        N° TVA: ${invoice.clientTaxNumber}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mb-3">
            <div class="card-header bg-light">
                <h6 class="mb-0"><i class="bi bi-list"></i> Détails de la facture</h6>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th class="text-center">Quantité</th>
                                <th class="text-end">Prix unitaire</th>
                                <th class="text-end">Total HT</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.lineItems.map(item => `
                                <tr>
                                    <td>${item.description}</td>
                                    <td class="text-center">${item.quantity}</td>
                                    <td class="text-end">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: invoice.currency }).format(item.unitPrice)}</td>
                                    <td class="text-end">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: invoice.currency }).format(item.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end"><strong>Total HT:</strong></td>
                                <td class="text-end"><strong>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: invoice.currency }).format(invoice.subtotal)}</strong></td>
                            </tr>
                            <tr>
                                <td colspan="3" class="text-end">TVA (${invoice.vatRate}%):</td>
                                <td class="text-end">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: invoice.currency }).format(invoice.vatAmount)}</td>
                            </tr>
                            <tr class="table-active">
                                <td colspan="3" class="text-end"><strong>Total TTC:</strong></td>
                                <td class="text-end"><strong class="fs-5">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: invoice.currency }).format(invoice.total)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="bi bi-calendar"></i> Dates importantes</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Date de facturation:</strong> ${invoiceDate}</p>
                        <p><strong>Date d'échéance:</strong> ${dueDate}</p>
                        <p><strong>Date de paiement:</strong> ${paymentDate}</p>
                        <p><strong>Méthode de paiement:</strong> ${getPaymentMethodText(invoice.paymentMethod)}</p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="bi bi-chat"></i> Notes</h6>
                    </div>
                    <div class="card-body">
                        ${invoice.notes ? `<p>${invoice.notes}</p>` : '<p class="text-muted">Aucune note</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('invoiceModalTitle').textContent = `Facture ${invoice.invoiceNumber}`;
    document.getElementById('invoiceDetailsContent').innerHTML = content;
    
    const modal = new bootstrap.Modal(document.getElementById('invoiceDetailsModal'));
    modal.show();
}

// Créer une nouvelle facture
function createNewInvoice() {
    // Remplir la liste des clients
    const clientSelect = document.getElementById('invoiceClient');
    clientSelect.innerHTML = '<option value="">Sélectionner un client</option>';
    
    allInvoiceClients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = `${client.company} - ${client.name}`;
        clientSelect.appendChild(option);
    });
    
    const modal = new bootstrap.Modal(document.getElementById('newInvoiceModal'));
    modal.show();
}

// Créer une facture à partir du formulaire
function createInvoiceFromForm() {
    const form = document.getElementById('invoiceForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const clientId = parseInt(document.getElementById('invoiceClient').value);
    const client = allInvoiceClients.find(c => c.id === clientId);
    
    if (!client) {
        showError('Veuillez sélectionner un client valide');
        return;
    }
    
    const newId = Math.max(...allInvoices.map(i => i.id)) + 1;
    const invoiceDate = document.getElementById('invoiceDate').value;
    const dueDate = document.getElementById('invoiceDueDate').value;
    const vatRate = parseFloat(document.getElementById('invoiceVAT').value);
    const notes = document.getElementById('invoiceNotes').value;
    
    // Générer des lignes de facture d'exemple
    const lineItems = [
        { id: 1, description: 'Service de consultation', quantity: 1, unitPrice: 1000, total: 1000 },
        { id: 2, description: 'Support technique', quantity: 2, unitPrice: 250, total: 500 }
    ];
    
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount;
    
    const newInvoice = {
        id: newId,
        invoiceNumber: `FAC-${new Date().getFullYear().toString().substring(2)}${(newId + 1000).toString().padStart(4, '0')}`,
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        clientAddress: client.address,
        clientCompany: client.company,
        clientTaxNumber: client.taxNumber,
        clientPhone: client.phone,
        invoiceDate: invoiceDate,
        dueDate: dueDate,
        subtotal: subtotal,
        vatRate: vatRate,
        vatAmount: vatAmount,
        total: total,
        status: 'draft',
        paymentMethod: 'bank_transfer',
        paymentDate: null,
        lineItems: lineItems,
        notes: notes,
        currency: 'EUR',
        language: 'fr'
    };
    
    allInvoices.unshift(newInvoice);
    filteredInvoices = [...allInvoices];
    
    currentPage = 1;
    renderInvoicesTable();
    updatePagination();
    updateInvoiceStats();
    updateInvoiceTotals();
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('newInvoiceModal'));
    modal.hide();
    
    showSuccess('Nouvelle facture créée avec succès!');
}

// Modifier une facture
function editInvoice(id) {
    const invoice = allInvoices.find(i => i.id === id);
    if (!invoice) return;
    
    alert(`Modification de la facture ${invoice.invoiceNumber}\n\nCette fonctionnalité nécessiterait un formulaire d'édition complet.`);
    // En production: ouvrir un modal d'édition
}

// Marquer comme payée
function markAsPaid(id) {
    const invoice = allInvoices.find(i => i.id === id);
    if (!invoice) return;
    
    if (invoice.status === 'paid') {
        showError('Cette facture est déjà marquée comme payée');
        return;
    }
    
    if (confirm(`Marquer la facture ${invoice.invoiceNumber} comme payée ?`)) {
        invoice.status = 'paid';
        invoice.paymentDate = new Date().toISOString().split('T')[0];
        
        filteredInvoices = [...allInvoices];
        renderInvoicesTable();
        updateInvoiceStats();
        updateInvoiceTotals();
        
        showSuccess(`Facture ${invoice.invoiceNumber} marquée comme payée!`);
    }
}

// Supprimer une facture
function deleteInvoice(id) {
    const invoice = allInvoices.find(i => i.id === id);
    if (!invoice) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoiceNumber} ?\n\nCette action est irréversible.`)) {
        allInvoices = allInvoices.filter(i => i.id !== id);
        filteredInvoices = [...allInvoices];
        
        // Ajuster la pagination si nécessaire
        const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1;
        }
        
        renderInvoicesTable();
        updatePagination();
        updateInvoiceStats();
        updateInvoiceTotals();
        
        showSuccess('Facture supprimée avec succès!');
    }
}

// Exporter les factures
function exportInvoices() {
    if (filteredInvoices.length === 0) {
        showError('Aucune facture à exporter');
        return;
    }
    
    const headers = ['N° Facture', 'Client', 'Date', 'Échéance', 'Montant HT', 'TVA', 'Total TTC', 'Statut', 'Date paiement'];
    const csvRows = [];
    
    csvRows.push(headers.join(';'));
    
    filteredInvoices.forEach(invoice => {
        const statusInfo = getInvoiceStatusInfo(invoice.status);
        
        const row = [
            invoice.invoiceNumber,
            `"${invoice.clientCompany}"`,
            invoice.invoiceDate,
            invoice.dueDate,
            invoice.subtotal.toString().replace('.', ','),
            `${invoice.vatRate}%`,
            invoice.total.toString().replace('.', ','),
            statusInfo.text,
            invoice.paymentDate || 'Non payée'
        ];
        csvRows.push(row.join(';'));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `factures_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Export CSV terminé!');
}

// Générer un rapport financier
function generateFinancialReport() {
    const paidInvoices = allInvoices.filter(i => i.status === 'paid');
    const unpaidInvoices = allInvoices.filter(i => i.status === 'sent' || i.status === 'overdue');
    const draftInvoices = allInvoices.filter(i => i.status === 'draft');
    
    let report = `=== RAPPORT FINANCIER ===\n\n`;
    report += `Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
    report += `Heure: ${new Date().toLocaleTimeString('fr-FR')}\n`;
    
    report += `\n--- STATISTIQUES GLOBALES ---\n`;
    report += `Total factures: ${allInvoices.length}\n`;
    report += `Factures payées: ${paidInvoices.length}\n`;
    report += `Factures impayées: ${unpaidInvoices.length}\n`;
    report += `Factures brouillon: ${draftInvoices.length}\n`;
    
    // Chiffre d'affaires
    const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const unpaidAmount = unpaidInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    report += `\n--- CHIFFRE D'AFFAIRES ---\n`;
    report += `CA réalisé: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}\n`;
    report += `En attente de paiement: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(unpaidAmount)}\n`;
    
    if (unpaidInvoices.length > 0) {
        report += `\n--- FACTURES IMPAYÉES ---\n`;
        unpaidInvoices.forEach(invoice => {
            const dueDate = new Date(invoice.dueDate);
            const today = new Date();
            const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
            
            report += `• ${invoice.invoiceNumber} - ${invoice.clientCompany}: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(invoice.total)}`;
            if (daysOverdue > 0) {
                report += ` (${daysOverdue} jour(s) de retard)\n`;
            } else {
                report += ` (échéance: ${dueDate.toLocaleDateString('fr-FR')})\n`;
            }
        });
    }
    
    // Top clients
    report += `\n--- TOP 5 CLIENTS ---\n`;
    const clientTotals = {};
    paidInvoices.forEach(invoice => {
        if (!clientTotals[invoice.clientId]) {
            clientTotals[invoice.clientId] = {
                name: invoice.clientCompany,
                total: 0
            };
        }
        clientTotals[invoice.clientId].total += invoice.total;
    });
    
    const topClients = Object.values(clientTotals)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    
    topClients.forEach((client, index) => {
        report += `${index + 1}. ${client.name}: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(client.total)}\n`;
    });
    
    // Créer et télécharger le rapport
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `rapport_financier_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Rapport financier généré!');
}

// Imprimer une facture
function printInvoice() {
    window.print();
}

// Télécharger une facture en PDF
function downloadInvoicePDF() {
    alert('Téléchargement PDF - Cette fonctionnalité nécessiterait une bibliothèque comme jsPDF.');
    // En production: générer un PDF avec jsPDF
}

// Envoyer une facture par email
function sendInvoiceEmail() {
    alert('Envoi par email - Cette fonctionnalité nécessiterait un backend pour envoyer des emails.');
    // En production: envoyer un email via une API
}

// Fonctions utilitaires
function getInvoiceStatusInfo(status) {
    switch(status) {
        case 'draft':
            return { class: 'bg-secondary text-white', icon: 'bi-file-earmark', text: 'Brouillon' };
        case 'sent':
            return { class: 'bg-info text-white', icon: 'bi-send', text: 'Envoyée' };
        case 'paid':
            return { class: 'bg-success text-white', icon: 'bi-check-circle', text: 'Payée' };
        case 'overdue':
            return { class: 'bg-danger text-white', icon: 'bi-exclamation-triangle', text: 'En retard' };
        case 'cancelled':
            return { class: 'bg-dark text-white', icon: 'bi-x-circle', text: 'Annulée' };
        default:
            return { class: 'bg-warning', icon: 'bi-question', text: 'Inconnu' };
    }
}

function getPaymentMethodText(method) {
    const methods = {
        'bank_transfer': 'Virement bancaire',
        'credit_card': 'Carte de crédit',
        'check': 'Chèque',
        'cash': 'Espèces'
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
    const searchInput = document.getElementById('searchInvoices');
    if (searchInput) {
        searchInput.addEventListener('input', filterInvoices);
    }
    
    const filterStatus = document.getElementById('filterStatus');
    const filterPeriod = document.getElementById('filterPeriod');
    const filterDateFrom = document.getElementById('filterDateFrom');
    const filterDateTo = document.getElementById('filterDateTo');
    
    if (filterStatus) filterStatus.addEventListener('change', filterInvoices);
    if (filterPeriod) filterPeriod.addEventListener('change', filterInvoices);
    if (filterDateFrom) filterDateFrom.addEventListener('change', filterInvoices);
    if (filterDateTo) filterDateTo.addEventListener('change', filterInvoices);
    
    // Définir la date d'aujourd'hui par défaut pour "Au"
    if (filterDateTo) {
        const today = new Date().toISOString().split('T')[0];
        filterDateTo.value = today;
    }
    
    // Définir la date d'il y a 90 jours par défaut pour "Du"
    if (filterDateFrom) {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        filterDateFrom.value = ninetyDaysAgo.toISOString().split('T')[0];
    }
}

// Exporter pour les tests
if (typeof module !== 'undefined') {
    module.exports = {
        loadInvoices,
        filterInvoices,
        createNewInvoice,
        markAsPaid,
        deleteInvoice,
        exportInvoices
    };
}