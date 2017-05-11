import { Component } from '@angular/core';
import { ContentState } from "./model/immutable/content-state";
import { SelectionState } from "./model/immutable/selection-state";
import { DraftModifier } from './model/modifier/draft-modifier';
import { convertFromDraftStateToRaw } from './model/encoding/convert-from-draft-state-to-raw';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {
    const baseContentState = ContentState.createFromText('#piupiu is a cat');
    baseContentState.createEntity('TOKEN', 'IMMUTABLE', { storedText: '#piupiu' });
    const lastEntityKey = baseContentState.getLastCreatedEntityKey();
    const firstBlockKey = baseContentState.getBlockMap().first().getKey();
    const baseSelectionState = SelectionState.createEmpty(firstBlockKey);
    const selectionState = baseSelectionState.merge({
      anchorOffset: 0,
      focusOffset: 7
    }) as SelectionState;
    const modifiedContentState = DraftModifier.applyEntity(
      baseContentState,
      selectionState,
      lastEntityKey
    );

    console.log(convertFromDraftStateToRaw(modifiedContentState));

  }
}
