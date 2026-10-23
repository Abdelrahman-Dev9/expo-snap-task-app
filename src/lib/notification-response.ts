/** Pure helper — keep free of expo-notifications side effects. */
export function getTaskIdFromNotificationData(
  data: Record<string, unknown> | undefined | null,
): string | null {
  const taskId = data?.taskId;
  return typeof taskId === "string" ? taskId : null;
}
