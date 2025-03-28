// // TODO: generic: move this to a types.ts file
// export type QueryOptions<T> = Partial<
//   Record<keyof Partial<T>, string | RegExp>
// >;
// mappa tutte le proprietà di T come opzionali su valore string o regexp
export type QueryOptions<T> = Record<keyof T, string>;
