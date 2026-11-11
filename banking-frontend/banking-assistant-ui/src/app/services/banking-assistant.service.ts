import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';

export interface ChatResponse {
answer: string;
}

export interface PdfUploadResponse {
filename: string;
chunks: number;
pages: number;
}

@Injectable({
providedIn: 'root'
})
export class BankingAssistantService {

private aiServiceUrl = 'http://localhost:8000';

constructor(private http: HttpClient) {}

sendMessage(message: string): Observable<ChatResponse> {
 return this.http.post<ChatResponse>(`${this.aiServiceUrl}/chat`, {
message: message
});
}

uploadPdf(file: File): Observable<PdfUploadResponse> {
return from(file.arrayBuffer()).pipe(
switchMap((pdfBytes) => this.http.post<PdfUploadResponse>(`${this.aiServiceUrl}/documents`, pdfBytes, {
headers: { 'Content-Type': 'application/pdf', 'X-Filename': file.name }
}))
);
}
}
