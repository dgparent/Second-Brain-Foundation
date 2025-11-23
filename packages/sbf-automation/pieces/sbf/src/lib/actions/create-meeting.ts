import { createAction, Property } from '@activepieces/pieces-framework';
import { sbfAuth, SBFAuthValue } from '../auth';
import { SBFClient } from '../common/sbf-client';

export const createMeetingAction = createAction({
  auth: sbfAuth,
  name: 'create_meeting',
  displayName: 'Create Meeting',
  description: 'Create a new meeting record in SBF',
  props: {
    client_uid: Property.ShortText({
      displayName: 'Client UID',
      description: 'VA client identifier',
      required: true,
    }),
    title: Property.ShortText({
      displayName: 'Meeting Title',
      description: 'Brief title for the meeting',
      required: true,
    }),
    scheduled_time: Property.DateTime({
      displayName: 'Scheduled Time',
      description: 'When the meeting is scheduled',
      required: true,
    }),
    duration_minutes: Property.Number({
      displayName: 'Duration (minutes)',
      description: 'Meeting duration in minutes',
      required: true,
      defaultValue: 30,
    }),
    platform: Property.StaticDropdown({
      displayName: 'Platform',
      description: 'Meeting platform',
      required: false,
      defaultValue: 'zoom',
      options: {
        options: [
          { label: 'Zoom', value: 'zoom' },
          { label: 'Google Meet', value: 'google_meet' },
          { label: 'Microsoft Teams', value: 'teams' },
          { label: 'Cal.com', value: 'calcom' },
          { label: 'Phone', value: 'phone' },
          { label: 'In Person', value: 'in_person' },
        ],
      },
    }),
    meeting_link: Property.ShortText({
      displayName: 'Meeting Link',
      description: 'URL to join the meeting',
      required: false,
    }),
    attendees: Property.Array({
      displayName: 'Attendees',
      description: 'List of attendee emails',
      required: false,
    }),
    agenda: Property.LongText({
      displayName: 'Agenda',
      description: 'Meeting agenda or notes',
      required: false,
    }),
  },
  
  async run(context) {
    const auth = context.auth as SBFAuthValue;
    const client = new SBFClient(auth);
    
    const {
      client_uid,
      title,
      scheduled_time,
      duration_minutes,
      platform,
      meeting_link,
      attendees,
      agenda,
    } = context.propsValue;
    
    // Construct meeting entity
    const meetingEntity = {
      type: 'va.meeting',
      client_uid,
      title,
      scheduled_time: new Date(scheduled_time).toISOString(),
      duration_minutes,
      platform: platform || 'zoom',
      meeting_link: meeting_link || null,
      attendees: attendees || [],
      agenda: agenda || '',
      status: 'scheduled',
      created_at: new Date().toISOString(),
      source: 'activepieces',
      source_metadata: {
        piece: 'sbf',
        action: 'create_meeting',
        execution_id: context.run.id,
      },
    };
    
    // Create entity in SBF
    const response = await client.createEntity(meetingEntity);
    
    if (!response.success) {
      throw new Error(`Failed to create meeting: ${response.error}`);
    }
    
    return {
      success: true,
      meeting: response.data,
      uid: response.data?.uid,
      message: `Meeting created successfully for client ${client_uid}`,
    };
  },
});
