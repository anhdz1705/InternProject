import axiosClient from './axiosClient'

export const getCategories = async (params = {}) => {
  const response = await axiosClient.get('/categories/', { params })
  return response.data
}
