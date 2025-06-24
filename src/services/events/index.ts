/**
 * Event services index
 * Exports all event-related services and types
 */

// Event creation
export { createEvent, type EventFormData } from './eventCreateService';

// Event fetching
export { 
  fetchEventById, 
  fetchEvents, 
  type EventSearchParams 
} from './eventFetchService';

// Event notifications
export { 
  addEventNotificationEmail, 
  fetchEventNotificationEmails 
} from './eventNotificationService';

// Event sorting and filtering
export { 
  sortEvents, 
  filterEvents, 
  type EventSortOptions 
} from './eventSortFilterService';