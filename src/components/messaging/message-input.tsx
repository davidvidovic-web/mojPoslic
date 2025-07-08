'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Smile, 
  X, 
  FileText, 
  ImageIcon,
  Video,
  Music
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  locale?: 'bs' | 'en';
  className?: string;
}

interface AttachmentPreview {
  file: File;
  id: string;
  preview?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return ImageIcon;
  if (fileType.startsWith('video/')) return Video;
  if (fileType.startsWith('audio/')) return Music;
  return FileText;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder,
  locale = 'bs',
  className,
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const translations = {
    bs: {
      placeholder: placeholder || 'Ukucajte poruku...',
      send: 'Pošalji',
      attach: 'Priloži fajl',
      emoji: 'Emoji',
      removeAttachment: 'Ukloni prilog',
      fileTooLarge: 'Fajl je prevelik (maksimalno 10MB)',
      invalidFileType: 'Nepodržan tip fajla',
    },
    en: {
      placeholder: placeholder || 'Type a message...',
      send: 'Send',
      attach: 'Attach file',
      emoji: 'Emoji',
      removeAttachment: 'Remove attachment',
      fileTooLarge: 'File too large (max 10MB)',
      invalidFileType: 'Unsupported file type',
    },
  };

  const t = translations[locale];

  const handleTyping = useCallback((value: string) => {
    setMessage(value);
    
    if (!onTyping) return;

    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  }, [onTyping, isTyping]);

  const handleSend = () => {
    if (disabled || (!message.trim() && attachments.length === 0)) return;

    const files = attachments.map(a => a.file);
    onSendMessage(message.trim(), files.length > 0 ? files : undefined);
    
    setMessage('');
    setAttachments([]);
    setIsTyping(false);
    
    if (onTyping) {
      onTyping(false);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newAttachments: AttachmentPreview[] = [];

    acceptedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(t.fileTooLarge);
        return;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(t.invalidFileType);
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const attachment: AttachmentPreview = {
        file,
        id,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string;
          setAttachments(prev => 
            prev.map(a => a.id === id ? attachment : a)
          );
        };
        reader.readAsDataURL(file);
      }

      newAttachments.push(attachment);
    });

    setAttachments(prev => [...prev, ...newAttachments]);
  }, [t.fileTooLarge, t.invalidFileType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onDrop(files);
    e.target.value = ''; // Reset input
  };

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className={cn("border-t bg-background dark:bg-background", className)} {...getRootProps()}>
      <input {...getInputProps()} />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 flex items-center justify-center z-10 border-2 border-dashed border-primary/50 dark:border-primary/60">
          <div className="text-center">
            <Paperclip className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-700 font-medium">
              {locale === 'bs' ? 'Pustite fajlove ovde' : 'Drop files here'}
            </p>
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="p-3 border-b bg-muted dark:bg-muted">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => {
              const IconComponent = getFileIcon(attachment.file.type);
              
              return (
                <div
                  key={attachment.id}
                  className="relative flex items-center gap-2 bg-background dark:bg-background rounded-lg p-2 border max-w-xs"
                >
                  {attachment.preview ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={attachment.preview}
                      alt={attachment.file.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <IconComponent className="w-8 h-8 text-gray-500" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.file.size)}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(attachment.id)}
                    className="p-1 h-auto w-auto"
                    title={t.removeAttachment}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-3">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={openFileDialog}
            disabled={disabled}
            title={t.attach}
            className="p-2"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            title={t.emoji}
            className="p-2"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            disabled={disabled}
            className="min-h-[40px] max-h-32 resize-none"
            rows={1}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          size="sm"
          className="p-2"
          title={t.send}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
