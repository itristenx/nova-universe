import React from 'react'
import { motion } from 'framer-motion'

type PageTransitionProps = {
  children: React.ReactNode
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.6 }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition


