// frontend/app/dashboard/messages/components/ConversationsList.tsx
'use client';

import { useConversations } from '@/lib/chat';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationsListProps {
  activeRelationshipId: string | null;
  onSelectConversation: (relationshipId: string) => void;
}

export function ConversationsList({
  activeRelationshipId,
  onSelectConversation,
}: ConversationsListProps) {
  const { conversations, isLoading } = useConversations();

  if (isLoading) {
    return <div style={{ padding: 20, color: 'var(--nc-stone)' }}>Cargando...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div style={{ padding: 20, color: 'var(--nc-stone)', fontSize: 13 }}>
        No tienes conversaciones aún
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {conversations.map((conv) => {
        const isActive = conv.relationship_id === activeRelationshipId;

        return (
          <div
            key={conv.relationship_id}
            onClick={() => onSelectConversation(conv.relationship_id)}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--nc-border)',
              cursor: 'pointer',
              background: isActive ? 'var(--nc-forest-pale)' : 'white',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(139,115,85,0.03)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'white';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              {conv.other_avatar_url ? (
                <img
                  src={conv.other_avatar_url}
                  alt={conv.other_user_name}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
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
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {conv.other_user_name.charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--nc-ink)',
                    marginBottom: 2,
                  }}
                >
                  {conv.other_user_name}
                  {conv.unread_count > 0 && (
                    <span
                      style={{
                        marginLeft: 8,
                        background: 'var(--nc-terra)',
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 10,
                      }}
                    >
                      {conv.unread_count}
                    </span>
                  )}
                </div>

                {conv.last_message_text && (
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--nc-stone)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {conv.last_message_text}
                  </div>
                )}
              </div>

              {conv.last_message_at && (
                <div style={{ fontSize: 11, color: 'var(--nc-stone)' }}>
                  {formatDistanceToNow(new Date(conv.last_message_at), {
                    addSuffix: false,
                    locale: es,
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
