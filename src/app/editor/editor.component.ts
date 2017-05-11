import { Component } from '@angular/core';

@Component({
  selector: 'angular-draft-editor',
  templateUrl: './editor.component.html',
  host: {
    '(blur)': '_buildHandler',
    '(focus)': '_buildHandler',
    '[contentEditable]': 'true'
  },
  styleUrls: [ './editor.component.scss' ]
})
export class EditorComponent {
  private _buildHandler(e) {
    console.log(e);
  }

}
