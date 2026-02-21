#!/bin/bash

# FutureUp Academy - Test Data Seeder
# Creates: 1 teacher, 2 courses, 5 students, 2 parents, lessons, materials, grades, attendance

API="https://futureupacademy.az/api"

echo "=== Getting admin token ==="
TOKEN=$(curl -s -X POST "$API/auth/unified-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@futureupacademy.az","password":"FtUp#Adm1n$2024xZ"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

echo "Token: ${TOKEN:0:30}..."

AUTH="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

# ==========================================
# 1. Create Category
# ==========================================
echo ""
echo "=== Creating Category ==="
CAT_RESULT=$(curl -s -X POST "$API/admin/categories" \
  -H "$AUTH" -H "$CT" \
  -d '{
    "nameAz": "Proqramlasdirma",
    "nameRu": "Программирование",
    "nameEn": "Programming",
    "slug": "programming-test",
    "order": 99
  }')
CAT_ID=$(echo "$CAT_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
echo "Category ID: $CAT_ID"

# ==========================================
# 2. Create Teacher
# ==========================================
echo ""
echo "=== Creating Teacher ==="
TEACHER_RESULT=$(curl -s -X POST "$API/admin/teachers" \
  -H "$AUTH" -H "$CT" \
  -d '{
    "nameAz": "Elvin Hasanov",
    "nameRu": "Эльвин Гасанов",
    "nameEn": "Elvin Hasanov",
    "bioAz": "5 il tecrubeli Full-Stack developer. React, Node.js ve Python uzre mutexessis.",
    "bioRu": "Full-Stack разработчик с 5-летним опытом. Специалист по React, Node.js и Python.",
    "bioEn": "Full-Stack developer with 5 years of experience. Specialist in React, Node.js and Python.",
    "email": "elvin.teacher@futureupacademy.az",
    "password": "Teacher123!",
    "specialization": "Full-Stack Development",
    "isActive": true
  }')
TEACHER_ID=$(echo "$TEACHER_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
echo "Teacher ID: $TEACHER_ID"

# ==========================================
# 3. Create 2 Courses
# ==========================================
echo ""
echo "=== Creating Course 1: Web Development ==="
COURSE1_RESULT=$(curl -s -X POST "$API/admin/courses" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"slug\": \"web-development-test\",
    \"titleAz\": \"Web Inkishaf (Full-Stack)\",
    \"titleRu\": \"Веб-разработка (Full-Stack)\",
    \"titleEn\": \"Web Development (Full-Stack)\",
    \"descAz\": \"HTML, CSS, JavaScript, React, Node.js ve database texnologiyalarini ehatesi edir. 3 ayda sifirdan professional web developer olacaqsiniz.\",
    \"descRu\": \"Охватывает HTML, CSS, JavaScript, React, Node.js и технологии баз данных. За 3 месяца вы станете профессиональным веб-разработчиком.\",
    \"descEn\": \"Covers HTML, CSS, JavaScript, React, Node.js and database technologies. In 3 months you will become a professional web developer.\",
    \"shortDescAz\": \"Sifirdan Full-Stack Web Developer olun\",
    \"shortDescRu\": \"Станьте Full-Stack Web Developer с нуля\",
    \"shortDescEn\": \"Become a Full-Stack Web Developer from scratch\",
    \"duration\": \"3 ay\",
    \"categoryId\": \"$CAT_ID\",
    \"price\": 450,
    \"level\": \"BEGINNER\",
    \"audience\": \"ADULTS\",
    \"isActive\": true,
    \"isFeatured\": true,
    \"teacherIds\": [\"$TEACHER_ID\"]
  }")
COURSE1_ID=$(echo "$COURSE1_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
echo "Course 1 ID: $COURSE1_ID"

echo ""
echo "=== Creating Course 2: Python ==="
COURSE2_RESULT=$(curl -s -X POST "$API/admin/courses" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"slug\": \"python-programming-test\",
    \"titleAz\": \"Python Proqramlashdirma\",
    \"titleRu\": \"Программирование на Python\",
    \"titleEn\": \"Python Programming\",
    \"descAz\": \"Python dili ile proqramlashdimanin esaslari, OOP, API yaratma, data analitika ve avtomatizasiya.\",
    \"descRu\": \"Основы программирования на Python, ООП, создание API, анализ данных и автоматизация.\",
    \"descEn\": \"Python programming basics, OOP, API creation, data analytics and automation.\",
    \"shortDescAz\": \"Python ile proqramlasdirmani oyrenin\",
    \"shortDescRu\": \"Изучите программирование на Python\",
    \"shortDescEn\": \"Learn programming with Python\",
    \"duration\": \"4 ay\",
    \"categoryId\": \"$CAT_ID\",
    \"price\": 350,
    \"level\": \"BEGINNER\",
    \"audience\": \"ADULTS\",
    \"isActive\": true,
    \"teacherIds\": [\"$TEACHER_ID\"]
  }")
COURSE2_ID=$(echo "$COURSE2_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
echo "Course 2 ID: $COURSE2_ID"

# ==========================================
# 4. Create 5 Students
# ==========================================
echo ""
echo "=== Creating Students ==="

create_student() {
  local name=$1 email=$2 phone=$3 courses=$4
  RESULT=$(curl -s -X POST "$API/admin/students" \
    -H "$AUTH" -H "$CT" \
    -d "{\"name\": \"$name\", \"email\": \"$email\", \"phone\": \"$phone\", \"password\": \"Student123\", \"courseIds\": $courses}")
  ID=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
  echo "  Student: $name -> ID: $ID"
  echo "$ID"
}

S1_ID=$(create_student "Murad Aliyev" "murad.test@academy.az" "+994501111111" "[\"$COURSE1_ID\",\"$COURSE2_ID\"]" | tail -1)
S2_ID=$(create_student "Leyla Mammadova" "leyla.test@academy.az" "+994502222222" "[\"$COURSE1_ID\",\"$COURSE2_ID\"]" | tail -1)
S3_ID=$(create_student "Rashad Huseynov" "rashad.test@academy.az" "+994503333333" "[\"$COURSE1_ID\"]" | tail -1)
S4_ID=$(create_student "Aysel Karimova" "aysel.test@academy.az" "+994504444444" "[\"$COURSE1_ID\",\"$COURSE2_ID\"]" | tail -1)
S5_ID=$(create_student "Tural Ismayilov" "tural.test@academy.az" "+994505555555" "[\"$COURSE2_ID\"]" | tail -1)

echo ""
echo "Student IDs: $S1_ID, $S2_ID, $S3_ID, $S4_ID, $S5_ID"

# ==========================================
# 5. Create Parents & Link Children
# ==========================================
echo ""
echo "=== Creating Parents ==="

P1_RESULT=$(curl -s -X POST "$API/admin/parents" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"nameAz\": \"Farid Aliyev\",
    \"nameRu\": \"Фарид Алиев\",
    \"nameEn\": \"Farid Aliyev\",
    \"email\": \"farid.parent@academy.az\",
    \"password\": \"Parent123\",
    \"phone\": \"+994506666666\",
    \"childrenIds\": [{\"studentId\": \"$S1_ID\", \"relation\": \"FATHER\"}, {\"studentId\": \"$S3_ID\", \"relation\": \"FATHER\"}]
  }")
P1_ID=$(echo "$P1_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
echo "Parent 1 (Farid): $P1_ID"

P2_RESULT=$(curl -s -X POST "$API/admin/parents" \
  -H "$AUTH" -H "$CT" \
  -d "{
    \"nameAz\": \"Sevinc Mammadova\",
    \"nameRu\": \"Севиндж Маммадова\",
    \"nameEn\": \"Sevinc Mammadova\",
    \"email\": \"sevinc.parent@academy.az\",
    \"password\": \"Parent123\",
    \"phone\": \"+994507777777\",
    \"childrenIds\": [{\"studentId\": \"$S2_ID\", \"relation\": \"MOTHER\"}, {\"studentId\": \"$S4_ID\", \"relation\": \"MOTHER\"}]
  }")
P2_ID=$(echo "$P2_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
echo "Parent 2 (Sevinc): $P2_ID"

# ==========================================
# 6. Create Lessons for Course 1 (Web Dev)
# ==========================================
echo ""
echo "=== Creating Lessons for Web Development ==="

create_lesson() {
  local courseId=$1 titleAz=$2 titleRu=$3 titleEn=$4 order=$5
  RESULT=$(curl -s -X POST "$API/teacher/courses/$courseId/lessons" \
    -H "$AUTH" -H "$CT" \
    -d "{\"titleAz\": \"$titleAz\", \"titleRu\": \"$titleRu\", \"titleEn\": \"$titleEn\", \"order\": $order, \"isPublished\": true}")
  ID=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
  echo "$ID"
}

L1_ID=$(create_lesson "$COURSE1_ID" "HTML Esaslari" "Основы HTML" "HTML Basics" 1)
echo "  Lesson 1: HTML Basics -> $L1_ID"
L2_ID=$(create_lesson "$COURSE1_ID" "CSS ve Dizayn" "CSS и Дизайн" "CSS and Design" 2)
echo "  Lesson 2: CSS and Design -> $L2_ID"
L3_ID=$(create_lesson "$COURSE1_ID" "JavaScript Giris" "Введение в JavaScript" "JavaScript Introduction" 3)
echo "  Lesson 3: JavaScript Introduction -> $L3_ID"
L4_ID=$(create_lesson "$COURSE1_ID" "React Esaslari" "Основы React" "React Basics" 4)
echo "  Lesson 4: React Basics -> $L4_ID"

# Lessons for Course 2 (Python)
echo ""
echo "=== Creating Lessons for Python ==="
L5_ID=$(create_lesson "$COURSE2_ID" "Python Giris" "Введение в Python" "Python Introduction" 1)
echo "  Lesson 5: Python Introduction -> $L5_ID"
L6_ID=$(create_lesson "$COURSE2_ID" "Deyishenler ve Tiplar" "Переменные и Типы" "Variables and Types" 2)
echo "  Lesson 6: Variables and Types -> $L6_ID"
L7_ID=$(create_lesson "$COURSE2_ID" "Funksiyalar" "Функции" "Functions" 3)
echo "  Lesson 7: Functions -> $L7_ID"

# ==========================================
# 7. Add Materials to Lessons
# ==========================================
echo ""
echo "=== Adding Materials ==="

add_material() {
  local courseId=$1 lessonId=$2 title=$3 type=$4 url=$5
  curl -s -X POST "$API/teacher/courses/$courseId/lessons/$lessonId/materials" \
    -H "$AUTH" -H "$CT" \
    -d "{\"title\": \"$title\", \"type\": \"$type\", \"url\": \"$url\"}" > /dev/null
  echo "  Added: $title"
}

add_material "$COURSE1_ID" "$L1_ID" "HTML Presentation" "SLIDES" "https://docs.google.com/presentation/d/example-html"
add_material "$COURSE1_ID" "$L1_ID" "HTML Tutorial Video" "VIDEO" "https://www.youtube.com/watch?v=example1"
add_material "$COURSE1_ID" "$L2_ID" "CSS Guide" "DOCUMENT" "https://docs.google.com/document/d/example-css"
add_material "$COURSE1_ID" "$L3_ID" "JS Exercises" "LINK" "https://javascript.info/first-steps"
add_material "$COURSE1_ID" "$L3_ID" "JS Video Tutorial" "VIDEO" "https://www.youtube.com/watch?v=example2"
add_material "$COURSE1_ID" "$L4_ID" "React Docs" "LINK" "https://react.dev/learn"
add_material "$COURSE2_ID" "$L5_ID" "Python Install Guide" "DOCUMENT" "https://docs.google.com/document/d/example-python"
add_material "$COURSE2_ID" "$L5_ID" "Python Intro Video" "VIDEO" "https://www.youtube.com/watch?v=example3"
add_material "$COURSE2_ID" "$L6_ID" "Variables Cheat Sheet" "SLIDES" "https://docs.google.com/presentation/d/example-vars"
add_material "$COURSE2_ID" "$L7_ID" "Functions Practice" "LINK" "https://www.w3schools.com/python/python_functions.asp"

# ==========================================
# 8. Add Grades
# ==========================================
echo ""
echo "=== Adding Grades ==="

add_grade() {
  local courseId=$1 studentId=$2 value=$3 type=$4 comment=$5
  curl -s -X POST "$API/teacher/courses/$courseId/grades" \
    -H "$AUTH" -H "$CT" \
    -d "{\"studentId\": \"$studentId\", \"value\": $value, \"maxValue\": 100, \"type\": \"$type\", \"comment\": \"$comment\"}" > /dev/null
}

# Course 1 grades - Web Dev
echo "  Adding grades for Web Development..."
# Murad
add_grade "$COURSE1_ID" "$S1_ID" 92 "ASSIGNMENT" "Excellent HTML work"
add_grade "$COURSE1_ID" "$S1_ID" 88 "QUIZ" "Good understanding of CSS"
add_grade "$COURSE1_ID" "$S1_ID" 95 "PROJECT" "Outstanding final project"
# Leyla
add_grade "$COURSE1_ID" "$S2_ID" 78 "ASSIGNMENT" "Good effort"
add_grade "$COURSE1_ID" "$S2_ID" 85 "QUIZ" "Great improvement"
add_grade "$COURSE1_ID" "$S2_ID" 82 "PROJECT" "Well structured project"
# Rashad
add_grade "$COURSE1_ID" "$S3_ID" 65 "ASSIGNMENT" "Needs improvement"
add_grade "$COURSE1_ID" "$S3_ID" 70 "QUIZ" "Better than last time"
add_grade "$COURSE1_ID" "$S3_ID" 73 "PROJECT" "Acceptable work"
# Aysel
add_grade "$COURSE1_ID" "$S4_ID" 96 "ASSIGNMENT" "Perfect"
add_grade "$COURSE1_ID" "$S4_ID" 91 "QUIZ" "Excellent"
add_grade "$COURSE1_ID" "$S4_ID" 98 "PROJECT" "Best in class"

# Course 2 grades - Python
echo "  Adding grades for Python..."
# Murad
add_grade "$COURSE2_ID" "$S1_ID" 85 "ASSIGNMENT" "Good Python basics"
add_grade "$COURSE2_ID" "$S1_ID" 90 "QUIZ" "Strong understanding"
# Leyla
add_grade "$COURSE2_ID" "$S2_ID" 92 "ASSIGNMENT" "Excellent coding"
add_grade "$COURSE2_ID" "$S2_ID" 88 "QUIZ" "Great work"
# Aysel
add_grade "$COURSE2_ID" "$S4_ID" 94 "ASSIGNMENT" "Outstanding"
add_grade "$COURSE2_ID" "$S4_ID" 97 "QUIZ" "Perfect score almost"
# Tural
add_grade "$COURSE2_ID" "$S5_ID" 76 "ASSIGNMENT" "Good start"
add_grade "$COURSE2_ID" "$S5_ID" 80 "QUIZ" "Improving"

echo "  Grades added!"

# ==========================================
# 9. Add Attendance
# ==========================================
echo ""
echo "=== Adding Attendance ==="

add_attendance() {
  local courseId=$1 date=$2 records=$3
  curl -s -X POST "$API/teacher/courses/$courseId/attendance" \
    -H "$AUTH" -H "$CT" \
    -d "{\"date\": \"$date\", \"records\": $records}" > /dev/null
}

# Course 1 attendance (4 students: S1, S2, S3, S4)
echo "  Adding attendance for Web Development..."
add_attendance "$COURSE1_ID" "2026-02-10" "[{\"studentId\":\"$S1_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S2_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S3_ID\",\"status\":\"ABSENT\",\"note\":\"Sick\"},{\"studentId\":\"$S4_ID\",\"status\":\"PRESENT\"}]"
add_attendance "$COURSE1_ID" "2026-02-12" "[{\"studentId\":\"$S1_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S2_ID\",\"status\":\"LATE\"},{\"studentId\":\"$S3_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S4_ID\",\"status\":\"PRESENT\"}]"
add_attendance "$COURSE1_ID" "2026-02-14" "[{\"studentId\":\"$S1_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S2_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S3_ID\",\"status\":\"LATE\"},{\"studentId\":\"$S4_ID\",\"status\":\"EXCUSED\"}]"
add_attendance "$COURSE1_ID" "2026-02-17" "[{\"studentId\":\"$S1_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S2_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S3_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S4_ID\",\"status\":\"PRESENT\"}]"
add_attendance "$COURSE1_ID" "2026-02-19" "[{\"studentId\":\"$S1_ID\",\"status\":\"LATE\"},{\"studentId\":\"$S2_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S3_ID\",\"status\":\"ABSENT\"},{\"studentId\":\"$S4_ID\",\"status\":\"PRESENT\"}]"
add_attendance "$COURSE1_ID" "2026-02-21" "[{\"studentId\":\"$S1_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S2_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S3_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S4_ID\",\"status\":\"PRESENT\"}]"

# Course 2 attendance (4 students: S1, S2, S4, S5)
echo "  Adding attendance for Python..."
add_attendance "$COURSE2_ID" "2026-02-11" "[{\"studentId\":\"$S1_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S2_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S4_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S5_ID\",\"status\":\"ABSENT\"}]"
add_attendance "$COURSE2_ID" "2026-02-13" "[{\"studentId\":\"$S1_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S2_ID\",\"status\":\"LATE\"},{\"studentId\":\"$S4_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S5_ID\",\"status\":\"PRESENT\"}]"
add_attendance "$COURSE2_ID" "2026-02-18" "[{\"studentId\":\"$S1_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S2_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S4_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S5_ID\",\"status\":\"LATE\"}]"
add_attendance "$COURSE2_ID" "2026-02-20" "[{\"studentId\":\"$S1_ID\",\"status\":\"EXCUSED\"},{\"studentId\":\"$S2_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S4_ID\",\"status\":\"PRESENT\"},{\"studentId\":\"$S5_ID\",\"status\":\"PRESENT\"}]"

echo "  Attendance added!"

# ==========================================
# SUMMARY
# ==========================================
echo ""
echo "==========================================="
echo "  TEST DATA CREATED SUCCESSFULLY!"
echo "==========================================="
echo ""
echo "ACCOUNTS:"
echo "  Teacher: elvin.teacher@futureupacademy.az / Teacher123!"
echo "  Student 1: murad.test@academy.az / Student123"
echo "  Student 2: leyla.test@academy.az / Student123"
echo "  Student 3: rashad.test@academy.az / Student123"
echo "  Student 4: aysel.test@academy.az / Student123"
echo "  Student 5: tural.test@academy.az / Student123"
echo "  Parent 1: farid.parent@academy.az / Parent123 (children: Murad, Rashad)"
echo "  Parent 2: sevinc.parent@academy.az / Parent123 (children: Leyla, Aysel)"
echo ""
echo "COURSES:"
echo "  1. Web Development (Full-Stack) - 4 lessons, 6 materials"
echo "  2. Python Programming - 3 lessons, 4 materials"
echo ""
echo "DATA:"
echo "  Grades: 20 grades across both courses"
echo "  Attendance: 10 sessions (6 for Web Dev, 4 for Python)"
echo "==========================================="
