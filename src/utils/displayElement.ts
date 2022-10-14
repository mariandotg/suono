export const displayElement = (elementId: string, elementDisplay: string) => {
  const element = document.getElementById(elementId);
  element!.classList.replace('hidden', elementDisplay);
};
