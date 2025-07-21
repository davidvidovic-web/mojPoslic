'use client';

import React from 'react';
import { format } from 'date-fns';
import { bs, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Message, MessageAttachment } from '@/types/messaging';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, File, ImageIcon, Video, Music, Archive } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  locale?: 'bs' | 'en';
  onAttachmentClick?: (attachment: MessageAttachment) => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return ImageIcon;
  if (fileType.startsWith('video/')) return Video;
  if (fileType.startsWith('audio/')) return Music;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return Archive;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  locale = 'bs',
  onAttachmentClick,
}) => {
  const dateLocale = locale === 'bs' ? bs : enUS;
  
  const formatTimestamp = (date: string | Date) => {
    const now = new Date();
    
    // Add error handling for invalid dates
    let messageDate: Date;
    try {
      messageDate = new Date(date);
      
      // Check if the date is invalid
      if (isNaN(messageDate.getTime())) {
        console.warn('Invalid date received:', date);
        return 'Invalid date';
      }
    } catch (error) {
      console.error('Error parsing date:', date, error);
      return 'Invalid date';
    }
    
    // If today, show only time
    if (messageDate.toDateString() === now.toDateString()) {
      return format(messageDate, 'HH:mm', { locale: dateLocale });
    }
    
    // If this week, show day and time
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (messageDate > weekAgo) {
      return format(messageDate, 'EEE HH:mm', { locale: dateLocale });
    }
    
    // Otherwise show date and time
    return format(messageDate, 'dd.MM.yyyy HH:mm', { locale: dateLocale });
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (message.status) {
      case 'sending':
        return <div className="w-2 h-2 bg-muted-foreground dark:bg-muted-foreground rounded-full animate-pulse" />;
      case 'sent':
        return <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />;
      case 'delivered':
        return <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full" />;
      case 'read':
        return <div className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full" />;
      case 'failed':
        return <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full" />;
      default:
        return null;
    }
  };

  const renderAttachment = (attachment: MessageAttachment) => {
    const IconComponent = getFileIcon(attachment.file_type);
    
    if (attachment.file_type.startsWith('image/')) {
      return (
        <div
          key={attachment.id}
          className="relative max-w-xs cursor-pointer rounded-lg overflow-hidden"
          onClick={() => onAttachmentClick?.(attachment)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.file_url}
            alt={attachment.file_name}
            className="w-full h-auto max-h-64 object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 dark:bg-black/70 text-white dark:text-white text-xs p-2">
            {attachment.file_name}
          </div>
        </div>
      );
    }
    
    return (
      <div
        key={attachment.id}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent dark:hover:bg-accent",
          isOwn ? "bg-background dark:bg-background" : "bg-muted dark:bg-muted"
        )}
        onClick={() => onAttachmentClick?.(attachment)}
      >
        <IconComponent className="w-8 h-8 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attachment.file_name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(attachment.file_size)}
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <Download className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className={cn("flex gap-3 max-w-[80%]", isOwn ? "ml-auto flex-row-reverse" : "mr-auto")}>
      {showAvatar && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          {message.sender?.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={message.sender.avatarUrl} alt={message.sender.name} />
          ) : (
            <div className="w-full h-full bg-muted dark:bg-muted flex items-center justify-center text-muted-foreground dark:text-muted-foreground text-sm">
              {message.sender?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </Avatar>
      )}
      
      <div className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        {message.replyTo && (
          <div className={cn(
            "text-xs text-muted-foreground dark:text-muted-foreground p-2 border-l-2 bg-muted dark:bg-muted rounded max-w-xs",
            isOwn ? "border-l-blue-500" : "border-l-gray-300"
          )}>
            <p className="font-medium">
              {message.replyTo.sender?.name || 'Unknown'}
            </p>
            <p className="truncate">
              {message.replyTo.content || 'Attachment'}
            </p>
          </div>
        )}
        
        <div
          className={cn(
            "rounded-lg px-3 py-2 max-w-xs break-words",
            isOwn
              ? "bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground"
              : "bg-muted dark:bg-muted text-foreground dark:text-foreground"
          )}
        >
          {message.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className={cn("space-y-2", message.content ? "mt-2" : "")}>
              {message.attachments.map(renderAttachment)}
            </div>
          )}
          
          {message.editedAt && (
            <Badge variant="secondary" className="text-xs mt-1">
              {locale === 'bs' ? 'uređeno' : 'edited'}
            </Badge>
          )}
        </div>
        
        {showTimestamp && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.createdAt)}
            </span>
            {getStatusIcon()}
          </div>
        )}
      </div>
    </div>
  );
};
