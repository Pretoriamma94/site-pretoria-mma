import { Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';

const INSTAGRAM_URL = 'https://www.instagram.com/pretoria_mma/';
const TIKTOK_URL = 'https://www.tiktok.com/@pretoria86';

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M18.5 8.5c-1.5-.4-2.7-1.5-3.3-3l-.2-.5H12v8.8c0 1-.8 1.8-1.8 1.8-.6 0-1.1-.3-1.5-.7-.4-.4-.6-.9-.6-1.5 0-1.1.8-2.1 1.9-2.3V9.1C7.7 9.3 6 11.3 6 13.9 6 15 6.4 16 7.2 16.8 8 17.6 9 18 10.1 18c2.2 0 3.9-1.8 3.9-3.9v-4c.9.9 2 1.5 3.3 1.7l1.2.2V8.6l-.5-.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

type SocialLinksProps = {
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
};

export function SocialLinks({
  className,
  linkClassName,
  iconClassName = 'h-6 w-6',
}: SocialLinksProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <a
        href={INSTAGRAM_URL}
        aria-label="Instagram Pretoria MMA"
        target="_blank"
        rel="noopener noreferrer"
        className={cn('text-gray-400 transition-colors hover:text-white', linkClassName)}
      >
        <Instagram className={iconClassName} />
      </a>
      <a
        href={TIKTOK_URL}
        aria-label="TikTok Pretoria MMA"
        target="_blank"
        rel="noopener noreferrer"
        className={cn('text-gray-400 transition-colors hover:text-white', linkClassName)}
      >
        <TikTokIcon className={iconClassName} />
      </a>
    </div>
  );
}
