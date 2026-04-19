// frontend/app/dashboard/messages/components/ChatThread.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useChatMessages, useWebSocket, markMessagesAsRead } from '@/lib/chat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface ChatThreadProps {
  relationshipId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  otherUserId: string;
}

export function ChatThread({
  relationshipId,
  otherUserName,
  otherUserAvatar,
  otherUserId,
}: ChatThreadProps) {
  const { user } = useAuth();
  const { messages: historicalMessages, isLoading } = useChatMessages(relationshipId);
  const { status, messages: wsMessages, onlineUsers, sendMessage } = useWebSocket(relationshipId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Combine historical + real-time messages
  const allMessages = [...historicalMessages, ...wsMessages];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length]);

  // Mark messages as read when they appear in viewport
  useEffect(() => {
    if (allMessages.length === 0 || !user) return;

    const lastMessage = allMessages[allMessages.length - 1];
    if (lastMessage.sender_id === user.id) return; // Don't mark own messages

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markMessagesAsRead(relationshipId, lastMessage.id).catch(console.error);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (messagesEndRef.current) {
      observerRef.current.observe(messagesEndRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [allMessages, relationshipId, user]);

  const isOnline = onlineUsers.has(otherUserId);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--nc-stone)',
        }}
      >
        Cargando mensajes...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: 16,
          borderBottom: '1px solid var(--nc-border)',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {otherUserAvatar ? (
          <img
            src={otherUserAvatar}
            alt={otherUserName}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--nc-forest)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {otherUserName.charAt(0).toUpperCase()}
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--nc-ink)' }}>
            {otherUserName}
          </div>
          <div style={{ fontSize: 12, color: 'var(--nc-stone)' }}>
            {status === 'connected' ? (
              isOnline ? (
                <span style={{ color: '#2A7A4A' }}>● Online</span>
              ) : (
                'Offline'
              )
            ) : (
              'Connecting...'
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          background: '#FAFAF9',
        }}
      >
        {allMessages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--nc-stone)',
              fontSize: 13,
              marginTop: 40,
            }}
          >
            No hay mensajes aún. ¡Envía el primero!
          </div>
        ) : (
          allMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.sender_id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        relationshipId={relationshipId}
        onSendMessage={sendMessage}
        disabled={status !== 'connected'}
      />
    </div>
  );
}
