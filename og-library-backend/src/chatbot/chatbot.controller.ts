import { Controller, Post, Body } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { Public } from '../decorator/customize';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @Public()
  async chat(
    @Body('message') message: string,
    @Body('history')
    history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  ) {
    return this.chatbotService.chatWithAi(message, history);
  }
}
