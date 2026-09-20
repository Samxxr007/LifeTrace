export type ConnectionSignalType =
  | 'temporal_proximity'
  | 'category_resonance'
  | 'time_of_day'
  | 'weekly_rhythm'
  | 'location_cluster'
  | 'cross_domain'
  | 'same_city'
  | 'same_place'
  | 'shared_tags'
  | 'scenario_context';

export interface ConnectionSignal {
  type: ConnectionSignalType;
  weight: number;
  label: string;
}

export type ConnectionStrength = 'strong' | 'moderate' | 'weak';

export interface ConnectionEvidence {
  temporal?: string;
  category?: string;
  source?: string;
  overlap?: string;
  recurring?: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  score: number; // 0–1, internal heuristic
  signals: ConnectionSignal[];
  explanation: string; // Human-readable, no psychological inference
  strength: ConnectionStrength;
  evidence?: ConnectionEvidence;
}
