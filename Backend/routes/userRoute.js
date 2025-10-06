import express from 'express'
import { bookAppointment, bookAppointmentStripe, cancelAppointments, getProfile, listAppointment, loginUser, registerUser, updateProfile, verifyStripeAppointment, } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();


// endpoint
userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)

userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', authUser, upload.single('image'), updateProfile)
userRouter.post('/book-appointment', authUser, bookAppointment)
userRouter.get('/appointments', authUser, listAppointment)
userRouter.post('/cancel-appointment', authUser, cancelAppointments)


// payment
userRouter.post('/book-appointment-strip', authUser, bookAppointmentStripe)
userRouter.post('/verify-stripe-appointment', authUser,verifyStripeAppointment ) 


export default userRouter;