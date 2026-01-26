"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { format } from "date-fns";

interface AddToCalendarProps {
    eventName: string;
    eventDate: Date;
    location?: string;
    description?: string;
    className?: string;
}

export function AddToCalendar({ 
    eventName, 
    eventDate, 
    location = "", 
    description = "",
    className = ""
}: AddToCalendarProps) {
    
    const formatDateForGoogle = (date: Date) => {
        return format(date, "yyyyMMdd'T'HHmmss");
    };

    const formatDateForICS = (date: Date) => {
        return format(date, "yyyyMMdd'T'HHmmss");
    };

    const generateGoogleCalendarUrl = () => {
        const startDate = formatDateForGoogle(eventDate);
        const endDate = formatDateForGoogle(new Date(eventDate.getTime() + 4 * 60 * 60 * 1000)); // +4 hours
        
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: eventName,
            dates: `${startDate}/${endDate}`,
            details: description,
            location: location,
        });

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    const generateICSFile = () => {
        const startDate = formatDateForICS(eventDate);
        const endDate = formatDateForICS(new Date(eventDate.getTime() + 4 * 60 * 60 * 1000));
        
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:${eventName}`,
            `DESCRIPTION:${description}`,
            `LOCATION:${location}`,
            'STATUS:CONFIRMED',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${eventName.replace(/\s+/g, '-')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGoogleCalendar = () => {
        window.open(generateGoogleCalendarUrl(), '_blank');
    };

    const handleAppleCalendar = () => {
        generateICSFile();
    };

    const handleOutlookCalendar = () => {
        generateICSFile();
    };

    return (
        <div className={className}>
            <div className="flex flex-wrap gap-3 justify-center">
                <Button
                    onClick={handleGoogleCalendar}
                    variant="outline"
                    className="gap-2 rounded-full px-6 py-5 border-2 hover:scale-105 transition-transform"
                    style={{
                        borderColor: 'var(--color-primary)',
                        color: 'var(--color-primary)',
                    }}
                >
                    <Calendar className="w-5 h-5" />
                    Google Calendar
                </Button>

                <Button
                    onClick={handleAppleCalendar}
                    variant="outline"
                    className="gap-2 rounded-full px-6 py-5 border-2 hover:scale-105 transition-transform"
                    style={{
                        borderColor: 'var(--color-primary)',
                        color: 'var(--color-primary)',
                    }}
                >
                    <Download className="w-5 h-5" />
                    Apple Calendar
                </Button>

                <Button
                    onClick={handleOutlookCalendar}
                    variant="outline"
                    className="gap-2 rounded-full px-6 py-5 border-2 hover:scale-105 transition-transform"
                    style={{
                        borderColor: 'var(--color-primary)',
                        color: 'var(--color-primary)',
                    }}
                >
                    <Download className="w-5 h-5" />
                    Outlook
                </Button>
            </div>
        </div>
    );
}
