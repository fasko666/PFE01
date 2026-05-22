import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ paddingTop: '64px' }}>
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-[440px] bg-white rounded-2xl border border-gray-200 shadow-sm px-10 py-10"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
