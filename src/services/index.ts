/**
 * Services index
 * Exports all services and types
 */

// Booking services
export { 
  createBooking, 
  getBookingById, 
  cancelBooking 
} from './booking/bookingService';

// Event services (re-export from events subdirectory)
export {
  // Event creation
  createEvent,
  type EventFormData,
  
  // Event fetching
  fetchEventById,
  fetchEvents,
  type EventSearchParams,
  
  // Event notifications
  addEventNotificationEmail,
  fetchEventNotificationEmails,
  
  // Event sorting and filtering
  sortEvents,
  filterEvents,
  type EventSortOptions
} from './events/index';

// Feedback services
export { 
  addFeedback, 
  type Feedback 
} from './admin/feedbackService';

// Message services
export {
  // Types
  type Message,
  type Conversation,
  
  // Functions
  createConversation,
  sendMessage,
  subscribeToConversations,
  subscribeToMessages,
  markConversationAsRead
} from './messages/messageService';

// Parking spot services
export { 
  fetchParkingSpotById, 
  fetchParkingSpots 
} from './parkingSpots/parkingSpotService';