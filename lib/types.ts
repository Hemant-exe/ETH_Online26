// Course type definition
export interface Course {
    id: number;
    title: string;
    topics: TopicItem[];
    uploadedFiles: UploadedFile[];
    courseThumbnail: string | null;
  }
  
  interface UploadedFile {
    type: string;
    name: string;
    url: string;
    topicId: string;
    dateAdded: string;
  }
  
  interface FileReference {
    id: string;
    type: string;
    name: string;
    topicId: string;
    dateAdded: string;
  }
  
  interface TopicItem {
    id: string;
    title: string;
    isExpanded?: boolean;
    children?: TopicItem[];
    uploadedFiles?: FileReference[];
  }
  
  // QuizQuestion type definition
  export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }
  
  // AIGeneratedContent type definition
  export interface AIGeneratedContent {
    type: 'notes' | 'video' | 'image' | 'audio';
    content: string;
    topicId: string;
  }
  
  // TranslationRequest type definition
  export interface TranslationRequest {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
  }
  
  // TranslationResponse type definition
  export interface TranslationResponse {
    translatedText: string;
    detectedLanguage?: string;
  }