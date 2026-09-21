import React from 'react';
import { Box, Typography, Button, Paper, useTheme, alpha } from '@mui/material';
import { Inbox, Plus } from 'lucide-react';

/**
 * Reusable EmptyState component for zero-record states per decision D-07.
 * Provides clear iconography, concise messaging, and an actionable call-to-action button.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.icon] - Lucide icon or custom icon element
 * @param {string} [props.title='No records found'] - Primary heading
 * @param {string} [props.description] - Explanatory message or guidance
 * @param {string} [props.actionLabel] - Label for primary CTA button
 * @param {Function} [props.onAction] - Handler for CTA button click
 * @param {React.ReactNode} [props.actionIcon] - Icon for action button (defaults to Plus)
 * @param {Object} [props.sx] - Additional MUI styling overrides
 */
const EmptyState = ({
  icon,
  title = 'No records found',
  description = 'There are no items to display right now. Try adjusting your filters or add a new record.',
  actionLabel,
  onAction,
  actionIcon,
  sx = {}
}) => {
  const theme = useTheme();

  const IconComponent = icon || <Inbox size={40} />;

  return (
    <Paper
      elevation={0}
      sx={{
        py: 8,
        px: 4,
        textAlign: 'center',
        borderRadius: 2,
        border: `1px dashed ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          mb: 2.5
        }}
      >
        {React.isValidElement(IconComponent) ? (
          IconComponent
        ) : (
          <Inbox size={36} />
        )}
      </Box>

      <Typography
        variant="h6"
        fontWeight={700}
        color="text.primary"
        sx={{ mb: 1, letterSpacing: '-0.01em' }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 440, mb: actionLabel ? 3 : 0, lineHeight: 1.6 }}
        >
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <Button
          variant="contained"
          color="primary"
          startIcon={actionIcon || <Plus size={18} />}
          onClick={onAction}
          sx={{
            borderRadius: 1.5,
            fontWeight: 700,
            px: 3,
            py: 1,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
