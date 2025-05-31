import express from 'express'
import cors from 'cors'
import { verifyJwt } from './middleware/auth'
import {meRoute} from './routes/me'


const app = express()
app.use(cors())
app.use(express.json())

app.use(verifyJwt)
app.use(meRoute)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
console.log(`auth-service running on http://localhost:${PORT}`)
})