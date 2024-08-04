import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MentionComponent } from './mention/mention.component';
import { SuggestionsService } from './suggestions.service';
import { FormSubmittedEvent } from '@angular/forms';

type Comment = {
  id: number;
  content: string;
  timestamp: Date;
  author: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, MentionComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'at-demo';

  getSuggestions: SuggestionsService['getSuggestions'];

  constructor(suggestionsService: SuggestionsService) {
    this.getSuggestions = suggestionsService.getSuggestions;

    this.comments = [
      {
        id: 1,
        content: 'We need the whole team to review this',
        timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 10),
        author: 'Kevin',
      },
      {
        id: 2,
        content: 'I think we should add more tests',
        timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 5),
        author: 'Jeff',
      },
      {
        id: 3,
        content: 'I will take a look at this',
        timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 1),
        author: 'Bryan',
      },
    ];
  }

  formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(date);

  comments: Comment[] = [];

  onSubmit(event: SubmitEvent) {
    const form = event.target as HTMLFormElement;
    const commentField = form.querySelector('[contenteditable]')!;
    const mentionsField =
      form.querySelector<HTMLInputElement>('[name="mentions"]')!;

    this.comments.push({
      id: this.comments.length + 1,
      content: commentField.innerHTML || '',
      timestamp: new Date(),
      author: 'You',
    });

    commentField.innerHTML = '';
    mentionsField.value = '';

    console.log('do something with mentions', {
      mentions: mentionsField.value,
    });
  }
}
