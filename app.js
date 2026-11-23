/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Supporting Data Structures
const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'USD ($)' },
  { code: 'EUR', symbol: '€', name: 'EUR (€)' },
  { code: 'GBP', symbol: '£', name: 'GBP (£)' },
  { code: 'INR', symbol: '₹', name: 'INR (₹)' },
  { code: 'JPY', symbol: '¥', name: 'JPY (¥)' },
  { code: 'CAD', symbol: 'C$', name: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', name: 'AUD (A$)' }
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Refund',
  'Other Income'
];

const EXPENSE_CATEGORIES = [
  'Groceries',
  'Rent',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Food & Dining',
  'Travel',
  'Healthcare',
  'Other Expense'
];

const SEED_TRANSACTIONS = [
  {
    id: 'seed-1',
    type: 'income',
    description: 'Enterprise Project Salary',
    amount: 5200.00,
    date: '2026-06-01',
    category: 'Salary'
  },
  {
    id: 'seed-2',
    type: 'expense',
    description: 'Corporate Office Rent',
    amount: 1400.00,
    date: '2026-06-03',
    category: 'Rent'
  },
  {
    id: 'seed-3',
    type: 'expense',
    description: 'AWS Cloud Servers',
    amount: 250.00,
    date: '2026-06-08',
    category: 'Utilities'
  },
  {
    id: 'seed-4',
    type: 'income',
    description: 'Freelance Design Consulting',
    amount: 1850.00,
    date: '2026-06-12',
    category: 'Freelance'
  },
  {
    id: 'seed-5',
    type: 'expense',
    description: 'Team Dinner & Celebrations',
    amount: 175.40,
    date: '2026-06-18',
    category: 'Food & Dining'
  },
  {
    id: 'seed-6',
    type: 'expense',
    description: 'Marketing Ad Campaigns',
    amount: 450.00,
    date: '2026-06-25',
    category: 'Shopping'
  }
];

// App State
let state = {
  user: null, // Logged in user details
  currentView: 'login', // login, register, dashboard, settings
  transactions: [],
  isDarkMode: true,
  searchQuery: '',
  typeFilter: 'all',
  isSidebarOpen: false,
  isAddModalOpen: false,
  toasts: []
};

// DOM Elements
let el = {};

// Cache DOM query elements
function cacheDOMElements() {
  el = {
    html: document.documentElement,
    authContainer: document.getElementById('auth-container'),
    appContainer: document.getElementById('app-container'),
    
    // Auth Screens
    loginCard: document.getElementById('login-card'),
    registerCard: document.getElementById('register-card'),
    
    // Views
    dashboardView: document.getElementById('dashboard-view'),
    settingsView: document.getElementById('settings-view'),
    
    // Forms & Inputs
    loginForm: document.getElementById('login-form'),
    loginUsername: document.getElementById('username'),
    loginPassword: document.getElementById('password'),
    loginError: document.getElementById('login-error'),
    
    registerForm: document.getElementById('register-form'),
    registerUsername: document.getElementById('reg-username'),
    registerPassword: document.getElementById('reg-password'),
    registerError: document.getElementById('register-error'),
    registerSuccess: document.getElementById('register-success'),
    
    settingsForm: document.getElementById('settings-form'),
    settingsFullName: document.getElementById('settings-fullname'),
    settingsCurrency: document.getElementById('settings-currency'),
    
    // Search & Filter
    searchTransactions: document.getElementById('search-transactions'),
    filterType: document.getElementById('filter-transactions-type'),
    
    // Modal & Triggers
    modalOverlay: document.getElementById('modal-overlay'),
    modalCard: document.getElementById('modal-card'),
    addTransactionForm: document.getElementById('add-transaction-form'),
    modalTypeIncome: document.getElementById('modal-type-income'),
    modalTypeExpense: document.getElementById('modal-type-expense'),
    modalDesc: document.getElementById('modal-desc'),
    modalAmount: document.getElementById('modal-amount'),
    modalAmountSymbol: document.getElementById('modal-amount-symbol'),
    modalDate: document.getElementById('modal-date'),
    modalCategory: document.getElementById('modal-category'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    
    // Header & Sidebar Dynamic Info
    profileName: document.getElementById('profile-name'),
    avatarLetter: document.getElementById('avatar-letter'),
    sidebarProfileName: document.getElementById('sidebar-profile-name'),
    sidebarAvatarLetter: document.getElementById('sidebar-avatar-letter'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    closeSidebarBtn: document.getElementById('close-sidebar-btn'),
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    
    // Navigation Tab items
    navDashboard: document.getElementById('nav-dashboard'),
    navSettings: document.getElementById('nav-settings'),
    sidebarAddTransactionBtn: document.getElementById('sidebar-add-transaction-btn'),
    headerLogoutBtn: document.getElementById('header-logout-btn'),
    
    // Stats Summary Metrics
    statBalance: document.getElementById('stat-balance'),
    statIncome: document.getElementById('stat-income'),
    statExpense: document.getElementById('stat-expense'),
    statCount: document.getElementById('stat-count'),
    
    // Preferences Panel Elements
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    resetAllDataBtn: document.getElementById('reset-all-data-btn'),
    
    // Table list of transactions
    transactionsListContainer: document.getElementById('transactions-list-container'),
    
    // Dynamic Toasts Container
    toastsContainer: document.getElementById('toasts-container'),
    
    // Charts Placeholder/Stage
    chartWrapper: document.getElementById('chart-wrapper')
  };
}

// Initialization Logic
document.addEventListener('DOMContentLoaded', () => {
  cacheDOMElements();
  setupEventListeners();
  initAppState();
});

function initAppState() {
  // 1. Setup a default demo user "Ritik" if not already in local storage
  const storedUsersRaw = localStorage.getItem('fintrack_users');
  const users = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
  const hasDemoUser = users.some(u => u.username.toLowerCase() === 'ritik');
  
  if (!hasDemoUser) {
    const demoUser = {
      username: 'Ritik',
      password: 'password',
      fullName: 'Ritik',
      currency: 'USD'
    };
    users.push(demoUser);
    localStorage.setItem('fintrack_users', JSON.stringify(users));
  }

  // 2. Load theme preference
  const savedTheme = localStorage.getItem('fintrack_theme');
  state.isDarkMode = savedTheme !== 'light'; // default dark
  applyTheme();

  // 3. Load active session
  const storedSession = localStorage.getItem('fintrack_session');
  if (storedSession) {
    state.user = JSON.parse(storedSession);
    state.currentView = 'dashboard';
    loadTransactions();
  } else {
    state.currentView = 'login';
  }

  // 4. Populate settings currency dropdown
  if (el.settingsCurrency) {
    el.settingsCurrency.innerHTML = SUPPORTED_CURRENCIES.map(c => 
      `<option value="${c.code}">${c.name}</option>`
    ).join('');
  }

  render();
}

// Local Storage Managers
function loadTransactions() {
  if (!state.user) return;
  const userTxs = localStorage.getItem(`fintrack_txs_${state.user.username.toLowerCase()}`);
  if (userTxs) {
    state.transactions = JSON.parse(userTxs);
  } else {
    state.transactions = [...SEED_TRANSACTIONS];
    saveTransactions();
  }
}

function saveTransactions() {
  if (!state.user) return;
  localStorage.setItem(
    `fintrack_txs_${state.user.username.toLowerCase()}`,
    JSON.stringify(state.transactions)
  );
}

// Render Controller
function render() {
  // Update views displaying based on state.currentView
  if (state.user) {
    el.authContainer.classList.add('hidden');
    el.appContainer.classList.remove('hidden');
    
    // Update active tab buttons
    const activeNavClass = "bg-slate-100 dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-sm";
    const inactiveNavClass = "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50";

    if (state.currentView === 'dashboard') {
      el.dashboardView.classList.remove('hidden');
      el.settingsView.classList.add('hidden');
      
      el.navDashboard.className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${activeNavClass}`;
      el.navSettings.className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${inactiveNavClass}`;
      
      renderDashboard();
    } else if (state.currentView === 'settings') {
      el.dashboardView.classList.add('hidden');
      el.settingsView.classList.remove('hidden');
      
      el.navSettings.className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${activeNavClass}`;
      el.navDashboard.className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${inactiveNavClass}`;
      
      renderSettings();
    }
    
    // Update Header profile metrics
    const fullName = state.user.fullName || state.user.username;
    el.profileName.textContent = fullName;
    el.avatarLetter.textContent = fullName.substring(0, 2).toUpperCase();
    if (el.sidebarProfileName) el.sidebarProfileName.textContent = fullName;
    if (el.sidebarAvatarLetter) el.sidebarAvatarLetter.textContent = fullName.substring(0, 2).toUpperCase();
    
  } else {
    el.authContainer.classList.remove('hidden');
    el.appContainer.classList.add('hidden');
    
    if (state.currentView === 'login') {
      el.loginCard.classList.remove('hidden');
      el.registerCard.classList.add('hidden');
    } else if (state.currentView === 'register') {
      el.loginCard.classList.add('hidden');
      el.registerCard.classList.remove('hidden');
    }
  }

  // Update Theme state toggler display
  updateThemeTogglerUI();
}

function renderDashboard() {
  const currencySymbol = getActiveCurrencySymbol();
  
  // 1. Calculate Metrics
  let totalIncome = 0;
  let totalExpense = 0;
  state.transactions.forEach(tx => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
    }
  });
  const balance = totalIncome - totalExpense;

  // Format Helper
  const fmt = (num) => {
    const isNegative = num < 0;
    const abs = Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${isNegative ? '-' : ''}${currencySymbol}${abs}`;
  };

  el.statBalance.textContent = fmt(balance);
  el.statIncome.textContent = fmt(totalIncome);
  el.statExpense.textContent = fmt(totalExpense);
  el.statCount.textContent = state.transactions.length.toString();

  // 2. Render SVG Chart Flow
  renderCashFlowChart(currencySymbol);

  // 3. Render Transactions Table List
  renderTransactionsTable(currencySymbol);
}

function renderSettings() {
  if (!state.user) return;
  el.settingsFullName.value = state.user.fullName || '';
  el.settingsCurrency.value = state.user.currency || 'USD';
}

function getActiveCurrencySymbol() {
  if (!state.user) return '$';
  const match = SUPPORTED_CURRENCIES.find(c => c.code === state.user.currency);
  return match ? match.symbol : '$';
}

// Custom Hand-crafted Responsive SVG Charting Engine (Lightweight, Interactive, Beautiful)
function renderCashFlowChart(currencySymbol) {
  if (!el.chartWrapper) return;
  
  const width = el.chartWrapper.clientWidth || 550;
  const height = 280;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  // Group and sort transactions by date
  const dateMap = {};
  
  if (state.transactions.length === 0) {
    // Show pristine empty layout
    el.chartWrapper.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-10">
        <svg class="w-12 h-12 mb-3 stroke-current opacity-60" fill="none" viewBox="0 0 24 24" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
        <span class="text-sm font-semibold">No data to display in flow analysis</span>
      </div>
    `;
    return;
  }

  state.transactions.forEach(tx => {
    const dateStr = tx.date;
    let label = dateStr;
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      }
    } catch(e) {}

    if (!dateMap[label]) {
      dateMap[label] = { Income: 0, Expenses: 0, rawDate: new Date(dateStr).getTime() };
    }
    if (tx.type === 'income') {
      dateMap[label].Income += tx.amount;
    } else {
      dateMap[label].Expenses += tx.amount;
    }
  });

  // Sort dates chronologically
  const sortedLabels = Object.keys(dateMap).sort((a, b) => dateMap[a].rawDate - dateMap[b].rawDate);

  // Calculate scales & limits
  let maxAmount = 100; // minimum grid roof
  sortedLabels.forEach(lbl => {
    maxAmount = Math.max(maxAmount, dateMap[lbl].Income, dateMap[lbl].Expenses);
  });
  
  // Nice round number roof
  const order = Math.pow(10, Math.floor(Math.log10(maxAmount)));
  const normalizedInterval = Math.ceil(maxAmount / order) * order;
  const maxVal = normalizedInterval;

  const chartInnerWidth = width - paddingLeft - paddingRight;
  const chartInnerHeight = height - paddingTop - paddingBottom;

  // Grid lines and labels (Y Axis)
  const gridLinesCount = 4;
  let yAxisGridHTML = '';
  for (let i = 0; i <= gridLinesCount; i++) {
    const val = (maxVal / gridLinesCount) * i;
    const y = paddingTop + chartInnerHeight - (chartInnerHeight * (i / gridLinesCount));
    
    // Dashed grid line
    const gridColor = state.isDarkMode ? '#334155' : '#f1f5f9';
    const labelColor = state.isDarkMode ? '#94a3b8' : '#64748b';
    
    yAxisGridHTML += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="${gridColor}" stroke-dasharray="3,3" stroke-width="1" />
      <text x="${paddingLeft - 10}" y="${y + 4}" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="${labelColor}" text-anchor="end">
        ${currencySymbol}${val >= 1000 ? (val/1000) + 'k' : val}
      </text>
    `;
  }

  // Draw Bars & Labels (X Axis)
  const barGroupWidth = chartInnerWidth / sortedLabels.length;
  const barWidth = Math.min(14, barGroupWidth * 0.28);
  const gap = 3;
  let barsHTML = '';
  let xAxisLabelsHTML = '';

  sortedLabels.forEach((label, idx) => {
    const data = dateMap[label];
    const groupCenterX = paddingLeft + (barGroupWidth * idx) + (barGroupWidth / 2);
    
    // Income Bar
    const incHeight = (data.Income / maxVal) * chartInnerHeight;
    const incX = groupCenterX - barWidth - (gap / 2);
    const incY = paddingTop + chartInnerHeight - incHeight;

    // Expense Bar
    const expHeight = (data.Expenses / maxVal) * chartInnerHeight;
    const expX = groupCenterX + (gap / 2);
    const expY = paddingTop + chartInnerHeight - expHeight;

    // Build SVG elements for bars with beautiful round corners (rx)
    barsHTML += `
      <!-- Income Bar -->
      <rect x="${incX}" y="${incY}" width="${barWidth}" height="${incHeight}" rx="3" fill="#10b981" class="transition-all duration-300 hover:opacity-85 cursor-pointer">
        <title>${label} Income: ${currencySymbol}${data.Income.toLocaleString()}</title>
      </rect>
      <!-- Expense Bar -->
      <rect x="${expX}" y="${expY}" width="${barWidth}" height="${expHeight}" rx="3" fill="#f43f5e" class="transition-all duration-300 hover:opacity-85 cursor-pointer">
        <title>${label} Expense: ${currencySymbol}${data.Expenses.toLocaleString()}</title>
      </rect>
    `;

    // Bottom Date label
    const labelColor = state.isDarkMode ? '#94a3b8' : '#64748b';
    xAxisLabelsHTML += `
      <text x="${groupCenterX}" y="${height - paddingBottom + 20}" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="${labelColor}" text-anchor="middle">
        ${label}
      </text>
    `;
  });

  // Construct final SVG
  el.chartWrapper.innerHTML = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" class="overflow-visible select-none">
      <!-- Grid & Y Axis -->
      ${yAxisGridHTML}
      
      <!-- Bars -->
      ${barsHTML}
      
      <!-- X Axis Labels -->
      ${xAxisLabelsHTML}
    </svg>
  `;
}

// Render dynamic table matching filtered transactions
function renderTransactionsTable(currencySymbol) {
  const query = state.searchQuery.toLowerCase().trim();
  const filtered = state.transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(query) || tx.category.toLowerCase().includes(query);
    const matchesType = state.typeFilter === 'all' || tx.type === state.typeFilter;
    return matchesSearch && matchesType;
  });

  if (filtered.length === 0) {
    el.transactionsListContainer.innerHTML = `
      <div class="text-center py-10">
        <p class="text-slate-500 dark:text-slate-400 font-semibold text-sm">No transactions found</p>
        <p class="text-slate-400 dark:text-slate-500 text-xs mt-1">Try adjusting your filters or adding a new transaction.</p>
      </div>
    `;
    return;
  }

  // Get Custom Category Badge Styling class
  const getBadgeClass = (category, type) => {
    if (type === 'income') {
      return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    }
    switch (category) {
      case 'Groceries': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Rent': return 'bg-violet-500/10 text-violet-500 border border-violet-500/20';
      case 'Utilities': return 'bg-sky-500/10 text-sky-500 border border-sky-500/20';
      case 'Entertainment': return 'bg-pink-500/10 text-pink-500 border border-pink-500/20';
      case 'Shopping': return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
      case 'Food & Dining': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      case 'Travel': return 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const rowsHTML = filtered.map(tx => {
    const amountFormatted = tx.amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const isIncome = tx.type === 'income';
    
    return `
      <tr class="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-100 dark:border-slate-800/80">
        <!-- Date -->
        <td class="py-4 pl-2 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
          ${tx.date}
        </td>

        <!-- Description -->
        <td class="py-4 px-4 text-slate-900 dark:text-white truncate max-w-[180px]">
          ${escapeHTML(tx.description)}
        </td>

        <!-- Category Badge -->
        <td class="py-4 px-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide border ${getBadgeClass(tx.category, tx.type)}">
            ${tx.category}
          </span>
        </td>

        <!-- Amount with colored sign -->
        <td class="py-4 px-4 text-right font-bold whitespace-nowrap text-base ${isIncome ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}">
          ${isIncome ? '+' : '-'}${currencySymbol}${amountFormatted}
        </td>

        <!-- Actions -->
        <td class="py-4 pr-2 text-right whitespace-nowrap">
          <button data-delete-id="${tx.id}" class="delete-tx-btn text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer inline-flex items-center justify-center">
            <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  el.transactionsListContainer.innerHTML = `
    <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left">
      <thead>
        <tr class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <th class="py-3.5 pl-2">Date</th>
          <th class="py-3.5 px-4">Description</th>
          <th class="py-3.5 px-4">Category</th>
          <th class="py-3.5 px-4 text-right">Amount</th>
          <th class="py-3.5 pr-2 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
        ${rowsHTML}
      </tbody>
    </table>
  `;

  // Attach dynamic table event listeners to action buttons
  document.querySelectorAll('.delete-tx-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-delete-id');
      if (id) deleteTransaction(id);
    });
  });
}

// HTML Scrubber escape safety
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Action Logic Controllers
function loginUser(username, password) {
  if (!username.trim() || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const storedUsersRaw = localStorage.getItem('fintrack_users');
  const users = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
  const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());

  if (!foundUser) {
    el.loginError.classList.remove('hidden');
    el.loginError.querySelector('span').textContent = 'User not found. Please register first.';
    showToast('User not found', 'error');
    return;
  }

  if (foundUser.password !== password) {
    el.loginError.classList.remove('hidden');
    el.loginError.querySelector('span').textContent = 'Incorrect password.';
    showToast('Incorrect password', 'error');
    return;
  }

  // Clear fields
  el.loginUsername.value = '';
  el.loginPassword.value = '';
  el.loginError.classList.add('hidden');

  // Success
  state.user = foundUser;
  localStorage.setItem('fintrack_session', JSON.stringify(foundUser));
  loadTransactions();
  state.currentView = 'dashboard';
  showToast(`Welcome back, ${foundUser.fullName}!`, 'success');
  render();
}

function registerUser(username, password) {
  if (!username.trim() || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (username.trim().length < 3) {
    el.registerError.classList.remove('hidden');
    el.registerError.querySelector('span').textContent = 'Username must be at least 3 characters.';
    showToast('Username too short', 'error');
    return;
  }

  if (password.length < 4) {
    el.registerError.classList.remove('hidden');
    el.registerError.querySelector('span').textContent = 'Password must be at least 4 characters.';
    showToast('Password too short', 'error');
    return;
  }

  const storedUsersRaw = localStorage.getItem('fintrack_users');
  const users = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
  const exists = users.some(u => u.username.toLowerCase() === username.trim().toLowerCase());

  if (exists) {
    el.registerError.classList.remove('hidden');
    el.registerError.querySelector('span').textContent = 'Username already taken.';
    showToast('Username taken', 'error');
    return;
  }

  // Create User
  const newUser = {
    username: username.trim(),
    password: password,
    fullName: username.trim(),
    currency: 'USD'
  };

  users.push(newUser);
  localStorage.setItem('fintrack_users', JSON.stringify(users));

  el.registerUsername.value = '';
  el.registerPassword.value = '';
  el.registerError.classList.add('hidden');
  el.registerSuccess.classList.remove('hidden');
  showToast('Account created successfully!', 'success');

  setTimeout(() => {
    el.registerSuccess.classList.add('hidden');
    state.currentView = 'login';
    render();
  }, 1500);
}

function updateSettings(fullName, currency) {
  if (!fullName.trim()) {
    showToast('Full name cannot be empty', 'error');
    return;
  }

  state.user.fullName = fullName.trim();
  state.user.currency = currency;

  localStorage.setItem('fintrack_session', JSON.stringify(state.user));

  // Sync Registry
  const storedUsersRaw = localStorage.getItem('fintrack_users');
  if (storedUsersRaw) {
    const users = JSON.parse(storedUsersRaw);
    const updated = users.map(u => 
      u.username.toLowerCase() === state.user.username.toLowerCase() ? { ...u, fullName: fullName.trim(), currency } : u
    );
    localStorage.setItem('fintrack_users', JSON.stringify(updated));
  }

  showToast('Profile updated successfully!', 'success');
  render();
}

function addTransaction(txData) {
  const newTx = {
    id: `tx-${Math.random().toString(36).substring(2, 9)}`,
    ...txData
  };

  state.transactions.unshift(newTx);
  saveTransactions();
  showToast('Transaction added successfully!', 'success');
  closeAddModal();
  render();
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveTransactions();
  showToast('Transaction deleted successfully', 'success');
  render();
}

function resetAllData() {
  const confirmReset = window.confirm('Are you sure you want to reset all data? This will clear all transactions.');
  if (confirmReset) {
    state.transactions = [];
    saveTransactions();
    showToast('All transactions cleared successfully', 'success');
    render();
  }
}

// Toast Notifier
function showToast(message, type) {
  const id = Math.random().toString(36).substring(2, 9);
  const toastHTML = `
    <div id="toast-${id}" class="pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 justify-between transition-all duration-300 transform translate-y-4 opacity-0 ${
      type === 'success'
        ? 'bg-[#0f172a] text-emerald-400 border-emerald-500/20'
        : 'bg-[#0f172a] text-rose-400 border-rose-500/20'
    }">
      <div class="flex items-start gap-2.5">
        ${
          type === 'success'
            ? `<svg class="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
            : `<svg class="w-5 h-5 shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`
        }
        <span class="text-sm font-semibold leading-snug text-white">${escapeHTML(message)}</span>
      </div>
      <button onclick="document.getElementById('toast-${id}').remove()" class="text-slate-400 hover:text-white p-0.5 hover:bg-slate-800/60 rounded transition-colors cursor-pointer">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  `;
  
  el.toastsContainer.insertAdjacentHTML('beforeend', toastHTML);
  const toastNode = document.getElementById(`toast-${id}`);
  
  // Trigger slide-up enter transition
  setTimeout(() => {
    toastNode.classList.remove('translate-y-4', 'opacity-0');
  }, 10);

  // Auto remove toast
  setTimeout(() => {
    if (toastNode) {
      toastNode.classList.add('opacity-0', 'scale-90');
      setTimeout(() => toastNode.remove(), 300);
    }
  }, 3500);
}

// Modal Toggle Handlers
function openAddModal() {
  state.isAddModalOpen = true;
  el.modalOverlay.classList.remove('hidden');
  setTimeout(() => {
    el.modalCard.classList.remove('scale-95', 'opacity-0', 'translate-y-4');
  }, 10);
  
  // Prep default values
  el.modalDesc.value = '';
  el.modalAmount.value = '';
  el.modalDate.value = new Date().toISOString().split('T')[0];
  el.modalAmountSymbol.textContent = getActiveCurrencySymbol();
  
  // Set type and populate categories
  setModalType('expense');
}

function closeAddModal() {
  state.isAddModalOpen = false;
  el.modalCard.classList.add('scale-95', 'opacity-0', 'translate-y-4');
  setTimeout(() => {
    el.modalOverlay.classList.add('hidden');
  }, 200);
}

function setModalType(type) {
  const isIncome = type === 'income';
  if (isIncome) {
    el.modalTypeIncome.classList.add('bg-emerald-600', 'text-white');
    el.modalTypeIncome.classList.remove('text-slate-400');
    el.modalTypeExpense.classList.remove('bg-rose-600', 'text-white');
    el.modalTypeExpense.classList.add('text-slate-400');
  } else {
    el.modalTypeExpense.classList.add('bg-rose-600', 'text-white');
    el.modalTypeExpense.classList.remove('text-slate-400');
    el.modalTypeIncome.classList.remove('bg-emerald-600', 'text-white');
    el.modalTypeIncome.classList.add('text-slate-400');
  }
  el.addTransactionForm.setAttribute('data-type', type);
  
  // Update category select list
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  el.modalCategory.innerHTML = categories.map(cat => 
    `<option value="${cat}">${cat}</option>`
  ).join('');
}

// Theme Controls
function applyTheme() {
  if (state.isDarkMode) {
    el.html.classList.add('dark');
    localStorage.setItem('fintrack_theme', 'dark');
  } else {
    el.html.classList.remove('dark');
    localStorage.setItem('fintrack_theme', 'light');
  }
}

function updateThemeTogglerUI() {
  if (!el.darkModeToggle) return;
  if (state.isDarkMode) {
    el.darkModeToggle.innerHTML = `
      <svg class="w-12 h-12 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15m15 0a7.5 7.5 0 11-15 0m15 0H12" />
      </svg>
    `;
    // Update SVG toggle on/off representation dynamically (ToggleRight representation)
    el.darkModeToggle.innerHTML = `
      <svg class="w-12 h-12 text-[#3b82f6]" fill="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="12" rx="6" fill="#2563eb" />
        <circle cx="16" cy="12" r="4.5" fill="#ffffff" />
      </svg>
    `;
  } else {
    // ToggleLeft representation
    el.darkModeToggle.innerHTML = `
      <svg class="w-12 h-12 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="12" rx="6" fill="#cbd5e1" />
        <circle cx="8" cy="12" r="4.5" fill="#ffffff" />
      </svg>
    `;
  }
}

// Setup App Events Listener
function setupEventListeners() {
  // Mobile Sidebar Toggle triggers
  el.mobileMenuBtn.addEventListener('click', () => {
    el.sidebar.classList.remove('-translate-x-full');
    el.sidebarBackdrop.classList.remove('hidden');
  });
  
  const closeSidebar = () => {
    el.sidebar.classList.add('-translate-x-full');
    el.sidebarBackdrop.classList.add('hidden');
  };
  
  el.closeSidebarBtn.addEventListener('click', closeSidebar);
  el.sidebarBackdrop.addEventListener('click', closeSidebar);

  // Authentications Switch
  document.getElementById('goto-register-btn').addEventListener('click', () => {
    state.currentView = 'register';
    render();
  });
  
  document.getElementById('goto-login-btn').addEventListener('click', () => {
    state.currentView = 'login';
    render();
  });

  // Login Form submit
  el.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginUser(el.loginUsername.value, el.loginPassword.value);
  });

  // Register Form submit
  el.registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    registerUser(el.registerUsername.value, el.registerPassword.value);
  });

  // Logout header button
  el.headerLogoutBtn.addEventListener('click', () => {
    state.user = null;
    localStorage.removeItem('fintrack_session');
    state.currentView = 'login';
    showToast('Logged out successfully', 'success');
    render();
  });

  // Settings Save Profile Action
  el.settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    updateSettings(el.settingsFullName.value, el.settingsCurrency.value);
  });

  // Add Transaction Trigger
  el.sidebarAddTransactionBtn.addEventListener('click', () => {
    openAddModal();
    closeSidebar();
  });

  el.closeModalBtn.addEventListener('click', closeAddModal);
  el.modalOverlay.addEventListener('click', (e) => {
    if (e.target === el.modalOverlay) closeAddModal();
  });

  // Modal type selection
  el.modalTypeIncome.addEventListener('click', () => setModalType('income'));
  el.modalTypeExpense.addEventListener('click', () => setModalType('expense'));

  // Submit Add Transaction Modal form
  el.addTransactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = el.addTransactionForm.getAttribute('data-type') || 'expense';
    const amountVal = parseFloat(el.modalAmount.value);
    
    if (!el.modalDesc.value.trim()) {
      alert('Please enter a description');
      return;
    }
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    addTransaction({
      type,
      description: el.modalDesc.value.trim(),
      amount: amountVal,
      date: el.modalDate.value,
      category: el.modalCategory.value
    });
  });

  // Live filter handlers on dashboard list
  el.searchTransactions.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderTransactionsTable(getActiveCurrencySymbol());
  });

  el.filterType.addEventListener('change', (e) => {
    state.typeFilter = e.target.value;
    renderTransactionsTable(getActiveCurrencySymbol());
  });

  // Theme switch button
  el.darkModeToggle.addEventListener('click', () => {
    state.isDarkMode = !state.isDarkMode;
    applyTheme();
    updateThemeTogglerUI();
    // Re-draw chart on theme change to update axis labels/grid line colors
    if (state.currentView === 'dashboard') {
      renderCashFlowChart(getActiveCurrencySymbol());
    }
    showToast(`Theme switched to ${state.isDarkMode ? 'Dark' : 'Light'} Mode`, 'success');
  });

  // Reset Data action button
  el.resetAllDataBtn.addEventListener('click', () => {
    resetAllData();
  });

  // Nav actions
  el.navDashboard.addEventListener('click', () => {
    state.currentView = 'dashboard';
    render();
  });
  
  el.navSettings.addEventListener('click', () => {
    state.currentView = 'settings';
    render();
  });

  // Auto handle window resizes to scale SVG charts gracefully
  window.addEventListener('resize', () => {
    if (state.currentView === 'dashboard') {
      renderCashFlowChart(getActiveCurrencySymbol());
    }
  });
}
