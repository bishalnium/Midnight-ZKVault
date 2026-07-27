import React from 'react';
import { Hero } from './components/Hero';

export function App() {
  return (
    <div className="min-h-screen w-full bg-[#090a0f] text-slate-100 selection:bg-purple-600 selection:text-white">
      <Hero />
    </div>
  );
}

export default App;
