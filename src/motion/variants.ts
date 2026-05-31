import { Variants } from 'framer-motion';

// Card hover (subtle scale + shadow)
export const cardHover: Variants = {
  initial: { scale: 1 },
  whileHover: { scale: 1.02, transition: { duration: 0.2, ease: [0.25, 0.4, 0.25, 1] as const } },
  whileTap: { scale: 0.98 },
};

// Dropdown menu
export const dropdownMenu: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: [0.25, 0.4, 0.25, 1] as const },
  },
  exit: { opacity: 0, scale: 0.95, y: -8 },
};

// Modal
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContainer: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 16 },
};

// Drawer
export const drawerBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const drawerPanel: Variants = {
  hidden: { x: '-100%', transition: { duration: 0.25, ease: [0.25, 0.4, 0.25, 1] as const } },
  visible: { x: 0, transition: { duration: 0.25, ease: [0.25, 0.4, 0.25, 1] as const } },
  exit: { x: '-100%', transition: { duration: 0.25, ease: [0.25, 0.4, 0.25, 1] as const } },
};

// Menu item stagger
export const menuItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.15, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};
