'use client';

import dynamic from 'next/dynamic';

const LightRays = dynamic(() => import('./LightRays'), {
  ssr: false,
});

export default function LightRaysClient() {
  return (
    
      <div className='absolute inset-0 top-0 z-[-1]'>
        <LightRays 
        raysOrigin="top-center-offset"
        raysColor="#5dfeca"
        raysSpeed={0.5}
        lightSpread={0.9}
        rayLength={1.4}
        followMouse={true}
        mouseInfluence={0.02}
        noiseAmount={0}
        distortion={0.01}
        
      />
      </div>
    
  );
}
