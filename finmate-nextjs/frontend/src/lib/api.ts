import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Portfolio, NewsItem, ChatRequest, ChatMessage, DocumentUploadResponse } from './types';
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = {
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const res = await fetch(url, { ...options, headers });
    return res;
};

// Portfolio API
export const usePortfolio = () => {
    return useQuery({
        queryKey: ['portfolio'],
        queryFn: async (): Promise<Portfolio> => {
            const res = await authenticatedFetch(`${API_BASE}/api/portfolio`);
            if (!res.ok) throw new Error('Failed to fetch portfolio');
            return res.json();
        }
    });
};

export const useStockQuote = (ticker: string | null) => {
    return useQuery({
        queryKey: ['quote', ticker],
        queryFn: async () => {
            if (!ticker) return null;
            const res = await authenticatedFetch(`${API_BASE}/api/quote/${ticker}`);
            if (!res.ok) throw new Error('Failed to fetch quote');
            return res.json();
        },
        enabled: !!ticker,
        refetchInterval: 10000, // Refresh every 10s
    });
};

export const useAddTicker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ticker: string): Promise<Portfolio> => {
            const res = await authenticatedFetch(`${API_BASE}/api/portfolio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker })
            });
            if (!res.ok) throw new Error('Failed to add ticker');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        }
    });
};

export const useRemoveTicker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ticker: string): Promise<Portfolio> => {
            const res = await authenticatedFetch(`${API_BASE}/api/portfolio/${ticker}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to remove ticker');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        }
    });
};

// News API
export const useNews = () => {
    return useQuery({
        queryKey: ['news'],
        queryFn: async (): Promise<NewsItem[]> => {
            const res = await authenticatedFetch(`${API_BASE}/api/news`);
            if (!res.ok) throw new Error('Failed to fetch news');
            return res.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useRefreshNews = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<NewsItem[]> => {
            const res = await authenticatedFetch(`${API_BASE}/api/news/refresh`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error('Failed to refresh news');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['news'] });
        }
    });
};

// Chat API
export const useChat = () => {
    return useMutation({
        mutationFn: async (request: ChatRequest): Promise<ChatMessage> => {
            const res = await authenticatedFetch(`${API_BASE}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });
            if (!res.ok) throw new Error('Chat request failed');
            return res.json();
        },
    });
};

export const useUploadDocument = () => {
    return useMutation({
        mutationFn: async (file: File): Promise<DocumentUploadResponse> => {
            const formData = new FormData();
            formData.append('file', file);

            const res = await authenticatedFetch(`${API_BASE}/api/chat/upload-document`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error('Document upload failed');
            return res.json();
        }
    });
};

export const useChatHistory = () => {
    return useQuery({
        queryKey: ['chatHistory'],
        queryFn: async (): Promise<any[]> => {
            const res = await authenticatedFetch(`${API_BASE}/api/chat/history`);
            if (!res.ok) throw new Error('Failed to fetch history');
            return res.json();
        },
        retry: false // Don't retry logic if auth fails
    });
};

export const useChatMessages = (conversationId: string | null) => {
    return useQuery({
        queryKey: ['chatMessages', conversationId],
        queryFn: async (): Promise<ChatMessage[]> => {
            if (!conversationId) return [];
            const res = await authenticatedFetch(`${API_BASE}/api/chat/${conversationId}/messages`);
            if (!res.ok) throw new Error('Failed to fetch messages');
            return res.json();
        },
        enabled: !!conversationId
    });
};

// Reports API
export const useGenerateReport = () => {
    return useMutation({
        mutationFn: async (newsItems: NewsItem[]): Promise<Blob> => {
            const res = await authenticatedFetch(`${API_BASE}/api/reports/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newsItems)
            });
            if (!res.ok) throw new Error('Failed to generate report');
            return res.blob();
        }
    });
};

