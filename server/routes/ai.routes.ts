import { Router, Response } from 'express';
import { db } from '../db';
import { aiService } from '../services/ai.service';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth.middleware';

export const aiRouter = Router();
aiRouter.use(authMiddleware);

// POST /api/v1/ai/chat
aiRouter.post('/chat', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { message, conversationId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const conversation = db.getAIConversation(user.id, conversationId);

    // Record user message
    db.addAIMessage(conversation.id, {
      sender: 'user',
      content: message.trim()
    });

    // Process with AI Service
    const aiResult = await aiService.processChat(user, message.trim());

    // Record assistant message
    const assistantMsg = db.addAIMessage(conversation.id, {
      sender: 'assistant',
      content: aiResult.reply,
      toolCalls: aiResult.toolCallsExecuted?.map((t) => ({
        name: t.tool,
        params: t.params,
        result: t.resultSummary
      }))
    });

    // Record audit log for AI interaction
    db.recordAuditLog({
      actorId: user.id,
      actorRole: user.roles[0],
      actorEmail: user.email,
      action: 'AI_CHAT_QUERY',
      resourceType: 'SYSTEM',
      requestId: req.requestId || 'req_ai',
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      details: {
        modelUsed: aiResult.modelUsed,
        toolsTriggered: aiResult.toolCallsExecuted?.map((t) => t.tool)
      }
    });

    return res.json({
      conversationId: conversation.id,
      message: assistantMsg,
      metadata: {
        modelUsed: aiResult.modelUsed,
        isSimulatedFallback: aiResult.isSimulatedFallback,
        toolCalls: aiResult.toolCallsExecuted
      }
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown AI processing error';
    console.error('[AIRouter] Error processing AI chat:', errMsg);
    return res.status(500).json({ error: 'Failed to process AI banking query', details: errMsg });
  }
});

// GET /api/v1/ai/conversations
aiRouter.get('/conversations', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const conversation = db.getAIConversation(user.id);
  return res.json({
    conversations: [
      {
        id: conversation.id,
        title: conversation.title,
        messageCount: conversation.messages.length,
        updatedAt: conversation.updatedAt
      }
    ]
  });
});

// GET /api/v1/ai/conversations/:conversationId
aiRouter.get('/conversations/:conversationId', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { conversationId } = req.params;
  const conversation = db.getAIConversation(user.id, conversationId);
  return res.json({ conversation });
});
