export const formatId = (id: number) => {
  const a = id.toString().split('_');
  return a[1];
};
