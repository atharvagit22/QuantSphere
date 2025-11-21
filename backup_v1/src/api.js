import axios from 'axios'


const api = axios.create({ baseURL: '/api' })


export async function uploadCsv(file) {
const form = new FormData()
form.append('file', file)
const res = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
return res.data
}


export async function fetchData() {
const res = await api.get('/data')
return res.data
}


export async function downloadCsv() {
const res = await api.get('/download', { responseType: 'blob' })
return res
}