import { useEffect, useRef } from 'react';

interface SentimentGaugeProps {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

const LABEL_COLORS: Record<string, string> = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#64748b',
};

const LABEL_BG: Record<string, string> = {
  positive: 'from-emerald-500 to-green-600',
  negative: 'from-red-500 to-rose-600',
  neutral: 'from-slate-500 to-slate-600',
};

export default function SentimentGauge({ score, label, confidence }: SentimentGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 240;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 95;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalArc = endAngle - startAngle;

    ctx.clearRect(0, 0, size, size);

    // Background arc segments — red, gray, green
    const segments = [
      { from: 0, to: 0.4, color: '#ef4444' },
      { from: 0.4, to: 0.6, color: '#94a3b8' },
      { from: 0.6, to: 1.0, color: '#10b981' },
    ];

    for (const seg of segments) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle + totalArc * seg.from, startAngle + totalArc * seg.to);
      ctx.lineWidth = 18;
      ctx.strokeStyle = seg.color;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Needle position: score -1 -> start, 1 -> end
    const normalized = (score + 1) / 2; // 0 to 1
    const needleAngle = startAngle + totalArc * Math.max(0, Math.min(1, normalized));

    // Active arc from center to needle
    const centerAngle = startAngle + totalArc * 0.5;
    const activeColor = LABEL_COLORS[label];

    ctx.beginPath();
    if (needleAngle < centerAngle) {
      ctx.arc(centerX, centerY, radius, needleAngle, centerAngle);
    } else {
      ctx.arc(centerX, centerY, radius, centerAngle, needleAngle);
    }
    ctx.lineWidth = 18;
    ctx.strokeStyle = activeColor;
    ctx.globalAlpha = 0.85;
    ctx.stroke();

    ctx.globalAlpha = 1;

    // Needle
    const needleLength = 80;
    const needleX = centerX + Math.cos(needleAngle) * needleLength;
    const needleY = centerY + Math.sin(needleAngle) * needleLength;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(needleX, needleY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = activeColor;
    ctx.fill();
  }, [score, label]);

  const scoreDisplay = score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '20px' }}>
          <span
            className={`text-4xl font-bold bg-gradient-to-br ${LABEL_BG[label]} bg-clip-text text-transparent`}
          >
            {scoreDisplay}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            {Math.round(confidence * 100)}% confidence
          </span>
        </div>
      </div>
      <div
        className={`mt-4 px-6 py-2 rounded-full text-white font-semibold text-sm uppercase tracking-wide bg-gradient-to-r ${LABEL_BG[label]} shadow-lg`}
        style={{ boxShadow: `0 4px 20px ${LABEL_COLORS[label]}40` }}
      >
        {label}
      </div>
    </div>
  );
}
