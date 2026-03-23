const fs = require('fs');
const path = require('path');

const qs = {
  os: [
    { text: 'Consider a paging system with the page table stored in memory. If a memory reference takes 50ns, how long does a paged memory reference take assuming no TLB?', options: ['50ns', '100ns', '150ns', '200ns'], correct: 1, subject: 'OS', topic: 'Memory Management', difficulty: 'Medium', type: 'MCQ', source: 'GATE 2004', tags: ['paging', 'memory-access'] },
    { text: 'Which of the following is NOT true about kernel-level threads compared to user-level threads?', options: ['Kernel threads are slower to switch', 'If one kernel thread blocks, others can continue', 'They require hardware support', 'They are managed by the OS'], correct: 2, subject: 'OS', topic: 'Threads & Concurrency', difficulty: 'Medium', type: 'MCQ', source: 'Amazon Interview', tags: ['threads', 'kernel'] },
    { text: 'In a system with 3 processes sharing 4 resource instances of the same type, what is the maximum resource need of each process that guarantees deadlock-free operation?', options: ['1', '2', '3', '4'], correct: 1, subject: 'OS', topic: 'Deadlocks', difficulty: 'Hard', type: 'MCQ', source: 'GATE 2011', tags: ['deadlock'] },
    { text: 'The time taken to switch between user mode and kernel mode is known as:', options: ['Context Switch Time', 'Mode Switch Time', 'Turnaround Time', 'Dispatch Latency'], correct: 1, subject: 'OS', topic: 'Process Management', difficulty: 'Easy', type: 'MCQ', source: 'Microsoft Interview', tags: ['mode-switch'] },
    { text: 'Which of the following disk scheduling algorithms is primarily designed to prevent starvation?', options: ['SSTF', 'SCAN', 'LOOK', 'FCFS'], correct: 3, subject: 'OS', topic: 'Storage & File Systems', difficulty: 'Medium', type: 'MCQ', source: 'GATE 2013', tags: ['disk-scheduling'] },
    { text: 'A system uses FIFO policy for page replacement. It has 4 page frames with no pages loaded to begin with. The system first accesses 100 distinct pages in some order and then accesses the same 100 pages but now in the reverse order. How many page faults will occur?', options: ['192', '196', '195', '200'], correct: 1, subject: 'OS', topic: 'Memory Management', difficulty: 'Hard', type: 'MCQ', source: 'GATE 2010', tags: ['page-replacement', 'fifo'] },
    { text: 'Which synchronization tool is typically implemented using atomic hardware instructions like TestAndSet or CompareAndSwap?', options: ['Monitors', 'Semaphores', 'Mutxes / Spinlocks', 'Condition Variables'], correct: 2, subject: 'OS', topic: 'Synchronization', difficulty: 'Medium', type: 'MCQ', source: 'Google Interview', tags: ['locks', 'hardware'] }
  ],
  dbms: [
    { text: 'Given relation R(A, B, C, D) with functional dependencies {A -> B, B -> C, C -> D}. What is the highest normal form of R?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: 1, subject: 'DBMS', topic: 'Normalization', difficulty: 'Hard', type: 'MCQ', source: 'GATE 2015', tags: ['normalization'] },
    { text: 'Which isolation level prevents Dirty Reads but allows Non-Repeatable Reads?', options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'], correct: 1, subject: 'DBMS', topic: 'Transactions & ACID', difficulty: 'Medium', type: 'MCQ', source: 'Netflix Interview', tags: ['isolation'] },
    { text: 'In an Extendible Hashing scheme, if the global depth is 3, what is the maximum number of directory entries?', options: ['3', '4', '8', '16'], correct: 2, subject: 'DBMS', topic: 'Indexing & B-Trees', difficulty: 'Medium', type: 'MCQ', source: 'GATE 2008', tags: ['hashing'] },
    { text: 'What is the primary mechanism used by write-ahead logging (WAL) for crash recovery?', options: ['Data pages are written to disk before log records', 'Log records are written to disk before data pages', 'Both are written simultaneously', 'Only log records are written'], correct: 1, subject: 'DBMS', topic: 'Crash Recovery Systems', difficulty: 'Hard', type: 'MCQ', source: 'Google Interview', tags: ['wal', 'recovery'] },
    { text: 'Cassandra and DynamoDB are examples of which type of NoSQL database?', options: ['Document', 'Key-Value', 'Wide-Column', 'Graph'], correct: 2, subject: 'DBMS', topic: 'NoSQL Databases', difficulty: 'Easy', type: 'MCQ', source: 'Amazon Review', tags: ['nosql', 'column-family'] },
    { text: 'Consider the following schedule for transactions T1, T2 and T3: r1(X); r2(Z); r1(Z); r3(X); r3(Y); w1(X); c1; w3(Y); c3; r2(Y); w2(Z); w2(Y); c2; Which of the following is true?', options: ['Schedule is conflict serializable', 'Schedule is view serializable but not conflict serializable', 'Schedule is not serializable', 'None'], correct: 2, subject: 'DBMS', topic: 'Transactions & ACID', difficulty: 'Hard', type: 'MCQ', source: 'GATE 2017', tags: ['serializability'] }
  ],
  cn: [
    { text: 'In TCP congestion control, what happens when a timeout occurs?', options: ['Window size is halved', 'Window size is set to 1 MSS', 'Fast recovery is initiated', 'Retransmission timer doubles'], correct: 1, subject: 'CN', topic: 'TCP vs UDP', difficulty: 'Medium', type: 'MCQ', source: 'GATE 2016', tags: ['tcp', 'congestion'] },
    { text: 'What is the maximum payload size of a standard Ethernet frame?', options: ['1500 bytes', '1518 bytes', '65535 bytes', '1024 bytes'], correct: 0, subject: 'CN', topic: 'Data Link Layer & MAC', difficulty: 'Easy', type: 'MCQ', source: 'Cisco Interview', tags: ['ethernet'] },
    { text: 'In the IPv4 header, what is the purpose of the TTL (Time to Live) field?', options: ['To measure latency', 'To prevent routing loops', 'To specify packet priority', 'To ensure packet durability'], correct: 1, subject: 'CN', topic: 'Routing Algorithms', difficulty: 'Medium', type: 'MCQ', source: 'GATE 2012', tags: ['ipv4', 'ttl'] },
    { text: 'Which DNS record type maps a domain name to an IPv6 address?', options: ['A Record', 'CNAME Record', 'MX Record', 'AAAA Record'], correct: 3, subject: 'CN', topic: 'DNS & HTTP', difficulty: 'Easy', type: 'MCQ', source: 'Cloudflare Interview', tags: ['dns', 'ipv6'] },
    { text: 'BGP (Border Gateway Protocol) is an example of which type of routing protocol?', options: ['Distance Vector', 'Link State', 'Path Vector', 'Hybrid'], correct: 2, subject: 'CN', topic: 'Routing Algorithms', difficulty: 'Hard', type: 'MCQ', source: 'GATE 2006', tags: ['bgp'] },
    { text: 'In the CSMA/CD protocol, what does a station do immediately after detecting a collision?', options: ['Retransmits the frame', 'Stops transmitting and waits for a random time', 'Transmits a jam signal', 'Aborts the transmission permanently'], correct: 2, subject: 'CN', topic: 'Data Link Layer & MAC', difficulty: 'Medium', type: 'MCQ', source: 'GATE 2021', tags: ['csma', 'mac'] }
  ],
  oops: [
    { text: 'Which SOLID principle is violated when a subclass throws an exception for a method defined in its base class?', options: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Interface Segregation'], correct: 2, subject: 'OOPS', topic: 'SOLID Principles', difficulty: 'Hard', type: 'MCQ', source: 'Microsoft Interview', tags: ['liskov', 'solid'] },
    { text: 'In Java, what is the impact of catching an Error (like OutOfMemoryError)?', options: ['It is recommended practice', 'It allows the application to recover safely', 'It is heavily discouraged as the JVM state might be unstable', 'It is a compile-time error'], correct: 2, subject: 'OOPS', topic: 'Exception Handling', difficulty: 'Medium', type: 'MCQ', source: 'Oracle Interview', tags: ['exceptions'] },
    { text: 'What is the purpose of the Protected access modifier?', options: ['Visible only to the same class', 'Visible to classes in the same package and subclasses', 'Visible to everyone', 'Visible only to subclasses regardless of package'], correct: 1, subject: 'OOPS', topic: 'OOP Pillars', difficulty: 'Easy', type: 'MCQ', source: 'Infosys Interview', tags: ['access-modifiers'] },
    { text: 'In C++, virtual destructors are required when:', options: ['You want to construct a derived object', 'You delete a derived class object through a base class pointer', 'You overload the delete operator', 'You use multiple inheritance'], correct: 1, subject: 'OOPS', topic: 'Memory Management in OOP', difficulty: 'Hard', type: 'MCQ', source: 'GATE 2020', tags: ['cpp', 'virtual'] },
    { text: 'Which design pattern is used to add new functionality to an existing object without altering its structure?', options: ['Adapter', 'Bridge', 'Decorator', 'Facade'], correct: 2, subject: 'OOPS', topic: 'Design Patterns', difficulty: 'Medium', type: 'MCQ', source: 'Adobe Interview', tags: ['decorator', 'patterns'] },
    { text: 'Which of the following describes the difference between an abstract class and an interface in Java 8+?', options: ['Interfaces cannot have static variables', 'Abstract classes cannot have default methods', 'A class can implement multiple interfaces but extend only one abstract class', 'Interfaces can maintain state variables'], correct: 2, subject: 'OOPS', topic: 'Abstraction vs Interfaces', difficulty: 'Medium', type: 'MCQ', source: 'IBM Interview', tags: ['abstract', 'interface'] }
  ]
};

const questionsDir = path.join(__dirname, 'data', 'questions');

for (const [subject, newQs] of Object.entries(qs)) {
  const filePath = path.join(questionsDir, `${subject}.json`);
  if (fs.existsSync(filePath)) {
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // prevent duplicates natively
    const combined = [...existing];
    for(const nq of newQs) {
        if(!existing.find(eq => eq.text === nq.text)) {
            combined.push(nq);
        }
    }
    fs.writeFileSync(filePath, JSON.stringify(combined, null, 2));
    console.log(`✅ Appended ${combined.length - existing.length} new questions to ${subject}.json`);
  }
}
