"use client";

interface MinimalTemplateProps {
  data: any;
  themeConfig: any;
}

export function MinimalTemplate({ data, themeConfig }: MinimalTemplateProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        backgroundColor: themeConfig.backgroundColor || '#ffffff',
        fontFamily: themeConfig.fontFamily || 'Raleway, sans-serif',
      }}
    >
      <div className="max-w-3xl w-full">
        <div className="text-center space-y-12">
          {/* Title */}
          <h1 
            className="text-4xl md:text-5xl font-light tracking-wider uppercase"
            style={{ 
              color: themeConfig.textDark || '#1a1a1a',
              letterSpacing: '0.3em',
            }}
          >
            {data.eventTitle}
          </h1>
          
          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <div 
              className="h-px w-24"
              style={{ backgroundColor: themeConfig.primaryColor || '#d4af37' }}
            />
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: themeConfig.primaryColor || '#d4af37' }}
            />
            <div 
              className="h-px w-24"
              style={{ backgroundColor: themeConfig.primaryColor || '#d4af37' }}
            />
          </div>
          
          {/* Subtitle */}
          {data.subtitle && (
            <p 
              className="text-xl font-light italic"
              style={{ color: themeConfig.textSecondary || '#666' }}
            >
              {data.subtitle}
            </p>
          )}
          
          {/* Date & Time */}
          {data.eventDate && (
            <div className="space-y-2">
              <p 
                className="text-2xl font-light tracking-wide"
                style={{ color: themeConfig.primaryColor || '#d4af37' }}
              >
                {new Date(data.eventDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {data.eventTime && (
                <p 
                  className="text-lg font-light"
                  style={{ color: themeConfig.textSecondary || '#666' }}
                >
                  {data.eventTime}
                </p>
              )}
            </div>
          )}
          
          {/* Description */}
          {data.description && (
            <p 
              className="text-base font-light max-w-2xl mx-auto leading-relaxed"
              style={{ color: themeConfig.textDark || '#1a1a1a' }}
            >
              {data.description}
            </p>
          )}
          
          {/* Location */}
          {data.location && (
            <div className="pt-8">
              <p 
                className="text-sm uppercase tracking-widest mb-2"
                style={{ color: themeConfig.primaryColor || '#d4af37' }}
              >
                Ubicación
              </p>
              <p 
                className="text-lg font-light"
                style={{ color: themeConfig.textDark || '#1a1a1a' }}
              >
                {data.location}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
