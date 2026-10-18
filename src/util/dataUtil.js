export function isNameFieldValid(array, name, excludeId) {
  const normalised = name.trim().toUpperCase();

  if (!normalised) {
    return {
      valid: false,
      reason: "Name must contain characters other than whitespace.",
    };
  }

  const isDuplicate = array.some(
    (p) => p.id !== excludeId && p.name.toUpperCase() === normalised,
  );

  if (isDuplicate) {
    return { valid: false, reason: "Name already in use." };
  }

  return { valid: true };
}
