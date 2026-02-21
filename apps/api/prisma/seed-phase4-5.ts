/**
 * Seed script for Phase 4 (Assignments + Notifications) and Phase 5 (Quizzes)
 * Creates realistic test data for demo/presentation purposes
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Phase 4 & 5 data...\n');

  // =============================================
  // GET EXISTING DATA
  // =============================================

  // Get 3 courses with teachers and students
  const courseSlugs = ['frontend-development', 'quality-assurance', 'ai-machine-learning'];
  const courses: any[] = [];

  for (const slug of courseSlugs) {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        teachers: { include: { teacher: true } },
        students: { include: { student: true }, where: { status: 'ACTIVE' } },
      },
    });
    if (course) courses.push(course);
  }

  if (courses.length === 0) {
    console.log('❌ No courses found. Run main seed first.');
    return;
  }

  console.log(`Found ${courses.length} courses:\n`);
  for (const c of courses) {
    console.log(`  📚 ${c.titleEn} (${c.students.length} students, teacher: ${c.teachers[0]?.teacher?.email})`);
  }

  // =============================================
  // PHASE 4: ASSIGNMENTS
  // =============================================
  console.log('\n📝 Creating assignments...');

  // Clean existing data first
  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.notification.deleteMany();
  console.log('  ✓ Cleaned existing quiz/assignment data');

  // ---- Frontend Development Course ----
  const feTeacher = courses[0]?.teachers[0]?.teacher;
  const feStudents = courses[0]?.students?.map((s: any) => s.student) || [];

  if (courses[0] && feTeacher) {
    const feAssignments = await Promise.all([
      prisma.assignment.create({
        data: {
          courseId: courses[0].id,
          teacherId: feTeacher.id,
          title: 'Build a Personal Portfolio Website',
          description: `## Objective\nCreate a responsive personal portfolio website using **HTML**, **CSS**, and **JavaScript**.\n\n## Requirements\n\n### Must Have:\n- Responsive design (mobile, tablet, desktop)\n- Navigation bar with smooth scroll\n- Hero section with your name and role\n- Projects section (at least 3 cards)\n- Contact form\n- Footer with social links\n\n### Nice to Have:\n- Dark/light mode toggle\n- CSS animations\n- Form validation with JavaScript\n\n## Tech Stack\n\`\`\`\nHTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript\n\`\`\`\n\n## Grading Criteria\n\n| Criteria | Points |\n|----------|--------|\n| Design & Layout | 25 |\n| Responsiveness | 25 |\n| Code Quality | 20 |\n| Functionality | 20 |\n| Creativity | 10 |\n| **Total** | **100** |\n\n## Submission\nSubmit a GitHub repository link and a live demo URL (use GitHub Pages or Vercel).`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          maxScore: 100,
        },
      }),
      prisma.assignment.create({
        data: {
          courseId: courses[0].id,
          teacherId: feTeacher.id,
          title: 'React Todo App with Hooks',
          description: `## Task\nBuild a Todo application using **React** with modern Hooks.\n\n## Features\n- [x] Add new todos\n- [x] Mark todos as complete\n- [x] Delete todos\n- [x] Filter: All / Active / Completed\n- [x] Local Storage persistence\n- [ ] Drag and drop to reorder (bonus)\n\n## Code Example\n\n\`\`\`jsx\nfunction TodoItem({ todo, onToggle, onDelete }) {\n  return (\n    <div className={todo.completed ? 'completed' : ''}>\n      <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />\n      <span>{todo.text}</span>\n      <button onClick={() => onDelete(todo.id)}>×</button>\n    </div>\n  );\n}\n\`\`\`\n\n> 💡 **Tip:** Use \`useReducer\` for complex state management instead of multiple \`useState\` calls.\n\n## Deadline\nSubmit via GitHub link.`,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          maxScore: 100,
        },
      }),
      prisma.assignment.create({
        data: {
          courseId: courses[0].id,
          teacherId: feTeacher.id,
          title: 'CSS Grid Layout Challenge',
          description: `## Challenge\nRecreate the following layouts using **CSS Grid** only (no Flexbox).\n\n### Layout 1: Dashboard\n\`\`\`\n+----------+----------+\n| Sidebar  |  Header  |\n|          +----------+\n|          |          |\n|          |  Main    |\n|          |  Content |\n|          |          |\n+----------+----------+\n|      Footer         |\n+---------------------+\n\`\`\`\n\n### Layout 2: Magazine\n\`\`\`\n+------+------+------+\n| Big  | Sm1  | Sm2  |\n| Hero |      |      |\n|      +------+------+\n|      | Sm3  | Sm4  |\n+------+------+------+\n\`\`\`\n\n## Key Properties to Use\n- \`grid-template-columns\`\n- \`grid-template-rows\`\n- \`grid-template-areas\`\n- \`gap\`\n- \`grid-column\` / \`grid-row\``,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue!)
          maxScore: 50,
        },
      }),
    ]);

    console.log(`  ✓ Created ${feAssignments.length} assignments for Frontend Development`);

    // Create submissions from students
    for (const student of feStudents) {
      // Submit for assignment 1 (Portfolio)
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: feAssignments[0].id,
          studentId: student.id,
          linkUrl: 'https://github.com/' + student.name.toLowerCase().replace(/\s/g, '-') + '/portfolio',
          text: `## My Portfolio\n\nBuilt with HTML5, CSS3 (Grid + Flexbox), and Vanilla JS.\n\n### Features\n- ✅ Fully responsive\n- ✅ Dark mode toggle\n- ✅ Smooth scroll navigation\n- ✅ Contact form with validation\n- ✅ Deployed on Vercel\n\n### Screenshots\n![Desktop](https://via.placeholder.com/800x400)\n\n### Live Demo\n[portfolio.vercel.app](https://portfolio.vercel.app)`,
          status: 'GRADED',
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          grade: 88,
          feedback: `Great work! 🎉\n\n**Strengths:**\n- Clean, modern design\n- Good code organization\n- Smooth animations\n\n**Areas for improvement:**\n- Add more semantic HTML tags\n- Optimize images for faster loading\n- Consider adding aria-labels for accessibility\n\nOverall excellent submission!`,
          gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      });

      // Submit for assignment 2 (Todo App) - submitted but not graded
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: feAssignments[1].id,
          studentId: student.id,
          linkUrl: 'https://github.com/' + student.name.toLowerCase().replace(/\s/g, '-') + '/react-todo',
          text: `## React Todo App\n\nUsed \`useReducer\` + \`useContext\` for state management.\n\n\`\`\`javascript\nconst todoReducer = (state, action) => {\n  switch (action.type) {\n    case 'ADD': return [...state, { id: Date.now(), text: action.text, completed: false }];\n    case 'TOGGLE': return state.map(t => t.id === action.id ? {...t, completed: !t.completed} : t);\n    case 'DELETE': return state.filter(t => t.id !== action.id);\n    default: return state;\n  }\n};\n\`\`\`\n\nAll features implemented including localStorage persistence.`,
          status: 'SUBMITTED',
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      });

      // Assignment 3 (CSS Grid) - not submitted (overdue)
    }
    console.log(`  ✓ Created submissions for ${feStudents.length} students`);
  }

  // ---- QA Course ----
  const qaTeacher = courses[1]?.teachers[0]?.teacher;
  const qaStudents = courses[1]?.students?.map((s: any) => s.student) || [];

  if (courses[1] && qaTeacher) {
    const qaAssignments = await Promise.all([
      prisma.assignment.create({
        data: {
          courseId: courses[1].id,
          teacherId: qaTeacher.id,
          title: 'Write Test Cases for Login Page',
          description: `## Objective\nWrite comprehensive test cases for a login page.\n\n## Login Page Specs\n- Email field (required, valid format)\n- Password field (required, min 8 chars)\n- "Remember Me" checkbox\n- "Forgot Password" link\n- Submit button\n\n## Required Test Cases\n\n| # | Category | Min Cases |\n|---|----------|----------|\n| 1 | Positive scenarios | 3 |\n| 2 | Negative scenarios | 5 |\n| 3 | Boundary testing | 3 |\n| 4 | Security testing | 3 |\n| 5 | UI/UX testing | 2 |\n\n## Format\nUse this template:\n\n\`\`\`\nTC-001: [Title]\nPrecondition: ...\nSteps: 1. ... 2. ... 3. ...\nExpected Result: ...\nPriority: High/Medium/Low\n\`\`\`\n\n> ⚠️ Include both **functional** and **non-functional** test cases.`,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          maxScore: 100,
        },
      }),
      prisma.assignment.create({
        data: {
          courseId: courses[1].id,
          teacherId: qaTeacher.id,
          title: 'Bug Report Practice',
          description: `## Task\nFind and report **5 bugs** on the practice website: https://practice.futureupacademy.az\n\n## Bug Report Format\n\n\`\`\`markdown\n**Bug ID:** BUG-001\n**Title:** [Short descriptive title]\n**Severity:** Critical / Major / Minor / Trivial\n**Priority:** P1 / P2 / P3\n**Environment:** Chrome 120, macOS 14\n**Steps to Reproduce:**\n1. Go to ...\n2. Click on ...\n3. Enter ...\n\n**Expected Result:** ...\n**Actual Result:** ...\n**Screenshot:** [attach]\n\`\`\`\n\n## Grading\n- Quality of bug descriptions: 40%\n- Severity accuracy: 20%\n- Reproducibility: 20%\n- Coverage variety: 20%`,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          maxScore: 100,
        },
      }),
    ]);

    console.log(`  ✓ Created ${qaAssignments.length} assignments for QA`);

    for (const student of qaStudents) {
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: qaAssignments[0].id,
          studentId: student.id,
          text: `## Test Cases for Login Page\n\n### Positive Scenarios\n\n**TC-001: Successful login with valid credentials**\n- Precondition: User account exists\n- Steps: 1. Enter valid email 2. Enter valid password 3. Click Login\n- Expected: Redirect to dashboard\n- Priority: High\n\n**TC-002: Login with Remember Me checked**\n- Steps: 1. Enter creds 2. Check Remember Me 3. Login 4. Close browser 5. Reopen\n- Expected: User still logged in\n- Priority: Medium\n\n### Negative Scenarios\n\n**TC-003: Login with empty email**\n- Steps: 1. Leave email empty 2. Enter password 3. Click Login\n- Expected: Error "Email is required"\n- Priority: High\n\n**TC-004: Login with invalid email format**\n- Steps: 1. Enter "notanemail" 2. Enter password 3. Click Login\n- Expected: Error "Invalid email format"\n- Priority: High\n\n**TC-005: Login with wrong password**\n- Steps: 1. Enter valid email 2. Enter wrong password 3. Click Login\n- Expected: Error "Invalid credentials"\n- Priority: High`,
          status: 'GRADED',
          submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          grade: 92,
          feedback: 'Excellent test cases! Very thorough coverage. Great use of the template format. Consider adding more boundary test cases (e.g., exactly 8 character password, max length email).',
          gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log(`  ✓ Created submissions for QA students`);
  }

  // ---- AI/ML Course ----
  const aiTeacher = courses[2]?.teachers[0]?.teacher;
  const aiStudents = courses[2]?.students?.map((s: any) => s.student) || [];

  if (courses[2] && aiTeacher) {
    await prisma.assignment.create({
      data: {
        courseId: courses[2].id,
        teacherId: aiTeacher.id,
        title: 'Linear Regression from Scratch',
        description: `## Objective\nImplement **Linear Regression** from scratch using Python (no sklearn for the model itself).\n\n## Requirements\n\n\`\`\`python\nimport numpy as np\nimport matplotlib.pyplot as plt\n\nclass LinearRegression:\n    def __init__(self, learning_rate=0.01, n_iterations=1000):\n        self.lr = learning_rate\n        self.n_iter = n_iterations\n        self.weights = None\n        self.bias = None\n    \n    def fit(self, X, y):\n        # TODO: Implement gradient descent\n        pass\n    \n    def predict(self, X):\n        # TODO: Implement prediction\n        pass\n    \n    def score(self, X, y):\n        # TODO: Implement R² score\n        pass\n\`\`\`\n\n## Deliverables\n1. Working code with gradient descent\n2. Plot of cost function vs iterations\n3. Comparison with sklearn LinearRegression\n4. R² score on test data\n\n## Dataset\nUse the Boston Housing dataset or generate synthetic data.\n\n> 📊 **Bonus:** Add regularization (L1/L2) for extra credit.`,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        maxScore: 100,
      },
    });
    console.log(`  ✓ Created 1 assignment for AI/ML`);
  }

  // =============================================
  // PHASE 5: QUIZZES
  // =============================================
  console.log('\n🧪 Creating quizzes...\n');

  // ---- Frontend Development Quizzes ----
  if (courses[0] && feTeacher) {
    // Quiz 1: HTML & CSS Basics
    const quiz1 = await prisma.quiz.create({
      data: {
        courseId: courses[0].id,
        teacherId: feTeacher.id,
        title: 'HTML & CSS Fundamentals',
        description: 'Test your knowledge of HTML5 semantic elements and CSS3 styling. Covers box model, flexbox, grid, and responsive design.',
        timeLimit: 15,
        maxAttempts: 2,
        passingScore: 70,
        isActive: true,
        isPublished: true,
        showResults: true,
        shuffleQuestions: true,
        questions: {
          create: [
            {
              type: 'MULTIPLE_CHOICE',
              question: 'Which HTML5 element is used for **navigation links**?',
              options: [
                { id: 'a', text: '<navigation>' },
                { id: 'b', text: '<nav>' },
                { id: 'c', text: '<links>' },
                { id: 'd', text: '<menu>' },
              ],
              correctAnswer: ['b'],
              points: 1,
              explanation: 'The <nav> element represents a section of navigation links. It is a semantic HTML5 element.',
              order: 0,
            },
            {
              type: 'MULTIPLE_CHOICE',
              question: 'What is the CSS Box Model order from **inside to outside**?',
              options: [
                { id: 'a', text: 'Content → Margin → Border → Padding' },
                { id: 'b', text: 'Content → Border → Padding → Margin' },
                { id: 'c', text: 'Content → Padding → Border → Margin' },
                { id: 'd', text: 'Margin → Border → Padding → Content' },
              ],
              correctAnswer: ['c'],
              points: 1,
              explanation: 'The CSS Box Model order from inside to outside is: Content → Padding → Border → Margin.',
              order: 1,
            },
            {
              type: 'MULTIPLE_CHOICE',
              question: 'Which CSS property creates a **flex container**?',
              options: [
                { id: 'a', text: 'display: flex-box' },
                { id: 'b', text: 'display: flexbox' },
                { id: 'c', text: 'display: flex' },
                { id: 'd', text: 'flex: 1' },
              ],
              correctAnswer: ['c'],
              points: 1,
              explanation: '`display: flex` creates a flex container. The children become flex items.',
              order: 2,
            },
            {
              type: 'TRUE_FALSE',
              question: '`<div>` is a **semantic** HTML5 element.',
              options: [
                { id: 'true', text: 'True' },
                { id: 'false', text: 'False' },
              ],
              correctAnswer: ['false'],
              points: 1,
              explanation: '<div> is a generic container with no semantic meaning. Semantic elements include <header>, <nav>, <main>, <article>, <section>, <footer>.',
              order: 3,
            },
            {
              type: 'MULTIPLE_SELECT',
              question: 'Which of the following are **valid CSS Grid** properties? (Select all that apply)',
              options: [
                { id: 'a', text: 'grid-template-columns' },
                { id: 'b', text: 'grid-flex-direction' },
                { id: 'c', text: 'grid-template-areas' },
                { id: 'd', text: 'grid-gap' },
              ],
              correctAnswer: ['a', 'c', 'd'],
              points: 2,
              explanation: 'grid-template-columns, grid-template-areas, and grid-gap (or gap) are valid CSS Grid properties. grid-flex-direction does not exist.',
              order: 4,
            },
            {
              type: 'MULTIPLE_CHOICE',
              question: 'What does `position: sticky` do?',
              options: [
                { id: 'a', text: 'Element is fixed at the top of the page always' },
                { id: 'b', text: 'Element toggles between relative and fixed based on scroll position' },
                { id: 'c', text: 'Element is positioned relative to its parent' },
                { id: 'd', text: 'Element is removed from the document flow' },
              ],
              correctAnswer: ['b'],
              points: 1,
              explanation: '`position: sticky` is a hybrid of relative and fixed positioning. The element is treated as relative until it crosses a specified threshold, then it is treated as fixed.',
              order: 5,
            },
            {
              type: 'CODE',
              question: 'Write a CSS rule that makes a **responsive 3-column grid** that becomes 1 column on screens smaller than 768px.\n\nUse CSS Grid.',
              options: null,
              correctAnswer: ['.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}\n\n@media (max-width: 768px) {\n  .container {\n    grid-template-columns: 1fr;\n  }\n}'],
              points: 3,
              explanation: 'Use `grid-template-columns: repeat(3, 1fr)` for 3 equal columns and a media query to switch to 1 column on mobile.',
              order: 6,
            },
          ],
        },
      },
    });
    console.log(`  ✓ Quiz: "${quiz1.title}" (7 questions)`);

    // Quiz 2: JavaScript Essentials
    const quiz2 = await prisma.quiz.create({
      data: {
        courseId: courses[0].id,
        teacherId: feTeacher.id,
        title: 'JavaScript ES6+ Essentials',
        description: 'Covers arrow functions, destructuring, promises, async/await, modules, and modern JS patterns.',
        timeLimit: 20,
        maxAttempts: 3,
        passingScore: 60,
        isActive: true,
        isPublished: true,
        showResults: true,
        shuffleQuestions: false,
        questions: {
          create: [
            {
              type: 'MULTIPLE_CHOICE',
              question: 'What is the output of this code?\n\n```javascript\nconst arr = [1, 2, 3];\nconst [a, ...rest] = arr;\nconsole.log(rest);\n```',
              options: [
                { id: 'a', text: '[1, 2, 3]' },
                { id: 'b', text: '[2, 3]' },
                { id: 'c', text: '2' },
                { id: 'd', text: '[1]' },
              ],
              correctAnswer: ['b'],
              points: 1,
              explanation: 'The spread operator `...rest` collects the remaining elements after `a` (which is 1) into an array [2, 3].',
              order: 0,
            },
            {
              type: 'MULTIPLE_CHOICE',
              question: 'What does `Promise.all()` return when one promise **rejects**?',
              options: [
                { id: 'a', text: 'An array with null for the rejected promise' },
                { id: 'b', text: 'The first rejected promise\'s error' },
                { id: 'c', text: 'An array of all resolved values' },
                { id: 'd', text: 'undefined' },
              ],
              correctAnswer: ['b'],
              points: 1,
              explanation: 'Promise.all() rejects immediately when any of the input promises rejects, with the reason of the first rejected promise.',
              order: 1,
            },
            {
              type: 'TRUE_FALSE',
              question: '`const` in JavaScript means the variable\'s **value** cannot be changed.',
              options: [
                { id: 'true', text: 'True' },
                { id: 'false', text: 'False' },
              ],
              correctAnswer: ['false'],
              points: 1,
              explanation: '`const` prevents reassignment of the variable binding, but the value itself can be mutated (e.g., you can push to a const array or modify object properties).',
              order: 2,
            },
            {
              type: 'MULTIPLE_CHOICE',
              question: 'What is the difference between `==` and `===` in JavaScript?',
              options: [
                { id: 'a', text: 'No difference, they are the same' },
                { id: 'b', text: '== checks value only, === checks value and type' },
                { id: 'c', text: '=== checks value only, == checks value and type' },
                { id: 'd', text: '== is for numbers, === is for strings' },
              ],
              correctAnswer: ['b'],
              points: 1,
              explanation: '`==` (loose equality) performs type coercion before comparison. `===` (strict equality) checks both value and type without coercion.',
              order: 3,
            },
            {
              type: 'OPEN_ENDED',
              question: 'Explain the difference between **`let`**, **`const`**, and **`var`** in JavaScript. Include information about scoping, hoisting, and when to use each.',
              options: null,
              correctAnswer: ['let and const are block-scoped, var is function-scoped. const cannot be reassigned. var is hoisted and initialized as undefined, let/const are hoisted but not initialized (temporal dead zone). Use const by default, let when reassignment is needed, avoid var.'],
              points: 3,
              explanation: 'Key differences: scope (block vs function), hoisting behavior, and reassignment capability.',
              order: 4,
            },
            {
              type: 'CODE',
              question: 'Write an **async function** that fetches data from an API and handles errors.\n\nThe function should:\n1. Fetch from `https://api.example.com/data`\n2. Parse the JSON response\n3. Return the data\n4. Handle errors with try/catch',
              options: null,
              correctAnswer: ['async function fetchData() {\n  try {\n    const response = await fetch("https://api.example.com/data");\n    if (!response.ok) throw new Error("HTTP " + response.status);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error("Failed to fetch:", error);\n    throw error;\n  }\n}'],
              points: 3,
              explanation: 'Use async/await with try/catch for clean error handling. Always check response.ok for HTTP errors.',
              order: 5,
            },
          ],
        },
      },
    });
    console.log(`  ✓ Quiz: "${quiz2.title}" (6 questions)`);

    // Quiz 3: React Basics (Draft, not published)
    const quiz3 = await prisma.quiz.create({
      data: {
        courseId: courses[0].id,
        teacherId: feTeacher.id,
        title: 'React Hooks & State Management',
        description: 'Advanced quiz covering useState, useEffect, useContext, useReducer, custom hooks, and common patterns.',
        timeLimit: 25,
        maxAttempts: 1,
        passingScore: 75,
        isActive: true,
        isPublished: false, // DRAFT
        showResults: true,
        questions: {
          create: [
            {
              type: 'MULTIPLE_CHOICE',
              question: 'Which hook is used for **side effects** in React?',
              options: [
                { id: 'a', text: 'useState' },
                { id: 'b', text: 'useEffect' },
                { id: 'c', text: 'useContext' },
                { id: 'd', text: 'useMemo' },
              ],
              correctAnswer: ['b'],
              points: 1,
              order: 0,
            },
            {
              type: 'TRUE_FALSE',
              question: '`useEffect` with an **empty dependency array** `[]` runs on every re-render.',
              options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }],
              correctAnswer: ['false'],
              points: 1,
              explanation: 'An empty dependency array means the effect runs only once after the initial render (mount), similar to componentDidMount.',
              order: 1,
            },
          ],
        },
      },
    });
    console.log(`  ✓ Quiz: "${quiz3.title}" (2 questions, DRAFT)`);

    // Create quiz attempts for students
    for (const student of feStudents) {
      // Complete Quiz 1 for students
      const attempt1 = await prisma.quizAttempt.create({
        data: {
          quizId: quiz1.id,
          studentId: student.id,
          status: 'GRADED',
          score: 80,
          totalPoints: 8,
          maxPoints: 10,
          startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000),
          timeSpentSec: 720,
        },
      });

      // Get questions for Quiz 1
      const q1Questions = await prisma.quizQuestion.findMany({
        where: { quizId: quiz1.id },
        orderBy: { order: 'asc' },
      });

      // Create answers (mostly correct, one wrong)
      for (let i = 0; i < q1Questions.length; i++) {
        const q = q1Questions[i];
        if (q.type === 'CODE' || q.type === 'OPEN_ENDED') continue; // skip manual grading

        const correct = i !== 1; // Wrong on question 2
        const correctAns = q.correctAnswer as string[];
        const wrongAnswer = q.options ? [(q.options as any[]).find((o: any) => !correctAns.includes(o.id))?.id || 'a'] : ['wrong'];

        await prisma.quizAnswer.create({
          data: {
            attemptId: attempt1.id,
            questionId: q.id,
            answer: correct ? correctAns : wrongAnswer,
            isCorrect: correct,
            pointsEarned: correct ? q.points : 0,
          },
        });
      }

      // Also do code question with manual grade
      const codeQ = q1Questions.find(q => q.type === 'CODE');
      if (codeQ) {
        await prisma.quizAnswer.create({
          data: {
            attemptId: attempt1.id,
            questionId: codeQ.id,
            answer: ['.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}\n\n@media (max-width: 768px) {\n  .container {\n    grid-template-columns: 1fr;\n  }\n}'],
            isCorrect: true,
            pointsEarned: 3,
          },
        });
      }

      // Start Quiz 2 — COMPLETED but has open-ended ungraded
      const attempt2 = await prisma.quizAttempt.create({
        data: {
          quizId: quiz2.id,
          studentId: student.id,
          status: 'COMPLETED', // not GRADED because open-ended needs manual grading
          score: null,
          totalPoints: 4,
          maxPoints: 10,
          startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 18 * 60 * 1000),
          timeSpentSec: 1080,
        },
      });

      const q2Questions = await prisma.quizQuestion.findMany({
        where: { quizId: quiz2.id },
        orderBy: { order: 'asc' },
      });

      for (const q of q2Questions) {
        if (q.type === 'CODE') {
          await prisma.quizAnswer.create({
            data: {
              attemptId: attempt2.id,
              questionId: q.id,
              answer: ['async function fetchData() {\n  try {\n    const res = await fetch("https://api.example.com/data");\n    const data = await res.json();\n    return data;\n  } catch (err) {\n    console.error(err);\n  }\n}'],
              isCorrect: null, // needs manual grading
              pointsEarned: null,
            },
          });
        } else if (q.type === 'OPEN_ENDED') {
          await prisma.quizAnswer.create({
            data: {
              attemptId: attempt2.id,
              questionId: q.id,
              answer: ['let and const are block-scoped while var is function-scoped. const cannot be reassigned after declaration but the value can be mutated. var gets hoisted and initialized as undefined, while let and const have temporal dead zone. Best practice: use const by default, let when you need to reassign.'],
              isCorrect: null, // needs manual grading
              pointsEarned: null,
            },
          });
        } else {
          const correctAns = q.correctAnswer as string[];
          await prisma.quizAnswer.create({
            data: {
              attemptId: attempt2.id,
              questionId: q.id,
              answer: correctAns,
              isCorrect: true,
              pointsEarned: q.points,
            },
          });
        }
      }
    }
    console.log(`  ✓ Created quiz attempts for Frontend students`);
  }

  // ---- QA Course Quiz ----
  if (courses[1] && qaTeacher) {
    const qaQuiz = await prisma.quiz.create({
      data: {
        courseId: courses[1].id,
        teacherId: qaTeacher.id,
        title: 'Software Testing Fundamentals',
        description: 'Test your knowledge of QA concepts, testing types, SDLC, and bug lifecycle.',
        timeLimit: 10,
        maxAttempts: 2,
        passingScore: 70,
        isActive: true,
        isPublished: true,
        showResults: true,
        questions: {
          create: [
            {
              type: 'MULTIPLE_CHOICE',
              question: 'Which testing type checks if the system meets **business requirements**?',
              options: [
                { id: 'a', text: 'Unit Testing' },
                { id: 'b', text: 'Integration Testing' },
                { id: 'c', text: 'Acceptance Testing' },
                { id: 'd', text: 'Regression Testing' },
              ],
              correctAnswer: ['c'],
              points: 1,
              explanation: 'Acceptance Testing (UAT) verifies the system meets business requirements and is ready for delivery.',
              order: 0,
            },
            {
              type: 'MULTIPLE_SELECT',
              question: 'Which are types of **non-functional testing**? (Select all that apply)',
              options: [
                { id: 'a', text: 'Performance Testing' },
                { id: 'b', text: 'Unit Testing' },
                { id: 'c', text: 'Security Testing' },
                { id: 'd', text: 'Usability Testing' },
              ],
              correctAnswer: ['a', 'c', 'd'],
              points: 2,
              explanation: 'Performance, Security, and Usability are non-functional testing types. Unit Testing is a functional test type.',
              order: 1,
            },
            {
              type: 'TRUE_FALSE',
              question: '**Regression testing** is performed after every code change to ensure existing functionality still works.',
              options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }],
              correctAnswer: ['true'],
              points: 1,
              order: 2,
            },
            {
              type: 'MULTIPLE_CHOICE',
              question: 'What is the correct **bug lifecycle** order?',
              options: [
                { id: 'a', text: 'New → Open → Fixed → Verified → Closed' },
                { id: 'b', text: 'Open → New → Fixed → Closed → Verified' },
                { id: 'c', text: 'New → Fixed → Open → Verified → Closed' },
                { id: 'd', text: 'New → Open → Verified → Fixed → Closed' },
              ],
              correctAnswer: ['a'],
              points: 1,
              explanation: 'The standard bug lifecycle: New → Open (assigned) → Fixed (by developer) → Verified (by QA) → Closed.',
              order: 3,
            },
            {
              type: 'OPEN_ENDED',
              question: 'Explain the difference between **Smoke Testing** and **Sanity Testing**. When would you use each?',
              options: null,
              correctAnswer: ['Smoke testing checks core functionality after a new build to decide if it is stable enough for detailed testing. Sanity testing checks specific functionality after bug fixes or changes. Smoke = broad, shallow. Sanity = narrow, deep.'],
              points: 3,
              order: 4,
            },
          ],
        },
      },
    });
    console.log(`  ✓ Quiz: "${qaQuiz.title}" (5 questions)`);
  }

  // ---- AI/ML Course Quiz ----
  if (courses[2] && aiTeacher) {
    const aiQuiz = await prisma.quiz.create({
      data: {
        courseId: courses[2].id,
        teacherId: aiTeacher.id,
        title: 'Machine Learning Basics',
        description: 'Covers supervised/unsupervised learning, model evaluation, overfitting, and key algorithms.',
        timeLimit: 15,
        maxAttempts: 2,
        passingScore: 65,
        isActive: true,
        isPublished: true,
        showResults: true,
        shuffleQuestions: true,
        questions: {
          create: [
            {
              type: 'MULTIPLE_CHOICE',
              question: 'Which of the following is a **supervised learning** algorithm?',
              options: [
                { id: 'a', text: 'K-Means Clustering' },
                { id: 'b', text: 'Linear Regression' },
                { id: 'c', text: 'PCA (Principal Component Analysis)' },
                { id: 'd', text: 'DBSCAN' },
              ],
              correctAnswer: ['b'],
              points: 1,
              explanation: 'Linear Regression is a supervised learning algorithm that predicts continuous values using labeled data.',
              order: 0,
            },
            {
              type: 'MULTIPLE_CHOICE',
              question: 'What is **overfitting**?',
              options: [
                { id: 'a', text: 'Model performs well on training data but poorly on unseen data' },
                { id: 'b', text: 'Model performs poorly on both training and test data' },
                { id: 'c', text: 'Model takes too long to train' },
                { id: 'd', text: 'Model has too few features' },
              ],
              correctAnswer: ['a'],
              points: 1,
              explanation: 'Overfitting means the model memorizes the training data (including noise) and fails to generalize to new data.',
              order: 1,
            },
            {
              type: 'TRUE_FALSE',
              question: '**Accuracy** is always the best metric for evaluating classification models.',
              options: [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }],
              correctAnswer: ['false'],
              points: 1,
              explanation: 'Accuracy can be misleading with imbalanced datasets. Precision, recall, F1-score, and AUC-ROC are often more appropriate.',
              order: 2,
            },
            {
              type: 'MULTIPLE_SELECT',
              question: 'Which techniques help prevent **overfitting**? (Select all that apply)',
              options: [
                { id: 'a', text: 'Regularization (L1/L2)' },
                { id: 'b', text: 'Cross-validation' },
                { id: 'c', text: 'Adding more features' },
                { id: 'd', text: 'Dropout (in neural networks)' },
              ],
              correctAnswer: ['a', 'b', 'd'],
              points: 2,
              explanation: 'Regularization, cross-validation, and dropout all help prevent overfitting. Adding more features without constraints can actually increase overfitting.',
              order: 3,
            },
            {
              type: 'CODE',
              question: 'Write Python code to split data into **train/test sets** and train a **Decision Tree** classifier using sklearn.\n\n```python\n# You have X (features) and y (labels)\n# Split 80/20, random_state=42\n# Train and print accuracy\n```',
              options: null,
              correctAnswer: ['from sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.metrics import accuracy_score\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\nmodel = DecisionTreeClassifier()\nmodel.fit(X_train, y_train)\n\ny_pred = model.predict(X_test)\nprint(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")'],
              points: 3,
              order: 4,
            },
          ],
        },
      },
    });
    console.log(`  ✓ Quiz: "${aiQuiz.title}" (5 questions)`);
  }

  // =============================================
  // NOTIFICATIONS
  // =============================================
  console.log('\n🔔 Creating notifications...');

  // Create sample notifications for all students
  for (const course of courses) {
    const studentsInCourse = course.students?.map((s: any) => s.student) || [];
    const teacher = course.teachers[0]?.teacher;

    for (const student of studentsInCourse) {
      await prisma.notification.createMany({
        data: [
          {
            userId: student.id,
            userType: 'student',
            type: 'NEW_ASSIGNMENT',
            title: 'New Assignment',
            message: `New assignment posted in "${course.titleEn}"`,
            link: `/lms/student/courses/${course.id}/assignments`,
            isRead: true,
          },
          {
            userId: student.id,
            userType: 'student',
            type: 'NEW_QUIZ',
            title: 'New Quiz Available',
            message: `A new quiz is available in "${course.titleEn}". Test your knowledge!`,
            link: `/lms/student/courses/${course.id}/quizzes`,
            isRead: false,
          },
          {
            userId: student.id,
            userType: 'student',
            type: 'ASSIGNMENT_GRADED',
            title: 'Assignment Graded',
            message: `Your assignment in "${course.titleEn}" has been graded. Check your results!`,
            link: `/lms/student/courses/${course.id}/assignments`,
            isRead: false,
          },
        ],
      });
    }

    // Notifications for teacher
    if (teacher) {
      await prisma.notification.createMany({
        data: [
          {
            userId: teacher.id,
            userType: 'teacher',
            type: 'NEW_ASSIGNMENT' as any,
            title: 'New Submission',
            message: `A student submitted an assignment in "${course.titleEn}"`,
            link: `/lms/teacher/courses/${course.id}/assignments`,
            isRead: false,
          },
          {
            userId: teacher.id,
            userType: 'teacher',
            type: 'NEW_QUIZ' as any,
            title: 'Quiz Needs Grading',
            message: `A student completed a quiz in "${course.titleEn}" — has open-ended answers to grade`,
            link: `/lms/teacher/courses/${course.id}/quizzes`,
            isRead: false,
          },
        ],
      });
    }
  }
  console.log('  ✓ Created notifications for all users');

  // =============================================
  // SUMMARY
  // =============================================
  const assignmentCount = await prisma.assignment.count();
  const submissionCount = await prisma.assignmentSubmission.count();
  const quizCount = await prisma.quiz.count();
  const questionCount = await prisma.quizQuestion.count();
  const attemptCount = await prisma.quizAttempt.count();
  const notificationCount = await prisma.notification.count();

  console.log('\n' + '='.repeat(50));
  console.log('✅ Seed complete!\n');
  console.log(`  📝 Assignments: ${assignmentCount}`);
  console.log(`  📤 Submissions: ${submissionCount}`);
  console.log(`  🧪 Quizzes: ${quizCount}`);
  console.log(`  ❓ Questions: ${questionCount}`);
  console.log(`  📊 Attempts: ${attemptCount}`);
  console.log(`  🔔 Notifications: ${notificationCount}`);
  console.log('\n' + '='.repeat(50));

  console.log('\n📋 Test Accounts:');
  console.log('  Teacher: eldar@futureup.az / teacher123 (Frontend Dev)');
  console.log('  Teacher: aynur@futureup.az / teacher123 (QA)');
  console.log('  Teacher: rashad@futureup.az / teacher123 (AI/ML)');
  console.log('  Student: (any enrolled student) / student123');
  console.log('  Admin: admin@futureup.az / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
