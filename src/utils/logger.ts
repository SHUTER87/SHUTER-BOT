const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const GRAY = "\x1b[90m";

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string): void {
    console.log(`${GRAY}[${timestamp()}]${RESET} ${CYAN}[INFO]${RESET} ${message}`);
  },
  success(message: string): void {
    console.log(`${GRAY}[${timestamp()}]${RESET} ${GREEN}[OK]${RESET}  ${message}`);
  },
  warn(message: string): void {
    console.warn(`${GRAY}[${timestamp()}]${RESET} ${YELLOW}[WARN]${RESET} ${message}`);
  },
  error(message: string, err?: unknown): void {
    console.error(`${GRAY}[${timestamp()}]${RESET} ${RED}[ERR]${RESET}  ${message}`);
    if (err) console.error(err);
  },
};
