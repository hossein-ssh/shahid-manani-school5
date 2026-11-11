import crypto from 'crypto';

interface CaptchaItem {
  solution: string;
  expiresAt: number;
}

// In-memory store for active captcha challenges
const captchaStore = new Map<string, CaptchaItem>();

// Clean up expired captchas every 3 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, item] of captchaStore.entries()) {
    if (item.expiresAt < now) {
      captchaStore.delete(id);
    }
  }
}, 3 * 60 * 1000);
if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

// Characters for captcha (unambiguous, clear uppercase and numbers)
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

// Persian/Arabic digit conversion table
const digitMap: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

export function normalizeInput(input: string): string {
  let normalized = input.trim();
  for (const [faDigit, enDigit] of Object.entries(digitMap)) {
    normalized = normalized.split(faDigit).join(enDigit);
  }
  return normalized.toUpperCase();
}

/**
 * Generate a new Captcha with SVG image and token
 */
export function generateCaptcha(): { captchaId: string; svg: string; solution: string } {
  const length = 5;
  let solution = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * CAPTCHA_CHARS.length);
    solution += CAPTCHA_CHARS[idx];
  }

  const captchaId = `cap_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  // 5 minutes expiry
  captchaStore.set(captchaId, {
    solution,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const width = 150;
  const height = 46;

  // Generate SVG lines (noise)
  const noiseLines: string[] = [];
  const lineColors = ['#94a3b8', '#6366f1', '#3b82f6', '#8b5cf6', '#cbd5e1'];
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * 20);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(width - Math.random() * 20);
    const y2 = Math.floor(Math.random() * height);
    const cx = Math.floor(width / 2 + (Math.random() * 40 - 20));
    const cy = Math.floor(height / 2 + (Math.random() * 30 - 15));
    const stroke = lineColors[i % lineColors.length];
    noiseLines.push(
      `<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" stroke="${stroke}" stroke-width="${1 + Math.random() * 1.5}" fill="none" opacity="0.6"/>`
    );
  }

  // Generate noise dots
  const dots: string[] = [];
  for (let i = 0; i < 24; i++) {
    const dx = Math.floor(Math.random() * width);
    const dy = Math.floor(Math.random() * height);
    const r = (Math.random() * 1.5 + 0.5).toFixed(1);
    dots.push(`<circle cx="${dx}" cy="${dy}" r="${r}" fill="#64748b" opacity="0.35"/>`);
  }

  // Render individual distorted characters
  const charElements: string[] = [];
  const charColors = ['#1e293b', '#312e81', '#1e40af', '#0f766e', '#4338ca', '#334155'];

  for (let i = 0; i < length; i++) {
    const char = solution[i];
    const x = 18 + i * 24 + (Math.random() * 4 - 2);
    const y = 30 + (Math.random() * 6 - 3);
    const rotate = Math.floor(Math.random() * 26 - 13);
    const color = charColors[(i + Math.floor(Math.random() * 3)) % charColors.length];
    const fontSize = 22 + Math.floor(Math.random() * 4);

    charElements.push(
      `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="900" font-family="monospace, sans-serif" fill="${color}" transform="rotate(${rotate} ${x} ${y})" letter-spacing="2">${char}</text>`
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="select-none rounded-lg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="50%" stop-color="#f1f5f9" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" rx="8" />
    <rect width="${width}" height="${height}" fill="none" stroke="#cbd5e1" stroke-width="1" rx="8" />
    ${dots.join('')}
    ${noiseLines.join('')}
    ${charElements.join('')}
  </svg>`.trim();

  return { captchaId, svg, solution };
}

/**
 * Verify a Captcha answer and immediately invalidate the challenge token
 */
export function verifyCaptcha(
  captchaId: string,
  userAnswer: string
): { valid: boolean; reason?: 'MISSING' | 'EXPIRED' | 'MISMATCH' } {
  if (!captchaId || !userAnswer) {
    return { valid: false, reason: 'MISSING' };
  }

  const item = captchaStore.get(captchaId);
  if (!item) {
    return { valid: false, reason: 'EXPIRED' };
  }

  // Remove immediately (single use)
  captchaStore.delete(captchaId);

  if (Date.now() > item.expiresAt) {
    return { valid: false, reason: 'EXPIRED' };
  }

  const normalizedUser = normalizeInput(userAnswer);
  const normalizedSolution = normalizeInput(item.solution);

  if (normalizedUser === normalizedSolution) {
    return { valid: true };
  }

  return { valid: false, reason: 'MISMATCH' };
}
