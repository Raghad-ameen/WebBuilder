import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../sections/Hero'; 
import { FeatureGrid} from '../sections/FeatureGrid';
import { HowItWorks } from '../sections/HowItWorks';


const LandingPage = () => {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900" dir="ltr">
      <Hero />
      <FeatureGrid />
      <HowItWorks />
    </div>
  );
};

export default LandingPage;