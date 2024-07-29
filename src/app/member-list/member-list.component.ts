import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule} from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent {
  name: string = '';
  names: string[] = [];
  constructor(private router:Router, private dataService:DataService){}
  addName() {
    if (this.name.trim() !== '') {
      this.names.push(this.name.trim());
      this.name = '';
    }
  }
  
  isRemoved: boolean = true;
  toggleRemove() {
    this.isRemoved = !this.isRemoved;
  }
  
  cancel() {
    this.isRemoved = !this.isRemoved;
  }
  
  confirm(){
    console.log('Submitted names:', this.names);
    this.router.navigate(['/foodlist']);
    this.dataService.saveNames(this.names);
  }

  removeName(index: number) {
    this.names.splice(index, 1);
  }

}
