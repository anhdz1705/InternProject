import axiosClient from './axiosClient'

export const getSuppliers = async (params = {}) => {
  const response = await axiosClient.get('/suppliers/', { params })
  return response.data
}
