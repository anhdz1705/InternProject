import axiosClient from './axiosClient'

export const getReports = async (params = {}) => {
  const response = await axiosClient.get('/reports/', { params })
  return response.data
}

export const exportReportCsv = async (params = {}) => {
  const response = await axiosClient.get('/reports/export/', {
    params,
    responseType: 'blob',
  })
  return response
}
