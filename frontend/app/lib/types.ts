// lib/types.ts
export interface TrainingRequest {
    industry_focus: string;        // ← Changed from 'industry' to 'industry_focus'
    regulatory_framework: string;
    training_level: string;
  }
  
  export interface TrainingResponse {
    session_id: string;            // ← Changed from 'id' to 'session_id'
    status: string;
    message: string;
  }
  
  export interface TrainingStatus {
    session_id: string;            // ← Changed from 'id' to 'session_id'
    status: 'created' | 'started' | 'completed' | 'failed';
    progress: number;
    current_step: string;
    created_at: string;
    completed_at?: string;
    error?: string;
  }