export function isFulfilled<T>(val: PromiseSettledResult<T>): val is PromiseFulfilledResult<T> {
  return val.status === 'fulfilled'
}

export function inRange(num: number, min: number, max: number): boolean {
  return num >= min && num <= max
}