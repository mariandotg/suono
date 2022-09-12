export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time) - minutes * 60;

  const formatSingleDigits = (a: number) => (a < 10 ? `0${a}` : a).toString();

  const formattedMinutes = formatSingleDigits(minutes);
  const formattedSeconds = formatSingleDigits(seconds);

  return `${formattedMinutes}:${formattedSeconds}`;
};
