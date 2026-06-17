'use client';

import { CloudinaryUploadBox } from './cloudinary-upload-box';

interface FileUploadProps {
  label?: string;
  accept?: 'image';
  value?: string;
  onUpload: (url: string, fileInfo: { name: string; size: number; type: string }) => void;
  onRemove?: () => void;
  helperText?: string;
  className?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  label,
  value,
  onUpload,
  onRemove,
  helperText,
  className,
  maxSizeMB,
}: FileUploadProps) {
  return (
    <CloudinaryUploadBox
      label={label}
      value={value}
      onUpload={onUpload}
      onRemove={onRemove}
      helperText={helperText || 'Images are uploaded through the Cloudinary Upload Widget only.'}
      className={className}
      maxSizeMB={maxSizeMB}
    />
  );
}
