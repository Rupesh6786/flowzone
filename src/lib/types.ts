export interface Problem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  code: {
    c?: string;
    cpp?: string;
    py?: string;
  };
  flowchart: string; // Mermaid syntax
  stats: {
    likes: number;
    saves: number;
    solutions: {
      c: number;
      cpp: number;
      py: number;
    }
  };
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}
