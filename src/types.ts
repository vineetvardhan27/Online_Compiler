export type Theme = 'light' | 'dark';
export type Language = 'javascript' | 'python';

export interface CompilerState {
  code: string;
  language: Language;
  input: string;
  output: string;
  isRunning: boolean;
  error: string | null;
  theme: Theme;
}

export interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
  memoryUsage: number;
}