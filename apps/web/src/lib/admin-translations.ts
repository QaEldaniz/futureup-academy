/**
 * Admin panel UI translations (az / ru / en)
 * Used with adminLocale from Zustand store
 */

const translations = {
  // ═══════════════════════════════════════════
  // COMMON
  // ═══════════════════════════════════════════
  common: {
    search: { az: 'Axtar...', ru: 'Поиск...', en: 'Search...' },
    searchPages: { az: 'Səhifələri axtar...', ru: 'Поиск страниц...', en: 'Search pages...' },
    filters: { az: 'Filtrlər', ru: 'Фильтры', en: 'Filters' },
    cancel: { az: 'Ləğv et', ru: 'Отмена', en: 'Cancel' },
    save: { az: 'Saxla', ru: 'Сохранить', en: 'Save' },
    delete: { az: 'Sil', ru: 'Удалить', en: 'Delete' },
    edit: { az: 'Redaktə', ru: 'Редактировать', en: 'Edit' },
    deleting: { az: 'Silinir...', ru: 'Удаление...', en: 'Deleting...' },
    refresh: { az: 'Yenilə', ru: 'Обновить', en: 'Refresh' },
    previous: { az: 'Əvvəlki', ru: 'Назад', en: 'Previous' },
    next: { az: 'Növbəti', ru: 'Далее', en: 'Next' },
    page: { az: 'Səhifə', ru: 'Страница', en: 'Page' },
    of: { az: '/', ru: 'из', en: 'of' },
    noResults: { az: 'Nəticə tapılmadı', ru: 'Ничего не найдено', en: 'No results found' },
    actions: { az: 'Əməliyyatlar', ru: 'Действия', en: 'Actions' },
    status: { az: 'Status', ru: 'Статус', en: 'Status' },
    free: { az: 'Pulsuz', ru: 'Бесплатно', en: 'Free' },
    navigate: { az: 'Naviqasiya', ru: 'Навигация', en: 'Navigate' },
    open: { az: 'Aç', ru: 'Открыть', en: 'Open' },
    close: { az: 'Bağla', ru: 'Закрыть', en: 'Close' },
  },

  // ═══════════════════════════════════════════
  // SIDEBAR
  // ═══════════════════════════════════════════
  sidebar: {
    dashboard: { az: 'İdarə paneli', ru: 'Панель управления', en: 'Dashboard' },
    courses: { az: 'Kurslar', ru: 'Курсы', en: 'Courses' },
    teachers: { az: 'Müəllimlər', ru: 'Преподаватели', en: 'Teachers' },
    students: { az: 'Tələbələr', ru: 'Студенты', en: 'Students' },
    applications: { az: 'Müraciətlər', ru: 'Заявки', en: 'Applications' },
    certificates: { az: 'Sertifikatlar', ru: 'Сертификаты', en: 'Certificates' },
    news: { az: 'Xəbərlər', ru: 'Новости', en: 'News' },
    testimonials: { az: 'Rəylər', ru: 'Отзывы', en: 'Testimonials' },
    reviews: { az: 'Qiymətləndirmələr', ru: 'Оценки', en: 'Reviews' },
    scholarships: { az: 'Təqaüdlər', ru: 'Стипендии', en: 'Scholarships' },
    corporate: { az: 'Korporativ', ru: 'Корпоративное', en: 'Corporate' },
    parents: { az: 'Valideynlər', ru: 'Родители', en: 'Parents' },
    schedule: { az: 'Cədvəl', ru: 'Расписание', en: 'Schedule' },
    lms: { az: 'LMS İdarəetmə', ru: 'Управление LMS', en: 'LMS Management' },
    partners: { az: 'Tərəfdaşlar', ru: 'Партнёры', en: 'Partners' },
    settings: { az: 'Parametrlər', ru: 'Настройки', en: 'Settings' },
    adminSettings: { az: 'Admin parametrləri', ru: 'Настройки админа', en: 'Admin Settings' },
  },

  // ═══════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════
  header: {
    lightMode: { az: 'İşıqlı rejim', ru: 'Светлая тема', en: 'Light mode' },
    darkMode: { az: 'Qaranlıq rejim', ru: 'Тёмная тема', en: 'Dark mode' },
    notifications: { az: 'Bildirişlər', ru: 'Уведомления', en: 'Notifications' },
    pending: { az: 'gözləyən', ru: 'ожидающих', en: 'pending' },
    newApplication: { az: 'yeni müraciət', ru: 'новая заявка', en: 'new application' },
    newApplications: { az: 'yeni müraciət', ru: 'новых заявок', en: 'new applications' },
    waitingForReview: { az: 'Baxılmağı gözləyir', ru: 'Ожидает рассмотрения', en: 'Waiting for review' },
    pendingReview: { az: 'gözləyən rəy', ru: 'ожидающий отзыв', en: 'pending review' },
    pendingReviews: { az: 'gözləyən rəy', ru: 'ожидающих отзывов', en: 'pending reviews' },
    awaitingModeration: { az: 'Moderasiya gözləyir', ru: 'Ожидает модерации', en: 'Awaiting moderation' },
    recentApplications: { az: 'Son müraciətlər', ru: 'Последние заявки', en: 'Recent Applications' },
    noNotifications: { az: 'Bildiriş yoxdur', ru: 'Нет уведомлений', en: 'No notifications' },
    allCaughtUp: { az: 'Hamısına baxılıb!', ru: 'Всё просмотрено!', en: "You're all caught up!" },
    viewDashboard: { az: 'İdarə panelinə bax', ru: 'Открыть панель', en: 'View Dashboard' },
    profileSettings: { az: 'Profil parametrləri', ru: 'Настройки профиля', en: 'Profile Settings' },
    signOut: { az: 'Çıxış', ru: 'Выйти', en: 'Sign Out' },
    administrator: { az: 'Administrator', ru: 'Администратор', en: 'Administrator' },
    justNow: { az: 'indicə', ru: 'только что', en: 'just now' },
    mAgo: { az: 'd əvvəl', ru: 'м назад', en: 'm ago' },
    hAgo: { az: 's əvvəl', ru: 'ч назад', en: 'h ago' },
    dAgo: { az: 'g əvvəl', ru: 'д назад', en: 'd ago' },
    course: { az: 'Kurs', ru: 'Курс', en: 'Course' },
    // Search items
    addNewCourse: { az: 'Yeni kurs əlavə et', ru: 'Добавить курс', en: 'Add New Course' },
    addNewTeacher: { az: 'Yeni müəllim əlavə et', ru: 'Добавить преподавателя', en: 'Add New Teacher' },
    addNewStudent: { az: 'Yeni tələbə əlavə et', ru: 'Добавить студента', en: 'Add New Student' },
    createCertificate: { az: 'Sertifikat yarat', ru: 'Создать сертификат', en: 'Create Certificate' },
    addNewsArticle: { az: 'Xəbər əlavə et', ru: 'Добавить новость', en: 'Add News Article' },
  },

  // ═══════════════════════════════════════════
  // COURSES PAGE
  // ═══════════════════════════════════════════
  courses: {
    title: { az: 'Kurslar', ru: 'Курсы', en: 'Courses' },
    description: { az: 'Akademiyanın bütün kurslarını idarə edin', ru: 'Управление курсами академии', en: 'Manage all courses in the academy' },
    total: { az: 'cəmi', ru: 'всего', en: 'total' },
    addCourse: { az: 'Kurs əlavə et', ru: 'Добавить курс', en: 'Add Course' },
    createCourse: { az: 'Kurs yarat', ru: 'Создать курс', en: 'Create Course' },
    searchPlaceholder: { az: 'Kurs adı ilə axtar...', ru: 'Поиск курсов по названию...', en: 'Search courses by title...' },
    level: { az: 'Səviyyə:', ru: 'Уровень:', en: 'Level:' },
    allLevels: { az: 'Bütün səviyyələr', ru: 'Все уровни', en: 'All Levels' },
    beginner: { az: 'Başlanğıc', ru: 'Начальный', en: 'Beginner' },
    intermediate: { az: 'Orta', ru: 'Средний', en: 'Intermediate' },
    advanced: { az: 'İrəliləyən', ru: 'Продвинутый', en: 'Advanced' },
    courseCol: { az: 'Kurs', ru: 'Курс', en: 'Course' },
    category: { az: 'Kateqoriya', ru: 'Категория', en: 'Category' },
    price: { az: 'Qiymət', ru: 'Цена', en: 'Price' },
    noCourses: { az: 'Kurs tapılmadı', ru: 'Курсы не найдены', en: 'No courses found' },
    tryAdjusting: { az: 'Axtarış və ya filtrləri dəyişməyə çalışın.', ru: 'Попробуйте изменить поиск или фильтры.', en: 'Try adjusting your search or filters.' },
    getStarted: { az: 'İlk kursunuzu yaratmaqla başlayın.', ru: 'Начните с создания первого курса.', en: 'Get started by creating your first course.' },
    editCourse: { az: 'Kursu redaktə et', ru: 'Редактировать курс', en: 'Edit course' },
    deleteCourse: { az: 'Kursu sil', ru: 'Удалить курс', en: 'Delete course' },
    deleteTitle: { az: 'Kursu sil', ru: 'Удалить курс', en: 'Delete Course' },
    cannotUndo: { az: 'Bu əməliyyatı geri qaytarmaq mümkün deyil.', ru: 'Это действие нельзя отменить.', en: 'This action cannot be undone.' },
    confirmDelete: { az: 'Bu kursu silmək istədiyinizə əminsiniz?', ru: 'Вы уверены, что хотите удалить', en: 'Are you sure you want to delete' },
    allDataRemoved: { az: 'Bütün əlaqəli məlumatlar həmişəlik silinəcək.', ru: 'Все связанные данные будут удалены безвозвратно.', en: 'All associated data will be permanently removed.' },
    audience: { az: 'Auditoriya', ru: 'Аудитория', en: 'Audience' },
    itKids: { az: 'IT Kids', ru: 'IT Kids', en: 'IT Kids' },
    adults: { az: 'Böyüklər', ru: 'Взрослые', en: 'Adults' },
    allAudiences: { az: 'Bütün auditoriyalar', ru: 'Все аудитории', en: 'All Audiences' },
  },

  // ═══════════════════════════════════════════
  // TEACHERS PAGE
  // ═══════════════════════════════════════════
  teachers: {
    title: { az: 'Müəllimlər', ru: 'Преподаватели', en: 'Teachers' },
    description: { az: 'Akademiyanın müəllim heyətini idarə edin', ru: 'Управление преподавательским составом', en: "Manage your academy's teaching staff" },
    addTeacher: { az: 'Müəllim əlavə et', ru: 'Добавить преподавателя', en: 'Add Teacher' },
    addFirstTeacher: { az: 'İlk müəllimi əlavə et', ru: 'Добавить первого преподавателя', en: 'Add First Teacher' },
    searchPlaceholder: { az: 'Ad, email, ixtisas ilə axtar...', ru: 'Поиск по имени, email, специализации...', en: 'Search teachers by name, email, specialization...' },
    active: { az: 'Aktiv', ru: 'Активный', en: 'Active' },
    inactive: { az: 'Deaktiv', ru: 'Неактивный', en: 'Inactive' },
    courseAssigned: { az: 'kurs təyin edilib', ru: 'курс назначен', en: 'course assigned' },
    coursesAssigned: { az: 'kurs təyin edilib', ru: 'курсов назначено', en: 'courses assigned' },
    noTeachers: { az: 'Müəllim tapılmadı', ru: 'Преподаватели не найдены', en: 'No teachers found' },
    noMatch: { az: 'uyğun müəllim yoxdur. Axtarışı dəyişməyə çalışın.', ru: 'не соответствует ни одному преподавателю. Попробуйте изменить поиск.', en: '. Try adjusting your search.' },
    getStarted: { az: 'Akademiyaya ilk müəllimi əlavə edərək başlayın.', ru: 'Начните с добавления первого преподавателя.', en: 'Get started by adding your first teacher to the academy.' },
    deleteTitle: { az: 'Müəllimi sil', ru: 'Удалить преподавателя', en: 'Delete Teacher' },
    cannotUndo: { az: 'Bu əməliyyatı geri qaytarmaq mümkün deyil.', ru: 'Это действие нельзя отменить.', en: 'This action cannot be undone.' },
    confirmDelete: { az: 'Bu müəllimi silmək istədiyinizə əminsiniz? Bütün əlaqəli məlumatlar, o cümlədən kurs təyinatları silinəcək.', ru: 'Вы уверены, что хотите удалить этого преподавателя? Все связанные данные, включая назначения курсов, будут удалены.', en: 'Are you sure you want to delete this teacher? All associated data including course assignments will be removed.' },
    yesDelete: { az: 'Bəli, sil', ru: 'Да, удалить', en: 'Yes, Delete' },
  },

  // ═══════════════════════════════════════════
  // APPLICATIONS PAGE
  // ═══════════════════════════════════════════
  applications: {
    title: { az: 'Müraciətlər', ru: 'Заявки', en: 'Applications' },
    description: { az: 'Kurs müraciətlərini idarə edin və statuslarını izləyin.', ru: 'Управляйте заявками на курсы и отслеживайте их статус.', en: 'Manage course applications and track their status.' },
    searchPlaceholder: { az: 'Ad və ya email ilə axtar...', ru: 'Поиск по имени или email...', en: 'Search by name or email...' },
    allStatuses: { az: 'Bütün statuslar', ru: 'Все статусы', en: 'All Statuses' },
    new: { az: 'Yeni', ru: 'Новые', en: 'New' },
    contacted: { az: 'Əlaqə saxlanılıb', ru: 'Связались', en: 'Contacted' },
    enrolled: { az: 'Qeydiyyatdan keçib', ru: 'Зачислен', en: 'Enrolled' },
    rejected: { az: 'Rədd edilib', ru: 'Отклонён', en: 'Rejected' },
    allSources: { az: 'Bütün mənbələr', ru: 'Все источники', en: 'All Sources' },
    applicant: { az: 'Müraciətçi', ru: 'Заявитель', en: 'Applicant' },
    contact: { az: 'Əlaqə', ru: 'Контакт', en: 'Contact' },
    course: { az: 'Kurs', ru: 'Курс', en: 'Course' },
    source: { az: 'Mənbə', ru: 'Источник', en: 'Source' },
    date: { az: 'Tarix', ru: 'Дата', en: 'Date' },
    noApplications: { az: 'Müraciət tapılmadı', ru: 'Заявки не найдены', en: 'No applications found' },
    tryAdjustingFilters: { az: 'Filtrləri dəyişməyə çalışın', ru: 'Попробуйте изменить фильтры', en: 'Try adjusting your filters' },
    willAppearHere: { az: 'Müraciətlər burada görünəcək', ru: 'Заявки появятся здесь', en: 'Applications will appear here' },
    na: { az: 'Yoxdur', ru: 'Нет', en: 'N/A' },
    addNotesPlaceholder: { az: 'Bu müraciət haqqında qeyd əlavə edin...', ru: 'Добавьте заметки о заявке...', en: 'Add notes about this application...' },
    clickToAddNotes: { az: 'Qeyd əlavə etmək üçün klikləyin...', ru: 'Нажмите, чтобы добавить заметки...', en: 'Click to add notes...' },
    sourceLabel: { az: 'mənbə:', ru: 'источник:', en: 'source:' },
    mediumLabel: { az: 'kanal:', ru: 'канал:', en: 'medium:' },
    campaignLabel: { az: 'kampaniya:', ru: 'кампания:', en: 'campaign:' },
  },
  // ═══════════════════════════════════════════
  // LESSONS PAGE (Course Materials / LMS)
  // ═══════════════════════════════════════════
  lessons: {
    title: { az: 'Dərslər və Materiallar', ru: 'Уроки и Материалы', en: 'Lessons & Materials' },
    description: { az: 'Kurs dərslərini və materiallarını idarə edin', ru: 'Управление уроками и материалами курса', en: 'Manage course lessons and materials' },
    backToCourses: { az: 'Kurslara qayıt', ru: 'Назад к курсам', en: 'Back to Courses' },
    addLesson: { az: 'Dərs əlavə et', ru: 'Добавить урок', en: 'Add Lesson' },
    editLesson: { az: 'Dərsi redaktə et', ru: 'Редактировать урок', en: 'Edit Lesson' },
    deleteLesson: { az: 'Dərsi sil', ru: 'Удалить урок', en: 'Delete Lesson' },
    lessonTitle: { az: 'Dərs adı', ru: 'Название урока', en: 'Lesson Title' },
    lessonDesc: { az: 'Təsvir (istəyə bağlı)', ru: 'Описание (необязательно)', en: 'Description (optional)' },
    noLessons: { az: 'Hələ dərs yoxdur', ru: 'Уроков пока нет', en: 'No lessons yet' },
    noLessonsDesc: { az: 'İlk dərsinizi əlavə edin', ru: 'Добавьте первый урок', en: 'Add your first lesson' },
    published: { az: 'Yayımlanıb', ru: 'Опубликован', en: 'Published' },
    draft: { az: 'Qaralama', ru: 'Черновик', en: 'Draft' },
    materials: { az: 'Materiallar', ru: 'Материалы', en: 'Materials' },
    addMaterial: { az: 'Material əlavə et', ru: 'Добавить материал', en: 'Add Material' },
    editMaterial: { az: 'Materialı redaktə et', ru: 'Редактировать материал', en: 'Edit Material' },
    deleteMaterial: { az: 'Materialı sil', ru: 'Удалить материал', en: 'Delete Material' },
    materialTitle: { az: 'Material adı', ru: 'Название материала', en: 'Material Title' },
    materialUrl: { az: 'Link / URL', ru: 'Ссылка / URL', en: 'Link / URL' },
    materialType: { az: 'Növ', ru: 'Тип', en: 'Type' },
    slides: { az: 'Prezentasiya', ru: 'Презентация', en: 'Slides' },
    document: { az: 'Sənəd', ru: 'Документ', en: 'Document' },
    video: { az: 'Video', ru: 'Видео', en: 'Video' },
    spreadsheet: { az: 'Cədvəl', ru: 'Таблица', en: 'Spreadsheet' },
    link: { az: 'Link', ru: 'Ссылка', en: 'Link' },
    file: { az: 'Fayl', ru: 'Файл', en: 'File' },
    noMaterials: { az: 'Material yoxdur', ru: 'Материалов нет', en: 'No materials' },
    urlPlaceholder: { az: 'https://docs.google.com/...', ru: 'https://docs.google.com/...', en: 'https://docs.google.com/...' },
    confirmDeleteLesson: { az: 'Bu dərsi və bütün materiallarını silmək istədiyinizə əminsiniz?', ru: 'Удалить этот урок и все материалы?', en: 'Delete this lesson and all its materials?' },
    confirmDeleteMaterial: { az: 'Bu materialı silmək istədiyinizə əminsiniz?', ru: 'Удалить этот материал?', en: 'Delete this material?' },
    saving: { az: 'Saxlanılır...', ru: 'Сохранение...', en: 'Saving...' },
    lesson: { az: 'Dərs', ru: 'Урок', en: 'Lesson' },
    lessonsCount: { az: 'dərs', ru: 'уроков', en: 'lessons' },
    materialsCount: { az: 'material', ru: 'материалов', en: 'materials' },
  },
} as const;

type TranslationKeys = typeof translations;
type Section = keyof TranslationKeys;

/**
 * Hook-like helper to get translations for current admin locale.
 * Usage: const t = useAdminT('courses');
 *        then: t.title, t.description, etc.
 */
export function getAdminT<S extends Section>(section: S, locale: string) {
  const sectionData = translations[section];
  const result: Record<string, string> = {};

  for (const [key, val] of Object.entries(sectionData)) {
    const loc = locale as 'az' | 'ru' | 'en';
    result[key] = (val as Record<string, string>)[loc] || (val as Record<string, string>).en;
  }

  return result as Record<keyof TranslationKeys[S], string>;
}

export { translations };
