import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CircularProgress, 
  Stack, 
  useTheme, 
  alpha,
  Avatar,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight, ShieldAlert } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getUpcomingEvents } from '../../utils/eventFilters';

/**
 * Formats a date string safely.
 * @param {string} dateStr 
 * @returns {string} Formatted string
 */
const formatEventDate = (dateStr) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'TBD';
    return d.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return 'TBD';
  }
};

/**
 * EventsGateway component
 * Display upcoming events inside a premium overlay before proceeding to dashboard.
 */
const EventsGateway = ({ open, onProceed }) => {
  const theme = useTheme();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    
    const loadGatewayEvents = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "events"));
        const rawEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const sortedUpcoming = getUpcomingEvents(rawEvents, new Date());
        setUpcomingEvents(sortedUpcoming.slice(0, 3)); // Display top 3 upcoming events
      } catch (err) {
        console.error("Error loading events for gateway:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGatewayEvents();
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.palette.mode === 'dark' ? 'rgba(8, 8, 12, 0.96)' : 'rgba(242, 242, 247, 0.96)',
          backdropFilter: 'blur(40px)',
          p: { xs: 2, sm: 4 },
          overflowY: 'auto'
        }}
      >
        {/* Background Decorative Glow Orbs */}
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
          <Box sx={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 122, 255, 0.12) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '550px',
            height: '550px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(88, 86, 214, 0.1) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }} />
        </Box>

        {/* Central Modal Container */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          sx={{
            width: '100%',
            maxWidth: '540px',
            position: 'relative',
            zIndex: 1,
            background: theme.palette.mode === 'dark' ? 'rgba(28, 28, 30, 0.45)' : 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(30px) saturate(180%)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)'}`,
            borderRadius: '24px',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 30px 60px rgba(0,0,0,0.5), inset 1px 1px 0px rgba(255,255,255,0.05)'
              : '0 30px 60px rgba(165,175,190,0.22), inset 1px 1px 0px rgba(255,255,255,0.6)',
            p: { xs: 3.5, sm: 5 },
            textAlign: 'center',
          }}
        >
          {/* Header Branding */}
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              component="img"
              src="/ricgcw.png"
              alt="RICGCW Logo"
              sx={{
                width: 68,
                height: 'auto',
                mb: 2,
                filter: 'drop-shadow(0 6px 12px rgba(0, 122, 255, 0.18))'
              }}
            />
            <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '0.15em', color: 'var(--system-blue)', textTransform: 'uppercase' }}>
              Kingdom Update Gateway
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', mt: 0.5 }}>
              Upcoming Church Events
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 380 }}>
              Here are the upcoming services, conferences, and activities scheduled on the Rhema Inner Court calendar.
            </Typography>
          </Box>

          {/* Event Content Panel */}
          <Box sx={{ mb: 4.5 }}>
            {loading ? (
              <Stack spacing={2} sx={{ py: 6, alignItems: 'center' }}>
                <CircularProgress size={36} color="primary" />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Syncing ecclesiastical calendar...
                </Typography>
              </Stack>
            ) : upcomingEvents.length === 0 ? (
              <Box sx={{ p: 4, bgcolor: alpha(theme.palette.action.hover, 0.5), borderRadius: '16px', border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary" fontWeight={650}>
                  There are no upcoming events scheduled at this moment.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {upcomingEvents.map((event) => (
                  <Card
                    key={event.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: '16px',
                      border: `1px solid ${theme.palette.divider}`,
                      background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                      boxShadow: 'none',
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Flier Background Overlay */}
                    {event.flierUrl && (
                      <Box 
                        component="img"
                        src={event.flierUrl}
                        crossOrigin="anonymous"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: theme.palette.mode === 'dark' ? 0.08 : 0.04,
                          zIndex: 0
                        }}
                      />
                    )}

                    {/* Date Block */}
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--system-blue) 0%, var(--system-purple) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        mr: 2,
                        zIndex: 1,
                        flexShrink: 0
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 900, lineHeight: 1 }}>
                        {new Date(event.date).getDate() || '??'}
                      </Typography>
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '0.65rem', mt: 0.25 }}>
                        {new Date(event.date).toLocaleString(undefined, { month: 'short' }) || '???'}
                      </Typography>
                    </Box>

                    {/* Event Detail text */}
                    <Box sx={{ flex: 1, zIndex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 850, mb: 0.5, lineHeight: 1.2 }}>
                        {event.name}
                      </Typography>
                      <Stack direction="row" spacing={1.5} sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Clock size={12} color="var(--system-blue)" />
                          <Typography variant="caption" fontWeight={650}>{event.time || 'TBD'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MapPin size={12} color="var(--system-blue)" />
                          <Typography variant="caption" fontWeight={650} noWrap sx={{ maxWidth: 150 }}>{event.location || 'TBD'}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>

          {/* Action trigger button */}
          <Button
            component={motion.button}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onProceed}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.25,
              width: '100%',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--system-blue) 0%, var(--system-purple) 100%)',
              color: '#ffffff',
              fontFamily: 'var(--font-stack)',
              fontSize: '0.98rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
              boxShadow: '0 8px 24px rgba(0, 122, 255, 0.18)'
            }}
          >
            Enter Portal Administration <ArrowRight size={18} strokeWidth={2.5} />
          </Button>

        </Box>
      </Box>
    </AnimatePresence>
  );
};

export default EventsGateway;
