import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import apiClient from '@/lib/apiClient';

// We'll load doctor availability from backend: GET /availability/doctor/:doctorId

const hours = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

const getTypeColor = (type: string) => {
  switch (type) {
    case 'consultation':
      return 'bg-primary text-primary-foreground';
    case 'follow-up':
      return 'bg-secondary text-secondary-foreground';
    case 'procedure':
      return 'bg-accent text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function DoctorSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const session = await (await import('@/lib/session')).ensureSession();
        if (!session || !session.doctor_id) return;
        const doctorId = session.doctor_id;
        const res = await apiClient.get(`/availability/doctor/${doctorId}`);
        if (res && res.status === 'success') {
          const avail = res.availability || [];
          const items = avail.map((a: any) => {
            const start = new Date(a.start_time);
            return {
              id: String(a.id || a.availability_id || ''),
              date: start,
              time: start.toTimeString().slice(0,5),
              duration: Math.round((new Date(a.end_time).getTime() - start.getTime())/60000) || 30,
              patient: a.patient_name || '',
              type: 'consultation',
            };
          });
          setScheduleItems(items);
        }
      } catch (e) { console.error(e); }
    };
    load();
  }, []);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const getItemsForDay = (date: Date) => {
    return scheduleItems.filter(item => isSameDay(item.date, date));
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Grafik</h1>
            <p className="text-muted-foreground">Zarządzaj swoim harmonogramem</p>
          </div>
          
          {/* Week selector */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(weekStart, 'd MMM', { locale: pl })} - {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: pl })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Konsultacja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-sm text-muted-foreground">Kontrolna</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Zabieg</span>
          </div>
        </div>

        {/* Calendar grid */}
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Days header */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm font-medium text-muted-foreground border-r" />
                {weekDays.map((day, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-3 text-center border-r last:border-r-0",
                      isSameDay(day, new Date()) && "bg-primary/5"
                    )}
                  >
                    <p className="text-sm font-medium text-muted-foreground">
                      {format(day, 'EEE', { locale: pl })}
                    </p>
                    <p className={cn(
                      "text-lg font-bold",
                      isSameDay(day, new Date()) && "text-primary"
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                  <div className="p-2 text-sm text-muted-foreground border-r flex items-start justify-end pr-3">
                    {hour}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const dayItems = getItemsForDay(day).filter(item => item.time === hour);
                    return (
                      <div 
                        key={dayIndex}
                        className={cn(
                          "p-1 border-r last:border-r-0 min-h-[60px]",
                          isSameDay(day, new Date()) && "bg-primary/5"
                        )}
                      >
                        {dayItems.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "p-2 rounded text-xs mb-1 cursor-pointer hover:opacity-80 transition-opacity",
                              getTypeColor(item.type)
                            )}
                          >
                            <p className="font-medium truncate">{item.patient}</p>
                            <p className="opacity-80">{item.duration} min</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's summary */}
        <Card>
          <CardHeader>
            <CardTitle>Podsumowanie dnia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">
                  {getItemsForDay(new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Wizyt dzisiaj</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">
                  {getItemsForDay(new Date()).reduce((acc, item) => acc + item.duration, 0)} min
                </p>
                <p className="text-sm text-muted-foreground">Łączny czas</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">
                  {getItemsForDay(new Date()).filter(i => i.type === 'procedure').length}
                </p>
                <p className="text-sm text-muted-foreground">Zabiegi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}
