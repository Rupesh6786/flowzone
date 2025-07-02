
export interface Problem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  code: {
    // paths to code files
    c?: string;
    cpp?: string;
    py?: string;
  };
  flowchart: string; // Mermaid syntax OR ReactFlow JSON string
  stats: {
    likes: number;
    saves: number;
  };
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string; // ISO 8601 string
}
