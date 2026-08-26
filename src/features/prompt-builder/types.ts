export type ContentType = 'standard' | 'podcast' | 'animasi' | 'pov' | 'goyang';
export type PromptTab = 'Dialog' | 'Gambar' | 'Prompt Flow';

export interface PromptField {
  id: string;
  label: string;
  options: string[];
}

export interface ContentTypeOption {
  id: ContentType;
  label: string;
  shortLabel: string;
  description: string;
  tabs: PromptTab[];
  fields: PromptField[];
  info: string;
}

export interface PromptFormData {
  contentType: ContentType;
  activeTab: PromptTab;
  values: Record<string, string>;
  context: string;
}
