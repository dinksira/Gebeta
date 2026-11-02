describe('Onboarding Username Validation', () => {
  const validate = (name: string): string | null => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return null;
    if (trimmed.length < 3) return 'errorShort';
    if (trimmed.length > 16) return 'errorLong';
    const validRegex = /^[\p{L}\p{N}\s]+$/u;
    if (!validRegex.test(trimmed)) {
      return 'errorChars';
    }
    if (['admin', 'moderator', 'system', 'root'].includes(trimmed.toLowerCase())) {
      return 'errorBlocked';
    }
    return null;
  };

  it('rejects names shorter than 3 characters', () => {
    expect(validate('ab')).toBe('errorShort');
  });

  it('rejects names longer than 16 characters', () => {
    expect(validate('a'.repeat(17))).toBe('errorLong');
  });

  it('accepts valid 3 to 16 character names', () => {
    expect(validate('Tesfaye')).toBeNull();
    expect(validate('ገበጣ')).toBeNull();
    expect(validate('Player1')).toBeNull();
  });

  it('rejects blocked words', () => {
    expect(validate('admin')).toBe('errorBlocked');
  });
});
