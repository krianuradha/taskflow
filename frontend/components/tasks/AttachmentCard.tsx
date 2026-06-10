'use client';

import { ArrowDownToLine, FileText, ImageSquare } from 'lucide-react';
import type { IAttachment } from '@/types';

interface AttachmentCardProps {
  attachment: IAttachment;
}

export default function AttachmentCard({ attachment }: AttachmentCardProps) {
  const isImage = attachment.type.startsWith('image');

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border-subtle bg-surface p-4 text-sm text-on-surface shadow-sm transition hover:border-secondary/40 dark:border-[#1e3a5f] dark:bg-[#131b2e]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-3xl bg-secondary/10 text-secondary">
            {isImage ? <ImageSquare size={20} /> : <FileText size={20} />}
          </span>
          <div>
            <p className="font-semibold text-text-heading">{attachment.name}</p>
            <p className="text-xs text-on-surface-variant">{attachment.sizeLabel}</p>
          </div>
        </div>
        <a
          href={attachment.url}
          download
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-white opacity-0 transition hover:bg-[#0047b2] group-hover:opacity-100"
          aria-label="Download attachment"
        >
          <ArrowDownToLine size={18} />
        </a>
      </div>
    </div>
  );
}
