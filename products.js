// ============================================
// PRODUCTS.JS - Gestion CRUD des produits
// ============================================

console.log("Chargement du module produits...");

// Variables globales
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 10;
let productToDelete = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    if (typeof checkAuth === 'function' && checkAuth()) {
        loadProducts();
        setupEventListeners();
    }
});

// Charger les produits depuis l'API
async function loadProducts() {
    try {
        showLoading('Chargement des produits...');
        
        // Récupérer depuis l'API
        const response = await fetch('https://dummyjson.com/products?limit=50');
        const data = await response.json();
        
        // Transformer les données
        allProducts = data.products.map(product => ({
            id: product.id,
            name: product.title,
            brand: product.brand || 'Non spécifié',
            category: product.category,
            price: product.price,
            stock: product.stock || Math.floor(Math.random() * 100),
            description: product.description,
            rating: product.rating,
            status: getStockStatus(product.stock || 0),
            image: product.thumbnail || 'https://via.placeholder.com/150',
            discount: product.discountPercentage || 0,
            sku: `SKU-${product.id.toString().padStart(6, '0')}`,
            weight: `${Math.floor(Math.random() * 5) + 1} kg`,
            dimensions: `${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 30) + 10}x${Math.floor(Math.random() * 20) + 5} cm`
        }));
        
        // Ajouter quelques produits locaux
        allProducts.push(
            {
                id: 10001,
                name: 'iPhone 14 Pro Max',
                brand: 'Apple',
                category: 'electronics',
                price: 1299.99,
                stock: 25,
                description: 'Smartphone haut de gamme Apple avec écran Dynamic Island',
                rating: 4.8,
                status: 'available',
                image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-pro-model-unselect-gallery-2-202209?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1660753617559',
                discount: 0,
                sku: 'SKU-APPLE-001',
                weight: '0.24 kg',
                dimensions: '15.5x7.85x0.78 cm'
            },
            {
                id: 10002,
                name: 'MacBook Pro 16"',
                brand: 'Apple',
                category: 'electronics',
                price: 2499.99,
                stock: 12,
                description: 'Ordinateur portable professionnel avec chip M2 Pro',
                rating: 4.9,
                status: 'available',
                image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp16-spacegray-select-202301?wid=452&hei=420&fmt=jpeg&qlt=95&.v=1671304673202',
                discount: 5,
                sku: 'SKU-APPLE-002',
                weight: '2.2 kg',
                dimensions: '35.57x24.81x1.68 cm'
            },
            {
                id: 10003,
                name: 'T-shirt Logo Basic',
                brand: 'Nike',
                category: 'clothing',
                price: 29.99,
                stock: 150,
                description: 'T-shirt en coton 100% avec logo brodé',
                rating: 4.2,
                status: 'available',
                image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/44e79113-2f4a-4c6a-80d6-bc6f6c6e3b5a/t-shirt-logo-sportswear-HnqfJ3.png',
                discount: 15,
                sku: 'SKU-NIKE-001',
                weight: '0.2 kg',
                dimensions: '30x40 cm'
            }
        );
        
        filteredProducts = [...allProducts];
        renderProductsTable();
        updatePagination();
        updateStats();
        updateProductCounters();
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showError('Impossible de charger les produits');
        // Charger des données de secours
        loadFallbackProducts();
    } finally {
        hideLoading();
    }
}

// Données de secours
function loadFallbackProducts() {
    allProducts = [
        {
            id: 1,
            name: 'Smartphone Android',
            brand: 'Samsung',
            category: 'electronics',
            price: 699.99,
            stock: 45,
            description: 'Smartphone Android avec écran AMOLED',
            rating: 4.5,
            status: 'available',
            image: 'https://via.placeholder.com/150',
            discount: 10,
            sku: 'SKU-SAM-001',
            weight: '0.18 kg',
            dimensions: '15x7x0.8 cm'
        },
        {
            id: 2,
            name: 'Casque Bluetooth',
            brand: 'Sony',
            category: 'electronics',
            price: 199.99,
            stock: 8,
            description: 'Casque sans fil avec réduction de bruit',
            rating: 4.7,
            status: 'lowstock',
            image: 'https://via.placeholder.com/150',
            discount: 0,
            sku: 'SKU-SONY-001',
            weight: '0.25 kg',
            dimensions: '20x18x8 cm'
        },
        {
            id: 3,
            name: 'Livre JavaScript',
            brand: 'Éditions O\'Reilly',
            category: 'books',
            price: 39.99,
            stock: 0,
            description: 'Guide complet du langage JavaScript',
            rating: 4.8,
            status: 'outofstock',
            image: 'https://via.placeholder.com/150',
            discount: 0,
            sku: 'SKU-BOOK-001',
            weight: '0.8 kg',
            dimensions: '23x18x3 cm'
        }
    ];
    
    filteredProducts = [...allProducts];
    renderProductsTable();
    updatePagination();
    updateStats();
    updateProductCounters();
}

// Afficher le tableau des produits
function renderProductsTable() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    
    // Calculer les produits à afficher
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    if (productsToShow.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="empty-state">
                        <i class="bi bi-box display-4 text-muted"></i>
                        <h4 class="mt-3">Aucun produit trouvé</h4>
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
    
    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        
        // Déterminer la classe du badge de statut
        let statusBadgeClass = 'badge-success';
        let statusText = 'Disponible';
        
        switch(product.status) {
            case 'lowstock':
                statusBadgeClass = 'badge-warning';
                statusText = 'Stock faible';
                break;
            case 'outofstock':
                statusBadgeClass = 'badge-danger';
                statusText = 'Rupture';
                break;
            case 'discontinued':
                statusBadgeClass = 'badge-secondary';
                statusText = 'Discontinué';
                break;
        }
        
        // Formatage du prix
        const priceFormatted = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(product.price);
        
        // Icône de catégorie
        const categoryIcon = getCategoryIcon(product.category);
        
        // Étoiles pour la note
        const stars = getStarRating(product.rating);
        
        row.innerHTML = `
            <td>
                <small class="text-muted">#${product.id}</small><br>
                <small>${product.sku}</small>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${product.image}" alt="${product.name}" 
                         class="product-thumb me-3" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                    <div>
                        <strong>${product.name}</strong><br>
                        <small class="text-muted">${product.brand}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-light text-dark">
                    <i class="bi ${categoryIcon} me-1"></i>${getCategoryName(product.category)}
                </span>
            </td>
            <td>
                <strong>${priceFormatted}</strong>
                ${product.discount > 0 ? `
                    <br><small class="text-success">-${product.discount}%</small>
                ` : ''}
            </td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar ${getStockColor(product.stock)}" 
                         role="progressbar" style="width: ${Math.min(product.stock, 100)}%">
                        ${product.stock}
                    </div>
                </div>
                <small>unités</small>
            </td>
            <td>
                <span class="badge ${statusBadgeClass}">
                    ${statusText}
                </span>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    ${stars}
                    <small class="ms-1">${product.rating.toFixed(1)}</small>
                </div>
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-info" onclick="viewProduct(${product.id})" 
                            title="Voir détails">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id})"
                            title="Modifier">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteProduct(${product.id})"
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
    const pagination = document.getElementById('productsPagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
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
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(1)">1</a>`;
        pagination.appendChild(li);
        
        if (startPage > 2) {
            const liDots = document.createElement('li');
            liDots.className = 'page-item disabled';
            liDots.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(liDots);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(li);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const liDots = document.createElement('li');
            liDots.className = 'page-item disabled';
            liDots.innerHTML = `<span class="page-link">...</span>`;
            pagination.appendChild(liDots);
        }
        
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a>`;
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
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderProductsTable();
    updatePagination();
    updateStats();
    
    // Scroll vers le haut du tableau
    document.getElementById('productsTable').scrollIntoView({ behavior: 'smooth' });
}

// Mettre à jour les statistiques
function updateStats() {
    const startRow = (currentPage - 1) * itemsPerPage + 1;
    const endRow = Math.min(currentPage * itemsPerPage, filteredProducts.length);
    
    document.getElementById('startRow').textContent = startRow;
    document.getElementById('endRow').textContent = endRow;
    document.getElementById('totalRows').textContent = filteredProducts.length;
}

// Mettre à jour les compteurs
function updateProductCounters() {
    const totalProducts = allProducts.length;
    const lowStock = allProducts.filter(p => p.status === 'lowstock').length;
    const outOfStock = allProducts.filter(p => p.status === 'outofstock').length;
    
    // Calculer la valeur totale du stock
    const stockValue = allProducts.reduce((total, product) => {
        return total + (product.price * product.stock);
    }, 0);
    
    document.getElementById('totalProductsCount').textContent = totalProducts;
    document.getElementById('lowStockCount').textContent = lowStock;
    document.getElementById('outOfStockCount').textContent = outOfStock;
    document.getElementById('stockValue').textContent = 
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stockValue);
}

// Filtrer les produits
function filterProducts() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    const stockFilter = document.getElementById('filterStock').value;
    const priceFilter = document.getElementById('filterPrice').value;
    
    filteredProducts = allProducts.filter(product => {
        // Recherche par nom, marque ou description
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.sku.toLowerCase().includes(searchTerm);
        
        // Filtre par catégorie
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        
        // Filtre par stock
        let matchesStock = true;
        if (stockFilter) {
            switch(stockFilter) {
                case 'low':
                    matchesStock = product.stock < 10 && product.stock > 0;
                    break;
                case 'out':
                    matchesStock = product.stock === 0;
                    break;
                case 'normal':
                    matchesStock = product.stock >= 10;
                    break;
            }
        }
        
        // Filtre par prix
        let matchesPrice = true;
        if (priceFilter) {
            switch(priceFilter) {
                case 'low':
                    matchesPrice = product.price < 50;
                    break;
                case 'medium':
                    matchesPrice = product.price >= 50 && product.price <= 200;
                    break;
                case 'high':
                    matchesPrice = product.price > 200;
                    break;
            }
        }
        
        return matchesSearch && matchesCategory && matchesStock && matchesPrice;
    });
    
    currentPage = 1;
    renderProductsTable();
    updatePagination();
    updateStats();
}

// Recherche en temps réel
function searchProducts() {
    filterProducts();
}

// Réinitialiser les filtres
function resetFilters() {
    document.getElementById('searchProducts').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStock').value = '';
    document.getElementById('filterPrice').value = '';
    filterProducts();
}

// Voir les détails d'un produit
function viewProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    // Créer un modal de détails
    const modalHTML = `
        <div class="modal fade" id="viewProductModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-box-seam"></i> Détails du produit
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <img src="${product.image}" alt="${product.name}" 
                                     class="img-fluid rounded mb-3" style="max-height: 250px;">
                                <h4>${product.name}</h4>
                                <p class="text-muted">${product.brand}</p>
                                <div class="mb-3">
                                    ${getStarRating(product.rating)}
                                    <span class="ms-2">${product.rating.toFixed(1)}/5</span>
                                </div>
                                <span class="badge ${getStockBadgeClass(product.status)}">
                                    ${getStockStatusText(product.status)}
                                </span>
                            </div>
                            
                            <div class="col-md-8">
                                <h6 class="border-bottom pb-2">Informations produit</h6>
                                <div class="row">
                                    <div class="col-md-6">
                                        <p><strong><i class="bi bi-upc"></i> SKU:</strong><br>${product.sku}</p>
                                        <p><strong><i class="bi bi-grid"></i> Catégorie:</strong><br>
                                            <span class="badge bg-light text-dark">
                                                ${getCategoryName(product.category)}
                                            </span>
                                        </p>
                                        <p><strong><i class="bi bi-box"></i> Stock:</strong><br>
                                            <span class="${product.stock < 10 ? 'text-warning' : 'text-success'}">
                                                ${product.stock} unités
                                            </span>
                                        </p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong><i class="bi bi-currency-euro"></i> Prix:</strong><br>
                                            <span class="h4 text-primary">
                                                ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}
                                            </span>
                                            ${product.discount > 0 ? `
                                                <br><small class="text-success">
                                                    <s>${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price * 1.1)}</s>
                                                    &nbsp;-${product.discount}%
                                                </small>
                                            ` : ''}
                                        </p>
                                        <p><strong><i class="bi bi-rulers"></i> Dimensions:</strong><br>${product.dimensions}</p>
                                        <p><strong><i class="bi bi-speedometer2"></i> Poids:</strong><br>${product.weight}</p>
                                    </div>
                                </div>
                                
                                <h6 class="border-bottom pb-2 mt-3">Description</h6>
                                <p>${product.description || 'Aucune description disponible.'}</p>
                                
                                <div class="mt-4 p-3 bg-light rounded">
                                    <h6><i class="bi bi-graph-up"></i> Statistiques du produit</h6>
                                    <div class="row text-center">
                                        <div class="col-md-4">
                                            <div class="stat-item">
                                                <div class="stat-value">${product.stock}</div>
                                                <div class="stat-label">En stock</div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="stat-item">
                                                <div class="stat-value">${product.rating.toFixed(1)}</div>
                                                <div class="stat-label">Note moyenne</div>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="stat-item">
                                                <div class="stat-value">${product.discount}%</div>
                                                <div class="stat-label">Réduction</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle"></i> Fermer
                        </button>
                        <button type="button" class="btn btn-primary" onclick="editProduct(${product.id})" data-bs-dismiss="modal">
                            <i class="bi bi-pencil"></i> Modifier
                        </button>
                        <button type="button" class="btn btn-outline-success" onclick="printProductLabel(${product.id})">
                            <i class="bi bi-printer"></i> Étiquette
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
    const modal = new bootstrap.Modal(document.getElementById('viewProductModal'));
    modal.show();
    
    // Nettoyer après fermeture
    document.getElementById('viewProductModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Éditer un produit
function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    // Remplir le formulaire
    document.getElementById('modalTitle').textContent = 'Modifier le produit';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productBrand').value = product.brand;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productRating').value = product.rating;
    document.getElementById('productStatus').value = product.status;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImage').value = product.image || '';
    
    // Changer le texte du bouton
    const saveBtn = document.querySelector('#addProductModal .btn-primary');
    saveBtn.innerHTML = '<i class="bi bi-check-circle"></i> Mettre à jour';
    saveBtn.onclick = updateProduct;
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
}

// Ajouter un nouveau produit
function addNewProduct() {
    // Réinitialiser le formulaire
    document.getElementById('modalTitle').textContent = 'Ajouter un produit';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productStatus').value = 'available';
    document.getElementById('productRating').value = '4.0';
    
    // Changer le texte du bouton
    const saveBtn = document.querySelector('#addProductModal .btn-primary');
    saveBtn.innerHTML = '<i class="bi bi-check-circle"></i> Enregistrer';
    saveBtn.onclick = saveProduct;
    
    // Afficher le modal
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
}

// Sauvegarder un nouveau produit
function saveProduct() {
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const newId = Math.max(...allProducts.map(p => p.id)) + 1;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const rating = parseFloat(document.getElementById('productRating').value) || 4.0;
    
    const newProduct = {
        id: newId,
        name: document.getElementById('productName').value,
        brand: document.getElementById('productBrand').value,
        category: document.getElementById('productCategory').value,
        price: price,
        stock: stock,
        description: document.getElementById('productDescription').value,
        rating: rating,
        status: getStockStatus(stock),
        image: document.getElementById('productImage').value || 'https://via.placeholder.com/150',
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0,
        sku: `SKU-${newId.toString().padStart(6, '0')}`,
        weight: `${Math.floor(Math.random() * 5) + 1} kg`,
        dimensions: `${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 30) + 10}x${Math.floor(Math.random() * 20) + 5} cm`
    };
    
    allProducts.unshift(newProduct); // Ajouter au début
    filteredProducts = [...allProducts];
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal.hide();
    
    // Recharger le tableau
    currentPage = 1;
    renderProductsTable();
    updatePagination();
    updateStats();
    updateProductCounters();
    
    showSuccess('Produit ajouté avec succès!');
}

// Mettre à jour un produit
function updateProduct() {
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const productId = parseInt(document.getElementById('productId').value);
    const productIndex = allProducts.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const rating = parseFloat(document.getElementById('productRating').value) || 4.0;
        
        allProducts[productIndex] = {
            ...allProducts[productIndex],
            name: document.getElementById('productName').value,
            brand: document.getElementById('productBrand').value,
            category: document.getElementById('productCategory').value,
            price: price,
            stock: stock,
            description: document.getElementById('productDescription').value,
            rating: rating,
            status: document.getElementById('productStatus').value,
            image: document.getElementById('productImage').value || allProducts[productIndex].image
        };
        
        filteredProducts = [...allProducts];
        
        // Fermer le modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        
        // Recharger le tableau
        renderProductsTable();
        updateProductCounters();
        
        showSuccess('Produit mis à jour avec succès!');
    }
}

// Confirmer la suppression
function confirmDeleteProduct(id) {
    productToDelete = id;
    const modal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
    modal.show();
    
    // Configurer le bouton de confirmation
    document.getElementById('confirmProductDelete').onclick = deleteProduct;
}

// Supprimer un produit
function deleteProduct() {
    if (!productToDelete) return;
    
    const productIndex = allProducts.findIndex(p => p.id === productToDelete);
    
    if (productIndex !== -1) {
        allProducts.splice(productIndex, 1);
        filteredProducts = [...allProducts];
        
        // Ajuster la pagination si nécessaire
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (totalPages === 0) {
            currentPage = 1;
        }
        
        // Recharger le tableau
        renderProductsTable();
        updatePagination();
        updateStats();
        updateProductCounters();
        
        showSuccess('Produit supprimé avec succès!');
    }
    
    // Fermer le modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal'));
    modal.hide();
    productToDelete = null;
}

// Exporter en CSV
function exportProducts() {
    if (filteredProducts.length === 0) {
        showError('Aucun produit à exporter');
        return;
    }
    
    // Créer le contenu CSV
    const headers = ['ID', 'SKU', 'Nom', 'Marque', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Note'];
    const csvRows = [];
    
    // Ajouter les en-têtes
    csvRows.push(headers.join(';'));
    
    // Ajouter les données
    filteredProducts.forEach(product => {
        const row = [
            product.id,
            product.sku,
            `"${product.name}"`,
            product.brand,
            product.category,
            product.price.toString().replace('.', ','),
            product.stock,
            product.status,
            product.rating.toString().replace('.', ',')
        ];
        csvRows.push(row.join(';'));
    });
    
    // Créer le fichier
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Télécharger le fichier
    link.href = url;
    link.setAttribute('download', `produits_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Export CSV terminé!');
}

// Générer un rapport de stock
function generateStockReport() {
    const lowStockProducts = allProducts.filter(p => p.status === 'lowstock');
    const outOfStockProducts = allProducts.filter(p => p.status === 'outofstock');
    
    let report = `=== RAPPORT DE STOCK ===\n\n`;
    report += `Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
    report += `Heure: ${new Date().toLocaleTimeString('fr-FR')}\n`;
    report += `\n--- STATISTIQUES ---\n`;
    report += `Total produits: ${allProducts.length}\n`;
    report += `Stock faible (< 10): ${lowStockProducts.length}\n`;
    report += `Rupture de stock: ${outOfStockProducts.length}\n`;
    
    if (lowStockProducts.length > 0) {
        report += `\n--- PRODUITS EN STOCK FAIBLE ---\n`;
        lowStockProducts.forEach(product => {
            report += `• ${product.name} (${product.sku}): ${product.stock} unités\n`;
        });
    }
    
    if (outOfStockProducts.length > 0) {
        report += `\n--- PRODUITS EN RUPTURE ---\n`;
        outOfStockProducts.forEach(product => {
            report += `• ${product.name} (${product.sku})\n`;
        });
    }
    
    // Créer et télécharger le rapport
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `rapport_stock_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Rapport de stock généré!');
}

// Imprimer une étiquette produit
function printProductLabel(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Étiquette - ${product.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .label { border: 2px solid #000; padding: 15px; width: 400px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                    .product-name { font-size: 18px; font-weight: bold; }
                    .sku { font-size: 14px; color: #666; }
                    .price { font-size: 24px; color: #d00; font-weight: bold; text-align: right; }
                    .barcode { text-align: center; margin: 20px 0; font-family: 'Libre Barcode 128', cursive; font-size: 36px; }
                    .footer { font-size: 12px; color: #666; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="label">
                    <div class="header">
                        <div class="product-name">${product.name}</div>
                        <div class="sku">${product.sku}</div>
                    </div>
                    <div class="barcode">*${product.sku}*</div>
                    <div class="price">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}</div>
                    <div class="footer">
                        Stock: ${product.stock} unités | ${product.brand} | ${new Date().toLocaleDateString('fr-FR')}
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Fonctions utilitaires
function getStockStatus(stock) {
    if (stock === 0) return 'outofstock';
    if (stock < 10) return 'lowstock';
    return 'available';
}

function getStockStatusText(status) {
    switch(status) {
        case 'outofstock': return 'Rupture';
        case 'lowstock': return 'Stock faible';
        case 'available': return 'Disponible';
        default: return 'Inconnu';
    }
}

function getStockBadgeClass(status) {
    switch(status) {
        case 'outofstock': return 'badge-danger';
        case 'lowstock': return 'badge-warning';
        case 'available': return 'badge-success';
        default: return 'badge-secondary';
    }
}

function getCategoryIcon(category) {
    const icons = {
        'electronics': 'bi-cpu',
        'clothing': 'bi-tshirt',
        'food': 'bi-cup',
        'books': 'bi-book',
        'sports': 'bi-bicycle',
        'home': 'bi-house',
        'beauty': 'bi-droplet'
    };
    return icons[category] || 'bi-box';
}

function getCategoryName(category) {
    const names = {
        'electronics': 'Électronique',
        'clothing': 'Vêtements',
        'food': 'Alimentation',
        'books': 'Livres',
        'sports': 'Sport',
        'home': 'Maison',
        'beauty': 'Beauté'
    };
    return names[category] || category;
}

function getStockColor(stock) {
    if (stock === 0) return 'bg-danger';
    if (stock < 10) return 'bg-warning';
    return 'bg-success';
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="bi bi-star-fill text-warning"></i>';
    }
    if (halfStar) {
        stars += '<i class="bi bi-star-half text-warning"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="bi bi-star text-warning"></i>';
    }
    
    return stars;
}

// Fonctions d'affichage (reprises de users.js)
function showLoading(message = 'Chargement...') {
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
    // Recherche en temps réel
    const searchInput = document.getElementById('searchProducts');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    // Filtres
    const filterCategory = document.getElementById('filterCategory');
    const filterStock = document.getElementById('filterStock');
    const filterPrice = document.getElementById('filterPrice');
    
    if (filterCategory) filterCategory.addEventListener('change', filterProducts);
    if (filterStock) filterStock.addEventListener('change', filterProducts);
    if (filterPrice) filterPrice.addEventListener('change', filterProducts);
    
    // Bouton ajouter produit
    const addBtn = document.querySelector('[data-bs-target="#addProductModal"]');
    if (addBtn) {
        addBtn.addEventListener('click', addNewProduct);
    }
}

// Exporter pour les tests
if (typeof module !== 'undefined') {
    module.exports = {
        loadProducts,
        filterProducts,
        saveProduct,
        updateProduct,
        deleteProduct,
        exportProducts
    };
}