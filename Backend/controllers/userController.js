import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// create the new user
const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing details." })
        }

        // validating the email format 
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter thee valid email." })
        }

        // validating the strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter the strong password." })
        }

        // hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // creating the user
        const userData = {
            name,
            email,
            password: hashedPassword
        }
        const newUser = new userModel(userData)
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// user login
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist." })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            return res.json({ success: true, token })
        } else {
            return res.json({ success: false, message: "Invalid credentials." })
        }

    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }

}


//for user profile data
const getProfile = async (req, res) => {

    try {

        // const { userId } = req.body;

        // added from gpt
        const userId = req.user.id;

        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}



// update user profile
const updateProfile = async (req, res) => {

    try {

        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;
        const userId = req.user.id;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Missing details." })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        // if (imageFile) {

        //     //upload image at cloudinary
        //     const uploadImage = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
        //     // get image url from cloudinary and save to the database
        //     const imageUrl = uploadImage.secure_url

        //     await userModel.findByIdAndUpdate(userId , { image: imageUrl })
        // }

        // from gpt
        if (imageFile) {
            try {
                const uploadImage = await cloudinary.uploader.upload(imageFile.path, {
                    resource_type: 'image',
                    timeout: 60000 // optional: 60 sec timeout
                });

                const imageUrl = uploadImage.secure_url;

                await userModel.findByIdAndUpdate(userId, { image: imageUrl });
            } catch (uploadErr) {
                console.error("Cloudinary upload failed:", uploadErr);
                return res.json({ success: false, message: "Image upload failed, please try again." });
            }
        }


        res.json({ success: true, message: "Profile Updated." })



    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}



// api for booking the appointment
const bookAppointment = async (req, res) => {

    try {

        const userId = req.user.id;
        const { docId, slotDate, slotTime } = req.body;

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({ success: false, message: "Doctor not available." })
        }

        let slots_booked =  docData.slots_booked
        
        // checking for slots availability
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                 return res.json({ success: false, message: "Slots not available." })
            }else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password') 
 
        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        };
        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        // save new slots data in doctor data
        await doctorModel.findByIdAndUpdate(docId, {slots_booked})

        res.json({ success: true, message: "Appointemnt Booked." })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}



// list of user booked_appointment
const listAppointment = async (req , res) => {

    try {
        
        const userId = req.user.id;

        const appointments = await appointmentModel.find({userId})

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false , message: error.message })
    }

}



// cancel the user Appointments
const cancelAppointments = async (req , res) => {

    try {

        const userId = req.user.id;
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user
        if(appointmentData.userId !== userId){
            return res.json({ success: false, message: "Unauthorized action" })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled: true})

        // releasing the doctor slot
        const {docId, slotDate, slotTime} = appointmentData;
        const doctorData = await doctorModel.findById(docId) 

        const slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e=> e!== slotTime)

        await doctorModel.findByIdAndUpdate(docId ,{slots_booked})

        res.json({ success: true, message: "Appointment Cancelled." })

        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// payment method for stripe
const bookAppointmentStripe = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const { origin } = req.headers;

    // Get existing appointment
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found." });
    }

    // Get doctor data
    const docData = await doctorModel.findById(appointment.docId);
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found." });
    }

    // Create Stripe Checkout session
    const line_items = [
      {
        price_data: {
          currency: process.env.CURRENCY.toLowerCase(),
          product_data: { name: `Appointment with Dr. ${docData.name}` },
          unit_amount: appointment.amount * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&appointmentId=${appointment._id}`,
      cancel_url: `${origin}/verify?success=false&appointmentId=${appointment._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url, session });
  } catch (error) {
    console.log("Stripe appointment error:", error);
    res.json({ success: false, message: error.message });
  }
};



// verify stripe
const verifyStripeAppointment = async (req, res) => {
  try {
    const { appointmentId, success } = req.body;
    const userId = req.user.id;

    if (success === true || success === "true") {
      // Mark payment as done
      await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });

      // Block doctor’s slot
      const appointment = await appointmentModel.findById(appointmentId);
      const { docId, slotDate, slotTime } = appointment;

      const doctorData = await doctorModel.findById(docId);
      let slots_booked = doctorData.slots_booked;

      if (!slots_booked[slotDate]) slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);

      await doctorModel.findByIdAndUpdate(docId, { slots_booked });

      res.json({ success: true, message: "Appointment confirmed and paid." });
    } else {
      //  Delete unpaid appointment
      await appointmentModel.findByIdAndDelete(appointmentId);
      res.json({ success: false, message: "Payment failed or cancelled." });
    }
  } catch (error) {
    console.log("Verify Stripe Appointment Error:", error);
    res.json({ success: false, message: error.message });
  }
};




export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookAppointment, 
    listAppointment,
    cancelAppointments,
    bookAppointmentStripe,
    verifyStripeAppointment,
}


