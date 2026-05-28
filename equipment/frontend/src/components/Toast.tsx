"use client";

import { useEffect, useState, useCallback } from "react";

type ToastState = { id: number; message: string } | null;

let listeners: ((msg: string) => void)[] = [];

export function toast(message: string) {
  listeners.forEach((fn) => fn(message));
}

export function ToastContainer() {
  const [current, setCurrent] = useState<ToastState>(null);

  const show = useCallback((message: string) => {
    setCurrent({ id: Date.now(), message });
  }, []);

  useEffect(() => {
    listeners.push(show);
    return () => {
      listeners = listeners.filter((l) => l !== show);
    };
  }, [show]);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), 2400);
    return () => clearTimeout(t);
  }, [current]);

  if (!current) return null;

  return (
    <div
      key={current.id}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] rise"
    >
      <div className="px-4 py-2 bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-sm rounded-md shadow-lg mono">
        {current.message}
      </div>
    </div>
  );
}
