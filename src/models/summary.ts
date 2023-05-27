export interface Summary {
  title: string | null;
  text: string;
  createdAt: Date;
  requestStatus: 'queued' | 'complete' | 'error';
}