import { Souvenir } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Rating } from "./ui/rating";

interface SouvenirCardProps {
  souvenir: Souvenir & { userName?: string };
  className?: string;
}

export function SouvenirCard({ souvenir, className }: SouvenirCardProps) {
  const timeAgo = formatDistanceToNow(new Date(souvenir.timestamp), { addSuffix: true });
  
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden ${className}`}>
      <div className="relative aspect-video">
        <img
          src={souvenir.photoUrl}
          alt="Travel memory"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Rating value={souvenir.rating} onChange={() => {}} readOnly size="sm" />
          <span className="text-sm text-muted-foreground">{timeAgo}</span>
        </div>
        {souvenir.userName && (
          <h4 className="font-medium mb-1">Stay with {souvenir.userName}</h4>
        )}
        <p className="text-sm text-muted-foreground">{souvenir.reviewText}</p>
      </div>
    </div>
  );
}