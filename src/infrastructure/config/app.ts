import express from 'express'
import cors from 'cors'

import authRouter from '../routes/authRouter'
import authRouterV2 from '../routes/v2/authRouter'
import userRouter from '../routes/userRouter'
import employerRouter from '../routes/employerRouter'
import adminRouter from '../routes/adminRouter'
import jobsRouter from '../routes/jobsRouter'
import postsRouter from '../routes/postsRouter'
import jobApplicantsRouter from '../routes/jobApplicantsRouter'
import chatRouter from '../routes/chatRouter'
import errorMiddleware from '../../middlewares/errorHandler'

export const createServer = () => {

    try {
        const app = express()
        app.use(express.json())
        app.use(cors({
            origin: process.env.ORIGIN_URL as string,
            methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials:true
        }))
        app.get('/health', (_req, res) => {
            res.status(200).json({
                status: 'ok',
                timestamp: new Date().toISOString()
            })
        })

        app.use('/api/auth', authRouter)
        app.use('/api/v2/auth', authRouterV2)
        
        app.use('/api/users', userRouter)
        app.use('/api/employers', employerRouter)
        app.use('/api/admin', adminRouter)
        app.use('/api/jobs', jobsRouter)
        app.use('/api/posts', postsRouter)
        app.use('/api/job-applicants', jobApplicantsRouter)
        app.use('/api/chat', chatRouter)

        app.use(errorMiddleware)

        return app        
    } catch (error) {
        console.error(error);
    }

}
