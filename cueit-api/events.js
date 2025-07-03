const { EventEmitter } = require('events');

// Singleton event bus used by the backend to broadcast state changes
module.exports = new EventEmitter();
