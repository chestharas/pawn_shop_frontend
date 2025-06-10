// This one is test only. I have stuck in font is not recognize
// IF YOU SEE THIS, IT WAS TESTING ONLY


'use client';

import { useEffect, useState } from 'react';

export default function FontTest() {
  const [fontInfo, setFontInfo] = useState('');

  useEffect(() => {
    // Check computed font family
    const bodyFont = window.getComputedStyle(document.body).fontFamily;
    setFontInfo(bodyFont);
    
    console.log('=== FONT DEBUG ===');
    console.log('Body font family:', bodyFont);
    console.log('HTML font family:', window.getComputedStyle(document.documentElement).fontFamily);
    
    // Test if Geist is actually loaded
    const testElement = document.createElement('div');
    testElement.style.fontFamily = 'Geist, sans-serif';
    testElement.textContent = 'Test';
    document.body.appendChild(testElement);
    const testFont = window.getComputedStyle(testElement).fontFamily;
    console.log('Geist test font:', testFont);
    document.body.removeChild(testElement);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      borderRadius: '4px'
    }}>
      <strong>Font Test</strong>
      <div>Current: {fontInfo}</div>
      <div style={{ fontFamily: 'Times, serif', margin: '5px 0' }}>
        Times: Sample Text 123
      </div>
      <div style={{ fontFamily: 'Arial, sans-serif', margin: '5px 0' }}>
        Arial: Sample Text 123
      </div>
      <div style={{ fontFamily: 'Geist, sans-serif', margin: '5px 0' }}>
        Geist: Sample Text 123
      </div>
    </div>
  );
}
