import { NextResponse } from "next/server";
import db from "@/lib/db";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nm_inscrito,
      dt_nascimento,
      ds_email,
      ds_email_confirmacao,
      nu_telefone,
      nu_telefone_confirmacao,
      nm_pais,
      nm_cidade,
      fl_graduado,
      ds_curso_graduacao,
      ds_crmv,
      ds_como_soube,
      ds_como_soube_outro,
      ds_modalidade,
      fl_lgpd_aceite,
    } = body;

    // 1. Validações básicas de campos obrigatórios
    if (!nm_inscrito || !nm_inscrito.trim()) {
      return NextResponse.json(
        { error: "Nome completo é obrigatório." },
        { status: 400 },
      );
    }
    if (!dt_nascimento) {
      return NextResponse.json(
        { error: "Data de nascimento é obrigatória." },
        { status: 400 },
      );
    }
    if (!ds_email || !ds_email.trim()) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 },
      );
    }
    if (
      ds_email.trim().toLowerCase() !==
      ds_email_confirmacao?.trim().toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Os e-mails informados não coincidem." },
        { status: 400 },
      );
    }
    if (!nu_telefone || !nu_telefone.trim()) {
      return NextResponse.json(
        { error: "Telefone é obrigatório." },
        { status: 400 },
      );
    }
    if (nu_telefone.trim() !== nu_telefone_confirmacao?.trim()) {
      return NextResponse.json(
        { error: "Os telefones informados não coincidem." },
        { status: 400 },
      );
    }
    if (!nm_pais || !nm_pais.trim()) {
      return NextResponse.json(
        { error: "País é obrigatório." },
        { status: 400 },
      );
    }
    if (!nm_cidade || !nm_cidade.trim()) {
      return NextResponse.json(
        { error: "Cidade é obrigatória." },
        { status: 400 },
      );
    }
    if (fl_graduado === undefined) {
      return NextResponse.json(
        { error: "O campo Graduado é obrigatório." },
        { status: 400 },
      );
    }

    // Lógica condicional de graduado
    const isGraduado = Number(fl_graduado) === 1;
    if (isGraduado && (!ds_curso_graduacao || !ds_curso_graduacao.trim())) {
      return NextResponse.json(
        { error: "Curso de graduação é obrigatório para graduados." },
        { status: 400 },
      );
    }

    if (!ds_como_soube) {
      return NextResponse.json(
        { error: "Por favor, indique como ficou sabendo do evento." },
        { status: 400 },
      );
    }
    if (
      !ds_modalidade ||
      (ds_modalidade !== "Presencial" && ds_modalidade !== "Online")
    ) {
      return NextResponse.json(
        {
          error:
            "Por favor, selecione a modalidade do evento (Presencial ou Online).",
        },
        { status: 400 },
      );
    }
    if (!fl_lgpd_aceite) {
      return NextResponse.json(
        {
          error:
            "Você precisa aceitar os termos de privacidade para concluir a inscrição.",
        },
        { status: 400 },
      );
    }

    // 2. Validação contra duplicados
    const emailClean = ds_email.trim().toLowerCase();
    const { data: existing, error: checkError } = await db
      .from("t_inscritos")
      .select("id_inscrito")
      .eq("ds_email", emailClean)
      .maybeSingle();

    if (checkError) {
      console.error("Erro ao verificar duplicados no Supabase:", checkError);
      throw checkError;
    }

    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já foi cadastrado para o evento." },
        { status: 400 },
      );
    }

    // 3. Inserção no Banco de Dados
    const dt_cadastro = new Date().toISOString();
    const { error: insertError } = await db
      .from("t_inscritos")
      .insert({
        nm_inscrito: nm_inscrito.trim(),
        dt_nascimento,
        ds_email: emailClean,
        nu_telefone: nu_telefone.trim(),
        nm_pais: nm_pais.trim(),
        nm_cidade: nm_cidade.trim(),
        fl_graduado: isGraduado ? 1 : 0,
        ds_curso_graduacao: isGraduado ? ds_curso_graduacao.trim() : null,
        ds_crmv: isGraduado && ds_crmv ? ds_crmv.trim() : null,
        ds_como_soube,
        ds_como_soube_outro: ds_como_soube_outro ? ds_como_soube_outro.trim() : null,
        ds_modalidade,
        fl_lgpd_aceite: fl_lgpd_aceite ? 1 : 0,
        dt_cadastro,
      });

    if (insertError) {
      console.error("Erro ao inserir participante no Supabase:", insertError);
      throw insertError;
    }

    // 4. Envio de E-mail via Resend (Processo assíncrono não-bloqueante)
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    if (apiKey) {
      const resend = new Resend(apiKey);
      resend.emails
        .send({
          from: `Simpósio Premierpet <${fromEmail}>`,
          to: emailClean,
          subject:
            "Inscrição Confirmada - 12º Simpósio de Clínica Médica e Nutrologia Premierpet",
          html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #0c2144; font-size: 24px; margin-top: 8px;">Inscrição Confirmada! 🎉</h2>
            </div>
            <p style="font-size: 16px; line-height: 1.5;">Olá <strong>${nm_inscrito.trim()}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.5;">Tudo bem? Sua inscrição para o <strong>12º Simpósio de Clínica Médica e Nutrologia Premierpet</strong> foi efetuada com sucesso!</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #007aff; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">Detalhes do Evento:</h3>
              <p style="margin: 6px 0; font-size: 15px;"><strong>Modalidade:</strong> ${ds_modalidade}</p>
              <p style="margin: 6px 0; font-size: 15px;"><strong>Data/Hora:</strong> 02 de setembro de 2026, às 13h</p>
              <p style="margin: 6px 0; font-size: 15px;"><strong>Local:</strong> CDI / USP (Av. Prof. Lúcio Martins Rodrigues, 310 - Butantã, São Paulo - SP)</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5;">Caso sua modalidade seja <strong>Online</strong>, em breve enviaremos o link de acesso exclusivo para as transmissões.</p>
            <p style="font-size: 16px; line-height: 1.5;">Nos vemos no evento!</p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 0;">
              Esta é uma mensagem automática de confirmação de inscrição.
            </p>
          </div>
        `,
        })
        .then((res) => {
          if (res.error) {
            console.error("Erro ao enviar e-mail via Resend:", res.error);
          } else {
            console.log(
              `E-mail enviado via Resend para ${emailClean} (ID: ${res.data?.id})`,
            );
          }
        })
        .catch((err) => {
          console.error("Erro ao tentar enviar e-mail com Resend:", err);
        });
    } else {
      console.log(
        `[SIMULAÇÃO EMAIL] De: Simpósio Premierpet <${fromEmail}> | Para: ${emailClean} | Assunto: Inscrição Confirmada`,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inscrição realizada com sucesso!",
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    console.error("Erro no processamento da inscrição:", errMsg);
    if (errStack) console.error("Stack:", errStack);
    return NextResponse.json(
      {
        error: "Ocorreu um erro interno no servidor ao tentar registrar a inscrição. Por favor, tente novamente mais tarde.",
        detail: errMsg, // temporário para debug
      },
      { status: 500 },
    );
  }
}
