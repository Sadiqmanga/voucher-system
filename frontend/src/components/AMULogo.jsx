import React from 'react';

function AMULogo({ size = 'medium', showText = true }) {
  const sizeMap = {
    small: { width: 80, height: 100, fontSize: '1.5rem' },
    medium: { width: 120, height: 150, fontSize: '2rem' },
    large: { width: 160, height: 200, fontSize: '2.5rem' }
  };

  const dimensions = sizeMap[size] || sizeMap.medium;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div
        style={{
          position: 'relative',
          width: dimensions.width,
          height: dimensions.height,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(59, 130, 246, 0.08) 50%, rgba(239, 68, 68, 0.08) 100%)',
          borderRadius: '24px',
          border: '3px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.5) inset, 0 0 40px rgba(255, 255, 255, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 30%, rgba(239, 68, 68, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 20% 70%, rgba(34, 197, 94, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)
          `,
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.6) inset, 0 0 50px rgba(255, 255, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.5) inset, 0 0 40px rgba(255, 255, 255, 0.4)';
        }}
      >
        {/* Decorative background shapes */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            width: '30%',
            height: '25%',
            background: 'rgba(0, 0, 255, 0.4)',
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            filter: 'blur(2px)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '15%',
            width: '30%',
            height: '25%',
            background: 'rgba(220, 20, 60, 0.4)',
            borderRadius: '50% 50% 0 50%',
            transform: 'rotate(45deg)',
            filter: 'blur(2px)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '20%',
            width: '25%',
            height: '20%',
            background: 'rgba(34, 139, 34, 0.4)',
            borderRadius: '50% 0 50% 50%',
            transform: 'rotate(45deg)',
            filter: 'blur(2px)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '20%',
            width: '25%',
            height: '20%',
            background: 'rgba(220, 20, 60, 0.4)',
            borderRadius: '0 50% 50% 50%',
            transform: 'rotate(-45deg)',
            filter: 'blur(2px)'
          }}
        />

        {/* AMU Letters */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
            fontFamily: 'Arial, "Helvetica Neue", sans-serif',
            fontWeight: '900',
            fontSize: dimensions.fontSize,
            letterSpacing: '0.15em',
            lineHeight: '1.2'
          }}
        >
          <div
            style={{
              color: '#22c55e',
              textShadow: '0 0 20px rgba(34, 197, 94, 0.9), 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 30px rgba(34, 197, 94, 0.5)',
              filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))',
              transition: 'transform 0.3s ease'
            }}
          >
            A
          </div>
          <div
            style={{
              color: '#3b82f6',
              textShadow: '0 0 20px rgba(59, 130, 246, 0.9), 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 30px rgba(59, 130, 246, 0.5)',
              filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))',
              transition: 'transform 0.3s ease'
            }}
          >
            M
          </div>
          <div
            style={{
              color: '#ef4444',
              textShadow: '0 0 20px rgba(239, 68, 68, 0.9), 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 30px rgba(239, 68, 68, 0.5)',
              filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))',
              transition: 'transform 0.3s ease'
            }}
          >
            U
          </div>
        </div>
      </div>
      {showText && (
        <div
          style={{
            textAlign: 'center',
            color: '#1f2937',
            fontWeight: '700',
            fontSize: size === 'small' ? '0.9rem' : size === 'large' ? '1.5rem' : '1.1rem',
            letterSpacing: '0.08em',
            marginTop: '0.5rem',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          AMU MULTI SERVICES LTD
        </div>
      )}
    </div>
  );
}

export default AMULogo;

