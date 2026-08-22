// API client for admin panel
const API_BASE = (typeof window !== 'undefined' && localStorage.getItem('apiBase') ? localStorage.getItem('apiBase') : 'https://api.autobidder.in') + '/api';

class AdminAPI {
    constructor() {
        this.token = localStorage.getItem('admin_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('admin_token', token);
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `API Error: ${response.status}`);
        }

        return response.json();
    }

    // Auth endpoints
    async demoLogin(email, name) {
        return this.request('/auth/demo-login', {
            method: 'POST',
            body: JSON.stringify({ email, name }),
        });
    }

    // Listings
    async getListings(query = {}) {
        const params = new URLSearchParams();
        if (query.status) params.append('status', query.status);
        if (query.city) params.append('city', query.city);
        if (query.q) params.append('q', query.q);

        return this.request(`/listings?${params.toString()}`);
    }

    async getListingDetail(listingId) {
        return this.request(`/listings/${listingId}`);
    }

    async updateListing(listingId, data) {
        return this.request(`/listings/${listingId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async approveListing(listingId) {
        return this.updateListing(listingId, { status: 'ACTIVE' });
    }

    async rejectListing(listingId) {
        return this.updateListing(listingId, { status: 'REJECTED' });
    }

    // Bids
    async getBids(query = {}) {
        const params = new URLSearchParams();
        if (query.userId) params.append('userId', query.userId);

        return this.request(`/bids?${params.toString()}`);
    }

    async updateBidStatus(bidId, status) {
        return this.request(`/bids/${bidId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    // Users
    async getUsers(query = {}) {
        return this.request('/users', {
            method: 'GET',
        });
    }

    // Stats/Analytics
    async getStats() {
        return this.request('/admin/stats');
    }

    // Vehicles verification
    async getVehiclesPendingVerification() {
        return this.request('/admin/vehicles-verification');
    }

    // Sellers verification
    async getSellersPendingVerification() {
        return this.request('/admin/sellers-verification');
    }

    // Revenue analytics
    async getRevenueAnalytics(period = 'month') {
        const params = new URLSearchParams({ period });
        return this.request(`/admin/revenue?${params.toString()}`);
    }
}

// Export for use
const api = new AdminAPI();