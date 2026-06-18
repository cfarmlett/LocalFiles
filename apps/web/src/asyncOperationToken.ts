export type AsyncOperationToken = number;

export type AsyncOperationTracker = Readonly<{
  begin: () => AsyncOperationToken;
  invalidate: () => void;
  isCurrent: (token: AsyncOperationToken) => boolean;
}>;

export function createAsyncOperationTracker(): AsyncOperationTracker {
  let currentToken = 0;

  return {
    begin() {
      currentToken += 1;
      return currentToken;
    },
    invalidate() {
      currentToken += 1;
    },
    isCurrent(token) {
      return token === currentToken;
    },
  };
}
