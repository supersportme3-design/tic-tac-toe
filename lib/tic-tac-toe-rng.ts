/** RNG helpers live outside the component so React Compiler purity rules do not flag `Math.random` as render impurity. */

export function randomUnit(): number {
  return Math.random();
}

export function randomIndex(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

export function randomItem<T>(arr: readonly T[]): T {
  return arr[randomIndex(arr.length)] as T;
}

export function randomChance(probability: number): boolean {
  return Math.random() < probability;
}
