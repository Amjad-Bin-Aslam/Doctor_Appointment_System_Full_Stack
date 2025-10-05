import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

const Navbar = () => {

  const { token, setToken, userData } = useContext(AppContext)

  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const logout =  async () => {
    setToken(false)
    localStorage.removeItem('token')
  }

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400'>
      {/* Logo */}
      <img
        onClick={() => navigate('/')}
        className='w-44 cursor-pointer'
        src={assets.logo}
        alt=''
      />

      {/* Desktop Menu */}
      <ul className='hidden md:flex items-start gap-5 font-medium'>
        <NavLink to='/'>
          <li className='py-1'>Home</li>
        </NavLink>
        <NavLink to='/doctors'>
          <li className='py-1'>All Doctors</li>
        </NavLink>
        <NavLink to='/about'>
          <li className='py-1'>About</li>
        </NavLink>
        <NavLink to='/contact'>
          <li className='py-1'>Contact</li>
        </NavLink>
      </ul>

      {/* Right Side */}
      <div className='flex items-center gap-4'>
        {token && userData ? (
          <div className='flex items-center gap-2 cursor-pointer relative'>
            {/* Profile & dropdown toggle */}
            <img
              className='w-8 rounded-full'
              src={userData.image ? userData.image : assets.profile_pic}
              alt=''
              onClick={() => setShowDropdown((prev) => !prev)}
            />
            <img
              className='w-2.5'
              src={assets.dropdown_icon}
              alt=''
              onClick={() => setShowDropdown((prev) => !prev)}
            />

            {/* Dropdown */}
            {showDropdown && (
              <div className='absolute top-12 right-0 text-base font-medium text-gray-600 z-20'>
                <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4 shadow'>
                  <p
                    className='hover:text-black cursor-pointer'
                    onClick={() => {
                      navigate('/my-profile');
                      setShowDropdown(false);
                    }}
                  >
                    My Profile
                  </p>
                  <p
                    className='hover:text-black cursor-pointer'
                    onClick={() => {
                      navigate('/my-appointments');
                      setShowDropdown(false);
                    }}
                  >
                    My Appointment
                  </p>
                  <p
                    className='hover:text-black cursor-pointer'
                    onClick={() => {
                      logout(),
                      setShowDropdown(false);
                    }}
                  >
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            className='bg-[#5f6FFF] text-white rounded-full px-8 py-3 font-light hidden md:block cursor-pointer'
            onClick={() => navigate('/login')}
          >
            Create account
          </button>
        )}

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMenu(true)}
          className='w-6 md:hidden'
          src={assets.menu_icon}
          alt=''
        />

        {/* Mobile Menu */}
        <div
          className={`${
            showMenu ? 'fixed w-full' : 'h-0 w-0'
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className='flex items-center justify-between px-5 py-6'>
            <img className='w-36' src={assets.logo} alt='' />
            <img
              className='w-7'
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt=''
            />
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <NavLink onClick={() => setShowMenu(false)} to='/'>
              <p className='px-4 py-2 rounded inline-block'>HOME</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors'>
              <p className='px-4 py-2 rounded inline-block'>ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about'>
              <p className='px-4 py-2 rounded inline-block'>ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact'>
              <p className='px-4 py-2 rounded inline-block'>CONTACT</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
