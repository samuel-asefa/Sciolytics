import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageLoadingScreenProps {
  loading: boolean;
}

const PAGE_META: Record<string, { label: string; icon: string }> = {
  '/dashboard':        { label: 'Dashboard',      icon: '◈' },
  '/practice':         { label: 'Practice',        icon: '✎' },
  '/practice/test':    { label: 'Practice Test',  icon: '✎' },
  '/practice/results': { label: 'Results',         icon: '◎' },
  '/analytics':        { label: 'Analytics',       icon: '◑' },
  '/teams':            { label: 'Teams',           icon: '◉' },
  '/upcoming':         { label: 'Upcoming Events', icon: '◷' },
  '/profile':          { label: 'Profile',         icon: '◈' },
  '/wiki':             { label: 'Wiki',            icon: '◫' },
  '/bookmarks':        { label: 'Bookmarks',       icon: '◆' },
  '/settings':         { label: 'Settings',        icon: '◎' },
  '/help':             { label: 'Help',            icon: '◌' },
  '/about':            { label: 'About Us',        icon: '◈' },
  '/contact':          { label: 'Contact',         icon: '◇' },
  '/join':             { label: 'Join Us',         icon: '◈' },
  '/load-test':        { label: 'Load Test',       icon: '◉' },
};

function usePageMeta() {
  const { pathname } = useLocation();
  const key = Object.keys(PAGE_META).find(
    k => pathname === k || pathname.startsWith(k + '/')
  ) ?? pathname;
  return PAGE_META[key] ?? { label: 'Sciolytics', icon: '◈' };
}

export default function PageLoadingScreen({ loading }: PageLoadingScreenProps) {
  const { label, icon } = usePageMeta();

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="page-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
            background: 'var(--bg-gradient)',
            backgroundSize: '400% 400%',
            animation: 'gradientBG 8s ease infinite',
          }}
        >
          {/* ── Dual-orbit spinner ── */}
          <div style={{
            position: 'relative',
            width: 96,
            height: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2.5px solid transparent',
                borderTopColor: 'var(--primary-color)',
                borderRightColor: 'color-mix(in srgb, var(--primary-color) 30%, transparent)',
              }}
            />
            {/* Inner ring — counter-rotate */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 16,
                borderRadius: '50%',
                border: '2px solid transparent',
                borderBottomColor: 'var(--primary-color)',
                borderLeftColor: 'color-mix(in srgb, var(--primary-color) 45%, transparent)',
                opacity: 0.8,
              }}
            />
            {/* Centre glow dot */}
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--primary-color)',
                boxShadow: [
                  '0 0 0 6px color-mix(in srgb, var(--primary-color) 18%, transparent)',
                  '0 0 28px 4px color-mix(in srgb, var(--primary-color) 35%, transparent)',
                ].join(', '),
              }}
            />
          </div>

          {/* ── Shimmer bar ── */}
          <div style={{
            width: 160,
            height: 2,
            borderRadius: 99,
            background: 'color-mix(in srgb, var(--primary-color) 15%, transparent)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                repeat: Infinity,
                duration: 1.3,
                ease: 'easeInOut',
                repeatDelay: 0.1,
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '60%',
                borderRadius: 99,
                background: 'linear-gradient(90deg, transparent, var(--primary-color), color-mix(in srgb, var(--primary-color) 70%, white), var(--primary-color), transparent)',
              }}
            />
          </div>

          {/* ── Labels ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}>
              Sciolytics
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--primary-color)',
              opacity: 0.65,
            }}>
              <span style={{ fontSize: 9 }}>{icon}</span>
              {label}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
