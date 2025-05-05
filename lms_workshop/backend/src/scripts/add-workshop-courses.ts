import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { WorkshopsService } from '../workshops/workshops.service';
import { CoursesService } from '../courses/courses.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const workshopsService = app.get(WorkshopsService);
  const coursesService = app.get(CoursesService);

  try {
    // Create the workshop
    const workshop = await workshopsService.create({
      title: 'Comprehensive Programming Workshop',
      description: 'A complete workshop covering essential programming concepts and practices',
      instructor: 'Pratik Khanapurkar',
      scheduledAt: new Date('2024-05-05T09:00:00'),
      preparatoryMaterials: 'Bring your laptop with your preferred IDE installed',
      category: 'Programming',
      maxParticipants: 30,
      isActive: true
    });

    console.log(`Created workshop: ${workshop.title} (ID: ${workshop.id})`);

    // Course schedules - 3 times a week (Monday, Wednesday, Friday)
    const startDate = new Date('2024-05-05'); // May 5th, 2024
    const courseDays = [1, 3, 5]; // Monday, Wednesday, Friday (0 = Sunday, 1 = Monday, etc.)
    
    // Course titles and descriptions
    const courseSubjects = [
      { title: 'Introduction to Programming', description: 'Fundamentals of programming concepts and logic' },
      { title: 'Data Structures', description: 'Understanding various data structures and their applications' },
      { title: 'Algorithms', description: 'Essential algorithms and problem-solving techniques' },
      { title: 'Object-Oriented Programming', description: 'OOP principles and design patterns' },
      { title: 'Web Development Basics', description: 'Introduction to HTML, CSS, and JavaScript' },
      { title: 'Backend Development', description: 'Server-side programming and database management' },
      { title: 'Frontend Frameworks', description: 'Modern frontend frameworks like React, Angular, or Vue' },
      { title: 'Mobile App Development', description: 'Building mobile applications for iOS and Android' },
      { title: 'DevOps and Deployment', description: 'Continuous integration, delivery, and deployment practices' },
      { title: 'Advanced Topics', description: 'Machine learning, blockchain, and other cutting-edge technologies' }
    ];

    // Create 10 courses with Jitsi Meet links
    for (let i = 0; i < courseSubjects.length; i++) {
      const { title, description } = courseSubjects[i];
      
      // Generate course schedule dates
      const scheduleDates: Date[] = [];
      let currentDate = new Date(startDate);
      
      // Add 4 weeks of sessions (3 per week = 12 sessions per course)
      for (let week = 0; week < 4; week++) {
        for (const dayOfWeek of courseDays) {
          // Move to the correct day of the week
          while (currentDate.getDay() !== dayOfWeek) {
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          scheduleDates.push(new Date(currentDate));
          
          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      
      // Format the schedule as text
      const scheduleText = scheduleDates.map(date => 
        `- ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at 9:00 AM`
      ).join('\n');
      
      // Create a unique Jitsi Meet room name based on the course title
      const jitsiRoomId = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const jitsiMeetLink = `https://meet.jit.si/${jitsiRoomId}`;
      
      // Create the course with Jitsi Meet link and schedule
      const course = await coursesService.create({
        title,
        description: `${description}\n\nSchedule:\n${scheduleText}\n\nJitsi Meet Link: ${jitsiMeetLink}`,
        instructor: 'Pratik Khanapurkar',
        associatedWorkshop: workshop.id.toString(),
        maxStudents: 25,
        totalWeeks: 4,
        totalModules: 12
      });
      
      console.log(`Created course: ${course.title} (ID: ${course.id})`);
    }

    console.log('Workshop and courses created successfully!');
  } catch (error) {
    console.error('Error creating workshop and courses:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap(); 