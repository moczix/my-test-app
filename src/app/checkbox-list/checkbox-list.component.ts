import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-checkbox-list',
  templateUrl: './checkbox-list.component.html',
  styleUrls: ['./checkbox-list.component.css']
})
export class CheckboxListComponent implements OnInit {

  checkboxForm: FormGroup;

  someData = [
    {name: 'siemano', id: 1},
    {name: 'dupa dupa', id: 2},
    {name: 'lubie cycki', id: 3},
  ];

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
  }

  private createForm() {
    const checkboxArray = new FormArray(this.someData.map(() => new FormControl(false)));


    const checkboxArray2 = new FormArray([
      new FormControl(true),
      new FormControl(false),
      new FormControl(true)
    ]);
    this.checkboxForm = this.formBuilder.group({
      leagues: checkboxArray
    });
  }

  ngOnInit() {
    this.checkboxForm.valueChanges.subscribe(changes => {
      console.log(changes);
      const selected = changes.leagues.filter(isChecked => !!isChecked).map((_, index) => {
        return this.someData[index];
      });
      console.log(selected);
    })
  }

  testChange(checked, index) {
    console.log(`checked: ${checked}, index: ${index}`);
  }

}
