
import { Product, Order, User, Ticket, ServiceOffering, ResourceItem, Review, ServiceRequest } from '../types';

// Detect environment
const API_BASE = '/api';

export const api = {
    // --- PRODUCTS ---
    async getProducts(): Promise<Product[]> {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
    },

    async addProduct(product: Product) {
        const res = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Failed to add product');
        return res.json();
    },

    async updateProduct(product: Product) {
        const res = await fetch(`${API_BASE}/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Failed to update product');
        return res.json();
    },

    async deleteProduct(id: string) {
        const res = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete product');
        return res.json();
    },

    // --- ORDERS ---
    async createOrder(orderData: { userId: string; items: Product[]; total: number; paymentMethod?: string }) {
        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (!res.ok) throw new Error('Failed to create order');
        return res.json();
    },

    async getUserOrders(userId: string): Promise<Order[]> {
        const res = await fetch(`${API_BASE}/users/${userId}/orders`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    },

    async getAllOrders(): Promise<Order[]> {
        const res = await fetch(`${API_BASE}/orders`);
        if (!res.ok) throw new Error('Failed to fetch all orders');
        return res.json();
    },

    async updateOrderStatus(orderId: string, status: string, reason?: string) {
        const res = await fetch(`${API_BASE}/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, rejectionReason: reason })
        });
        return res.json();
    },

    // --- AUTH & USERS ---
    async login(userData: Partial<User>) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },

    async getAllUsers(): Promise<User[]> {
        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    // --- TICKETS ---
    async getTickets(): Promise<Ticket[]> {
        const res = await fetch(`${API_BASE}/tickets`);
        if (!res.ok) throw new Error('Failed to fetch tickets');
        return res.json();
    },

    async createTicket(ticketData: { userId: string; subject: string; message: string }) {
        const res = await fetch(`${API_BASE}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
        });
        return res.json();
    },

    async replyTicket(ticketId: string, sender: 'USER' | 'ADMIN', message: string) {
        const res = await fetch(`${API_BASE}/tickets/${ticketId}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender, message })
        });
        return res.json();
    },

    async updateTicketStatus(ticketId: string, status: string) {
        const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return res.json();
    },

    // --- SERVICES ---
    async getServices(): Promise<ServiceOffering[]> {
        const res = await fetch(`${API_BASE}/services`);
        if (!res.ok) throw new Error('Failed to fetch services');
        return res.json();
    },

    async getServiceRequests(): Promise<ServiceRequest[]> {
        const res = await fetch(`${API_BASE}/service-requests`);
        if (!res.ok) throw new Error('Failed to fetch requests');
        return res.json();
    },

    async submitServiceRequest(data: { userId: string; serviceType: string; contact: string; details: string }) {
        const res = await fetch(`${API_BASE}/service-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async updateServiceRequestStatus(id: string, status: string) {
        const res = await fetch(`${API_BASE}/service-requests/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return res.json();
    },

    // --- RESOURCES ---
    async getResources(): Promise<ResourceItem[]> {
        const res = await fetch(`${API_BASE}/resources`);
        if (!res.ok) throw new Error('Failed to fetch resources');
        return res.json();
    },

    // --- REVIEWS ---
    async getReviews(): Promise<Review[]> {
        const res = await fetch(`${API_BASE}/reviews`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        return res.json();
    },

    async addReview(review: Review) {
        const res = await fetch(`${API_BASE}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        });
        return res.json();
    },

    async deleteReview(id: string) {
        const res = await fetch(`${API_BASE}/reviews/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};
