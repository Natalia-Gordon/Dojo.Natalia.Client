import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from './AuthContext';
import { useTrainingSessions } from './TrainingSessionContext';
import { Calendar, Clock, MessageSquare } from 'lucide-react';

interface ScheduleHelpDialogProps {
  children: ReactNode;
  type: 'technique' | 'training';
  itemId: string;
  itemTitle: string;
  lessonTitle?: string;
}

export function ScheduleHelpDialog({ 
  children, 
  type, 
  itemId, 
  itemTitle,
  lessonTitle 
}: ScheduleHelpDialogProps) {
  const { user } = useAuth();
  const { requestHelp } = useTrainingSessions();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message || !preferredDate || !preferredTime) return;

    requestHelp({
      studentId: user.id,
      studentName: user.username,
      studentAvatar: user.avatar,
      type,
      itemId,
      itemTitle,
      lessonTitle,
      message,
      preferredDate,
      preferredTime
    });

    // Reset form and close dialog
    setMessage('');
    setPreferredDate('');
    setPreferredTime('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Request Teacher Help</DialogTitle>
          <DialogDescription className="text-gray-400">
            Schedule a one-on-one training session with a teacher for {itemTitle}
            {lessonTitle && ` - ${lessonTitle}`}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>What do you need help with?</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the specific areas where you're struggling..."
              className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-300 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Preferred Date</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-gray-300 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Preferred Time</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Request Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
