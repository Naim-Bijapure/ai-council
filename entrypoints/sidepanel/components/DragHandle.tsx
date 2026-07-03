interface DragHandleProps {
  disabled: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

/**
 * Renders a grip/hamburger icon using CSS (three horizontal lines)
 * and serves as the drag source element.
 */
export function DragHandle({
  disabled,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: DragHandleProps) {
  return (
    <div
      className={`drag-handle ${disabled ? "disabled" : ""}`}
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      role="button"
      aria-label="Drag to reorder"
      tabIndex={disabled ? -1 : 0}
    >
      <span className="drag-handle-line" />
      <span className="drag-handle-line" />
      <span className="drag-handle-line" />
    </div>
  );
}
