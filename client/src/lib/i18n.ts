import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const resources = {
  en: {
    translation: {
      // Navigation & General
      appName: "CivicConnect",
      home: "Home",
      report: "Report Issue",
      myReports: "My Reports", 
      map: "Map",
      admin: "Admin",
      profile: "Profile",
      logout: "Logout",
      login: "Login",
      signup: "Sign Up",
      
      // Home Page
      reportIssueTitle: "Report an Issue",
      reportIssueSubtitle: "Help improve your community with AI-powered reporting",
      takePhoto: "Take Photo",
      aiDetectType: "AI will detect issue type",
      gpsLocation: "GPS Location",
      autoTagged: "Auto-tagged",
      voiceInput: "Voice Input",
      speechToText: "Speech-to-text",
      
      // Community & Gamification
      communityLeaders: "Community Leaders",
      points: "Points",
      achievements: "Achievements",
      badge: "Badge",
      firstReporter: "First Reporter",
      problemSolver: "Problem Solver",
      communityGuardian: "Community Guardian",
      unlocked: "Unlocked",
      locked: "Locked",
      
      // Statistics
      activeReports: "Active Reports",
      inProgress: "In Progress", 
      resolved: "Resolved",
      avgResponseTime: "Avg Response Time",
      days: "days",
      
      // Report Form
      whatIssue: "What's the issue?",
      issueCategory: "Issue Category",
      selectCategory: "Select a category",
      infrastructure: "Infrastructure",
      environment: "Environment",
      safety: "Safety",
      publicServices: "Public Services",
      other: "Other",
      
      issueTitle: "Issue Title",
      issueTitlePlaceholder: "Brief description of the issue",
      issueDescription: "Detailed Description",
      issueDescriptionPlaceholder: "Provide detailed information about the issue",
      
      location: "Location",
      getCurrentLocation: "Get Current Location",
      manualLocation: "Enter Manual Location",
      locationPlaceholder: "Enter address or landmark",
      
      photo: "Photo",
      takeOrUpload: "Take a photo or upload from gallery",
      uploadPhoto: "Upload Photo",
      retakePhoto: "Retake Photo",
      
      urgency: "Urgency Level",
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
      
      anonymous: "Report Anonymously",
      submitReport: "Submit Report",
      submitting: "Submitting...",
      
      // Duplicate Detection
      similarIssueFound: "Similar Issue Found",
      duplicateMessage: "We found a similar issue that might be the same as yours:",
      upvoteExisting: "Upvote Existing Issue",
      submitAnyway: "Submit as New Issue",
      reportedBy: "Reported by",
      timeAgoText: "{{time}} ago",
      
      // PWA Installation
      installApp: "Install App",
      installPromptTitle: "Install CivicConnect",
      installPromptMessage: "Install our app for quick access and offline reporting capabilities.",
      install: "Install",
      cancel: "Cancel",
      addToHomeScreen: "Add to Home Screen",
      
      // Issue Status
      status: {
        active: "Active",
        inProgress: "In Progress", 
        resolved: "Resolved",
        closed: "Closed"
      },
      
      // Messages
      loading: "Loading...",
      error: "Error",
      success: "Success",
      noData: "No data available",
      networkError: "Network error. Please check your connection.",
      locationPermissionDenied: "Location permission denied",
      cameraPermissionDenied: "Camera permission denied",
      
      // Time
      timeAgo: {
        justNow: "Just now",
        minutesAgo: "{{minutes}} minutes ago",
        hoursAgo: "{{hours}} hours ago", 
        daysAgo: "{{days}} days ago",
        weeksAgo: "{{weeks}} weeks ago",
        monthsAgo: "{{months}} months ago"
      }
    }
  },
  es: {
    translation: {
      // Navigation & General
      appName: "CivicConnect",
      home: "Inicio",
      report: "Reportar Problema",
      myReports: "Mis Reportes",
      map: "Mapa", 
      admin: "Admin",
      profile: "Perfil",
      logout: "Cerrar Sesión",
      login: "Iniciar Sesión",
      signup: "Registrarse",
      
      // Home Page
      reportIssueTitle: "Reportar un Problema",
      reportIssueSubtitle: "Ayuda a mejorar tu comunidad con reportes potenciados por IA",
      takePhoto: "Tomar Foto",
      aiDetectType: "La IA detectará el tipo de problema",
      gpsLocation: "Ubicación GPS",
      autoTagged: "Auto-etiquetado",
      voiceInput: "Entrada de Voz",
      speechToText: "Voz a texto",
      
      // Community & Gamification
      communityLeaders: "Líderes de la Comunidad",
      points: "Puntos",
      achievements: "Logros",
      badge: "Insignia",
      firstReporter: "Primer Reportero",
      problemSolver: "Solucionador de Problemas",
      communityGuardian: "Guardián de la Comunidad",
      unlocked: "Desbloqueado",
      locked: "Bloqueado",
      
      // Statistics
      activeReports: "Reportes Activos",
      inProgress: "En Progreso",
      resolved: "Resueltos",
      avgResponseTime: "Tiempo Promedio de Respuesta",
      days: "días",
      
      // Report Form
      whatIssue: "¿Cuál es el problema?",
      issueCategory: "Categoría del Problema",
      selectCategory: "Selecciona una categoría",
      infrastructure: "Infraestructura",
      environment: "Medio Ambiente",
      safety: "Seguridad",
      publicServices: "Servicios Públicos",
      other: "Otro",
      
      issueTitle: "Título del Problema",
      issueTitlePlaceholder: "Descripción breve del problema",
      issueDescription: "Descripción Detallada",
      issueDescriptionPlaceholder: "Proporciona información detallada sobre el problema",
      
      location: "Ubicación",
      getCurrentLocation: "Obtener Ubicación Actual",
      manualLocation: "Ingresar Ubicación Manual",
      locationPlaceholder: "Ingresa dirección o punto de referencia",
      
      photo: "Foto",
      takeOrUpload: "Toma una foto o sube desde la galería",
      uploadPhoto: "Subir Foto",
      retakePhoto: "Volver a Tomar Foto",
      
      urgency: "Nivel de Urgencia",
      low: "Bajo",
      medium: "Medio",
      high: "Alto",
      critical: "Crítico",
      
      anonymous: "Reportar Anónimamente",
      submitReport: "Enviar Reporte",
      submitting: "Enviando...",
      
      // Duplicate Detection
      similarIssueFound: "Problema Similar Encontrado",
      duplicateMessage: "Encontramos un problema similar que podría ser el mismo que el tuyo:",
      upvoteExisting: "Votar por Problema Existente",
      submitAnyway: "Enviar como Nuevo Problema",
      reportedBy: "Reportado por",
      timeAgoText: "hace {{time}}",
      
      // PWA Installation
      installApp: "Instalar App",
      installPromptTitle: "Instalar CivicConnect",
      installPromptMessage: "Instala nuestra app para acceso rápido y capacidades de reporte offline.",
      install: "Instalar",
      cancel: "Cancelar",
      addToHomeScreen: "Agregar a Pantalla de Inicio",
      
      // Issue Status
      status: {
        active: "Activo",
        inProgress: "En Progreso",
        resolved: "Resuelto", 
        closed: "Cerrado"
      },
      
      // Messages
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      noData: "No hay datos disponibles",
      networkError: "Error de red. Por favor verifica tu conexión.",
      locationPermissionDenied: "Permiso de ubicación denegado",
      cameraPermissionDenied: "Permiso de cámara denegado",
      
      // Time
      timeAgo: {
        justNow: "Ahora mismo",
        minutesAgo: "hace {{minutes}} minutos",
        hoursAgo: "hace {{hours}} horas",
        daysAgo: "hace {{days}} días",
        weeksAgo: "hace {{weeks}} semanas",
        monthsAgo: "hace {{months}} meses"
      }
    }
  },
  fr: {
    translation: {
      // Navigation & General
      appName: "CivicConnect",
      home: "Accueil",
      report: "Signaler un Problème",
      myReports: "Mes Signalements",
      map: "Carte",
      admin: "Admin",
      profile: "Profil",
      logout: "Se Déconnecter",
      login: "Se Connecter",
      signup: "S'inscrire",
      
      // Home Page
      reportIssueTitle: "Signaler un Problème",
      reportIssueSubtitle: "Aidez à améliorer votre communauté avec des rapports alimentés par l'IA",
      takePhoto: "Prendre une Photo",
      aiDetectType: "L'IA détectera le type de problème",
      gpsLocation: "Localisation GPS",
      autoTagged: "Auto-étiquetage",
      voiceInput: "Entrée Vocale",
      speechToText: "Voix vers texte",
      
      // Community & Gamification
      communityLeaders: "Leaders de la Communauté",
      points: "Points",
      achievements: "Réalisations",
      badge: "Badge",
      firstReporter: "Premier Rapporteur",
      problemSolver: "Résolveur de Problèmes",
      communityGuardian: "Gardien de la Communauté",
      unlocked: "Débloqué",
      locked: "Verrouillé",
      
      // Statistics
      activeReports: "Rapports Actifs",
      inProgress: "En Cours",
      resolved: "Résolus",
      avgResponseTime: "Temps de Réponse Moyen",
      days: "jours",
      
      // Report Form
      whatIssue: "Quel est le problème ?",
      issueCategory: "Catégorie du Problème",
      selectCategory: "Sélectionnez une catégorie",
      infrastructure: "Infrastructure",
      environment: "Environnement",
      safety: "Sécurité",
      publicServices: "Services Publics",
      other: "Autre",
      
      issueTitle: "Titre du Problème",
      issueTitlePlaceholder: "Description brève du problème",
      issueDescription: "Description Détaillée",
      issueDescriptionPlaceholder: "Fournissez des informations détaillées sur le problème",
      
      location: "Emplacement",
      getCurrentLocation: "Obtenir la Localisation Actuelle",
      manualLocation: "Saisir la Localisation Manuelle",
      locationPlaceholder: "Entrez l'adresse ou le point de repère",
      
      photo: "Photo",
      takeOrUpload: "Prenez une photo ou téléchargez depuis la galerie",
      uploadPhoto: "Télécharger une Photo",
      retakePhoto: "Reprendre la Photo",
      
      urgency: "Niveau d'Urgence",
      low: "Faible",
      medium: "Moyen",
      high: "Élevé",
      critical: "Critique",
      
      anonymous: "Signaler Anonymement",
      submitReport: "Soumettre le Rapport",
      submitting: "Soumission en cours...",
      
      // Duplicate Detection
      similarIssueFound: "Problème Similaire Trouvé",
      duplicateMessage: "Nous avons trouvé un problème similaire qui pourrait être le même que le vôtre :",
      upvoteExisting: "Voter pour le Problème Existant",
      submitAnyway: "Soumettre comme Nouveau Problème",
      reportedBy: "Signalé par",
      timeAgoText: "il y a {{time}}",
      
      // PWA Installation
      installApp: "Installer l'App",
      installPromptTitle: "Installer CivicConnect",
      installPromptMessage: "Installez notre app pour un accès rapide et des capacités de rapport hors ligne.",
      install: "Installer",
      cancel: "Annuler",
      addToHomeScreen: "Ajouter à l'Écran d'Accueil",
      
      // Issue Status
      status: {
        active: "Actif",
        inProgress: "En Cours",
        resolved: "Résolu",
        closed: "Fermé"
      },
      
      // Messages
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      noData: "Aucune donnée disponible",
      networkError: "Erreur réseau. Veuillez vérifier votre connexion.",
      locationPermissionDenied: "Permission de localisation refusée",
      cameraPermissionDenied: "Permission de caméra refusée",
      
      // Time
      timeAgo: {
        justNow: "À l'instant",
        minutesAgo: "il y a {{minutes}} minutes",
        hoursAgo: "il y a {{hours}} heures",
        daysAgo: "il y a {{days}} jours",
        weeksAgo: "il y a {{weeks}} semaines",
        monthsAgo: "il y a {{months}} mois"
      }
    }
  },
  de: {
    translation: {
      appName: "CivicConnect",
      home: "Startseite",
      report: "Problem melden",
      myReports: "Meine Berichte",
      map: "Karte",
      admin: "Admin",
      profile: "Profil",
      logout: "Abmelden",
      login: "Anmelden",
      signup: "Registrieren",
      reportIssueTitle: "Ein Problem melden",
      reportIssueSubtitle: "Helfen Sie Ihrer Gemeinschaft mit KI-gestützten Berichten",
      takePhoto: "Foto aufnehmen",
      aiDetectType: "KI erkennt Problemtyp",
      gpsLocation: "GPS-Standort",
      autoTagged: "Auto-markiert",
      voiceInput: "Spracheingabe",
      speechToText: "Sprache-zu-Text",
      communityLeaders: "Gemeinschaftsführer",
      points: "Punkte",
      achievements: "Errungenschaften",
      badge: "Abzeichen",
      firstReporter: "Erster Berichterstatter",
      problemSolver: "Problemlöser",
      communityGuardian: "Gemeinschaftswächter",
      unlocked: "Freigeschaltet",
      locked: "Gesperrt",
      activeReports: "Aktive Berichte",
      inProgress: "In Bearbeitung",
      resolved: "Gelöst",
      avgResponseTime: "Durchschnittliche Antwortzeit",
      days: "Tage",
      loading: "Lädt...",
      error: "Fehler",
      success: "Erfolg"
    }
  },
  it: {
    translation: {
      appName: "CivicConnect",
      home: "Home",
      report: "Segnala Problema",
      myReports: "I Miei Report",
      map: "Mappa",
      admin: "Admin",
      profile: "Profilo",
      logout: "Esci",
      login: "Accedi",
      signup: "Registrati",
      reportIssueTitle: "Segnala un Problema",
      reportIssueSubtitle: "Aiuta a migliorare la tua comunità con report alimentati dall'IA",
      takePhoto: "Scatta Foto",
      aiDetectType: "L'IA rileverà il tipo di problema",
      gpsLocation: "Posizione GPS",
      autoTagged: "Auto-taggato",
      voiceInput: "Input Vocale",
      speechToText: "Voce in testo",
      communityLeaders: "Leader della Comunità",
      points: "Punti",
      achievements: "Obiettivi",
      badge: "Distintivo",
      firstReporter: "Primo Segnalatore",
      problemSolver: "Risolutore di Problemi",
      communityGuardian: "Guardiano della Comunità",
      unlocked: "Sbloccato",
      locked: "Bloccato",
      activeReports: "Report Attivi",
      inProgress: "In Corso",
      resolved: "Risolti",
      avgResponseTime: "Tempo Medio di Risposta",
      days: "giorni",
      loading: "Caricamento...",
      error: "Errore",
      success: "Successo"
    }
  },
  pt: {
    translation: {
      appName: "CivicConnect",
      home: "Início",
      report: "Reportar Problema",
      myReports: "Meus Relatórios",
      map: "Mapa",
      admin: "Admin",
      profile: "Perfil",
      logout: "Sair",
      login: "Entrar",
      signup: "Cadastrar",
      reportIssueTitle: "Reportar um Problema",
      reportIssueSubtitle: "Ajude a melhorar sua comunidade com relatórios alimentados por IA",
      takePhoto: "Tirar Foto",
      aiDetectType: "IA detectará tipo do problema",
      gpsLocation: "Localização GPS",
      autoTagged: "Auto-marcado",
      voiceInput: "Entrada de Voz",
      speechToText: "Voz para texto",
      communityLeaders: "Líderes da Comunidade",
      points: "Pontos",
      achievements: "Conquistas",
      badge: "Distintivo",
      firstReporter: "Primeiro Relator",
      problemSolver: "Solucionador de Problemas",
      communityGuardian: "Guardião da Comunidade",
      unlocked: "Desbloqueado",
      locked: "Bloqueado",
      activeReports: "Relatórios Ativos",
      inProgress: "Em Andamento",
      resolved: "Resolvidos",
      avgResponseTime: "Tempo Médio de Resposta",
      days: "dias",
      loading: "Carregando...",
      error: "Erro",
      success: "Sucesso"
    }
  },
  hi: {
    translation: {
      appName: "CivicConnect",
      home: "होम",
      report: "समस्या रिपोर्ट करें",
      myReports: "मेरी रिपोर्ट्स",
      map: "मैप",
      admin: "एडमिन",
      profile: "प्रोफाइल",
      logout: "लॉगआउट",
      login: "लॉगिन",
      signup: "साइन अप",
      reportIssueTitle: "समस्या रिपोर्ट करें",
      reportIssueSubtitle: "AI-संचालित रिपोर्टिंग के साथ अपने समुदाय को बेहतर बनाने में मदद करें",
      takePhoto: "फोटो लें",
      aiDetectType: "AI समस्या का प्रकार पहचानेगा",
      gpsLocation: "GPS स्थान",
      autoTagged: "ऑटो-टैग्ड",
      voiceInput: "वॉयस इनपुट",
      speechToText: "वाक्-से-टेक्स्ट",
      communityLeaders: "समुदायिक नेता",
      points: "अंक",
      achievements: "उपलब्धियां",
      badge: "बैज",
      firstReporter: "पहला रिपोर्टर",
      problemSolver: "समस्या समाधानकर्ता",
      communityGuardian: "समुदायिक संरक्षक",
      unlocked: "अनलॉक्ड",
      locked: "लॉक्ड",
      activeReports: "सक्रिय रिपोर्ट्स",
      inProgress: "प्रगतिशील",
      resolved: "हल किया गया",
      avgResponseTime: "औसत प्रतिक्रिया समय",
      days: "दिन",
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      success: "सफलता"
    }
  },
  ja: {
    translation: {
      appName: "CivicConnect",
      home: "ホーム",
      report: "問題を報告",
      myReports: "マイレポート",
      map: "マップ",
      admin: "管理者",
      profile: "プロフィール",
      logout: "ログアウト",
      login: "ログイン",
      signup: "サインアップ",
      reportIssueTitle: "問題を報告",
      reportIssueSubtitle: "AI搭載レポートでコミュニティの改善に貢献",
      takePhoto: "写真を撮る",
      aiDetectType: "AIが問題タイプを検出",
      gpsLocation: "GPS位置",
      autoTagged: "自動タグ付け",
      voiceInput: "音声入力",
      speechToText: "音声からテキスト",
      communityLeaders: "コミュニティリーダー",
      points: "ポイント",
      achievements: "実績",
      badge: "バッジ",
      firstReporter: "初回報告者",
      problemSolver: "問題解決者",
      communityGuardian: "コミュニティガーディアン",
      unlocked: "アンロック済み",
      locked: "ロック済み",
      activeReports: "アクティブレポート",
      inProgress: "進行中",
      resolved: "解決済み",
      avgResponseTime: "平均応答時間",
      days: "日",
      loading: "読み込み中...",
      error: "エラー",
      success: "成功"
    }
  },
  zh: {
    translation: {
      appName: "CivicConnect",
      home: "首页",
      report: "举报问题",
      myReports: "我的举报",
      map: "地图",
      admin: "管理员",
      profile: "个人资料",
      logout: "登出",
      login: "登录",
      signup: "注册",
      reportIssueTitle: "举报问题",
      reportIssueSubtitle: "通过AI驱动的举报帮助改善您的社区",
      takePhoto: "拍照",
      aiDetectType: "AI将检测问题类型",
      gpsLocation: "GPS位置",
      autoTagged: "自动标记",
      voiceInput: "语音输入",
      speechToText: "语音转文字",
      communityLeaders: "社区领袖",
      points: "积分",
      achievements: "成就",
      badge: "徽章",
      firstReporter: "首位举报者",
      problemSolver: "问题解决者",
      communityGuardian: "社区守护者",
      unlocked: "已解锁",
      locked: "已锁定",
      activeReports: "活跃举报",
      inProgress: "进行中",
      resolved: "已解决",
      avgResponseTime: "平均响应时间",
      days: "天",
      loading: "加载中...",
      error: "错误",
      success: "成功"
    }
  },
  ar: {
    translation: {
      appName: "CivicConnect",
      home: "الرئيسية",
      report: "إبلاغ عن مشكلة",
      myReports: "تقاريري",
      map: "الخريطة",
      admin: "المشرف",
      profile: "الملف الشخصي",
      logout: "تسجيل الخروج",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      reportIssueTitle: "إبلاغ عن مشكلة",
      reportIssueSubtitle: "ساعد في تحسين مجتمعك بتقارير مدعومة بالذكاء الاصطناعي",
      takePhoto: "التقط صورة",
      aiDetectType: "سيحدد الذكاء الاصطناعي نوع المشكلة",
      gpsLocation: "موقع GPS",
      autoTagged: "وسم تلقائي",
      voiceInput: "إدخال صوتي",
      speechToText: "تحويل الكلام إلى نص",
      communityLeaders: "قادة المجتمع",
      points: "النقاط",
      achievements: "الإنجازات",
      badge: "الشارة",
      firstReporter: "أول مبلغ",
      problemSolver: "حلال المشاكل",
      communityGuardian: "حارس المجتمع",
      unlocked: "مفتوح",
      locked: "مغلق",
      activeReports: "التقارير النشطة",
      inProgress: "قيد التنفيذ",
      resolved: "تم الحل",
      avgResponseTime: "متوسط وقت الاستجابة",
      days: "أيام",
      loading: "جاري التحميل...",
      error: "خطأ",
      success: "نجح"
    }
  },
  ru: {
    translation: {
      appName: "CivicConnect",
      home: "Главная",
      report: "Сообщить о проблеме",
      myReports: "Мои отчёты",
      map: "Карта",
      admin: "Админ",
      profile: "Профиль",
      logout: "Выйти",
      login: "Войти",
      signup: "Регистрация",
      reportIssueTitle: "Сообщить о проблеме",
      reportIssueSubtitle: "Помогите улучшить ваше сообщество с отчётами на основе ИИ",
      takePhoto: "Сделать фото",
      aiDetectType: "ИИ определит тип проблемы",
      gpsLocation: "GPS местоположение",
      autoTagged: "Авто-тег",
      voiceInput: "Голосовой ввод",
      speechToText: "Речь в текст",
      communityLeaders: "Лидеры сообщества",
      points: "Очки",
      achievements: "Достижения",
      badge: "Значок",
      firstReporter: "Первый репортёр",
      problemSolver: "Решатель проблем",
      communityGuardian: "Страж сообщества",
      unlocked: "Разблокировано",
      locked: "Заблокировано",
      activeReports: "Активные отчёты",
      inProgress: "В процессе",
      resolved: "Решено",
      avgResponseTime: "Среднее время ответа",
      days: "дней",
      loading: "Загрузка...",
      error: "Ошибка",
      success: "Успех"
    }
  },
  nl: {
    translation: {
      appName: "CivicConnect",
      home: "Home",
      report: "Probleem Melden",
      myReports: "Mijn Rapporten",
      map: "Kaart",
      admin: "Admin",
      profile: "Profiel",
      logout: "Uitloggen",
      login: "Inloggen",
      signup: "Aanmelden",
      reportIssueTitle: "Een Probleem Melden",
      reportIssueSubtitle: "Help je gemeenschap verbeteren met AI-aangedreven rapportage",
      takePhoto: "Foto Maken",
      aiDetectType: "AI detecteert probleemtype",
      gpsLocation: "GPS Locatie",
      autoTagged: "Auto-getagd",
      voiceInput: "Spraak Invoer",
      speechToText: "Spraak-naar-tekst",
      communityLeaders: "Gemeenschapsleiders",
      points: "Punten",
      achievements: "Prestaties",
      badge: "Badge",
      firstReporter: "Eerste Melder",
      problemSolver: "Probleemoplosser",
      communityGuardian: "Gemeenschapsbewaker",
      unlocked: "Ontgrendeld",
      locked: "Vergrendeld",
      activeReports: "Actieve Rapporten",
      inProgress: "In Behandeling",
      resolved: "Opgelost",
      avgResponseTime: "Gemiddelde Reactietijd",
      days: "dagen",
      loading: "Laden...",
      error: "Fout",
      success: "Succes"
    }
  },
  ko: {
    translation: {
      appName: "CivicConnect",
      home: "홈",
      report: "문제 신고",
      myReports: "내 신고",
      map: "지도",
      admin: "관리자",
      profile: "프로필",
      logout: "로그아웃",
      login: "로그인",
      signup: "회원가입",
      reportIssueTitle: "문제 신고",
      reportIssueSubtitle: "AI 기반 신고로 지역 사회 개선에 도움을 주세요",
      takePhoto: "사진 찍기",
      aiDetectType: "AI가 문제 유형을 감지합니다",
      gpsLocation: "GPS 위치",
      autoTagged: "자동 태그",
      voiceInput: "음성 입력",
      speechToText: "음성을 텍스트로",
      communityLeaders: "커뮤니티 리더",
      points: "포인트",
      achievements: "업적",
      badge: "배지",
      firstReporter: "첫 번째 신고자",
      problemSolver: "문제 해결사",
      communityGuardian: "커뮤니티 가디언",
      unlocked: "잠금 해제됨",
      locked: "잠김",
      activeReports: "활성 신고",
      inProgress: "진행 중",
      resolved: "해결됨",
      avgResponseTime: "평균 응답 시간",
      days: "일",
      loading: "로딩 중...",
      error: "오류",
      success: "성공"
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;