import { Controller, Get, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Mock data for workshops
const MOCK_WORKSHOPS = {
  'adv-cognitive-techniques': {
    id: 'adv-cognitive-techniques',
    title: 'Advanced Cognitive Techniques',
    instructor: 'Dr. Sarah Johnson',
    date: '2023-06-15',
    time: '15:00 - 17:00',
    description: 'Learn advanced cognitive techniques for psychology practitioners',
    meetingId: 'adv-cognitive-techniques',
    materials: [
      { id: 1, name: 'Slides.pdf', url: '/materials/slides.pdf' },
      { id: 2, name: 'Exercise Sheets.pdf', url: '/materials/exercises.pdf' }
    ]
  }
};

// Mock upcoming sessions
const UPCOMING_SESSIONS = [
  {
    id: 1,
    title: 'Behavioral Therapy Fundamentals',
    date: '2023-07-01',
    time: '14:00 - 16:00',
    instructor: 'Dr. Michael Brown'
  },
  {
    id: 2,
    title: 'Advanced Cognitive Techniques',
    date: '2023-07-15',
    time: '15:00 - 17:00',
    instructor: 'Dr. Sarah Johnson'
  }
];

// Mock pending homework
const PENDING_HOMEWORK = [
  {
    id: 1,
    title: 'CBT Application Exercise',
    workshop: 'Cognitive Behavioral Therapy',
    dueDate: '2023-06-30'
  },
  {
    id: 2,
    title: 'Mindfulness Practice Log',
    workshop: 'Mindfulness Techniques',
    dueDate: '2023-07-10'
  }
];

// Mock recent messages
const RECENT_MESSAGES = [
  {
    id: 1,
    sender: 'Dr. Sarah Johnson',
    subject: 'Workshop Materials',
    preview: 'Here are the materials for the upcoming workshop...',
    date: '2023-06-10'
  },
  {
    id: 2,
    sender: 'Admin',
    subject: 'Schedule Update',
    preview: 'Please note that the next workshop has been rescheduled...',
    date: '2023-06-08'
  }
];

@Controller()
export class WorkshopsController {
  // Get workshop by ID
  // @UseGuards(JwtAuthGuard) - Temporarily removed for development
  @Get('workshops/:id')
  getWorkshopById(@Param('id') id: string) {
    console.log(`Fetching workshop with id: ${id}`);
    
    try {
      // Check if workshop exists in mock data
      if (MOCK_WORKSHOPS[id]) {
        return MOCK_WORKSHOPS[id];
      }
      
      // Return default mock workshop if ID not found
      return {
        id: id,
        title: 'Psychology Workshop',
        instructor: 'Dr. Emily Wilson',
        date: '2023-07-30',
        time: '10:00 - 12:00',
        description: 'A comprehensive workshop on psychology concepts',
        meetingId: id,
        materials: []
      };
    } catch (error) {
      throw new HttpException('Workshop not found', HttpStatus.NOT_FOUND);
    }
  }
  
  // Get next upcoming workshop
  // @UseGuards(JwtAuthGuard) - Temporarily removed for development
  @Get('workshops/next')
  getNextWorkshop() {
    console.log('Fetching next workshop');
    
    try {
      // Return first upcoming session as next workshop
      return UPCOMING_SESSIONS[0];
    } catch (error) {
      throw new HttpException('No upcoming workshops found', HttpStatus.NOT_FOUND);
    }
  }
  
  // Get all upcoming sessions
  // @UseGuards(JwtAuthGuard) - Temporarily removed for development
  @Get('sessions/upcoming')
  getUpcomingSessions() {
    console.log('Fetching upcoming sessions');
    
    try {
      return UPCOMING_SESSIONS;
    } catch (error) {
      throw new HttpException('Error fetching upcoming sessions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // Get pending homework
  // @UseGuards(JwtAuthGuard) - Temporarily removed for development
  @Get('homework/pending')
  getPendingHomework() {
    console.log('Fetching pending homework');
    
    try {
      return PENDING_HOMEWORK;
    } catch (error) {
      throw new HttpException('Error fetching pending homework', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // Get recent messages
  // @UseGuards(JwtAuthGuard) - Temporarily removed for development
  @Get('messages/recent')
  getRecentMessages() {
    console.log('Fetching recent messages');
    
    try {
      return RECENT_MESSAGES;
    } catch (error) {
      throw new HttpException('Error fetching recent messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 