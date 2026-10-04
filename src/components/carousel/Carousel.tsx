import { Children, useEffect, useState, type ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

export interface CarouselProps { children: ReactNode; label: string }
export function Carousel({ children, label }: CarouselProps) {
  const [ref, api] = useEmblaCarousel({ dragFree: true, align: 'start', containScroll: 'trimSnaps' });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  useEffect(() => {
    if (!api) return;
    const updateOrigins = () => {
      const bounds = api.rootNode().getBoundingClientRect();
      api.slideNodes().forEach((slide) => {
        const rect = slide.getBoundingClientRect();
        const clearance = rect.width * 0.13;
        slide.style.setProperty('--card-origin', rect.left - bounds.left < clearance ? 'left' : bounds.right - rect.right < clearance ? 'right' : 'center');
      });
    };
    const update = () => { setCanPrev(api.canScrollPrev()); setCanNext(api.canScrollNext()); updateOrigins(); };
    update(); api.on('select', update); api.on('reInit', update); api.on('scroll', updateOrigins);
    return () => { api.off('select', update); api.off('reInit', update); api.off('scroll', updateOrigins); };
  }, [api]);
  return <div className="carousel group/carousel relative" role="region" aria-roledescription="carousel" aria-label={label}
    onKeyDown={(event) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); api?.scrollNext(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); api?.scrollPrev(); }
    }}>
    <div ref={ref} className="carousel-viewport scrollbar-hide" tabIndex={0} aria-label={`${label}: dùng phím mũi tên trái và phải`}>
      <div className="flex touch-pan-y gap-3">
        {Children.map(children, (child) => <div className="carousel-slide min-w-0 shrink-0 grow-0">{child}</div>)}
      </div>
    </div>
    {canPrev && <IconButton ariaLabel={`${label} trước`} className="carousel-arrow -left-3" variant="secondary" onClick={() => api?.scrollPrev()}><ChevronLeft /></IconButton>}
    {canNext && <IconButton ariaLabel={`${label} tiếp theo`} className="carousel-arrow -right-3" variant="secondary" onClick={() => api?.scrollNext()}><ChevronRight /></IconButton>}
  </div>;
}

