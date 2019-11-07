export const getSecondsTaken = async (task: Function): Promise<number> => {
  const start = new Date();
  await task();
  const end = new Date();
  return (end.getTime() - start.getTime()) / 1000;
};
