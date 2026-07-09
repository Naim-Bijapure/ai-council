import type { SupportedAppWithRoles } from "@/utils/appRegistry";
import type { AppKey, RedTeamRole } from "@/utils/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DragHandle } from "./DragHandle";
import { OrderBadge } from "./OrderBadge";

const RED_TEAM_ROLE_OPTIONS: { value: RedTeamRole; label: string }[] = [
  { value: "author", label: "Author" },
  { value: "attacker", label: "Attacker" },
  { value: "defender", label: "Defender" }
];

interface DragHandleProps {
  disabled: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

interface AgentItemProps {
  agent: SupportedAppWithRoles;
  isSelected: boolean;
  orderIndex: number | null;
  roleLabel?: string | null;
  isJudge: boolean;
  isDragged: boolean;
  isDropTarget: boolean;
  dragHandleProps: DragHandleProps;
  redTeamMode?: boolean;
  redTeamRole?: RedTeamRole | null;
  onRedTeamRoleChange?: (key: AppKey, role: RedTeamRole) => void;
  onToggle: () => void;
}

/**
 * Renders a single agent row with checkbox, drag handle, and order badge.
 */
export function AgentItem({
  agent,
  isSelected,
  orderIndex,
  roleLabel,
  isJudge,
  isDragged,
  isDropTarget,
  dragHandleProps,
  redTeamMode = false,
  redTeamRole = null,
  onRedTeamRoleChange,
  onToggle
}: AgentItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-border bg-secondary px-3 py-2 transition-colors",
        isSelected && "bg-accent border-primary/40",
        isDragged && "opacity-50 shadow-md",
        isDropTarget && "border-primary ring-2 ring-primary/20"
      )}
    >
      <label className="flex flex-1 items-center gap-2.5 cursor-pointer">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          disabled={isJudge}
        />
        <span className="text-sm text-foreground">
          {agent.displayName}
          {isJudge ? " (Judge)" : ""}
        </span>
      </label>

      {isSelected && orderIndex !== null ? (
        <div className="flex items-center gap-1.5">
          {redTeamMode ? (
            <select
              value={redTeamRole ?? "attacker"}
              onChange={(e) => onRedTeamRoleChange?.(agent.key, e.target.value as RedTeamRole)}
              onClick={(e) => e.stopPropagation()}
              className="h-7 rounded-md border border-border bg-background px-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label={`Role for ${agent.displayName}`}
            >
              {RED_TEAM_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : roleLabel ? (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              {roleLabel}
            </Badge>
          ) : null}
          <OrderBadge index={orderIndex} />
        </div>
      ) : null}

      <DragHandle {...dragHandleProps} />
    </div>
  );
}
