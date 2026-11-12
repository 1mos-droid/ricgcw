// Adapted from Rare UI PasswordInput, https://rareui.com/components/passwordinput
// Copyright (c) 2026 Swami Malode. MIT + Commons Clause + Attribution.
// See THIRD_PARTY_UI.md. Native input and MUI focus behavior retained;
// upstream animated eye and strength algorithm adapted to the shared form system.
import React, { useId, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { motion, useReducedMotion } from 'motion/react';

const LEVELS = ['Weak', 'Fair', 'Good', 'Strong'];
const corner = (y) => 12 + (y - 12) * 0.64;
const eyePath = ({ top, bottom }) => `M2 12C4 ${corner(top)} 7.5 ${top} 12 ${top}C16.5 ${top} 20 ${corner(top)} 22 12C20 ${corner(bottom)} 16.5 ${bottom} 12 ${bottom}C7.5 ${bottom} 4 ${corner(bottom)} 2 12Z`;
function passwordStrength(value) {
  if (!value) return 0;
  const score = [value.length >= 8, value.length >= 12, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value), /[^a-zA-Z0-9]/.test(value)].filter(Boolean).length;
  return Math.min(Math.max(score, 1), LEVELS.length);
}
function Eye({ open }) {
  const id = useId();
  const reduced = useReducedMotion();
  const lid = { d: eyePath(open ? { top: 5.5, bottom: 18.5 } : { top: 17, bottom: 17 }) };
  const transition = reduced ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 34 };
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><clipPath id={id}><motion.path initial={false} animate={lid} transition={transition} /></clipPath><circle cx="12" cy="12" r="3" clipPath={`url(#${id})`} /><motion.path initial={false} animate={lid} transition={transition} />{['M4.4 14.6 3 16.4', 'M9 16.6 8.5 19', 'M15 16.6l.5 2.4', 'M19.6 14.6l1.4 1.8'].map((d) => <motion.path key={d} d={d} initial={false} animate={{ pathLength: open ? 0 : 1, opacity: open ? 0 : 1 }} transition={reduced ? { duration: 0 } : { duration: 0.2 }} />)}</svg>;
}
export default function PasswordInput({ value, onChange, strength = false, ...props }) {
  const [visible, setVisible] = useState(false);
  const level = passwordStrength(value);
  return <div className="rare-password"><TextField {...props} value={value} onChange={onChange} type={visible ? 'text' : 'password'} slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible((previous) => !previous)} edge="end"><Eye open={visible} /></IconButton></InputAdornment> } }} />{strength && value && <div className="rare-strength" role="status"><span className="rare-strength-bars">{LEVELS.map((label, index) => <i key={label} data-filled={index < level} />)}</span><span>{LEVELS[level - 1]} password</span></div>}</div>;
}
