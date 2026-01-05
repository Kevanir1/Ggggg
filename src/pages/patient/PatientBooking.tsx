import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Clock, Check } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { VisitType, visitTypeLabels } from "@/types/patient";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availableSlots: string[];
}

const doctors: Doctor[] = [
  { 
    id: 'd1', 
    name: 'dr Anna Nowak', 
    specialization: 'Internista',
    availableSlots: ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']
  },
  { 
    id: 'd2', 
    name: 'dr Piotr Wiśniewski', 
    specialization: 'Kardiolog',
    availableSlots: ['08:00', '08:30', '11:00', '11:30', '12:00', '15:00', '15:30']
  },
  { 
    id: 'd3', 
    name: 'dr Maria Kowalczyk', 
    specialization: 'Dermatolog',
    availableSlots: ['10:00', '10:30', '11:00', '13:00', '13:30', '14:00']
  },
  { 
    id: 'd4', 
    name: 'dr Jan Zieliński', 
    specialization: 'Ortopeda',
    availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  }
];

const PatientBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'doctor' | 'datetime' | 'details' | 'confirm'>('doctor');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [visitType, setVisitType] = useState<VisitType>('consultation');
  const [reason, setReason] = useState('');

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep('datetime');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    if (!reason.trim()) {
      toast.error("Podaj powód wizyty");
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = () => {
    toast.success("Wizyta została umówiona!");
    navigate('/patient/visits');
  };

  const goBack = () => {
    if (step === 'datetime') {
      setSelectedDoctor(null);
      setStep('doctor');
    } else if (step === 'details') {
      setSelectedTime(null);
      setStep('datetime');
    } else if (step === 'confirm') {
      setStep('details');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Umów wizytę</h1>
        <p className="text-muted-foreground">Wybierz lekarza, termin i rodzaj wizyty</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {['doctor', 'datetime', 'details', 'confirm'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === s ? 'bg-primary text-primary-foreground' : 
              ['doctor', 'datetime', 'details', 'confirm'].indexOf(step) > i ? 'bg-primary/20 text-primary' : 
              'bg-muted text-muted-foreground'
            }`}>
              {['doctor', 'datetime', 'details', 'confirm'].indexOf(step) > i ? (
                <Check className="w-4 h-4" />
              ) : i + 1}
            </div>
            {i < 3 && <div className="w-8 h-0.5 bg-border" />}
          </div>
        ))}
      </div>

      {step === 'doctor' && (
        <Card>
          <CardHeader>
            <CardTitle>Wybierz lekarza</CardTitle>
            <CardDescription>Wybierz specjalistę do którego chcesz umówić wizytę</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="p-4 rounded-lg border hover:border-primary cursor-pointer transition-colors"
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <Badge variant="secondary">{doctor.specialization}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'datetime' && selectedDoctor && (
        <Card>
          <CardHeader>
            <CardTitle>Wybierz termin</CardTitle>
            <CardDescription>
              {selectedDoctor.name} - {selectedDoctor.specialization}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label className="mb-2 block">Data</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                  locale={pl}
                  className="rounded-md border"
                />
              </div>
              {selectedDate && (
                <div>
                  <Label className="mb-2 block">
                    Dostępne godziny - {format(selectedDate, 'd MMMM', { locale: pl })}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDoctor.availableSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleTimeSelect(time)}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={goBack}>
                Wróć
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Szczegóły wizyty</CardTitle>
            <CardDescription>Podaj informacje o wizycie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rodzaj wizyty</Label>
              <Select value={visitType} onValueChange={(val) => setVisitType(val as VisitType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(visitTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Powód wizyty *</Label>
              <Textarea 
                placeholder="Opisz powód wizyty..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={goBack}>
                Wróć
              </Button>
              <Button onClick={handleDetailsSubmit}>
                Przejdź do podsumowania
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && selectedDoctor && selectedDate && selectedTime && (
        <Card>
          <CardHeader>
            <CardTitle>Potwierdzenie wizyty</CardTitle>
            <CardDescription>Sprawdź dane i potwierdź rezerwację</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Lekarz</p>
                <p className="font-medium">{selectedDoctor.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Specjalizacja</p>
                <p className="font-medium">{selectedDoctor.specialization}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">{format(selectedDate, 'd MMMM yyyy', { locale: pl })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Godzina</p>
                <p className="font-medium">{selectedTime}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rodzaj</p>
                <p className="font-medium">{visitTypeLabels[visitType]}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Powód</p>
                <p className="font-medium">{reason}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={goBack}>
                Wróć do edycji
              </Button>
              <Button onClick={handleConfirm}>
                Potwierdź wizytę
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientBooking;