
import React, { useState, useEffect } from 'react';

interface FocusTimerProps {
  onSessionComplete?: (minutes: number) => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const nextMode = !isBreak;
      if (!isBreak && onSessionComplete) {
        onSessionComplete(25);
      }
      setIsBreak(nextMode);
      setTimeLeft(nextMode ? 5 * 60 : 25 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak, onSessionComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl">
      <div className="text-center">
        <h2 className="text-lg font-medium mb-2 uppercase tracking-widest opacity-80">
          {isBreak ? 'Pause Bien-être' : 'Session de Focus'}
        </h2>
        <div className="text-7xl font-bold mb-8 font-mono">{formatTime(timeLeft)}</div>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              isActive 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'bg-white text-indigo-700 hover:bg-slate-100 shadow-lg'
            }`}
          >
            {isActive ? 'Pause' : 'Démarrer'}
          </button>
          <button 
            onClick={resetTimer}
            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
