/**
 * Calendar Component Stories
 * Professional date display and selection with Norwegian localization
 * WCAG AAA compliant examples with Norwegian text
 * CLAUDE.md Compliant: Professional styling and accessibility
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { 
  Calendar,
  type CalendarProps
} from '../registry/components/calendar/calendar';
import { Button } from '../registry/components/button/button';
import { Card } from '../registry/components/card/card';

// Norwegian holidays and special dates for demonstration
const norwegianHolidays = {
  '2024-01-01': 'Nyttårsdag',
  '2024-03-28': 'Skjærtorsdag',
  '2024-03-29': 'Langfredag',
  '2024-03-31': 'Første påskedag',
  '2024-04-01': 'Andre påskedag',
  '2024-05-01': 'Arbeidernes dag',
  '2024-05-09': 'Kristi himmelfartsdag',
  '2024-05-17': 'Grunnlovsdag',
  '2024-05-19': 'Første pinsedag',
  '2024-05-20': 'Andre pinsedag',
  '2024-12-25': 'Første juledag',
  '2024-12-26': 'Andre juledag'
};

const formatNorwegianDate = (date: Date): string => {
  return new Intl.DateTimeFormat('nb-NO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const meta: Meta<typeof Calendar> = {
  title: 'Data Display/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'minimal', 'card', 'compact'],
      description: 'Calendar visual variant'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Calendar size'
    },
    mode: {
      control: 'select',
      options: ['single', 'range', 'multiple'],
      description: 'Selection mode'
    },
    weekStartsOn: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6],
      description: 'First day of week (0=Sunday, 1=Monday)'
    },
    showOutsideDays: {
      control: 'boolean',
      description: 'Show days from other months'
    },
    fixedWeeks: {
      control: 'boolean',
      description: 'Always show 6 weeks'
    },
    numberOfMonths: {
      control: 'number',
      description: 'Number of months to display'
    },
    locale: {
      control: 'select',
      options: ['nb-NO', 'en-US', 'sv-SE', 'da-DK'],
      description: 'Locale for date formatting'
    }
  }
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    locale: 'nb-NO',
    weekStartsOn: 1
  }
};

export const Minimal: Story = {
  args: {
    variant: 'minimal',
    locale: 'nb-NO',
    weekStartsOn: 1
  }
};

export const Card: Story = {
  args: {
    variant: 'card',
    locale: 'nb-NO',
    weekStartsOn: 1
  }
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    size: 'sm',
    locale: 'nb-NO',
    weekStartsOn: 1
  }
};

// Selection Modes
export const SelectionModes: Story = {
  render: () => {
    const [singleDate, setSingleDate] = useState<Date | null>(new Date());
    const [dateRange, setDateRange] = useState<readonly [Date | null, Date | null]>([
      new Date(2024, 2, 15),
      new Date(2024, 2, 18)
    ]);

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Enkelttdato-valg</h3>
          <div className="flex gap-6">
            <Calendar
              selectedDate={singleDate}
              onDateSelect={setSingleDate}
              mode="single"
              locale="nb-NO"
              weekStartsOn={1}
              variant="card"
            />
            <div className="p-4 bg-card rounded-lg border min-w-64">
              <h4 className="font-medium mb-3">Valgt dato:</h4>
              {singleDate ? (
                <div>
                  <div className="text-sm text-muted-foreground">
                    {formatNorwegianDate(singleDate)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {singleDate.toISOString().split('T')[0]}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Ingen dato valgt
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Periodevalg</h3>
          <div className="flex gap-6">
            <Calendar
              selectedRange={dateRange}
              onRangeSelect={setDateRange}
              mode="range"
              locale="nb-NO"
              weekStartsOn={1}
              variant="card"
            />
            <div className="p-4 bg-card rounded-lg border min-w-64">
              <h4 className="font-medium mb-3">Valgt periode:</h4>
              {dateRange[0] && dateRange[1] ? (
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Fra:</div>
                    <div className="text-sm font-medium">
                      {formatNorwegianDate(dateRange[0])}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Til:</div>
                    <div className="text-sm font-medium">
                      {formatNorwegianDate(dateRange[1])}
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">Varighet:</div>
                    <div className="text-sm font-medium">
                      {Math.ceil((dateRange[1].getTime() - dateRange[0].getTime()) / (1000 * 60 * 60 * 24)) + 1} dager
                    </div>
                  </div>
                </div>
              ) : dateRange[0] ? (
                <div>
                  <div className="text-xs text-muted-foreground">Fra:</div>
                  <div className="text-sm font-medium">
                    {formatNorwegianDate(dateRange[0])}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Velg sluttdato...
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Ingen periode valgt
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Size Variants
export const SizeVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Liten størrelse</h3>
        <Calendar
          size="sm"
          locale="nb-NO"
          weekStartsOn={1}
          variant="card"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Medium størrelse (standard)</h3>
        <Calendar
          size="md"
          locale="nb-NO"
          weekStartsOn={1}
          variant="card"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Stor størrelse</h3>
        <Calendar
          size="lg"
          locale="nb-NO"
          weekStartsOn={1}
          variant="card"
        />
      </div>
    </div>
  )
};

// Localization Examples
export const LocalizationExamples: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Norsk bokmål</h3>
          <Calendar
            locale="nb-NO"
            weekStartsOn={1}
            variant="card"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Engelsk</h3>
          <Calendar
            locale="en-US"
            weekStartsOn={0}
            variant="card"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Svensk</h3>
          <Calendar
            locale="sv-SE"
            weekStartsOn={1}
            variant="card"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Dansk</h3>
          <Calendar
            locale="da-DK"
            weekStartsOn={1}
            variant="card"
          />
        </div>
      </div>
    </div>
  )
};

// Advanced Features
export const AdvancedFeatures: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    
    // Mock holiday checker
    const isHoliday = (date: Date): boolean => {
      const dateString = date.toISOString().split('T')[0];
      return dateString in norwegianHolidays;
    };
    
    // Mock weekend/business day checker
    const isWeekend = (date: Date): boolean => {
      const day = date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    };
    
    // Disable weekends and holidays
    const isDisabled = (date: Date): boolean => {
      return isWeekend(date) || isHoliday(date);
    };

    const getHolidayName = (date: Date): string | undefined => {
      const dateString = date.toISOString().split('T')[0];
      return norwegianHolidays[dateString as keyof typeof norwegianHolidays];
    };

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Med norske helligdager og forretningsdager</h3>
          <div className="flex gap-6">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              disabled={isDisabled}
              mode="single"
              locale="nb-NO"
              weekStartsOn={1}
              variant="card"
              defaultMonth={new Date(2024, 4, 1)} // May 2024
            />
            
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-lg border min-w-64">
                <h4 className="font-medium mb-3">Valgt dato:</h4>
                {selectedDate ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      {formatNorwegianDate(selectedDate)}
                    </div>
                    {isHoliday(selectedDate) && (
                      <div className="text-sm text-red-600">
                        🎉 {getHolidayName(selectedDate)}
                      </div>
                    )}
                    {isWeekend(selectedDate) && !isHoliday(selectedDate) && (
                      <div className="text-sm text-blue-600">
                        📅 Helgedag
                      </div>
                    )}
                    {!isWeekend(selectedDate) && !isHoliday(selectedDate) && (
                      <div className="text-sm text-green-600">
                        💼 Arbeidsdag
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Velg en arbeidsdag
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Informasjon:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Helger og helligdager er deaktivert</li>
                  <li>• Kun arbeidsdager kan velges</li>
                  <li>• Basert på norsk kalender 2024</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Med datobegrensninger</h3>
          <div className="flex gap-6">
            <Calendar
              minDate={new Date()}
              maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
              mode="single"
              locale="nb-NO"
              weekStartsOn={1}
              variant="card"
            />
            
            <div className="p-4 bg-card rounded-lg border min-w-64">
              <h4 className="font-medium mb-3">Begrensninger:</h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <div>
                  <strong>Fra:</strong> I dag
                </div>
                <div>
                  <strong>Til:</strong> 30 dager frem
                </div>
                <div className="text-xs pt-2">
                  Kun fremtidige datoer innenfor neste måned kan velges.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Booking System Example
export const BookingSystemExample: Story = {
  render: () => {
    const [selectedRange, setSelectedRange] = useState<readonly [Date | null, Date | null]>([null, null]);
    const [bookingType, setBookingType] = useState<'meeting' | 'vacation' | 'travel'>('meeting');
    
    // Mock booking data
    const existingBookings = [
      { start: new Date(2024, 2, 5), end: new Date(2024, 2, 7), type: 'vacation' },
      { start: new Date(2024, 2, 12), end: new Date(2024, 2, 12), type: 'meeting' },
      { start: new Date(2024, 2, 18), end: new Date(2024, 2, 20), type: 'travel' },
      { start: new Date(2024, 2, 25), end: new Date(2024, 2, 26), type: 'meeting' }
    ];
    
    const isBookedDate = (date: Date): boolean => {
      return existingBookings.some(booking => {
        const dateTime = date.getTime();
        return dateTime >= booking.start.getTime() && dateTime <= booking.end.getTime();
      });
    };
    
    const calculateDays = () => {
      if (selectedRange[0] && selectedRange[1]) {
        return Math.ceil((selectedRange[1].getTime() - selectedRange[0].getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
      return 0;
    };
    
    const bookingTypeLabels = {
      meeting: 'Møterom',
      vacation: 'Ferie',
      travel: 'Reise'
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Bookingsystem</h3>
          <p className="text-sm text-muted-foreground">
            Velg periode for din booking
          </p>
        </div>
        
        <div className="flex justify-center gap-2 mb-6">
          {(Object.keys(bookingTypeLabels) as Array<keyof typeof bookingTypeLabels>).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={bookingType === type ? 'default' : 'outline'}
              onClick={() => setBookingType(type)}
            >
              {bookingTypeLabels[type]}
            </Button>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Calendar
            selectedRange={selectedRange}
            onRangeSelect={setSelectedRange}
            disabled={isBookedDate}
            mode="range"
            locale="nb-NO"
            weekStartsOn={1}
            variant="card"
            size="lg"
          />
        </div>
        
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Booking detaljer</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{bookingTypeLabels[bookingType]}</span>
              </div>
              
              {selectedRange[0] && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fra:</span>
                  <span className="font-medium">
                    {formatNorwegianDate(selectedRange[0])}
                  </span>
                </div>
              )}
              
              {selectedRange[1] && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Til:</span>
                  <span className="font-medium">
                    {formatNorwegianDate(selectedRange[1])}
                  </span>
                </div>
              )}
              
              {calculateDays() > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Varighet:</span>
                  <span className="font-medium">{calculateDays()} dager</span>
                </div>
              )}
            </div>
            
            {selectedRange[0] && selectedRange[1] && (
              <Button className="w-full mt-6">
                Bekreft booking
              </Button>
            )}
          </Card>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-200 rounded border border-red-300" />
              <span>Opptatt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>Valgt periode</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded" />
              <span>Valgt område</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

// Multiple Months Display
export const MultipleMonthsDisplay: Story = {
  render: () => {
    const [dateRange, setDateRange] = useState<readonly [Date | null, Date | null]>([
      new Date(2024, 2, 15),
      new Date(2024, 3, 8)
    ]);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Flermåneds visning</h3>
          <p className="text-sm text-muted-foreground">
            Vis flere måneder samtidig for enklere navigasjon
          </p>
        </div>
        
        <div className="flex justify-center">
          <Calendar
            selectedRange={dateRange}
            onRangeSelect={setDateRange}
            mode="range"
            numberOfMonths={2}
            locale="nb-NO"
            weekStartsOn={1}
            variant="card"
          />
        </div>
        
        {dateRange[0] && dateRange[1] && (
          <div className="text-center">
            <Card className="inline-block p-4">
              <div className="text-sm">
                <strong>Valgt periode:</strong> {formatNorwegianDate(dateRange[0])} - {formatNorwegianDate(dateRange[1])}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.ceil((dateRange[1].getTime() - dateRange[0].getTime()) / (1000 * 60 * 60 * 24)) + 1} dager totalt
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }
};

// Accessibility Showcase
export const AccessibilityShowcase: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Kalenderen støtter full tastaturnavigasjon og skjermlesere i henhold til WCAG AAA standarder.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Tilgjengelighetsfunksjoner</h3>
        <Calendar
          locale="nb-NO"
          weekStartsOn={1}
          variant="card"
          ariaLabel="Vårens kalender med full tastaturnavigasjon"
        />
      </div>
      
      <div className="text-sm text-muted-foreground space-y-2">
        <h4 className="font-medium text-foreground">Tastaturnavigasjon:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Piltaster</kbd> - Naviger mellom datoer</li>
          <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Page Up/Down</kbd> - Bytt måned (Shift + år)</li>
          <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Home/End</kbd> - Gå til første/siste dag i måneden</li>
          <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter/Space</kbd> - Velg dato</li>
          <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Escape</kbd> - Lukk kalender (i modal)</li>
        </ul>
        
        <h4 className="font-medium text-foreground pt-4">Skjermleser-støtte:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>ARIA-etiketter for alle datoer og navigasjonselementer</li>
          <li>Live-region for måneds- og årsendringer</li>
          <li>Semantic HTML med riktige roller</li>
          <li>Beskrivende tekst for valgte datoer og tilstander</li>
          <li>Fokus-indikatorer for alle interaktive elementer</li>
        </ul>
      </div>
    </div>
  )
};

// Playground
export const Playground: Story = {
  args: {
    variant: 'card',
    size: 'md',
    mode: 'single',
    locale: 'nb-NO',
    weekStartsOn: 1,
    showOutsideDays: true,
    fixedWeeks: false
  }
};