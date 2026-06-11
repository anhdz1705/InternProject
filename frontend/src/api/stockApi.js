import axiosClient from './axiosClient'

export const getStockDocuments = async (params = {}) => {
  const response = await axiosClient.get('/stock-documents/', { params })
  return response.data
}

export const getStockDocument = async (id) => {
  const response = await axiosClient.get(`/stock-documents/${id}/`)
  return response.data
}

export const createStockDocument = async (data) => {
  const response = await axiosClient.post('/stock-documents/', data)
  return response.data
}
