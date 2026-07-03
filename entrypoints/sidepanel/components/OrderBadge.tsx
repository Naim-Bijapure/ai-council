interface OrderBadgeProps {
  index: number; // 1-based position
}

/**
 * Displays a numbered badge indicating the agent's position in the order.
 * Renders a small circular badge with the position number centered.
 */
export function OrderBadge({ index }: OrderBadgeProps) {
  return (
    <span className="order-badge" aria-label={`Position ${index}`}>
      {index}
    </span>
  );
}
