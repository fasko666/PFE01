import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen theme-bg flex flex-col"
      style={{ paddingTop: '64px' }}
    >
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-[420px]"
        >
          <div className="card px-8 py-10 shadow-dialog">
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
