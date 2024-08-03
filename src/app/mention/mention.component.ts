import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { Suggestion } from '../suggestions.service';
import updateMention from './updateMention';

export type SuggestionsFn = (search: string) => Promise<Suggestion[]>;

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
  getSuggestions: SuggestionsFn | null = null;

  suggestions: null | Suggestion[] = null;
  dropdownStyle: string | null = null;
  mentionId: number = 100;
  mention: string | null = null;
  selectedSuggestion: number | null = null;
  mentionElement: HTMLElement | null = null;

  /**
   * Handle keydown events for the contenteditable element
   * @param event
   * @returns
   * @description
   * - If the key is the prefix, insert the mention element into the contenteditable element
   * - If the key is Enter, select the suggestion and insert it into the contenteditable element
   * - If the key is Escape, reset the mention component
   * - If the key is ArrowDown or ArrowUp, select the next or previous suggestion
   * - If the key is any other key, update the mention and get suggestions
   * - If the mention has changed, get suggestions
   * - If the mention is null, reset the mention component
   * - If the mention element is null, reset the mention component
   * - If the mention element has a suggestionId, set the mention element to be bold and not editable
   */
  onKeyDown = (event: KeyboardEvent) => {
    // if we are not in a contenteditable element ignore input
    if (
      !event.target ||
      !(event.target instanceof HTMLElement) ||
      !(event.target as HTMLElement).contentEditable
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

    const prevMention = this.mention;
    this.mention = updateMention(event.key, this.mention, this.prefix);

    if (event.key === this.prefix) {
      const selection = window.getSelection()!;

      // create the mention element and insert it into the DOM
      const span = document.createElement('span');
      span.classList.add('mention');
      Object.assign(span.style, {
        display: 'inline-block',
        position: 'relative',
        marginRight: '0.25rem',
        color: 'hsl(211, 100%, 70%)',
      } as CSSStyleDeclaration);
      span.id = 'mention-' + this.mentionId;
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

    if (typeof prevMention !== typeof this.mention)
      // we only need to change the dropdown if the mention has changed from null to a value or vice versa
      this.toggleDropdown();

    if (this.mention !== null) {
      this.getSuggestions!(this.mention).then((suggestions) => {
        this.suggestions = suggestions;
      });
    }

    return;
  };

  /**
   * hides or shows the dropdown based on the mention
   */
  toggleDropdown = () => {
    if (this.mention === null || !this.mentionElement) {
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

    // insert the selected suggestion into the mentionElement
    this.mentionElement.textContent =
      this.prefix + this.suggestions![index].name;
    this.mentionElement.dataset['suggestionId'] =
      this.suggestions![index].id.toString();

    // move the cursor to the space after the mention element
    this.mentionElement.after(' ');
    const range = document.createRange();
    const selection = window.getSelection()!;
    range.setStart(this.mentionElement.nextSibling!, 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    this.resetMention();
  }

  // reset the mention component when the contenteditable element loses focus
  onBlur() {
    this.resetMention();
  }

  /**
   * Reset the mention component to its initial state
   * This will remove the mention element from the DOM if a suggestion was not selected
   */
  resetMention = () => {
    this.mentionId += 1;

    if (this.mentionElement) {
      if (this.mentionElement.dataset['suggestionId']) {
        Object.assign(this.mentionElement.style, {
          fontWeight: 'bold',
        });
        this.mentionElement.contentEditable = 'false';
      } else this.mentionElement.remove();
    }

    this.mentionElement = null;
    this.mention = null;
    this.suggestions = null;
    this.selectedSuggestion = null;
    this.toggleDropdown();
  };
}
