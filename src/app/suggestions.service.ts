import { LocalizedString } from '@angular/compiler';
import { Injectable } from '@angular/core';

export type Suggestion = {
  id: string;
  label: string;
  type: string;
  avatar?: string;
};

const STATIC_SUGGESTIONS: Suggestion[] = [
  {
    id: 'user:1',
    label: 'Kevin',
    type: 'user',
  },
  {
    id: 'user:2',
    label: 'Jeff',
    type: 'user',
  },
  { id: 'user:3', label: 'Bryan', type: 'user' },

  { id: 'user:4', label: 'Gabbey', type: 'user' },
  {
    id: 'user:5',
    label: 'Brian',
    avatar: 'https://avatars.githubusercontent.com/u/2301464?s=96&v=4',
    type: 'user',
  },
];

@Injectable({
  providedIn: 'root',
})
export class SuggestionsService {
  private suggestions: Suggestion[] | null = null;

  async getSuggestions(search: string): Promise<Suggestion[]> {
    const searchStr = search.toLowerCase();

    this.suggestions = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          STATIC_SUGGESTIONS.filter((s) =>
            s.label.toLowerCase().includes(searchStr)
          )
        );
      }, 250);
    });
    return this.suggestions || [];
  }
}
