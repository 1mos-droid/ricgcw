import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge optional component classes and resolve conflicting utility classes. */
export const cn = (...inputs) => twMerge(clsx(inputs));
