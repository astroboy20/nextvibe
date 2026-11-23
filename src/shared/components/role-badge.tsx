import { Badge } from "@/components/ui/badge";
import { Crown, Shield, User } from "lucide-react";
import { EventRole } from "@/features/events/types";

const roleConfig = {
  OWNER: {
    label: "Owner",
    icon: Crown,
    className: "text-amber-600 bg-amber-50 border-amber-200",
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    icon: Shield,
    className: "text-purple-600 bg-purple-50 border-purple-200",
  },
  CO_ORGANIZER: {
    label: "Co-Organizer",
    icon: User,
    className: "text-blue-600 bg-blue-50 border-blue-200",
  },
};

interface RoleBadgeProps {
  role: EventRole;
  size?: "sm" | "md";
}

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${size === "sm" ? "text-[10px] h-5" : "text-xs h-6"}`}
    >
      <Icon className={`${size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} mr-1`} />
      {config.label}
    </Badge>
  );
}
