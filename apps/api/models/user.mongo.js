```javascript
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  // ...existing fields...
  isDefault: {
    type: Boolean,
    default: false,
  },
  // ...existing fields...
});

const User = mongoose.model('User', userSchema);

export default User;
```