import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField({ label, error, id, className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return <div>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-text-primary">{label}</label>
    <div className="relative">
      <input ref={ref} id={id} type={visible ? 'text' : 'password'} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={`w-full rounded-button border bg-background/70 px-4 py-3 pr-12 text-text-primary placeholder:text-text-secondary ${error ? 'border-status-error' : 'border-text-primary/15'} ${className}`} {...props} />
      <IconButton type="button" ariaLabel={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} onClick={() => setVisible((current) => !current)} className="absolute right-1 top-1/2 -translate-y-1/2">
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </IconButton>
    </div>
    {error && <p id={`${id}-error`} className="mt-2 text-sm text-status-error">{error}</p>}
  </div>;
});
