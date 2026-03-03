'use client';

import { useState, useCallback } from 'react';
import { api, apiUpload, ApiError } from '@/lib/api';

// Response types
interface AIQueryResponse {
  response: string;
  conversationId: string;
}

interface AIAnalysisResponse {
  analysis: string;
  fileUrl: string;
  type: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fileUrl?: string;
  createdAt: string;
}

interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIMessage[];
}

interface ConversationListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    messages: number;
  };
}

interface ConversationsResponse {
  conversations: ConversationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface FileUploadResponse {
  fileUrl: string;
  originalName: string;
}

/**
 * Hook for AI chat functionality
 */
export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a message to the AI and get a response
   */
  const sendQuery = useCallback(
    async (
      message: string,
      conversationId?: string,
      fileUrl?: string
    ): Promise<AIQueryResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post<{ success: boolean; data: AIQueryResponse }>(
          '/ai/query',
          {
            message,
            conversationId,
            fileUrl,
          }
        );
        return response.data;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to get AI response';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Analyze an image or document
   */
  const analyzeFile = useCallback(
    async (
      fileUrl: string,
      prompt?: string,
      type: 'image' | 'document' = 'image'
    ): Promise<AIAnalysisResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post<{ success: boolean; data: AIAnalysisResponse }>(
          '/ai/analyze',
          {
            fileUrl,
            prompt,
            type,
          }
        );
        return response.data;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to analyze file';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Upload a file and get the URL
   */
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiUpload<{ success: boolean; data: FileUploadResponse }>(
        '/upload/file',
        formData
      );
      return response.data.fileUrl;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to upload file';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendQuery,
    analyzeFile,
    uploadFile,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Hook for managing AI conversations
 */
export function useConversations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get list of conversations
   */
  const getConversations = useCallback(
    async (page = 1, limit = 20): Promise<ConversationsResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<{ success: boolean; data: ConversationsResponse }>(
          `/ai/conversations?page=${page}&limit=${limit}`
        );
        return response.data;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to fetch conversations';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Get a specific conversation with messages
   */
  const getConversation = useCallback(
    async (conversationId: string): Promise<AIConversation | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<{ success: boolean; data: AIConversation }>(
          `/ai/conversations/${conversationId}`
        );
        return response.data;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to fetch conversation';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(
    async (conversationId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await api.delete(`/ai/conversations/${conversationId}`);
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to delete conversation';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    getConversations,
    getConversation,
    deleteConversation,
    isLoading,
    error,
  };
}
