import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CITIES_LIST } from './cities-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit 
{
  cityName = '';
  savedCities: any[] = [];
  
  allCities = CITIES_LIST.sort();
  filteredCities: string[] = [];

  API_URL = 'http://localhost:5000'; 

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() 
  {
    this.loadCities();
  }

  // Загружаем список из базы
  loadCities() 
  {
    this.http.get<any[]>(`${this.API_URL}/cities`)
      .subscribe(data => {
        this.savedCities = data;
        this.cdr.detectChanges();
      });
  }

  // Добавляем город в базу
  addCity() 
  {
    if (!this.cityName) return;
    
    this.http.post(`${this.API_URL}/cities`, { name: this.cityName })
      .subscribe({
        next: () => {
          this.cityName = ''; 
          this.filteredCities = []; 
          this.loadCities();
        },
        error: (err) => alert(err.error.message || 'Ошибка')
      });
  }

  // Удаляем город
  deleteCity(id: number) 
  {
    this.http.delete(`${this.API_URL}/cities/${id}`)
      .subscribe(() => this.loadCities());
  }

  // Логика автопоиска
  onInput() 
  {
    if (!this.cityName) { this.filteredCities = []; return; }
    this.filteredCities = this.allCities.filter(c => 
      c.toLowerCase().startsWith(this.cityName.toLowerCase())
    );
  }

  selectCity(c: string) 
  {
    this.cityName = c;
    this.filteredCities = [];
  }
}