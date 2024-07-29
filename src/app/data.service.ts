import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private names: string[] = [];
  private records: { [key: string]: any } = {};

  getNames(): string[] {
    return this.names;
  }

  saveNames(names: string[]) {
    this.names = names;
  }

  saveRecords(records: { [key: string]: any }) {
    this.records = records;
  }

  getRecords(): { [key: string]: any } {
    return this.records;
  }
}
