// Adapted from Watermelon Continuous Tabs (base).
// Copyright (c) 2026 Watermelon Platform Contributors, MIT.
// MUI handles keyboard/focus; original shared-layout active pill retained.
import React, { useId } from 'react';
import { Tabs, Tab } from '@mui/material';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';

export default function ContinuousTabs({ tabs, value, onChange, label = 'View', disabled = false }) {
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <LayoutGroup id={id}>
      <Tabs className="wm-tabs" value={value} onChange={(_, next) => onChange(next)} aria-label={label} variant="fullWidth" TabIndicatorProps={{ style: { display: 'none' } }}>
        {tabs.map((tab) => <Tab disabled={disabled} key={tab.id} value={tab.id} label={<span className="wm-tab-label">{value === tab.id && <motion.span className="wm-active-pill" layoutId="active-pill" initial={false} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 30, mass: 0.9 }} />}<span>{tab.label}</span></span>} />)}
      </Tabs>
    </LayoutGroup>
  );
}
