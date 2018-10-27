export function back(ifNoHistory: () => void): void {
  if (history.length > 1) {
    history.back();
    return;
  }
  ifNoHistory();
}