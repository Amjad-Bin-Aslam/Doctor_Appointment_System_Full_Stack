import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments } = useContext(DoctorContext)

  useEffect(()=> { 
    if(dToken){
      getAppointments();
    }
  },[dToken])

  return (
    <div>
      
    <p>All Appointments</p>

    <div>

      <div>
        <p>#</p>
        <p>Patient</p>
        <p>Payemnt</p>
        <p>Age</p>
        <p>Date & Time</p>
        <p>Fees</p>
        <p>Action</p>
      </div>

    </div>

    </div>
  )
}

export default DoctorAppointments
