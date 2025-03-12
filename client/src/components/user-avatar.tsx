import { User } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1630910561339-4e22c7150093",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  "https://images.unsplash.com/photo-1646617747609-45b466ace9a6",
  "https://images.unsplash.com/photo-1628891435222-065925dcb365",
  "https://images.unsplash.com/photo-1507499036636-f716246c2c23",
  "https://images.unsplash.com/photo-1601388352547-2802c6f32eb8",
  "https://images.unsplash.com/photo-1581291518570-03a26006fb21",
  "https://images.unsplash.com/photo-1633466154054-399bf16156a2",
];

export default function UserAvatar({
  user,
  className,
}: {
  user: User;
  className?: string;
}) {
  const avatarUrl =
    user.avatarUrl ||
    DEFAULT_AVATARS[parseInt(user.id.toString(), 10) % DEFAULT_AVATARS.length];

  return (
    <Avatar className={cn("h-8 w-8", className)}>
      <AvatarImage src={avatarUrl} alt={user.displayName || user.username} />
      <AvatarFallback>
        {(user.displayName || user.username).charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
