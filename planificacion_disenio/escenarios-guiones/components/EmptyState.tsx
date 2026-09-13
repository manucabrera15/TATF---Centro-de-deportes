import { InboxIcon } from "./icons";

export function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="empty">
      <div className="empty__icon">
        <InboxIcon />
      </div>
      <div className="empty__title">{title}</div>
      <div className="empty__desc">{desc}</div>
    </div>
  );
}
