export const toggleLoading = (isLoading: boolean) => {
  const element = document.getElementById('loading');
  element?.classList.replace(
    isLoading ? 'invisible' : 'visible',
    isLoading ? 'visible' : 'invisible'
  );
  element?.classList.replace(
    isLoading ? 'opacity-0' : 'opacity-100',
    isLoading ? 'opacity-100' : 'opacity-0'
  );
};
