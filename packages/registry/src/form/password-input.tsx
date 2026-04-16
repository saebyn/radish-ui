import { useState } from "react";
import { useInput } from "ra-core";
import { cn } from "@radish-ui/core";

interface PasswordInputProps {
  /** The field name in the record */
  source: string;
  /** Human-readable label; defaults to a capitalised version of source */
  label?: string;
  /** Optional placeholder text */
  placeholder?: string;
  className?: string;
}

/**
 * Password input for use inside <SimpleForm>.
 * Wraps ra-core's useInput which ties the field to react-hook-form.
 * Includes a show/hide toggle to reveal the password.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <PasswordInput source="password" label="Password" />
 */
export function PasswordInput({
  source,
  label,
  placeholder,
  className,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    id,
    field,
    fieldState: { error },
    isRequired,
  } = useInput({ source });

  const fieldLabel = label ?? capitalize(source);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
      >
        {fieldLabel}
        {isRequired && (
          <span className="text-danger-500 ml-1" aria-hidden>
            *
          </span>
        )}
      </label>
      <div className="relative">
        <input
          {...field}
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={cn(
            "block w-full rounded-md border border-neutral-300 bg-canvas-0 px-3 py-2 pr-10 text-sm text-neutral-900 shadow-sm",
            "placeholder:text-neutral-400",
            "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
            "dark:border-neutral-600 dark:bg-canvas-700 dark:text-neutral-100 dark:placeholder:text-neutral-500",
            "dark:focus:border-primary-400 dark:focus:ring-primary-400",
            error &&
              "border-danger-500 focus:border-danger-500 focus:ring-danger-500 dark:border-danger-400 dark:focus:border-danger-400 dark:focus:ring-danger-400",
            className,
          )}
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((v) => !v)}
          className={cn(
            "absolute inset-y-0 right-0 flex items-center px-3",
            "text-neutral-500 hover:text-neutral-700",
            "dark:text-neutral-400 dark:hover:text-neutral-200",
            "focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-500",
          )}
        >
          {showPassword ? (
            <EyeOffIcon />
          ) : (
            <EyeIcon />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger-600 dark:text-danger-400" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z"
        clipRule="evenodd"
      />
      <path d="m10.748 13.93 2.523 2.523a10.003 10.003 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
    </svg>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}
