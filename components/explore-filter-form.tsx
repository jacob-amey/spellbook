"use client";

import Form from "next/form";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { useFormStatus } from "react-dom";

const TYPED_FILTER_DELAY_MS = 450;

type ExploreFilterFormProps = {
  children: ReactNode;
  className?: string;
};

export function ExploreFilterForm({
  children,
  className,
}: ExploreFilterFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current);
      }
    },
    [],
  );

  function scheduleSubmit(delay: number) {
    if (submitTimerRef.current) {
      clearTimeout(submitTimerRef.current);
    }

    submitTimerRef.current = setTimeout(() => {
      formRef.current?.requestSubmit();
    }, delay);
  }

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    const control = event.target;

    if (
      !(control instanceof HTMLInputElement) &&
      !(control instanceof HTMLSelectElement)
    ) {
      return;
    }

    const isTypedInput =
      control instanceof HTMLInputElement &&
      ["search", "text", "number"].includes(control.type);

    scheduleSubmit(isTypedInput ? TYPED_FILTER_DELAY_MS : 0);
  }

  function handleSubmit() {
    if (submitTimerRef.current) {
      clearTimeout(submitTimerRef.current);
      submitTimerRef.current = null;
    }
  }

  return (
    <Form
      ref={formRef}
      action="/explore"
      replace
      scroll={false}
      className={className}
      onChange={handleChange}
      onSubmit={handleSubmit}
    >
      {children}
    </Form>
  );
}

export function ExploreFilterSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 w-full bg-orange px-5 py-3 text-sm font-bold text-night transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? "Updating results…" : "Update results"}
    </button>
  );
}
