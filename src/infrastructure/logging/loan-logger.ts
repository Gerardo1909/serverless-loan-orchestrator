import * as fs from 'node:fs';
import * as path from 'node:path';

export interface LogContext {
  requestId?: string;
  loanId?: string;
  correlationId?: string;
}

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  loanId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export class LoanLogger {
  constructor(private readonly context: LogContext) {}

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('INFO', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('WARN', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log('ERROR', message, metadata);
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(this.context.requestId !== undefined ? { requestId: this.context.requestId } : {}),
      ...(this.context.loanId !== undefined ? { loanId: this.context.loanId } : {}),
      ...(this.context.correlationId !== undefined ? { correlationId: this.context.correlationId } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
    };

    const line = JSON.stringify(entry);
    console.log(line);
    this.appendToFile(line);
  }

  // Persists log entry to a local daily file for development observability.
  // Silently fails in Lambda environments where the filesystem is read-only.
  private appendToFile(line: string): void {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const dir = path.join(process.cwd(), 'data', 'logs');
      fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(path.join(dir, `${date}.log`), line + '\n', 'utf8');
    } catch {
      // Non-critical: file logging is a local dev convenience, not required for correctness
    }
  }
}
