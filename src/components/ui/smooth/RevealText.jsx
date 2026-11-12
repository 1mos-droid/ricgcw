// SmoothUI RevealText. Copyright (c) 2024 Eduardo Calvo, MIT.
// JSX adaptation; entrance shortened to 200ms, existing reduced-motion behavior retained.
import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

const DIRECTIONS = { down: { opacity: 0, y: -24 }, left: { opacity: 0, x: 24 }, right: { opacity: 0, x: -24 }, up: { opacity: 0, y: 24 } };
export default function RevealText({ children, direction = 'up', delay = 0, triggerOnView = false, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  return <motion.span ref={triggerOnView ? ref : undefined} className={className} style={{ display: 'inline-block' }} initial={reduced ? false : DIRECTIONS[direction]} animate={reduced || !triggerOnView || inView ? { opacity: 1, x: 0, y: 0 } : DIRECTIONS[direction]} transition={{ duration: reduced ? 0 : 0.2, delay: delay / 1000, ease: 'easeOut' }}>{children}</motion.span>;
}
