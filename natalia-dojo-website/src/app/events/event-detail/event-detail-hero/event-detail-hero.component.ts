import { Component, Input } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-event-detail-hero',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './event-detail-hero.component.html',
  styleUrl: './event-detail-hero.component.css'
})
export class EventDetailHeroComponent {
  @Input() eventTitle: string | null = null;
  @Input() eventDescription: string | null = null;
  @Input() eventType: string | null = null;
  @Input() startDateTime: string | null = null;
  @Input() price: number = 0;
  @Input() earlyBirdPrice: number | null = null;
  @Input() earlyBirdDeadline: string | null = null;

  /**
   * Generate a compelling martial arts marketing summary
   */
  getDescriptionSummary(): string {
    if (!this.eventDescription && !this.eventTitle) {
      return 'הצטרפו אלינו לחוויה ייחודית של למידה והתפתחות באומנויות הלחימה';
    }

    // Extract first meaningful sentence from description
    let baseText = '';
    if (this.eventDescription) {
      const plainText = this.eventDescription
        .replace(/<[^>]*>/g, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Get first sentence or first 100 characters
      const firstSentence = plainText.split(/[.!?]/)[0].trim();
      baseText = firstSentence.length > 0 && firstSentence.length < 120 
        ? firstSentence 
        : plainText.substring(0, 100).trim();
    }

    // Build compelling summary with martial arts marketing language
    const eventTypeText = this.getEventTypeText();
    const dateText = this.getFormattedDate();

    let summary = '';
    
    if (baseText) {
      summary = baseText;
      if (!summary.endsWith('.') && !summary.endsWith('!') && !summary.endsWith('?')) {
        summary += '.';
      }
      summary += ' ';
    }

    // Add compelling call-to-action elements
    summary += `הזדמנות ייחודית להעמיק את הידע והמיומנויות שלכם ב${eventTypeText} מקצועי`;
    
    if (dateText) {
      summary += ` שיתקיים ב${dateText}`;
    }

    return summary;
  }

  private getEventTypeText(): string {
    const typeMap: { [key: string]: string } = {
      'Seminar': 'סמינר',
      'Workshop': 'סדנה',
      'Masterclass': 'כיתת אמן',
      'Grading': 'מבחן דרגה',
      'Retreat': 'ריטריט',
      'Special': 'אירוע מיוחד'
    };
    return typeMap[this.eventType || ''] || 'אירוע';
  }

  private getFormattedDate(): string {
    if (!this.startDateTime) return '';
    try {
      const date = new Date(this.startDateTime);
      const day = date.getDate();
      const month = date.toLocaleDateString('he-IL', { month: 'long' });
      const year = date.getFullYear();
      return `${day} ב${month} ${year}`;
    } catch {
      return '';
    }
  }
}
