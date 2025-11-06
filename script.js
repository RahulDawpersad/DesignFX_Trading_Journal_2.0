// ============================================================================
// Trading Journal - Complete Implementation
// ============================================================================

// ============================================================================
// Data Management & Storage
// ============================================================================

class DataManager {
    constructor() {
        this.storageKey = 'tradingJournalData';
        this.currentAccount = 'real';
        this.data = this.loadData();
    }

    getDefaultData() {
        return {
            accounts: {
                real: {
                    settings: { currency: 'ZAR', theme: 'light', decimals: 2 },
                    balance: 0,
                    deposits: [],
                    trades: [],
                    categories: ['Scalping', 'Swing', 'News', 'Breakout']
                },
                demo: {
                    settings: { currency: 'ZAR', theme: 'light', decimals: 2 },
                    balance: 0,
                    deposits: [],
                    trades: [],
                    categories: ['Scalping', 'Swing', 'News', 'Breakout']
                }
            },
            ui: {
                theme: 'light',
                defaultAccount: 'real'
            }
        };
    }

    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Ensure all required fields exist
                const defaultData = this.getDefaultData();
                return this.mergeDeep(defaultData, parsed);
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
        return this.getDefaultData();
    }

    mergeDeep(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            return false;
        }
    }

    getCurrentAccountData() {
        return this.data.accounts[this.currentAccount];
    }

    // Trade Operations
    addTrade(trade) {
        const accountData = this.getCurrentAccountData();
        const newTrade = {
            id: this.generateId(),
            ...trade,
            createdAt: new Date().toISOString()
        };
        accountData.trades.push(newTrade);
        this.saveData();
        return newTrade;
    }

    updateTrade(id, updates) {
        const accountData = this.getCurrentAccountData();
        const index = accountData.trades.findIndex(t => t.id === id);
        if (index !== -1) {
            accountData.trades[index] = { ...accountData.trades[index], ...updates };
            this.saveData();
            return accountData.trades[index];
        }
        return null;
    }

    deleteTrade(id) {
        const accountData = this.getCurrentAccountData();
        const index = accountData.trades.findIndex(t => t.id === id);
        if (index !== -1) {
            accountData.trades.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    deleteMultipleTrades(ids) {
        const accountData = this.getCurrentAccountData();
        accountData.trades = accountData.trades.filter(t => !ids.includes(t.id));
        this.saveData();
    }

    getTrades() {
        return this.getCurrentAccountData().trades;
    }

    // Deposit Operations
    addDeposit(deposit) {
        const accountData = this.getCurrentAccountData();
        const newDeposit = {
            id: this.generateId(),
            ...deposit,
            date: deposit.date || new Date().toISOString()
        };
        accountData.deposits.push(newDeposit);
        this.saveData();
        return newDeposit;
    }

    updateDeposit(id, updates) {
        const accountData = this.getCurrentAccountData();
        const index = accountData.deposits.findIndex(d => d.id === id);
        if (index !== -1) {
            accountData.deposits[index] = { ...accountData.deposits[index], ...updates };
            this.saveData();
            return accountData.deposits[index];
        }
        return null;
    }

    deleteDeposit(id) {
        const accountData = this.getCurrentAccountData();
        const index = accountData.deposits.findIndex(d => d.id === id);
        if (index !== -1) {
            accountData.deposits.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    getDeposits() {
        return this.getCurrentAccountData().deposits;
    }

    // Category Operations
    addCategory(name) {
        const accountData = this.getCurrentAccountData();
        if (!accountData.categories.includes(name)) {
            accountData.categories.push(name);
            this.saveData();
            return true;
        }
        return false;
    }

    renameCategory(oldName, newName) {
        const accountData = this.getCurrentAccountData();
        const index = accountData.categories.indexOf(oldName);
        if (index !== -1) {
            accountData.categories[index] = newName;
            // Update trades with this category
            accountData.trades.forEach(trade => {
                if (trade.category === oldName) {
                    trade.category = newName;
                }
            });
            this.saveData();
            return true;
        }
        return false;
    }

    deleteCategory(name) {
        const accountData = this.getCurrentAccountData();
        const index = accountData.categories.indexOf(name);
        if (index !== -1) {
            accountData.categories.splice(index, 1);
            // Remove category from trades
            accountData.trades.forEach(trade => {
                if (trade.category === name) {
                    trade.category = '';
                }
            });
            this.saveData();
            return true;
        }
        return false;
    }

    getCategories() {
        return this.getCurrentAccountData().categories;
    }

    // Settings
    updateSettings(settings) {
        const accountData = this.getCurrentAccountData();
        accountData.settings = { ...accountData.settings, ...settings };
        if (settings.theme !== undefined) {
            this.data.ui.theme = settings.theme;
        }
        if (settings.defaultAccount !== undefined) {
            this.data.ui.defaultAccount = settings.defaultAccount;
        }
        this.saveData();
    }

    getSettings() {
        return {
            ...this.getCurrentAccountData().settings,
            defaultAccount: this.data.ui.defaultAccount
        };
    }

    // Utility
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    switchAccount(account) {
        this.currentAccount = account;
    }

    // Export/Import
    exportToJSON() {
        return JSON.stringify(this.data, null, 2);
    }

    exportAccountToJSON() {
        return JSON.stringify({
            account: this.currentAccount,
            data: this.getCurrentAccountData()
        }, null, 2);
    }

    importFromJSON(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (imported.accounts) {
                // Full data import
                this.data = this.mergeDeep(this.getDefaultData(), imported);
            } else if (imported.account && imported.data) {
                // Single account import
                this.data.accounts[imported.account] = imported.data;
            }
            this.saveData();
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
}

// ============================================================================
// Analytics & Calculations
// ============================================================================

class Analytics {
    constructor(dataManager) {
        this.dm = dataManager;
    }

    calculateBalance() {
        const deposits = this.dm.getDeposits();
        const trades = this.dm.getTrades();
        
        let balance = 0;
        deposits.forEach(d => {
            balance += d.type === 'deposit' ? parseFloat(d.amount) : -parseFloat(d.amount);
        });
        
        trades.forEach(t => {
            balance += parseFloat(t.profit || 0) - parseFloat(t.fees || 0);
        });
        
        return balance;
    }

    calculateTotalPnL() {
        const trades = this.dm.getTrades();
        return trades.reduce((sum, t) => sum + (parseFloat(t.profit || 0) - parseFloat(t.fees || 0)), 0);
    }

    calculateWinRate() {
        const trades = this.dm.getTrades();
        if (trades.length === 0) return 0;
        
        const wins = trades.filter(t => parseFloat(t.profit || 0) > 0).length;
        return (wins / trades.length) * 100;
    }

    calculateAverageWin() {
        const trades = this.dm.getTrades();
        const wins = trades.filter(t => parseFloat(t.profit || 0) > 0);
        if (wins.length === 0) return 0;
        
        const totalWin = wins.reduce((sum, t) => sum + parseFloat(t.profit || 0), 0);
        return totalWin / wins.length;
    }

    calculateAverageLoss() {
        const trades = this.dm.getTrades();
        const losses = trades.filter(t => parseFloat(t.profit || 0) < 0);
        if (losses.length === 0) return 0;
        
        const totalLoss = losses.reduce((sum, t) => sum + parseFloat(t.profit || 0), 0);
        return totalLoss / losses.length;
    }

    getEquityCurveData() {
        const trades = [...this.dm.getTrades()].sort((a, b) => 
            new Date(a.exitTime) - new Date(b.exitTime)
        );
        
        const deposits = [...this.dm.getDeposits()].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        const data = [];
        let balance = 0;
        let tradeIdx = 0;
        let depositIdx = 0;
        
        // Merge deposits and trades chronologically
        while (tradeIdx < trades.length || depositIdx < deposits.length) {
            let useDeposit = false;
            
            if (depositIdx >= deposits.length) {
                useDeposit = false;
            } else if (tradeIdx >= trades.length) {
                useDeposit = true;
            } else {
                const tradeDate = new Date(trades[tradeIdx].exitTime);
                const depositDate = new Date(deposits[depositIdx].date);
                useDeposit = depositDate < tradeDate;
            }
            
            if (useDeposit) {
                const d = deposits[depositIdx];
                balance += d.type === 'deposit' ? parseFloat(d.amount) : -parseFloat(d.amount);
                data.push({
                    date: new Date(d.date),
                    balance: balance
                });
                depositIdx++;
            } else {
                const t = trades[tradeIdx];
                balance += parseFloat(t.profit || 0) - parseFloat(t.fees || 0);
                data.push({
                    date: new Date(t.exitTime),
                    balance: balance
                });
                tradeIdx++;
            }
        }
        
        return data;
    }

    getProfitBySymbol() {
        const trades = this.dm.getTrades();
        const symbolMap = {};
        
        trades.forEach(t => {
            const symbol = t.symbol || 'Unknown';
            if (!symbolMap[symbol]) {
                symbolMap[symbol] = 0;
            }
            symbolMap[symbol] += parseFloat(t.profit || 0) - parseFloat(t.fees || 0);
        });
        
        return Object.entries(symbolMap).map(([symbol, profit]) => ({
            symbol,
            profit
        }));
    }

    getProfitByCategory() {
        const trades = this.dm.getTrades();
        const categoryMap = {};
        
        trades.forEach(t => {
            const category = t.category || 'Uncategorized';
            if (!categoryMap[category]) {
                categoryMap[category] = 0;
            }
            categoryMap[category] += parseFloat(t.profit || 0) - parseFloat(t.fees || 0);
        });
        
        return Object.entries(categoryMap).map(([category, profit]) => ({
            category,
            profit
        }));
    }
}

// ============================================================================
// UI Manager
// ============================================================================

class UIManager {
    constructor(dataManager, analytics) {
        this.dm = dataManager;
        this.analytics = analytics;
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.filteredTrades = [];
        this.selectedTrades = new Set();
        this.sortColumn = 'exitTime';
        this.sortDirection = 'desc';
        this.charts = {};
        
        this.initializeEventListeners();
        this.applyTheme();
        this.render();
    }

    initializeEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Account toggle
        document.getElementById('accountToggle').addEventListener('click', () => this.toggleAccount());
        
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettingsModal());
        document.getElementById('settingsForm').addEventListener('submit', (e) => this.saveSettings(e));
        
        // Trade modal
        document.getElementById('addTradeBtn').addEventListener('click', () => this.openTradeModal());
        document.getElementById('tradeForm').addEventListener('submit', (e) => this.saveTrade(e));
        
        // Auto-calculate profit
        ['tradeEntryPrice', 'tradeExitPrice', 'tradeLots', 'tradeType'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.autoCalculateProfit());
        });
        
        // Deposit modal
        document.getElementById('addDepositBtn').addEventListener('click', () => this.openDepositModal());
        document.getElementById('depositForm').addEventListener('submit', (e) => this.saveDeposit(e));
        
        // Manage Deposits
        document.getElementById('manageDepositsBtn').addEventListener('click', () => this.openDepositsModal());
        
        // Categories modal
        document.getElementById('manageCategoriesBtn').addEventListener('click', () => this.openCategoriesModal());
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.addCategory());
        document.getElementById('newCategory').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addCategory();
            }
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal);
            });
        });
        
        // Close modal on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal);
            });
        });
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) this.closeModal(activeModal);
            }
        });
        
        // Filters
        ['filterDateFrom', 'filterDateTo', 'filterSymbol', 'filterCategory', 'filterType'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.applyFilters());
        });
        document.getElementById('clearFiltersBtn').addEventListener('click', () => this.clearFilters());
        
        // Table sorting
        document.querySelectorAll('.trades-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                this.sortTrades(column);
            });
        });
        
        // Select all checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        
        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPage').addEventListener('click', () => this.changePage(1));
        
        // Bulk delete
        document.getElementById('bulkDeleteBtn').addEventListener('click', () => this.bulkDelete());
        
        // Export/Import
        document.getElementById('exportCSVBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('exportJSONBtn').addEventListener('click', () => this.exportJSON());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => this.importFile(e));
    }

    // Theme Management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.dm.updateSettings({ theme: newTheme });
        document.getElementById('themeToggle').textContent = newTheme === 'light' ? '🌙' : '☀️';
        this.showToast('Theme changed', 'success');
    }

    applyTheme(theme) {
        if (!theme) {
            theme = this.dm.data.ui.theme || 'light';
        }
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('themeToggle').textContent = theme === 'light' ? '🌙' : '☀️';
    }

    // Account Management
    toggleAccount() {
        const newAccount = this.dm.currentAccount === 'real' ? 'demo' : 'real';
        this.dm.switchAccount(newAccount);
        document.getElementById('accountLabel').textContent = newAccount === 'real' ? 'Real' : 'Demo';
        this.render();
        this.showToast(`Switched to ${newAccount} account`, 'success');
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        // Focus first input
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    closeModal(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    // Trade Management
  openTradeModal(tradeId = null) {
    const form = document.getElementById('tradeForm');
    form.reset();
   
    if (tradeId) {
        const trade = this.dm.getTrades().find(t => t.id === tradeId);
        if (trade) {
            document.getElementById('tradeModalTitle').textContent = 'Edit Trade';
            document.getElementById('tradeId').value = trade.id;
            document.getElementById('tradeSymbol').value = trade.symbol;
            document.getElementById('tradeType').value = trade.type;
            document.getElementById('tradeEntryTime').value = this.formatDateTimeLocal(trade.entryTime);
            document.getElementById('tradeExitTime').value = this.formatDateTimeLocal(trade.exitTime);
            document.getElementById('tradeLots').value = trade.lots;
            document.getElementById('tradeEntryPrice').value = trade.entryPrice;
            document.getElementById('tradeExitPrice').value = trade.exitPrice;
            document.getElementById('tradeProfit').value = trade.profit;
            document.getElementById('tradeCurrency').value = trade.currency || 'ZAR';
            document.getElementById('tradeFees').value = trade.fees || 0;
            document.getElementById('tradeCategory').value = trade.category || '';
            document.getElementById('tradeNotes').value = trade.notes || '';
        }
    } else {
        document.getElementById('tradeModalTitle').textContent = 'Add Trade';
        document.getElementById('tradeId').value = '';  // Explicitly clear ID for new trades
        document.getElementById('tradeCurrency').value = 'ZAR';
        document.getElementById('tradeFees').value = 0;
        // Set current datetime
        const now = new Date();
        document.getElementById('tradeEntryTime').value = this.formatDateTimeLocal(now);
        document.getElementById('tradeExitTime').value = this.formatDateTimeLocal(now);
    }
   
    this.updateCategorySelect();
    this.openModal('tradeModal');
}

   autoCalculateProfit() {
    const profitInput = document.getElementById('tradeProfit');
    if (profitInput.value.trim() !== '') {
        return; // Don't overwrite if profit/loss is already manually entered
    }

    const entryPrice = parseFloat(document.getElementById('tradeEntryPrice').value) || 0;
    const exitPrice = parseFloat(document.getElementById('tradeExitPrice').value) || 0;
    const lots = parseFloat(document.getElementById('tradeLots').value) || 0;
    const type = document.getElementById('tradeType').value;

    if (entryPrice && exitPrice && lots) {
        let priceDiff = type === 'Buy' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
        // Simplified calculation - adjust multiplier based on instrument
        let profit = priceDiff * lots * 100; // Basic forex calculation
        profitInput.value = profit.toFixed(2);
    }
}

    saveTrade(e) {
        e.preventDefault();
        
        const tradeData = {
            symbol: document.getElementById('tradeSymbol').value.trim(),
            type: document.getElementById('tradeType').value,
            entryTime: new Date(document.getElementById('tradeEntryTime').value).toISOString(),
            exitTime: new Date(document.getElementById('tradeExitTime').value).toISOString(),
            lots: parseFloat(document.getElementById('tradeLots').value),
            entryPrice: parseFloat(document.getElementById('tradeEntryPrice').value),
            exitPrice: parseFloat(document.getElementById('tradeExitPrice').value),
            profit: parseFloat(document.getElementById('tradeProfit').value),
            currency: document.getElementById('tradeCurrency').value || 'ZAR',
            fees: parseFloat(document.getElementById('tradeFees').value) || 0,
            category: document.getElementById('tradeCategory').value,
            notes: document.getElementById('tradeNotes').value.trim()
        };
        
        const tradeId = document.getElementById('tradeId').value;
        
        if (tradeId) {
            this.dm.updateTrade(tradeId, tradeData);
            this.showToast('Trade updated successfully', 'success');
        } else {
            this.dm.addTrade(tradeData);
            this.showToast('Trade added successfully', 'success');
        }
        
        this.closeModal('tradeModal');
        this.render();
    }

    deleteTrade(tradeId) {
        if (confirm('Are you sure you want to delete this trade?')) {
            this.dm.deleteTrade(tradeId);
            this.showToast('Trade deleted', 'success');
            this.render();
        }
    }

    bulkDelete() {
        if (this.selectedTrades.size === 0) return;
        
        if (confirm(`Delete ${this.selectedTrades.size} selected trade(s)?`)) {
            this.dm.deleteMultipleTrades(Array.from(this.selectedTrades));
            this.selectedTrades.clear();
            this.showToast(`${this.selectedTrades.size} trade(s) deleted`, 'success');
            this.render();
        }
    }

    // Deposit Management
    openDepositModal(depositId = null) {
        const form = document.getElementById('depositForm');
        form.reset();
        
        if (depositId) {
            const deposit = this.dm.getDeposits().find(d => d.id === depositId);
            if (deposit) {
                document.getElementById('depositModalTitle').textContent = 'Edit Deposit/Withdrawal';
                document.getElementById('depositId').value = deposit.id;
                document.getElementById('depositType').value = deposit.type;
                document.getElementById('depositAmount').value = Math.abs(deposit.amount);
                document.getElementById('depositDate').value = this.formatDateTimeLocal(deposit.date);
                document.getElementById('depositNotes').value = deposit.notes || '';
            }
        } else {
            document.getElementById('depositModalTitle').textContent = 'Add Deposit/Withdrawal';
            const now = new Date();
            document.getElementById('depositDate').value = this.formatDateTimeLocal(now);
        }
        
        this.openModal('depositModal');
    }

    saveDeposit(e) {
        e.preventDefault();
        
        const depositData = {
            type: document.getElementById('depositType').value,
            amount: parseFloat(document.getElementById('depositAmount').value),
            date: new Date(document.getElementById('depositDate').value).toISOString(),
            notes: document.getElementById('depositNotes').value.trim()
        };
        
        const depositId = document.getElementById('depositId').value;
        
        if (depositId) {
            this.dm.updateDeposit(depositId, depositData);
            this.showToast('Deposit updated successfully', 'success');
        } else {
            this.dm.addDeposit(depositData);
            this.showToast('Deposit added successfully', 'success');
        }
        
        this.closeModal('depositModal');
        if (document.getElementById('depositsModal').classList.contains('active')) {
            this.renderDepositsList();
        }
        this.render();
    }

    openDepositsModal() {
        this.renderDepositsList();
        this.openModal('depositsModal');
    }

    renderDepositsList() {
    const list = document.getElementById('depositsList');
    const deposits = this.dm.getDeposits().sort((a,b)=>new Date(b.date)-new Date(a.date));

    // ---- calculate totals ----
    let totalDep = 0, totalWith = 0;
    deposits.forEach(d => {
        const amt = parseFloat(d.amount);
        d.type === 'deposit' ? totalDep += amt : totalWith += amt;
    });
    document.getElementById('totalDeposits').textContent   = this.formatCurrency(totalDep);
    document.getElementById('totalWithdrawals').textContent = this.formatCurrency(totalWith);
    // --------------------------------

    if (deposits.length === 0) {
        list.innerHTML = '<li class="empty-state">No deposits/withdrawals yet</li>';
    } else {
        list.innerHTML = deposits.map(dep => {
            const amount = parseFloat(dep.amount);
            const sign   = dep.type === 'deposit' ? '+' : '-';
            const cls    = dep.type === 'deposit' ? 'positive' : 'negative';
            return `
                <li>
                    <span class="deposit-info">
                        <span class="${cls}">${sign} ${this.formatCurrency(amount)}</span>
                        – ${this.formatDateTime(dep.date)}
                        ${dep.notes ? ` – ${this.escapeHtml(dep.notes)}` : ''}
                    </span>
                    <div class="deposit-actions">
                        <button class="btn btn-sm btn-secondary" onclick="ui.openDepositModal('${dep.id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="ui.deleteDeposit('${dep.id}')">Delete</button>
                    </div>
                </li>
            `;
        }).join('');
    }
}

    deleteDeposit(depositId) {
        if (confirm('Are you sure you want to delete this deposit/withdrawal?')) {
            this.dm.deleteDeposit(depositId);
            this.showToast('Deposit deleted', 'success');
            this.renderDepositsList();
            this.render();
        }
    }

    // Category Management
    openCategoriesModal() {
        this.renderCategoriesList();
        this.openModal('categoriesModal');
    }

    renderCategoriesList() {
        const list = document.getElementById('categoriesList');
        const categories = this.dm.getCategories();
        
        list.innerHTML = categories.map(cat => `
            <li>
                <span class="category-name">${this.escapeHtml(cat)}</span>
                <div class="category-actions">
                    <button class="btn btn-sm btn-secondary" onclick="ui.renameCategory('${this.escapeHtml(cat)}')">Rename</button>
                    <button class="btn btn-sm btn-danger" onclick="ui.deleteCategory('${this.escapeHtml(cat)}')">Delete</button>
                </div>
            </li>
        `).join('');
    }

    addCategory() {
        const input = document.getElementById('newCategory');
        const name = input.value.trim();
        
        if (!name) {
            this.showToast('Please enter a category name', 'error');
            return;
        }
        
        if (this.dm.addCategory(name)) {
            input.value = '';
            this.renderCategoriesList();
            this.updateCategorySelect();
            this.showToast('Category added', 'success');
        } else {
            this.showToast('Category already exists', 'error');
        }
    }

    renameCategory(oldName) {
        const newName = prompt('Enter new category name:', oldName);
        if (newName && newName.trim() && newName !== oldName) {
            if (this.dm.renameCategory(oldName, newName.trim())) {
                this.renderCategoriesList();
                this.updateCategorySelect();
                this.showToast('Category renamed', 'success');
                this.render();
            } else {
                this.showToast('Failed to rename category', 'error');
            }
        }
    }

    deleteCategory(name) {
        if (confirm(`Delete category "${name}"? This will remove it from all trades.`)) {
            this.dm.deleteCategory(name);
            this.renderCategoriesList();
            this.updateCategorySelect();
            this.showToast('Category deleted', 'success');
            this.render();
        }
    }

    updateCategorySelect() {
        const categories = this.dm.getCategories();
        const selects = [
            document.getElementById('tradeCategory'),
            document.getElementById('filterCategory')
        ];
        
        selects.forEach(select => {
            const currentValue = select.value;
            const isFilter = select.id === 'filterCategory';
            
            select.innerHTML = isFilter ? '<option value="">All Categories</option>' : '<option value="">None</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });
            
            select.value = currentValue;
        });
    }

    // Settings Management
    openSettingsModal() {
        const settings = this.dm.getSettings();
        document.getElementById('settingsCurrency').value = settings.currency || 'ZAR';
        document.getElementById('settingsDecimals').value = settings.decimals || 2;
        document.getElementById('settingsDefaultAccount').value = settings.defaultAccount || 'real';
        this.openModal('settingsModal');
    }

    saveSettings(e) {
        e.preventDefault();
        
        const settings = {
            currency: document.getElementById('settingsCurrency').value || 'ZAR',
            decimals: parseInt(document.getElementById('settingsDecimals').value) || 2,
            defaultAccount: document.getElementById('settingsDefaultAccount').value
        };
        
        this.dm.updateSettings(settings);
        this.closeModal('settingsModal');
        this.showToast('Settings saved', 'success');
        this.render();
    }

    // Filtering & Sorting
    applyFilters() {
        const dateFrom = document.getElementById('filterDateFrom').value;
        const dateTo = document.getElementById('filterDateTo').value;
        const symbol = document.getElementById('filterSymbol').value.toLowerCase();
        const category = document.getElementById('filterCategory').value;
        const type = document.getElementById('filterType').value;
        
        let trades = this.dm.getTrades();
        
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            trades = trades.filter(t => new Date(t.exitTime) >= fromDate);
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            trades = trades.filter(t => new Date(t.exitTime) <= toDate);
        }
        
        if (symbol) {
            trades = trades.filter(t => t.symbol.toLowerCase().includes(symbol));
        }
        
        if (category) {
            trades = trades.filter(t => t.category === category);
        }
        
        if (type) {
            trades = trades.filter(t => t.type === type);
        }
        
        this.filteredTrades = trades;
        this.currentPage = 1;
        this.renderTradesTable();
        this.updateSymbolFilter();
    }

    clearFilters() {
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        document.getElementById('filterSymbol').value = '';
        document.getElementById('filterCategory').value = '';
        document.getElementById('filterType').value = '';
        this.applyFilters();
    }

    sortTrades(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'desc';
        }
        
        this.renderTradesTable();
    }

    updateSymbolFilter() {
        const trades = this.dm.getTrades();
        const symbols = [...new Set(trades.map(t => t.symbol))].sort();
        const select = document.getElementById('filterSymbol');
        const currentValue = select.value;
        
        // Keep it as text input for flexibility
        // Just update datalist if we add one later
    }

    // Table Rendering
    renderTradesTable() {
        const tbody = document.getElementById('tradesTableBody');
        let trades = this.filteredTrades.length > 0 || this.hasActiveFilters() 
            ? this.filteredTrades 
            : this.dm.getTrades();
        
        // Sort trades
        trades = [...trades].sort((a, b) => {
            let aVal = a[this.sortColumn];
            let bVal = b[this.sortColumn];
            
            if (this.sortColumn === 'entryTime' || this.sortColumn === 'exitTime') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        // Pagination
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageTrades = trades.slice(startIdx, endIdx);
        const totalPages = Math.ceil(trades.length / this.itemsPerPage);
        
        if (pageTrades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="empty-state">No trades found</td></tr>';
        } else {
            tbody.innerHTML = pageTrades.map(trade => {
                const netProfit = parseFloat(trade.profit || 0) - parseFloat(trade.fees || 0);
                const profitClass = netProfit >= 0 ? 'profit-positive' : 'profit-negative';
                const isSelected = this.selectedTrades.has(trade.id);
                
                return `
                    <tr>
                        <td><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="ui.toggleTradeSelection('${trade.id}', this.checked)"></td>
                        <td>${this.escapeHtml(trade.symbol)}</td>
                        <td>${this.escapeHtml(trade.type)}</td>
                        <td>${this.formatDateTime(trade.entryTime)}</td>
                        <td>${this.formatDateTime(trade.exitTime)}</td>
                        <td>${trade.lots}</td>
                       <td>${parseFloat(trade.entryPrice).toFixed(2)}</td>
<td>${parseFloat(trade.exitPrice).toFixed(2)}</td>
                        <td class="${profitClass}">${this.formatCurrency(netProfit)}</td>
                        <td>${this.escapeHtml(trade.category || '-')}</td>
                        <td class="trade-actions">
                            <button class="btn btn-sm btn-secondary" onclick="ui.openTradeModal('${trade.id}')">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="ui.deleteTrade('${trade.id}')">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
        
        // Update pagination
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages || 1}`;
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage >= totalPages;
        
        // Update bulk delete button
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        bulkDeleteBtn.style.display = this.selectedTrades.size > 0 ? 'block' : 'none';
        
        // Update select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        selectAllCheckbox.checked = pageTrades.length > 0 && pageTrades.every(t => this.selectedTrades.has(t.id));
    }

    hasActiveFilters() {
        return document.getElementById('filterDateFrom').value ||
               document.getElementById('filterDateTo').value ||
               document.getElementById('filterSymbol').value ||
               document.getElementById('filterCategory').value ||
               document.getElementById('filterType').value;
    }

    toggleTradeSelection(tradeId, selected) {
        if (selected) {
            this.selectedTrades.add(tradeId);
        } else {
            this.selectedTrades.delete(tradeId);
        }
        this.renderTradesTable();
    }

    toggleSelectAll(checked) {
        const tbody = document.getElementById('tradesTableBody');
        const checkboxes = tbody.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(cb => {
            const tradeId = cb.onchange.toString().match(/'([^']+)'/)[1];
            if (checked) {
                this.selectedTrades.add(tradeId);
            } else {
                this.selectedTrades.delete(tradeId);
            }
        });
        
        this.renderTradesTable();
    }

    changePage(delta) {
        this.currentPage += delta;
        this.renderTradesTable();
    }

    // KPI Rendering
    renderKPIs() {
        const settings = this.dm.getSettings();
        const decimals = settings.decimals || 2;
        
        document.getElementById('kpiBalance').textContent = this.formatCurrency(this.analytics.calculateBalance(), decimals);
        
        const totalPnL = this.analytics.calculateTotalPnL();
        const pnlElement = document.getElementById('kpiPnL');
        pnlElement.textContent = this.formatCurrency(totalPnL, decimals);
        pnlElement.className = 'kpi-value ' + (totalPnL >= 0 ? 'positive' : 'negative');
        
        document.getElementById('kpiWinRate').textContent = this.analytics.calculateWinRate().toFixed(1) + '%';
        document.getElementById('kpiTrades').textContent = this.dm.getTrades().length;
        
        const avgWin = this.analytics.calculateAverageWin();
        document.getElementById('kpiAvgWin').textContent = this.formatCurrency(avgWin, decimals);
        
        const avgLoss = this.analytics.calculateAverageLoss();
        document.getElementById('kpiAvgLoss').textContent = this.formatCurrency(avgLoss, decimals);
    }

    // Charts Rendering
    renderCharts() {
        this.renderEquityChart();
        this.renderSymbolChart();
    }

    renderEquityChart() {
        const ctx = document.getElementById('equityChart');
        const data = this.analytics.getEquityCurveData();
        
        if (this.charts.equity) {
            this.charts.equity.destroy();
        }
        
        this.charts.equity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => this.formatDate(d.date)),
                datasets: [{
                    label: 'Balance',
                    data: data.map(d => d.balance),
                    borderColor: 'rgb(13, 110, 253)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    renderSymbolChart() {
        const ctx = document.getElementById('symbolChart');
        const data = this.analytics.getProfitBySymbol();
        
        if (this.charts.symbol) {
            this.charts.symbol.destroy();
        }
        
        const sortedData = data.sort((a, b) => b.profit - a.profit).slice(0, 10);
        
        this.charts.symbol = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedData.map(d => d.symbol),
                datasets: [{
                    label: 'Profit/Loss',
                    data: sortedData.map(d => d.profit),
                    backgroundColor: sortedData.map(d => 
                        d.profit >= 0 ? 'rgba(25, 135, 84, 0.7)' : 'rgba(220, 53, 69, 0.7)'
                    ),
                    borderColor: sortedData.map(d => 
                        d.profit >= 0 ? 'rgb(25, 135, 84)' : 'rgb(220, 53, 69)'
                    ),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    // Export/Import
    exportCSV() {
        const trades = this.dm.getTrades();
        if (trades.length === 0) {
            this.showToast('No trades to export', 'error');
            return;
        }
        
        const headers = ['ID', 'Symbol', 'Type', 'Entry Time', 'Exit Time', 'Lots', 'Entry Price', 'Exit Price', 'Profit', 'Currency', 'Fees', 'Category', 'Notes'];
        const rows = trades.map(t => [
            t.id,
            t.symbol,
            t.type,
            t.entryTime,
            t.exitTime,
            t.lots,
            t.entryPrice,
            t.exitPrice,
            t.profit,
            t.currency,
            t.fees,
            t.category,
            t.notes
        ]);
        
        const csv = [headers, ...rows].map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        this.downloadFile(csv, `trades_${this.dm.currentAccount}_${Date.now()}.csv`, 'text/csv');
        this.showToast('CSV exported successfully', 'success');
    }

    exportJSON() {
        const json = this.dm.exportAccountToJSON();
        this.downloadFile(json, `trades_${this.dm.currentAccount}_${Date.now()}.json`, 'application/json');
        this.showToast('JSON exported successfully', 'success');
    }

    importFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                
                if (file.name.endsWith('.json')) {
                    if (this.dm.importFromJSON(content)) {
                        this.showToast('Data imported successfully', 'success');
                        this.render();
                    } else {
                        this.showToast('Failed to import data', 'error');
                    }
                } else if (file.name.endsWith('.csv')) {
                    this.showToast('CSV import not yet implemented', 'error');
                } else {
                    this.showToast('Unsupported file format', 'error');
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Failed to import file', 'error');
            }
            
            e.target.value = '';
        };
        
        reader.readAsText(file);
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Utility Functions
    formatCurrency(value, decimals = 2) {
        const settings = this.dm.getSettings();
        const currency = settings.currency || 'ZAR';
        return `${currency} ${parseFloat(value).toFixed(decimals)}`;
    }

    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleDateString();
    }

    formatDateTime(datetime) {
        if (!(datetime instanceof Date)) {
            datetime = new Date(datetime);
        }
        return datetime.toLocaleString();
    }

    formatDateTimeLocal(datetime) {
        if (!(datetime instanceof Date)) {
            datetime = new Date(datetime);
        }
        const year = datetime.getFullYear();
        const month = String(datetime.getMonth() + 1).padStart(2, '0');
        const day = String(datetime.getDate()).padStart(2, '0');
        const hours = String(datetime.getHours()).padStart(2, '0');
        const minutes = String(datetime.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Main Render
    render() {
        this.renderKPIs();
        this.applyFilters();
        this.renderCharts();
        this.updateCategorySelect();
        
        // Update account label
        document.getElementById('accountLabel').textContent = 
            this.dm.currentAccount === 'real' ? 'Real' : 'Demo';
    }
}

// ============================================================================
// Initialize Application
// ============================================================================

let dataManager, analytics, ui;

document.addEventListener('DOMContentLoaded', () => {
    dataManager = new DataManager();
    analytics = new Analytics(dataManager);
    ui = new UIManager(dataManager, analytics);
    
    // Make ui globally accessible for inline event handlers
    window.ui = ui;
    
    console.log('Trading Journal initialized');
});
