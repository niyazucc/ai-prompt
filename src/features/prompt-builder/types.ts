export type ContentType = 'sales' | 'social' | 'email' | 'product' | 'video';

export interface PromptFormData {
  contentType: ContentType;
  product: string;
  audience: string;
  channel: string;
  tone: string;
  goal: string;
  context: string;
}

export interface ContentTypeOption {
  id: ContentType;
  label: string;
  shortLabel: string;
  description: string;
}
