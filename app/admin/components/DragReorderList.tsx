"use client";

import { useId, useRef, useState, useTransition, type ReactNode } from "react";

export type DragItem = { id: number; node: ReactNode };

type Props = {
  items: DragItem[];
  // Server action receiving FormData with `ids` (comma-joined ordered ids)
  // and any extra fields supplied via `extraFields` below.
  action: (formData: FormData) => Promise<void> | void;
  extraFields?: Record<string, string | number>;
  className?: string;
  itemClassName?: string;
  ariaLabel?: string;
};

export function DragReorderList({
  items,
  action,
  extraFields,
  className,
  itemClassName,
  ariaLabel,
}: Props) {
  const [order, setOrder] = useState<number[]>(() => items.map((it) => it.id));
  const [dragging, setDragging] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  // Re-derive in case parent re-renders with a new set.
  const itemMap = new Map(items.map((it) => [it.id, it.node]));

  function moveTo(srcId: number, dstId: number) {
    setOrder((prev) => {
      const next = prev.filter((x) => x !== srcId);
      const idx = next.indexOf(dstId);
      if (idx < 0) return prev;
      next.splice(idx, 0, srcId);
      return next;
    });
  }

  function commit(nextOrder: number[]) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("ids", nextOrder.join(","));
      if (extraFields) {
        for (const [k, v] of Object.entries(extraFields)) fd.set(k, String(v));
      }
      await action(fd);
    });
  }

  function onRowDragOver(e: React.DragEvent, id: number) {
    if (dragging == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragging !== id) setOverId(id);
  }

  function onRowDrop(e: React.DragEvent, id: number) {
    e.preventDefault();
    const srcId = dragging ?? Number(e.dataTransfer.getData("text/plain"));
    setDragging(null);
    setOverId(null);
    if (!Number.isFinite(srcId) || srcId === id) return;
    moveTo(srcId, id);
    const newOrder = order.filter((x) => x !== srcId);
    const idx = newOrder.indexOf(id);
    newOrder.splice(idx, 0, srcId);
    commit(newOrder);
  }

  return (
    <ul className={className} aria-label={ariaLabel} role="list">
      <form ref={formRef} id={formId} hidden />
      {order.map((id) => {
        const node = itemMap.get(id);
        if (!node) return null;
        const isDragging = dragging === id;
        const isOver = overId === id && dragging !== null && dragging !== id;
        return (
          <li
            key={id}
            className={
              [itemClassName, isDragging ? "drag-source" : "", isOver ? "drag-over" : ""]
                .filter(Boolean)
                .join(" ") || undefined
            }
            onDragOver={(e) => onRowDragOver(e, id)}
            onDragLeave={() => {
              setOverId((prev) => (prev === id ? null : prev));
            }}
            onDrop={(e) => onRowDrop(e, id)}
          >
            <span
              className="drag-handle"
              role="button"
              aria-label="Drag to reorder"
              title="Drag to reorder"
              draggable
              onDragStart={(e) => {
                setDragging(id);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(id));
              }}
              onDragEnd={() => {
                setDragging(null);
                setOverId(null);
              }}
            >
              ⋮⋮
            </span>
            {node}
          </li>
        );
      })}
      {isPending ? <li className="drag-saving" aria-live="polite">Saving…</li> : null}
    </ul>
  );
}
