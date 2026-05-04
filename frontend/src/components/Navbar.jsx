import { Link } from 'react-router-dom';
import MyLogo from '../assets/SP.png'; 
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="w-full flex justify-between items-center py-6 px-6 md:px-16 bg-[#0a0026] font-sans relative" dir="ltr">
      
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 flex items-center justify-center"> 

         <p className=' text-white text-2xl'  style={{fontFamily:'fantasy'}}>
          SP</p>
        </div>

        <span className="text-1xl font-black text-white tracking-tighter uppercase">
          StructPeak
        </span>
      </div>

      <div className="flex items-center gap-6"> 
        <div className="hidden md:block text-white/70 hover:text-white font-medium transition text-sm cursor-pointer">
          Home
        </div>
        <div className="hidden md:block text-white/70 hover:text-white font-medium transition text-sm cursor-pointer">
          About us
        </div>
        <div className="hidden md:block text-white/70 hover:text-white font-medium transition text-sm cursor-pointer">
          Templates
        </div>

       <div 
        onClick={() => navigate('/login')} 
        className="text-white/80 hover:text-white font-bold text-sm px-2 cursor-pointer"
      >
        Log in
      </div>

        
  <div 
  onClick={() => navigate('/register')}
  className="bg-white text-[#0a0026] px-6 py-2.5 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all shadow-xl active:scale-95 cursor-pointer">
    Sign up
  </div>
      </div>
    </nav>
  );
};