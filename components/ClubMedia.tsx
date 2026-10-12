'use client';
import Image from 'next/image';
export function ClubPhoto({ src, title }: { src: string; title: string }) {
 return <div onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} className="relative select-none">
  <Image src={src} alt={title} width={2000} height={1500} unoptimized draggable={false} className="aspect-[4/3] w-full object-contain bg-black" />
 </div>;
}
export function ClubVideo({ src, title }: { src: string; title: string }) {
 return <video controls playsInline preload="none" controlsList="nodownload noremoteplayback" disablePictureInPicture
  onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()}
  className="aspect-video w-full bg-black" src={src} aria-label={title} />;
}
