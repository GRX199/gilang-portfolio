import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Braces,
  Code2,
  Coffee,
  Database,
  Gauge,
  GitBranch,
  GitPullRequest,
  Globe2,
  GraduationCap,
  Hotel,
  LayoutDashboard,
  Mail,
  MonitorSmartphone,
  Palette,
  PenTool,
  Rocket,
  Send,
  Server,
  ShoppingBag,
  Sparkles,
  Terminal,
  Workflow,
} from "lucide-react";

export const iconMap = {
  Bot,
  Braces,
  Code2,
  Coffee,
  Database,
  Gauge,
  GitBranch,
  GitPullRequest,
  Globe2,
  GraduationCap,
  Hotel,
  LayoutDashboard,
  Mail,
  MonitorSmartphone,
  Palette,
  PenTool,
  Rocket,
  Send,
  Server,
  ShoppingBag,
  Sparkles,
  Terminal,
  Workflow,
} satisfies Record<string, LucideIcon>;

export const iconOptions = Object.keys(iconMap);

export function getIcon(name: string | undefined): LucideIcon {
  if (name && name in iconMap) {
    return iconMap[name as keyof typeof iconMap];
  }

  return Code2;
}
