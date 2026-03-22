export const useApi = () => {
  const handleError = (error: any): string => {
    if (error?.data?.message)
      return error.data.message

    if (error?.message)
      return error.message

    return 'Ha ocurrido un error inesperado'
  }

  const post = async <T>(url: string, body: object): Promise<T> => {
    return await $fetch<T>(url, {
      method: 'POST',
      body,
    })
  }

  const get = async <T>(url: string, params?: object): Promise<T> => {
    return await $fetch<T>(url, {
      method: 'GET',
      params,
    })
  }

  const patch = async <T>(url: string, body: object): Promise<T> => {
    return await $fetch<T>(url, {
      method: 'PATCH',
      body,
    })
  }

  const remove = async <T>(url: string): Promise<T> => {
    return await $fetch<T>(url, {
      method: 'DELETE',
    })
  }

  return {
    post,
    get,
    patch,
    remove,
    handleError,
  }
}
