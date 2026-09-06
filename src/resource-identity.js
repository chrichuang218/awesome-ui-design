const palette = [
  ['#edf1ff', '#435aa3'], ['#f5eefa', '#8250a0'], ['#e9f4ef', '#397655'],
  ['#fcf0e8', '#9a623a'], ['#faedf1', '#a64c6a'], ['#e7f3f8', '#36768f']
];
const shortNames = {
  r19: 'SK', r20: 'DP', r21: 'USP', r22: 'UPA', r23: 'GD', r24: 'UX',
  r53: 'FD', r54: 'UX', r55: 'CD', r56: 'FDP', r58: 'DT', r59: 'HV',
  r62: 'WD', r63: 'EK', r64: 'GS', r65: 'SK', r66: 'AS'
};
export function resourceIdentity(resource) {
  const clean = resource.name.replace(/[（(].*?[)）]/g, '').trim();
  const words = clean.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[\s._/–-]+/).filter(Boolean);
  const monogram = shortNames[resource.id] || (words.length > 1
    ? words.slice(0, 3).map(word => Array.from(word)[0]).join('')
    : Array.from(clean).slice(0, 2).join('')).toLocaleUpperCase();
  const hash = Array.from(resource.name).reduce((value, char) => (value * 31 + char.codePointAt(0)) >>> 0, 0);
  const [background, color] = palette[hash % palette.length];
  const url = new URL(resource.url);
  const origin = url.hostname === 'github.com' ? `GitHub · ${url.pathname.split('/')[1]}` : url.hostname.replace(/^www\./, '');
  return { monogram, background, color, origin };
}
