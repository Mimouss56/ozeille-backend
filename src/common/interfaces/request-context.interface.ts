export interface RequestContext<T> {
  userId: string;
  method: string;
  input: T;
}
