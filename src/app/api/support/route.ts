import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // 1. Validação básica no servidor
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "O nome é obrigatório." },
        { status: 400 },
      );
    }
    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { error: "Um e-mail válido é obrigatório." },
        { status: 400 },
      );
    }
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "A mensagem é obrigatória." },
        { status: 400 },
      );
    }

    // 2. Configurações do Resend
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const supportDestination = "cientifico@premierpet.com.br";

    const userAgent = request.headers.get("user-agent") || "Não identificado";
    const dateFormatted = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    if (apiKey) {
      const resend = new Resend(apiKey);
      
      const emailResponse = await resend.emails.send({
        from: `Suporte Simpósio <${fromEmail}>`,
        to: supportDestination,
        replyTo: email.trim(), // Permite responder diretamente ao usuário ao clicar em responder
        subject: `[Suporte Simpósio] Chamado de ${name.trim()}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
            <div style="background-color: #0c2144; color: #ffffff; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="margin: 0; font-size: 20px; color: #ffffff;">Novo Chamado de Suporte</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.85; color: #ffffff;">12º Simpósio Premierpet</p>
            </div>
            
            <div style="padding: 20px 0;">
              <p style="font-size: 15px; margin: 8px 0; color: #1e293b;"><strong>Nome do Usuário:</strong> ${name.trim()}</p>
              <p style="font-size: 15px; margin: 8px 0; color: #1e293b;"><strong>E-mail de Contato:</strong> <a href="mailto:${email.trim()}" style="color: #007aff;">${email.trim()}</a></p>
              <p style="font-size: 15px; margin: 8px 0; color: #1e293b;"><strong>Data/Hora do Envio:</strong> ${dateFormatted} (Horário de Brasília)</p>
              
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              
              <h3 style="color: #0f172a; font-size: 16px; margin-top: 0;">Mensagem / Dúvida:</h3>
              <div style="background-color: #f8fafc; border-left: 4px solid #007aff; padding: 16px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #334155;">${message.trim()}</div>
              
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              
              <h3 style="color: #0f172a; font-size: 13px; margin-top: 0;">Dados de Diagnóstico:</h3>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0; line-height: 1.4;"><strong>User-Agent:</strong> ${userAgent}</p>
            </div>
            
            <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
              Este chamado foi gerado diretamente através do formulário de suporte da landing page.<br/>
              Para responder ao usuário, basta responder a este e-mail (o cabeçalho reply-to está configurado com o e-mail do usuário).
            </div>
          </div>
        `,
      });

      if (emailResponse.error) {
        console.error("Erro do Resend ao enviar suporte:", emailResponse.error);
        return NextResponse.json(
          { error: "Ocorreu um erro ao enviar sua mensagem via Resend. Por favor, tente novamente." },
          { status: 500 },
        );
      }

      console.log(`[Suporte] E-mail enviado com sucesso para cientifico@premierpet.com.br (replyTo: ${email})`);
    } else {
      // Simulação em desenvolvimento local
      console.log("================= [SIMULAÇÃO SUPORTE] =================");
      console.log(`De: ${name} <${email}>`);
      console.log(`Para: ${supportDestination}`);
      console.log(`Mensagem: ${message}`);
      console.log("======================================================");
    }

    return NextResponse.json({
      success: true,
      message: "Mensagem enviada com sucesso!",
    });
  } catch (error) {
    console.error("Erro interno na rota de suporte:", error);
    return NextResponse.json(
      {
        error: "Ocorreu um erro interno no servidor ao tentar enviar a mensagem. Por favor, tente novamente mais tarde.",
      },
      { status: 500 },
    );
  }
}
