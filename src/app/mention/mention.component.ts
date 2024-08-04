import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { Suggestion } from '../suggestions.service';
import updateMention from './updateMention';

export type GetSuggestionsFn = (search: string) => Promise<Suggestion[]>;

export type SuggestionSelectedFn = (selected: Suggestion) => void;

@Component({
  selector: 'app-mention',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mention.component.html',
  styleUrl: './mention.component.scss',
})
export class MentionComponent {
  @Input({ required: true })
  prefix: string = '@';

  @Input({ required: true })
  getSuggestions: GetSuggestionsFn | null = null;

  suggestions: null | Suggestion[] = null;
  dropdownStyle: string | null = null;
  mentionText: string | null = null;
  selectedSuggestion: number | null = null;
  mentionElement: HTMLElement | null = null;
  mentions: Suggestion['id'][] = [];

  onInput = (event: Event) => {
    let element = event.target as HTMLElement;

    // if we are not in a contenteditable element ignore input
    if (
      !element ||
      !(element instanceof HTMLElement) ||
      !element.contentEditable
    )
      return;

    // ensure the mention elements are still in the DOM if they aren't
    this.mentions = this.mentions.filter((id) =>
      element.querySelector(`[data-suggestion-id="${id}"]`)
    );
  };

  /**
   * Handle keydown events for the contenteditable element
   */
  onKeyDown = (event: KeyboardEvent) => {
    let element = event.target as HTMLElement;
    // if we are not in a contenteditable element ignore input
    if (
      !element ||
      !(element instanceof HTMLElement) ||
      !element.contentEditable
    )
      return;

    if (event.key === 'Shift') {
      return;
    }

    if (event.key === 'Enter') {
      if (this.selectedSuggestion !== null) {
        this.onSuggestionSelect(this.selectedSuggestion);
        event?.preventDefault();
      }

      this.resetMention();
      return;
    }

    if (event.key === 'Escape') {
      this.resetMention();
      return;
    }

    if (
      (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
      this.suggestions !== null
    ) {
      // we are arrowing with the suggestions dropdown open

      event.preventDefault();
      let nextSelected =
        this.selectedSuggestion === null
          ? 0
          : this.selectedSuggestion + (event.key === 'ArrowUp' ? -1 : 1);
      if (nextSelected < 0) return this.suggestions.length - 1;
      if (nextSelected >= this.suggestions.length) return 0;
      this.selectedSuggestion = nextSelected;

      return;
    }

    const prevMention = this.mentionText;
    this.mentionText = updateMention(event.key, this.mentionText, this.prefix);

    if (event.key === this.prefix) {
      const selection = window.getSelection()!;

      // create the mention element and insert it into the DOM
      // todo: figure out the ANGULAR way to insert element
      const span = document.createElement('span');
      span.classList.add('mention');
      Object.assign(span.style, {
        display: 'inline-block',
        position: 'relative',
        marginRight: '0.25rem',
        color: 'hsl(211, 100%, 70%)',
      } as CSSStyleDeclaration);
      span.textContent = this.prefix;

      selection.getRangeAt(0).insertNode(span);

      // move the cursor to the end of the mention element
      const range = document.createRange();
      range.setStart(span, 1);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      span.closest<HTMLElement>('[contenteditable]')?.focus();

      this.mentionElement = span;

      // prevent the prefix from being inserted into the contenteditable element
      // we already added into the element
      event.preventDefault();
    }

    if (typeof prevMention !== typeof this.mentionText)
      // we only need to change the dropdown if the mention has changed from null to a value or vice versa
      this.toggleDropdown();

    if (this.mentionText !== null) {
      this.getSuggestions!(this.mentionText).then((suggestions) => {
        this.suggestions = suggestions;
      });
    } else {
      this.resetMention();
    }

    return;
  };

  /**
   * hides or shows the dropdown based on the mention
   */
  toggleDropdown = () => {
    if (this.mentionText === null || !this.mentionElement) {
      this.dropdownStyle = null;
      return;
    }

    // get the position of the mention element and set the dropdown just underneath it
    // todo:po: ensure the dropdown does not go off the screen
    const rect = this.mentionElement!.getBoundingClientRect()!;
    this.dropdownStyle = `display: block; top: ${rect.bottom}px; left: ${rect.left}px;`;
  };

  onSuggestionSelect(index: number) {
    if (!this.mentionElement) return;

    const suggestion = this.suggestions![index];

    // insert the selected suggestion into the mentionElement
    this.mentionElement.textContent = this.prefix + suggestion.label;
    this.mentionElement.dataset['suggestionId'] = suggestion.id.toString();

    // move the cursor to the space after the mention element
    this.mentionElement.after(' ');
    const range = document.createRange();
    const selection = window.getSelection()!;
    range.setStart(this.mentionElement.nextSibling!, 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    this.mentions.push(suggestion.id);

    this.resetMention();
  }

  // reset the mention component when the contenteditable element loses focus
  onBlur(event: FocusEvent) {
    // hacky way to move blur event after the dropdown click event
    setTimeout(() => {
      if (!this.mentionElement || !event.target) return;

      const target = event.target as HTMLElement;

      if (!!target.closest<HTMLElement>('.mention-container')) return;

      console.log('targetElement', target);

      console.log(
        'mentionDropdown',
        target.closest<HTMLElement>('[data-mention-dropdown]')
      );

      this.resetMention();
    }, 1);
  }

  /**
   * Reset the mention component to its initial state
   * This will remove the mention element from the DOM if a suggestion was not selected
   */
  resetMention = () => {
    if (this.mentionElement) {
      if (this.mentionElement.dataset['suggestionId']) {
        Object.assign(this.mentionElement.style, {
          fontWeight: 'bold',
        });
        this.mentionElement.contentEditable = 'false';
      } else this.mentionElement.remove();
    }

    this.mentionElement = null;
    this.mentionText = null;
    this.suggestions = null;
    this.selectedSuggestion = null;
    this.toggleDropdown();
  };
}
