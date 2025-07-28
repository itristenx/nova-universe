import { User } from '../../prisma/client';

describe('User Model', () => {
  it('should have is_default property', () => {
    const user = new User({ is_default: true });
    expect(user.is_default).toBe(true);
  });
});