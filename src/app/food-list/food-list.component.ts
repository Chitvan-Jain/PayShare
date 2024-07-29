import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service'; // Adjust the import according to your file structure

interface PersonRecord {
  owes: { [key: string]: number };
  owedBy: { [key: string]: number };
}

@Component({
  selector: 'app-food-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './food-list.component.html',
  styleUrls: ['./food-list.component.css'],
})
export class FoodListComponent {
  isRemoved: boolean = false;
  isEvaluate: boolean = false;
  taxPercentage!: number;
  serviceChargePercentage!: number;
  foodName: string = '';
  quantity!: number;
  price!: number;
  payer: string = '';
  people: string[] = [];
  balanceSheet: string = '';
  selectedPeople: string[] = [];
  foodItems: any[] = [];
  records: { [key: string]: PersonRecord } = {};

  private dataService = inject(DataService);

  constructor() {
    this.people = this.dataService.getNames();
    this.people.forEach(person => {
      this.records[person] = { owes: {}, owedBy: {} };
    });
  }

  submitPercentages() {
    if (this.taxPercentage && this.serviceChargePercentage) {
      this.isRemoved = true;
    }
  }

  togglePersonSelection(event: Event, person: string) {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;
    if (isChecked) {
      this.selectedPeople.push(person);
    } else {
      this.selectedPeople = this.selectedPeople.filter(p => p !== person);
    }
  }

  addFoodItem() {
    if (this.foodName && this.quantity && this.price && this.payer && this.selectedPeople.length) {
      const totalPrice = this.calculateTotalPrice(this.price, this.quantity);
      const totalPriceWithTax = this.calculatePriceWithTax(totalPrice);
      const amountPerPerson = totalPriceWithTax / this.selectedPeople.length;

      this.foodItems.push({
        foodName: this.foodName,
        quantity: this.quantity,
        price: this.price,
        payer: this.payer,
        people: [...this.selectedPeople],
        totalPriceWithTax
      });

      this.selectedPeople.forEach(person => {
        if (person !== this.payer) {
          this.records[person].owes[this.payer] = (this.records[person].owes[this.payer] || 0) + amountPerPerson;
          this.records[this.payer].owedBy[person] = (this.records[this.payer].owedBy[person] || 0) + amountPerPerson;
        }
      });

      this.resetForm();
    }
  }

  removeFoodItem(index: number) {
    const item = this.foodItems[index];
    const amountPerPerson = item.totalPriceWithTax / item.people.length;

    item.people.forEach((person: string) => {
      if (person !== item.payer) {
        if (this.records[person].owes[item.payer]) {
          this.records[person].owes[item.payer] -= amountPerPerson;
          if (this.records[person].owes[item.payer] <= 0) {
            delete this.records[person].owes[item.payer];
          }
        }

        if (this.records[item.payer].owedBy[person]) {
          this.records[item.payer].owedBy[person] -= amountPerPerson;
          if (this.records[item.payer].owedBy[person] <= 0) {
            delete this.records[item.payer].owedBy[person];
          }
        }
      }
    });

    this.foodItems.splice(index, 1);
  }

  calculateTotalPrice(price: number, quantity: number): number {
    return price * quantity;
  }

  calculatePriceWithTax(totalPrice: number): number {
    return totalPrice + (totalPrice * this.taxPercentage / 100);
  }

  calculateTotalAmount(): number {
    return this.foodItems.reduce((total, item) => {
      return total + this.calculatePriceWithTax(this.calculateTotalPrice(item.price, item.quantity));
    }, 0);
  }

  calculateServiceCharge(totalAmount: number): number {
    return totalAmount * (this.serviceChargePercentage / 100);
  }

  calculateFinalAmount(): number {
    const totalAmount = this.calculateTotalAmount();
    const serviceCharge = this.calculateServiceCharge(totalAmount);
    return totalAmount + serviceCharge;
  }

  payShare() {
    const netBalances: { [key: string]: number } = {};
  
    // Initialize the netBalances object
    this.people.forEach(person => {
      netBalances[person] = 0;
    });
  
    // Calculate net balances
    for (const person in this.records) {
      for (const [owedPerson, amount] of Object.entries(this.records[person].owes)) {
        netBalances[person] -= amount;
        netBalances[owedPerson] += amount;
      }
    }
  
    // Generate the output
    let output = 'Balances:\n';
    this.people.forEach(person => {
      if (netBalances[person] !== 0) {
        if (netBalances[person] > 0) {
          output += `${person} is owed ${netBalances[person].toFixed(2)}\n`;
        } else {
          output += `${person} owes ${Math.abs(netBalances[person]).toFixed(2)}\n`;
        }
      }
    });
      
    // Add detailed debts and credits
    this.people.forEach(person => {
      for (const [owedPerson, amount] of Object.entries(this.records[person].owes)) {
        if (amount > 0) {
          output += `${person} owes ${owedPerson} ${amount.toFixed(2)}\n`;
        }
      }
    });
  
    // Set balanceSheet and show the modal
    this.balanceSheet = output;
    this.isEvaluate = true;
  
    // Save the records
    this.dataService.saveRecords(this.records);
  }
  
  
  

  closeModal() {
    this.isEvaluate = false; // Hide the modal
  }

  resetForm() {
    this.foodName = '';
    this.quantity = 0;
    this.price = 0;
    this.payer = '';
    this.selectedPeople = [];
    this.resetCheckboxes();
  }

  resetCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      (checkbox as HTMLInputElement).checked = false;
    });
  }

  getObjectKeys(obj: { [key: string]: any }): string[] {
    return Object.keys(obj);
  }
}
