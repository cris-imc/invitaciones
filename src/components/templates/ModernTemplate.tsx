"use client";

interface ModernTemplateProps {
  data: any;
  themeConfig: any;
}

export function ModernTemplate({ data, themeConfig }: ModernTemplateProps) {
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: themeConfig.backgroundColor || '#ffffff',
        fontFamily: themeConfig.fontFamily || 'Poppins, sans-serif',
      }}
    >
      {/* Hero Section */}
      <div 
        className="min-h-screen flex items-center justify-center p-8"
        style={{
          background: `linear-gradient(135deg, ${themeConfig.primaryColor || '#d4af37'}20, ${themeConfig.backgroundColor || '#ffffff'})`,
        }}
      >
        <div className="max-w-4xl w-full text-center">
          <h1 
            className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in"
            style={{ 
              color: themeConfig.primaryColor || '#d4af37',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
          
          {data.eventDate && (
            <div 
              className="inline-block px-8 py-4 rounded-full mb-8"
              style={{
                backgroundColor: themeConfig.primaryColor || '#d4af37',
                color: themeConfig.textLight || '#ffffff',
              }}
            >
              <p className="text-xl font-semibold">
                {new Date(data.eventDate).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {data.eventTime && (
                <p className="text-lg mt-1">{data.eventTime}</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        {data.description && (
          <div 
            className="text-lg md:text-xl mb-12 text-center"
            style={{ color: themeConfig.textDark || '#1a1a1a' }}
          >
            {data.description}
          </div>
        )}
        
        {data.location && (
          <div 
            className="text-center p-6 rounded-lg"
            style={{
              backgroundColor: `${themeConfig.primaryColor || '#d4af37'}10`,
              borderLeft: `4px solid ${themeConfig.primaryColor || '#d4af37'}`,
            }}
          >
            <p 
              className="text-xl font-semibold mb-2"
              style={{ color: themeConfig.primaryColor || '#d4af37' }}
            >
              Ubicación
            </p>
            <p 
              className="text-lg"
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
