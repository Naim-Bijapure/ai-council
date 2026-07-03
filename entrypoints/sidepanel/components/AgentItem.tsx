import type { SupportedAppWithRoles } from "@/utils/appRegistry";
import type { AppKey } from "@/utils/types";
import { DragHandle } from "./DragHandle";
import { OrderBadge } from "./OrderBadge";

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
  isJudge: boolean;
  isDragged: boolean;
  isDropTarget: boolean;
  dragHandleProps: DragHandleProps;
  onToggle: () => void;
}

/**
 * Renders a single agent row with checkbox, drag handle, and order badge.
 */
export function AgentItem({
  agent,
  isSelected,
  orderIndex,
  isJudge,
  isDragged,
  isDropTarget,
  dragHandleProps,
  onToggle
}: AgentItemProps) {
  const itemClassName = [
    "agent-item",
    isJudge ? "is-judge" : "",
    isSelected ? "is-selected" : "",
    isDragged ? "is-dragged" : "",
    isDropTarget ? "is-drop-target" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={itemClassName}>
      <label className="agent-checkbox-row">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          disabled={isJudge}
        />
        <span className="agent-name">
          {agent.displayName}
          {isJudge ? " (Judge)" : ""}
        </span>
      </label>

      {isSelected && orderIndex !== null && (
        <OrderBadge index={orderIndex} />
      )}

      <DragHandle {...dragHandleProps} />
    </div>
  );
}
