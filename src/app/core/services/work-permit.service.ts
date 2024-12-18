import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkPermitService {

  private apiUrl = 'http://localhost:3000/api/permissoes'

  constructor(private http: HttpClient) {}

  getPermissionByNumber(number: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${number}`)
  }

  getNumberOfPermissions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/numeros`)
  }

}
