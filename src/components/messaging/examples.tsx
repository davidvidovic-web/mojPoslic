/**
 * Example components showing how to integrate messaging with other parts of the app
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useMessagingUtils, createMessageUserLink } from '@/lib/messaging/messaging-utils';

interface MessageUserButtonProps {
  userId: string;
  userName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  locale?: 'bs' | 'en';
  className?: string;
}

/**
 * Button component to start a conversation with a user
 * Can be used in job listings, user profiles, etc.
 */
export const MessageUserButton: React.FC<MessageUserButtonProps> = ({
  userId,
  userName,
  variant = 'outline',
  size = 'sm',
  locale = 'bs',
  className,
}) => {
  const { startConversationWith } = useMessagingUtils();

  const handleClick = () => {
    startConversationWith(userId, userName);
  };

  const buttonText = locale === 'bs' ? 'Poruka' : 'Message';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {buttonText}
    </Button>
  );
};

interface MessageUserLinkProps {
  userId: string;
  userName?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Link component to start a conversation with a user
 * Useful for wrapping user names, avatars, etc.
 */
export const MessageUserLink: React.FC<MessageUserLinkProps> = ({
  userId,
  userName,
  children,
  className,
}) => {
  const href = createMessageUserLink(userId, userName);

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        window.location.href = href;
      }}
    >
      {children}
    </a>
  );
};

interface JobApplicantCardProps {
  applicant: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  locale?: 'bs' | 'en';
}

/**
 * Example component showing messaging integration in a job applicant card
 */
export const JobApplicantCard: React.FC<JobApplicantCardProps> = ({
  applicant,
  locale = 'bs',
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          {applicant.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={applicant.avatar} alt={applicant.name} className="w-full h-full rounded-full" />
          ) : (
            <span className="text-lg font-medium">
              {applicant.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-medium">{applicant.name}</h3>
          <p className="text-sm text-gray-600">{applicant.email}</p>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          {locale === 'bs' ? 'Prikaži profil' : 'View Profile'}
        </Button>
        <MessageUserButton
          userId={applicant.id}
          userName={applicant.name}
          locale={locale}
        />
      </div>
    </div>
  );
};

interface UserProfileHeaderProps {
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  currentUserId: string;
  locale?: 'bs' | 'en';
}

/**
 * Example component showing messaging integration in a user profile header
 */
export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  currentUserId,
  locale = 'bs',
}) => {
  const isOwnProfile = user.id === currentUserId;

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            {user.avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
            ) : (
              <span className="text-xl font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600 capitalize">{user.role}</p>
          </div>
        </div>
        
        {!isOwnProfile && (
          <div className="flex gap-2">
            <MessageUserButton
              userId={user.id}
              userName={user.name}
              locale={locale}
              size="default"
            />
            <Button variant="outline">
              {locale === 'bs' ? 'Dodaj u favourite' : 'Add to Favorites'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
