import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Plus, Trash2, Search, Filter, X, AlertTriangle, Check } from 'lucide-react';
import './EventCalendar.css'; // Import the CSS file

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const calendarRef = useRef(null);

  // Event categories with colors
  const categories = [
    { id: 'work', name: 'Work', color: 'category-work' },
    { id: 'personal', name: 'Personal', color: 'category-personal' },
    { id: 'health', name: 'Health', color: 'category-health' },
    { id: 'social', name: 'Social', color: 'category-social' },
    { id: 'other', name: 'Other', color: 'category-other' }
  ];

  // Initial event form state
  const initialEventForm = {
    title: '',
    date: '',
    time: '',
    description: '',
    category: 'work',
    recurrence: 'none',
    customRecurrence: 1,
    weeklyDays: [],
    endDate: ''
  };

  const [eventForm, setEventForm] = useState(initialEventForm);

  useEffect(() => {
  }, []);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Generate recurring events
  const generateRecurringEvents = (baseEvent, startDate, endDate) => {
    const events = [];
    const current = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate.getFullYear() + 1, 11, 31);
    
    while (current <= end) {
      const eventDate = new Date(current);
      
      switch (baseEvent.recurrence) {
        case 'daily':
          events.push({
            ...baseEvent,
            id: `${baseEvent.id}-${eventDate.toISOString().split('T')[0]}`,
            date: eventDate.toISOString().split('T')[0],
            isRecurring: true,
            parentId: baseEvent.id
          });
          current.setDate(current.getDate() + 1);
          break;
          
        case 'weekly':
          if (baseEvent.weeklyDays.includes(current.getDay())) {
            events.push({
              ...baseEvent,
              id: `${baseEvent.id}-${eventDate.toISOString().split('T')[0]}`,
              date: eventDate.toISOString().split('T')[0],
              isRecurring: true,
              parentId: baseEvent.id
            });
          }
          current.setDate(current.getDate() + 1);
          break;
          
        case 'monthly':
          if (current.getDate() === startDate.getDate()) {
            events.push({
              ...baseEvent,
              id: `${baseEvent.id}-${eventDate.toISOString().split('T')[0]}`,
              date: eventDate.toISOString().split('T')[0],
              isRecurring: true,
              parentId: baseEvent.id
            });
          }
          current.setDate(current.getDate() + 1);
          break;
          
        case 'custom':
          events.push({
            ...baseEvent,
            id: `${baseEvent.id}-${eventDate.toISOString().split('T')[0]}`,
            date: eventDate.toISOString().split('T')[0],
            isRecurring: true,
            parentId: baseEvent.id
          });
          current.setDate(current.getDate() + (baseEvent.customRecurrence || 1));
          break;
          
        default:
          return [baseEvent];
      }
    }
    
    return events;
  };

  // Get all events including recurring ones
  const getAllEvents = () => {
    const allEvents = [];
    
    events.forEach(event => {
      if (event.recurrence && event.recurrence !== 'none') {
        const startDate = new Date(event.date);
        const endDate = event.endDate ? new Date(event.endDate) : null;
        const recurringEvents = generateRecurringEvents(event, startDate, endDate);
        allEvents.push(...recurringEvents);
      } else {
        allEvents.push(event);
      }
    });
    
    return allEvents;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const allEvents = getAllEvents();
    
    let filteredEvents = allEvents.filter(event => event.date === dateStr);
    
    // Apply search filter
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.category === filterCategory);
    }
    
    return filteredEvents.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Check for event conflicts
  const checkEventConflicts = (newEvent, excludeId = null) => {
    const allEvents = getAllEvents();
    const conflicts = allEvents.filter(event => 
      event.id !== excludeId &&
      event.date === newEvent.date &&
      event.time === newEvent.time
    );
    
    return conflicts;
  };

  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    if (!eventForm.title.trim() || !eventForm.date || !eventForm.time) {
      alert('Please fill in all required fields');
      return;
    }
    
    const eventData = {
      ...eventForm,
      id: editingEvent ? editingEvent.id : Date.now().toString(),
      createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString()
    };

    // Check for conflicts
    const conflicts = checkEventConflicts(eventData, editingEvent?.id);
    if (conflicts.length > 0) {
      setConflictInfo({ event: eventData, conflicts });
      setShowConflictModal(true);
      return;
    }

    saveEvent(eventData);
  };

  const saveEvent = (eventData) => {
    if (editingEvent) {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? eventData : event
      ));
    } else {
      setEvents(prev => [...prev, eventData]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setEventForm(initialEventForm);
    setShowEventForm(false);
    setEditingEvent(null);
    setSelectedDate(null);
  };

  // Handle event deletion
  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  // Handle drag and drop
  const handleDragStart = (e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetDate) => {
    e.preventDefault();
    
    if (!draggedEvent) return;
    
    const newDate = targetDate.toISOString().split('T')[0];
    const updatedEvent = { ...draggedEvent, date: newDate };
    
    // Check for conflicts
    const conflicts = checkEventConflicts(updatedEvent, draggedEvent.id);
    if (conflicts.length > 0) {
      setConflictInfo({ event: updatedEvent, conflicts });
      setShowConflictModal(true);
      setDraggedEvent(null);
      return;
    }
    
    if (draggedEvent.isRecurring) {
      // For recurring events, create a new non-recurring event
      const newEvent = {
        ...draggedEvent,
        id: Date.now().toString(),
        date: newDate,
        isRecurring: false,
        parentId: undefined,
        recurrence: 'none'
      };
      setEvents(prev => [...prev, newEvent]);
    } else {
      // Update the original event
      setEvents(prev => prev.map(event => 
        event.id === draggedEvent.id ? updatedEvent : event
      ));
    }
    
    setDraggedEvent(null);
  };

  // Navigation functions
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'category-other';
  };

  return (
    <div className="calendar-container">
      <div className="calendar-main">
        {/* Header */}
        <div className="calendar-header">
          <div className="header-top">
            <h1 className="header-title">
              <Calendar className="header-title-icon" />
              Event Calendar
            </h1>
            <button
              onClick={() => {
                setShowEventForm(true);
                setSelectedDate(new Date());
                setEventForm({
                  ...initialEventForm,
                  date: new Date().toISOString().split('T')[0]
                });
              }}
              className="add-event-btn"
            >
              <Plus className="add-event-icon" />
              Add Event
            </button>
          </div>
          
          {/* Search and Filter */}
          <div className="search-filter-section">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-container">
              <Filter className="filter-icon" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Month Navigation */}
          <div className="month-navigation">
            <button
              onClick={() => navigateMonth(-1)}
              className="nav-button"
            >
              ← Previous
            </button>
            <h2 className="month-title">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="nav-button"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-content">
          <div className="weekdays-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday-cell">
                {day}
              </div>
            ))}
          </div>
          
          <div className="calendar-grid" ref={calendarRef}>
            {generateCalendarDays().map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDay = isToday(date);
              
              return (
                <div
                  key={index}
                  className={`calendar-day ${!isCurrentMonthDay ? 'other-month' : ''} ${isTodayDay ? 'today' : ''}`}
                  onClick={() => {
                    setSelectedDate(date);
                    setShowEventForm(true);
                    setEventForm({
                      ...initialEventForm,
                      date: date.toISOString().split('T')[0]
                    });
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date)}
                >
                  <div className={`day-number ${isTodayDay ? 'today' : ''}`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="events-container">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event)}
                        className={`event-item ${getCategoryColor(event.category)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEvent(event);
                          setEventForm({
                            title: event.title,
                            date: event.date,
                            time: event.time,
                            description: event.description,
                            category: event.category,
                            recurrence: event.recurrence || 'none',
                            customRecurrence: event.customRecurrence || 1,
                            weeklyDays: event.weeklyDays || [],
                            endDate: event.endDate || ''
                          });
                          setShowEventForm(true);
                        }}
                      >
                        <div className="event-time">
                          <Clock className="event-time-icon" />
                          {event.time}
                        </div>
                        <div className="event-title">{event.title}</div>
                      </div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="more-events">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title-section">
                <h3 className="modal-title">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <button
                  onClick={resetForm}
                  className="modal-close-btn"
                >
                  <X className="modal-close-icon" />
                </button>
              </div>
              
              <div className="form-container">
                <div className="form-group">
                  <label className="form-label">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({...prev, title: e.target.value}))}
                    className="form-input"
                    placeholder="Enter event title"
                  />
                </div>
                
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm(prev => ({...prev, date: e.target.value}))}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={eventForm.time}
                      onChange={(e) => setEventForm(prev => ({...prev, time: e.target.value}))}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({...prev, description: e.target.value}))}
                    className="form-textarea"
                    rows="3"
                    placeholder="Enter event description"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Category
                  </label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm(prev => ({...prev, category: e.target.value}))}
                    className="form-select"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Recurrence
                  </label>
                  <select
                    value={eventForm.recurrence}
                    onChange={(e) => setEventForm(prev => ({...prev, recurrence: e.target.value}))}
                    className="form-select"
                  >
                    <option value="none">No Recurrence</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                {eventForm.recurrence === 'weekly' && (
                  <div className="form-group">
                    <label className="form-label">
                      Select Days
                    </label>
                    <div className="weekly-days-grid">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <label key={day} className="day-checkbox-label">
                          <input
                            type="checkbox"
                            checked={eventForm.weeklyDays.includes(index)}
                            onChange={(e) => {
                              const days = [...eventForm.weeklyDays];
                              if (e.target.checked) {
                                days.push(index);
                              } else {
                                const dayIndex = days.indexOf(index);
                                if (dayIndex > -1) days.splice(dayIndex, 1);
                              }
                              setEventForm(prev => ({...prev, weeklyDays: days}));
                            }}
                            className="day-checkbox"
                          />
                          <span className="day-checkbox-text">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {eventForm.recurrence === 'custom' && (
                  <div className="form-group">
                    <label className="form-label">
                      Repeat every (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={eventForm.customRecurrence}
                      onChange={(e) => setEventForm(prev => ({...prev, customRecurrence: parseInt(e.target.value)}))}
                      className="form-input"
                    />
                  </div>
                )}
                
                {eventForm.recurrence !== 'none' && (
                  <div className="form-group">
                    <label className="form-label">
                      End Date (optional)
                    </label>
                    <input
                      type="date"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm(prev => ({...prev, endDate: e.target.value}))}
                      className="form-input"
                      min={eventForm.date}
                    />
                  </div>
                )}
                
                <div className="button-group">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary"
                  >
                    {editingEvent ? 'Update Event' : 'Add Event'}
                  </button>
                  
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteEvent(editingEvent.id);
                        resetForm();
                      }}
                      className="btn-danger"
                    >
                      <Trash2 className="delete-icon" />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Resolution Modal */}
      {showConflictModal && conflictInfo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="conflict-modal-header">
                <AlertTriangle className="conflict-icon" />
                <h3 className="conflict-title">Event Conflict Detected</h3>
              </div>
              
              <div>
                <p className="conflict-description">
                  The following events conflict with your new event:
                </p>
                <div className="conflict-list">
                  {conflictInfo.conflicts.map(conflict => (
                    <div key={conflict.id} className="conflict-item">
                      <div className={`conflict-item-color ${getCategoryColor(conflict.category)}`}></div>
                      <span className="conflict-item-title">{conflict.title}</span>
                      <span className="conflict-item-time">at {conflict.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="conflict-buttons">
                <button
                  onClick={() => {
                    saveEvent(conflictInfo.event);
                    setShowConflictModal(false);
                    setConflictInfo(null);
                  }}
                  className="btn-resolve"
                >
                  <Check className="resolve-icon" />
                  Save Anyway
                </button>
                <button
                  onClick={() => {
                    setShowConflictModal(false);
                    setConflictInfo(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
