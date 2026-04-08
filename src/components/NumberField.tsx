import { KeyboardEvent, useEffect, useState } from 'react';

type NumericValue = number | undefined;

interface NumberFieldProps {
  value: NumericValue;
  onCommit: (value: NumericValue) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  allowEmpty?: boolean;
  fallbackValue?: number;
  inputMode?: 'numeric' | 'decimal';
  format?: (value: NumericValue) => string;
  parse?: (draft: string) => NumericValue;
  normalize?: (value: number) => number;
}

const defaultFormat = (value: NumericValue) => (value === undefined ? '' : String(value));

const defaultParse = (draft: string) => {
  if (draft.trim() === '') {
    return undefined;
  }

  const normalizedDraft = draft.replace(',', '.');
  const parsed = Number(normalizedDraft);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const clampValue = (value: number, min?: number, max?: number) => {
  let nextValue = value;

  if (min !== undefined) {
    nextValue = Math.max(min, nextValue);
  }

  if (max !== undefined) {
    nextValue = Math.min(max, nextValue);
  }

  return nextValue;
};

export default function NumberField({
  value,
  onCommit,
  min,
  max,
  step,
  disabled = false,
  placeholder,
  className,
  ariaLabel,
  allowEmpty = false,
  fallbackValue,
  inputMode,
  format = defaultFormat,
  parse = defaultParse,
  normalize,
}: NumberFieldProps) {
  const [draft, setDraft] = useState(() => format(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setDraft(format(value));
    }
  }, [format, isEditing, value]);

  const commitDraft = () => {
    const parsedValue = parse(draft);

    if (parsedValue === undefined) {
      if (allowEmpty) {
        onCommit(undefined);
      } else if (fallbackValue !== undefined) {
        onCommit(clampValue(fallbackValue, min, max));
      } else {
        onCommit(value);
      }
      setIsEditing(false);
      return;
    }

    let nextValue = clampValue(parsedValue, min, max);
    if (normalize) {
      nextValue = normalize(nextValue);
    }

    onCommit(nextValue);
    setIsEditing(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
      return;
    }

    if (event.key === 'Escape') {
      setDraft(format(value));
      setIsEditing(false);
      event.currentTarget.blur();
    }
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      placeholder={placeholder}
      value={draft}
      inputMode={inputMode}
      onFocus={() => setIsEditing(true)}
      onChange={(event) => {
        setIsEditing(true);
        setDraft(event.target.value);
      }}
      onBlur={commitDraft}
      onKeyDown={handleKeyDown}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
