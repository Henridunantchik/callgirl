import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  Plus,
  Edit,
  Trash2,
  User,
  DollarSign
} from 'lucide-react';

const BookingCalendar = ({ 
  escortId, 
  isEscort = false, 
  onBookingSubmit,
  onAvailabilityUpdate 
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('1');
  const [bookingType, setBookingType] = useState('in-call');
  const [notes, setNotes] = useState('');
  const [isAddingAvailability, setIsAddingAvailability] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    day: '',
    startTime: '',
    endTime: '',
    price: ''
  });

  // Mock data
  const availability = [
    { day: 'Monday', startTime: '10:00', endTime: '18:00', price: 250 },
    { day: 'Tuesday', startTime: '10:00', endTime: '18:00', price: 250 },
    { day: 'Wednesday', startTime: '12:00', endTime: '20:00', price: 250 },
    { day: 'Thursday', startTime: '10:00', endTime: '18:00', price: 250 },
    { day: 'Friday', startTime: '10:00', endTime: '22:00', price: 300 },
    { day: 'Saturday', startTime: '12:00', endTime: '22:00', price: 300 },
    { day: 'Sunday', startTime: '14:00', endTime: '20:00', price: 350 }
  ];

  const existingBookings = [
    { date: '2024-03-20', time: '14:00', duration: 2, client: 'John D.', status: 'confirmed' },
    { date: '2024-03-22', time: '16:00', duration: 1, client: 'Mike S.', status: 'pending' },
    { date: '2024-03-25', time: '19:00', duration: 3, client: 'Alex R.', status: 'confirmed' }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ];

  const durations = [
    { value: '1', label: '1 Hour', price: 250 },
    { value: '2', label: '2 Hours', price: 450 },
    { value: '3', label: '3 Hours', price: 650 },
    { value: '4', label: '4 Hours', price: 850 },
    { value: 'overnight', label: 'Overnight', price: 1200 }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleBookingSubmit = () => {
    if (!selectedDate || !selectedTime || !selectedDuration) {
      alert('Please fill in all required fields');
      return;
    }

    const booking = {
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
      type: bookingType,
      notes,
      escortId
    };

    onBookingSubmit?.(booking);
    
    // Reset form
    setSelectedDate(null);
    setSelectedTime('');
    setSelectedDuration('1');
    setBookingType('in-call');
    setNotes('');
  };

  const handleAvailabilitySubmit = () => {
    if (!newAvailability.day || !newAvailability.startTime || !newAvailability.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    onAvailabilityUpdate?.(newAvailability);
    setNewAvailability({ day: '', startTime: '', endTime: '', price: '' });
    setIsAddingAvailability(false);
  };

  const getSelectedDurationPrice = () => {
    const duration = durations.find(d => d.value === selectedDuration);
    return duration?.price || 0;
  };

  return (
    <div className="space-y-6">
      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {isEscort ? 'My Availability' : 'Book Appointment'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Calendar component will be displayed here</p>
          </div>
        </CardContent>
      </Card>

      {/* Booking Form */}
      {!isEscort && (
        <Card>
          <CardHeader>
            <CardTitle>Book Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate || ''}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label} - ${duration.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Booking Type</Label>
                <Select value={bookingType} onValueChange={setBookingType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-call">In-Call</SelectItem>
                    <SelectItem value="out-call">Out-Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Any special requests or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">Total Price</p>
                <p className="text-sm text-gray-600">
                  {selectedDuration && `${durations.find(d => d.value === selectedDuration)?.label} - $${getSelectedDurationPrice()}`}
                </p>
              </div>
              <Button onClick={handleBookingSubmit} disabled={!selectedDate || !selectedTime}>
                <Check className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability Management (Escort Only) */}
      {isEscort && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Availability Schedule</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingAvailability(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Availability
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availability.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{slot.day}</p>
                      <p className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">${slot.price}/hr</span>
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Availability Form */}
            {isAddingAvailability && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-3">Add New Availability</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Day</Label>
                    <Select value={newAvailability.day} onValueChange={(value) => setNewAvailability({...newAvailability, day: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Start Time</Label>
                    <Select value={newAvailability.startTime} onValueChange={(value) => setNewAvailability({...newAvailability, startTime: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Select value={newAvailability.endTime} onValueChange={(value) => setNewAvailability({...newAvailability, endTime: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="End" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Price per Hour</Label>
                    <Input
                      type="number"
                      placeholder="250"
                      value={newAvailability.price}
                      onChange={(e) => setNewAvailability({...newAvailability, price: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" onClick={handleAvailabilitySubmit}>
                    <Check className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAddingAvailability(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Bookings */}
      {isEscort && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingBookings.map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{booking.client}</p>
                      <p className="text-sm text-gray-600">
                        {booking.date} at {booking.time} ({booking.duration}h)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingCalendar; 