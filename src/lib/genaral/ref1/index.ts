export default function generateShortUuid(): string {
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  let lettersPart = '';
  for (let i = 0; i < 4; i++) {
    lettersPart += lowercaseLetters.charAt(Math.floor(Math.random() * lowercaseLetters.length));
  }

  let numbersPart = '';
  for (let i = 0; i < 6; i++) {
    numbersPart += Math.floor(Math.random() * 10).toString();
  }

  return `${lettersPart}${numbersPart}`;
}
