import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'wouter';
import { Progress } from './ui/progress';
import { GripVertical } from 'lucide-react';

interface CategoryData {
  name: string;
  icon: string;
  score: number;
  signals: number;
  color: string;
}

interface SortableCategoryProps {
  category: CategoryData;
  isDragging?: boolean;
}

export function SortableCategory({ category, isDragging }: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    if (score < 75) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Link href={`/category/${category.name.toLowerCase()}`}>
        <div className="cursor-pointer hover:bg-zinc-800/50 p-4 rounded-lg transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <GripVertical className="w-5 h-5 text-zinc-500" />
              </div>
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-zinc-500">{category.signals} signals tracked</p>
              </div>
            </div>
            <div className={`text-3xl font-bold ${getRiskColor(category.score)}`}>
              {category.score}
            </div>
          </div>
          <Progress value={category.score} className="h-2 bg-zinc-800" />
        </div>
      </Link>
    </div>
  );
}
