export type MentorshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface MentorshipRequestDTO {
  id: string;
  mentorId: string;
  menteeId: string;
  status: MentorshipStatus;
  message: string;
  createdAt: string;
}

export interface CreateMentorshipRequestDTO {
  mentorId: string;
  message: string;
}

export interface UpdateMentorshipStatusDTO {
  status: MentorshipStatus;
}
