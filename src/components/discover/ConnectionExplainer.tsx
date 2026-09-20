import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Connection, LifeReceipt } from '@/types';

interface ConnectionExplainerProps {
  connection: Connection;
  receiptA: LifeReceipt;
  receiptB: LifeReceipt;
}

export const ConnectionExplainer: React.FC<ConnectionExplainerProps> = ({
  connection,
  receiptA: _receiptA,
  receiptB: _receiptB
}) => {
  const percent = Math.round(connection.score * 100);

  return (
    <div className="bg-parchment-100 p-8 border-t border-ink-300 md:border-t-0 md:border-l h-full">
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-2">
          <h4 className="font-mono text-sm uppercase tracking-widest text-ink-500">Evidence Strength</h4>
          <span className="font-mono text-lg text-ink-900">{percent}%</span>
        </div>
        <div className="w-full h-1 bg-ink-200">
          <div 
            className="h-full bg-ink-900" 
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="font-mono text-xs text-ink-400 mt-2 uppercase">Heuristic Analysis</p>
      </div>

      <div className="mb-8">
        <h3 className="font-display text-2xl text-ink-900 mb-6 border-b border-ink-200 pb-4">
          Why They Connect
        </h3>
        
        <ul className="space-y-4">
          {connection.signals.map((signal, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-forest-500 mt-1 flex-shrink-0" />
              <span className="font-body text-ink-800">{signal.label || signal.type}</span>
            </li>
          ))}
        </ul>
      </div>

      {connection.explanation && (
        <div className="prose prose-p:font-body prose-p:text-ink-700 prose-p:leading-relaxed">
          <p>{connection.explanation}</p>
        </div>
      )}
    </div>
  );
};
