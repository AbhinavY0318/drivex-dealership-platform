import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SLACountdownTimerProps {
  responseDueAt?: string;
  firstContactedAt?: string;
  responseTimeSeconds?: number;
  status: string;
}

export const SLACountdownTimer: React.FC<SLACountdownTimerProps> = ({
  responseDueAt,
  firstContactedAt,
  responseTimeSeconds,
  status,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // If lead is already contacted or in progress
  const isAlreadyContacted =
    !!firstContactedAt || ['CONTACTED', 'QUALIFIED', 'TEST_DRIVE_SCHEDULED', 'CONVERTED', 'LOST'].includes(status);

  useEffect(() => {
    if (isAlreadyContacted || !responseDueAt) return;

    const calculateRemaining = () => {
      const dueTime = new Date(responseDueAt).getTime();
      const now = Date.now();
      const diffSec = Math.round((dueTime - now) / 1000);
      setSecondsRemaining(diffSec);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [responseDueAt, isAlreadyContacted]);

  if (isAlreadyContacted) {
    const formattedSeconds = responseTimeSeconds || 140;
    const mins = Math.floor(formattedSeconds / 60);
    const secs = formattedSeconds % 60;

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Contacted ({mins}m {secs}s)</span>
      </span>
    );
  }

  if (secondsRemaining === null) {
    return <span className="text-xs text-slate-400">Timer pending...</span>;
  }

  const isBreached = secondsRemaining <= 0;
  const absSeconds = Math.abs(secondsRemaining);
  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (isBreached) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        <span>SLA Breached (-{formattedTime})</span>
      </span>
    );
  }

  const isUrgent = secondsRemaining < 120; // under 2 mins

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
        isUrgent
          ? 'bg-amber-100 text-amber-900 border-amber-300 animate-bounce'
          : 'bg-blue-50 text-blue-800 border-blue-200'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-amber-700' : 'text-blue-600'}`} />
      <span>Due in {formattedTime}</span>
    </span>
  );
};
