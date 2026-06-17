'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Cloud, ImageIcon, Loader2, RefreshCw, Upload, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

type CloudinaryWidgetResult = {
  event?: string;
  info?: {
    secure_url?: string;
    original_filename?: string;
    bytes?: number;
    format?: string;
    resource_type?: string;
    public_id?: string;
    width?: number;
    height?: number;
  } | string;
};

type CloudinaryWidgetError = { message?: string } | null;

type CloudinaryWidget = {
  open: () => void;
  destroy?: () => void;
};

type CloudinaryWidgetOptions = Record<string, unknown>;

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: CloudinaryWidgetOptions,
        callback: (error: CloudinaryWidgetError, result: CloudinaryWidgetResult) => void,
      ) => CloudinaryWidget;
    };
  }
}

interface CloudinaryUploadConfig {
  cloudName: string;
  apiKey: string;
  folder: string;
  maxImageSizeBytes: number;
  allowedFormats: string[];
}

interface CloudinaryUploadBoxProps {
  label?: string;
  value?: string;
  onUpload: (url: string, fileInfo: { name: string; size: number; type: string; publicId?: string }) => void;
  onRemove?: () => void;
  helperText?: string;
  className?: string;
  maxSizeMB?: number;
}

const CLOUDINARY_WIDGET_SRC = 'https://upload-widget.cloudinary.com/latest/global/all.js';

function isCloudinaryImageUrl(value: string, cloudName?: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    if (url.hostname !== 'res.cloudinary.com') return false;
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length < 4) return false;
    if (cloudName && segments[0] !== cloudName) return false;
    return segments[1] === 'image' && segments[2] === 'upload';
  } catch {
    return false;
  }
}

function formatMegabytes(bytes: number) {
  return `${Math.max(1, Math.round(bytes / (1024 * 1024)))}MB`;
}

async function loadCloudinaryWidgetScript() {
  if (typeof window === 'undefined') return;
  if (window.cloudinary?.createUploadWidget) return;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CLOUDINARY_WIDGET_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Cloudinary upload widget')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = CLOUDINARY_WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Cloudinary upload widget'));
    document.body.appendChild(script);
  });
}

export function CloudinaryUploadBox({
  label = 'Cloudinary Image Upload',
  value,
  onUpload,
  onRemove,
  helperText,
  className,
  maxSizeMB,
}: CloudinaryUploadBoxProps) {
  const [config, setConfig] = useState<CloudinaryUploadConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    fetch('/api/upload/config')
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Failed to load Cloudinary configuration');
        return data as CloudinaryUploadConfig;
      })
      .then((data) => {
        if (alive) setConfig(data);
      })
      .catch((err) => {
        if (alive) setError(err instanceof Error ? err.message : 'Failed to load Cloudinary configuration');
      })
      .finally(() => {
        if (alive) setLoadingConfig(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const effectiveMaxImageSizeBytes = useMemo(() => {
    const configured = config?.maxImageSizeBytes || 5 * 1024 * 1024;
    if (!maxSizeMB || !Number.isFinite(maxSizeMB) || maxSizeMB <= 0) return configured;
    return Math.min(configured, Math.floor(maxSizeMB * 1024 * 1024));
  }, [config, maxSizeMB]);

  const acceptedText = useMemo(() => {
    const formats = config?.allowedFormats?.length ? config.allowedFormats : ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    return formats.map((item) => item.toUpperCase()).join(', ');
  }, [config]);

  const openWidget = useCallback(async () => {
    setError('');

    if (!config) {
      setError('Cloudinary is not configured yet.');
      return;
    }

    setOpening(true);

    try {
      await loadCloudinaryWidgetScript();

      if (!window.cloudinary?.createUploadWidget) {
        throw new Error('Cloudinary upload widget did not load.');
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: config.cloudName,
          apiKey: config.apiKey,
          folder: config.folder,
          uploadSignatureTimestamp: timestamp,
          uploadSignature: async (callback: (signature: string) => void, paramsToSign: Record<string, unknown>) => {
            try {
              const response = await fetch('/api/upload/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paramsToSign: { ...paramsToSign, folder: config.folder, timestamp } }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok || !data.signature) {
                throw new Error(data.error || 'Cloudinary signature failed');
              }
              callback(data.signature);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Cloudinary signature failed');
            }
          },
          sources: ['local'],
          multiple: false,
          maxFiles: 1,
          resourceType: 'image',
          clientAllowedFormats: config.allowedFormats,
          maxFileSize: effectiveMaxImageSizeBytes,
          maxImageFileSize: effectiveMaxImageSizeBytes,
          showAdvancedOptions: false,
          cropping: false,
          styles: {
            palette: {
              window: '#ffffff',
              sourceBg: '#f8fafc',
              windowBorder: '#e5e7eb',
              tabIcon: '#2563eb',
              menuIcons: '#64748b',
              textDark: '#111827',
              textLight: '#ffffff',
              link: '#2563eb',
              action: '#2563eb',
              inactiveTabIcon: '#94a3b8',
              error: '#dc2626',
              inProgress: '#2563eb',
              complete: '#16a34a',
              progressBar: '#2563eb',
            },
          },
        },
        (uploadError, result) => {
          if (uploadError) {
            setError(uploadError.message || 'Cloudinary upload failed');
            setOpening(false);
            return;
          }

          if (result.event === 'success' && result.info && typeof result.info !== 'string') {
            const info = result.info;
            const url = info.secure_url || '';

            if (!url || !isCloudinaryImageUrl(url, config.cloudName)) {
              setError('Upload rejected. Campaign images must use a Cloudinary image/upload URL from the configured cloud.');
              setOpening(false);
              return;
            }

            onUpload(url, {
              name: info.original_filename || info.public_id || 'campaign-image',
              size: info.bytes || 0,
              type: `image/${info.format || 'unknown'}`,
              publicId: info.public_id,
            });
            setOpening(false);
          }

          if (['close', 'abort'].includes(result.event || '')) {
            setOpening(false);
          }
        },
      );

      widget.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cloudinary upload failed');
      setOpening(false);
    }
  }, [config, effectiveMaxImageSizeBytes, onUpload]);

  const hasValidCloudinaryImage = Boolean(value && isCloudinaryImageUrl(value, config?.cloudName));

  return (
    <div className={cn('w-full', className)}>
      {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}

      {value && hasValidCloudinaryImage ? (
        <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border bg-white">
              <img src={value} alt="Uploaded Cloudinary campaign creative" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium text-green-800">
                <CheckCircle className="h-4 w-4" /> Cloudinary image selected
              </p>
              <p className="mt-1 truncate text-xs text-green-700">{value}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={openWidget} disabled={opening || loadingConfig}>
                <RefreshCw className="mr-2 h-4 w-4" /> Replace
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openWidget}
          disabled={opening || loadingConfig || !config}
          className={cn(
            'w-full rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            opening || loadingConfig ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-70' : 'cursor-pointer border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100',
          )}
        >
          <div className="flex flex-col items-center gap-3">
            {opening || loadingConfig ? (
              <Loader2 className="h-9 w-9 animate-spin text-blue-500" />
            ) : (
              <Cloud className="h-9 w-9 text-blue-500" />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {loadingConfig ? 'Loading Cloudinary upload box...' : opening ? 'Opening Cloudinary upload box...' : 'Open Cloudinary Upload Box'}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Strict Cloudinary image path only: {acceptedText} up to {formatMegabytes(effectiveMaxImageSizeBytes)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
              <ImageIcon className="h-4 w-4" /> Stored as res.cloudinary.com/{config?.cloudName || 'your-cloud'}/image/upload/...
            </div>
            <Upload className="h-5 w-5 text-blue-400" />
          </div>
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}
