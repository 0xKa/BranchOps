import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNameInitials } from "@/lib/utils";

interface ProfilePictureProps {
  size?: number;
  imageUrl?: string;
  fullName: string;
}

export default function ProfilePicture({
  size = 8,
  imageUrl,
  fullName,
}: ProfilePictureProps) {
  return (
    <Avatar className={`size-${size} rounded-full`}>
      <AvatarImage src={imageUrl} alt={fullName} />
      <AvatarFallback>{getNameInitials(fullName)}</AvatarFallback>
    </Avatar>
  );
}
