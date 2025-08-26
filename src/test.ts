export async function parseSyllabus() {
  const _data = {
    code: "SOCI 235",
    title: "Sociology 235: Technology & Society",
    professor: "Prof. Skyler Wang",
    semester: "Winter",
    year: 2025,
    credits: 0,
    classTimes: [
      {
        day: "Monday",
        start: "08:35:00.000-04:00",
        end: "09:55:00.000-04:00",
      },
      {
        day: "Wednesday",
        start: "08:35:00.000-04:00",
        end: "09:55:00.000-04:00",
      },
    ],
    targetGrade: 85,
    tasks: [
      {
        name: "Midterm exam",
        dueDate: "0226-02-26",
        weight: 30,
        desc: "The in-class midterm exam will consist of four short essay questions covering content from the first half of the course. Exam day: Feb 26 (Wed) in class.",
      },
      {
        name: "Tech critique memo",
        dueDate: "2025-03-14",
        weight: 20,
        desc: "Three-page critique of a chosen digital platform after at least three days of use; incorporate course readings and make evidence-based design/interface suggestions. Due Mar 14 (Friday) by 11:59 PM.",
      },
      {
        name: "Final research paper",
        dueDate: "2025-04-18",
        weight: 40,
        desc: "Empirical research paper (5–7 pages) requiring primary data collection (content analysis, surveys, interviews, or ethnography). Due Apr 18 (Fri) by 11:59 PM.",
      },
      {
        name: "Exit tickets",
        dueDate: "0000-01-01",
        weight: 10,
        desc: "Quick 5-minute quiz on MyCourses at the end of class. Each exit ticket is worth 5%; complete two to get full 10%. Dates are random (admin runs them three times each semester).",
      },
    ],
    clerkId: "user_31bpzQbHe9yDHOw0CjbeLhCxbYc",
  };

  console.log(btoa(new TextEncoder().encode("–").join("")));
}

parseSyllabus();
