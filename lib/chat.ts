// frontend/lib/chat.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { api } from './api';
import type { ChatMessage, Conversation, UploadAttachmentResponse } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080';

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getConversations(): Promise<{ conversations: Conversation[] }> {
  return api.get('/chat/conversations');
}

export async function getChatHistory(
  relationshipId: string,
  limit = 50,
  before?: string,
): Promise<{ messages: ChatMessage[]; has_more: boolean }> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (before) params.append('before', before);
  return api.get(`/chat/${relationshipId}/messages?${params}`);
}

export async function uploadChatAttachment(
  relationshipId: string,
  file: File,
): Promise<UploadAttachmentResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(
    `${BASE_URL}/chat/${relationshipId}/upload`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    },
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Upload failed');
  }

  return res.json();
}

export async function sendChatMessage(
  relationshipId: string,
  data: {
    message_text?: string;
    attachment_url?: string;
    attachment_filename?: string;
    attachment_size_bytes?: number;
    attachment_content_type?: string;
  },
): Promise<{ message: ChatMessage }> {
  return api.post(`/chat/${relationshipId}/send`, data);
}

export async function markMessagesAsRead(
  relationshipId: string,
  lastReadMessageId: string,
): Promise<void> {
  await api.put(`/chat/${relationshipId}/read`, {
    last_read_message_id: lastReadMessageId,
  });

  // Revalidate conversations to update unread count
  mutate('/chat/conversations');
}

// ─── SWR Hooks ────────────────────────────────────────────────────────────────

export function useConversations() {
  const { data, error, mutate } = useSWR('/chat/conversations', getConversations);

  return {
    conversations: data?.conversations || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
}

export function useChatMessages(relationshipId: string | null) {
  const { data, error, mutate } = useSWR(
    relationshipId ? `/chat/${relationshipId}/messages` : null,
    () => getChatHistory(relationshipId!, 50),
  );

  return {
    messages: data?.messages || [],
    hasMore: data?.has_more || false,
    isLoading: !error && !data,
    error,
    mutate,
  };
}

// ─── WebSocket Hook ───────────────────────────────────────────────────────────

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface UseWebSocketReturn {
  status: ConnectionStatus;
  messages: ChatMessage[];
  onlineUsers: Set<string>;
  sendMessage: (text?: string, attachment?: UploadAttachmentResponse) => void;
}

export function useWebSocket(relationshipId: string | null): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!relationshipId) return;

    setStatus('connecting');

    // Get access token from sessionStorage (set during login)
    const token = sessionStorage.getItem('access_token');

    if (!token) {
      console.error('No access token found');
      setStatus('disconnected');
      return;
    }

    const ws = new WebSocket(`${WS_URL}/ws/chat/${relationshipId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      reconnectAttempts.current = 0;
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const serverMsg = JSON.parse(event.data);

        switch (serverMsg.type) {
          case 'connected':
            console.log('Connected to chat:', serverMsg.data);
            break;

          case 'message':
            setMessages((prev) => [...prev, serverMsg.data]);
            break;

          case 'presence':
            const { user_id, status: presenceStatus } = serverMsg.data;
            setOnlineUsers((prev) => {
              const next = new Set(prev);
              if (presenceStatus === 'online') {
                next.add(user_id);
              } else {
                next.delete(user_id);
              }
              return next;
            });
            break;

          case 'error':
            console.error('WebSocket error:', serverMsg.message);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setStatus('disconnected');
      wsRef.current = null;

      // Reconnect with exponential backoff
      if (event.code !== 1000) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        console.log(`Reconnecting in ${delay}ms...`);
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };
  }, [relationshipId]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connect]);

  const sendMessage = useCallback(
    (text?: string, attachment?: UploadAttachmentResponse) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('WebSocket not connected');
        return;
      }

      const message: any = {
        type: 'message',
      };

      if (text) {
        message.message_text = text;
      }

      if (attachment) {
        message.attachment_url = attachment.url;
        message.attachment_filename = attachment.filename;
        message.attachment_size_bytes = attachment.size_bytes;
        message.attachment_content_type = attachment.content_type;
      }

      wsRef.current.send(JSON.stringify(message));
    },
    [],
  );

  return {
    status,
    messages,
    onlineUsers,
    sendMessage,
  };
}
