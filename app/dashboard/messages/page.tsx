// frontend/app/dashboard/messages/page.tsx
'use client';

import { useState } from 'react';
import { useConversations } from '@/lib/chat';
import { ConversationsList } from './components/ConversationsList';
import { ChatThread } from './components/ChatThread';

export default function MessagesPage() {
  const [activeRelationshipId, setActiveRelationshipId] = useState<string | null>(null);
  const { conversations } = useConversations();

  const activeConversation = conversations.find(
    (c) => c.relationship_id === activeRelationshipId
  );

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Mensajes</div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          height: 'calc(100vh - 60px)',
          overflow: 'hidden',
        }}
      >
        {/* Conversations Sidebar */}
        <div
          style={{
            borderRight: '1px solid var(--nc-border)',
            background: 'white',
            overflowY: 'auto',
          }}
        >
          <ConversationsList
            activeRelationshipId={activeRelationshipId}
            onSelectConversation={setActiveRelationshipId}
          />
        </div>

        {/* Chat Thread */}
        <div style={{ background: '#FAFAF9' }}>
          {activeConversation ? (
            <ChatThread
              relationshipId={activeConversation.relationship_id}
              otherUserName={activeConversation.other_user_name}
              otherUserAvatar={activeConversation.other_avatar_url}
              otherUserId={activeConversation.other_user_id}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--nc-stone)',
                fontSize: 14,
              }}
            >
              Selecciona una conversación para empezar
            </div>
          )}
        </div>
      </div>
    </>
  );
}
