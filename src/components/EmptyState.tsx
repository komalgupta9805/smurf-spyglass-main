import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action, children }: EmptyStateProps) => {
  return (
    <Card className="p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed bg-muted/20">
      <div className="rounded-full bg-primary/10 p-4">
        <Icon size={32} className="text-primary" />
      </div>

      <div className="space-y-2 max-w-sm">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}

      {children}
    </Card>
  );
};

export default EmptyState;
