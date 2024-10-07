'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Send,
  Inbox,
  Mail,
  Archive,
  Star,
  Trash2,
  FileText,
  Paperclip,
  X
} from 'lucide-react';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  attachments: string[];
}

const mockEmails: Email[] = [
  {
    id: '1',
    from: 'john@example.com',
    to: 'me@example.com',
    subject: 'Meeting Tomorrow',
    body: 'Hi, just a reminder about our meeting tomorrow at 2 PM. Please bring your project updates and any questions you might have. Looking forward to our discussion!',
    date: '2023-05-15T10:30:00',
    read: false,
    starred: true,
    attachments: ['meeting_agenda.pdf']
  },
  {
    id: '2',
    from: 'sarah@example.com',
    to: 'me@example.com',
    subject: 'Project Update',
    body: "Here's the latest update on the project. We've made significant progress on the frontend development and are now moving on to backend integration. Let me know if you have any questions or concerns about the current status.",
    date: '2023-05-14T15:45:00',
    read: true,
    starred: false,
    attachments: ['project_update.docx', 'timeline.xlsx']
  },
  {
    id: '3',
    from: 'marketing@company.com',
    to: 'me@example.com',
    subject: 'New Campaign Ideas',
    body: "I've put together some ideas for our upcoming marketing campaign. These concepts focus on our core values and target audience preferences. I'd love to get your thoughts on these before our team meeting next week.",
    date: '2023-05-13T09:15:00',
    read: true,
    starred: true,
    attachments: ['campaign_ideas.pptx']
  },
  {
    id: '4',
    from: 'support@service.com',
    to: 'me@example.com',
    subject: 'Your Recent Inquiry',
    body: "Thank you for contacting our support team. We've looked into your inquiry and have some information that might help resolve your issue. Please review the attached document and let us know if you need any further assistance.",
    date: '2023-05-12T14:20:00',
    read: false,
    starred: false,
    attachments: ['support_response.pdf']
  },
  {
    id: '5',
    from: 'team@project.com',
    to: 'me@example.com',
    subject: 'Weekly Team Update',
    body: "Here's our weekly team update. We've made great strides in several areas of the project. Please review the attached summary and let me know if you have any questions or concerns about our progress.",
    date: '2023-05-11T16:00:00',
    read: true,
    starred: false,
    attachments: ['weekly_update.pdf', 'team_metrics.xlsx']
  }
];

export default function ChatPage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [replyEmail, setReplyEmail] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('inbox');

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReply = () => {
    if (selectedEmail) {
      const sentEmail: Email = {
        id: Date.now().toString(),
        from: 'me@example.com',
        to: selectedEmail.from,
        subject: `Re: ${selectedEmail.subject}`,
        body: replyEmail.body,
        date: new Date().toISOString(),
        read: true,
        starred: false,
        attachments: []
      };
      setEmails([sentEmail, ...emails]);
      setReplyEmail({ to: '', subject: '', body: '' });
    }
  };

  const toggleStar = (emailId: string) => {
    setEmails(
      emails.map((email) =>
        email.id === emailId ? { ...email, starred: !email.starred } : email
      )
    );
  };

  const deleteEmail = (emailId: string) => {
    setEmails(emails.filter((email) => email.id !== emailId));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Card className="flex w-64 flex-shrink-0 flex-col rounded-none border-r">
        <CardHeader className="flex-shrink-0 px-6 py-4">
          <CardTitle className="text-xl font-bold">Inbox</CardTitle>
          <CardDescription>
            <div className="mt-2 flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
            </div>
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="inbox" className="flex flex-grow flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="inbox" onClick={() => setCurrentTab('inbox')}>
              <Inbox className="mr-2 h-4 w-4" />
              Inbox
            </TabsTrigger>
            <TabsTrigger
              value="starred"
              onClick={() => setCurrentTab('starred')}
            >
              <Star className="mr-2 h-4 w-4" />
              Starred
            </TabsTrigger>
          </TabsList>
          <TabsContent value="inbox" className="m-0 flex-grow p-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`cursor-pointer p-3 hover:bg-accent ${
                    selectedEmail?.id === email.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${email.from}`}
                      />
                      <AvatarFallback>
                        {email.from[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p
                        className={`text-sm font-semibold ${
                          !email.read ? 'text-primary' : ''
                        }`}
                      >
                        {email.from}
                      </p>
                      <p className="truncate text-xs font-medium">
                        {email.subject}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
      <Card className="flex flex-grow flex-col rounded-none">
        {selectedEmail ? (
          <>
            <CardHeader className="flex-shrink-0 border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">
                  {selectedEmail.subject}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleStar(selectedEmail.id)}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        selectedEmail.starred
                          ? 'fill-yellow-400 text-yellow-400'
                          : ''
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEmail(selectedEmail.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedEmail(null)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto p-6">
              <div className="mb-4 flex items-center space-x-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedEmail.from}`}
                  />
                  <AvatarFallback>
                    {selectedEmail.from[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedEmail.from}</p>
                  <p className="text-sm text-muted-foreground">
                    to {selectedEmail.to} |{' '}
                    {new Date(selectedEmail.date).toLocaleString()}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
              {selectedEmail.attachments.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-2 font-semibold">Attachments:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <Badge key={index} variant="secondary">
                        <FileText className="mr-2 h-4 w-4" />
                        {attachment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Select an email to read</p>
          </CardContent>
        )}
      </Card>
      <Card className="flex w-80 flex-shrink-0 flex-col rounded-none border-l">
        <CardHeader className="flex-shrink-0 border-b px-6 py-4">
          <CardTitle className="text-xl font-bold">Reply</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto p-6">
          {selectedEmail ? (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">To: {selectedEmail.from}</p>
                <p className="text-sm text-muted-foreground">
                  Subject: Re: {selectedEmail.subject}
                </p>
              </div>
              <Textarea
                placeholder="Write your reply here..."
                value={replyEmail.body}
                onChange={(e) =>
                  setReplyEmail({ ...replyEmail, body: e.target.value })
                }
                rows={10}
                className="w-full"
              />
              <Button onClick={handleSendReply} className="w-full">
                <Send className="mr-2 h-4 w-4" /> Send Reply
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Select an email to reply</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
