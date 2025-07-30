import { prisma } from '../db.js';

describe('User Model Integration', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a user and retrieve it', async () => {
    const email = 'testuser@example.com';
    const name = 'Test User';
    const passwordHash = 'hashedpassword';
    const user = await prisma.user.create({
      data: { email, name, passwordHash }
    });
    expect(user.email).toBe(email);
    expect(user.name).toBe(name);
    expect(user.passwordHash).toBe(passwordHash);

    const found = await prisma.user.findUnique({ where: { email } });
    expect(found).not.toBeNull();
    expect(found?.id).toBe(user.id);
  });

  afterEach(async () => {
    await prisma.user.deleteMany({ where: { email: 'testuser@example.com' } });
  });
});
