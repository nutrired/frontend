'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadAppointmentPhoto, deleteAppointmentPhoto } from '@/lib/appointment-notes';
import { toast } from 'sonner';
import { Upload, Trash2, Camera } from 'lucide-react';
import type { AppointmentPhoto } from '@/lib/types';
import { PhotoModal } from './PhotoModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AppointmentPhotosSectionProps {
  appointmentId: string;
  photos: AppointmentPhoto[];
  currentUserRole: 'client' | 'nutritionist';
  currentUserId: string;
  onUpdate?: () => void;
}

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function AppointmentPhotosSection({
  appointmentId,
  photos,
  currentUserRole,
  currentUserId,
  onUpdate,
}: AppointmentPhotosSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<AppointmentPhoto | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<AppointmentPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getThumbnailUrl = (photoUrl: string) => {
    return photoUrl.replace('-original.jpg', '-thumb.jpg');
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const canDeletePhoto = (photo: AppointmentPhoto) => {
    // Nutritionist can delete any photo, users can only delete their own
    return currentUserRole === 'nutritionist' || photo.uploaded_by === currentUserRole;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error('Please select a JPEG, PNG, or GIF image');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large (max 5MB)');
      return;
    }

    // Check photo count
    if (photos.length >= MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos per appointment`);
      return;
    }

    setIsUploading(true);
    try {
      await uploadAppointmentPhoto(appointmentId, file);
      toast.success('Photo uploaded successfully');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to upload photo:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photo: AppointmentPhoto) => {
    try {
      await deleteAppointmentPhoto(appointmentId, photo.id);
      toast.success('Photo deleted successfully');
      setPhotoToDelete(null);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast.error('Failed to delete photo. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photos
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {photos.length} / {MAX_PHOTOS} photos
          </span>
          {photos.length < MAX_PHOTOS && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Add Photo'}
              </Button>
            </>
          )}
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No photos uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden border bg-card cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square relative">
                <img
                  src={getThumbnailUrl(photo.photo_url)}
                  alt="Appointment photo"
                  className="w-full h-full object-cover"
                />
                {canDeletePhoto(photo) && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoToDelete(photo);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{getRelativeTime(photo.uploaded_at)}</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                    {photo.uploaded_by === currentUserRole ? 'You' : photo.uploaded_by}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PhotoModal
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />

      <AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => photoToDelete && handleDeletePhoto(photoToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
