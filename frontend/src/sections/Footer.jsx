import React from 'react';
import { Link } from 'react-router-dom';
import MyLogo from '../assets/SP.png'; 

const ArrowRightSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-7-7 7 7-7 7"/>
  </svg>
);

const SocialIconSVG = ({ type }) => {
  const icons = {
    twitter: <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor" stroke="none"/>,
    github: <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2"/>,
    linkedin: <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"/>
  };

  return (
    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icons[type]}
      </svg>
    </button>
  );
};

const FooterColumn = ({ title, links }) => (
  <div className="space-y-6">
    <h4 className="text-white font-bold tracking-tight text-lg">{title}</h4>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link.name}>
          <Link to={link.path} className="text-white/40 hover:text-indigo-400 transition-colors duration-300 font-medium">
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export const Footer = () => {
  const productLinks = [
    { name: 'Home', path: '/' },
    { name: 'Templates', path: '/templates' }
  ];

  const supportLinks = [
    { name: 'Contact Us', path: '/' },
    { name: 'Terms', path: '/' },
    { name: 'FAQ', path: '/' }
  ];

  return (
    <footer className="bg-[#0a0026] pt-24 pb-12 px-6 md:px-16 border-t border-white/5 font-sans">
      <div className="max-w-7xl mx-auto">
        
      

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner overflow-hidden"> 
                <img src={MyLogo} alt="Logo" className="w-7 h-7 object-contain" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase">StructPeak</span>
            </div>
            <p className="text-white/50 text-lg leading-relaxed max-w-sm font-medium">
              Building the future of the web, one block at a time.
            </p>
            <div className="flex gap-4">
              <SocialIconSVG type="twitter" />
              <SocialIconSVG type="github" />
              <SocialIconSVG type="linkedin" />
            </div>
          </div>

          <FooterColumn title="Explore" links={productLinks} />
          <FooterColumn title="Support" links={supportLinks} />
        </div>

        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-white/30 text-sm font-medium">
            © 2026 StructPeak Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};