export interface Message {
  _id: string;
  text: string;
  timestamp: number;
  isSent: boolean;
  author: string;
  authorId: string;
  authorColor: string;
}

export interface User {
  id: string;
  username: string;
  color: string;
}
