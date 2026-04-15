import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContentCardProps {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  link: string;
  badge?: string;
  meta?: string;
  vintage?: boolean;
}

const ContentCard = ({ title, description, imageUrl, link, badge, meta, vintage }: ContentCardProps) => (
  <Link to={link}>
    <Card className={`group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${vintage ? "border-gold-light bg-gradient-to-b from-card to-gold-light/20" : ""}`}>
      {imageUrl && (
        <div className="aspect-[3/2] overflow-hidden bg-muted">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      {!imageUrl && (
        <div className={`aspect-[3/2] flex items-center justify-center text-4xl ${vintage ? "bg-gold-light/30" : "bg-muted"}`}>
          {vintage ? "📜" : "📖"}
        </div>
      )}
      <CardContent className="p-4">
        {badge && <Badge variant="secondary" className="mb-2 text-xs">{badge}</Badge>}
        <h3 className="font-serif font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>}
        {meta && <p className="text-xs text-muted-foreground mt-2">{meta}</p>}
      </CardContent>
    </Card>
  </Link>
);

export default ContentCard;
