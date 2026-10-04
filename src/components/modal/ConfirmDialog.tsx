import { Button } from '@/components/ui/Button';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm',
  cancelLabel = 'Cancel', destructive = false, isLoading = false,
}: ConfirmDialogProps) {
  return <Modal isOpen={isOpen} onClose={onClose} title={title} closeDisabled={isLoading}>
    <div data-testid="confirm-dialog" className="p-5 sm:p-7">
      <p className="text-text-secondary">{message}</p>
      <div className="mt-7 flex flex-wrap justify-end gap-3">
        <Button data-testid="confirm-dialog-cancel" type="button" variant="secondary" disabled={isLoading} onClick={onClose}>{cancelLabel}</Button>
        <Button data-testid="confirm-dialog-confirm" type="button" variant={destructive ? 'danger' : 'primary'} isLoading={isLoading} disabled={isLoading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  </Modal>;
}
