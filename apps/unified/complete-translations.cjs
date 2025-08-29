#!/usr/bin/env node

/**
 * I18n Translation Completion Script
 * Adds missing critical translation keys to incomplete locale files
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src/i18n/locales');
const enFilePath = path.join(localesDir, 'en.json');

// Read English locale as the reference
const enLocale = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));

// Define critical sections that must be translated
const criticalSections = ['app.pwa', 'app.offline', 'accessibility', 'navigation', 'common'];

// Translation mappings for critical sections
const translations = {
  es: {
    'app.pwa.installTitle': 'Instalar Nova Universe',
    'app.pwa.installDescription':
      'Obtén acceso más rápido y trabaja sin conexión con nuestra aplicación',
    'app.pwa.install': 'Instalar Aplicación',
    'app.pwa.installing': 'Instalando...',
    'app.pwa.updateAvailable': 'Una nueva versión está disponible. ¿Recargar para actualizar?',

    'app.offline.title': 'Estás desconectado',
    'app.offline.description':
      'Verifica tu conexión e intenta de nuevo. Algunas funciones pueden estar disponibles sin conexión.',
    'app.offline.noConnection': 'Sin conexión a internet',
    'app.offline.backOnline': '¡Estás de vuelta en línea!',
    'app.offline.connectionRestored': 'Tu conexión a internet ha sido restaurada.',
    'app.offline.continue': 'Continuar',
    'app.offline.tryAgain': 'Intentar de Nuevo',
    'app.offline.retryAttempts': 'Intentos de reintento: {{count}}',
    'app.offline.lastTrySeconds': 'Último intento hace {{seconds}} segundos',
    'app.offline.lastTryMinutes': 'Último intento hace {{minutes}} minutos',
    'app.offline.availableFeatures': 'Disponible sin conexión:',
    'app.offline.feature.viewCachedData': 'Ver datos en caché',
    'app.offline.feature.readKnowledgeBase': 'Leer artículos de la base de conocimiento',
    'app.offline.feature.submitFormsOffline': 'Enviar formularios (en cola)',
    'app.offline.feature.realTimeUpdates': 'Actualizaciones en tiempo real no disponibles',
    'app.offline.tip': 'Tu trabajo será guardado y sincronizado cuando vuelvas a estar en línea',

    'accessibility.openMenu': 'Abrir menú',
    'accessibility.closeMenu': 'Cerrar menú',
    'accessibility.toggleTheme': 'Cambiar tema',
    'accessibility.languageSelector': 'Selector de idioma',
    'accessibility.userMenu': 'Menú de usuario',
    'accessibility.searchBox': 'Caja de búsqueda',
    'accessibility.navigationMenu': 'Menú de navegación',
    'accessibility.mainContent': 'Contenido principal',
    'accessibility.skipToContent': 'Saltar al contenido',
    'accessibility.breadcrumb': 'Navegación de migas de pan',
    'accessibility.previousPage': 'Página anterior',
    'accessibility.nextPage': 'Página siguiente',
    'accessibility.firstPage': 'Primera página',
    'accessibility.lastPage': 'Última página',

    'navigation.dashboard': 'Panel de Control',
    'navigation.tickets': 'Tickets',
    'navigation.assets': 'Activos',
    'navigation.users': 'Usuarios',
    'navigation.reports': 'Informes',
    'navigation.settings': 'Configuración',
    'navigation.admin': 'Administración',
    'navigation.profile': 'Perfil',
    'navigation.help': 'Ayuda',
    'navigation.knowledgeBase': 'Base de Conocimiento',
    'navigation.search': 'Buscar',
    'navigation.searchPlaceholder': 'Buscar tickets, activos, espacios...',
    'navigation.notifications': 'Notificaciones',
    'navigation.menu': 'Menú',
    'navigation.close': 'Cerrar',
    'navigation.back': 'Atrás',
    'navigation.home': 'Inicio',
    'navigation.breadcrumb': 'Navegación por migas de pan',
    'navigation.goToDashboard': 'Ir al Panel de Control',
    'navigation.spaces': 'Espacios',
  },

  fr: {
    'app.pwa.installTitle': 'Installer Nova Universe',
    'app.pwa.installDescription':
      'Obtenez un accès plus rapide et travaillez hors ligne avec notre application',
    'app.pwa.install': "Installer l'Application",
    'app.pwa.installing': 'Installation...',
    'app.pwa.updateAvailable': 'Une nouvelle version est disponible. Recharger pour mettre à jour?',

    'app.offline.title': 'Vous êtes hors ligne',
    'app.offline.description':
      'Vérifiez votre connexion et réessayez. Certaines fonctionnalités peuvent être disponibles hors ligne.',
    'app.offline.noConnection': 'Aucune connexion internet',
    'app.offline.backOnline': 'Vous êtes de retour en ligne!',
    'app.offline.connectionRestored': 'Votre connexion internet a été restaurée.',
    'app.offline.continue': 'Continuer',
    'app.offline.tryAgain': 'Réessayer',
    'app.offline.retryAttempts': 'Tentatives de retry: {{count}}',
    'app.offline.lastTrySeconds': 'Dernière tentative il y a {{seconds}} secondes',
    'app.offline.lastTryMinutes': 'Dernière tentative il y a {{minutes}} minutes',
    'app.offline.availableFeatures': 'Disponible hors ligne:',
    'app.offline.feature.viewCachedData': 'Voir les données en cache',
    'app.offline.feature.readKnowledgeBase': 'Lire les articles de la base de connaissances',
    'app.offline.feature.submitFormsOffline': "Soumettre des formulaires (en file d'attente)",
    'app.offline.feature.realTimeUpdates': 'Mises à jour en temps réel non disponibles',
    'app.offline.tip':
      'Votre travail sera sauvegardé et synchronisé lorsque vous serez de nouveau en ligne',

    'accessibility.openMenu': 'Ouvrir le menu',
    'accessibility.closeMenu': 'Fermer le menu',
    'accessibility.toggleTheme': 'Basculer le thème',
    'accessibility.languageSelector': 'Sélecteur de langue',
    'accessibility.userMenu': 'Menu utilisateur',
    'accessibility.searchBox': 'Boîte de recherche',
    'accessibility.navigationMenu': 'Menu de navigation',
    'accessibility.mainContent': 'Contenu principal',
    'accessibility.skipToContent': 'Aller au contenu',
    'accessibility.breadcrumb': "Navigation fil d'Ariane",
    'accessibility.previousPage': 'Page précédente',
    'accessibility.nextPage': 'Page suivante',
    'accessibility.firstPage': 'Première page',
    'accessibility.lastPage': 'Dernière page',

    'navigation.dashboard': 'Tableau de Bord',
    'navigation.tickets': 'Tickets',
    'navigation.assets': 'Actifs',
    'navigation.users': 'Utilisateurs',
    'navigation.reports': 'Rapports',
    'navigation.settings': 'Paramètres',
    'navigation.admin': 'Administration',
    'navigation.profile': 'Profil',
    'navigation.help': 'Aide',
    'navigation.knowledgeBase': 'Base de Connaissances',
    'navigation.search': 'Rechercher',
    'navigation.searchPlaceholder': 'Rechercher tickets, actifs, espaces...',
    'navigation.notifications': 'Notifications',
    'navigation.menu': 'Menu',
    'navigation.close': 'Fermer',
    'navigation.back': 'Retour',
    'navigation.home': 'Accueil',
    'navigation.breadcrumb': "Navigation fil d'Ariane",
    'navigation.goToDashboard': 'Aller au Tableau de Bord',
    'navigation.spaces': 'Espaces',
  },

  ar: {
    'app.pwa.installTitle': 'تثبيت Nova Universe',
    'app.pwa.installDescription': 'احصل على وصول أسرع واعمل دون اتصال مع تطبيقنا',
    'app.pwa.install': 'تثبيت التطبيق',
    'app.pwa.installing': 'جاري التثبيت...',
    'app.pwa.updateAvailable': 'يتوفر إصدار جديد. إعادة تحميل للتحديث؟',

    'app.offline.title': 'أنت غير متصل',
    'app.offline.description':
      'تحقق من اتصالك وحاول مرة أخرى. قد تكون بعض الميزات متاحة دون اتصال.',
    'app.offline.noConnection': 'لا يوجد اتصال بالإنترنت',
    'app.offline.backOnline': 'عدت متصلاً!',
    'app.offline.connectionRestored': 'تم استعادة اتصال الإنترنت.',
    'app.offline.continue': 'متابعة',
    'app.offline.tryAgain': 'حاول مرة أخرى',
    'app.offline.retryAttempts': 'محاولات إعادة المحاولة: {{count}}',
    'app.offline.lastTrySeconds': 'المحاولة الأخيرة منذ {{seconds}} ثانية',
    'app.offline.lastTryMinutes': 'المحاولة الأخيرة منذ {{minutes}} دقيقة',
    'app.offline.availableFeatures': 'متاح دون اتصال:',
    'app.offline.feature.viewCachedData': 'عرض البيانات المخزنة مؤقتاً',
    'app.offline.feature.readKnowledgeBase': 'قراءة مقالات قاعدة المعرفة',
    'app.offline.feature.submitFormsOffline': 'إرسال النماذج (في الطابور)',
    'app.offline.feature.realTimeUpdates': 'التحديثات في الوقت الفعلي غير متاحة',
    'app.offline.tip': 'سيتم حفظ عملك ومزامنته عندما تعود متصلاً',

    'accessibility.openMenu': 'فتح القائمة',
    'accessibility.closeMenu': 'إغلاق القائمة',
    'accessibility.toggleTheme': 'تبديل السمة',
    'accessibility.languageSelector': 'محدد اللغة',
    'accessibility.userMenu': 'قائمة المستخدم',
    'accessibility.searchBox': 'صندوق البحث',
    'accessibility.navigationMenu': 'قائمة التنقل',
    'accessibility.mainContent': 'المحتوى الرئيسي',
    'accessibility.skipToContent': 'تخطي إلى المحتوى',
    'accessibility.breadcrumb': 'مسار التنقل',
    'accessibility.previousPage': 'الصفحة السابقة',
    'accessibility.nextPage': 'الصفحة التالية',
    'accessibility.firstPage': 'الصفحة الأولى',
    'accessibility.lastPage': 'الصفحة الأخيرة',

    'navigation.dashboard': 'لوحة التحكم',
    'navigation.tickets': 'التذاكر',
    'navigation.assets': 'الأصول',
    'navigation.users': 'المستخدمون',
    'navigation.reports': 'التقارير',
    'navigation.settings': 'الإعدادات',
    'navigation.admin': 'الإدارة',
    'navigation.profile': 'الملف الشخصي',
    'navigation.help': 'المساعدة',
    'navigation.knowledgeBase': 'قاعدة المعرفة',
    'navigation.search': 'بحث',
    'navigation.searchPlaceholder': 'البحث في التذاكر والأصول والمساحات...',
    'navigation.notifications': 'الإشعارات',
    'navigation.menu': 'القائمة',
    'navigation.close': 'إغلاق',
    'navigation.back': 'رجوع',
    'navigation.home': 'الرئيسية',
    'navigation.breadcrumb': 'مسار التنقل',
    'navigation.goToDashboard': 'الذهاب إلى لوحة التحكم',
    'navigation.spaces': 'المساحات',
  },
};

// Helper function to set nested object value
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
}

// Process each locale
Object.keys(translations).forEach((locale) => {
  const localeFilePath = path.join(localesDir, `${locale}.json`);

  if (fs.existsSync(localeFilePath)) {
    const localeData = JSON.parse(fs.readFileSync(localeFilePath, 'utf8'));

    // Add missing translations
    Object.entries(translations[locale]).forEach(([key, value]) => {
      setNestedValue(localeData, key, value);
    });

    // Write back to file
    fs.writeFileSync(localeFilePath, JSON.stringify(localeData, null, 2), 'utf8');
    console.log(
      `Updated ${locale}.json with ${Object.keys(translations[locale]).length} new translations`,
    );
  }
});

console.log('Translation completion script finished!');
