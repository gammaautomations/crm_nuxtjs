// useSweetAlert.ts

import Swal from 'sweetalert2'

export const useSweetAlert = () => {
  const swalConfirmation = async (data: any) => {
    return new Promise(resolve => {
      Swal.fire({
        title: data.title,
        text: data.text,
        icon: data.icon,
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#0074BA',
        cancelButtonColor: '#FA896B',
      }).then(result => {
        resolve(result.isConfirmed)
      })
    })
  }

  return {
    swalConfirmation,
  }
}
