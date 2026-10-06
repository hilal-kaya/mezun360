export interface EventDTO {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  isOnline: boolean;
  capacity: number | null;
  currentAttendees: number;
  isUserAttending: boolean;
}
