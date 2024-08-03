import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MentionComponent } from './mention/mention.component';
import { SuggestionsService } from './suggestions.service';

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
  }

  comments = [
    {
      id: 1,
    },
    {
      id: 2,
    },
    {
      id: 3,
    },
  ];

  onSubmit() {
    console.log('submit');
  }
}
