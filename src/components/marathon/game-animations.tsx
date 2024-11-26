import { motion } from 'framer-motion';

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const popIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};

export const bounceIn = {
  initial: { scale: 0.3, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: { scale: 0.3, opacity: 0 }
};

export const AnimatedContainer = ({ children, className = "", animation = "fade" }: {
  children: React.ReactNode;
  className?: string;
  animation?: "fade" | "slide" | "pop" | "bounce";
}) => {
  const animations = {
    fade: fadeIn,
    slide: slideIn,
    pop: popIn,
    bounce: bounceIn
  };

  return (
    <motion.div
      {...animations[animation]}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedScore = ({ score, streak }: { score: number; streak: number }) => {
  return (
    <motion.div 
      className="space-y-1 text-right"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        key={score}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.2, 1] }}
        className="text-2xl font-bold"
      >
        {score}
      </motion.div>
      {streak > 0 && (
        <motion.div
          key={streak}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          {streak}🔥
        </motion.div>
      )}
    </motion.div>
  );
};

export const AnimatedLives = ({ lives }: { lives: number }) => {
  return (
    <motion.div className="flex gap-1">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 1 }}
          animate={i < lives ? { scale: [1, 1.2, 1] } : { scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`w-6 h-6 rounded-full ${
              i < lives
                ? 'bg-red-500 shadow-lg shadow-red-500/50'
                : 'bg-gray-200'
            }`}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export const AnimatedTimer = ({ timeLeft }: { timeLeft: number }) => {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        key={timeLeft}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className={`text-lg font-medium ${
          timeLeft <= 5 ? 'text-red-500' : 'text-muted-foreground'
        }`}
      >
        {timeLeft}s
      </motion.div>
    </motion.div>
  );
};

export const AnimatedButton = ({ children, onClick, variant = "default", disabled = false }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "correct" | "wrong";
  disabled?: boolean;
}) => {
  const variants = {
    default: "bg-primary hover:bg-primary/90",
    correct: "bg-green-500 hover:bg-green-600",
    wrong: "bg-red-500 hover:bg-red-600"
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        ${variants[variant]}
        text-white rounded-lg px-4 py-2
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};
