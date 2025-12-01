import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface POIFilterBarProps {
  categories: string[];
  activeCategories: Set<string>;
  onToggleCategory: (category: string) => void;
}

const categoryIcons: Record<string, string> = {
  cultural: "🏛️",
  historic: "⛪",
  nature: "🌿",
  architecture: "🏗️",
  entertainment: "🎭",
  other: "📍"
};

const categoryLabels: Record<string, string> = {
  cultural: "Cultural",
  historic: "Historic",
  nature: "Nature",
  architecture: "Architecture",
  entertainment: "Entertainment",
  other: "Other"
};

export const POIFilterBar = ({ categories, activeCategories, onToggleCategory }: POIFilterBarProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((category) => {
        const isActive = activeCategories.has(category);
        return (
          <Button
            key={category}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleCategory(category)}
            className="gap-2"
          >
            <span>{categoryIcons[category] || "📍"}</span>
            <span>{categoryLabels[category] || category}</span>
            {isActive && <Badge variant="secondary" className="ml-1 px-1.5 py-0">✓</Badge>}
          </Button>
        );
      })}
    </div>
  );
};
