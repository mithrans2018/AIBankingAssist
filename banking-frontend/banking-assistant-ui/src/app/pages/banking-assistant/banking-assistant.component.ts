import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingAssistantService } from '../../services/banking-assistant.service';

interface ChatMessage {
text: string;
sender: 'user' | 'assistant';
time: Date;
}

@Component({
selector: 'app-banking-assistant',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './banking-assistant.component.html',
styleUrl: './banking-assistant.component.css'
})
export class BankingAssistantComponent {

userMessage = '';
loading = false;
selectedPdf: File | null = null;
uploadingPdf = false;
pdfStatus = '';

messages: ChatMessage[] = [
{
text: 'Hello! Welcome to your AI Banking Assistant. How can I help you today?',
sender: 'assistant',
time: new Date()
}
];

newChat(): void {
this.userMessage = '';
this.loading = false;

this.messages = [
{
text: 'Hello! Welcome to your AI Banking Assistant. How can I help you today?',
sender: 'assistant',
time: new Date()
}
];
}

suggestions = [
'How can I save more money?',
'Explain my monthly expenses',
'What is a credit score?',
'How can I reduce my debt?'
];

constructor(
private bankingService: BankingAssistantService
) {}

onPdfSelected(event: Event): void {
const input = event.target as HTMLInputElement;
this.selectedPdf = input.files?.[0] ?? null;
this.pdfStatus = '';
}

formatFileSize(bytes: number): string {
return bytes < 1024 * 1024
? `${(bytes / 1024).toFixed(1)} KB`
: `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

uploadPdf(input: HTMLInputElement): void {
if (!this.selectedPdf || this.uploadingPdf) return;

this.uploadingPdf = true;
this.pdfStatus = 'Adding PDF to the assistant...';
this.bankingService.uploadPdf(this.selectedPdf).subscribe({
next: (response) => {
this.pdfStatus = `${response.filename} added (${response.pages} pages). You can now ask questions about it.`;
this.selectedPdf = null;
input.value = '';
this.uploadingPdf = false;
},
error: (error) => {
const body = error?.error;
this.pdfStatus = typeof body === 'string'
? body
: body?.detail ?? body?.message ?? 'Could not add this PDF. Check that both services and Ollama are running.';
this.uploadingPdf = false;
}
});
}

sendMessage(message?: string): void {

const question = (message ?? this.userMessage).trim();

if (!question || this.loading) {
return;
}

this.messages.push({
text: question,
sender: 'user',
time: new Date()
});

this.userMessage = '';
this.loading = true;

this.bankingService.sendMessage(question).subscribe({
next: (response) => {
this.messages.push({
text: response.answer,
sender: 'assistant',
time: new Date()
});

this.loading = false;
},
error: (error) => {
this.messages.push({
text: error?.error?.detail ?? error?.error?.message ?? 'Sorry, I could not connect to the banking assistant. Please try again.',
sender: 'assistant',
time: new Date()
});

this.loading = false;
}
});
}
}
