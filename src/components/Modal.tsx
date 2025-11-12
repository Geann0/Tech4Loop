"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect, ReactNode } from "react";

export function Modal({ children }: { children: ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, []);

  function onDismiss() {
    router.back();
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <dialog
        ref={dialogRef}
        className="bg-background text-white p-0 rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto"
        onClose={onDismiss}
      >
        {children}
        <button
          onClick={onDismiss}
          className="absolute top-2 right-4 text-3xl text-gray-400 hover:text-white"
        >
          &times;
        </button>
      </dialog>
    </div>
  );
}
