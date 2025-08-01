/**
 * Microsoft Teams Integration
 * Provides Teams SDK configuration and component generation
 */

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

export interface GenerationResult {
  success: boolean;
  files: string[];
  errors?: string[];
  warnings?: string[];
}

export interface IntegrationOptions {
  projectName: string;
  outputPath?: string;
  framework?: 'react' | 'nextjs' | 'remix' | 'svelte' | 'vue';
  typescript?: boolean;
  features?: ('bot' | 'messaging' | 'meetings' | 'notifications' | 'tabs' | 'oauth')[];
  appId?: string;
  appPassword?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
}

export interface TeamsConfig {
  appId: string;
  appPassword: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  botEndpoint: string;
  scopes: string[];
  features: {
    bot: boolean;
    messaging: boolean;
    meetings: boolean;
    notifications: boolean;
    tabs: boolean;
    oauth: boolean;
  };
}

/**
 * Teams SDK Configuration
 */
export class TeamsSdkConfig {
  private config: TeamsConfig;

  constructor(options: Partial<IntegrationOptions> = {}) {
    this.config = {
      appId: options.appId || process.env.TEAMS_APP_ID || '',
      appPassword: options.appPassword || process.env.TEAMS_APP_PASSWORD || '',
      tenantId: options.tenantId || process.env.TEAMS_TENANT_ID || 'common',
      clientId: options.clientId || process.env.TEAMS_CLIENT_ID || '',
      clientSecret: options.clientSecret || process.env.TEAMS_CLIENT_SECRET || '',
      botEndpoint: process.env.TEAMS_BOT_ENDPOINT || '/api/teams/messages',
      scopes: options.scopes || [
        'User.Read',
        'Team.ReadBasic.All',
        'Channel.ReadBasic.All',
        'Chat.ReadWrite',
        'ChannelMessage.Send',
      ],
      features: {
        bot: options.features?.includes('bot') ?? true,
        messaging: options.features?.includes('messaging') ?? true,
        meetings: options.features?.includes('meetings') ?? true,
        notifications: options.features?.includes('notifications') ?? true,
        tabs: options.features?.includes('tabs') ?? false,
        oauth: options.features?.includes('oauth') ?? false,
      },
    };
  }

  getConfig(): TeamsConfig {
    return this.config;
  }

  getScopes(): string[] {
    return this.config.scopes;
  }

  getGraphEndpoint(): string {
    return 'https://graph.microsoft.com/v1.0';
  }
}

/**
 * Generate Teams integration component
 */
export async function generateTeamsComponent(options: IntegrationOptions): Promise<GenerationResult> {
  const result: GenerationResult = { success: false, files: [], errors: [], warnings: [] };

  try {
    const {
      projectName,
      outputPath,
      framework = 'react',
      typescript = true,
      features = ['notifications', 'messaging'],
    } = options;

    const outputDir = outputPath || path.join(process.cwd(), 'src', 'components', 'teams');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const extension = typescript ? '.tsx' : '.jsx';

    // Teams Notification Component
    if (features.includes('notifications')) {
      const notificationContent = `import React, { useState, useEffect } from 'react';
${typescript ? `
interface TeamsNotificationProps {
  defaultChannel?: string;
  allowChannelSelection?: boolean;
  onSuccess?: (result: { messageId: string; channel: string }) => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface TeamsChannel {
  id: string;
  displayName: string;
  description?: string;
  membershipType: 'standard' | 'private';
}

interface TeamsTeam {
  id: string;
  displayName: string;
  description?: string;
}
` : ''}

/**
 * Teams Notification Component
 * Sends notifications to Microsoft Teams channels
 */
export const TeamsNotification${typescript ? ': React.FC<TeamsNotificationProps>' : ''} = ({
  defaultChannel = '',
  allowChannelSelection = true,
  onSuccess,
  onError,
  className = '',
}) => {
  const [teams, setTeams] = useState${typescript ? '<TeamsTeam[]>' : ''}([]);
  const [channels, setChannels] = useState${typescript ? '<TeamsChannel[]>' : ''}([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(defaultChannel);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageFormat, setMessageFormat] = useState${typescript ? '<"text" | "card">' : ''}('text');

  // Card message fields
  const [cardTitle, setCardTitle] = useState('');
  const [cardSubtitle, setCardSubtitle] = useState('');
  const [cardImage, setCardImage] = useState('');

  // Load teams on component mount
  useEffect(() => {
    if (allowChannelSelection) {
      loadTeams();
    }
  }, [allowChannelSelection]);

  // Load channels when team is selected
  useEffect(() => {
    if (selectedTeam) {
      loadChannels(selectedTeam);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/teams/teams');
      if (!response.ok) throw new Error('Failed to load teams');
      
      const data = await response.json();
      setTeams(data.teams);
      
      // Set first team as default
      if (data.teams.length > 0 && !selectedTeam) {
        setSelectedTeam(data.teams[0].id);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsLoading(false);
    }
  };

  const loadChannels = async (teamId${typescript ? ': string' : ''}) => {
    setIsLoading(true);
    try {
      const response = await fetch(\`/api/teams/teams/\${teamId}/channels\`);
      if (!response.ok) throw new Error('Failed to load channels');
      
      const data = await response.json();
      setChannels(data.channels);
      
      // Set general channel as default
      const generalChannel = data.channels.find((ch${typescript ? ': TeamsChannel' : ''}) => 
        ch.displayName.toLowerCase() === 'general'
      );
      if (generalChannel && !selectedChannel) {
        setSelectedChannel(generalChannel.id);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChannel || (!message.trim() && messageFormat === 'text')) return;
    if (messageFormat === 'card' && !cardTitle.trim()) return;

    setIsSending(true);
    try {
      const payload = messageFormat === 'text' 
        ? { 
            content: message,
            contentType: 'html',
          }
        : {
            contentType: 'html',
            content: '<attachment id="1"></attachment>',
            attachments: [{
              id: '1',
              contentType: 'application/vnd.microsoft.card.adaptive',
              content: {
                type: 'AdaptiveCard',
                version: '1.4',
                body: [
                  {
                    type: 'TextBlock',
                    text: cardTitle,
                    size: 'Large',
                    weight: 'Bolder',
                  },
                  cardSubtitle && {
                    type: 'TextBlock',
                    text: cardSubtitle,
                    wrap: true,
                  },
                  message && {
                    type: 'TextBlock',
                    text: message,
                    wrap: true,
                  },
                  cardImage && {
                    type: 'Image',
                    url: cardImage,
                    size: 'Large',
                  },
                ].filter(Boolean),
              },
            }],
          };

      const response = await fetch('/api/teams/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeam,
          channelId: selectedChannel,
          message: payload,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      onSuccess?.(result);
      
      // Reset form
      setMessage('');
      setCardTitle('');
      setCardSubtitle('');
      setCardImage('');
    } catch (error) {
      console.error('Error sending message:', error);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={\`teams-notification \${className}\`}>
      <div className="space-y-4">
        {allowChannelSelection && (
          <>
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-2">
                Team
              </label>
              {isLoading ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
              ) : (
                <select
                  id="team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isSending}
                >
                  <option value="">Select a team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.displayName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-2">
                Channel
              </label>
              {isLoading ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
              ) : (
                <select
                  id="channel"
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isSending || !selectedTeam}
                >
                  <option value="">Select a channel</option>
                  {channels.map(ch => (
                    <option key={ch.id} value={ch.id}>
                      {ch.membershipType === 'private' ? '🔒' : '#'} {ch.displayName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Format
          </label>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setMessageFormat('text')}
              className={\`px-4 py-2 rounded-lg transition-colors \${
                messageFormat === 'text'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }\`}
            >
              Text Message
            </button>
            <button
              type="button"
              onClick={() => setMessageFormat('card')}
              className={\`px-4 py-2 rounded-lg transition-colors \${
                messageFormat === 'card'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }\`}
            >
              Adaptive Card
            </button>
          </div>
        </div>

        {messageFormat === 'card' && (
          <>
            <div>
              <label htmlFor="cardTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Card Title *
              </label>
              <input
                id="cardTitle"
                type="text"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                placeholder="Enter card title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSending}
              />
            </div>

            <div>
              <label htmlFor="cardSubtitle" className="block text-sm font-medium text-gray-700 mb-2">
                Card Subtitle
              </label>
              <input
                id="cardSubtitle"
                type="text"
                value={cardSubtitle}
                onChange={(e) => setCardSubtitle(e.target.value)}
                placeholder="Enter card subtitle (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSending}
              />
            </div>

            <div>
              <label htmlFor="cardImage" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                id="cardImage"
                type="url"
                value={cardImage}
                onChange={(e) => setCardImage(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSending}
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            {messageFormat === 'text' ? 'Message *' : 'Card Body Text'}
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={messageFormat === 'text' ? 'Enter your message...' : 'Enter card body text (optional)'}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isSending}
          />
          <p className="text-sm text-gray-500 mt-1">
            {messageFormat === 'text' 
              ? 'You can use basic HTML formatting'
              : 'This text will appear in the card body'
            }
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setMessage('');
              setCardTitle('');
              setCardSubtitle('');
              setCardImage('');
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSending}
          >
            Clear
          </button>
          <button
            onClick={handleSendMessage}
            disabled={
              isSending || 
              !selectedChannel || 
              (messageFormat === 'text' && !message.trim()) ||
              (messageFormat === 'card' && !cardTitle.trim())
            }
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};`;

      fs.writeFileSync(path.join(outputDir, `TeamsNotification${extension}`), notificationContent, 'utf-8');
      result.files.push(path.join(outputDir, `TeamsNotification${extension}`));
    }

    // Teams Meeting Component
    if (features.includes('meetings')) {
      const meetingContent = `import React, { useState } from 'react';
${typescript ? `
interface TeamsMeetingProps {
  onMeetingCreated?: (meeting: TeamsMeeting) => void;
  onError?: (error: Error) => void;
  defaultAttendees?: string[];
  className?: string;
}

interface TeamsMeeting {
  id: string;
  joinUrl: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
  attendees: string[];
}
` : ''}

/**
 * Teams Meeting Component
 * Creates and manages Microsoft Teams meetings
 */
export const TeamsMeeting${typescript ? ': React.FC<TeamsMeetingProps>' : ''} = ({
  onMeetingCreated,
  onError,
  defaultAttendees = [],
  className = '',
}) => {
  const [subject, setSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [attendees, setAttendees] = useState(defaultAttendees.join(', '));
  const [description, setDescription] = useState('');
  const [isOnlineMeeting, setIsOnlineMeeting] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState${typescript ? '<TeamsMeeting | null>' : ''}(null);

  const handleCreateMeeting = async () => {
    if (!subject.trim() || !startDate || !startTime) return;

    setIsCreating(true);
    try {
      const startDateTime = new Date(\`\${startDate}T\${startTime}\`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);

      const attendeeEmails = attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      const response = await fetch('/api/teams/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          attendees: attendeeEmails,
          body: {
            contentType: 'html',
            content: description || \`<p>Meeting: \${subject}</p>\`,
          },
          isOnlineMeeting,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const meeting = await response.json();
      setCreatedMeeting(meeting);
      onMeetingCreated?.(meeting);
      
      // Reset form
      setSubject('');
      setStartDate('');
      setStartTime('');
      setDuration('60');
      setAttendees('');
      setDescription('');
    } catch (error) {
      console.error('Error creating meeting:', error);
      onError?.(error${typescript ? ' as Error' : ''});
    } finally {
      setIsCreating(false);
    }
  };

  if (createdMeeting) {
    return (
      <div className={\`teams-meeting success \${className}\`}>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-green-900">
                Meeting Created Successfully
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p><strong>Subject:</strong> {createdMeeting.subject}</p>
                <p><strong>Start:</strong> {new Date(createdMeeting.startDateTime).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(createdMeeting.endDateTime).toLocaleString()}</p>
              </div>
              <div className="mt-4">
                <a
                  href={createdMeeting.joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Meeting
                </a>
                <button
                  onClick={() => setCreatedMeeting(null)}
                  className="ml-3 text-sm text-gray-600 hover:text-gray-700"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={\`teams-meeting \${className}\`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Subject *
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter meeting subject"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isCreating}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isCreating}
            />
          </div>

          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isCreating}
            />
          </div>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isCreating}
          >
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
            <option value="180">3 hours</option>
            <option value="240">4 hours</option>
          </select>
        </div>

        <div>
          <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-2">
            Attendees (email addresses)
          </label>
          <input
            id="attendees"
            type="text"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isCreating}
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate multiple email addresses with commas
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Meeting agenda and details..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isCreating}
          />
        </div>

        <div className="flex items-center">
          <input
            id="isOnlineMeeting"
            type="checkbox"
            checked={isOnlineMeeting}
            onChange={(e) => setIsOnlineMeeting(e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            disabled={isCreating}
          />
          <label htmlFor="isOnlineMeeting" className="ml-2 text-sm text-gray-700">
            Enable Teams online meeting
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setSubject('');
              setStartDate('');
              setStartTime('');
              setDuration('60');
              setAttendees('');
              setDescription('');
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isCreating}
          >
            Clear
          </button>
          <button
            onClick={handleCreateMeeting}
            disabled={isCreating || !subject.trim() || !startDate || !startTime}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Create Meeting
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};`;

      fs.writeFileSync(path.join(outputDir, `TeamsMeeting${extension}`), meetingContent, 'utf-8');
      result.files.push(path.join(outputDir, `TeamsMeeting${extension}`));
    }

    result.success = true;
  } catch (error: any) {
    result.errors?.push(`Teams component generation failed: ${error.message}`);
  }

  return result;
}

/**
 * Generate Teams service
 */
export async function generateTeamsService(options: IntegrationOptions): Promise<GenerationResult> {
  const result: GenerationResult = { success: false, files: [], errors: [], warnings: [] };

  try {
    const {
      projectName,
      outputPath,
      typescript = true,
      features = ['bot', 'messaging', 'notifications'],
    } = options;

    const outputDir = outputPath || path.join(process.cwd(), 'src', 'services', 'teams');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const serviceContent = `${typescript ? `import type { 
  Client,
  TeamsInfo,
  TeamDetails,
  TeamsChannelAccount,
  ConversationReference,
  Activity,
  TurnContext,
  MessageFactory,
  CardFactory,
  Attachment
} from 'botbuilder';` : ''}
import { 
  Client as GraphClient,
  ${typescript ? 'ClientOptions as GraphClientOptions,' : ''}
} from '@microsoft/microsoft-graph-client';
import { 
  BotFrameworkAdapter,
  TeamsInfo,
  MessageFactory,
  CardFactory,
  TurnContext,
} from 'botbuilder';
${features.includes('bot') ? `import { 
  TeamsActivityHandler,
} from 'botbuilder';` : ''}

/**
 * Teams Service for ${projectName}
 * Handles Microsoft Teams integrations
 */
export class TeamsService {
  private graphClient${typescript ? ': GraphClient' : ''};
  private adapter${typescript ? ': BotFrameworkAdapter' : ''};
  ${features.includes('bot') ? `private bot${typescript ? ': TeamsBot' : ''};` : ''}
  private config${typescript ? ': TeamsConfig' : ''};

  constructor(config${typescript ? ': TeamsConfig' : ''}) {
    this.config = config;
    
    // Initialize Graph client
    this.graphClient = this.initializeGraphClient();
    
    // Initialize Bot Framework adapter
    this.adapter = new BotFrameworkAdapter({
      appId: config.appId,
      appPassword: config.appPassword,
    });

    // Set up error handler
    this.adapter.onTurnError = async (context, error) => {
      console.error('Bot error:', error);
      await context.sendActivity('Sorry, an error occurred!');
    };

    ${features.includes('bot') ? `
    // Initialize bot
    if (config.features.bot) {
      this.bot = new TeamsBot();
    }
    ` : ''}
  }

  private initializeGraphClient()${typescript ? ': GraphClient' : ''} {
    return GraphClient.init({
      authProvider: async (done) => {
        try {
          const token = await this.getAccessToken();
          done(null, token);
        } catch (error) {
          done(error${typescript ? ' as Error' : ''}, null);
        }
      },
    });
  }

  private async getAccessToken()${typescript ? ': Promise<string>' : ''} {
    // Implement OAuth flow to get access token
    // This is a simplified example - implement proper OAuth in production
    const response = await fetch(
      \`https://login.microsoftonline.com/\${this.config.tenantId}/oauth2/v2.0/token\`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Teams and Channels Methods
   */
  async getTeams()${typescript ? ': Promise<any[]>' : ''} {
    try {
      const response = await this.graphClient
        .api('/teams')
        .select('id,displayName,description')
        .get();

      return response.value || [];
    } catch (error) {
      console.error('Error getting teams:', error);
      throw error;
    }
  }

  async getChannels(teamId${typescript ? ': string' : ''})${typescript ? ': Promise<any[]>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/teams/\${teamId}/channels\`)
        .select('id,displayName,description,membershipType')
        .get();

      return response.value || [];
    } catch (error) {
      console.error('Error getting channels:', error);
      throw error;
    }
  }

  async getChannelMembers(teamId${typescript ? ': string' : ''}, channelId${typescript ? ': string' : ''})${typescript ? ': Promise<any[]>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/teams/\${teamId}/channels/\${channelId}/members\`)
        .get();

      return response.value || [];
    } catch (error) {
      console.error('Error getting channel members:', error);
      throw error;
    }
  }

  /**
   * Messaging Methods
   */
  async sendChannelMessage(
    teamId${typescript ? ': string' : ''}, 
    channelId${typescript ? ': string' : ''}, 
    message${typescript ? ': any' : ''}
  )${typescript ? ': Promise<any>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/teams/\${teamId}/channels/\${channelId}/messages\`)
        .post({
          body: message,
        });

      return response;
    } catch (error) {
      console.error('Error sending channel message:', error);
      throw error;
    }
  }

  async sendChatMessage(chatId${typescript ? ': string' : ''}, message${typescript ? ': any' : ''})${typescript ? ': Promise<any>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/chats/\${chatId}/messages\`)
        .post({
          body: message,
        });

      return response;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  async sendAdaptiveCard(
    teamId${typescript ? ': string' : ''}, 
    channelId${typescript ? ': string' : ''}, 
    card${typescript ? ': any' : ''}
  )${typescript ? ': Promise<any>' : ''} {
    const message = {
      contentType: 'html',
      content: '<attachment id="1"></attachment>',
      attachments: [{
        id: '1',
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: card,
      }],
    };

    return this.sendChannelMessage(teamId, channelId, message);
  }

  /**
   * Create notification card
   */
  createNotificationCard(
    title${typescript ? ': string' : ''}, 
    text${typescript ? ': string' : ''}, 
    type${typescript ? ": 'info' | 'success' | 'warning' | 'error'" : ''} = 'info'
  )${typescript ? ': any' : ''} {
    const colors = {
      info: '#0078D4',
      success: '#107C10',
      warning: '#FFB900',
      error: '#D13438',
    };

    return {
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'Container',
          style: type,
          items: [
            {
              type: 'TextBlock',
              text: title,
              size: 'Large',
              weight: 'Bolder',
              color: colors[type],
            },
            {
              type: 'TextBlock',
              text: text,
              wrap: true,
            },
          ],
        },
      ],
      msteams: {
        width: 'Full',
      },
    };
  }

  /**
   * Meeting Methods
   */
  async createMeeting(meeting${typescript ? ': any' : ''})${typescript ? ': Promise<any>' : ''} {
    try {
      const response = await this.graphClient
        .api('/me/onlineMeetings')
        .post({
          subject: meeting.subject,
          startDateTime: meeting.startDateTime,
          endDateTime: meeting.endDateTime,
          participants: {
            attendees: meeting.attendees?.map((email${typescript ? ': string' : ''}) => ({
              emailAddress: { address: email },
              type: 'required',
            })) || [],
          },
          isOnlineMeeting: true,
          onlineMeetingProvider: 'teamsForBusiness',
        });

      return response;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  async getMeeting(meetingId${typescript ? ': string' : ''})${typescript ? ': Promise<any>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/me/onlineMeetings/\${meetingId}\`)
        .get();

      return response;
    } catch (error) {
      console.error('Error getting meeting:', error);
      throw error;
    }
  }

  async updateMeeting(meetingId${typescript ? ': string' : ''}, updates${typescript ? ': any' : ''})${typescript ? ': Promise<any>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/me/onlineMeetings/\${meetingId}\`)
        .patch(updates);

      return response;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  async deleteMeeting(meetingId${typescript ? ': string' : ''})${typescript ? ': Promise<void>' : ''} {
    try {
      await this.graphClient
        .api(\`/me/onlineMeetings/\${meetingId}\`)
        .delete();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  ${features.includes('bot') ? `
  /**
   * Bot Methods
   */
  async processActivity(req${typescript ? ': any' : ''}, res${typescript ? ': any' : ''}) {
    await this.adapter.processActivity(req, res, async (context) => {
      if (this.bot) {
        await this.bot.run(context);
      }
    });
  }

  async sendProactiveMessage(
    conversationReference${typescript ? ': ConversationReference' : ''}, 
    message${typescript ? ': string | Attachment' : ''}
  ) {
    await this.adapter.continueConversation(conversationReference, async (context) => {
      const activity = typeof message === 'string' 
        ? MessageFactory.text(message)
        : MessageFactory.attachment(message);
      
      await context.sendActivity(activity);
    });
  }

  async getTeamMembers(teamId${typescript ? ': string' : ''}, context${typescript ? ': TurnContext' : ''})${typescript ? ': Promise<TeamsChannelAccount[]>' : ''} {
    return TeamsInfo.getTeamMembers(context, teamId);
  }

  async getTeamDetails(teamId${typescript ? ': string' : ''}, context${typescript ? ': TurnContext' : ''})${typescript ? ': Promise<TeamDetails>' : ''} {
    return TeamsInfo.getTeamDetails(context, teamId);
  }
  ` : ''}

  /**
   * User Methods
   */
  async getUser(userId${typescript ? ': string' : ''})${typescript ? ': Promise<any>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/users/\${userId}\`)
        .select('id,displayName,mail,jobTitle,department')
        .get();

      return response;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserPhoto(userId${typescript ? ': string' : ''})${typescript ? ': Promise<Buffer>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/users/\${userId}/photo/$value\`)
        .get();

      return response;
    } catch (error) {
      console.error('Error getting user photo:', error);
      throw error;
    }
  }

  /**
   * File Methods
   */
  async uploadFile(
    teamId${typescript ? ': string' : ''}, 
    channelId${typescript ? ': string' : ''}, 
    fileName${typescript ? ': string' : ''}, 
    content${typescript ? ': Buffer | string' : ''}
  )${typescript ? ': Promise<any>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/teams/\${teamId}/channels/\${channelId}/filesFolder/children/\${fileName}/content\`)
        .put(content);

      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getFiles(teamId${typescript ? ': string' : ''}, channelId${typescript ? ': string' : ''})${typescript ? ': Promise<any[]>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/teams/\${teamId}/channels/\${channelId}/filesFolder/children\`)
        .get();

      return response.value || [];
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  }

  /**
   * Tab Methods
   */
  ${features.includes('tabs') ? `
  async addTab(
    teamId${typescript ? ': string' : ''}, 
    channelId${typescript ? ': string' : ''}, 
    tab${typescript ? ': any' : ''}
  )${typescript ? ': Promise<any>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/teams/\${teamId}/channels/\${channelId}/tabs\`)
        .post({
          displayName: tab.displayName,
          'teamsApp@odata.bind': \`https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/\${tab.appId}\`,
          configuration: tab.configuration,
        });

      return response;
    } catch (error) {
      console.error('Error adding tab:', error);
      throw error;
    }
  }

  async getTabs(teamId${typescript ? ': string' : ''}, channelId${typescript ? ': string' : ''})${typescript ? ': Promise<any[]>' : ''} {
    try {
      const response = await this.graphClient
        .api(\`/teams/\${teamId}/channels/\${channelId}/tabs\`)
        .expand('teamsApp')
        .get();

      return response.value || [];
    } catch (error) {
      console.error('Error getting tabs:', error);
      throw error;
    }
  }

  async removeTab(teamId${typescript ? ': string' : ''}, channelId${typescript ? ': string' : ''}, tabId${typescript ? ': string' : ''})${typescript ? ': Promise<void>' : ''} {
    try {
      await this.graphClient
        .api(\`/teams/\${teamId}/channels/\${channelId}/tabs/\${tabId}\`)
        .delete();
    } catch (error) {
      console.error('Error removing tab:', error);
      throw error;
    }
  }
  ` : ''}

  /**
   * Utility Methods
   */
  formatMention(userId${typescript ? ': string' : ''}, displayName${typescript ? ': string' : ''})${typescript ? ': string' : ''} {
    return \`<at>\${displayName}</at>\`;
  }

  createHeroCard(title${typescript ? ': string' : ''}, subtitle${typescript ? ': string' : ''}, text${typescript ? ': string' : ''}, imageUrl${typescript ? '?: string' : ''}) {
    const card = CardFactory.heroCard(title, subtitle, text);
    if (imageUrl) {
      card.content.images = [{ url: imageUrl }];
    }
    return card;
  }

  createThumbnailCard(title${typescript ? ': string' : ''}, subtitle${typescript ? ': string' : ''}, text${typescript ? ': string' : ''}, imageUrl${typescript ? '?: string' : ''}) {
    const card = CardFactory.thumbnailCard(title, subtitle, text);
    if (imageUrl) {
      card.content.images = [{ url: imageUrl }];
    }
    return card;
  }
}

${features.includes('bot') ? `
/**
 * Teams Bot Handler
 */
class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    // Handle messages
    this.onMessage(async (context, next) => {
      const text = context.activity.text?.trim().toLowerCase();
      
      if (text?.includes('hello')) {
        await context.sendActivity('Hello! I\\'m the ${projectName} Teams bot.');
      } else if (text?.includes('help')) {
        await this.sendHelpMessage(context);
      } else if (text?.includes('card')) {
        await this.sendAdaptiveCard(context);
      }

      await next();
    });

    // Handle members added
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded || [];
      
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity(\`Welcome to ${projectName}, <at>\${member.name}</at>!\`);
        }
      }

      await next();
    });

    // Handle reactions
    this.onReactionsAdded(async (context, next) => {
      const reactions = context.activity.reactionsAdded || [];
      
      for (const reaction of reactions) {
        if (reaction.type === 'like') {
          await context.sendActivity('Thanks for the like! 👍');
        }
      }

      await next();
    });
  }

  private async sendHelpMessage(context${typescript ? ': TurnContext' : ''}) {
    const card = {
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: '${projectName} Bot Help',
          size: 'Large',
          weight: 'Bolder',
        },
        {
          type: 'TextBlock',
          text: 'Here are some things you can ask me:',
          wrap: true,
        },
        {
          type: 'Container',
          items: [
            {
              type: 'TextBlock',
              text: '• Say "hello" for a greeting',
              wrap: true,
            },
            {
              type: 'TextBlock',
              text: '• Say "help" for this message',
              wrap: true,
            },
            {
              type: 'TextBlock',
              text: '• Say "card" for an adaptive card example',
              wrap: true,
            },
          ],
        },
      ],
    };

    await context.sendActivity(MessageFactory.attachment(CardFactory.adaptiveCard(card)));
  }

  private async sendAdaptiveCard(context${typescript ? ': TurnContext' : ''}) {
    const card = {
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Adaptive Card Example',
          size: 'Large',
          weight: 'Bolder',
        },
        {
          type: 'TextBlock',
          text: 'This is an example of an adaptive card with actions.',
          wrap: true,
        },
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'Learn More',
          url: 'https://adaptivecards.io/',
        },
        {
          type: 'Action.Submit',
          title: 'Submit',
          data: {
            action: 'submit',
          },
        },
      ],
    };

    await context.sendActivity(MessageFactory.attachment(CardFactory.adaptiveCard(card)));
  }
}
` : ''}

// Create and export service instance
export const teamsService = new TeamsService({
  appId: process.env.TEAMS_APP_ID || '',
  appPassword: process.env.TEAMS_APP_PASSWORD || '',
  tenantId: process.env.TEAMS_TENANT_ID || 'common',
  clientId: process.env.TEAMS_CLIENT_ID || '',
  clientSecret: process.env.TEAMS_CLIENT_SECRET || '',
  botEndpoint: process.env.TEAMS_BOT_ENDPOINT || '/api/teams/messages',
  scopes: ['User.Read', 'Team.ReadBasic.All', 'Channel.ReadBasic.All'],
  features: {
    bot: ${features.includes('bot')},
    messaging: ${features.includes('messaging')},
    meetings: ${features.includes('meetings')},
    notifications: ${features.includes('notifications')},
    tabs: ${features.includes('tabs')},
    oauth: ${features.includes('oauth')},
  },
});

${typescript ? `
// Type definitions
interface TeamsConfig {
  appId: string;
  appPassword: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  botEndpoint: string;
  scopes: string[];
  features: {
    bot: boolean;
    messaging: boolean;
    meetings: boolean;
    notifications: boolean;
    tabs: boolean;
    oauth: boolean;
  };
}
` : ''}`;

    const extension = typescript ? '.ts' : '.js';
    fs.writeFileSync(path.join(outputDir, `teams${extension}`), serviceContent, 'utf-8');
    result.files.push(path.join(outputDir, `teams${extension}`));

    result.success = true;
  } catch (error: any) {
    result.errors?.push(`Teams service generation failed: ${error.message}`);
  }

  return result;
}