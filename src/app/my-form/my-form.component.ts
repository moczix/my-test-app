import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-my-form',
  templateUrl: './my-form.component.html',
  styleUrls: ['./my-form.component.css']
})
export class MyFormComponent implements OnInit {

  public incomeSourceForm: FormGroup;
  public incomeSourceOptions = [
    { id: 1, name: 'Full-time employment / Commission contract' },
    { id: 2, name: 'Own business' },
    { id: 3, name: 'Pension' },
    { id: 4, name: 'Profits from financial activities' },
    { id: 5, name: 'Donations received' },
    { id: 6, name: 'Other - please specify' }
  ];

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.incomeSourceForm = this.formBuilder.group({
      income_source: [1, Validators.required ],
    });
    this.incomeSourceForm.get('income_source').valueChanges.subscribe(option => {
      if (option === 6) {
        this.incomeSourceForm.addControl('income_custom', new FormControl('', Validators.required));
      } else {
        this.incomeSourceForm.removeControl('income_custom');
      }
    });
  }

  setValue() {
    this.incomeSourceForm.get('income_source').setValue(2);
  }

}
