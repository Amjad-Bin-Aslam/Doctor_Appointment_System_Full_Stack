import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

  const { getDashData, dashData, dToken, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    getDashData()
  }, [dToken])

  return dashData && (
    <div className='m-3 sm:m-5'>

      {/* ====== Top Summary Cards ====== */}
      <div className='flex flex-wrap justify-center sm:justify-start gap-4'>

        {/* Earnings Card */}
        <div className='flex items-center gap-3 bg-white p-4 sm:p-5 rounded-lg border border-gray-100 
                        min-w-[180px] sm:min-w-[200px] shadow-sm hover:scale-105 transition-all duration-200'>
          <img className='w-10 sm:w-14 flex-shrink-0' src={assets.earning_icon} alt="Earnings" />
          <div>
            <p className='text-lg sm:text-xl font-semibold text-gray-700'>
              {currency} {dashData.earning}
            </p>
            <p className='text-gray-500 text-sm'>Earnings</p>
          </div>
        </div>

        {/* Appointments Card */}
        <div className='flex items-center gap-3 bg-white p-4 sm:p-5 rounded-lg border border-gray-100 
                        min-w-[180px] sm:min-w-[200px] shadow-sm hover:scale-105 transition-all duration-200'>
          <img className='w-10 sm:w-14 flex-shrink-0' src={assets.appointments_icon} alt="Appointments" />
          <div>
            <p className='text-lg sm:text-xl font-semibold text-gray-700'>
              {dashData.appointments}
            </p>
            <p className='text-gray-500 text-sm'>Appointments</p>
          </div>
        </div>

        {/* Patients Card */}
        <div className='flex items-center gap-3 bg-white p-4 sm:p-5 rounded-lg border border-gray-100 
                        min-w-[180px] sm:min-w-[200px] shadow-sm hover:scale-105 transition-all duration-200'>
          <img className='w-10 sm:w-14 flex-shrink-0' src={assets.patients_icon} alt="Patients" />
          <div>
            <p className='text-lg sm:text-xl font-semibold text-gray-700'>
              {dashData.patients}
            </p>
            <p className='text-gray-500 text-sm'>Patients</p>
          </div>
        </div>

      </div>


      {/* ====== Latest Bookings Section ====== */}
      <div className='bg-white p-3 sm:p-4 mt-4 rounded-lg shadow-sm'>

        <div className='flex items-center gap-2.5 px-3 sm:px-4 py-3 border-b border-gray-200'>
          <img className='w-5 sm:w-6' src={assets.list_icon} alt="List" />
          <p className='font-semibold text-gray-700'>Latest Bookings</p>
        </div>

        <div className='pt-3 sm:pt-4'>
          {dashData.latestAppointment?.map((item, index) => (
            <div key={index} className='flex items-center px-3 sm:px-6 gap-3 sm:gap-4 py-2 hover:bg-gray-50 transition'>
              <img
                className='rounded-full w-10 h-10 sm:w-12 sm:h-12 object-cover bg-gray-200 flex-shrink-0'
                src={item.userData?.image || assets.default_user}
                alt="User"
              />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData?.name}</p>
                <p className='text-gray-500 text-xs sm:text-sm'>{slotDateFormat(item.slotDate)}</p>
              </div>

              {item.cancelled ? (
                <p className='text-red-500 text-xs font-medium'>Cancelled</p>
              ) : item.isCompleted ? (
                <p className='text-green-500 text-xs font-medium'>Completed</p>
              ) : (
                <div className='flex items-center gap-2'>
                  <img
                    onClick={() => cancelAppointment(item._id)}
                    className='w-7 sm:w-8 cursor-pointer'
                    src={assets.cancel_icon}
                    alt="Cancel"
                  />
                  <img
                    onClick={() => completeAppointment(item._id)}
                    className='w-7 sm:w-8 cursor-pointer'
                    src={assets.tick_icon}
                    alt="Complete"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default DoctorDashboard
