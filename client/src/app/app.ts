import { Component } from '@angular/core';
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
export class AppComponent {
  city: string = '';
  weatherData: any = null;
  error: string = '';

  // Полный список
  allCities = CITIES_LIST.sort();
  
  // Отфильтрованный список
  filteredCities: string[] = [];

  constructor(private http: HttpClient) {}

  // Функция для показа городов
  onInput() 
  {
    if (!this.city) 
    {
      this.filteredCities = [];
      return;
    }

    // Фильтруем: ищем города, которые содержат введенные буквы
    const filterValue = this.city.toLowerCase();
    this.filteredCities = this.allCities.filter(c => 
      c.toLowerCase().startsWith(filterValue)
    );
  }

  selectCity(selected: string) {
    this.city = selected;
    this.filteredCities = [];
    this.getWeather();
  }

  getWeather() 
  {  
    if (!this.city) return;
    this.filteredCities = [];
    this.error = '';
    this.weatherData = null;

    this.http.get(`http://localhost:3000/api/weather?city=${this.city}`)
      .subscribe({
        next: (data) => {
          this.weatherData = data;
          this.error = '';
        },
        error: (err) => {
          this.error = 'Город не найден или сервер не работает!';
          this.weatherData = null;
          console.error(err);
        }
      });
  }
}