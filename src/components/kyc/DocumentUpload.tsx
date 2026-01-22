import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, Check, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DocumentUploadProps {
  label: string;
  onUpload: (url: string) => void;
  uploadedUrl: string | null;
  isSelfie?: boolean;
}

export function DocumentUpload({ 
  label,
  onUpload,
  uploadedUrl,
  isSelfie = false
}: DocumentUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get the URL (private bucket, so we use the path)
      const url = data.path;
      onUpload(url);
      toast.success('Document uploaded successfully');
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast.error((error as Error).message || 'Failed to upload document');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploaded = !!uploadedUrl;
  const displayPreview = preview || (isUploaded ? `Uploaded: ${uploadedUrl}` : null);

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={isSelfie ? 'user' : undefined}
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {displayPreview && preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/20 aspect-[4/3]">
              <img
                src={preview}
                alt={`${label} preview`}
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                </div>
              )}
              {isUploaded && !uploading && (
                <div className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            
            {!uploading && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-3 left-3"
                onClick={clearUpload}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </motion.div>
        ) : isUploaded ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full aspect-[4/3] rounded-xl border-2 border-green-500/50 bg-green-500/5 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-center">
              <p className="font-medium text-green-600">{label} Uploaded</p>
              <p className="text-sm text-muted-foreground">
                Click below to replace
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {isSelfie ? (
                  <Camera className="h-8 w-8 text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {isSelfie ? 'Take Photo' : `Upload ${label}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Click to {isSelfie ? 'use camera' : 'browse files'}
                </p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-foreground">Tips for a successful upload:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          {isSelfie ? (
            <>
              <li>• Ensure good lighting on your face</li>
              <li>• Remove glasses and hats</li>
              <li>• Look directly at the camera</li>
              <li>• Keep a neutral expression</li>
            </>
          ) : (
            <>
              <li>• Place document on a dark, flat surface</li>
              <li>• Ensure all corners are visible</li>
              <li>• Make sure text is clearly readable</li>
              <li>• Avoid glare or shadows</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
