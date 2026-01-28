"use client";

interface ParallaxTemplateProps {
  data: any;
  themeConfig: any;
}

export function ParallaxTemplate({ data, themeConfig }: ParallaxTemplateProps) {
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: themeConfig.backgroundColor || '#ffffff',
        fontFamily: themeConfig.fontFamily || 'Poppins, sans-serif',
      }}
    >
      {/* Hero with parallax effect simulation */}
      <div 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${themeConfig.backgroundColor || '#ffffff'}, ${themeConfig.primaryColor || '#d4af37'}20)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full"
            style={{ backgroundColor: themeConfig.primaryColor || '#d4af37' }}
          />
          <div 
            className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full"
            style={{ backgroundColor: themeConfig.primaryColor || '#d4af37' }}
          />
        </div>
        
        <div className="max-w-4xl w-full text-center px-8 z-10">
          <h1 
            className="text-6xl md:text-7xl font-bold mb-8"
            style={{ 
              color: themeConfig.primaryColor || '#d4af37',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            {data.eventTitle}
          </h1>
          
          {data.subtitle && (
            <p 
              className="text-2xl md:text-3xl mb-12"
              style={{ color: themeConfig.textSecondary || '#666' }}
            >
              {data.subtitle}
            </p>
          )}
        </div>
      </div>
      
      {/* Content sections */}
      <div className="max-w-4xl mx-auto px-8 py-24 space-y-16">
        {data.eventDate && (
          <div className="text-center">
            <div 
              className="inline-block p-8 rounded-2xl"
              style={{
                backgroundColor: `${themeConfig.primaryColor || '#d4af37'}15`,
              }}
            >
              <p 
                className="text-3xl font-bold mb-2"
                style={{ color: themeConfig.primaryColor || '#d4af37' }}
              >
                {new Date(data.eventDate).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {data.eventTime && (
                <p 
                  className="text-2xl"
                  style={{ color: themeConfig.textSecondary || '#666' }}
                >
                  {data.eventTime}
                </p>
              )}
            </div>
          </div>
        )}
        
        {data.description && (
          <div 
            className="text-xl text-center leading-relaxed"
            style={{ color: themeConfig.textDark || '#1a1a1a' }}
          >
            {data.description}
          </div>
        )}
        
        {data.location && (
          <div 
            className="text-center p-8 rounded-2xl"
            style={{
              backgroundColor: `${themeConfig.primaryColor || '#d4af37'}10`,
              border: `2px solid ${themeConfig.primaryColor || '#d4af37'}30`,
            }}
          >
            <p 
              className="text-sm uppercase tracking-widest mb-4"
              style={{ color: themeConfig.primaryColor || '#d4af37' }}
            >
              Ubicación
            </p>
            <p 
              className="text-2xl font-semibold"
              style={{ color: themeConfig.textDark || '#1a1a1a' }}
            >
              📍 {data.location}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
