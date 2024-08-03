import { Injectable } from '@angular/core';

export type Suggestion = {
  id: number;
  name: string;
};

const STATIC_SUGGESTIONS: Suggestion[] = [
  { id: 1, name: 'Kevin' },
  { id: 2, name: 'Jeff' },
  { id: 3, name: 'Bryan' },
  { id: 4, name: 'Gabbey' },
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
            s.name.toLowerCase().includes(searchStr)
          )
        );
      }, 250);
    });
    return this.suggestions || [];
  }
}
