export const translations = {
  pt: {
    header: {
      home: "Home",
      inscricao: "Inscrição",
      restrictedArea: "Área Restrita",
    },
    hero: {
      altLogo: "12º Simpósio de Clínica Médica e Nutrologia Premierpet",
      date: "02 de setembro",
      time: "13:00 horas (horário de Brasília)",
      location: "Centro de Difusão Internacional – CDI/ USP",
      address: "Av. Prof. Lúcio Martins Rodrigues,\n310 - Butantã, São Paulo - SP, 05508-020",
      quickTitle: "Acesse e participe",
      emailLabel: "E-mail:",
      emailPlaceholder: "exemplo@email.com",
      btnInscrevase: "INSCREVA-SE",
      modalitySubtitle: "Presencial ou Online",
    },
    countdown: {
      loading: "Carregando cronômetro...",
      labels: ["Dias", "Horas", "Minutos", "Segundos"],
    },
    support: {
      title: "Suporte",
      instruction: "Preencha os dados abaixo para nos enviar uma mensagem:",
      nameLabel: "Seu Nome",
      namePlaceholder: "Digite seu nome completo",
      emailLabel: "Seu E-mail",
      emailPlaceholder: "exemplo@email.com",
      messageLabel: "Mensagem",
      messagePlaceholder: "Escreva sua dúvida ou problema...",
      btnSend: "Enviar E-mail",
      successMsg: "E-mail enviado com sucesso! Responderemos em breve.",
      errorMsg: "Erro ao enviar. Tente novamente.",
      validationError: "Por favor, preencha todos os campos corretamente.",
    },
    form: {
      title: "FORMULÁRIO",
      contactTitle: "Contato Pessoal",
      nameLabel: "Nome Completo",
      namePlaceholder: "Digite seu nome completo",
      emailLabel: "E-mail",
      emailConfirmLabel: "Confirmação do E-mail",
      emailConfirmPlaceholder: "Confirme seu e-mail",
      phoneLabel: "Telefone com DDD",
      phoneConfirmLabel: "Confirmação (Tel.)",
      phoneConfirmPlaceholder: "Confirme seu telefone",
      countryLabel: "País",
      cityLabel: "Cidade",
      cityPlaceholder: "Cidade - UF",
      dobLabel: "Data de Nascimento",
      graduadoLabel: "Graduado?",
      yes: "SIM",
      no: "NÃO",
      courseLabel: "Curso de Graduação",
      crmvLabel: "CRMV",
      crmvPlaceholder: "Ex: 12345-SP",
      howHearLabel: "Como ficou sabendo do 12º Simpósio?",
      howHearOptions: {
        "Promotor Técnico": "Promotor Técnico",
        "Embaixadores Universitários PremieRpet": "Embaixadores Universitários PremieRpet",
        "Redes Sociais (Instagram PremierVet, YouTube, TikTok, Linkedin)": "Redes Sociais (Instagram PremierVet, YouTube, TikTok, Linkedin)",
        "Professor(a)": "Professor(a)",
        "Outros meios de comunicação": "Outros meios de comunicação",
      },
      whichOnes: "Quais?",
      whichOnesPlaceholder: "Especifique como nos conheceu",
      modalityLabel: "Modalidade de Participação",
      lgpdText: "Autorizo o tratamento dos meus dados pessoais para fins de participação na campanha, apuração de resultados, comunicação de informações, entrega de premiações e divulgação de meu nome, imagem e voz, sem ônus, exclusivamente para ações relacionadas ao programa.",
      lgpdLink: "Confira nossa política de privacidade.",
      importantTitle: "⚠️ IMPORTANTE ⚠️",
      importantText: {
        pre: "AO SE INSCREVER VOCÊ RECEBERÁ UM E-MAIL DE CONFIRMAÇÃO E ",
        highlight: "LINK PARA O DIA",
        post: ".",
      },
      btnSubmit: "INSCREVA-SE",
      processing: "Processando...",
      soldOutLabel: "ESGOTADO",
      errors: {
        presencialSoldOut: "As vagas presenciais estão esgotadas. Selecione a modalidade Online.",
        nameRequired: "Nome completo é obrigatório.",
        dobInvalid: "Data de nascimento inválida. Digite dia (DD), mês (MM) e ano (AAAA) corretamente.",
        emailRequired: "E-mail e confirmação de e-mail são obrigatórios.",
        emailsNotMatch: "Os e-mails informados não coincidem.",
        phoneRequired: "Telefone e confirmação de telefone são obrigatórios.",
        phonesNotMatch: "Os números de telefone informados não coincidem.",
        cityRequired: "Cidade é obrigatória.",
        graduadoRequired: "Selecione se é graduado ou não.",
        courseRequired: "Selecione o curso de graduação.",
        howHearRequired: "Por favor, selecione pelo menos uma opção em 'Como ficou sabendo'.",
        howHearOutroRequired: "Descreva quais outros meios de comunicação você utilizou.",
        modalityRequired: "Selecione a modalidade de participação (Presencial ou Online).",
        lgpdRequired: "Você deve aceitar a política de privacidade e uso de dados para prosseguir.",
        connectionError: "Não foi possível conectar ao servidor. Tente novamente em instantes.",
        duplicateEmail: "Este e-mail já foi cadastrado para o evento.",
        genericError: "Ocorreu um erro ao realizar a inscrição.",
      },
      countries: [
        { value: "Brasil", label: "Brasil" },
        { value: "Espanha", label: "Espanha" },
        { value: "Portugal", label: "Portugal" },
        { value: "Angola", label: "Angola" },
        { value: "Cabo Verde", label: "Cabo Verde" },
        { value: "Moçambique", label: "Moçambique" },
        { value: "Outro", label: "Outro" }
      ],
      courses: [
        { value: "Medicina Veterinária", label: "Medicina Veterinária" },
        { value: "Zootecnia", label: "Zootecnia" },
        { value: "Biologia", label: "Biologia" },
        { value: "Outro", label: "Outro" }
      ]
    },
    success: {
      title: "Inscrição Concluída!",
      text: "Sua inscrição para o 12º Simpósio de Clínica Médica e Nutrologia Premierpet foi recebida com sucesso.",
      confirmTitle: "Confirmação dos Dados:",
      name: "Nome Completo:",
      email: "E-mail:",
      modality: "Modalidade:",
      emailSentInfo: "Um e-mail de confirmação foi disparado para a sua caixa de entrada com os detalhes de acesso e orientações gerais do evento.",
      btnNew: "Nova Inscrição",
    },
    footer: {
      idealizacao: "Idealização:",
      realizacao: "Realização:",
      restrictedArea: "Área Restrita"
    },
    speakers: {
      title: "PARTICIPAÇÕES CONFIRMADAS:",
      list: [
        {
          name: "Dr. Archivaldo Reche",
          time: "14h20",
          title: "Diarreia em Gatos: Quando a dieta gastrointestinal faz a diferença",
          image: "/design/Archivaldo%20Reche.png"
        },
        {
          name: "Dr. Fabio Teixeira",
          time: "15h10",
          title: "Nutrição em Pacientes Hepatopatas: O que mudou?",
          image: "/design/Fabio%20Teixeira.png"
        },
        {
          name: "Dr. Thiago Vendramini",
          time: "16h00",
          title: "Carne Fresca e Farinha de Vísceras: Entendendo o papel de cada ingrediente",
          image: "/design/Thiago%20Vendramini.png"
        },
        {
          name: "Dra. Alessandra Vargas",
          time: "17h30",
          title: "Gato Diabético: Diagnóstico, Monitoramento e Tomada de Decisão",
          image: "/design/Alessandra%20Vargas.png"
        },
        {
          name: "Dra. Andressa Amaral",
          time: "18h25",
          title: "Momento PremieRvet",
          image: "/design/Andressa%20Amaral.png"
        },
        {
          name: "Dr. Ronaldo Lucas",
          time: "18h55",
          title: "Otites externas e abordagem clínica",
          image: "/design/Ronaldo%20Lucas.png"
        },
        {
          name: "Dr. Marty Becker",
          time: "19h35",
          title: "O paciente conta a história. Você faz o diagnóstico.",
          image: "/design/Marty%20Becker.png"
        }
      ]
    }
  },
  es: {
    header: {
      home: "Inicio",
      inscricao: "Inscripción",
      restrictedArea: "Área Restringida",
    },
    hero: {
      altLogo: "12º Simposio de Clínica Médica y Nutrología Premierpet",
      date: "02 de septiembre",
      time: "13:00 horas (horario de Brasilia)",
      location: "Centro de Difusión Internacional – CDI/ USP",
      address: "Av. Prof. Lúcio Martins Rodrigues,\n310 - Butantã, São Paulo - SP, 05508-020",
      quickTitle: "Acceda y participe",
      emailLabel: "E-mail:",
      emailPlaceholder: "ejemplo@email.com",
      btnInscrevase: "INSCRÍBASE",
      modalitySubtitle: "Presencial u Online",
    },
    countdown: {
      loading: "Cargando cronómetro...",
      labels: ["Días", "Horas", "Minutos", "Segundos"],
    },
    support: {
      title: "Soporte",
      instruction: "Complete los datos a continuación para enviarnos un mensaje:",
      nameLabel: "Su Nombre",
      namePlaceholder: "Ingrese su nombre completo",
      emailLabel: "Su Correo",
      emailPlaceholder: "ejemplo@email.com",
      messageLabel: "Mensaje",
      messagePlaceholder: "Escriba su duda o problema...",
      btnSend: "Enviar Correo",
      successMsg: "¡Correo enviado con éxito! Responderemos pronto.",
      errorMsg: "Error al enviar. Inténtelo de nuevo.",
      validationError: "Por favor, complete todos los campos correctamente.",
    },
    form: {
      title: "FORMULARIO",
      contactTitle: "Contacto Personal",
      nameLabel: "Nombre Completo",
      namePlaceholder: "Ingrese su nombre completo",
      emailLabel: "Correo electrónico",
      emailConfirmLabel: "Confirmación del correo electrónico",
      emailConfirmPlaceholder: "Confirme su correo electrónico",
      phoneLabel: "Teléfono con código de área",
      phoneConfirmLabel: "Confirmación (Tel.)",
      phoneConfirmPlaceholder: "Confirme su teléfono",
      countryLabel: "País",
      cityLabel: "Ciudad",
      cityPlaceholder: "Ciudad - Provincia/Estado",
      dobLabel: "Fecha de Nacimiento",
      graduadoLabel: "¿Graduado?",
      yes: "SÍ",
      no: "NO",
      courseLabel: "Carrera de Grado",
      crmvLabel: "CRMV (Matrícula)",
      crmvPlaceholder: "Ej: 12345-SP",
      howHearLabel: "¿Cómo se enteró del 12º Simposio?",
      howHearOptions: {
        "Promotor Técnico": "Promotor Técnico",
        "Embaixadores Universitários PremieRpet": "Embajadores Universitarios PremieRpet",
        "Redes Sociais (Instagram PremierVet, YouTube, TikTok, Linkedin)": "Redes Sociales (Instagram PremierVet, YouTube, TikTok, Linkedin)",
        "Professor(a)": "Profesor(a)",
        "Outros meios de comunicação": "Otros medios de comunicação",
      },
      whichOnes: "¿Cuáles?",
      whichOnesPlaceholder: "Especifique cómo nos conoció",
      modalityLabel: "Modalidad de Participación",
      lgpdText: "Autorizo el tratamiento de mis datos personales con fines de participación en la campaña, cómputo de resultados, comunicación de información, entrega de premios y difusión de mi nombre, imagen y voz, sin costo alguno, exclusivamente para acciones relacionadas con el programa.",
      lgpdLink: "Consulte nuestra política de privacidad.",
      importantTitle: "⚠️ IMPORTANTE ⚠️",
      importantText: {
        pre: "AL INSCRIBIRSE RECIBIRÁ UN CORREO ELECTRÓNICO DE CONFIRMACIÓN Y ",
        highlight: "EL ENLACE PARA EL DÍA",
        post: ".",
      },
      btnSubmit: "INSCRÍBASE",
      processing: "Procesando...",
      soldOutLabel: "AGOTADO",
      errors: {
        presencialSoldOut: "Los cupos presenciales se han agotado. Seleccione la modalidad Online.",
        nameRequired: "El nombre completo es obligatorio.",
        dobInvalid: "Fecha de nacimiento inválida. Ingrese el día (DD), mes (MM) y año (AAAA) correctamente.",
        emailRequired: "El correo electrónico y la confirmación son obligatorios.",
        emailsNotMatch: "Los correos electrónicos ingresados no coinciden.",
        phoneRequired: "El teléfono y la confirmación son obligatorios.",
        phonesNotMatch: "Los números de teléfono ingresados no coinciden.",
        cityRequired: "La ciudad es obligatoria.",
        graduadoRequired: "Seleccione si es graduado o no.",
        courseRequired: "Seleccione la carrera de grado.",
        howHearRequired: "Por favor, seleccione al menos una opción en 'Cómo se enteró'.",
        howHearOutroRequired: "Describa qué otros medios de comunicación utilizó.",
        modalityRequired: "Seleccione la modalidad de participación (Presencial u Online).",
        lgpdRequired: "Debe aceptar la política de privacidad y uso de datos para continuar.",
        connectionError: "No se pudo conectar al servidor. Inténtelo de nuevo en unos momentos.",
        duplicateEmail: "Este correo electrónico ya ha sido registrado para el evento.",
        genericError: "Ocurrió un error al realizar la inscripción.",
      },
      countries: [
        { value: "Brasil", label: "Brasil" },
        { value: "Espanha", label: "España" },
        { value: "Portugal", label: "Portugal" },
        { value: "Angola", label: "Angola" },
        { value: "Cabo Verde", label: "Cabo Verde" },
        { value: "Moçambique", label: "Mozambique" },
        { value: "Outro", label: "Otro" }
      ],
      courses: [
        { value: "Medicina Veterinária", label: "Medicina Veterinaria" },
        { value: "Zootecnia", label: "Zootecnia" },
        { value: "Biologia", label: "Biología" },
        { value: "Outro", label: "Otro" }
      ]
    },
    success: {
      title: "¡Inscripción Completada!",
      text: "Su inscripción para el 12º Simposio de Clínica Médica y Nutrología Premierpet fue recibida con éxito.",
      confirmTitle: "Confirmación de Datos:",
      name: "Nombre Completo:",
      email: "E-mail:",
      modality: "Modalidad:",
      emailSentInfo: "Se ha enviado un correo electrónico de confirmación a su bandeja de entrada con los detalles de acceso y las pautas generales del evento.",
      btnNew: "Nueva Inscripción",
    },
    footer: {
      idealizacao: "Idealización:",
      realizacao: "Realización:",
      restrictedArea: "Área Restringida"
    },
    speakers: {
      title: "PARTICIPACIONES CONFIRMADAS:",
      list: [
        {
          name: "Dr. Archivaldo Reche",
          time: "14h20",
          title: "Diarrea en Gatos: Cuándo la dieta gastrointestinal marca la diferencia",
          image: "/design/Archivaldo%20Reche.png"
        },
        {
          name: "Dr. Fabio Teixeira",
          time: "15h10",
          title: "Nutrición en Pacientes Hepatópatas: ¿Qué ha cambiado?",
          image: "/design/Fabio%20Teixeira.png"
        },
        {
          name: "Dr. Thiago Vendramini",
          time: "16h00",
          title: "Carne Fresca y Harina de Vísceras: Entendiendo el papel de cada ingrediente",
          image: "/design/Thiago%20Vendramini.png"
        },
        {
          name: "Dra. Alessandra Vargas",
          time: "17h30",
          title: "Gato Diabético: Diagnóstico, Monitoreo y Toma de Decisiones",
          image: "/design/Alessandra%20Vargas.png"
        },
        {
          name: "Dra. Andressa Amaral",
          time: "18h25",
          title: "Momento PremieRvet",
          image: "/design/Andressa%20Amaral.png"
        },
        {
          name: "Dr. Ronaldo Lucas",
          time: "18h55",
          title: "Otitis externas y abordaje clínico",
          image: "/design/Ronaldo%20Lucas.png"
        },
        {
          name: "Dr. Marty Becker",
          time: "19h35",
          title: "El paciente cuenta la historia. Usted hace el diagnóstico.",
          image: "/design/Marty%20Becker.png"
        }
      ]
    }
  }
};

export type Language = "pt" | "es";
