import {
  Instagram,
  Megaphone,
  MonitorSmartphone,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Search,
  Target,
  Megaphone,
  MonitorSmartphone,
  RefreshCw,
  Instagram,
  Sparkles,
};

interface ServiceIconProps {
  name: string;
  className?: string;
}

export function ServiceIcon({ name, className = "size-6" }: ServiceIconProps) {
  const Icon = icons[name] ?? Search;
  return <Icon aria-hidden="true" className={className} strokeWidth={1.75} />;
}
