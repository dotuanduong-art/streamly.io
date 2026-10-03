import { Modal } from './Modal';
import { TrailerPlayer } from '@/components/movie/TrailerPlayer';

export interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerKey?: string | null;
  title: string;
}

export function TrailerModal({ isOpen, onClose, trailerKey, title }: TrailerModalProps) {
  return <Modal isOpen={isOpen} onClose={onClose} title={`${title} — Trailer`}>
    <div data-testid="trailer-modal" className="p-3 sm:p-6">
      <TrailerPlayer trailerKey={trailerKey} title={title} autoPlay />
    </div>
  </Modal>;
}
