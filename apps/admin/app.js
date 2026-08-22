// Admin App - Backend API Integration
// This script connects the admin panel to the backend API

class AdminApp {
    constructor() {
        // Default to port 4000 if running locally on a different port
        const defaultBase = (typeof window !== 'undefined' && window.location?.hostname === 'localhost') ?
            'http://localhost:4000' :
            'https://api.autobidder.in';

        this.apiBase = localStorage.getItem('apiBase') || defaultBase;
        this.environment = this.apiBase.includes('localhost') ? 'LOCAL' : 'LIVE';
        this.token = localStorage.getItem('admin_token');
        this.initializeEventListeners();
    }

    setApiBase(url) {
        // Clean URL to base (no /api suffix)
        this.apiBase = url.replace(/\/$/, '').replace(/\/api$/, '');
        this.environment = this.apiBase.includes('localhost') ? 'LOCAL' : 'LIVE';
        localStorage.setItem('apiBase', this.apiBase);
        this.updateEnvironmentUI();
    }

    updateEnvironmentUI() {
        const envBadge = document.getElementById('env-badge');
        if (envBadge) {
            envBadge.textContent = this.environment;
            envBadge.className = `badge badge-${this.environment === 'LIVE' ? 'success' : 'warning'}`;
        }
    }

    initializeEventListeners() {
        const input = document.getElementById('apiBase');
        if (input) {
            input.value = this.apiBase;
            input.addEventListener('change', (e) => {
                this.setApiBase(e.target.value);
            });
        }

        const envSelector = document.getElementById('envSelector');
        if (envSelector) {
            envSelector.value = this.apiBase;
            envSelector.addEventListener('change', (e) => {
                this.setApiBase(e.target.value);
                if (input) input.value = e.target.value;
                location.reload(); // Reload to apply new base to all requests
            });
        }

        this.updateEnvironmentUI();
    }

    async fetch(endpoint, options = {}) {
        // Ensure endpoint starts with /api if not already
        const path = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
        const url = `${this.apiBase}${path}`;

        const headers = {
            ...options.headers,
        };

        // Don't set Content-Type if we're sending FormData (let the browser do it with the boundary)
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (response.status === 401) {
                this.token = null;
                localStorage.removeItem('admin_token');
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Unauthorized: Session expired');
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || `API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async login(email, password) {
        const result = await this.fetch('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.token = result.token;
        localStorage.setItem('admin_token', this.token);
        return result;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('admin_token');
    }

    // Users
    async getUsers() { return this.fetch('/admin/users/all'); }
    async getUserById(id) { return this.fetch(`/admin/users/${id}`); }
    async updateUser(id, data) {
        return this.fetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    }
    async verifyUser(id, isVerified) {
        return this.fetch(`/admin/users/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ isVerified }) });
    }
    async deleteUser(id) {
        return this.fetch(`/admin/users/${id}`, { method: 'DELETE' });
    }

    // Listings & Vehicles
    async getListings() { return this.fetch('/admin/listings/all'); }
    async getListingById(id) { return this.fetch(`/admin/listings/${id}`); }
    async updateListingStatus(id, status) {
        return this.fetch(`/admin/listings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    }
    async deleteListing(id) {
        return this.fetch(`/admin/listings/${id}`, { method: 'DELETE' });
    }

    // Bids & Auctions
    async getBids() { return this.fetch('/admin/bids/all'); }
    async getAutoBids() { return this.fetch('/admin/auto-bids/all'); }
    async updateBidStatus(id, status) {
        return this.fetch(`/admin/bids/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    }
    async deleteBid(id) {
        return this.fetch(`/admin/bids/${id}`, { method: 'DELETE' });
    }
    async extendAuction(id, minutes) {
        return this.fetch(`/admin/listings/${id}/extend`, { method: 'PATCH', body: JSON.stringify({ minutes }) });
    }

    // Financials
    async getPayments() { return this.fetch('/admin/payments/all'); }
    async getRevenueAnalytics() { return this.fetch('/admin/analytics'); }
    async getCommissions() { return this.fetch('/admin/commissions'); }
    async getPayouts() { return this.fetch('/admin/payouts'); }
    async processPayout(id) {
        return this.fetch(`/admin/payouts/${id}/process`, { method: 'POST' });
    }
    async processRefund(id) {
        return this.fetch(`/admin/payments/${id}/refund`, { method: 'POST' });
    }

    // Dealers & Leads
    async getDealers() { return this.fetch('/admin/dealers'); }
    async getDealerById(id) { return this.fetch(`/admin/dealers/${id}`); }
    async createDealer(data) {
        return this.fetch('/admin/dealers', { method: 'POST', body: JSON.stringify(data) });
    }
    async getLeads() { return this.fetch('/admin/leads'); }
    async updateDealerStatus(id, status) {
        return this.fetch(`/admin/dealers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    }
    async toggleDealerPromotion(id, isFeatured) {
        return this.fetch(`/admin/dealers/${id}/promote`, { method: 'PATCH', body: JSON.stringify({ isFeatured }) });
    }
    async deleteDealer(id) {
        return this.fetch(`/admin/dealers/${id}`, { method: 'DELETE' });
    }
    async markDelivered(id) {
        return this.fetch(`/admin/listings/${id}/delivered`, { method: 'PATCH' });
    }

    // Verification specialized
    async getSellersVerification() { return this.fetch('/admin/users/verification-pending'); }
    async getVehiclesVerification() { return this.fetch('/admin/listings/verification-pending'); }

    // System
    async getFraudAlerts() { return this.fetch('/admin/fraud/alerts'); }
    async getLogs() { return this.fetch('/admin/logs'); }
    async terminateAutoBid(id) {
        return this.fetch(`/admin/auto-bids/${id}/terminate`, { method: 'PATCH' });
    }
    async blockUser(id) {
        return this.fetch(`/admin/users/${id}/block`, { method: 'PATCH' });
    }
    async sendNotification(data) {
        return this.fetch('/admin/notifications/send', { method: 'POST', body: JSON.stringify(data) });
    }
    async getDashboardStats() { return this.fetch('/admin/dashboard'); }

    // Global Search
    async globalSearch(query) {
        return this.fetch(`/admin/search?q=${encodeURIComponent(query)}`);
    }

    // Sliders
    async getSliders() { return this.fetch('/admin/sliders/all'); }
    async createSlider(data) {
        return this.fetch('/admin/sliders', { method: 'POST', body: JSON.stringify(data) });
    }
    async updateSlider(id, data) {
        return this.fetch(`/admin/sliders/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    }
    async deleteSlider(id) {
        return this.fetch(`/admin/sliders/${id}`, { method: 'DELETE' });
    }

    // Brands
    async getBrands() { return this.fetch('/admin/brands/all'); }
    async createBrand(data) {
        return this.fetch('/admin/brands', { method: 'POST', body: JSON.stringify(data) });
    }
    async updateBrand(id, data) {
        return this.fetch(`/admin/brands/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    }
    async deleteBrand(id) {
        return this.fetch(`/admin/brands/${id}`, { method: 'DELETE' });
    }

    // Collections
    async getCollections() { return this.fetch('/admin/collections/all'); }
    async createCollection(data) {
        return this.fetch('/admin/collections', { method: 'POST', body: JSON.stringify(data) });
    }
    async updateCollection(id, data) {
        return this.fetch(`/admin/collections/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    }
    async deleteCollection(id) {
        return this.fetch(`/admin/collections/${id}`, { method: 'DELETE' });
    }

    // News
    async getNews() { return this.fetch('/admin/news/all'); }
    async createNews(data) {
        return this.fetch('/admin/news', { method: 'POST', body: JSON.stringify(data) });
    }
    async updateNews(id, data) {
        return this.fetch(`/admin/news/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    }
    async deleteNews(id) {
        return this.fetch(`/admin/news/${id}`, { method: 'DELETE' });
    }

    // DNP (Dealer Network Program)
    async getDnpLeads() { return this.fetch('/admin/dnp/leads'); }
    async getDnpCommissions() { return this.fetch('/admin/dnp/commissions'); }
    async getDnpWithdrawals() { return this.fetch('/admin/dnp/withdrawals'); }
    async processDnpWithdrawal(id, status, notes) {
        return this.fetch(`/admin/dnp/withdrawals/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, adminNotes: notes })
        });
    }
    async getDnpStats() { return this.fetch('/admin/dnp/stats'); }

    // Health & System
    async getHealth() {
        // Use raw fetch for health to avoid auth/prefix issues if needed,
        // but this.fetch works if /api/health exists
        return this.fetch('/health');
    }

    // Upload
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.fetch('/upload', {
            method: 'POST',
            body: formData,
        });
    }

    // Appointments
    async getAppointments() { return this.fetch('/admin/appointments/all'); }
    async updateAppointmentStatus(id, status) {
        return this.fetch(`/admin/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    }

    // RTO & NOC
    async getRtoNocs() { return this.fetch('/admin/rto-noc/all'); }
    async updateRtoNoc(listingId, data) {
        return this.fetch(`/listings/${listingId}/rto-noc`, { method: 'PUT', body: JSON.stringify(data) });
    }

    // Push Tokens
    async getPushTokens() { return this.fetch('/admin/push-tokens/all'); }

    // Seed
    async seedData() { return this.fetch('/admin/seed-rich', { method: 'POST' }); }
}

// Create global admin app instance
const adminApp = new AdminApp();