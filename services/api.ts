import { Product, Order, User, Ticket, ServiceOffering, ResourceItem, Review, ServiceRequest, UserRole } from '../types';

// Helper to handle response
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || response.statusText);
    }
    return response.json();
};

export const api = {
    // --- SYSTEM ---
    async checkHealth() {
        try {
            const res = await fetch('/api/health');
            return await res.json();
        } catch (e) {
            throw new Error('API_OFFLINE');
        }
    },

    // --- PRODUCTS ---
    async getProducts(): Promise<Product[]> {
        const res = await fetch('/api/products');
        return handleResponse(res);
    },

    async addProduct(product: Product) {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return handleResponse(res);
    },

    async updateProduct(product: Product) {
        const res = await fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return handleResponse(res);
    },

    async deleteProduct(id: string) {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        return handleResponse(res);
    },

    // --- ORDERS ---
    async createOrder(orderData: { userId: string; items: Product[]; total: number; paymentMethod?: string }) {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return handleResponse(res);
    },

    async getUserOrders(userId: string): Promise<Order[]> {
        const res = await fetch(`/api/users/${userId}/orders`);
        return handleResponse(res);
    },

    async getAllOrders(): Promise<Order[]> {
        const res = await fetch('/api/orders');
        return handleResponse(res);
    },

    async updateOrderStatus(orderId: string, status: string, reason?: string) {
        const res = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, rejectionReason: reason })
        });
        return handleResponse(res);
    },

    // --- AUTH & USERS ---
    async login(userData: Partial<User> & { isRegister?: boolean }) {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return handleResponse(res);
    },

    async getAllUsers(): Promise<User[]> {
        const res = await fetch('/api/users');
        return handleResponse(res);
    },

    async updateUser(userId: string, updates: Partial<User>) {
        const res = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return handleResponse(res);
    },

    // --- TICKETS ---
    async getTickets(): Promise<Ticket[]> {
        const res = await fetch('/api/tickets');
        return handleResponse(res);
    },

    async createTicket(ticketData: { userId: string; subject: string; message: string }) {
        const res = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
        });
        return handleResponse(res);
    },

    async replyTicket(ticketId: string, sender: 'USER' | 'ADMIN', message: string) {
        const res = await fetch(`/api/tickets/${ticketId}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender, message })
        });
        return handleResponse(res);
    },

    async updateTicketStatus(ticketId: string, status: string) {
        const res = await fetch(`/api/tickets/${ticketId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return handleResponse(res);
    },

    // --- SERVICES ---
    async getServices(): Promise<ServiceOffering[]> {
        const res = await fetch('/api/services');
        return handleResponse(res);
    },

    async getServiceRequests(): Promise<ServiceRequest[]> {
        const res = await fetch('/api/service-requests');
        return handleResponse(res);
    },

    async submitServiceRequest(data: { userId: string; serviceType: string; contact: string; details: string }) {
        const res = await fetch('/api/service-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    async updateServiceRequestStatus(id: string, status: string) {
        const res = await fetch(`/api/service-requests/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return handleResponse(res);
    },

    // --- RESOURCES ---
    async getResources(): Promise<ResourceItem[]> {
        const res = await fetch('/api/resources');
        return handleResponse(res);
    },
    
    async addResource(resource: ResourceItem) {
        const res = await fetch('/api/resources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resource)
        });
        return handleResponse(res);
    },

    async updateResource(resource: ResourceItem) {
        const res = await fetch(`/api/resources/${resource.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resource)
        });
        return handleResponse(res);
    },

    async deleteResource(id: string) {
        const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
        return handleResponse(res);
    },

    // --- REVIEWS ---
    async getReviews(): Promise<Review[]> {
        const res = await fetch('/api/reviews');
        return handleResponse(res);
    },

    async addReview(review: Review) {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        });
        return handleResponse(res);
    },

    async deleteReview(id: string) {
        const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
        return handleResponse(res);
    }
};