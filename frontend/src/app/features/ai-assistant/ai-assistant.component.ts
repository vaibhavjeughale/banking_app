import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../core/services/ai.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent {
  aiService = inject(AiService);
  inputMessage = signal<string>('');

  suggestedPrompts = [
    'Summarize my spending this month.',
    'Show my five most recent transactions.',
    'Explain the difference between available balance and ledger balance.',
    'Help me understand a failed simulated transfer.',
    'How can I download my account statement?'
  ];

  sendPrompt(promptText: string): void {
    if (!promptText.trim() || this.aiService.isLoading()) return;
    this.aiService.sendMessage(promptText).subscribe();
  }

  submitChat(): void {
    const text = this.inputMessage();
    if (!text.trim() || this.aiService.isLoading()) return;
    this.inputMessage.set('');
    this.aiService.sendMessage(text).subscribe();
  }
}
