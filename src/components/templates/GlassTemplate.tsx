"use client";

interface GlassTemplateProps {
  data: any;
  themeConfig: any;
}

export function GlassTemplate({ data, themeConfig }: GlassTemplateProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${themeConfig.primaryColor || '#d4af37'}40, ${themeConfig.primaryColor || '#d4af37'}20)`,
        fontFamily: themeConfig.fontFamily || 'Poppins, sans-serif',
      }}
    >
      {/* Background blur elements */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: themeConfig.primaryColor || '#d4af37' }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: themeConfig.primaryColor || '#d4af37' }}
      />
      
      {/* Glass card */}
      <div 
        className="max-w-2xl w-full rounded-2xl p-12 text-center relative z-10"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 
          className="text-5xl md:text-6xl font-bold mb-6"
          style={{ 
            color: themeConfig.textDark || '#1a1a1a',
            textShadow: '0 2px 10px rgba(255, 255, 255, 0.3)',
          }}
        >
          {data.eventTitle}
        </h1>
        
        {data.subtitle && (
          <p 
            className="text-xl mb-8"
            style={{ color: themeConfig.textSecondary || '#666' }}
          >
            {data.subtitle}
          </p>
        )}
        
        <div 
          className="h-px w-32 mx-auto mb-8"
          style={{ backgroundColor: themeConfig.primaryColor || '#d4af37' }}
        />
        
        {data.description && (
          <p 
            className="text-lg mb-8"
            style={{ color: themeConfig.textDark || '#1a1a1a' }}
          >
            {data.description}
          </p>
        )}
        
        {data.eventDate && (
          <div 
            className="inline-block px-6 py-4 rounded-xl mb-6"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <p 
              className="text-xl font-semibold"
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
                className="text-lg mt-2"
                style={{ color: themeConfig.textDark || '#1a1a1a' }}
              >
                {data.eventTime}
              </p>
            )}
          </div>
        )}
        
        {data.location && (
          <p 
            className="text-lg"
            style={{ color: themeConfig.textDark || '#1a1a1a' }}
          >
            📍 {data.location}
          </p>
        )}
      </div>
    </div>
  );
}
