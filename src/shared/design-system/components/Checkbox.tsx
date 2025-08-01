import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const checkboxVariants = cva(
  [
    'peer h-4 w-4 shrink-0 rounded-sm border border-neutral-300',
    'shadow-sm transition-colors duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600 data-[state=checked]:text-white',
    'data-[state=indeterminate]:bg-primary-600 data-[state=indeterminate]:border-primary-600 data-[state=indeterminate]:text-white',
  ],
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  id?: string;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ 
  className, 
  size, 
  label, 
  description, 
  error, 
  required, 
  id,
  ...props 
}, ref) => {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;
  const hasError = !!error;

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2">
        <CheckboxPrimitive.Root
          ref={ref}
          id={checkboxId}
          className={cn(checkboxVariants({ size }), className)}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${checkboxId}-error` : description ? `${checkboxId}-description` : undefined
          }
          {...props}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
            >
              <path
                d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        
        {label && (
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={checkboxId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </label>
            
            {description && (
              <p 
                id={`${checkboxId}-description`}
                className="text-xs text-neutral-500"
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${checkboxId}-error`} className="text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName; 