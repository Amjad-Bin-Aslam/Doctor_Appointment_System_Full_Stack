import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorList = () => {

  const { getAllDoctors, doctors, aToken } = useContext(AdminContext)

  useEffect(()=>{
    if(aToken){
      getAllDoctors();
    }
  }, [aToken])

  return (

    <div>
      
      <h1>All Docotrs</h1>

      <div>
        {
          doctors.map((item , index)=>(
            <div key={index}>
              <img src={item.image} alt="" />
              <div>
                <p> {item.name} </p>
                <p> {item.speciality} </p>
              </div>
            </div>
          ))
        }
      </div>

    </div>

  )
}

export default DoctorList
