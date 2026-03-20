import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function UserAvatar({ name, image, className }: UserAvatarProps) {
  const initials = name ? getInitials(name) : '?';

  return (
    <Avatar className={className}>
      {image && <AvatarImage src={image} alt={name || 'User avatar'} />}
      <AvatarFallback className="bg-muted text-xs font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
