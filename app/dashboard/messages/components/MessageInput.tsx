// frontend/app/dashboard/messages/components/MessageInput.tsx
'use client';

import { useState, useRef } from 'react';
import { uploadChatAttachment } from '@/lib/chat';
import type { UploadAttachmentResponse } from '@/lib/types';
import { Paperclip, Send } from 'lucide-react';

interface MessageInputProps {
  relationshipId: string;
  onSendMessage: (text?: string, attachment?: UploadAttachmentResponse) => void;
  disabled?: boolean;
}

export function MessageInput({ relationshipId, onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<UploadAttachmentResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const uploaded = await uploadChatAttachment(relationshipId, file);
      setAttachment(uploaded);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim() && !attachment) return;

    onSendMessage(message.trim() || undefined, attachment || undefined);
    setMessage('');
    setAttachment(null);
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        borderTop: '1px solid var(--nc-border)',
        padding: 16,
        background: 'white',
        flexShrink: 0,
      }}
    >
      {error && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--nc-terra)',
            marginBottom: 8,
            padding: '6px 10px',
            background: 'rgba(196,98,45,0.08)',
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      {attachment && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
            padding: '8px 12px',
            background: 'var(--nc-forest-pale)',
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <span>📎 {attachment.filename}</span>
          <button
            onClick={() => setAttachment(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--nc-terra)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Remove
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          disabled={disabled || uploading}
          rows={1}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid var(--nc-border)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: 'inherit',
            resize: 'none',
            minHeight: 40,
            maxHeight: 120,
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          style={{
            padding: 10,
            background: 'white',
            border: '1px solid var(--nc-border)',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Attach file"
        >
          <Paperclip size={18} color="var(--nc-stone)" />
        </button>

        <button
          onClick={handleSend}
          disabled={disabled || uploading || (!message.trim() && !attachment)}
          style={{
            padding: 10,
            background: 'var(--nc-forest)',
            border: 'none',
            borderRadius: 8,
            cursor: disabled || uploading || (!message.trim() && !attachment) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled || uploading || (!message.trim() && !attachment) ? 0.5 : 1,
          }}
          title="Send message"
        >
          <Send size={18} color="white" />
        </button>
      </div>

      <div style={{ fontSize: 11, color: 'var(--nc-stone)', marginTop: 8 }}>
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
