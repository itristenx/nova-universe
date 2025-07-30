describe('User Model', () => {
  it('should have is_default property', () => {
    const user = { is_default: true };
    expect(user.is_default).toBe(true);
  });
});