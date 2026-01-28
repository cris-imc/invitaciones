"use client";

interface ClassicTemplateProps {
  data: any;
  themeConfig: any;
}

export function ClassicTemplate({ data, themeConfig }: ClassicTemplateProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        backgroundColor: themeConfig.backgroundColor || '#ffffff',
        fontFamily: themeConfig.fontFamily || 'Poppins, sans-serif',
      }}
    >
      <div 
        className="max-w-2xl w-full rounded-xl shadow-2xl p-12 text-center"
        style={{
          borderColor: themeConfig.primaryColor || '#d4af37',
          borderWidth: '2px',
          borderStyle: 'solid',
        }}
      >
        <h1 
          className="text-5xl font-bold mb-6"
          style={{ color: themeConfig.primaryColor || '#d4af37' }}
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
          className="text-lg mb-8"
          style={{ color: themeConfig.textDark || '#1a1a1a' }}
        >
          {data.description}
        </div>
        
        {data.eventDate && (
          <div className="mb-6">
            <p 
              className="text-2xl font-semibold"
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
                className="text-xl mt-2"
                style={{ color: themeConfig.textSecondary || '#666' }}
              >
                {data.eventTime}
              </p>
            )}
          </div>
        )}
        
        {data.location && (
          <div className="mb-6">
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
