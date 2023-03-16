import { Toast, Dialog } from 'vant';

export const showDialog = (message: string, title = '提示') => {
  Toast.clear();
  Dialog.alert({
    title,
    message: `<b>${message}</b>`,
    theme: 'round-button',
    confirmButtonText: '知道了',
  }).then(() => {
    // on close
  });
};
