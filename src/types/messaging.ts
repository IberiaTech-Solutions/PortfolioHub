export type Conversation = {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  // Joined fields
  other_user_name?: string;
  other_user_avatar?: string;
  other_user_job_title?: string;
  unread_count?: number;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};
