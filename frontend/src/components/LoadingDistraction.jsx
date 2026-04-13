import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Droplets, Moon, Sun, Heart, Coffee, ShieldCheck, Thermometer, Wind, Eye, Sparkles, Brain } from 'lucide-react';

const MEDICAL_TIPS = [
  {
    icon: <Droplets className="text-blue-500" />,
    text: "Drink at least 8 glasses of water daily to maintain kidney health and hydration.",
    title: "Stay Hydrated"
  },
  {
    icon: <Activity className="text-green-500" />,
    text: "A 30-minute brisk walk every day can reduce the risk of heart disease by up to 40%.",
    title: "Keep Moving"
  },
  {
    icon: <Moon className="text-indigo-500" />,
    text: "Aim for 7-9 hours of quality sleep to help your body repair and maintain immune function.",
    title: "Prioritize Sleep"
  },
  {
    icon: <Eye className="text-purple-500" />,
    text: "Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.",
    title: "Eye Health"
  },
  {
    icon: <Sun className="text-amber-500" />,
    text: "15 minutes of natural sunlight a day helps your body produce essential Vitamin D.",
    title: "Natural Vitamin D"
  },
  {
    icon: <ShieldCheck className="text-emerald-500" />,
    text: "Wash your hands for at least 20 seconds to significantly reduce the spread of germs.",
    title: "Hygiene First"
  },
  {
    icon: <Heart className="text-red-500" />,
    text: "Reducing added sugar intake helps maintain healthy blood glucose and weight levels.",
    title: "Sugar Management"
  },
  {
    icon: <Wind className="text-cyan-500" />,
    text: "Spend 5 minutes daily on deep breathing exercises to lower stress and blood pressure.",
    title: "Mindful Breathing"
  },
  {
    icon: <Brain className="text-blue-600" />,
    text: "Practicing mindfulness or puzzles for 10 minutes can significantly improve cognitive health.",
    title: "Brain Fitness"
  },
  {
    icon: <Coffee className="text-yellow-700" />,
    text: "Limit caffeine intake in the afternoon to avoid disrupting your natural sleep cycle.",
    title: "Caffeine Timing"
  }
];

const STAGES = [
  "Scanning Laboratory Data...",
  "Running AI Pattern Recognition...",
  "Analyzing Biomarker Trends...",
  "Consulting Medical Knowledge Base...",
  "Finalizing Health Insights..."
];

export default function LoadingDistraction() {
  const [tipIndex, setTipIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % MEDICAL_TIPS.length);
    }, 4500);

    const stageInterval = setInterval(() => {
      setStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1));
    }, 4000);

    return () => {
      clearInterval(tipInterval);
      clearInterval(stageInterval);
    };
  }, []);

  return (
    <div className="loading-distraction-card card animate-fade-up">
      <div className="processing-header">
        <div className="header-top">
          <div className="ai-badge">
             <Sparkles size={12} strokeWidth={3} />
             <span>AI ANALYSIS</span>
          </div>
          <div className="pulse-indicator">
            <span className="pulse-dot"></span>
            LIVE
          </div>
        </div>
        
        <h3 className="current-stage">{STAGES[stageIndex]}</h3>
        
        <div className="progress-container">
          <div className="progress-bar-bg">
            <motion.div 
              className="progress-bar-fill"
              initial={{ width: "2%" }}
              animate={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
              transition={{ duration: 1, ease: "circOut" }}
            />
          </div>
          <p className="progress-percent">{Math.round(((stageIndex + 1) / STAGES.length) * 100)}% Complete</p>
        </div>
      </div>

      <div className="tips-section">
        <div className="tips-label">WHILE YOU WAIT:</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="tip-card"
          >
            <div className="tip-visual">
              <div className="tip-icon-glow"></div>
              <div className="tip-icon-main">{MEDICAL_TIPS[tipIndex].icon}</div>
            </div>
            <div className="tip-text-content">
              <h4 className="tip-title">{MEDICAL_TIPS[tipIndex].title}</h4>
              <p className="tip-description">{MEDICAL_TIPS[tipIndex].text}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .loading-distraction-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          min-height: 480px;
          justify-content: space-between;
          background: linear-gradient(to bottom, #ffffff, #fff9f9);
          border-color: var(--border-red);
          position: relative;
          overflow: hidden;
        }
        
        .loading-distraction-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, var(--primary), var(--secondary));
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .ai-badge {
          background: var(--primary-light);
          color: var(--primary);
          padding: 0.35rem 0.75rem;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          letter-spacing: 0.05em;
        }

        .pulse-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-light);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse-dot-anim 1.5s infinite;
        }

        @keyframes pulse-dot-anim {
          0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .current-stage {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
          min-height: 3.5rem;
        }

        .progress-container {
          width: 100%;
        }

        .progress-bar-bg {
          height: 8px;
          background: #f1f5f9;
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary) 0%, #ff4b5c 100%);
          border-radius: 99px;
          box-shadow: 0 0 12px rgba(192, 21, 42, 0.3);
        }

        .progress-percent {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-align: right;
        }

        .tips-section {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .tips-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-light);
          margin-bottom: 1.25rem;
          letter-spacing: 0.1em;
        }

        .tip-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: 100%;
        }

        .tip-visual {
          position: relative;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tip-icon-glow {
          position: absolute;
          inset: 0;
          background: currentColor;
          opacity: 0.1;
          filter: blur(12px);
          border-radius: 50%;
        }

        .tip-icon-main {
          z-index: 1;
          transform: scale(1.5);
        }

        .tip-text-content {
          flex: 1;
        }

        .tip-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
        }

        .tip-description {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
      `}} />
    </div>
  );
}
