type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  meta?: Record<string, any>
  userId?: string
  requestId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development"

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, meta, userId, requestId } = entry
    const metaStr = meta ? JSON.stringify(meta) : ""
    const userStr = userId ? `[User: ${userId}]` : ""
    const reqStr = requestId ? `[Req: ${requestId}]` : ""

    return `${timestamp} [${level.toUpperCase()}] ${userStr}${reqStr} ${message} ${metaStr}`
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>, userId?: string, requestId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      userId,
      requestId,
    }

    const formattedLog = this.formatLog(entry)

    if (this.isDevelopment) {
      console.log(formattedLog)
    } else {
      // In production, you might want to send logs to a service like DataDog, LogRocket, etc.
      console.log(formattedLog)
    }
  }

  debug(message: string, meta?: Record<string, any>, userId?: string, requestId?: string) {
    if (this.isDevelopment) {
      this.log("debug", message, meta, userId, requestId)
    }
  }

  info(message: string, meta?: Record<string, any>, userId?: string, requestId?: string) {
    this.log("info", message, meta, userId, requestId)
  }

  warn(message: string, meta?: Record<string, any>, userId?: string, requestId?: string) {
    this.log("warn", message, meta, userId, requestId)
  }

  error(message: string, meta?: Record<string, any>, userId?: string, requestId?: string) {
    this.log("error", message, meta, userId, requestId)
  }

  // Audit logging for sensitive operations
  audit(action: string, userId: string, details?: Record<string, any>, requestId?: string) {
    this.info(`AUDIT: ${action}`, { ...details, audit: true }, userId, requestId)
  }
}

export const logger = new Logger()
