import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getNameInitials } from "@/lib/utils";

// Tailwind JIT needs literal class names — dynamic `size-${n}` won't be detected.
const SIZE_CLASSES: Record<number, string> = {
  6: "size-6",
  8: "size-8",
  10: "size-10",
  12: "size-12",
  16: "size-16",
  20: "size-20",
};

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
    <Avatar className={`${SIZE_CLASSES[size] ?? "size-8"} rounded-full`}>
      <AvatarImage src={imageUrl} alt={fullName} />
      <AvatarFallback>{getNameInitials(fullName)}</AvatarFallback>
    </Avatar>
  );
}
