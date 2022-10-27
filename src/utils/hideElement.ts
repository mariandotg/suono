export const hideElement = (
  elementId: string,
  elementCurrentDisplay: string
) => {
  const element = document.getElementById(elementId);
  element!.classList.replace(elementCurrentDisplay, 'hidden');
};
