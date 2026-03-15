// useToastNotification.ts

import { useToast } from 'vue-toastification'

const useToastNotification = () => {
  const toast = useToast()

  const ToastMsg = (msg: string, time: number) => {
    toast(msg, {
      timeout: time,
    })
  }

  const ToastMsgError = (msg: string, time: number) => {
    toast.error(msg, {
      timeout: time,
    })
  }

  const ToastMsgWarning = (msg: string, time: number) => {
    toast.warning(msg, {
      timeout: time,
    })
  }

  const ToastMsgInfo = (msg: string, time: number) => {
    toast.info(msg, {
      timeout: time,
    })
  }

  const ToastMsgSuccess = (msg: string, time: number) => {
    toast.success(msg, {
      timeout: time,
    })
  }

  return {
    ToastMsg,
    ToastMsgError,
    ToastMsgWarning,
    ToastMsgInfo,
    ToastMsgSuccess,
  }
}

export default useToastNotification
