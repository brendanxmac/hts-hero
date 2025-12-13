export interface Tab {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface IconTab<T> {
  value: T;
  icon: React.ReactNode;
  text?: string;
}
