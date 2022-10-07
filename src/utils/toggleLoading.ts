export const toggleLoading = (elementId: string, isLoading: boolean) => {
  const element = document.getElementById(elementId);
  if (isLoading) {
    element?.classList.replace('invisible', 'visible');
    element?.classList.replace('opacity-0', 'opacity-100');
  } else {
    element?.classList.replace('visible', 'invisible');
    element?.classList.replace('opacity-100', 'opacity-0');
  }
};
