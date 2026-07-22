export function withLogging<T extends (...args: any[]) => any>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("[Logger Error]", err);
      throw err;
    }
  }) as T;
}
