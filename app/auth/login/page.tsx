'use client'

import LoginForm from "./LoginForm";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-brand-50/30 to-gray-100">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-brand-200/20 blur-3xl"
          style={{ top: '10%', right: '10%' }}
          animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-brand-300/20 blur-3xl"
          style={{ bottom: '10%', left: '10%' }}
          animate={{
            y: [0, -30, 0],
            x: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <LoginForm />
      </div>
    </div>
  );
}
