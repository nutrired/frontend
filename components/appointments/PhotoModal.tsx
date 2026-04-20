'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import type { AppointmentPhoto } from '@/lib/types';

interface PhotoModalProps {
  photo: AppointmentPhoto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoModal({ photo, isOpen, onClose }: PhotoModalProps) {
  if (!photo) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.photo_url;
    link.download = `appointment-photo-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Appointment Photo</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <img
            src={photo.photo_url}
            alt="Appointment photo"
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
          />
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            Uploaded by {photo.uploaded_by} on{' '}
            {new Date(photo.uploaded_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
