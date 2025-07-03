import { EventEmitter } from 'events';

// Singleton event bus used by the backend to broadcast state changes
export default new EventEmitter();
