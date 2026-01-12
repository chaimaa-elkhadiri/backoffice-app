// ============================================
// DASHBOARD.JS - Graphiques et statistiques
// ============================================

console.log("Initialisation du dashboard...");

// Données simulées pour les graphiques
const dashboardData = {
    usersByCity: {
        labels: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes'],
        data: [45, 28, 32, 18, 22, 25]
    },
    productCategories: {
        labels: ['Électronique', 'Vêtements', 'Alimentation', 'Livres', 'Sport', 'Maison'],
        data: [35, 25, 15, 10, 8, 7]
    },
    monthlyOrders: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
        data: [65, 59, 80, 81, 56, 55, 40, 72, 85, 91, 76, 68]
    },
    performance: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        data: [85, 92, 78, 95, 88, 76, 90]
    }
};

// Activité récente simulée
const recentActivity = [
    { user: 'Jean Dupont', action: 'Création', details: 'Nouvel utilisateur ajouté', time: '10:30 AM', status: 'success' },
    { user: 'Marie Martin', action: 'Modification', details: 'Produit #123 mis à jour', time: '09:15 AM', status: 'warning' },
    { user: 'Admin System', action: 'Suppression', details: 'Commande annulée #456', time: 'Hier, 16:45', status: 'danger' },
    { user: 'Pierre Leroy', action: 'Connexion', details: 'Connexion réussie', time: 'Hier, 14:20', status: 'info' },
    { user: 'Sophie Bernard', action: 'Création', details: 'Nouvelle facture générée', time: 'Hier, 11:10', status: 'success' }
];

// Initialiser les graphiques
function initCharts() {
    // 1. Graphique utilisateurs par ville (Bar Chart)
    const usersCtx = document.getElementById('usersChart').getContext('2d');
    new Chart(usersCtx, {
        type: 'bar',
        data: {
            labels: dashboardData.usersByCity.labels,
            datasets: [{
                label: 'Nombre d\'utilisateurs',
                data: dashboardData.usersByCity.data,
                backgroundColor: [
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(255, 107, 107, 0.7)',
                    'rgba(78, 205, 196, 0.7)',
                    'rgba(255, 209, 102, 0.7)',
                    'rgba(157, 78, 221, 0.7)',
                    'rgba(255, 159, 28, 0.7)'
                ],
                borderColor: [
                    'rgba(67, 97, 238, 1)',
                    'rgba(255, 107, 107, 1)',
                    'rgba(78, 205, 196, 1)',
                    'rgba(255, 209, 102, 1)',
                    'rgba(157, 78, 221, 1)',
                    'rgba(255, 159, 28, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // 2. Graphique catégories produits (Doughnut)
    const productsCtx = document.getElementById('productsChart').getContext('2d');
    new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: dashboardData.productCategories.labels,
            datasets: [{
                data: dashboardData.productCategories.data,
                backgroundColor: [
                    '#4361ee',
                    '#ff6b6b',
                    '#4ecdc4',
                    '#ffd166',
                    '#9d4edd',
                    '#ff9f1c'
                ],
                borderWidth: 2,
                borderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '60%'
        }
    });

    // 3. Graphique commandes par mois (Line)
    const ordersCtx = document.getElementById('ordersChart').getContext('2d');
    new Chart(ordersCtx, {
        type: 'line',
        data: {
            labels: dashboardData.monthlyOrders.labels,
            datasets: [{
                label: 'Nombre de commandes',
                data: dashboardData.monthlyOrders.data,
                fill: true,
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderColor: '#4361ee',
                tension: 0.4,
                pointBackgroundColor: '#4361ee',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // 4. Graphique performance (Radar)
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'radar',
        data: {
            labels: dashboardData.performance.labels,
            datasets: [{
                label: 'Performance',
                data: dashboardData.performance.data,
                backgroundColor: 'rgba(67, 97, 238, 0.2)',
                borderColor: '#4361ee',
                pointBackgroundColor: '#4361ee',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Remplir le tableau d'activité récente
function populateActivityTable() {
    const tableBody = document.getElementById('activityTable');
    tableBody.innerHTML = '';
    
    recentActivity.forEach(activity => {
        const row = document.createElement('tr');
        
        // Déterminer la classe CSS selon le statut
        let statusClass = '';
        switch(activity.status) {
            case 'success': statusClass = 'text-success'; break;
            case 'warning': statusClass = 'text-warning'; break;
            case 'danger': statusClass = 'text-danger'; break;
            case 'info': statusClass = 'text-primary'; break;
        }
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" 
                         style="width: 36px; height: 36px; margin-right: 10px;">
                        ${activity.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>${activity.user}</span>
                </div>
            </td>
            <td><strong>${activity.action}</strong></td>
            <td>${activity.details}</td>
            <td><small class="text-muted">${activity.time}</small></td>
            <td>
                <span class="${statusClass}">
                    <i class="bi bi-circle-fill"></i> ${activity.status}
                </span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Récupérer les données des utilisateurs depuis l'API
async function fetchUsersData() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const users = await response.json();
        
        // Mettre à jour le compteur
        document.getElementById('totalUsers').textContent = users.length;
        
        return users.length;
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        document.getElementById('totalUsers').textContent = '24';
        return 24;
    }
}

// Récupérer les données des produits
async function fetchProductsData() {
    try {
        // Utiliser une API différente pour les produits
        const response = await fetch('https://dummyjson.com/products?limit=5');
        const data = await response.json();
        
        document.getElementById('totalProducts').textContent = data.total || 156;
    } catch (error) {
        console.error('Erreur produits:', error);
        document.getElementById('totalProducts').textContent = '156';
    }
}

// Initialiser le dashboard
async function initDashboard() {
    console.log("Dashboard initialisation...");
    
    // Afficher un indicateur de chargement
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.innerHTML = '<div class="spinner"></div>';
    document.querySelector('.main-content').appendChild(loadingIndicator);
    
    try {
        // Charger les données en parallèle
        await Promise.all([
            fetchUsersData(),
            fetchProductsData()
        ]);
        
        // Initialiser les graphiques
        initCharts();
        
        // Remplir le tableau d'activité
        populateActivityTable();
        
        console.log("Dashboard initialisé avec succès!");
    } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        alert("Certaines données n'ont pas pu être chargées. Vérifiez votre connexion.");
    } finally {
        // Retirer l'indicateur de chargement
        loadingIndicator.remove();
    }
}

// Démarrer quand la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification d'abord
    if (typeof checkAuth === 'function' && checkAuth()) {
        // Initialiser le dashboard après un court délai
        setTimeout(initDashboard, 500);
    }
});

// Rafraîchir les données toutes les 30 secondes (optionnel)
setInterval(fetchUsersData, 30000);

// Exporter pour les tests
if (typeof module !== 'undefined') {
    module.exports = { initDashboard, initCharts, populateActivityTable };
}