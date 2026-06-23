/**
 * Error carrying an HTTP status code. The global errorHandler reads `.status`
 * and serialises `{ error: message }`, so throwing one of these anywhere in a
 * controller/model produces a uniform JSON error response.
 */
export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export const badRequest = (message: string) => new HttpError(400, message)
export const notFound = (message: string) => new HttpError(404, message)
