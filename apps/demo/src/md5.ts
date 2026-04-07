// ---------------------------------------------------------------------------
// Minimal synchronous MD5 — needed to build Gravatar URLs.
// ---------------------------------------------------------------------------
const safeAdd = (x: number, y: number) => {
  const lsw = (x & 0xffff) + (y & 0xffff);
  return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff);
};
const rol = (n: number, c: number) => (n << c) | (n >>> (32 - c));

const str2binl = (s: string) => {
  const bin: number[] = [];
  for (let i = 0; i < s.length * 8; i += 8)
    bin[i >> 5] = (bin[i >> 5] ?? 0) | ((s.charCodeAt(i / 8) & 0xff) << (i % 32));
  return bin;
};
const binl2hex = (a: number[]) => {
  const h = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < a.length * 4; i++)
    s += h[(a[i >> 2]! >> ((i % 4) * 8 + 4)) & 0xf] + h[(a[i >> 2]! >> ((i % 4) * 8)) & 0xf];
  return s;
};

function md5(str: string): string {
  const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) =>
    safeAdd(rol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & c) | (~b & d), a, b, x, s, t);
  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & d) | (c & ~d), a, b, x, s, t);
  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(c ^ (b | ~d), a, b, x, s, t);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  const M = str2binl(str);
  const l = str.length * 8;
  M[l >> 5] = (M[l >> 5] ?? 0) | (0x80 << (l % 32));
  M[(((l + 64) >>> 9) << 4) + 14] = l;
  let [a, b, c, d] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  for (let i = 0; i < M.length; i += 16) {
    const [oa, ob, oc, od] = [a, b, c, d];
    a = ff(a, b, c, d, M[i + 0] ?? 0, 7, K[0]!);
    d = ff(d, a, b, c, M[i + 1] ?? 0, 12, K[1]!);
    c = ff(c, d, a, b, M[i + 2] ?? 0, 17, K[2]!);
    b = ff(b, c, d, a, M[i + 3] ?? 0, 22, K[3]!);
    a = ff(a, b, c, d, M[i + 4] ?? 0, 7, K[4]!);
    d = ff(d, a, b, c, M[i + 5] ?? 0, 12, K[5]!);
    c = ff(c, d, a, b, M[i + 6] ?? 0, 17, K[6]!);
    b = ff(b, c, d, a, M[i + 7] ?? 0, 22, K[7]!);
    a = ff(a, b, c, d, M[i + 8] ?? 0, 7, K[8]!);
    d = ff(d, a, b, c, M[i + 9] ?? 0, 12, K[9]!);
    c = ff(c, d, a, b, M[i + 10] ?? 0, 17, K[10]!);
    b = ff(b, c, d, a, M[i + 11] ?? 0, 22, K[11]!);
    a = ff(a, b, c, d, M[i + 12] ?? 0, 7, K[12]!);
    d = ff(d, a, b, c, M[i + 13] ?? 0, 12, K[13]!);
    c = ff(c, d, a, b, M[i + 14] ?? 0, 17, K[14]!);
    b = ff(b, c, d, a, M[i + 15] ?? 0, 22, K[15]!);
    a = gg(a, b, c, d, M[i + 1] ?? 0, 5, K[16]!);
    d = gg(d, a, b, c, M[i + 6] ?? 0, 9, K[17]!);
    c = gg(c, d, a, b, M[i + 11] ?? 0, 14, K[18]!);
    b = gg(b, c, d, a, M[i + 0] ?? 0, 20, K[19]!);
    a = gg(a, b, c, d, M[i + 5] ?? 0, 5, K[20]!);
    d = gg(d, a, b, c, M[i + 10] ?? 0, 9, K[21]!);
    c = gg(c, d, a, b, M[i + 15] ?? 0, 14, K[22]!);
    b = gg(b, c, d, a, M[i + 4] ?? 0, 20, K[23]!);
    a = gg(a, b, c, d, M[i + 9] ?? 0, 5, K[24]!);
    d = gg(d, a, b, c, M[i + 14] ?? 0, 9, K[25]!);
    c = gg(c, d, a, b, M[i + 3] ?? 0, 14, K[26]!);
    b = gg(b, c, d, a, M[i + 8] ?? 0, 20, K[27]!);
    a = gg(a, b, c, d, M[i + 13] ?? 0, 5, K[28]!);
    d = gg(d, a, b, c, M[i + 2] ?? 0, 9, K[29]!);
    c = gg(c, d, a, b, M[i + 7] ?? 0, 14, K[30]!);
    b = gg(b, c, d, a, M[i + 12] ?? 0, 20, K[31]!);
    a = hh(a, b, c, d, M[i + 5] ?? 0, 4, K[32]!);
    d = hh(d, a, b, c, M[i + 8] ?? 0, 11, K[33]!);
    c = hh(c, d, a, b, M[i + 11] ?? 0, 16, K[34]!);
    b = hh(b, c, d, a, M[i + 14] ?? 0, 23, K[35]!);
    a = hh(a, b, c, d, M[i + 1] ?? 0, 4, K[36]!);
    d = hh(d, a, b, c, M[i + 4] ?? 0, 11, K[37]!);
    c = hh(c, d, a, b, M[i + 7] ?? 0, 16, K[38]!);
    b = hh(b, c, d, a, M[i + 10] ?? 0, 23, K[39]!);
    a = hh(a, b, c, d, M[i + 13] ?? 0, 4, K[40]!);
    d = hh(d, a, b, c, M[i + 0] ?? 0, 11, K[41]!);
    c = hh(c, d, a, b, M[i + 3] ?? 0, 16, K[42]!);
    b = hh(b, c, d, a, M[i + 6] ?? 0, 23, K[43]!);
    a = hh(a, b, c, d, M[i + 9] ?? 0, 4, K[44]!);
    d = hh(d, a, b, c, M[i + 12] ?? 0, 11, K[45]!);
    c = hh(c, d, a, b, M[i + 15] ?? 0, 16, K[46]!);
    b = hh(b, c, d, a, M[i + 2] ?? 0, 23, K[47]!);
    a = ii(a, b, c, d, M[i + 0] ?? 0, 6, K[48]!);
    d = ii(d, a, b, c, M[i + 7] ?? 0, 10, K[49]!);
    c = ii(c, d, a, b, M[i + 14] ?? 0, 15, K[50]!);
    b = ii(b, c, d, a, M[i + 5] ?? 0, 21, K[51]!);
    a = ii(a, b, c, d, M[i + 12] ?? 0, 6, K[52]!);
    d = ii(d, a, b, c, M[i + 3] ?? 0, 10, K[53]!);
    c = ii(c, d, a, b, M[i + 10] ?? 0, 15, K[54]!);
    b = ii(b, c, d, a, M[i + 1] ?? 0, 21, K[55]!);
    a = ii(a, b, c, d, M[i + 8] ?? 0, 6, K[56]!);
    d = ii(d, a, b, c, M[i + 15] ?? 0, 10, K[57]!);
    c = ii(c, d, a, b, M[i + 6] ?? 0, 15, K[58]!);
    b = ii(b, c, d, a, M[i + 13] ?? 0, 21, K[59]!);
    a = ii(a, b, c, d, M[i + 4] ?? 0, 6, K[60]!);
    d = ii(d, a, b, c, M[i + 11] ?? 0, 10, K[61]!);
    c = ii(c, d, a, b, M[i + 2] ?? 0, 15, K[62]!);
    b = ii(b, c, d, a, M[i + 9] ?? 0, 21, K[63]!);
    a = safeAdd(a, oa);
    b = safeAdd(b, ob);
    c = safeAdd(c, oc);
    d = safeAdd(d, od);
  }
  return binl2hex([a, b, c, d]);
}

export default md5;
