const BREAKING_INPUT_DATA = [
  // space
  ' ',
];

export default function updateMention(
  key: KeyboardEvent['key'],
  prevMention: string | null,
  prefix: string
): string | null {
  // we are starting to mention
  if (key === prefix) {
    return '';
  }

  // we haven't started mentioning yet ignore input
  if (prevMention === null) return null;

  // backspace key
  if (key === 'Backspace') {
    // if we won't be left with a mention after deleting a character then we are done mentioning
    if (prevMention.length < 1) return null;

    // we are deleting a character from the mention
    const next = prevMention.slice(0, -1);

    return next;
  }

  if (key.length) {
    // we stopped mentioning
    if (BREAKING_INPUT_DATA.includes(key)) return null;

    // we are still mentioning so update the mention
    return prevMention + key;
  }

  return prevMention;
}
