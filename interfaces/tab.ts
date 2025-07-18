export interface Tab {
  label: string;
  value: string;
}

export interface IconTab<T> {
  value: T;
  icon: React.ReactNode;
  text?: string;
}
