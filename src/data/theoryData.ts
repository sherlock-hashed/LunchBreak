/**
 * Theory Hub — Static article content for all 20 CS topics
 * Covers OS, DBMS, CN, OOPs — focused on SDE/SWE placement & internship prep
 */

export interface Article {
  title: string;
  subject: string;
  readTime: string;
  content: string[];
  interviewTips: string[];
  commonQuestions: string[];
  companies: string[];
}

export const articleContent: Record<string, Article> = {

  // ══════════════════════════════════════════════════════
  // OPERATING SYSTEMS
  // ══════════════════════════════════════════════════════

  process: {
    title: "Process Management Deep Dive",
    subject: "Operating Systems",
    readTime: "15 min",
    content: [
      "A process is a program in execution. It includes the program counter, registers, stack, and data section. Understanding processes is fundamental to understanding how operating systems work.",
      "## Process States & Transitions\n\nA process transitions through several states during its lifetime. Understanding the exact triggers for these transitions is critical:\n\n1. **New**: Process is being created, PCB is allocated.\n2. **Ready**: Process is in the ready queue, waiting to be assigned to a processor by the short-term scheduler.\n3. **Running**: Instructions are being executed on the CPU.\n4. **Waiting (Blocked)**: Process is waiting for an I/O or event. It is moved to a wait queue to free up the CPU.\n5. **Terminated**: Process has finished execution. The OS reclaims its memory and resources, except for its exit status which is kept until the parent calls `wait()`.",
      "## Process Control Block (PCB)\n\nEach process is represented in the OS by a PCB (Task Control Block in Linux), a massive C structure containing:\n\n- **Process State**: Current state (ready, running, etc.).\n- **Program Counter**: Memory address of the next instruction.\n- **CPU Registers**: Accumulated state for context switching.\n- **Memory Management Info**: Page tables, segmentation tables, limits.\n- **I/O Status**: File descriptors (UNIX), open files list.\n- **Accounting Info**: CPU time used, time limits, process IDs.",
      "## Context Switching Mechanics\n\nWhen the CPU switches from one process to another, the OS must save the state of the old process into its PCB and load the saved state of the new process from its PCB.\n\n- **Overhead**: Context switches are pure overhead — no useful work is done. It invalidates caches (TLB flushes).\n- **Typical time**: 1-10 microseconds on modern hardware.\n- **Triggered by**: Timer interrupt (quantum expired), I/O interrupt, or blocking system calls.",
      "## Process Creation (Fork/Exec)\n\nProcesses are created using the **fork()** system call (Unix) which creates an exact clone (child). The child gets a copy of the parent's address space using Copy-on-Write (CoW) for efficiency.\n\n- **fork()** returns `0` to the child, and the non-zero PID of the child to the parent.\n- **exec()** completely replaces the process memory space with a new program binary.\n- **wait()** allows the parent to sleep until the child terminates, reaping its exit status and preventing Zombies.",
      "## Zombies and Orphans\n\n- **Zombie**: A process that has terminated, but its parent hasn't called `wait()` yet. Its PCB remains in the process table taking up a slot.\n- **Orphan**: A process whose parent has terminated or crashed. In Linux, an orphan is adopted by the `init` (or `systemd`) process (PID 1), which periodically calls `wait()` to reap them.",
      "## Inter-Process Communication (IPC)\n\nProcesses need to safely communicate across isolated memory boundaries:\n\n- **Shared Memory**: A region of memory mapped into two processes' address spaces. Fastest mechanism, but requires strict synchronization (mutexes, semaphores).\n- **Message Passing**: Processes communicate via OS-mediated send/receive queues. Slower due to kernel involvement but much easier to use.\n- **Pipes**: Unidirectional communication channel (e.g., `ls | grep`). Standard pipes are anonymous; Named Pipes (FIFOs) persist on the filesystem.\n- **Sockets**: Bidirectional communication across network boundaries or locally (Unix Domain Sockets)."
    ],
    interviewTips: [
      "Process state transitions are incredibly important. Know exactly what happens when an I/O interrupt occurs (Running -> Ready, not Waiting).",
      "Be ready to trace a C program with multiple fork() calls. Formula: N fork() calls = 2^N total processes.",
      "Context switch overhead is a common follow-up — mention TLB flushes and Cache invalidation to stand out.",
      "Be prepared to define Zombie and Orphan processes clearly and how the OS handles them."
    ],
    commonQuestions: [
      "What is the difference between a process and a program?",
      "Explain the exact mechanics of a Context Switch.",
      "How does copy-on-write (CoW) optimize the fork() system call?",
      "Compare shared memory vs message passing for IPC. Which is faster and why?",
      "What is a zombie process? How do you prevent it?"
    ],
    companies: ["Google", "Amazon", "Microsoft", "Samsung", "Oracle", "VMware", "Apple"]
  },

  deadlock: {
    title: "Deadlocks",
    subject: "Operating Systems",
    readTime: "8 min",
    content: [
      "A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.",
      "## Conditions for Deadlock (Coffman Conditions)\n\nAll four conditions must hold simultaneously:\n\n1. **Mutual Exclusion**: At least one resource must be non-sharable.\n2. **Hold and Wait**: A process holding at least one resource is waiting to acquire additional resources.\n3. **No Preemption**: Resources cannot be forcibly taken from a process.\n4. **Circular Wait**: A circular chain of processes exists where each is waiting for a resource held by the next.",
      "## Deadlock Prevention\n\nWe can prevent deadlock by ensuring at least one of the Coffman conditions cannot hold:\n\n- **Eliminate Mutual Exclusion**: Use sharable resources (e.g., read-only files).\n- **Eliminate Hold and Wait**: Require processes to request all resources at once.\n- **Allow Preemption**: If a process can't get a resource, release all held resources.\n- **Eliminate Circular Wait**: Impose a total ordering on resource types.",
      "## Deadlock Avoidance (Banker's Algorithm)\n\nThe Banker's Algorithm checks if a state is safe before allocating resources. A state is safe if there exists a sequence in which all processes can finish. Time Complexity: O(n²m) where n = processes, m = resource types.",
      "## Deadlock Detection\n\nUse a wait-for graph. If the graph has a cycle, deadlock exists. For single-instance resources, cycle detection is sufficient. For multiple instances, use a detection algorithm similar to Banker's.",
      "## Deadlock Recovery\n\nAfter detection, the OS can:\n\n- **Process Termination**: Abort all deadlocked processes, or abort one at a time.\n- **Resource Preemption**: Forcibly take resources from some processes.\n- **Rollback**: Roll back processes to a previous safe state using checkpoints.",
    ],
    interviewTips: [
      "Always mention all 4 Coffman conditions — interviewers test if you know all four.",
      "Be ready to trace through Banker's Algorithm with a small example.",
      "Know the difference between prevention, avoidance, and detection.",
      "Real-world example: Dining Philosophers Problem.",
    ],
    commonQuestions: [
      "What are the necessary conditions for deadlock?",
      "Explain Banker's Algorithm with an example.",
      "Difference between deadlock prevention and avoidance?",
      "How does the OS detect deadlocks?",
      "What is starvation vs deadlock?",
    ],
    companies: ["Google", "Amazon", "Microsoft", "Goldman Sachs", "Flipkart"],
  },

  memory: {
    title: "Memory Management",
    subject: "Operating Systems",
    readTime: "12 min",
    content: [
      "Memory management is the function of an OS that handles primary memory. It tracks every memory location, allocates memory to processes, and deallocates when no longer needed.",
      "## Contiguous Memory Allocation\n\nMemory is divided into partitions for each process:\n\n- **Fixed Partition**: Memory divided into fixed-size blocks. Simple but causes internal fragmentation.\n- **Variable Partition**: Blocks are created dynamically. Eliminates internal fragmentation but causes external fragmentation.\n- **Allocation Strategies**: First Fit (fast), Best Fit (smallest sufficient hole), Worst Fit (largest hole).",
      "## Paging\n\nPhysical memory is divided into fixed-size frames, and logical memory into pages of the same size.\n\n- **Page Table**: Maps logical pages to physical frames.\n- **No external fragmentation** — only internal fragmentation on the last page.\n- **Page size**: Typically 4KB.\n- **Translation Lookaside Buffer (TLB)**: Hardware cache for page table entries. TLB hit = fast; TLB miss = slow page table walk.",
      "## Virtual Memory\n\nAllows execution of processes not completely in memory:\n\n- **Demand Paging**: Pages loaded only when needed (lazy loading).\n- **Page Fault**: When accessed page is not in memory — OS loads from disk.\n- **Thrashing**: When a process spends more time paging than executing. Occurs when working set exceeds available frames.\n- **Working Set Model**: The set of pages a process is actively using.",
      "## Page Replacement Algorithms\n\nWhen a page fault occurs and no free frame exists:\n\n1. **FIFO**: Replace the oldest page. Simple but suffers Belady's anomaly.\n2. **LRU (Least Recently Used)**: Replace the page not used for longest time. Optimal in practice.\n3. **Optimal (OPT)**: Replace the page not needed for longest future time. Theoretical benchmark, not implementable.\n4. **Clock (Second Chance)**: FIFO with a reference bit. Practical approximation of LRU.",
      "## Segmentation\n\nDivides memory into variable-size segments based on logical divisions (code, stack, heap). Each segment has a base and limit. Can be combined with paging (segmented paging).",
    ],
    interviewTips: [
      "Be able to solve page replacement problems (FIFO, LRU, OPT) with examples.",
      "Know the difference between internal and external fragmentation.",
      "Thrashing is a favorite topic — explain the cause and solution (working set model).",
      "Understand TLB and effective memory access time calculations.",
    ],
    commonQuestions: [
      "What is the difference between paging and segmentation?",
      "Explain demand paging and page faults.",
      "Compare FIFO, LRU, and Optimal page replacement algorithms.",
      "What is thrashing? How can it be prevented?",
      "What is a TLB and how does it improve performance?",
      "Calculate effective memory access time with TLB hit ratio.",
    ],
    companies: ["Google", "Microsoft", "Apple", "Intel", "Qualcomm", "Samsung"],
  },

  scheduling: {
    title: "CPU Scheduling",
    subject: "Operating Systems",
    readTime: "9 min",
    content: [
      "CPU scheduling determines which process runs on the CPU at any given time. The goal is to maximize CPU utilization, throughput, and minimize waiting time, turnaround time, and response time.",
      "## Scheduling Criteria\n\n- **CPU Utilization**: Keep CPU as busy as possible (ideally 40-90%).\n- **Throughput**: Number of processes completed per unit time.\n- **Turnaround Time**: Total time from submission to completion.\n- **Waiting Time**: Time spent in the ready queue.\n- **Response Time**: Time from submission to first response (important for interactive systems).",
      "## Non-Preemptive Algorithms\n\n1. **FCFS (First Come, First Served)**: Simplest. Large average waiting time due to convoy effect.\n2. **SJF (Shortest Job First)**: Optimal for minimum average waiting time. But requires knowing burst time in advance (use exponential averaging to predict).\n3. **Priority Scheduling**: Each process has a priority. Risk of starvation — solution: aging.",
      "## Preemptive Algorithms\n\n1. **SRTF (Shortest Remaining Time First)**: Preemptive version of SJF. Optimal but has overhead.\n2. **Round Robin (RR)**: Each process gets a fixed time quantum (usually 10-100ms). Good response time for interactive systems. Performance depends on quantum size:\n- **Large quantum**: Degenerates to FCFS.\n- **Small quantum**: High context switch overhead.\n3. **Priority Preemptive**: Higher-priority process preempts current.",
      "## Multilevel Queue Scheduling\n\nReady queue is partitioned into separate queues (foreground/background). Each queue has its own scheduling algorithm. Inter-queue scheduling: Fixed priority or time-slice.\n\n**Multilevel Feedback Queue**: Processes can move between queues based on behavior (CPU-bound moves down, I/O-bound moves up).",
      "## Real-time Scheduling\n\n- **Hard Real-time**: Must meet deadlines absolutely (e.g., pacemakers).\n- **Soft Real-time**: Missing deadlines is tolerable (e.g., video streaming).\n- **Rate Monotonic**: Static priority based on period.\n- **Earliest Deadline First (EDF)**: Dynamic priority based on deadline.",
    ],
    interviewTips: [
      "Be able to solve Gantt chart problems for FCFS, SJF, SRTF, RR, Priority.",
      "Calculate average waiting time and turnaround time for each algorithm.",
      "Know the trade-offs of Round Robin quantum size.",
      "Understand the convoy effect in FCFS and starvation in Priority scheduling.",
    ],
    commonQuestions: [
      "Compare FCFS, SJF, and Round Robin with examples.",
      "What is the convoy effect?",
      "How does aging solve starvation in priority scheduling?",
      "What is the optimal time quantum for Round Robin?",
      "Explain Multilevel Feedback Queue scheduling.",
    ],
    companies: ["Amazon", "Microsoft", "Google", "Flipkart", "Uber", "Oracle"],
  },

  sync: {
    title: "Synchronization",
    subject: "Operating Systems",
    readTime: "10 min",
    content: [
      "Process synchronization ensures that concurrent processes or threads access shared data in a controlled manner to prevent race conditions and data inconsistency.",
      "## Critical Section Problem\n\nThe critical section is a code segment where shared resources are accessed. A solution must satisfy:\n\n1. **Mutual Exclusion**: Only one process in the critical section at a time.\n2. **Progress**: If no process is in the critical section, some waiting process must be able to enter.\n3. **Bounded Waiting**: A bound on how many times other processes enter before a waiting process.",
      "## Synchronization Mechanisms\n\n- **Mutex (Mutual Exclusion Lock)**: Binary lock. Only the thread that locked it can unlock it.\n- **Semaphore**: Integer variable accessed through `wait()` (P) and `signal()` (V) operations.\n  - **Binary Semaphore**: Value is 0 or 1 (similar to mutex).\n  - **Counting Semaphore**: Value can be any non-negative integer.\n- **Monitor**: High-level construct that encapsulates shared data with procedures. Only one thread can be active inside at a time.",
      "## Classic Synchronization Problems\n\n1. **Producer-Consumer**: Producer adds items to buffer, consumer removes. Use mutex + two semaphores (empty, full).\n2. **Readers-Writers**: Multiple readers can read simultaneously, but writers need exclusive access. Variants: reader-priority or writer-priority.\n3. **Dining Philosophers**: Five philosophers sharing chopsticks. Solutions: limit simultaneous eaters, asymmetric pickup order.",
      "## Peterson's Solution\n\nSoftware-based solution for 2 processes. Uses two shared variables: `turn` and `flag[]`. Satisfies all three conditions of the critical section problem. Not practical on modern hardware due to instruction reordering.",
      "## Hardware Support\n\n- **Test-and-Set**: Atomic instruction that sets a variable and returns old value.\n- **Compare-and-Swap (CAS)**: Atomic compare and swap. Foundation of lock-free programming.\n- **Memory Barriers**: Ensure memory operations complete in order.",
    ],
    interviewTips: [
      "Know semaphore operations (wait/signal) and write pseudocode for producer-consumer.",
      "Understand the difference between mutex and semaphore clearly.",
      "Be able to explain monitors and condition variables.",
      "Dining Philosophers is a favorite — know at least two solutions.",
    ],
    commonQuestions: [
      "What is a race condition? Give an example.",
      "Explain the three requirements of the critical section problem.",
      "Difference between mutex and semaphore?",
      "Solve the producer-consumer problem using semaphores.",
      "What is a monitor? How does it differ from semaphores?",
    ],
    companies: ["Google", "Microsoft", "Amazon", "Uber", "Netflix", "Oracle"],
  },

  // ══════════════════════════════════════════════════════
  // DATABASE MANAGEMENT SYSTEMS
  // ══════════════════════════════════════════════════════

  normalization: {
    title: "Normalization",
    subject: "Database Management",
    readTime: "9 min",
    content: [
      "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity. It involves decomposing tables into smaller tables and defining relationships.",
      "## Functional Dependencies\n\nA functional dependency X → Y means that the value of X uniquely determines the value of Y. Understanding FDs is essential for normalization.\n\n- **Full FD**: Y depends on the entire key, not a subset.\n- **Partial FD**: Y depends on only part of a composite key.\n- **Transitive FD**: X → Y and Y → Z implies X → Z transitively.",
      "## Normal Forms\n\n1. **1NF (First Normal Form)**: All attributes contain only atomic (indivisible) values. No repeating groups.\n2. **2NF**: In 1NF + no partial dependencies (every non-key attribute depends on the entire primary key).\n3. **3NF**: In 2NF + no transitive dependencies (non-key attributes depend only on the key).\n4. **BCNF (Boyce-Codd NF)**: For every FD X → Y, X must be a superkey. Stricter than 3NF.",
      "## Decomposition\n\nWhen normalizing, we decompose tables:\n\n- **Lossless-Join Decomposition**: The original table can be reconstructed by joining the decomposed tables.\n- **Dependency-Preserving**: All functional dependencies are maintained in the decomposed schema.\n- A good decomposition should be both lossless-join and dependency-preserving.",
      "## When to Denormalize\n\nSometimes denormalization improves performance:\n\n- Read-heavy workloads where joins are expensive.\n- Reporting and analytics queries.\n- Caching frequently accessed computed data.\n- Always a trade-off: faster reads vs data redundancy and update anomalies.",
    ],
    interviewTips: [
      "Be able to identify 1NF/2NF/3NF/BCNF violations from a given table.",
      "Practice decomposing a table step by step through each normal form.",
      "Know the difference between 3NF and BCNF with an example where they differ.",
      "Discuss when denormalization is acceptable — shows practical awareness.",
    ],
    commonQuestions: [
      "Explain 1NF, 2NF, 3NF, and BCNF with examples.",
      "What is a functional dependency?",
      "Difference between 3NF and BCNF?",
      "What is lossless-join decomposition?",
      "When would you choose to denormalize?",
    ],
    companies: ["Amazon", "Google", "Microsoft", "Oracle", "SAP", "Flipkart"],
  },

  sql: {
    title: "SQL & Relational Queries Deep Dive",
    subject: "Database Management",
    readTime: "18 min",
    content: [
      "SQL (Structured Query Language) is the standard language for interacting with relational databases. Mastering SQL is one of the most practical skills tested in SDE interviews, spanning everything from basic CRUD to highly complex analytical queries.",
      "## The Order of Execution\n\nThe most common mistake in SQL is misunderstanding the logical order of execution. Queries are NOT executed top-to-bottom. The DB engine processes them as follows:\n\n1. **FROM & JOINs**: Determine the working dataset.\n2. **WHERE**: Filter individual rows.\n3. **GROUP BY**: Aggregate data into groups.\n4. **HAVING**: Filter aggregated groups.\n5. **SELECT**: Select columns to return.\n6. **DISTINCT**: Remove duplicates.\n7. **ORDER BY**: Sort the final result set.\n8. **LIMIT / OFFSET**: Restrict the number of rows returned.",
      "## Advanced Joins & Variations\n\nBeyond basic INNER/LEFT/RIGHT joins:\n\n- **FULL OUTER JOIN**: Returns all records when there is a match in either left or right table. Missing matches contain NULLs.\n- **CROSS JOIN**: Returns the Cartesian product (NxM rows). Usually a performance disaster if used accidentally without a WHERE clause.\n- **SELF JOIN**: Joining a table to itself. Essential for hierarchical data (e.g., finding an Employee's Manager in the same Employee table).\n- **NATURAL JOIN**: Automatically joins on all columns with the same name. Generally frowned upon in production as schema changes can silently break queries.",
      "## Aggregate Functions & Grouping\n\n- **COUNT, SUM, AVG, MIN, MAX**: Standard aggregate functions.\n- **GROUP_CONCAT / STRING_AGG**: Aggregates strings within a group.\n- **ROLLUP & CUBE**: Extensions to GROUP BY that provide subtotals and grand totals aggregating across multiple dimensions.",
      "## Subqueries vs. CTEs vs. Temp Tables\n\n- **Subquery**: Nested inside another query. A *Correlated Subquery* references columns from the outer query and executes once for *each row* of the outer query (O(N^2) complexity).\n- **CTE (Common Table Expression)**: Defined using the `WITH` clause. They make complex queries readable and can be self-referencing (Recursive CTEs), which are perfect for traversing tree/graph structures in SQL.\n- **Temp Tables**: Physically instantiated tables that live for the duration of a session. Better than CTEs if the intermediate result is huge and needs indexing.",
      "## Window (Analytical) Functions\n\nWindow functions perform look-ahead/look-behind calculations across a set of table rows related to the current row, without collapsing the rows like GROUP BY does.\n\n- **ROW_NUMBER()**: Assigns a unique sequential integer starting from 1.\n- **RANK()**: Assigns ranks but handles ties by leaving gaps (e.g., 1, 2, 2, 4).\n- **DENSE_RANK()**: Handles ties without leaving gaps (e.g., 1, 2, 2, 3). Essential for 'Find the Nth highest salary' problems.\n- **LEAD() / LAG()**: Access data from the subsequent or preceding row in the same result set. Crucial for calculating year-over-year growth or time differences."
    ],
    interviewTips: [
      "Always write SQL queries on an actual whiteboard or paper before an interview to get used to writing syntax without an IDE.",
      "If you are asked to 'Find the 2nd highest salary', DO NOT use LIMIT/OFFSET unless explicitly allowed. The interviewer wants to see DENSE_RANK() or a Correlated Subquery using MAX().",
      "Be ready to explain the performance differences between EXISTS and IN. EXISTS stops searching once it finds a match (boolean), whereas IN compares against an entire list in memory."
    ],
    commonQuestions: [
      "Write a query to find the Nth highest salary without using LIMIT.",
      "Explain the exact logical order of execution for a SELECT query.",
      "Write a query to find employees who earn more than their managers (Self Join).",
      "What is the difference between WHERE and HAVING? Can you use aggregate functions in WHERE?",
      "Demonstrate how a Recursive CTE works."
    ],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Stripe", "Uber", "Airbnb"]
  },

  indexing: {
    title: "Indexing & B-Trees",
    subject: "Database Management",
    readTime: "8 min",
    content: [
      "Indexing is a data structure technique to efficiently retrieve records from a database. Without indexes, the database must scan every row (full table scan) to find matching data.",
      "## Types of Indexes\n\n- **Primary Index**: Built on the ordering key field of a sorted file. One entry per block.\n- **Secondary Index**: Built on a non-ordering field. One entry per record (dense).\n- **Clustered Index**: Records are physically sorted on the indexed field.\n- **Non-Clustered Index**: Records are NOT physically sorted. Index contains pointers to actual data.",
      "## B-Tree\n\nA self-balancing search tree where every node can have more than two children:\n\n- All leaves are at the same level.\n- A B-tree of order m: each node has at most m children, at least ⌈m/2⌉ children (except root).\n- Search, Insert, Delete all O(log n).\n- Minimizes disk I/O because each node can hold many keys (matches disk block size).",
      "## B+ Tree\n\nVariation of B-tree used in most database systems:\n\n- All data records are stored at leaf level.\n- Leaf nodes are linked (facilitates range queries).\n- Internal nodes only store keys (more keys per node = shallower tree).\n- Most relational databases (MySQL InnoDB, PostgreSQL) use B+ trees for indexes.",
      "## Hash Index\n\nUses a hash function to map keys to bucket locations:\n\n- **Static Hashing**: Fixed number of buckets. Overflow chains for collisions.\n- **Dynamic Hashing (Extendible/Linear)**: Buckets grow dynamically.\n- Very fast for equality lookups O(1), but useless for range queries.",
    ],
    interviewTips: [
      "Know when to use B-tree vs hash index (range vs equality queries).",
      "Be able to explain why B+ trees are preferred over B-trees in databases.",
      "Understand the trade-off: indexes speed up reads but slow down writes.",
      "Know clustered vs non-clustered index differences clearly.",
    ],
    commonQuestions: [
      "What is the difference between B-tree and B+ tree?",
      "When would you use a hash index vs a B+ tree index?",
      "Explain clustered vs non-clustered indexes.",
      "What is the time complexity of search in a B+ tree?",
      "Why do databases prefer B+ trees?",
    ],
    companies: ["Google", "Amazon", "Microsoft", "Oracle", "MongoDB", "Snowflake"],
  },

  transactions: {
    title: "Transactions & ACID",
    subject: "Database Management",
    readTime: "8 min",
    content: [
      "A transaction is a logical unit of work that consists of one or more SQL operations. Transactions must satisfy the ACID properties to ensure database consistency.",
      "## ACID Properties\n\n1. **Atomicity**: A transaction is all-or-nothing. If any part fails, the entire transaction is rolled back.\n2. **Consistency**: A transaction takes the database from one consistent state to another.\n3. **Isolation**: Concurrent transactions don't interfere with each other. Each transaction appears to execute in isolation.\n4. **Durability**: Once a transaction commits, its changes are permanent even in case of system failure.",
      "## Transaction States\n\n1. **Active**: Transaction is executing.\n2. **Partially Committed**: Final operation executed, waiting for commit.\n3. **Committed**: Successfully completed.\n4. **Failed**: Normal execution can't proceed.\n5. **Aborted**: Transaction rolled back, database restored.\n\nAfter abort, the transaction can be restarted or killed.",
      "## Isolation Levels\n\n1. **Read Uncommitted**: Dirty reads allowed. Lowest isolation.\n2. **Read Committed**: Only committed data is read. Prevents dirty reads.\n3. **Repeatable Read**: Values read don't change during transaction. Prevents non-repeatable reads.\n4. **Serializable**: Highest isolation. Transactions appear serial. Prevents phantom reads.",
      "## Recovery Mechanisms\n\n- **Write-Ahead Logging (WAL)**: All modifications are written to a log before applying to the database.\n- **Checkpointing**: Periodic saving of database state to reduce recovery time.\n- **UNDO/REDO logging**: UNDO reverses uncommitted changes; REDO reapplies committed changes after crash.",
    ],
    interviewTips: [
      "ACID properties are fundamental — explain each with a real-world analogy (e.g., bank transfer).",
      "Know isolation levels and what anomalies each prevents (dirty read, non-repeatable read, phantom read).",
      "Be able to draw the transaction state diagram.",
      "Understand WAL and why it's important for crash recovery.",
    ],
    commonQuestions: [
      "Explain ACID properties with examples.",
      "What is a dirty read? How do isolation levels prevent it?",
      "Compare the four isolation levels.",
      "What is Write-Ahead Logging?",
      "Explain the transaction state diagram.",
    ],
    companies: ["Amazon", "Google", "Microsoft", "Goldman Sachs", "Stripe", "Razorpay"],
  },

  concurrency: {
    title: "Concurrency Control",
    subject: "Database Management",
    readTime: "8 min",
    content: [
      "Concurrency control ensures that database transactions are executed safely when multiple transactions run simultaneously. The goal is to produce a schedule equivalent to some serial execution.",
      "## Serializability\n\nA schedule is serializable if its outcome is the same as some serial schedule.\n\n- **Conflict Serializability**: Two operations conflict if they access the same data item and at least one is a write. A schedule is conflict-serializable if it can be transformed into a serial schedule by swapping non-conflicting operations.\n- **Precedence Graph**: Build a graph from conflicting operations. If no cycle exists, the schedule is conflict-serializable.",
      "## Lock-Based Protocols\n\n- **Shared Lock (S)**: For reading. Multiple transactions can hold shared locks simultaneously.\n- **Exclusive Lock (X)**: For writing. Only one transaction can hold an exclusive lock.\n- **Two-Phase Locking (2PL)**: A transaction must acquire all locks before releasing any.\n  - **Growing Phase**: Acquire locks, no releases.\n  - **Shrinking Phase**: Release locks, no new acquisitions.\n  - Guarantees conflict serializability but may cause deadlocks.",
      "## Timestamp-Based Protocols\n\nEach transaction gets a timestamp at start. Younger transactions have larger timestamps.\n\n- **Read/Write timestamps** on data items determine if operations are safe.\n- If an operation violates timestamp ordering, the transaction is rolled back and restarted.\n- No deadlocks possible (transactions are rolled back instead of waiting).",
      "## Multi-Version Concurrency Control (MVCC)\n\nMaintains multiple versions of data items. Readers don't block writers, writers don't block readers.\n\n- Used by PostgreSQL, MySQL InnoDB, Oracle.\n- Each transaction sees a snapshot of the database.\n- Very efficient for read-heavy workloads.",
    ],
    interviewTips: [
      "Be able to determine if a schedule is conflict-serializable using a precedence graph.",
      "Know Two-Phase Locking and its guarantee — this is heavily tested.",
      "Understand MVCC since most modern databases use it.",
      "Know the difference between optimistic and pessimistic concurrency control.",
    ],
    commonQuestions: [
      "What is a serializable schedule?",
      "Explain Two-Phase Locking and its phases.",
      "What is MVCC and which databases use it?",
      "How do you check for conflict serializability?",
      "Compare lock-based and timestamp-based protocols.",
    ],
    companies: ["Google", "Amazon", "Oracle", "Microsoft", "CockroachDB", "Snowflake"],
  },

  // ══════════════════════════════════════════════════════
  // COMPUTER NETWORKS
  // ══════════════════════════════════════════════════════

  osi: {
    title: "OSI & TCP/IP Models Deep Dive",
    subject: "Computer Networks",
    readTime: "16 min",
    content: [
      "The OSI (Open Systems Interconnection) and TCP/IP models provide theoretical and practical frameworks for understanding how data travels across a network. While OSI is a reference model, TCP/IP is the actual suite of protocols operating the modern Internet.",
      "## The 7 Layers of OSI\n\n1. **Physical (L1)**: Transmission of raw bit streams over a physical medium (copper, fiber, radio). Devices: Hubs, Repeaters, Cables.\n2. **Data Link (L2)**: Node-to-node data transfer. Handles physical addressing (MAC), error detection (FCS/CRC), and frame synchronization. Switches and Bridges operate here. Sublayers: LLC (Logical Link Control) and MAC (Media Access Control).\n3. **Network (L3)**: Handles routing of data across multiple networks and logical addressing (IP addresses). Routers operate here. Protocols: IPv4, IPv6, ICMP, IPSec.\n4. **Transport (L4)**: Ensures complete data transfer and provides error recovery and flow control. Can be connection-oriented (TCP) or connectionless (UDP). Port numbers exist here.\n5. **Session (L5)**: Establishes, manages, and terminates sessions between applications. Examples: NetBIOS, PPTP.\n6. **Presentation (L6)**: Translates data between the application and the network format. Handles encryption (SSL/TLS relies heavily on this tier conceptually) and compression.\n7. **Application (L7)**: The network interface for user applications. Protocols: HTTP, DNS, SMTP, FTP, SSH.",
      "## TCP/IP Model (The Hybrid 5-Layer Model)\n\nThe original TCP/IP model has 4 layers, but modern networking courses often teach a 5-layer hybrid model:\n1. **Physical**: Raw bits.\n2. **Link**: Ethernet, Wi-Fi (802.11).\n3. **Network (Internet)**: IP routing.\n4. **Transport**: TCP, UDP.\n5. **Application**: OSI layers 5, 6, and 7 combined.",
      "## Data Encapsulation & Decapsulation\n\nAs data moves down the layers from Application to Physical, each layer wraps the payload with its own header (and sometimes a trailer). This is encapsulation:\n- **L7/L6/L5**: Data / Message payload.\n- **L4 (Transport)**: Adds TCP/UDP Header -> **Segment** (TCP) / **Datagram** (UDP).\n- **L3 (Network)**: Adds IP Header -> **Packet**.\n- **L2 (Data Link)**: Adds MAC Header & FCS Trailer -> **Frame**.\n- **L1 (Physical)**: Encoded into physical signals -> **Bits**.",
      "## The Anatomy of a Router vs Switch\n\n- **Switch (L2)**: Forwards frames based on MAC addresses using a MAC Address Table. If unseen, it floods all ports (except the origin).\n- **Router (L3)**: Forwards packets between different networks based on IP addresses using a Routing Table. It strips the L2 frame, examines the L3 packet, determines the next hop, wraps it in a *new* L2 frame, and transmits it."
    ],
    interviewTips: [
      "Memorize the layers perfectly. A common mnemonic: 'Please Do Not Throw Sausage Pizza Away'.",
      "Understand the difference between a MAC address (L2, physical identifier, flat space) and an IP address (L3, logical identifier, hierarchical).",
      "When asked 'At what layer does a Load Balancer operate?', respond that traditional load balancers are L4 (transport, balancing TCP connections), but modern Application Delivery Controllers are L7 (inspecting HTTP headers to make routing decisions)."
    ],
    commonQuestions: [
      "What is the difference between TCP/IP and the OSI model?",
      "Explain encapsulation and match the Protocol Data Unit (PDU) name to each layer.",
      "At which OSI layer does a Router operate? What about a Switch?",
      "What is the difference between L4 and L7 Load Balancing?"
    ],
    companies: ["Cisco", "Amazon", "Google", "Microsoft", "Juniper", "Cloudflare"]
  },

  tcp: {
    title: "TCP vs UDP",
    subject: "Computer Networks",
    readTime: "7 min",
    content: [
      "TCP (Transmission Control Protocol) and UDP (User Datagram Protocol) are the two main transport layer protocols. They differ fundamentally in reliability, ordering, and connection management.",
      "## TCP (Transmission Control Protocol)\n\n- **Connection-oriented**: 3-way handshake (SYN → SYN-ACK → ACK) before data transfer.\n- **Reliable**: Guarantees delivery through acknowledgments and retransmissions.\n- **Ordered**: Data arrives in the order it was sent (sequence numbers).\n- **Flow Control**: Sliding window protocol prevents sender from overwhelming receiver.\n- **Congestion Control**: Slow Start, Congestion Avoidance, Fast Retransmit.\n- **Use cases**: HTTP, HTTPS, FTP, SMTP, SSH.",
      "## UDP (User Datagram Protocol)\n\n- **Connectionless**: No handshake. Just send.\n- **Unreliable**: No guarantee of delivery or order.\n- **Fast**: Minimal overhead (8-byte header vs TCP's 20+ bytes).\n- **No flow/congestion control**: Application must handle if needed.\n- **Use cases**: DNS, DHCP, video streaming, online gaming, VoIP.",
      "## TCP 3-Way Handshake\n\n1. **Client → Server**: SYN (seq = x)\n2. **Server → Client**: SYN-ACK (seq = y, ack = x+1)\n3. **Client → Server**: ACK (ack = y+1)\n\nConnection termination uses 4-way handshake: FIN → ACK → FIN → ACK.",
      "## TCP Congestion Control\n\n- **Slow Start**: Start with small congestion window (cwnd = 1 MSS), double each RTT until threshold.\n- **Congestion Avoidance**: After threshold, increase cwnd linearly.\n- **Fast Retransmit**: On 3 duplicate ACKs, retransmit without waiting for timeout.\n- **Fast Recovery**: After fast retransmit, don't reset to slow start.",
    ],
    interviewTips: [
      "Always compare TCP and UDP side by side — interviewers expect a structured comparison.",
      "Know the 3-way handshake cold — draw the diagram.",
      "Understand why real-time applications prefer UDP over TCP.",
      "TCP congestion control (Slow Start) is a common deep-dive topic.",
    ],
    commonQuestions: [
      "Compare TCP and UDP with use cases.",
      "Explain the TCP 3-way handshake.",
      "Why does DNS use UDP instead of TCP?",
      "What is the TCP sliding window protocol?",
      "Explain TCP congestion control mechanisms.",
    ],
    companies: ["Amazon", "Google", "Cisco", "Netflix", "Cloudflare", "Akamai"],
  },

  routing: {
    title: "Routing Algorithms",
    subject: "Computer Networks",
    readTime: "9 min",
    content: [
      "Routing is the process of selecting paths in a network to send data from source to destination. Routing algorithms determine the best path based on metrics like hop count, bandwidth, or delay.",
      "## Distance Vector Routing\n\nEach router maintains a table of shortest distances to every other router:\n\n- **Algorithm**: Bellman-Ford distributed.\n- **Updates**: Periodic exchange of entire routing tables with neighbors.\n- **Convergence**: Slow. Count-to-infinity problem.\n- **Solutions**: Split horizon, poison reverse, hold-down timers.\n- **Protocol**: RIP (Routing Information Protocol) — max 15 hops.",
      "## Link State Routing\n\nEach router has complete topology knowledge:\n\n- **Algorithm**: Dijkstra's shortest path.\n- **Updates**: Flood Link State Advertisements (LSAs) to all routers.\n- **Convergence**: Fast.\n- **Protocol**: OSPF (Open Shortest Path First) — uses areas for scalability.",
      "## Path Vector Routing\n\nUsed for inter-domain routing:\n\n- Each router shares entire path (not just distance) to prevent loops.\n- **Protocol**: BGP (Border Gateway Protocol) — the protocol that runs the internet.\n- BGP uses policy-based routing, not just shortest path.",
      "## Comparison\n\n- **RIP**: Simple, small networks, hop-count metric, slow convergence.\n- **OSPF**: Large networks, cost metric, fast convergence, hierarchical.\n- **BGP**: Internet-scale, policy-based, path vector, between autonomous systems.",
    ],
    interviewTips: [
      "Know Dijkstra's and Bellman-Ford algorithms — be able to trace through an example.",
      "Understand the count-to-infinity problem and how split horizon fixes it.",
      "BGP is important for system design interviews — know its role in the internet.",
      "Compare distance vector vs link state routing protocols clearly.",
    ],
    commonQuestions: [
      "Explain distance vector vs link state routing.",
      "What is the count-to-infinity problem?",
      "How does OSPF work?",
      "What is BGP and why is it important?",
      "Compare RIP, OSPF, and BGP.",
    ],
    companies: ["Google", "Amazon", "Cisco", "Juniper", "Meta", "Cloudflare"],
  },

  dns: {
    title: "DNS & HTTP",
    subject: "Computer Networks",
    readTime: "8 min",
    content: [
      "DNS and HTTP are the most important application-layer protocols. DNS translates domain names to IP addresses, and HTTP is the protocol for web communication.",
      "## DNS (Domain Name System)\n\nHierarchical naming system for mapping domain names to IPs:\n\n- **DNS Hierarchy**: Root servers → TLD servers (.com, .org) → Authoritative servers → Local resolver.\n- **Resolution types**:\n  - **Recursive**: Resolver does all the work, returns final answer.\n  - **Iterative**: Resolver queries each server in turn.\n- **DNS Records**: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (name server), TXT.\n- **DNS Caching**: TTL (Time to Live) controls cache duration.",
      "## HTTP (HyperText Transfer Protocol)\n\n- **Stateless**: Each request is independent.\n- **Methods**: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.\n- **Status Codes**: 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error).\n- **Headers**: Content-Type, Authorization, Cache-Control, Set-Cookie.",
      "## HTTP/1.1 vs HTTP/2 vs HTTP/3\n\n- **HTTP/1.1**: Persistent connections, pipelining (but head-of-line blocking).\n- **HTTP/2**: Multiplexing (multiple requests on one connection), header compression, server push. Binary protocol.\n- **HTTP/3**: Uses QUIC (UDP-based). Eliminates TCP head-of-line blocking. Faster connection setup.",
      "## HTTPS\n\nHTTP over TLS (Transport Layer Security):\n\n1. **TLS Handshake**: Client Hello → Server Hello + Certificate → Key Exchange → Encrypted communication.\n2. **Certificates**: Issued by Certificate Authorities (CA). Verify server identity.\n3. **Symmetric encryption** for data transfer (fast), asymmetric encryption for key exchange (secure).",
    ],
    interviewTips: [
      "Know what happens when you type a URL in the browser — DNS resolution is step 1.",
      "Be familiar with common HTTP status codes (200, 301, 304, 400, 401, 403, 404, 500).",
      "HTTP/2 multiplexing vs HTTP/1.1 pipelining is a great topic to show depth.",
      "HTTPS/TLS handshake flow is important for security-focused companies.",
    ],
    commonQuestions: [
      "Explain DNS resolution step by step.",
      "What happens when you type google.com in a browser?",
      "Compare HTTP/1.1, HTTP/2, and HTTP/3.",
      "What is the difference between GET and POST?",
      "Explain the HTTPS/TLS handshake.",
    ],
    companies: ["Google", "Amazon", "Cloudflare", "Akamai", "Meta", "Microsoft"],
  },

  security: {
    title: "Network Security",
    subject: "Computer Networks",
    readTime: "7 min",
    content: [
      "Network security protects data during transmission across networks. It involves encryption, authentication, and attack prevention mechanisms.",
      "## Cryptography Basics\n\n- **Symmetric Key**: Same key for encryption and decryption. Fast. Examples: AES, DES, 3DES.\n- **Asymmetric Key**: Public key encrypts, private key decrypts (or vice versa for signing). Slower. Examples: RSA, ECC.\n- **Hashing**: One-way function producing fixed-size output. Examples: SHA-256, MD5 (deprecated). Used for integrity checks and password storage.",
      "## Common Attacks\n\n1. **Man-in-the-Middle (MITM)**: Attacker intercepts communication between two parties.\n2. **DNS Spoofing**: Corrupting DNS cache to redirect traffic to malicious sites.\n3. **DDoS (Distributed Denial of Service)**: Overwhelming a server with traffic from multiple sources.\n4. **SQL Injection**: Inserting malicious SQL through user input.\n5. **XSS (Cross-Site Scripting)**: Injecting malicious scripts into web pages.\n6. **Phishing**: Social engineering to steal credentials.",
      "## Firewalls & IDS\n\n- **Firewall**: Filters network traffic based on rules. Types: packet filter, stateful, application-layer.\n- **IDS (Intrusion Detection System)**: Monitors network for suspicious activity.\n- **IPS (Intrusion Prevention System)**: Like IDS but can actively block threats.\n- **DMZ (Demilitarized Zone)**: Network segment between internal and external networks for hosting public services.",
      "## VPN & IPSec\n\n- **VPN (Virtual Private Network)**: Creates encrypted tunnel over public network.\n- **IPSec**: Protocol suite for securing IP communications. Two modes:\n  - **Transport Mode**: Only payload is encrypted.\n  - **Tunnel Mode**: Entire IP packet is encrypted (used in VPNs).\n- **Protocols**: AH (authentication), ESP (encryption + authentication).",
    ],
    interviewTips: [
      "Know symmetric vs asymmetric encryption with real-world examples.",
      "Be able to explain common web attacks (SQL injection, XSS) and their prevention.",
      "HTTPS/TLS is a security topic too — connects with DNS & HTTP knowledge.",
      "Firewall rules and DMZ architecture are important for system design.",
    ],
    commonQuestions: [
      "Explain symmetric vs asymmetric encryption.",
      "What is a MITM attack and how to prevent it?",
      "How does a firewall work?",
      "Explain IPSec and its modes.",
      "What is the difference between IDS and IPS?",
    ],
    companies: ["Google", "Amazon", "Microsoft", "Palo Alto Networks", "CrowdStrike", "Cisco"],
  },

  // ══════════════════════════════════════════════════════
  // OBJECT-ORIENTED PROGRAMMING
  // ══════════════════════════════════════════════════════

  pillars: {
    title: "OOP Pillars",
    subject: "Object-Oriented Programming",
    readTime: "6 min",
    content: [
      "Object-Oriented Programming is built on four fundamental pillars: Encapsulation, Abstraction, Inheritance, and Polymorphism.",
      "## Encapsulation\n\nBundling data and methods that operate on that data within a single unit (class). Access modifiers (private, protected, public) control visibility. This hides internal state and requires interaction through well-defined interfaces.",
      "## Abstraction\n\nHiding complex implementation details and showing only the necessary features. Achieved through abstract classes and interfaces. Focus on WHAT an object does rather than HOW it does it.",
      "## Inheritance\n\nMechanism where a new class derives properties and behaviors from an existing class. Promotes code reuse. Types: Single, Multiple (via interfaces in Java/C#), Multilevel, Hierarchical, Hybrid.",
      "## Polymorphism\n\nAbility of objects to take multiple forms.\n\n- **Compile-time (Static)**: Method overloading, operator overloading.\n- **Runtime (Dynamic)**: Method overriding with virtual functions.\n\nKey concept: A parent reference can hold a child object.",
    ],
    interviewTips: [
      "Give real-world analogies for each pillar — interviewers love practical examples.",
      "Know the difference between abstraction and encapsulation clearly.",
      "Be ready to write code demonstrating polymorphism.",
      "Understand virtual tables (vtable) for C++ interviews.",
    ],
    commonQuestions: [
      "Explain the four pillars of OOP with examples.",
      "What is the difference between abstraction and encapsulation?",
      "What is polymorphism? Explain compile-time vs runtime.",
      "Why is multiple inheritance problematic? How do interfaces solve it?",
    ],
    companies: ["Amazon", "Microsoft", "Adobe", "Atlassian", "Intuit"],
  },

  solid: {
    title: "SOLID Principles Deep Dive",
    subject: "Object-Oriented Programming",
    readTime: "15 min",
    content: [
      "SOLID is an acronym representing five fundamental design principles in Object-Oriented Programming that make software architectures more understandable, flexible, and maintainable. They establish practices for managing dependencies and decoupling modules.",
      "## S — Single Responsibility Principle (SRP)\n\n'A class should have one, and only one, reason to change.'\n- **The Problem**: A `UserAuthentication` class that handles password hashing, database connections, and sending welcome emails. If the email provider changes, the auth class must change.\n- **The Solution**: Split behaviors into `PasswordHasher`, `DatabaseRepository`, and `EmailService`. The `UserAuthentication` class then relies on these smaller, focused modules.",
      "## O — Open/Closed Principle (OCP)\n\n'Software entities should be open for extension, but closed for modification.'\n- **The Problem**: Hardcoding `if (type == 'PDF') processPDF() else if (type == 'CSV') processCSV()` in an exporter. Adding a new format requires changing existing, tested code.\n- **The Solution**: Define an `IExporter` interface. Create separate `PdfExporter` and `CsvExporter` classes. To add Excel support, simply create `ExcelExporter` without touching existing exporters.",
      "## L — Liskov Substitution Principle (LSP)\n\n'Objects of a superclass shall be replaceable with objects of its subclasses without breaking the application.'\n- **The Problem**: The classic `Square extends Rectangle` issue. A Square enforcing `width == height` breaks the behavior expected of a Rectangle (where width and height are independent). If a method takes a `Rectangle`, substituting a `Square` causes runtime bugs.\n- **The Solution**: Re-evaluate the abstraction. Sometimes two objects share properties but don't have an 'IS-A' relationship. Interfaces or composition often solve this better than inheritance.",
      "## I — Interface Segregation Principle (ISP)\n\n'Clients should not be forced to depend upon interfaces that they do not use.'\n- **The Problem**: One giant `IMachine` interface with `print()`, `scan()`, and `fax()`. A simple desk printer must implement empty/throwing methods for `scan` and `fax`.\n- **The Solution**: Break it down into `IPrinter`, `IScanner`, and `IFax`. Devices can implement only what they actually support.",
      "## D — Dependency Inversion Principle (DIP)\n\n'High-level modules should not depend on low-level modules. Both should depend upon abstractions.'\n- **The Problem**: A high-level `PaymentProcessor` directly instantiates a concrete `StripeAPI` class. It's tightly coupled and impossible to unit test without calling Stripe.\n- **The Solution**: Define an `IPaymentGateway` interface. Have `StripeAPI` implement it. Inject the interface into the `PaymentProcessor` via its constructor (Dependency Injection). During tests, you can inject a `MockPaymentGateway`."
    ],
    interviewTips: [
      "When asked about SOLID, don't just state the acronym. Provide a 1-sentence code smell and the resolution for each.",
      "LSP is the hardest to explain for most candidates. Use the Rectangle/Square or the 'Duck simulator needing batteries' analogy.",
      "DIP directly leads to Dependency Injection (DI) and Inversion of Control (IoC), which are massive topics for backend roles (e.g., Spring Boot, NestJS).",
      "Mention that while SOLID is crucial, dogmatic application can lead to over-engineering and 'Interface explosion'. Pragmatism is key."
    ],
    commonQuestions: [
      "Explain the exact violation occurring when Square extends Rectangle.",
      "How does Dependency Injection relate to the Dependency Inversion Principle?",
      "Give a real-world project example where you applied the Open/Closed Principle.",
      "Why is Interface Segregation important for microservices or plugin architectures?"
    ],
    companies: ["Amazon", "Microsoft", "Google", "Atlassian", "Uber", "ThoughtWorks"]
  },

  patterns: {
    title: "Design Patterns",
    subject: "Object-Oriented Programming",
    readTime: "12 min",
    content: [
      "Design patterns are reusable solutions to common software design problems. They were popularized by the 'Gang of Four' (GoF) book. Patterns are categorized into Creational, Structural, and Behavioral.",
      "## Creational Patterns\n\n1. **Singleton**: Ensures only one instance of a class exists. Use: Database connection pool, configuration manager.\n2. **Factory Method**: Creates objects without specifying exact class. The factory method decides which class to instantiate.\n3. **Abstract Factory**: Creates families of related objects without specifying concrete classes.\n4. **Builder**: Constructs complex objects step by step. Use: Building complex configurations (e.g., query builders).\n5. **Prototype**: Creates new objects by copying existing ones (cloning).",
      "## Structural Patterns\n\n1. **Adapter**: Makes incompatible interfaces work together. Like a power adapter for different countries.\n2. **Decorator**: Adds behavior to objects dynamically without modifying their class. Like adding toppings to a pizza.\n3. **Facade**: Provides a simplified interface to a complex subsystem.\n4. **Proxy**: Controls access to an object. Types: virtual proxy (lazy loading), protection proxy (access control).\n5. **Composite**: Treats individual objects and compositions uniformly (tree structure).",
      "## Behavioral Patterns\n\n1. **Observer**: One-to-many dependency. When the subject changes state, all observers are notified. Use: Event systems, pub/sub.\n2. **Strategy**: Defines a family of algorithms and makes them interchangeable at runtime. Use: Sorting algorithms, payment methods.\n3. **Command**: Encapsulates a request as an object. Supports undo/redo operations.\n4. **Iterator**: Provides a way to access elements of a collection sequentially without exposing the underlying structure.\n5. **State**: Object changes behavior based on internal state (like a state machine).",
      "## Patterns Most Asked in Interviews\n\nTop 5 patterns by interview frequency:\n\n1. **Singleton** — Know thread-safe implementation, lazy vs eager initialization.\n2. **Factory & Abstract Factory** — Know when to use each.\n3. **Observer** — Core of event-driven programming.\n4. **Strategy** — Demonstrates Open/Closed Principle.\n5. **Decorator** — Java I/O streams are a classic example.",
    ],
    interviewTips: [
      "Focus on Singleton, Factory, Observer, Strategy — these cover 80% of interview questions.",
      "Be ready to write Singleton with thread safety (double-checked locking).",
      "Know real-world examples for each pattern (Java Collections, Spring Framework).",
      "Design Patterns + SOLID = demonstrates senior-level thinking.",
    ],
    commonQuestions: [
      "Implement a thread-safe Singleton pattern.",
      "When would you use Factory vs Abstract Factory?",
      "Explain the Observer pattern with a real-world example.",
      "What is the Strategy pattern? How does it relate to OCP?",
      "Compare Adapter and Facade patterns.",
    ],
    companies: ["Amazon", "Microsoft", "Google", "Adobe", "Atlassian", "Uber"],
  },

  abstraction: {
    title: "Abstraction vs Interfaces",
    subject: "Object-Oriented Programming",
    readTime: "7 min",
    content: [
      "Abstraction and interfaces are two mechanisms for achieving abstraction in OOP. While related, they serve different purposes and have important distinctions.",
      "## Abstract Classes\n\nAn abstract class cannot be instantiated. It can have:\n\n- Abstract methods (no implementation — subclasses must implement).\n- Concrete methods (with implementation — inherited by subclasses).\n- Instance variables and constructors.\n- Access modifiers on members.\n\nUse when: Classes share common behavior AND state. Example: `Shape` with `area()` abstract and `color` field.",
      "## Interfaces\n\nA contract that specifies what a class must do, but not how:\n\n- All methods are implicitly abstract (before Java 8; default methods added later).\n- Cannot have instance variables (only constants).\n- A class can implement multiple interfaces.\n- No constructors.\n\nUse when: Unrelated classes share a capability. Example: `Serializable`, `Comparable`, `Runnable`.",
      "## Key Differences\n\n- **Inheritance**: A class extends one abstract class but can implement multiple interfaces.\n- **State**: Abstract classes can hold state (fields); interfaces cannot.\n- **Constructors**: Abstract classes can have constructors; interfaces cannot.\n- **Access Modifiers**: Abstract class members can be private/protected; interface members are public.\n- **Purpose**: Abstract class = 'is-a' relationship; Interface = 'can-do' capability.",
      "## Default Methods (Java 8+)\n\nInterfaces can now have default method implementations:\n\n- Allows adding methods to interfaces without breaking existing implementations.\n- Resolves the diamond problem with explicit resolution rules.\n- Blurs the line between abstract classes and interfaces, but the core distinction of state vs. capability remains.",
    ],
    interviewTips: [
      "Always give the 'is-a' vs 'can-do' distinction — it shows clarity of thought.",
      "Know when to use abstract class vs interface with a practical example.",
      "Java 8 default methods are a common follow-up — know how the diamond problem is handled.",
      "Be able to write code demonstrating both in action.",
    ],
    commonQuestions: [
      "When would you use an abstract class vs an interface?",
      "Can an abstract class have a constructor?",
      "What are default methods in interfaces?",
      "How does Java handle the diamond problem with interfaces?",
      "Give a real-world example using both abstract class and interface.",
    ],
    companies: ["Amazon", "Microsoft", "Adobe", "Flipkart", "Intuit", "SAP"],
  },

  polymorphism: {
    title: "Polymorphism Deep Dive",
    subject: "Object-Oriented Programming",
    readTime: "8 min",
    content: [
      "Polymorphism means 'many forms'. It allows objects of different types to be treated uniformly through a common interface. It's one of the most powerful features of OOP.",
      "## Compile-Time Polymorphism (Static)\n\nResolved at compile time:\n\n1. **Method Overloading**: Same method name, different parameters (number, type, or order).\n   - Return type alone is NOT sufficient for overloading.\n   - Resolved by the compiler based on method signature.\n\n2. **Operator Overloading**: Redefining operator behavior for user-defined types (C++ feature, not in Java).\n   - Example: `+` operator for string concatenation.",
      "## Runtime Polymorphism (Dynamic)\n\nResolved at runtime:\n\n1. **Method Overriding**: Subclass provides specific implementation of a method already defined in parent class.\n   - Method signature must be identical.\n   - Uses `@Override` annotation in Java.\n   - Resolved through **virtual method table (vtable)** at runtime.\n\n2. **Dynamic Dispatch**: The JVM/runtime decides which method to call based on the actual object type, not the reference type.",
      "## Virtual Table (vtable)\n\nHow dynamic polymorphism works under the hood:\n\n- Each class with virtual methods has a vtable — an array of pointers to virtual functions.\n- Each object has a hidden pointer (vptr) to its class's vtable.\n- When a virtual method is called, the runtime looks up the vtable to find the correct function.\n- This is why virtual method calls are slightly slower than direct calls.",
      "## Polymorphism in Practice\n\n- **Collections**: `List<Shape>` can hold `Circle`, `Rectangle`, `Triangle` objects.\n- **Frameworks**: Spring uses polymorphism heavily — inject different implementations via interfaces.\n- **Testing**: Mock objects rely on polymorphism to substitute test doubles.\n- **Design Patterns**: Strategy, Observer, Factory all leverage polymorphism.",
    ],
    interviewTips: [
      "Know the distinction between overloading (compile-time) and overriding (runtime) — this is fundamental.",
      "Explain vtable mechanism for bonus points in C++ interviews.",
      "Be ready to write code showing runtime polymorphism with parent reference holding child object.",
      "Connect polymorphism to design patterns — shows mature understanding.",
    ],
    commonQuestions: [
      "What is the difference between method overloading and overriding?",
      "Can you overload methods by return type alone?",
      "Explain how virtual functions work (vtable).",
      "Give a real-world example of runtime polymorphism.",
      "How does polymorphism enable the Strategy pattern?",
    ],
    companies: ["Amazon", "Microsoft", "Google", "Adobe", "Goldman Sachs", "Uber"],
  },
  
  // ══════════════════════════════════════════════════════
  // NEW ADDITIONS
  // ══════════════════════════════════════════════════════

  threads: {
    title: "Threads & Concurrency Deep Dive",
    subject: "Operating Systems",
    readTime: "15 min",
    content: [
      "A thread is the basic unit of CPU utilization and executable execution within a process. It is often referred to as a lightweight process. Unlike processes that are strictly isolated from one another, threads within the same process share the same data section, code section, and open files (heap memory). However, each thread maintains its own thread ID, program counter, register set, and execution stack.",
      "## Multithreading Models & Architecture\n\nOperating systems must map user-level threads to kernel-level threads to schedule them on the CPU. The primary models are:\n\n1. **Many-to-One Model**: Maps many user-level threads to one kernel thread. Thread management is done by a thread library in user space, so it's very efficient. However, if a thread makes a blocking system call, the entire process will block. Used in green threads (e.g., Go Goroutines).\n2. **One-to-One Model**: Maps each user thread to a kernel thread. Provides true concurrency on multiprocessors; if one thread blocks, another can run. Overhead of creating kernel threads can burden the system. Standard in Linux (via `clone()`) and Windows.\n3. **Many-to-Many Model**: Multiplexes many user threads to a smaller or equal number of kernel threads. Offers the best of both worlds but is highly complex to implement.",
      "## Concurrency vs. Parallelism\n\nThese terms are often confused but fundamentally different:\n- **Concurrency**: Dealing with multiple tasks seemingly at once through context switching (interleaving) on a single core.\n- **Parallelism**: Doing multiple tasks simultaneously, which requires multi-core or multiprocessor hardware.\n\n*A system can be concurrent without being parallel, but parallelism implies concurrency.*",
      "## Advanced Synchronization Mechanisms\n\nWhen multiple threads share memory, race conditions occur if operations aren't atomic. Operating systems and languages provide several primitives to handle this:\n\n- **Spinlocks**: The thread 'spins' (busy-waiting) in a loop checking if a lock is available. Efficient only if the lock is held for very brief periods, avoiding context switch overhead.\n- **Mutexes**: Mutual exclusion objects. If a thread cannot acquire the mutex, it is put to sleep (blocked) until the mutex is released. Avoids CPU waste but incurs context switch cost.\n- **Semaphores**: Unlike mutexes which are binary (0, 1) and owned by the thread that locked them, semaphores are counters. A counting semaphore can allow N threads to access a resource simultaneously.\n- **Monitors & Condition Variables**: High-level synchronization constructs built into languages (like Java's `synchronized` block). Condition variables allow threads to block and wait for a specific condition/signal before proceeding.",
      "## Common Concurrency Pitfalls\n\nAs systems scale, threading introduces several notorious issues:\n\n1. **Deadlock**: Two or more threads block forever, waiting for each other.\n2. **Livelock**: Threads continuously change state responding to each other, making no useful progress (like two people trying to pass each other in a hallway).\n3. **Priority Inversion**: A low-priority thread holds a lock needed by a high-priority thread. A medium-priority thread preempts the lower one, implicitly blocking the high-priority thread. (Famously caused the Mars Pathfinder rover constant reboots!). Fixed using **Priority Inheritance**."
    ],
    interviewTips: [
      "Be prepared to explain Priority Inversion and the Priority Inheritance protocol (it's a favorite at Apple and embedded systems roles).",
      "Always clarify if a lock is a Spinlock (busy wait) or a Mutex (sleep wait) when asked to optimize a highly concurrent data structure.",
      "Understand the memory footprint difference. Process = heavy (separate page tables); Thread = light (shared page tables, separate stack)."
    ],
    commonQuestions: [
      "How is a user-level thread different from a kernel-level thread?",
      "Explain the Mars Pathfinder priority inversion bug.",
      "Write a thread-safe Singleton pattern using double-checked locking.",
      "What is Amdahl's Law and how does it relate to multi-core scaling?"
    ],
    companies: ["Google", "Apple", "Microsoft", "Meta", "NVIDIA"]
  },

  nosql: {
    title: "NoSQL Databases Deep Dive",
    subject: "Database Management",
    readTime: "12 min",
    content: [
      "NoSQL (originally 'Non-SQL' or 'Not Only SQL') databases emerged in the late 2000s to address the scaling limitations of traditional relational databases (RDBMS) in the face of web-scale applications. They provide a mechanism for storage and retrieval of data that is modeled in means other than tabular relations.",
      "## The CAP Theorem\n\nThe fundamental theorem of distributed systems formulated by Eric Brewer. It states that a distributed data store can provide at most TWO of the following three guarantees:\n\n1. **Consistency (C)**: Every read receives the most recent write or an error.\n2. **Availability (A)**: Every request receives a non-error response, without guaranteeing it contains the most recent write.\n3. **Partition Tolerance (P)**: The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.\n\n*Because network partitions (P) are inevitable in distributed systems, architects must choose between Consistency (CP) or Availability (AP).* MongoDB is traditionally CP (prioritizes consistency), while Cassandra is AP (prioritizes availability).",
      "## BASE vs ACID\n\nWhile RDBMS relies on ACID (Atomicity, Consistency, Isolation, Durability), NoSQL systems often rely on BASE:\n- **B**asically **A**vailable: The system guarantees availability (usually at the expense of strict consistency).\n- **S**oft state: The state of the system may change over time, even without input, due to eventual consistency.\n- **E**ventually consistent: The system will eventually become consistent once it stops receiving input.",
      "## Types of NoSQL Databases\n\n1. **Key-Value Stores (e.g., Redis, Memcached)**: The simplest NoSQL databases. Every item is stored as a key/value pair. Highly performant for caching, session management, and real-time leaderboards.\n2. **Document Stores (e.g., MongoDB, Couchbase)**: Data is paired with an un-structured or semi-structured key, and the value is a document (JSON, XML). Great for CMS, catalogs, and real-time analytics.\n3. **Wide-Column Stores/Column-Family (e.g., Cassandra, HBase)**: Store data in tables, rows, and dynamic columns. Excellent for time-series data, heavy write workloads, and massive datasets distributed across many servers.\n4. **Graph Databases (e.g., Neo4j, Amazon Neptune)**: Store entities (nodes) and the relationships between them (edges). Perfect for fraud detection, social networks, and recommendation engines.",
      "## When to choose NoSQL over SQL?\n\nChoose NoSQL when:\n- You have large volumes of rapidly changing structured, semi-structured, or unstructured data.\n- You need to scale horizontally (adding more servers) rather than vertically (upgrading a single server).\n- You have a flexible schema or your data schema evolves rapidly.\n- Your application emphasizes high availability and partition tolerance over strict ACID compliance."
    ],
    interviewTips: [
      "Always be ready to discuss the trade-offs of the CAP theorem. Interviewers love scenarios like 'If a network link goes down between two datacenters, how does your system react?'",
      "Know the difference between eventual consistency and strong consistency.",
      "If designing a social network feed, propose a Document Store or Graph DB. If designing a high-speed cache, propose Redis. Match the DB type to the use-case."
    ],
    commonQuestions: [
      "What is the CAP theorem and how does it apply to modern distributed systems?",
      "Explain the BASE properties in contrast to ACID.",
      "How does Cassandra achieve high write throughput compared to Postgres?",
      "When would you explicitly choose a Relational DB over a NoSQL DB today?"
    ],
    companies: ["Amazon", "MongoDB", "Netflix", "Datadog", "Uber"]
  },

  applayer: {
    title: "Application Layer Protocols Deep Dive",
    subject: "Computer Networks",
    readTime: "14 min",
    content: [
      "The Application Layer is the topmost layer in both the OSI and TCP/IP models. It acts as the window for users and application processes to access network services. Unlike other layers that provide data transport mechanisms, the application layer contains the network applications themselves and the protocols they use to communicate.",
      "## Domain Name System (DNS)\n\nDNS is the phonebook of the internet. It translates human-readable hostnames (www.google.com) into machine-readable IP addresses (142.250.190.46).\n- **Query Process**: Recursive resolver -> Root name server -> TLD name server -> Authoritative name server.\n- **Records**: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (name server).\n- **Transport**: Primarily uses UDP on Port 53 for queries (fast, lightweight), but shifts to TCP Port 53 if the response size exceeds 512 bytes or during zone transfers.",
      "## Hypertext Transfer Protocol (HTTP)\n\nHTTP is the foundation of data communication for the World Wide Web. It is a stateless, request-response protocol.\n- **HTTP/1.1**: Introduced keep-alive connections (persistent) so multiple requests can share one TCP connection. Suffers from Head-of-Line (HoL) blocking.\n- **HTTP/2**: Massive overhaul. Introduced binary framing, multiplexing (sending multiple requests concurrently over a single TCP connection), server push, and header compression (HPACK). Solved HTTP-level HoL blocking.\n- **HTTP/3**: Built on QUIC (a UDP-based protocol). Solves TCP-level HoL blocking, drastically reduces connection latency, and builds in TLS 1.3 encryption natively.",
      "## Simple Mail Transfer Protocol (SMTP) vs. IMAP/POP3\n\n- **SMTP (Port 25/587)**: A 'push' protocol used to send mail from a client to a server, or between servers.\n- **POP3 (Port 110/995)**: A 'pull' protocol that downloads emails to the local client and typically deletes them from the server.\n- **IMAP (Port 143/993)**: A 'pull' protocol that syncs emails across multiple devices, leaving the master copy on the server.",
      "## Representational State Transfer (REST) & APIs\n\nWhile not a protocol itself, REST is an architectural style primarily built on HTTP.\n- Uses standard HTTP methods: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove).\n- Relies on statelessness, caching, and a uniform interface.\n- Alternatives include GraphQL (client-specified precise data fetching) and gRPC (high-performance binary RPC protocol built on HTTP/2 using Protocol Buffers)."
    ],
    interviewTips: [
      "Interviewers frequently ask: 'What happens when you type www.google.com into your browser?' You MUST mention: Browser cache -> OS cache -> Router cache -> DNS resolution -> TCP Handshake -> TLS Handshake -> HTTP GET -> DOM Rendering.",
      "Know the difference between HTTP/1.1, HTTP/2, and HTTP/3. It is a very common systems design / networking question.",
      "Understand why DNS uses UDP for queries but TCP for zone transfers."
    ],
    commonQuestions: [
      "Differentiate between HTTP and HTTPS. At which layer does SSL/TLS operate?",
      "Explain the complete DNS resolution process.",
      "What is Head-of-Line blocking and how does HTTP/2 solve it?",
      "Difference between REST and GraphQL?"
    ],
    companies: ["Cloudflare", "Google", "Akamai", "Cisco", "Amazon"]
  },

  exception: {
    title: "Exception Handling Deep Dive",
    subject: "Object-Oriented Programming",
    readTime: "11 min",
    content: [
      "Exception handling is a powerful mechanism in OOP to handle runtime errors, ensuring the normal flow of an application is maintained even when unexpected events occur. Instead of checking error codes everywhere, exceptions isolate error-handling code from regular business logic.",
      "## The Exception Hierarchy (Java as example)\n\nIn Java, all exceptions inherit from `java.lang.Throwable`:\n1. **Error**: Severe problems the application shouldn't try to catch (e.g., `OutOfMemoryError`, `StackOverflowError`). Usually indicates environmental issues.\n2. **Exception**: Conditions reasonable applications might want to catch.\n   - **Checked Exceptions**: Checked at compile time (e.g., `IOException`, `SQLException`). You *must* handle them or declare them via `throws`.\n   - **Unchecked Exceptions (Runtime Exceptions)**: Not checked at compile time (e.g., `NullPointerException`, `ArrayIndexOutOfBoundsException`). Caused by programming bugs.",
      "## The try-catch-finally Block\n\n- **try**: Houses the code that might throw an exception.\n- **catch**: Catch blocks follow the try block. You can have multiple catch blocks to handle different exceptions specifically. Ensure you order them from most specific to most general (`Exception e` last).\n- **finally**: A block that *always* executes, whether an exception occurs or not. Used to release, close, or free resources (like DB connections or file streams). (Note: `finally` won't run if `System.exit()` is called or the JVM crashes).",
      "## Custom Exceptions\n\nEnterprise applications rarely rely solely on built-in exceptions. You should create custom exceptions extending `RuntimeException` (or `Exception`) to convey business logic failures clearly, such as `UserNotFoundException` or `InsufficientFundsException`.\n\n*Best Practice:* Always include the original `cause` (the exception being wrapped) when throwing a custom exception so the stack trace isn't lost.",
      "## Try-with-Resources (Java 7+)\n\nAn enhancement that eliminates the need for a `finally` block when dealing with closable resources (classes implementing `AutoCloseable`).\n```java\ntry (BufferedReader br = new BufferedReader(new FileReader(path))) {\n    return br.readLine();\n}\n// br is automatically closed here, even if an exception is thrown!\n```"
    ],
    interviewTips: [
      "Interviewers frequently ask about the difference between final, finally, and finalize in Java. Know all three distinct meanings.",
      "Be prepared to explain why modern developers prefer Unchecked (Runtime) exceptions over Checked exceptions (they reduce boilerplate and avoid the 'catch-and-ignore' anti-pattern).",
      "Explain Try-with-Resources to show you are up-to-date with modern Language specific features."
    ],
    commonQuestions: [
      "What is the difference between Checked and Unchecked Exceptions?",
      "Does the finally block always execute? (Mention the System.exit() edge case).",
      "Difference between throw and throws?",
      "What is exception chaining and why is it useful?"
    ],
    companies: ["Oracle", "IBM", "Infosys", "Apple", "Uber"]
  },

  virtual_memory: {
    title: "Virtual Memory & Thrashing Deep Dive",
    subject: "Operating Systems",
    readTime: "12 min",
    content: [
      "Virtual Memory gives the illusion of a contiguous address space that is substantially larger than the available physical memory. It separates user logical memory from physical memory.",
      "## Paging and Page Faults\n\nWhen a program tries to access a page mapped in its address space but not loaded in physical RAM, a **Page Fault** occurs. The OS must then:\n1. Trap into the OS.\n2. Save the user registers and process state.\n3. Determine that the interrupt was a page fault.\n4. Check that the memory reference was legal.\n5. Wait for the disk read to fetch the page into a free frame.\n6. Update the page table to show the page is now in memory.\n7. Restart the instruction that was interrupted.",
      "## Page Replacement Algorithms\n\nWhen RAM is full, the OS must swap out an old page. Key algorithms:\n- **FIFO**: Simplest, but suffers from Belady's Anomaly (more frames can lead to *more* page faults).\n- **Optimal (OPT)**: Replaces the page that will not be used for the longest period of time (impossible to implement, used as a benchmark).\n- **LRU (Least Recently Used)**: Great performance but expensive to implement purely (requires hardware counters).\n- **Clock / Second-Chance**: A realistic approximation of LRU using a reference bit.",
      "## Thrashing\n\nThrashing occurs when a computer's virtual memory subsystem is in a constant state of paging. The CPU spends more time swapping pages in and out of the disk than executing application-level instructions.\n- **Cause**: High degree of multiprogramming. Processes do not have enough frames to hold their 'working set'.\n- **Prevention**: Working Set Model (tracking dynamically the set of pages a process is actively using) and Page-Fault Frequency controls (adjusting frame allocation based on fault rate)."
    ],
    interviewTips: [
      "Understand Belady's Anomaly perfectly. It is the classic gotcha question for FIFO page replacement.",
      "When asked about LRU implementation, mention the Clock algorithm as the practical hardware approximation.",
      "Be prepared to calculate the Effective Access Time (EAT) given a page fault rate."
    ],
    commonQuestions: [
      "What is a Page Fault and how does the OS handle it?",
      "Explain Belady's Anomaly.",
      "What is thrashing and how does the Working Set Model prevent it?",
      "Compare FIFO, LRU, and Optimal page replacement algorithms."
    ],
    companies: ["Amazon", "Microsoft", "Google", "VMware", "Apple"]
  },

  file_systems: {
    title: "File Systems & I/O Deep Dive",
    subject: "Operating Systems",
    readTime: "10 min",
    content: [
      "A File System is a method of storing and organizing data on storage devices. It provides an abstract view of files and directories on top of raw storage blocks.",
      "## File Allocation Methods\n\n1. **Contiguous Allocation**: Each file occupies a set of contiguous blocks on the disk. Great for sequential access, terrible for external fragmentation.\n2. **Linked Allocation**: Each file is a linked list of disk blocks. No external fragmentation, but poor random access performance (must traverse the list).\n3. **Indexed Allocation**: Brings all pointers together into ONE index block. Direct access is fast, but storing the index block has overhead. Used heavily in real OS (Unix Inodes).",
      "## Unix Inodes\n\nAn inode (index node) is a data structure in Unix file systems that stores all metadata about a file (except its name, which is stored in the directory). It includes pointers to data blocks. For large files, it uses indirect, double-indirect, and triple-indirect pointers to achieve massive scale.",
      "## I/O Subsystem\n\n- **Polling (Busy Wait)**: CPU loops repeatedly checking if the device is ready. Wastes CPU cycles.\n- **Interrupt-Driven I/O**: Device triggers an interrupt when ready. CPU stops current work, handles I/O, then resumes.\n- **DMA (Direct Memory Access)**: A special controller transfers blocks of data directly between memory and peripherals without CPU involvement, massively increasing throughput."
    ],
    interviewTips: [
      "Inodes are frequently tested. Know the difference between direct and indirect pointers.",
      "Always connect DMA to performance. Polling = slow/wasteful; DMA = required for modern systems.",
      "Differentiate between internal fragmentation (wasted space inside a block) and external fragmentation (free space is scattered across blocks)."
    ],
    commonQuestions: [
      "What is an Inode in Unix?",
      "Explain the differences between Contiguous, Linked, and Indexed file allocation.",
      "How does Direct Memory Access (DMA) work?",
      "What is the difference between internal and external fragmentation?"
    ],
    companies: ["Google", "Microsoft", "Apple", "Samsung", "NetApp"]
  },

  cpu_caching: {
    title: "CPU Caching & TLB",
    subject: "Operating Systems",
    readTime: "9 min",
    content: [
      "Caching leverages the principle of Locality of Reference (Spatial and Temporal) to hide the immense latency of accessing main memory.",
      "## Translation Lookaside Buffer (TLB)\n\nThe TLB is an ultra-fast hardware cache managed by the MMU (Memory Management Unit) that stores recent derivations of virtual page numbers to physical frame numbers.\n- **TLB Hit**: OS skips the page table entirely. Memory access is fast.\n- **TLB Miss**: OS must do a page walk down the page table in RAM. Slower.\n- **Flush**: During a context switch, the TLB is completely flushed because the new process has a completely different virtual-to-physical mapping.",
      "## Cache Levels\n\n- **L1 Cache**: Smallest, fastest, split into Instruction and Data caches. Per core.\n- **L2 Cache**: Larger, slightly slower. Usually per core, sometimes shared.\n- **L3 Cache**: Largest CPU cache, slower, shared across all cores.\n- Cache lines (blocks) are typically 64 bytes natively.",
      "## Cache Coherence\n\nIn multi-core systems, if two cores hold the same memory block in their L1 caches and one modifies it, the other has stale data. The **MESI Protocol** (Modified, Exclusive, Shared, Invalid) snoops the bus to ensure consistency across all core caches."
    ],
    interviewTips: [
      "The term 'Locality of Reference' is the magic phrase for caching questions.",
      "Understand what flushing the TLB means for context-switch overhead.",
      "If asked about multi-threaded performance bottlenecks, mention Cache Coherence and False Sharing."
    ],
    commonQuestions: [
      "What is a TLB and why is it necessary?",
      "Explain Locality of Reference (Spatial vs Temporal).",
      "What happens to the TLB on a context switch?",
      "Explain the cache coherence problem in multi-core systems."
    ],
    companies: ["NVIDIA", "Intel", "Apple", "Google", "AMD"]
  },

  ipc_advanced: {
    title: "Advanced Inter-Process Communication",
    subject: "Operating Systems",
    readTime: "10 min",
    content: [
      "While basics of IPC (Pipes, Shared Memory) are well-known, advanced production systems rely on specialized mechanisms for scale.",
      "## Unix Domain Sockets vs Network Sockets\n\n- **Network Sockets (TCP/UDP)**: Traverse the entire network stack, useful for distributed processes.\n- **Unix Domain Sockets**: Local to the machine. They completely bypass the TCP/IP stack (no checksums, no packet drops), providing massive throughput gains for processes communicating on the same physical server.",
      "## Message Queues\n\nOS-level message queues (like POSIX MQ or System V MQ) allow async messaging between processes. Unlike pipes (byte streams), message queues allow processes to read/write discrete 'messages', often with priorities.",
      "## Condition Variables & Spurious Wakeups\n\nWhen a thread waits on a condition variable, the OS puts it to sleep. However, threads can wake up even if the condition is not met (a **spurious wakeup**). Thus, `wait()` must ALWAYS be placed inside a `while` loop that checks the condition, NEVER inside a simple `if` statement."
    ],
    interviewTips: [
      "If asked how to optimize localhost communication, immediately suggest Unix Domain Sockets over TCP Sockets.",
      "The 'spurious wakeup' question tests if you've actually written production C/C++/Java threaded code.",
      "Know that shared memory is the fastest IPC, but it shifts the synchronization burden entirely to the application layer."
    ],
    commonQuestions: [
      "Why use Unix Domain Sockets instead of normal TCP sockets for local processes?",
      "What is a spurious wakeup?",
      "Why must condition variable wait operations be in a while loop?",
      "Compare the synchronization required for Shared Memory vs Message Passing."
    ],
    companies: ["Microsoft", "Oracle", "IBM", "Red Hat", "Cisco"]
  },

  bankers: {
    title: "Banker's Algorithm & Deadlock Avoidance",
    subject: "Operating Systems",
    readTime: "8 min",
    content: [
      "There are four conditions for deadlock: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Deadlock *Avoidance* requires the OS to predict deadlocks before granting resources.",
      "## The Banker's Algorithm\n\nDeveloped by Edsger Dijkstra, this algorithm simulates the allocation of resources to ensure the system remains in a 'safe state'.\n\n1. **Data Structures needed**: Max (maximum instances each process might need), Allocation (instances currently allocated), Need (Max - Allocation), and Available (current unallocated instances).\n2. **Safe State check**: The system searches for a sequence of processes such that each process can satisfy its 'Need' with the current 'Available' instances plus the instances released by earlier processes in the sequence.\n3. **Allocation Request**: When a process requests resources, the OS temporarily pretends to allocate them and runs the Safe State check. If the state is safe, it grants the request. If unsafe, the process must wait.",
      "## Drawbacks of Banker's Algorithm\n\nWhile theoretically brilliant, it is rarely used in real modern operating systems (like Linux/Windows) because:\n- Processes rarely know their maximum resource needs in advance.\n- The number of processes and resources changes dynamically.\n- Running an O(m * n^2) algorithm for every resource request is massive overhead."
    ],
    interviewTips: [
      "Always know the four necessary conditions for deadlock (Coffman conditions). Break any one of them, and deadlocks are impossible.",
      "Understand why most OS use Deadlock Ignorance (the Ostrich Algorithm) instead of Banker's Algorithm for regular resources.",
      "Be prepared to trace a simple Banker's Algorithm problem given a matrix of Allocation and Max arrays."
    ],
    commonQuestions: [
      "What are the four necessary conditions for a deadlock?",
      "Explain how the Banker's Algorithm prevents deadlocks.",
      "Why is the Banker's Algorithm rarely used purely in modern OS?",
      "Differentiate between Deadlock Prevention, Avoidance, and Detection."
    ],
    companies: ["Amazon", "Google", "Samsung", "Qualcomm", "Meta"]
  },

  disk_scheduling: {
    title: "Disk Scheduling Algorithms",
    subject: "Operating Systems",
    readTime: "8 min",
    content: [
      "For hard disk drives (HDDs), mechanical seek time—moving the disk head to the correct track—dominates performance. Disk scheduling algorithms order I/O requests to minimize total seek time.",
      "## Common Scheduling Algorithms\n\n- **FCFS (First-Come, First-Served)**: Fair, but absolutely terrible for performance. Causes WILD swings across the disk.\n- **SSTF (Shortest Seek Time First)**: Always chooses the request closest to the current head position. Great throughput, but can easily starve distant requests.\n- **SCAN (Elevator Algorithm)**: The head moves continuously in one direction sweeping across the disk solving requests, then reverses direction at the edge.\n- **C-SCAN (Circular SCAN)**: Moves in one direction. When it hits the end, it immediately jumps back to the beginning without servicing requests on the return trip. Provides more uniform wait times than SCAN.\n- **LOOK / C-LOOK**: Similar to SCAN/C-SCAN but the head stops reversing at the LAST request rather than going all the way to the absolute physical edge of the disk.",
      "## Modern Storage (SSDs)\n\nSolid State Drives have no moving parts. Thus, seek time is zero. Disk scheduling algorithms like C-SCAN are irrelevant for SSDs. Instead, SSD controllers focus on Wear Leveling (distributing writes evenly across cells so they don't degrade unevenly) and Garbage Collection (TRIM)."
    ],
    interviewTips: [
      "SSTF causes starvation. SCAN/C-SCAN solve starvation. This is the core trade-off.",
      "If an interviewer asks how to schedule requests on an SSD, point out that mechanical algorithms don't apply and highlight Wear Leveling instead.",
      "Most OSes default to a variation of C-LOOK or a highly advanced completely fair queueing (CFQ) algorithm for spinning drives."
    ],
    commonQuestions: [
      "Explain how the Elevator Algorithm (SCAN) works.",
      "Why does SSTF cause starvation?",
      "What is the difference between SCAN and C-SCAN?",
      "Do disk scheduling algorithms apply to SSDs? Why or why not?"
    ],
    companies: ["Microsoft", "NetApp", "Western Digital", "Seagate", "IBM"]
  },

  locks_advanced: {
    title: "Mutex vs Semaphore vs Spinlock",
    subject: "Operating Systems",
    readTime: "11 min",
    content: [
      "Choosing the right synchronization primitive is critical for highly concurrent architecture.",
      "## Spinlocks\n\nWhen a thread fails to acquire a Spinlock, it heavily spins in a `while` loop (busy-waiting) rechecking the lock.\n- **Pros**: Zero context-switching overhead. Ultra-fast if the lock is held for only microseconds.\n- **Cons**: Burns 100% of a CPU core doing nothing. Terrible for long critical sections.\n- **Usage**: Only used in multi-core hardware close to the kernel level where locks are held very briefly.",
      "## Mutex (Mutual Exclusion)\n\nWhen a thread fails to acquire a Mutex, the OS puts the thread to sleep (blocks it) and schedules another thread.\n- **Pros**: Doesn't waste CPU cycles spinning.\n- **Cons**: Putting a thread to sleep and waking it up (context switching) is expensive.\n- **Usage**: The standard choice for user-space app logic and long critical sections.\n- **Hybrids**: Modern OSes use a '2-phase' mutex: it acts as a spinlock for a few attempts, and if it still fails, it puts the thread to sleep.",
      "## Semaphores\n\nA signaling mechanism using an integer counter.\n- **Binary Semaphore**: Can be 0 or 1. Functionally identical to a Mutex, BUT a Mutex has 'ownership' (only the thread that locked it can unlock it). Binary semaphores lack ownership (Thread A can lock, Thread B can unlock), which is useful for signaling.\n- **Counting Semaphore**: Used to track limited resources (e.g., allow exactly 5 database connections). `wait()` decreases the counter. `signal()` increases it. If 0, threads block."
    ],
    interviewTips: [
      "The exact difference between a Mutex and a Binary Semaphore is 'Ownership'. Always emphasize this.",
      "Know when NOT to use a Spinlock: On a single-core machine, a Spinlock guarantees deadlock if the lock holder is preempted.",
      "Explain the two-phase hybrid lock—this blows interviewers away."
    ],
    commonQuestions: [
      "If a Mutex and a Binary Semaphore both use 0 and 1, what is the difference?",
      "When is a Spinlock preferable to a Mutex?",
      "What happens if you use a Spinlock on a strictly single-core system?",
      "Write pseudocode to enforce a maximum of 10 concurrent requests to a service."
    ],
    companies: ["Google", "Amazon", "Apple", "Uber", "Trading Firms"]
  },

  sharding: {
    title: "Database Sharding & Partitioning",
    subject: "Database Management",
    readTime: "11 min",
    content: [
      "When a single database server can no longer handle the read/write load or store the sheer volume of data, we must scale horizontally. Partitioning and Sharding are the primary techniques for this.",
      "## Vertical vs Horizontal Partitioning\n\n- **Vertical Partitioning**: Splitting a table by columns. Example: Moving a massive `user_bio` text column to a separate table on a different disk to speed up queries on the main `users` table.\n- **Horizontal Partitioning**: Splitting a table by rows. Example: Storing users with IDs 1-1M in Partition A, and 1M-2M in Partition B. The schema remains identical across partitions.",
      "## Sharding\n\nSharding is Horizontal Partitioning distributed across multiple disparate physical databases (nodes). Each node is a 'shard'.\n- **Algorithmic Sharding (Hash Sharding)**: Uses a hash function on a Shard Key (e.g., `hash(user_id) % num_shards`) to determine the node. Distributes data evenly but makes adding new shards a nightmare (requires massive data rebalancing). Consistent Hashing solves this.\n- **Dynamic Sharding (Directory Based)**: A lookup service (like ZooKeeper) tracks which shard holds which data. Slower due to the lookup step, but highly flexible.\n- **Geo-Sharding**: Data is sharded by physical location (e.g., EU users on EU servers) to comply with data sovereignty laws (GDPR) and reduce latency.",
      "## The Celebrity Problem (Hotspots)\n\nA major pitfall in sharding. If you shard a social network by `user_id`, a massive celebrity (like Elon Musk) will receive millions of hits on a single shard, overwhelming it while other shards remain idle. This is called a Hotspot."
    ],
    interviewTips: [
      "Always clarify the difference between Partitioning (logical splitting on one machine) and Sharding (physical splitting across machines).",
      "Consistent Hashing is the gold standard answer when asked 'How do you add a new database node without taking the system down?'.",
      "Mention the 'Celebrity Problem' or 'Hot Keys' proactively to show deep systems design knowledge."
    ],
    commonQuestions: [
      "What is the difference between vertical and horizontal partitioning?",
      "Explain the pros and cons of Hash-based Sharding.",
      "What is a Database Hotspot and how do you resolve it?",
      "How does Consistent Hashing minimize data movement when a shard is added or removed?"
    ],
    companies: ["Meta", "Uber", "Netflix", "Twitter", "Amazon"]
  },

  replication: {
    title: "Distributed Databases & Replication",
    subject: "Database Management",
    readTime: "10 min",
    content: [
      "Replication involves storing copies of data on multiple nodes to ensure high availability, fault tolerance, and reduced latency.",
      "## Leader-Follower (Master-Slave) Replication\n\nOne node is designated as the Leader (Master). It handles all WRITE requests. The followers (slaves) replicate the leader's data and handle READ requests.\n- **Synchronous Replication**: The leader waits for followers to confirm they have written the data before responding to the client. Highly consistent but slow. If a follower crashes, the leader blocks.\n- **Asynchronous Replication**: The leader responds to the client immediately and sends logs to followers in the background. Fast, but if the leader crashes before logs are sent, data is permanently lost.",
      "## Multi-Leader & Leaderless\n\n- **Multi-Leader**: Multiple nodes can accept writes, replicating to each other. Great for multi-datacenter setups but requires complex conflict resolution (e.g., two users editing the same document simultaneously).\n- **Leaderless (e.g., Cassandra)**: Any replica can accept writes. Uses Quorum consensus (W + R > N) to guarantee consistency. Relies on Vector Clocks or Last-Write-Wins (LWW) to resolve conflicts.",
      "## The Replication Lag\n\nIn async Leader-Follower setups, there is a delay between a write hitting the leader and it reaching the follower. This causes 'Read-After-Write' anomalies (a user updates their profile, reloads the page hitting a follower, and sees old data). Fixed by routing reads for a user's *own* data explicitly to the leader for a short time after a write."
    ],
    interviewTips: [
      "Master-Slave is considered legacy terminology; actively use Leader-Follower in interviews.",
      "Replication lag is a massive real-world problem. Knowing how to solve Read-After-Write anomalies is a senior-level signal.",
      "For Leaderless setups, be ready to explain what W, R, and N mean in Quorum configurations."
    ],
    commonQuestions: [
      "Compare Synchronous vs Asynchronous replication.",
      "What is replication lag and how do you mitigate Read-After-Write anomalies?",
      "Explain Quorum (W + R > N) in a Leaderless database.",
      "How are conflicts resolved in a Multi-Leader architecture?"
    ],
    companies: ["Google", "Amazon", "Datadog", "Stripe", "MongoDB"]
  },

  relational_algebra: {
    title: "Relational Algebra & Calculus",
    subject: "Database Management",
    readTime: "9 min",
    content: [
      "Relational algebra is the procedural mathematical foundation of SQL. It provides a formal framework for relational query optimization.",
      "## Fundamental Operations\n\n1. **Selection (σ)**: Filters rows based on a predicate (Equivalent to SQL `WHERE`).\n2. **Projection (π)**: Selects specific columns and discards others. Automatically removes duplicates (Equivalent to SQL `SELECT DISTINCT`).\n3. **Union (∪)**: Combines results of two relations (SQL `UNION`). Relations must be union-compatible (same schema).\n4. **Set Difference (-)**: Tuples in relation A but not in B (SQL `EXCEPT`).\n5. **Cartesian Product (×)**: Combines every tuple in A with every tuple in B (SQL `CROSS JOIN`).\n6. **Rename (ρ)**: Renames relations or attributes (SQL `AS`).",
      "## Derived Operations\n\n- **Natural Join (⋈)**: A Cartesian product followed by a selection on equating attributes with the same name, followed by a projection to remove duplicate columns.\n- **Intersection (∩)**: Tuples in both A and B (SQL `INTERSECT`). Can be derived using set difference: A - (A - B).",
      "## Relational Calculus\n\nUnlike Algebra (which is procedural—how to get data), Calculus is declarative (what data to get). It comes in two forms:\n- **Tuple Relational Calculus (TRC)**: Variables represent tuples (rows).\n- **Domain Relational Calculus (DRC)**: Variables represent domain values (columns)."
    ],
    interviewTips: [
      "This topic is heavily tested in GATE and university compiler/DB design exams, though less common in pure software engineering interviews.",
      "Always remember that Projection (π) in relational algebra intrinsically removes duplicates because relations are mathematical sets, unlike SQL SELECT which retains them unless DISTINCT is used.",
      "Be able to translate complex SQL queries into Relational Algebra expressions."
    ],
    commonQuestions: [
      "Translate `SELECT name FROM users WHERE age > 18` into Relational Algebra.",
      "What is meant by Union Compatibility?",
      "Explain the fundamental difference between Relational Algebra and Relational Calculus.",
      "How is a Natural Join derived from fundamental operations?"
    ],
    companies: ["Oracle", "IBM", "Microsoft", "SAP"]
  },

  concurrency_anomalies: {
    title: "Concurrency Anomalies Deep Dive",
    subject: "Database Management",
    readTime: "10 min",
    content: [
      "When isolation levels are lowered to improve performance, concurrent transactions can interleave destructively, causing severe data anomalies.",
      "## The Four Major Anomalies\n\n1. **Dirty Read**: Transaction A reads data written by Transaction B *before* B has committed. If B rolls back, A operates on data that technically never existed.\n2. **Non-Repeatable Read (Fuzzy Read)**: Transaction A reads a row. Transaction B overwrites that row and commits. Transaction A re-reads the row and gets a different value.\n3. **Phantom Read**: Transaction A executes a range query (e.g., `SELECT * WHERE age > 20`). Transaction B inserts a new row matching that range and commits. Transaction A executes the same query again and sees a 'phantom' row.\n4. **Lost Update**: Transaction A and B both read the same row. A updates it. B updates it based on the old read, overwriting A's update. (Often mitigated by `SELECT ... FOR UPDATE`).",
      "## Isolation Levels & Trade-offs\n\n- **Read Uncommitted**: Fastest. Suffers from all anomalies. Rarely used.\n- **Read Committed**: Blocks Dirty Reads. Default in Postgres/SQL Server. Still suffers from non-repeatable and phantom reads.\n- **Repeatable Read**: Blocks Dirty and Non-Repeatable reads. Default in MySQL InnoDB. Suffers from phantom reads (though InnoDB mostly prevents them using Next-Key locks).\n- **Serializable**: Slowest. Blocks all anomalies. Requires aggressive locking or strict MVCC validation, crippling concurrent throughput."
    ],
    interviewTips: [
      "You must be able to recite the four anomalies and the specific isolation level that prevents each.",
      "Dirty Read is the easiest to explain; use an ATM money-transfer analogy.",
      "Distinguish between Non-Repeatable Read (a specific row data changed) and Phantom Read (the set of rows in a range query changed)."
    ],
    commonQuestions: [
      "Define Dirty Read, Non-Repeatable Read, and Phantom Read.",
      "What is the default isolation level in MySQL, and what anomalies does it permit?",
      "How does a database implement the Serializable isolation level?",
      "What is a Lost Update and how does pessimistic locking prevent it?"
    ],
    companies: ["Stripe", "Square", "PayPal", "Amazon", "Goldman Sachs"]
  },

  wal_recovery: {
    title: "WAL & Crash Recovery Mechanisms",
    subject: "Database Management",
    readTime: "9 min",
    content: [
      "Ensuring Durability (the 'D' in ACID) means handling power loss, kernel panics, or hardware crashes without losing committed data. Write-Ahead Logging is the industry standard solution.",
      "## Write-Ahead Logging (WAL)\n\nThe golden rule of WAL: The log record representing an update MUST be flushed to persistent storage before the corresponding data page in memory is flushed to disk.\n- When a commit happens, the DB only guarantees writing a small sequential log entry to disk (which is extremely fast), NOT writing the random data pages across the B-Tree.\n- The actual data pages (Buffer Pool) are flushed to disk lazily in the background.",
      "## ARIES Recovery Algorithm\n\nARIES (Algorithm for Recovery and Isolation Exploiting Semantics) is the standard crash recovery protocol using WAL. It has three phases upon reboot after a crash:\n1. **Analysis Phase**: Scans the WAL forward from the last checkpoint to identify which transactions were active at the time of the crash.\n2. **REDO Phase**: Scans the WAL forward, reapplying *all* operations (even those from uncommitted transactions) to bring the database exactly back to the physical state it was in at the time of the crash.\n3. **UNDO Phase**: Scans the WAL backwards, rolling back all operations of transactions that were active (uncommitted) at the time of the crash."
    ],
    interviewTips: [
      "WAL is a favorite topic in Systems Design when discussing how to build a reliable key-value store or logging system.",
      "Always emphasize the performance benefit: sequential I/O (appending to WAL) is orders of magnitude faster than random I/O (updating a B+ Tree node), which is why WAL exists.",
      "For ARIES, remember the acronym: Analysis, Redo, Undo (ARU)."
    ],
    commonQuestions: [
      "What is Write-Ahead Logging and why is it crucial for database durability?",
      "Explain why appending to a log is faster than updating the database directly.",
      "What are the three phases of the ARIES recovery algorithm?",
      "If a transaction commits but the exact data page is never flushed to disk before a crash, how is the data recovered?"
    ],
    companies: ["MongoDB", "Oracle", "Microsoft", "Datadog", "Snowflake"]
  },

  query_optimization: {
    title: "Query Optimization & Execution Plans",
    subject: "Database Management",
    readTime: "11 min",
    content: [
      "Databases receive declarative SQL (telling it *what* to get) and must convert it into procedural execution plans (telling it *how* to get it). The Query Optimizer performs this magic.",
      "## Rule-Based vs Cost-Based Optimization\n\n- **Rule-Based Optimizer (RBO)**: Uses hardcoded heuristics (e.g., 'always use an index over a full table scan'). Fast but naive. Mostly obsolete.\n- **Cost-Based Optimizer (CBO)**: The modern standard. Computes multiple possible execution plans and estimates their cost (disk I/O, CPU, memory) using database statistics, picking the cheapest one.",
      "## Database Statistics\n\nFor CBO to work, the DB maintains statistics about tables: row counts, distinct values (cardinality), and data distribution (histograms). If statistics are outdated, the optimizer makes terrible decisions (e.g., scanning a 10M row table instead of using an index). Running `ANALYZE` (Postgres) or `UPDATE STATISTICS` updates these.",
      "## Execution Plan Operators\n\nYou MUST read `EXPLAIN` or `EXPLAIN ANALYZE` outputs to debug slow queries. Key operators:\n- **Seq Scan (Full Table Scan)**: Reads every row. Bad for large tables, but actually *faster* than an index scan if reading > 20% of the table due to sequential I/O.\n- **Index Scan**: Traverses the B-Tree index, then fetches the row from the heap.\n- **Index Only Scan**: Traverses the index and finds ALL required columns right there. No heap fetch needed. Extremely fast.\n- **Nested Loop Join**: For every row in A, scan B. O(A * B). Terrible for large tables.\n- **Hash Join**: Hashes table A into memory, probes with table B. O(A + B). Excellent for large, unsorted sets."
    ],
    interviewTips: [
      "If asked how to optimize a slow query, ALWAYS start your answer with 'I would run EXPLAIN ANALYZE to view the execution plan.' Interviewers want to hear this methodology.",
      "Know the difference between an Index Scan and an Index Only Scan. (Covering Indexes make Index Only Scans possible).",
      "Understand why a database might INTENTIONALLY ignore an index and do a full table scan."
    ],
    commonQuestions: [
      "What is a Cost-Based Optimizer?",
      "Why is an EXPLAIN ANALYZE command useful?",
      "Under what circumstances will a database ignore an index?",
      "Compare a Nested Loop Join to a Hash Join."
    ],
    companies: ["Google", "Amazon", "Uber", "Shopify", "DataBricks"]
  },

  cap_pacelc: {
    title: "CAP & PACELC Theorems",
    subject: "Database Management",
    readTime: "10 min",
    content: [
      "Understanding the theoretically unbreakable limits of distributed data stores ensures you choose the right database for the right job.",
      "## The CAP Theorem limit\n\nA distributed system can guarantee at most two of the following:\n- **Consistency (C)**: Every read sees the latest write.\n- **Availability (A)**: Every request gets a non-error response (though it might be stale data).\n- **Partition Tolerance (P)**: The system works even if the network drops messages between nodes.\n\n*Reality Check*: Network partitions (P) WILL happen (switches fail, cables are cut). Thus, you don't choose two out of three. You MUST choose P, and then decide between C (CP system) or A (AP system) during a failure.",
      "## PACELC Theorem (The Extension)\n\nCAP is limited because it only describes what happens *during a partition*. PACELC explains what happens during normal operation.\nIt states:\n**IF** there is a **P**artition, trade off between **A**vailability and **C**onsistency (CAP).\n**E**lse (operating normally), trade off between **L**atency and **C**onsistency.\n\n- Example: A dynamo-style database (Cassandra) is often **PA/EL**: If Partitioned, it chooses Availability. Else, it chooses lower Latency over strong Consistency.\n- Example: A rigid relational cluster (Postgres Cluster) is often **PC/EC**: If Partitioned, it locks databases down to preserve Consistency. Else, it forces slow synchronous replication to maintain strong Consistency.",
      "## Consistency Models\n\n- **Strong Consistency**: Linearizable. Reads always see the latest write. High latency.\n- **Eventual Consistency**: Given enough time without new writes, all replicas will converge. Low latency.\n- **Read-Your-Writes**: A hybrid where a user is guaranteed to immediately see their own updates, but others might see stale data for a while."
    ],
    interviewTips: [
      "Bringing up PACELC when asked about CAP immediately flags you as a Senior/Staff-level candidate. Most resources stop at CAP.",
      "Know how to categorize popular databases: MongoDB is CP, Cassandra is AP, pure RDBMS is CA (on a single machine) or CP (distributed).",
      "Be ready to architect around Eventual Consistency (e.g., handling Amazon shopping cart conflicts)."
    ],
    commonQuestions: [
      "Explain the CAP theorem and why you essentially only choose between Consistency and Availability.",
      "What is the PACELC theorem?",
      "How would you categorize DynamoDB under CAP?",
      "Explain the trade-off between Latency and Consistency in a distributed system."
    ],
    companies: ["Netflix", "Amazon", "Discord", "Twitch", "Meta"]
  },

  subnetting: {
    title: "Subnetting & CIDR",
    subject: "Computer Networks",
    readTime: "11 min",
    content: [
      "Subnetting is the practice of dividing a single large network into multiple smaller, logical sub-networks (subnets). It improves routing efficiency, enhances security, and reduces broadcast domain sizes.",
      "## Classful Routing vs CIDR\n\n- **Classful Routing (Legacy)**: IPs were strictly divided into Class A (/8), Class B (/16), and Class C (/24). It resulted in massive IP address waste (e.g., a company needing 300 IPs had to buy a Class B block of 65,534 IPs).\n- **CIDR (Classless Inter-Domain Routing)**: Replaced Classful routing. Uses a suffix (e.g., `/26`) indicating exactly how many bits are used for the Network ID, allowing fine-grained allocation.",
      "## The Subnet Mask\n\nA 32-bit number that masks an IP address to divide it into Network Address and Host Address.\n- A `/24` mask means the first 24 bits are network, the last 8 are host. (e.g., `255.255.255.0`).\n- Finding the Network ID: Perform a bitwise AND between the IP Address and the Subnet Mask.\n- Finding the Broadcast ID: Set all host bits to `1`.",
      "## Calculating Subnets\n\nGiven `192.168.1.0/24` and needing 4 subnets:\n1. We need 2 borrowed bits ($2^2 = 4$).\n2. The new mask is `/26` (`255.255.255.192`).\n3. Outstanding host bits: 6. Total hosts per subnet: $2^6 - 2 = 62$ usable IPs (subtracting the Network ID and Broadcast ID)."
    ],
    interviewTips: [
      "You will 100% be asked to calculate the number of usable hosts in a /X network. The formula is always 2^(32 - X) - 2.",
      "Don't forget to subtract 2 for usable hosts (Network ID and Broadcast ID).",
      "Understand the bitwise AND logic; it shows a fundamental grasp of how routers actually parse IPs in hardware."
    ],
    commonQuestions: [
      "How many usable IP addresses are in a /28 subnet?",
      "Why do we subtract 2 when calculating usable hosts in a subnet?",
      "Explain the difference between Classful routing and CIDR.",
      "Given an IP and a Subnet mask, calculate the Network ID."
    ],
    companies: ["Cisco", "Amazon", "Juniper", "Cloudflare", "Akamai"]
  },

  tls_ssl: {
    title: "Transport Layer Security (TLS)",
    subject: "Computer Networks",
    readTime: "10 min",
    content: [
      "TLS (formerly SSL) encrypts internet traffic to ensure Privacy, Integrity, and Authentication. It operates logically between the Transport and Application layers.",
      "## Symmetric vs Asymmetric Encryption\n\n- **Asymmetric**: Uses a Public Key (to encrypt) and a Private Key (to decrypt). Extremely secure but computationally slow. Used during the TLS Handshake.\n- **Symmetric**: Uses a single shared key for both encryption and decryption. Very fast. Used for the actual data transfer.\n- **TLS Combines Both**: TLS uses Asymmetric encryption to securely agree upon a Symmetric session key, which is then used to encrypt the HTTP data.",
      "## The TLS 1.2 Handshake\n\n1. **ClientHello**: Client sends supported cypher suites and a random byte string.\n2. **ServerHello**: Server chooses the cypher, sends its Digital Certificate (containing its public key) and its own random bytes.\n3. **Authentication**: Client verifies the Certificate against its trusted root CAs.\n4. **Premaster Secret**: Client generates another random string, encrypts it with the Server's Public Key, and sends it. Only the server can decrypt it with its Private Key.\n5. **Session Keys**: Both sides independently use the random strings and Premaster Secret to generate the precise same Symmetric Session Key.\n6. **Ready**: Encrypted data flows.",
      "## TLS 1.3 Improvements\n\nTLS 1.3 reduced the handshake from 2 Round Trips (2-RTT) to 1-RTT, dramatically speeding up connection times. It also removed obsolete, insecure cypher suites."
    ],
    interviewTips: [
      "Know why TLS uses BOTH symmetric and asymmetric encryption (Asymmetric for secure key exchange, Symmetric for raw performance).",
      "Understand the role of a Certificate Authority (CA) in verifying identity to prevent Man-In-The-Middle attacks.",
      "When comparing TLS 1.2 to 1.3, specifically cite the '1-RTT' latency improvement."
    ],
    commonQuestions: [
      "Explain the TLS Handshake step-by-step.",
      "What is the difference between Symmetric and Asymmetric encryption?",
      "How does a browser verify that a server's SSL certificate is valid?",
      "What is a Man-In-The-Middle attack and how does TLS prevent it?"
    ],
    companies: ["Cloudflare", "Google", "Stripe", "Apple", "Palo Alto Networks"]
  },

  bgp_advanced: {
    title: "BGP & Inter-Domain Routing",
    subject: "Computer Networks",
    readTime: "10 min",
    content: [
      "The Border Gateway Protocol (BGP) is the routing protocol that glues the entire Internet together. It routes data between Autonomous Systems (AS).",
      "## IGP vs EGP\n\n- **Interior Gateway Protocols (IGP)**: Route traffic *inside* a single organization's network. Examples: OSPF, EIGRP, RIP. They strictly optimize for performance/speed.\n- **Exterior Gateway Protocols (EGP)**: Route traffic *between* massive autonomous systems (ISPs, Tech Giants). BGP is the only EGP in use. It optimizes for Business Logic and Policy, not just speed.",
      "## BGP Path Vector Mechanism\n\nUnlike OSPF which uses Dijkstra algorithms based on link cost, BGP is a Path Vector protocol. It announces entire paths (a list of AS Numbers) to reach a prefix. If an AS sees its own ASN in a received path, it rejects it, making BGP inherently loop-free.",
      "## Routing Policies and Peering\n\nBecause BGP controls the internet, it is dictated by money:\n- **Transit Relationships**: A smaller network pays a larger Tier-1 ISP to carry its traffic to the global internet.\n- **Peering Relationships**: Two networks of similar size agree to exchange traffic for free to save transit costs.\n- BGP allows network admins to say 'Route my traffic through ISP-A, but if it fails, use ISP-B, and NEVER route my traffic through Country C.'"
    ],
    interviewTips: [
      "The distinguishing feature of BGP is that it uses 'Policy-based routing' instead of metric-based shortest-path routing.",
      "Understand what an AS (Autonomous System) is: A network or group of networks under a single administrative domain (like Google or Comcast).",
      "BGP Hijacking (where a rogue AS announces it owns Google's IPs) is a great topic to bring up to show advanced knowledge."
    ],
    commonQuestions: [
      "What is the difference between OSPF and BGP?",
      "Explain how BGP prevents routing loops.",
      "What is an Autonomous System?",
      "Why does BGP prioritize policy over routing speed?"
    ],
    companies: ["Cisco", "Juniper", "Arista", "Meta", "Amazon AWS"]
  },

  nat_pat: {
    title: "NAT & Port Address Translation",
    subject: "Computer Networks",
    readTime: "8 min",
    content: [
      "Network Address Translation (NAT) maps private, non-routable IP addresses to a public IP address before packets are transferred to the global internet. It is the only reason IPv4 hasn't completely collapsed from exhaustion.",
      "## Private IP Ranges\n\nDefined by RFC 1918, these IPs are completely ignored by internet routers. Every home/office uses them internally:\n- Class A: `10.0.0.0` to `10.255.255.255`\n- Class B: `172.16.0.0` to `172.31.255.255`\n- Class C: `192.168.0.0` to `192.168.255.255`",
      "## PAT (Port Address Translation)\n\nPure NAT maps 1 private IP to 1 public IP. This is useless for a home network. Instead, we use PAT (often just called NAT overload).\n- Your router has ONE public IP.\n- When your laptop (`192.168.1.5`) requests Google, the router changes the source IP to its public IP, but attaches a unique **Source Port** (e.g., `45000`).\n- The router logs `[192.168.1.5:443] -> [RouterPublicIP:45000]` in its NAT Translation Table.\n- When Google replies to `RouterPublicIP:45000`, the router checks the table, rewrites the destination back to `192.168.1.5`, and forwards it.",
      "## NAT as a Security Barrier\n\nBecause external servers only see the router's public IP, they cannot directly initiate a connection to an internal private device unless Port Forwarding is explicitly configured. This acts as a rudimentary hardware firewall."
    ],
    interviewTips: [
      "Always clarify that what most people call 'NAT' is actually 'PAT' (Port Address Translation).",
      "Memorize the private IP ranges. Knowing that 10.x.x.x is private helps debug routing issues instantly in interviews.",
      "Mention that IPv6 originally intended to eliminate the need for NAT entirely because every device on earth could have a public IP."
    ],
    commonQuestions: [
      "What problem does NAT solve?",
      "Explain exactly how Port Address Translation (PAT) allows 50 devices to share one public IP.",
      "If NAT provides security, do we still need firewalls?",
      "What are the predefined private IP ranges?"
    ],
    companies: ["VMware", "Cisco", "Palo Alto Networks", "Google"]
  },

  ipv6: {
    title: "IPv4 vs IPv6 Deep Dive",
    subject: "Computer Networks",
    readTime: "8 min",
    content: [
      "Internet Protocol Version 4 exhausted its 4.3 billion addresses. IPv6 was designed to replace it completely, bringing massive upgrades in scale, security, and routing efficiency.",
      "## Address Space & Notation\n\n- **IPv4**: 32-bit addresses (e.g., `192.168.1.1`). Total of 4.3 billion addresses.\n- **IPv6**: 128-bit addresses (e.g., `2001:0db8:85a3:0000:0000:8a2e:0370:7334`). Total of 3.4 x 10^38 addresses. This is enough to assign an IP to every atom on the surface of the earth.\n- **Zero Compression**: Consecutive blocks of zeros can be replaced by `::` exactly once per address.",
      "## Key Architectural Improvements\n\n- **No Broadcasts**: IPv6 completely removes 'Broadcast' traffic (which caused network storms in IPv4). It relies strictly on Multicast and Anycast.\n- **Simplified Header**: IPv6 headers have a fixed length of 40 bytes. Unlike IPv4, there is no checksum field (relying on L2 and L4 to handle errors), drastically speeding up router processing.\n- **IPSec is Native**: Security (IPSec) is baked directly into the IPv6 standard, whereas it must be bolted on to IPv4 via VPNs.\n- **No NAT Required**: Every device gets a globally routable public IP address, restoring end-to-end connectivity."
    ],
    interviewTips: [
      "Emphasize the *header simplification* in IPv6. Removing the checksum means routers don't have to recalculate it at every single hop, speeding up the backbone of the internet.",
      "Understand why IPv6 removes NAT: End-to-end encryption and direct peer-to-peer (like VoIP or gaming) work flawlessly without STUN/TURN servers traversing NAT.",
      "Know how to compress an IPv6 address using the double-colon `::` rule."
    ],
    commonQuestions: [
      "Compare the address spaces of IPv4 and IPv6.",
      "Why does IPv6 lack a header checksum?",
      "Why is NAT unnecessary in an IPv6 world?",
      "Compress the IPv6 address: `2001:0db8:0000:0000:0000:0000:1428:57ab`."
    ],
    companies: ["Comcast", "Cloudflare", "Akamai", "Cisco", "Microsoft"]
  },

  congestion_control: {
    title: "TCP Congestion Algorithms",
    subject: "Computer Networks",
    readTime: "11 min",
    content: [
      "TCP guarantees reliability, but Congestion Control ensures that a fast sender doesn't completely overwhelm the intermediary internet routers, dropping packets and causing network collapse.",
      "## The Congestion Window (cwnd)\n\nTCP maintains a `cwnd` variable alongside the receiver's advertised window. The total unacknowledged data in flight cannot exceed `min(cwnd, receiver_window)`.",
      "## Algorithm Phases (TCP Reno)\n\n1. **Slow Start**: Start with `cwnd = 1` Maximum Segment Size (MSS). For every successful ACK, increase `cwnd` by 1. This results in the window *doubling* every Round Trip Time (RTT). It grows exponentially until it hits the `ssthresh` (Slow Start Threshold).\n2. **Congestion Avoidance (AIMD)**: Additive Increase, Multiplicative Decrease. Once past `ssthresh`, `cwnd` is increased by exactly 1 MSS per RTT (Linear growth). If a timeout occurs, the network is congested—`cwnd` drops back to 1 MSS, and `ssthresh` is halved.\n3. **Fast Retransmit**: If the sender receives 3 Duplicate ACKs, it assumes a specific packet was lost but the network is otherwise fine. It retransmits immediately without waiting for the timeout.\n4. **Fast Recovery**: After Fast Retransmit, instead of dropping `cwnd` to 1 (Slow start), it halves `cwnd` and resumes Congestion Avoidance. This prevents severe performance drops.",
      "## Modern Equivalents (BBR)\n\nTraditional algorithms (Reno/Cubic) use packet loss as the indicator of congestion. Google developed **BBR (Bottleneck Bandwidth and Round-trip propagation time)** which monitors latency/RTT increases instead of waiting for packets to drop. BBR massively outperforms Reno on high-throughput, high-packet-loss networks."
    ],
    interviewTips: [
      "AIMD (Additive Increase, Multiplicative Decrease) is the core philosophical concept behind traditional TCP. Understand it conceptually.",
      "You must know the trigger differences: 'Timeout' implies terrible congestion (drop to 1). '3 Duplicate ACKs' implies mild loss (halve window).",
      "Mentioning Google's BBR shows you are tracking modern cutting-edge network engineering."
    ],
    commonQuestions: [
      "Explain the phases of TCP Congestion Control.",
      "What does 'Slow Start' mean in TCP? Is it actually slow?",
      "What is the difference between Flow Control and Congestion Control?",
      "Explain Fast Retransmit and Fast Recovery."
    ],
    companies: ["Google", "Netflix", "Fastly", "Cloudflare", "Meta"]
  },

  cdn_edge: {
    title: "CDNs & Edge Computing",
    subject: "Computer Networks",
    readTime: "9 min",
    content: [
      "You cannot beat the speed of light. If a server is in New York and the user is in Tokyo, latency will be high. Content Delivery Networks (CDNs) solve this by geographically distributing servers.",
      "## How a CDN Works\n\n- **Origin Server**: The master server holding the source of truth.\n- **Edge Servers (PoPs - Points of Presence)**: Caching servers scattered around the globe.\n- When a Tokyo user requests an image, DNS routes them to the Tokyo Edge Server via Anycast routing. If the edge has the image (Cache Hit), it serves it instantly. If not (Cache Miss), the Edge fetches it from the Origin in New York, caches it, and serves it.",
      "## Push vs Pull CDNs\n\n- **Pull CDN**: The Edge server auto-fetches data from the Origin upon a user's first request. Best for websites with large, dynamic content catalogues where users only hit a fraction of files.\n- **Push CDN**: Developers explicitly upload assets (images, videos) directly to the CDN. Best for small static sites or specific massive media files (like game updates).",
      "## Edge Computing\n\nModern CDNs do more than cache static files. Edge Computing allows developers to push lightweight backend code (Serverless Edge Functions) directly to the CDN nodes.\n- A Tokyo user triggering an API hits the Tokyo edge server, which executes the logic instantly (e.g., JWT validation, user redirection, A/B testing logic) without ever touching the heavy origin server in New York."
    ],
    interviewTips: [
      "CDNs are the silver bullet in System Design interviews. If you have static assets (videos, thumbnails, JS/CSS), immediately put a CDN in your architecture diagram.",
      "Understand exactly how DNS Anycast routing ensures a user hits their physically closest PoP.",
      "Know how to invalidate/purge a CDN cache when an asset updates (Cache-Busting via versioned URLs is the best approach)."
    ],
    commonQuestions: [
      "How does a CDN improve website latency?",
      "Explain the difference between a Push CDN and a Pull CDN.",
      "What is Edge Computing?",
      "How do you ensure users don't receive outdated cached files from a CDN?"
    ],
    companies: ["Akamai", "Cloudflare", "Fastly", "Netflix", "Amazon AWS"]
  },

  dependency_injection: {
    title: "Dependency Injection & IoC",
    subject: "Object-Oriented Programming",
    readTime: "12 min",
    content: [
      "Dependency Injection (DI) is a design pattern used to implement Inversion of Control (IoC), allowing the creation of dependent objects outside of a class and passing them in. It heavily enforces the SOLID Dependency Inversion Principle.",
      "## The Core Problem\n\nIf `class Car` internally instantiates `new V8Engine()`, it is tightly coupled. You cannot test the Car with a `MockEngine`, nor can you easily swap it for an `ElectricEngine` without modifying the Car class itself.",
      "## Types of Injection\n\n- **Constructor Injection**: Dependencies are provided through the class constructor. This is the gold standard because it guarantees the class is fully initialized with its dependencies before use.\n- **Setter Injection**: Dependencies are provided through setter methods. Useful for optional dependencies that can be swapped at runtime.\n- **Interface Injection**: The dependency provides an injector method that will inject the dependency into any client passed to it. Rarely used.",
      "## IoC Containers (Spring, NestJS)\n\nIn modern enterprise apps, an IoC Container (Framework) automatically manages the lifecycle and injection of dependencies. You simply annotate a class (e.g., `@Injectable()`) or declare it in a constructor, and the framework figures out how to construct it and pass it to you."
    ],
    interviewTips: [
      "Always connect DI to testing. The primary immediate benefit of DI is that it makes unit testing with mocks/stubs incredibly easy.",
      "Understand why Constructor Injection is generally preferred over Setter/Field Injection (it ensures immutability and complete initialization).",
      "Mention IoC containers to show framework-level experience."
    ],
    commonQuestions: [
      "What is the difference between Dependency Injection and Inversion of Control?",
      "Why is Constructor Injection preferred?",
      "How does DI facilitate Unit Testing?",
      "Explain how an IoC container works under the hood."
    ],
    companies: ["Netflix", "Uber", "Amazon", "Pivotal", "Google"]
  },

  composition_vs_inheritance: {
    title: "Composition vs Inheritance",
    subject: "Object-Oriented Programming",
    readTime: "10 min",
    content: [
      "'Favor Object Composition over Class Inheritance' is a foundational maxim from the Gang of Four (GoF) Design Patterns book.",
      "## The Flaws of Inheritance (IS-A)\n\nInheritance creates beautifully rigid taxonomies but is notoriously fragile:\n- **The Gorilla/Banana Problem**: 'You wanted a banana but what you got was a gorilla holding the banana and the entire jungle' (Joe Armstrong). If you inherit from a base class to get one method, you get *all* its methods and state, coupling you tightly.\n- **The Fragile Base Class**: A change in the superclass can inadvertently break dozens of subclasses.\n- **Multiple Inheritance Hell**: The Diamond Problem (handled in Java via Interfaces, in C++ via virtual inheritance).",
      "## The Power of Composition (HAS-A)\n\nComposition builds complex behavior by combining simpler, interchangeable objects.\n- Instead of `Car extends Engine`, use `Car has an Engine`.\n- Instead of `FlyingDuck extends Duck` and `SwimmingDuck extends Duck` (what about a duck that flies AND swims?), use Composition: `Duck` holds a `FlyBehavior` and `SwimBehavior`.\n- Behavior can be changed *dynamically at runtime* by swapping out the injected composite objects (this is the Strategy Pattern)."
    ],
    interviewTips: [
      "Do not bash inheritance completely—mention it's great for strict IS-A relationships and code reuse when carefully controlled.",
      "Use the 'Game Character' analogy: If `Player` extends `Knight` and later picks up a bow, how do you make them an `ArcherKnight`? Inheritance fails here. Composition (`Player` has a `WeaponBehavior`) solves it elegantly.",
      "Understand that modern UI frameworks (React, Swift UI) are exclusively composition-based."
    ],
    commonQuestions: [
      "Why should you favor composition over inheritance?",
      "What is the 'Fragile Base Class' problem?",
      "Give an example where Inheritance tightly couples code, and how Composition solves it.",
      "How does the Strategy Pattern utilize Composition?"
    ],
    companies: ["Apple", "Meta", "Google", "Atlassian", "Twilio"]
  },

  memory_management: {
    title: "Memory Management & Garbage Collection",
    subject: "Object-Oriented Programming",
    readTime: "11 min",
    content: [
      "Object allocation in memory is a massive performance consideration. Modern OOP languages abstract this away using Garbage Collection, but understanding it is critical for high-performance systems.",
      "## Stack vs Heap\n\n- **Stack Allocation**: Fast, deterministic, LIFO structure. Stores primitive local variables and object references. Automatically cleaned up when a method returns.\n- **Heap Allocation**: Slower, dynamic allocation. Stores the actual Objects themselves (e.g., the data of `new User()`). Requires manual deallocation (C/C++) or Garbage Collection (Java/C#).",
      "## Garbage Collection (GC) Mechanisms\n\n- **Reference Counting**: Tracks how many pointers reference an object. When count hits 0, it's deleted. Fast, but fails with Circular References (Object A points to B; B points to A).\n- **Tracing / Mark-and-Sweep**: The JVM pauses execution ('Stop the World'), traverses all reachable objects from the root (Stack variables), marks them as alive, and sweeps (deletes) the rest.\n- **Generational GC**: Optimizes Mark-and-Sweep. Objects die young. The heap is split into Young Gen and Old Gen. GC runs frequently and quickly on the Young Gen, drastically improving performance."
    ],
    interviewTips: [
      "The Stack vs Heap question is guaranteed in lower-level interviews. Remember: Variables on the stack *point* to objects on the heap.",
      "Always mention 'Circular References' as the fatal flaw of primitive Reference Counting (Swift/Objective-C use ARC, which requires 'weak' references to fix this).",
      "Knowing Generational GC (Eden space, Survivor spaces) is a massive differentiator for JVM developers."
    ],
    commonQuestions: [
      "What is the difference between Stack and Heap memory?",
      "How does a Mark-and-Sweep Garbage Collector work?",
      "What is a Memory Leak in a Garbage Collected language? (e.g., keeping unused objects in a static List).",
      "Explain the concept of Generational Garbage Collection."
    ],
    companies: ["Oracle", "Microsoft", "Bloomberg", "Netflix", "Amazon"]
  },

  domain_driven_design: {
    title: "Domain-Driven Design (DDD) Basics",
    subject: "Object-Oriented Programming",
    readTime: "12 min",
    content: [
      "Domain-Driven Design (DDD), coined by Eric Evans, is an architectural approach to OOP that centers the software around the core business domain and its logic, rather than the database schema or UI.",
      "## Ubiquitous Language\n\nDevelopers and Domain Experts (business people) must speak the exact same language. If the business talks about an `Order` and a `Customer`, the code must contain classes named exactly `Order` and `Customer`. No more `Tbl_Inv_01`.",
      "## Strategic Design (Contexts)\n\n- **Bounded Context**: A logical boundary within which a specific domain model applies. In an e-commerce app, a `Product` in the 'Inventory Context' has location and weight. The exact same `Product` in the 'Sales Context' has price and marketing descriptions. They should be different classes in different modules.",
      "## Tactical Design (Building Blocks)\n\n- **Entities**: Objects with a distinct Identity that runs through time (e.g., a `User` has an ID; even if their name changes, they are the same user).\n- **Value Objects**: Immutable objects that have NO identity. They are defined purely by their attributes (e.g., `Money`, `Address`, `Color`). If two $50 Money objects exist, they are identical and interchangeable.\n- **Aggregates**: A cluster of domain objects treated as a single unit. The Aggregate Root is the only class external objects can hold references to (e.g., an `Order` is a root that contains `OrderItems`)."
    ],
    interviewTips: [
      "DDD is an extremely requested skill for Senior Backend Engineers working in Microservices. Bounded Contexts map perfectly to Microservice boundaries.",
      "Understand the stark difference between an Entity (Mutable, defined by ID) and a Value Object (Immutable, defined by state).",
      "Value Objects prevent 'Primitive Obsession' (e.g., using an `int` for inches and failing to map it against centimeters; use a `Length` Value Object instead)."
    ],
    commonQuestions: [
      "What is the difference between an Entity and a Value Object in DDD?",
      "What is a Bounded Context, and how does it relate to Microservices?",
      "Explain the concept of Ubiquitous Language.",
      "What is an Aggregate Root?"
    ],
    companies: ["Uber", "Square", "Spotify", "ThoughtWorks", "Zillow"]
  },

  clean_architecture: {
    title: "Clean Architecture & Onion",
    subject: "Object-Oriented Programming",
    readTime: "9 min",
    content: [
      "Clean Architecture (Uncle Bob) and Onion Architecture (Jeffrey Palermo) focus on isolating business logic from external frameworks, databases, and UIs.",
      "## The Dependency Rule\n\nThe fundamental rule is: Source code dependencies must point INWARD toward high-level policies. Inner circles cannot know *anything* about outer circles.\n\n1. **Entities / Domain**: The innermost core. Contains pure business logic and enterprise-wide rules. Absolutely zero dependencies on external frameworks.\n2. **Use Cases**: Application-specific business rules. Orchestrates the flow of data to and from the entities.\n3. **Interface Adapters (Controllers/Presenters)**: Converts data from the format most convenient for Use Cases, to the format most convenient for the Web or DB. This is where your REST APIs or MVC Controllers sit.\n4. **Frameworks & Drivers**: The outermost edge. The Web framework (Express, Spring), the Database (Postgres, MongoDB), or external APIs.",
      "## Implementing the Barrier (DIP)\n\nHow does the Use Case save to the Database if it can't depend on the Database layer? **Dependency Inversion**.\nThe Use Case layer defines an Interface (`IUserRepository`). The Database layer implements it (`MongoUserRepository`). The framework injects the implemenetation into the Use Case. The Use Case remains blissfully unaware of MongoDB."
    ],
    interviewTips: [
      "Know how to cleanly answer: 'Where does the Database go?'. The answer is always 'The outermost layer. The Database is a detail, not the core.'",
      "Understanding Clean Architecture requires total mastery of Dependency Injection and the D in SOLID.",
      "Be able to critique typical MVC wrappers where the Controller blindly passes Framework-specific HttpRequest objects straight into the Business Logic (violating the dependency rule)."
    ],
    commonQuestions: [
      "What is the Golden Dependency Rule in Clean Architecture?",
      "If the business logic layer cannot depend on the database layer, how does it save data?",
      "Why is it bad to pass an HTTP Request object directly into your Use Case layer?",
      "What is the difference between an Entity in Clean Architecture vs an Entity in an ORM?"
    ],
    companies: ["Apple", "Netflix", "Atlassian", "Shopify", "Microsoft"]
  },

  type_systems: {
    title: "Type Systems: Static vs Dynamic",
    subject: "Object-Oriented Programming",
    readTime: "8 min",
    content: [
      "Different OOP languages enforce different rules around how and when types are resolved, heavily impacting developer velocity and runtime safety.",
      "## Static vs Dynamic Typing\n\n- **Statically Typed**: Types are checked at *compile-time*. Variables are strictly bound to a type (e.g., Java, C++, TypeScript). IDEs provide brilliant refactoring and autocompletion. Catches errors before the program ever runs.\n- **Dynamically Typed**: Types are checked at *runtime*. Variables are not bound to a type; the values they hold are (e.g., Python, JavaScript, Ruby). Extremely fast prototyping, but prone to `TypeError: undefined is not a function` crashing the app in production.",
      "## Strong vs Weak Typing\n\n- **Strong Typing**: The language refuses to implicitly convert types in a dangerous way. In Python (Strong/Dynamic), `\"2\" + 2` throws an error.\n- **Weak Typing**: The language implicitly coerces types to make operations work. In JavaScript (Weak/Dynamic), `\"2\" + 2 = \"22\"`. In C (Weak/Static), you can cast a pointer of one type completely blindly to another.",
      "## Duck Typing\n\nA feature of dynamically typed languages. 'If it walks like a duck and quacks like a duck, treat it like a duck.' You don't care if an object implements an `IFlyable` interface; you just call `object.fly()`. If it has the method, it works at runtime. If not, it crashes."
    ],
    interviewTips: [
      "Never confuse Static/Dynamic (when types are checked) with Strong/Weak (how implicitly types are coerced). Python is Dynamic but Strong. JS is Dynamic but Weak.",
      "Understand why the industry shifted massively toward Static Typing for large applications (TypeScript over JS, Type Hints in Python 3).",
      "Be prepared to explain Duck Typing intuitively."
    ],
    commonQuestions: [
      "What is the difference between Statically and Dynamically typed languages?",
      "Can a Statically typed language be weakly typed? Give an example.",
      "Explain Duck Typing in Python or Ruby.",
      "Why choose TypeScript (Static) over JavaScript (Dynamic) for enterprise software?"
    ],
    companies: ["Stripe", "Airbnb", "Google", "Dropbox", "Meta"]
  },

  functional_vs_oop: {
    title: "OOP vs Functional Programming",
    subject: "Object-Oriented Programming",
    readTime: "10 min",
    content: [
      "While OOP dominates enterprise software, Functional Programming (FP) paradigms have deeply infiltrated modern OOP languages to solve concurrency and state mutability issues.",
      "## The Core Philosophy Difference\n\n- **OOP**: Nouns are the center of the universe. Programs are networks of interacting objects encapsulating Mutable State and controlling access via methods.\n- **FP**: Verbs are the center of the universe. Programs are pipelines of mathematical, stateless functions transforming Data.",
      "## Pure Functions & Immutability (FP Core)\n\n- **Pure Functions**: A function that, given the same inputs, will always return the exact same output, and has ZERO side effects (does not modify global state, database, or DOM).\n- **Immutability**: Once an object is created, it cannot be changed. Instead of modifying a list, an FP language returns a *brand new list* with the modification. Eliminates entire classes of threading bugs (Thread A can't corrupt data Thread B is reading if the data is immutable).",
      "## The Convergence\n\nModern languages utilize both. \n- Java added Streams and Lambdas.\n- C# added LINQ.\n- TypeScript/React heavily encourage Immutable State combined with Component encapsulation.\nYou use OOP to structure the high-level architecture (Services, Controllers, Use Cases) and FP to process data within those boundaries (mapping, filtering, reducing)."
    ],
    interviewTips: [
      "A senior engineer combines paradigms, rather than arguing one is superior. Highlight how Java/C# have adopted FP features.",
      "Immutability is the secret weapon for thread-safety. If an object cannot change, you never need a Mutex or Lock.",
      "Understand First-Class Functions (functions can be passed as arguments or returned like any other variable)."
    ],
    commonQuestions: [
      "What is a Pure Function and what are its benefits?",
      "Compare the state management philosophy between OOP and Functional Programming.",
      "How does Immutability make concurrent programming vastly easier?",
      "What is a First-Class Function?"
    ],
    companies: ["Jane Street", "Netflix", "Meta", "Amazon", "Twitter"]
  },

  kernel_architecture: {
    title: "Monolithic vs Microkernel Architecture",
    subject: "Operating Systems",
    readTime: "11 min",
    content: [
      "The Kernel is the absolute core of an Operating System, holding complete control over the entire system. How the kernel is architected defines the stability, security, and performance of the OS.",
      "## Monolithic Kernels (Linux, Windows)\n\nIn a Monolithic kernel, all core OS services (Device Drivers, File Systems, IPC, Memory Management) run in the highly privileged **Kernel Space**.\n- **Pros**: Blazing fast performance. Since everything runs in the same address space, kernel sub-components can communicate instantly via simple function calls rather than expensive message passing.\n- **Cons**: A single bug in a specific device driver can cause a kernel panic, crashing the entire machine. The codebase becomes massive and notoriously difficult to maintain (Linux kernel is tens of millions of lines).",
      "## Microkernels (MINIX, QNX)\n\nA Microkernel strips the kernel down to the absolute bare minimum (Basic IPC, primitive memory management, basic CPU scheduling). Everything else (Drivers, File Systems, GUIs) runs in **User Space** as separate processes.\n- **Pros**: Incredible stability and security. If a graphics driver crashes, it just restarts like a normal app; the system survives. Much easier to maintain and formally verify for correctness.\n- **Cons**: Poor performance. If a user app wants to read a file, it must send an IPC message to the File System process running in user space, passing through the microkernel, causing heavy context-switching overhead.",
      "## Hybrid Kernels (macOS XNU)\n\nAttempts to combine the best of both. Apple's XNU runs essential services in kernel space for speed, but runs non-critical services (like UI) in user space for stability."
    ],
    interviewTips: [
      "The classic Linus Torvalds vs Andrew Tanenbaum debate is a great historical reference point when discussing kernel architecture.",
      "Always highlight the primary trade-off: Monolithic is Fast but Fragile. Microkernel is Slow but Bulletproof.",
      "Be prepared to explain precisely *why* a Microkernel is slower (IPC message passing and context switching)."
    ],
    commonQuestions: [
      "What is the difference between Kernel Space and User Space?",
      "Why does a monolithic kernel perform better than a microkernel?",
      "Why are real-time, safety-critical systems (like pacemakers or satellites) more likely to use a Microkernel?",
      "What is a Kernel Panic?"
    ],
    companies: ["Apple", "Microsoft", "Red Hat", "Canonical", "Google"]
  },

  linux_boot_process: {
    title: "The Linux Boot Process Deep Dive",
    subject: "Operating Systems",
    readTime: "9 min",
    content: [
      "Understanding exactly what happens between pressing the power button and seeing a login prompt is a strong indicator of low-level systems knowledge.",
      "## 1. BIOS / UEFI\n\nThe instant power flows, the CPU executes Firmware (BIOS: Basic Input/Output System, or the modern UEFI). The Firmware performs the POST (Power-On Self Test) to check RAM and hardware. It then locates a bootable device (Hard Drive) and loads the very first sector into memory.",
      "## 2. Bootloader (GRUB)\n\nThe Master Boot Record (MBR) is executed, which loads a larger Bootloader like GRUB (GRand Unified Bootloader). GRUB presents a menu of installed OSes and kernel versions. Once selected, GRUB loads the compressed Linux Kernel into RAM.",
      "## 3. Kernel Initialization\n\nThe Kernel decompresses itself, initializes the CPU cores, sets up memory management, and loads built-in drivers. The kernel then mounts the temporary RAM-based root filesystem (`initramfs`) to load necessary disk drivers to mount the actual physical root filesystem.",
      "## 4. Init Process (systemd)\n\nOnce the real filesystem is mounted, the Kernel executes `/sbin/init` (almost universally **`systemd`** today on modern Linux). This is the very first user-space process (PID 1). Memory and control are handed over to it. Systemd spawns all other services, daemons, and eventually the terminal/GUI."
    ],
    interviewTips: [
      "PID 1 is a sacred number in Linux. Knowing that PID 1 is `init` (or `systemd`) is a mandatory basic requirement for systems roles.",
      "Understand what `initramfs` (Initial RAM File System) does. It solves the chicken-and-egg problem of needing a filesystem driver to mount the filesystem.",
      "Distinguish between hardware initialization (BIOS) and software initialization (Kernel -> Init)."
    ],
    commonQuestions: [
      "What is PID 1 in Linux and what is its role?",
      "What is the purpose of the GRUB bootloader?",
      "Explain the chicken-and-egg problem that `initramfs` solves.",
      "Describe the Linux boot process from Post to User Login."
    ],
    companies: ["Amazon AWS", "Red Hat", "IBM", "Cloudflare", "DigitalOcean"]
  },

  system_calls: {
    title: "System Calls & Mode Switching",
    subject: "Operating Systems",
    readTime: "10 min",
    content: [
      "A System Call (syscall) is the programmatic mechanism by which a user application explicitly requests a service from the Operating System's Kernel.",
      "## User Mode vs Kernel Mode\n\nCPUs have hardware-supported privilege levels (Rings). User Mode (Ring 3) restricts access to raw hardware, arbitrary memory, and network sockets to prevent rogue apps from destroying the system. Kernel Mode (Ring 0) has unrestricted access.\nTo do anything useful (read a file, send a packet, print to console), an app MUST transition to Kernel Mode.",
      "## The Anatomy of a Syscall\n\nWhen `read()` is called in C:\n1. The C standard library sets up arguments in CPU registers and loads the specific syscall number for `read`.\n2. A special CPU instruction is fired (`syscall` on x86_64, historically `int 0x80`).\n3. This instruction triggers a Software Interrupt, violently yanking the CPU out of User Mode and plunging it into Kernel Mode.\n4. The CPU jumps to a predefined memory address (the Syscall Handler table in the OS).\n5. The OS verifies the arguments tightly, executes the raw hardware read, and places the result in a register.\n6. The OS fires a return instruction (`sysret`), dropping privileges back to User Mode, and the app continues.",
      "## Mode Switch vs Context Switch\n\nA Mode Switch (User -> Kernel) is incredibly fast and cheap. It does NOT change the active process, it only elevates privileges for the current process. A Context Switch (Process A -> Process B) is heavy and expensive (involves flushing the TLB and swapping out complete page tables)."
    ],
    interviewTips: [
      "The distinguishing factor between a Junior and Senior is knowing the difference between a Mode Switch and a Context Switch.",
      "Understand that library functions (like `printf`) are NOT system calls. They are User-Space functions that *eventually* trigger a system call (like `write`).",
      "Knowing the specific assembly instruction (`syscall`) is an excellent bonus point."
    ],
    commonQuestions: [
      "Explain the exact steps of what happens when a program calls `open()`.",
      "Difference between a System Call and a Standard Library function?",
      "Difference between a Mode Switch and a Context Switch?",
      "Why are system calls expensive compared to normal function calls?"
    ],
    companies: ["Microsoft", "Google", "Oracle", "NVIDIA", "Intel"]
  },

  page_tables: {
    title: "Advanced Page Tables",
    subject: "Operating Systems",
    readTime: "9 min",
    content: [
      "A standard linear page table maps logical pages to physical frames. But in a 64-bit architecture, a single linear page table would consume petabytes of RAM per process, which is physically impossible.",
      "## Multi-Level (Hierarchical) Page Tables\n\nTo solve the memory issue, we page the page table itself. \n- In a 32-bit system (like older Windows/Linux), a 2-level page table is common: A Page Directory points to multiple Page Tables, which point to Frames.\n- In modern 64-bit systems (x86_64), a 4-level or even 5-level hierarchy is used.\n- **Advantage**: Massive memory savings because unused portions of the virtual address space don't require instantiated page tables.",
      "## Hashed Page Tables\n\nCommon in address spaces > 32 bits. The virtual page number is hashed into a hash table. Each entry in the hash table contains a linked list of elements (to resolve collisions).\n- The OS hashes the virtual page number, traverses the linked list to find the match, and retrieves the physical frame.\n- **Advantage**: Fast O(1) average lookup, avoids deep hierarchical memory walks.",
      "## Inverted Page Tables\n\nInstead of one page table per process (which still wastes RAM if hundreds of processes are running), an Inverted Page Table maintains exactly ONE table for the entire system, with one entry for every physical frame in RAM.\n- Each entry stores `(Process_ID, Page_Number)`.\n- **Advantage**: Absolute minimum memory usage (scales strictly with physical RAM, not virtual space).\n- **Disadvantage**: Lookup is brutally slow because it must search the entire table by PID and Page. Often mitigated by using a hashed front-end."
    ],
    interviewTips: [
      "Inverted Page Tables are a highly advanced OS topic. If asked 'How can we minimize page table memory overhead system-wide?', this is the golden answer.",
      "Be prepared to explain why a 64-bit linear page table is physically impossible (doing the math: 2^64 bytes / 4KB pages = too many entries).",
      "Explain how the TLB mitigates the performance disaster of Multi-Level page walks."
    ],
    commonQuestions: [
      "Why can't we use a simple linear page table in a 64-bit operating system?",
      "Describe how a 2-level Hierarchical Page Table works.",
      "What is an Inverted Page Table and what are its trade-offs?",
      "How does hashing improve Inverted Page Table performance?"
    ],
    companies: ["VMware", "Apple", "AMD", "Intel", "Samsung"]
  },

  thread_implementations: {
    title: "User-Level vs Kernel-Level Threads",
    subject: "Operating Systems",
    readTime: "10 min",
    content: [
      "Threads allow concurrent execution within the same process address space. How these threads are mapped to the underlying OS Kernel drastically affects their behavior.",
      "## User-Level Threads (Many-to-One Model)\n\nThe threads are managed entirely by a User-Space thread library (e.g., early Java 'Green Threads' or modern Go Goroutines/Node.js yields). The OS Kernel knows absolutely nothing about them; it only sees a single process.\n- **Pros**: Context switching between these threads is instantaneous—no system calls, no Mode Switch overhead. Extremely lightweight.\n- **Cons**: If ONE user-level thread calls a blocking system call (like reading a huge file), the Kernel blocks the ENTIRE process, halting all other user-level threads. They cannot truly run in parallel on multi-core CPUs.",
      "## Kernel-Level Threads (One-to-One Model)\n\nEvery user thread maps exactly to one Kernel thread. The OS manages them directly (e.g., standard POSIX Pthreads, modern Java `Thread`).\n- **Pros**: True parallelism. If one thread blocks on I/O, the OS seamlessly schedules another thread on a different CPU core.\n- **Cons**: Creating, destroying, and context-switching between them requires heavy Mode Switches into the Kernel Space. They consume OS resources.",
      "## Hybrid Model (Many-to-Many)\n\nM multiplexes N user threads onto M kernel threads (M <= N). It seeks the best of both: creating logical threads is cheap (user), but they can block independently and run on multiple cores (kernel). This is notoriously complex to write schedulers for."
    ],
    interviewTips: [
      "The 'Blocking I/O' problem is the critical flaw of pure User-Level threads. Always pivot to this when comparing them.",
      "If you know Go, bringing up Goroutines (M:N hybrid multiplexed on a small pool of OS threads) shows supreme practical knowledge of this theory.",
      "Understand what a 'Green Thread' is (a user-space thread simulating concurrency)."
    ],
    commonQuestions: [
      "What happens to a process using User-Level threads if one thread executes a blocking system call?",
      "Compare the performance of context-switching User vs Kernel threads.",
      "What is the Many-to-Many threading model?",
      "Why did Java move away from Green Threads to native Kernel Threads?"
    ],
    companies: ["Google", "Netflix", "Oracle", "Uber", "Palo Alto Networks"]
  },

  process_synchronization_hardware: {
    title: "Hardware Sync: Test-And-Set & CAS",
    subject: "Operating Systems",
    readTime: "10 min",
    content: [
      "Software algorithms for synchronization (like Peterson's Solution) fail drastically on modern out-of-order, multi-core processors. True synchronization must be enforced at the Silicon hardware level.",
      "## The Need for Atomicity\n\nA critical section requires atomic execution (all or nothing, indivisible). `count++` in C compiles down to three assembly instructions (Read, Increment, Write). A context switch in the middle destroys data integrity.",
      "## TestAndSet (TAS)\n\nA specialized hardware instruction that reads a memory location, tests if it is 0 (unlocked), and if so, sets it to 1 (locked) all in ONE indivisible CPU cycle. No interrupt can occur during this cycle.\n```c\nboolean TestAndSet(boolean *lock) {\n    boolean old = *lock;\n    *lock = true;\n    return old;\n}\n```\nThreads spin in a loop: `while(TestAndSet(&lock)) {}`. Simple, but prone to starvation.",
      "## Compare-And-Swap (CAS)\n\nThe foundation of modern Lock-Free programming. It compares the current value of a memory location to an expected value. If they match, it swaps in a new value. If they don't, it does nothing and returns false.\n```c\nint CompareAndSwap(int *value, int expected, int new_value) {\n    int old = *value;\n    if (old == expected) *value = new_value;\n    return old;\n}\n```\nCAS allows highly concurrent data structures (like `ConcurrentHashMap` or `AtomicInteger` in Java) to function completely without heavy Mutexes, operating optimistically."
    ],
    interviewTips: [
      "CAS (Compare-And-Swap) is the holy grail of Senior Backend concurrency interviews. If you can explain CAS, you understand lock-free programming.",
      "Make clear that these are hardware-level instructions implemented directly in the CPU architecture (like the `LOCK CMPXCHG` instruction in x86).",
      "Mention the 'ABA Problem', a classic vulnerability of naive CAS loops where a value changes from A to B and back to A, tricking the CAS into thinking no change occurred."
    ],
    commonQuestions: [
      "Why does a simple software flag `locked = true` fail to provide mutual exclusion?",
      "Explain what makes TestAndSet 'Atomic'.",
      "What is Compare-And-Swap (CAS) and how is it used in Lock-Free structures?",
      "Explain the ABA problem in relation to CAS."
    ],
    companies: ["Trading Firms", "Jane Street", "Amazon", "Google", "Databricks"]
  },

  real_time_os: {
    title: "Real-Time Operating Systems (RTOS)",
    subject: "Operating Systems",
    readTime: "9 min",
    content: [
      "A standard OS (Windows/Linux) aims for 'fairness' and high overall throughput. A Real-Time Operating System (RTOS) aims for absolute strict timing guarantees. Missing a deadline in an RTOS isn't a lag spike—it's a catastrophic system failure.",
      "## Hard vs Soft Real-Time\n\n- **Hard RTOS**: Missing a deadline causes massive damage or loss of life. (Examples: Pacemakers, Anti-lock brakes, Aircraft flight controls, Spacecraft).\n- **Soft RTOS**: Missing a deadline degrades performance but is acceptable. (Examples: Streaming video players, VoIP, VR rendering).\n- An RTOS guarantees latency bounds (e.g., 'This interrupt will be handled in exactly 5 microseconds, 100% of the time').",
      "## Preemptive Priority Scheduling\n\nStandard OS schedulers dynamically adjust priorities to prevent starvation. An RTOS uses strict Preemptive Priority Scheduling. If a higher-priority task becomes ready, the CPU immediately aborts the lower-priority task—even if it starves the lower task fully. The critical task MUST run.",
      "## Priority Inversion & Inheritance\n\n**The Problem**: A high-priority task (H) waits for a Mutex held by a low-priority task (L). Meanwhile, a medium-priority task (M) preempts L indefinitely. H is now entirely blocked by M! (This famously crashed the Mars Pathfinder rover).\n**The Solution**: Priority Inheritance. The OS temporarily skyrockets L's priority to match H, allowing L to quickly finish, release the Mutex, and give H control."
    ],
    interviewTips: [
      "The Mars Pathfinder story is legendary in Computer Science. Knowing it and explaining how Priority Inheritance saved it will instantly win over systems interviewers.",
      "Differentiate between Speed and Determinism. A supercomputer might be incredibly fast, but if its scheduling isn't 100% deterministic, it is not an RTOS.",
      "Highlight the difference between Hard and Soft real-time consequences."
    ],
    commonQuestions: [
      "What is the difference between an everyday OS and an RTOS?",
      "Distinguish between Hard Real-Time and Soft Real-Time.",
      "What is Priority Inversion and how did it affect the Mars Rover?",
      "What is Priority Inheritance?"
    ],
    companies: ["SpaceX", "Tesla", "NVIDIA", "Qualcomm", "Boeing"]
  },

  mvcc: {
    title: "Multi-Version Concurrency Control (MVCC)",
    subject: "Database Management",
    readTime: "11 min",
    content: [
      "Instead of using aggressive locking (which ruins read performance by blocking concurrent readers), modern databases use MVCC. MVCC guarantees that *Readers don't block Writers, and Writers don't block Readers*.",
      "## How MVCC Works\n\nWhen a row is updated, MVCC does not overwrite the old data in-place. Instead, it creates a brand new version of the row, tagged with a transaction ID (or a timestamp).\n- **Read Operations**: A transaction reads the specific version of the row that existed at the exact moment the transaction started (creating a 'Snapshot' of the database).\n- **Write Operations**: An update creates `Version N+1`. Meanwhile, concurrent transactions still reading `Version N` are entirely unaffected.",
      "## The Garbage Collection Problem (Vacuuming)\n\nBecause old versions of rows are kept around to satisfy aging read transactions, the database can bloat immensely with 'dead tuples'.\n- **PostgreSQL**: Implements MVCC by keeping old and new versions in the same main table. Requires a background thread (Auto-vacuum) to physically delete old row versions once no active transaction needs them.\n- **MySQL (InnoDB)**: Keeps the newest version in the main table and stores the older versions in an Undo Log.",
      "## Handling Write Conflicts\n\nIf Transaction A and Transaction B both attempt to update the exact same row concurrently, MVCC cannot save them. The first transaction wins (obtains a row-level lock), and the second transaction either blocks or fails immediately (Serializable failure)."
    ],
    interviewTips: [
      "MVCC is heavily tested in Senior Backend interviews. The exact phrase to say is 'Readers DO NOT block Writers'.",
      "Understand the Postgres `VACUUM` concept—if someone asks 'Why did our database disk usage spike despite doing mostly UPDATEs?', the answer is MVCC tuple bloat and a failing auto-vacuum.",
      "Explain how MVCC implements the 'Repeatable Read' isolation level purely through snapshots."
    ],
    commonQuestions: [
      "Explain the fundamental mechanism of MVCC.",
      "How does MVCC prevent Dirty Reads?",
      "Why does a database using MVCC need a Garbage Collector or Vacuum process?",
      "Can MVCC resolve two transactions writing to the exact same row simultaneously?"
    ],
    companies: ["Stripe", "Uber", "Amazon", "Twilio", "Discord"]
  },

  database_indexes_internal: {
    title: "B-Tree vs Hash Indexes Internals",
    subject: "Database Management",
    readTime: "10 min",
    content: [
      "While everyone knows indexes speed up DB queries, the internal data structure defines their limitations.",
      "## The B+ Tree (The Industry Standard)\n\nA self-balancing tree data structure designed specifically for block-oriented storage (hard drives). Almost all RDBMS default indexes are B+ Trees.\n- **Structure**: Internal nodes contain only keys (for routing). All the actual data pointers exist strictly at the bottom Leaf level. The leaves are linked together in a Doubly Linked List.\n- **Strengths**: Perfect for Range Queries (`WHERE age > 18 AND age < 30`) because once you find 18, you just walk the linked list of leaves linearly. Good for Prefix queries (`WHERE name LIKE 'Sm%'`).\n- **Weaknesses**: Slight overhead in tree traversal. Updating data (insert/delete) can cause expensive 'Node Splits' to rebalance the tree.",
      "## Hash Indexes\n\nUses a hash function to map keys directly to buckets.\n- **Strengths**: O(1) exact-match lookup (`WHERE id = 42`). Faster than a B+ Tree for simple equality.\n- **Weaknesses**: Completely useless for Range Queries (hashes are essentially random strings, so `id > 40` means nothing). Useless for prefix matching or sorting (`ORDER BY`). Postgres dropped almost all support for hash indexes until v10 because WAL couldn't replicate them safely.",
      "## Bitmap Indexes\n\nUsed when cardinality is very low (e.g., column `gender` or `is_active`). Instead of storing a list of row IDs for 'Male', it stores a single bit array where the Nth bit is 1 if row N is Male. Extremely fast for combining multiple low-cardinality filters using bitwise AND/OR. Commonly used in Data Warehouses."
    ],
    interviewTips: [
      "Know exactly why a B+ Tree is preferred over a standard Binary Search Tree (BST) for databases: B+ trees have massive branching factors (fanout), meaning the tree is extremely shallow (often just 3-4 levels deep even for a billion rows), minimizing disk I/O.",
      "Always clarify the Leaf-Level Linked List in B+ Trees, which is exactly how range queries achieve high performance.",
      "Remember: Hash index = Exact match only. B+ Tree = Exact match, Sorting, and Range."
    ],
    commonQuestions: [
      "Why do relational databases use B+ Trees instead of Hash Tables as the default index?",
      "Explain the structural difference between a B-Tree and a B+Tree.",
      "When would you explicitly use a Bitmap Index?",
      "Why is a standard Binary Search Tree terrible for disk-based databases?"
    ],
    companies: ["Oracle", "Microsoft", "Snowflake", "Databricks", "SAP"]
  },

  graph_databases: {
    title: "Graph Databases (Neo4j)",
    subject: "Database Management",
    readTime: "9 min",
    content: [
      "Relational databases are terrible at querying highly interconnected data (like social networks or recommendation engines). Graph Databases inherently model data as Networks.",
      "## Nodes, Edges, and Properties\n\n- **Nodes (Vertices)**: The entities (e.g., User 'Alice', Movie 'The Matrix').\n- **Edges (Relationships)**: The connections between nodes (e.g., 'LIKES', 'FRIENDS_WITH'). Unlike foreign keys, Edges are first-class citizens with explicit direction and semantic meaning.\n- **Properties**: Both Nodes and Edges can hold key-value attributes (e.g., a 'FRIENDS_WITH' edge can have a `since: 2021` property).",
      "## Index-Free Adjacency\n\nThe secret to Graph DB performance. In SQL, finding 'Friends of Friends' requires multiple expensive `JOIN` operations involving index lookups on junction tables. In a Graph DB, every node contains physical pointers to all adjacent nodes. Traversing a relationship is an instantaneous O(1) pointer hop, regardless of the database's total size.",
      "## Cypher vs SQL\n\nGraph databases use languages like Cypher (Neo4j) or Gremlin. Cypher uses ASCII-art syntax to map patterns: `(u:User {name:'Alice'})-[:LIKES]->(m:Movie)`."
    ],
    interviewTips: [
      "Index-Free Adjacency is the buzzword that proves you understand Graph databases at a mechanical level.",
      "Use cases are critical: Fraud Detection (finding rings of accounts sending money to each other), Recommendation Engines (Users who bought X also bought Y), and Route optimization.",
      "Do not suggest Graph DBs for simple CRUD apps or time-series data; they are highly specialized."
    ],
    commonQuestions: [
      "Why is SQL naturally bad at querying 'Friends of Friends of Friends'?",
      "What is Index-Free Adjacency?",
      "Give three real-world use cases where a Graph Database would heavily outperform a Relational Database.",
      "How are properties stored on Edges?"
    ],
    companies: ["Meta", "LinkedIn", "Uber", "Palantir", "Neo4j"]
  },

  timeseries_databases: {
    title: "Time-Series Databases (TSDB)",
    subject: "Database Management",
    readTime: "8 min",
    content: [
      "A Time-Series Database (e.g., InfluxDB, Prometheus, TimescaleDB) is hyper-optimized for handling data that is indexed primarily by time. This data is typically Append-Only, high-volume, and numerical.",
      "## The Workload Profile\n\n- **Writes**: Massive write volume (sensors, server metrics, stock ticks dumping thousands of points per second). Writes are almost always `INSERT`s (Append-only). `UPDATE`s are exceptionally rare.\n- **Reads**: Queries almost always aggregate data over time windows (e.g., `SELECT AVG(cpu_load) GROUP BY 5_minute_windows`).",
      "## TSDB Optimizations\n\n1. **Data Compression**: Because sequential time-series points are very similar, TSDBs use heavy Delta-of-Delta compression (e.g., Gorilla compression), packing massive data into minimal disk space.\n2. **Retention Policies**: Built-in mechanisms to auto-delete old data (e.g., 'Delete raw data older than 30 days').\n3. **Continuous Queries & Downsampling**: The DB can auto-aggregate old data. (e.g., Keep per-second granularity for 7 days, but automatically crunch it into 1-hour averages for data older than a week to save space).",
      "## TimescaleDB (Postgres Extension)\n\nInstead of building a ground-up TSDB like InfluxDB, TimescaleDB simply extends Postgres. It automatically partitions standard tables logically by time (called Hypertables), providing TSDB speed scaling while letting developers use standard SQL."
    ],
    interviewTips: [
      "TSDBs are synonymous with DevOps (Metrics monitoring) and IoT (Sensor arrays).",
      "To show deep knowledge, mention Downsampling and Delta-of-Delta compression—this proves you know how they physically differ from RDBMS under the hood.",
      "If asked to architect a system for collecting Stock Market ticks, definitively choose a TSDB."
    ],
    commonQuestions: [
      "How does the workload of a Time-Series DB differ from a standard OLTP DB?",
      "What is Data Downsampling?",
      "Why is a standard B-Tree index often a bad choice for massive Time-Series inserts?",
      "Explain how Delta encoding compresses time-series data."
    ],
    companies: ["Datadog", "Bloomberg", "Robinhood", "Tesla (IoT)", "Prometheus users"]
  },

  two_phase_commit: {
    title: "Two-Phase Commit (2PC)",
    subject: "Database Management",
    readTime: "10 min",
    content: [
      "To guarantee ACID properties in a distributed system, an atomic commit protocol is required. A transaction spread across Database A and Database B must either completely commit on both, or completely roll back on both.",
      "## The Protocol Steps\n\nThe system utilizes a central **Coordinator** and multiple **Participants** (nodes).\n1. **Phase 1: Prepare (Voting)**\n   - The Coordinator sends a `PREPARE` message to all nodes.\n   - Each node executes the transaction logic locally, writes the impending changes safely to its WAL (Disk), and replies `YES` or `NO` (if it deadlocked or failed constraints).\n2. **Phase 2: Commit (Resolution)**\n   - If the Coordinator receives `YES` from **ALL** nodes, it sends a `COMMIT` message to all nodes. The nodes make the changes permanent.\n   - If the Coordinator receives even one `NO` (or a node times out), it sends an `ABORT` (Rollback) message to all nodes.",
      "## The Flaws of 2PC\n\n- **Blocking / Synchronous**: All participants must lock their resources while waiting for the Coordinator's Phase 2 instruction. If the network is slow, overall throughput dies.\n- **Single Point of Failure**: If the Coordinator crashes exactly after everyone votes `YES` but before it sends the `COMMIT`, the participants are stuck holding locks indefinitely (they cannot safely proceed or rollback). This requires complex manual administrator intervention or a 3-Phase Commit (3PC)."
    ],
    interviewTips: [
      "2PC is the definitive answer for Distributed Transactions, but modern architectures avoid it heavily due to its synchronous blocking nature.",
      "The 'Coordinator Crash' failure state is the most common follow-up question. Understand why participants are left hanging in a 'Doubt' state.",
      "To score highly, contrast 2PC with the Saga Pattern, which relies on asynchronous eventual consistency and compensating transactions instead of strict synchronous locking."
    ],
    commonQuestions: [
      "Explain the exact two phases of the Two-Phase Commit protocol.",
      "What happens if a participating node crashes during Phase 1?",
      "What happens if the Coordinator crashes after receiving all YES votes but before sending a decision?",
      "Why do modern Microservice architectures often avoid 2PC?"
    ],
    companies: ["Amazon", "Google", "Stripe", "Uber", "Block"]
  },

  oltp_vs_olap: {
    title: "OLTP vs OLAP Architecture",
    subject: "Database Management",
    readTime: "8 min",
    content: [
      "Different database architectures handle operational day-to-day transactions and heavy business intelligence analytics.",
      "## OLTP (Online Transaction Processing)\n\n- **Purpose**: Powering the live application (e.g., User processing a cart buyout). \n- **Workload**: Thousands of tiny, lightning-fast queries per second. Heavy on `INSERT`, `UPDATE`, `DELETE`.\n- **Schema**: Highly Normalized (3NF) to prevent data anomalies and ensure fast writes.\n- **Storage**: Row-oriented (stores all data for a single row contiguously on disk). Suitable for `SELECT * FROM users WHERE id = 5`.\n- **Examples**: PostgreSQL, MySQL, SQL Server.",
      "## OLAP (Online Analytical Processing)\n\n- **Purpose**: Business Intelligence, Machine Learning, Data Warehousing (e.g., 'What was the average cart value of users in Ohio last year?').\n- **Workload**: A few massive, long-running read queries scanning billions of rows. Virtually no `UPDATE`s.\n- **Schema**: Denormalized (Star Schema / Snowflake Schema) to prevent expensive joins.\n- **Storage**: Column-oriented (stores all data for a single column contiguously on disk). If a table has 100 columns but the query only sums `amount`, a columnar DB only reads standard `amount` data from disk, reducing I/O drastically.\n- **Examples**: Snowflake, Amazon Redshift, Google BigQuery.",
      "## ETL (Extract, Transform, Load)\n\nThe bridge between them. Live data is periodically extracted from the OLTP system, transformed (cleaned/denormalized), and loaded into the OLAP Data Warehouse."
    ],
    interviewTips: [
      "The ultimate differentiator to mention is Row-oriented (OLTP) vs Column-oriented (OLAP) storage mapping on disk.",
      "Explain that analytical queries in OLTP systems will destroy performance. Never run a 3-minute BI `GROUP BY` query on the production OLTP database.",
      "Understand the 'Star Schema' (a central Fact table surrounded by Dimension tables)."
    ],
    commonQuestions: [
      "Contrast the typical workload of OLTP vs OLAP systems.",
      "Why are OLTP databases normalized while OLAP databases are heavily denormalized?",
      "Explain Row-oriented vs Column-oriented disk storage.",
      "What is ETL and why is it necessary?"
    ],
    companies: ["Snowflake", "Databricks", "Amazon (Redshift)", "Google (BigQuery)", "Palantir"]
  },

  bloom_filters: {
    title: "Bloom Filters in Databases",
    subject: "Database Management",
    readTime: "9 min",
    content: [
      "A Bloom Filter is a wildly space-efficient probabilistic data structure that tests whether an element is a member of a set.",
      "## The Mechanics\n\nIt consists of a bit array (all initially set to 0) and multiple different hash functions.\n- **Insert**: Hash the element through exactly `k` hash functions. Each result gives an array index. Set those bits to 1.\n- **Check**: Hash the requested element through the same `k` functions. Check the bits at those indices.\n  - If ANY bit is 0, the element is **definitely not** in the set.\n  - If ALL bits are 1, the element is **probably** in the set (there is a small chance of a False Positive due to hash collisions from other elements).",
      "## The Database Application\n\nDisk I/O is the slowest part of any database. If a user queries for `user_id = 9999` and that user does not exist on disk, searching the B-Tree on disk just to find nothing is a massive waste of resources.\nBy keeping a tiny Bloom Filter in fast RAM representing all existing IDs, the database checks the filter first:\n- If it says 'Not Present', the database skips the disk I/O entirely (massive speedup).\n- If it says 'Probably Present', the database performs the disk I/O. If it's a false positive, it wastes one disk seek, but the overall system performance skyrockets.",
      "## Specific Implementations\n\n- **Cassandra & HBase**: Rely heavily on Bloom Filters to avoid scanning SSTables on disk for keys that don't exist.\n- **Postgres**: Uses Bloom Filters when performing massive Hash Joins between tables."
    ],
    interviewTips: [
      "The exact phrase to memorize: 'A Bloom filter guarantees no False Negatives, but allows a configurable margin of False Positives.'",
      "Mention that you cannot DELETE an element from a standard Bloom Filter (because un-setting a bit might accidentally erase the existence of a colliding element). Counting Bloom Filters solve this.",
      "Used extensively in CDNs to avoid caching requests that are only seen once (preventing Cache pollution)."
    ],
    commonQuestions: [
      "What is a Bloom Filter and what are its probabilistic guarantees?",
      "How does a database utilize a Bloom Filter to optimize read performance?",
      "Why can't you easily remove an item from a standard Bloom filter?",
      "Explain the trade-off in sizing the bit array vs the False Positive rate."
    ],
    companies: ["Google", "Cloudflare", "Netflix", "Meta", "Redis"]
  },

  arp_ndp: {
    title: "ARP & NDP Deep Dive",
    subject: "Computer Networks",
    readTime: "9 min",
    content: [
      "IP addresses are logical identifiers used for routing across the internet (Layer 3). MAC addresses are physical, hardcoded hardware identifiers used for switching within a local network (Layer 2). ARP bridges these two worlds.",
      "## IPv4: Address Resolution Protocol (ARP)\n\nWhen a computer wants to send data to an IP address on its *local* subnet, it must know the destination's MAC address to form an Ethernet frame.\n- **ARP Request**: The sender broadcasts a message to `FF:FF:FF:FF:FF:FF`: 'Who has IP 192.168.1.50? Tell 192.168.1.10'.\n- **ARP Reply**: The machine with that IP unicasts its MAC address back: 'I have 192.168.1.50, my MAC is 00:1A:2B:3C:4D:5E'.\n- **ARP Cache**: To prevent endless broadcasting, machines cache the IP-to-MAC mapping temporarily.",
      "## The Security Flaw: ARP Spoofing\n\nARP is a completely trusting protocol. A malicious actor on a local network can continuously send unsolicited ARP Replies ('Gratuitous ARP') to a victim machine, falsely claiming that the attacker's MAC address belongs to the Default Gateway's IP address. The victim's traffic is now routed to the attacker (Man-In-The-Middle).",
      "## IPv6: Neighbor Discovery Protocol (NDP)\n\nIPv6 does not use ARP or broadcast. It uses NDP, which relies on more efficient Multicast ICMPv6 messages. Instead of waking up every device on the network (Broadcast), it only wakes up devices listening to specific Multicast groups."
    ],
    interviewTips: [
      "Always clarify that ARP ONLY works on the local network. You do not ARP for Google's IP address. You ARP for your Router's IP address to send the packet to Google.",
      "ARP Spoofing is the classic entry-level networking security question. Explain how it enables Man-In-The-Middle (MITM) attacks.",
      "Mentioning that IPv6 replaces ARP with NDP using Multicast shows advanced, forward-looking knowledge."
    ],
    commonQuestions: [
      "Why do we need MAC addresses if we already have IP addresses?",
      "Explain the exact step-by-step process of an ARP Request and Reply.",
      "How does an ARP Spoofing attack work mechanically?",
      "How does IPv6 handle physical address resolution without ARP?"
    ],
    companies: ["Cisco", "Palo Alto Networks", "Juniper", "Cloudflare", "Arista Networks"]
  },

  icmp: {
    title: "ICMP & Network Diagnostics",
    subject: "Computer Networks",
    readTime: "8 min",
    content: [
      "The Internet Control Message Protocol (ICMP) operates at the Network Layer (Layer 3) alongside IP, but strictly for error reporting and diagnostics, not data transfer.",
      "## Core Capabilities\n\nWhen a router drops a packet (because the TTL expired, or the destination network is unreachable), it generates an ICMP message and sends it back to the original source.\n- **Destination Unreachable**: Tells the sender a router cannot find a path.\n- **Time Exceeded**: Tells the sender a packet's TTL hit 0 and was dropped (preventing infinite routing loops).",
      "## Ping and Traceroute\n\n- **Ping**: Uses ICMP `Echo Request` and `Echo Reply` messages to check if a host is alive and measure Round-Trip Time (RTT).\n- **Traceroute**: A brilliant hack utilizing the `Time To Live (TTL)` field. It sends packets with TTL=1. The first router drops it and sends back an ICMP 'Time Exceeded'. Traceroute records the router's IP. It then sends TTL=2, finding the second router. This continues until the destination is reached, mapping the entire network path hop-by-hop.",
      "## ICMP Security & Smurf Attacks\n\nMany networks block ICMP entirely to prevent mapping. A classic DDoS technique (Smurf Attack) involves spoofing the victim's IP address and broadcasting an ICMP Echo Request to a massive network. Every machine on that network replies simultaneously to the victim, crushing it with traffic."
    ],
    interviewTips: [
      "Explaining exactly how `traceroute` abuses the TTL field to provoke ICMP Time Exceeded errors is a phenomenal interview answer.",
      "Be aware that ICMP does NOT use ports. TCP/UDP use ports. ICMP is purely an IP-level protocol.",
      "Know why server admins often block ICMP (to prevent network discovery and specific DoS vectors)."
    ],
    commonQuestions: [
      "What is the primary purpose of ICMP?",
      "Explain mechanically exactly how the `traceroute` command discovers the path to a server.",
      "Does ICMP use TCP or UDP? (Trick question: Neither).",
      "What is a Smurf Attack?"
    ],
    companies: ["Google", "Amazon AWS", "Akamai", "Fastly", "Cloudflare"]
  },

  http_versions: {
    title: "HTTP/1.1 vs HTTP/2 vs HTTP/3",
    subject: "Computer Networks",
    readTime: "11 min",
    content: [
      "The web's foundational protocol has evolved drastically to solve the physical limitations of latency and TCP connections.",
      "## HTTP/1.1 (The Standard)\n\n- **Text-Based**: Sent as plain text headers.\n- **Keep-Alive**: Reuses a single TCP connection for multiple requests to avoid the expensive TCP 3-way handshake on every image download.\n- **The Flaw**: Head-of-Line (HoL) Blocking. It is synchronous. If you request `index.js` and `logo.png` on the same connection, the server must send `index.js` completely before starting `logo.png`. If `index.js` drops a packet, the whole pipe stalls.",
      "## HTTP/2 (The Multiplexer)\n\nOverhauled to fix efficiency while keeping the same semantics (GET, POST, Headers).\n- **Binary Framing**: Broken down into binary frames rather than plain text.\n- **Multiplexing**: Solves HTTP-level HoL blocking. Multiple requests and responses can be interleaved on a single TCP connection simultaneously. `logo.png` can stream right alongside `index.js`.\n- **Server Push**: The server can preemptively send resources (CSS/JS) it knows the client will need before the client asks.",
      "## HTTP/3 (QUIC Protocol)\n\nHTTP/2 solved HTTP-level HoL blocking, but TCP-level HoL blocking remained. If a single TCP packet is dropped, the OS halts all streams on that connection until it's retransmitted.\n- **Powered by UDP**: HTTP/3 abandons TCP completely. It runs on QUIC, built entirely over UDP.\n- **Stream Independence**: If Stream A drops a packet, ONLY Stream A pauses. Stream B happily continues instantly. Drastically improves web performance on unstable mobile networks.\n- **0-RTT Handshakes**: Integrates TLS directly, reducing connection setup from 3 round-trips to often zero."
    ],
    interviewTips: [
      "The evolution of HTTP is entirely about fighting Latency and the Head-of-Line blocking problem. Focus strictly on these two themes.",
      "Know that HTTP/3 running on UDP does not mean it is unreliable; the reliability and ordering logic was just moved from the OS Kernel (TCP) up into the User-Space QUIC protocol.",
      "Server Push in HTTP/2 sounds amazing but is rarely used in practice today due to complex caching issues."
    ],
    commonQuestions: [
      "What is Head-of-Line Blocking in HTTP/1.1?",
      "How did HTTP/2's Multiplexing solve HTTP Head-of-Line blocking?",
      "Why did HTTP/3 abandon TCP in favor of UDP?",
      "What is 0-RTT in the context of QUIC?"
    ],
    companies: ["Netflix", "Meta", "Google", "Cloudflare", "Spotify"]
  },

  websocket_webrtc: {
    title: "WebSockets vs WebRTC",
    subject: "Computer Networks",
    readTime: "9 min",
    content: [
      "HTTP is fundamentally Request-Response. The client must ask. Real-time applications (Chat, Live Video) require Server-Push capability and low latency.",
      "## WebSockets (TCP)\n\n- **How it works**: It starts as a standard HTTP `GET` request with an `Upgrade: websocket` header. If the server agrees, the connection is \"upgraded\" into a persistent, full-duplex TCP connection.\n- **Usage**: Both client and server can send messages to each other independently at any time.\n- **Best For**: Chat applications, Live Stock Tickers, Multiplayer Browser Games. (Reliability is guaranteed via TCP).",
      "## WebRTC (UDP + P2P)\n\nWeb Real-Time Communication is a massive suite of protocols designed for Peer-to-Peer media streaming.\n- **How it works**: Browsers connect directly to each other, bypassing the central server entirely (except for initial signaling to swap IP addresses).\n- **Protocol**: Uses UDP heavily (specifically RTP/SRTP) because dropping a video frame is better than stuttering the entire video while waiting for a retransmission (TCP).\n- **NAT Traversal**: Because both peers are likely behind private NAT routers, WebRTC requires STUN/TURN servers just to punch holes through the firewalls and discover each other's public IPs."
    ],
    interviewTips: [
      "WebSockets = Client-to-Server, Reliable, Text/Binary data. WebRTC = Peer-to-Peer, Unreliable/Fast, Video/Audio data.",
      "Understand the upgrade handshake of WebSockets—it's brilliant because it reuses ports 80/443, naturally sneaking past corporate firewalls that block custom TCP ports.",
      "Mentioning STUN and TURN when discussing WebRTC demonstrates practical implementation knowledge of NAT punching."
    ],
    commonQuestions: [
      "How does a WebSocket connection securely sneak past firewalls that block weird TCP ports?",
      "Why is UDP superior to TCP for a real-time Zoom video call?",
      "What is the difference between WebSockets and WebRTC?",
      "What is the purpose of a STUN server in WebRTC?"
    ],
    companies: ["Discord", "Zoom", "Slack", "Twitch", "Meta"]
  },

  vpns_ipsec: {
    title: "VPNs, IPsec, and Tunneling",
    subject: "Computer Networks",
    readTime: "10 min",
    content: [
      "A Virtual Private Network (VPN) creates a secure, encrypted 'tunnel' over an untrusted network (the Internet), making remote devices act as if they are physically on the same local network.",
      "## Tunneling Concepts\n\nTunneling is simply encapsulation. You take an entire IP packet (Payload + IP Header) encrypt it, and stuff it as the payload inside a BRAND NEW IP packet addressed to the VPN server. \n- When the VPN server receives the outer packet, it strips it, decrypts the inner original packet, and injects it into the private network.",
      "## IPsec (Internet Protocol Security)\n\nThe enterprise standard for VPNs. Operates at Layer 3 (Network).\n- **AH (Authentication Header)**: Guarantees packet integrity and prevents spoofing, but DOES NOT encrypt the payload. (Rarely used alone today).\n- **ESP (Encapsulating Security Payload)**: Encrypts the payload, ensuring data confidentiality. \n- **Tunnel Mode vs Transport Mode**: Transport Mode encrypts only the payload (used host-to-host). Tunnel Mode encrypts the entire original IP packet (payload + original headers) and wraps it in a new IP header (used network-to-network/VPN).",
      "## Modern Alternatives (WireGuard)\n\nIPsec is notoriously complex, bloated, and difficult to audit (millions of lines of code). WireGuard is a modern replacement built heavily into the Linux kernel (thousands of lines of code) using state-of-the-art cryptography for massive speed improvements."
    ],
    interviewTips: [
      "Tunneling is essentially 'Packet Inception'. Knowing how an IP header encapsulates another IP header is a key engineering concept.",
      "If interviewing at enterprise companies (Cisco, Banks), IPsec is mandatory knowledge. If interviewing at modern startups, mentioning WireGuard vs OpenVPN/IPsec shows you keep aligned with industry shifts.",
      "IPsec operates at Layer 3, making it completely invisible to the applications at Layer 7. They just send TCP as normal."
    ],
    commonQuestions: [
      "Explain the concept of encapsulation in a VPN Tunnel.",
      "What is the difference between IPsec Tunnel Mode and Transport Mode?",
      "Why is IPSec considered highly complex compared to modern alternatives like WireGuard?",
      "Does an application know if its traffic is being sent over a Layer 3 VPN?"
    ],
    companies: ["Palo Alto Networks", "Cisco", "Cloudflare", "NordVPN", "Apple"]
  },

  dns_internals: {
    title: "Advanced DNS (Anycast, DoH, SEC)",
    subject: "Computer Networks",
    readTime: "9 min",
    content: [
      "Basic DNS is simple: translating domain names to IP addresses. However, modern internet architecture requires massive redundancy, security, and global availability.",
      "## Anycast Routing (How 8.8.8.8 works)\n\nGoogle's Public DNS is `8.8.8.8`. But clearly, billions of global machines aren't talking to a single server in California. \n- **Anycast**: Multiple servers across the globe broadcast the exact same IP address (`8.8.8.8`) via BGP routing. \n- The internet backbone routers always send the client's packet to the *topologically closest* server. This drastically reduces latency and naturally absorbs massive DDoS attacks.",
      "## DNS over HTTPS (DoH) & DoT\n\nHistorically, DNS requests were mostly unencrypted UDP. Even on a secure TLS site, your ISP or a hacker in a coffee shop could intercept your DNS request and see exactly *what* domains you were visiting (or spoof the response).\n- **DoT (DNS over TLS)**: Wraps standard DNS requests in TLS on a dedicated port (853).\n- **DoH (DNS over HTTPS)**: Wraps the DNS request as a standard HTTPS web payload. Incredibly resistant to censorship because it looks like identical HTTP web traffic.",
      "## DNSSEC\n\nDoH protects the connection between the client and resolver. DNSSEC protects the integrity of the data itself. It uses public-key cryptography to digitally sign DNS records, ensuring that the IP address returned by the Root -> TLD -> Authoritative chain wasn't hijacked by an attacker (cache poisoning)."
    ],
    interviewTips: [
      "Anycast is the secret sauce of all Global CDNs and DNS providers. Understand that it relies heavily on BGP router configurations.",
      "Distinguish between Privacy (DoH - hiding what you ask from your ISP) and Integrity (DNSSEC - proving the answer hasn't been maliciously altered).",
      "Explain why traditional DNS cache poisoning was so easy (spoofing a UDP packet with a guessed Transaction ID)."
    ],
    commonQuestions: [
      "If `8.8.8.8` is one IP address, how can it exist in 100 data centers globally?",
      "What privacy/security problem does DNS-over-HTTPS (DoH) solve?",
      "What is DNS Cache Poisoning, and how does DNSSEC stop it?",
      "Why doesn't DNSSEC encrypt DNS queries?"
    ],
    companies: ["Cloudflare", "Google", "Fastly", "Akamai", "Amazon Route 53"]
  },

  load_balancing_algos: {
    title: "Load Balancing Algorithms",
    subject: "Computer Networks",
    readTime: "10 min",
    content: [
      "A Load Balancer distributes incoming network traffic across a group of backend servers. The algorithm chosen dictates fairness and efficiency.",
      "## Static/Stateless Algorithms\n\n- **Round Robin**: Requests are distributed sequentially (Server 1, Server 2, Server 3, Server 1...). Simple, but terrible if servers have different capacities or if some requests take 100x longer to process.\n- **Weighted Round Robin**: Servers are assigned weights based on hardware specs (e.g., Server A gets 3 requests for every 1 request Server B gets).\n- **IP Hash**: A hash of the client's IP address dictates the server. Guarantees a specific user ALWAYS hits the same server (Sticky Sessions). Useful for stateful applications without distributed caches.",
      "## Dynamic Algorithms\n\n- **Least Connections**: Sends the new request to the server with the fewest currently active connections. Excellent when request sizes vary drastically.\n- **Least Response Time**: Sends the request to the server responding the fastest overall, adjusting for latency.",
      "## Layer 4 vs Layer 7\n\n- **Layer 4 (Transport, L4LB)**: Distributes based strictly on IP and TCP/UDP ports. Extremely fast, doesn't inspect the traffic. It just forwards raw TCP streams.\n- **Layer 7 (Application, L7LB)**: Terminates the TLS connection, unwraps the HTTP packet, and routes based on URL paths (`/api` goes to Server A, `/video` goes to Server B) or HTTP headers."
    ],
    interviewTips: [
      "Always pivot the conversation to Layer 4 vs Layer 7 Load Balancing. It is the most common System Design networking question.",
      "Round Robin is the default answer for simplicity, but always follow up with 'Least Connections' as the production-ready answer.",
      "Know why Sticky Sessions (IP Hash) are generally considered poor practice in modern stateless Microservices architectures."
    ],
    commonQuestions: [
      "Describe the difference between a Layer 4 and Layer 7 Load Balancer.",
      "Why is Simple Round Robin often an inefficient choice for heavy web servers?",
      "What is 'Sticky Routing' (Session Affinity) and how is it implemented?",
      "When would you explicitly use Least Connections over Weighted Round Robin?"
    ],
    companies: ["Uber", "Nginx/F5", "Amazon AWS", "Stripe", "Netflix"]
  },

  oop_antipatterns: {
    title: "Common OOP Anti-Patterns",
    subject: "Object-Oriented Programming",
    readTime: "9 min",
    content: [
      "While Design Patterns provide proven solutions, *Anti-Patterns* are common but highly destructive ways of structuring object-oriented code.",
      "## The God Object\n\nA single class that knows too much or does too much. (e.g., `class GameManager` that handles rendering, physics, audio, network sync, and input). \n- **The Problem**: It violates the Single Responsibility Principle completely. Changing one feature breaks another. It becomes utterly un-testable and usually hits tens of thousands of lines of code.\n- **The Fix**: Break it down using Composition. `GameManager` should only coordinate an `AudioSystem`, a `PhysicsSystem`, etc.",
      "## Singleton Abuse (Global State)\n\nThe Singleton pattern ensures only one instance of a class exists. Junior developers abuse this to create globally accessible variables (`Database.getInstance().query()`).\n- **The Problem**: Global state hides dependencies. Your unit test might fail because a previous test modified the Singleton. It makes parallel testing impossible.\n- **The Fix**: Use Dependency Injection to pass the single instance explicitly into the classes that need it.",
      "## Primitive Obsession\n\nUsing basic primitives (`int`, `string`) to represent complex domain concepts. (e.g., `String zipCode`, `int money`, `String email`).\n- **The Problem**: You constantly duplicate validation logic across your app. An `int` doesn't know what currency it is.\n- **The Fix**: Create Value Objects (`ZipCode`, `Money`, `EmailAddress`) that encapsulate their own validation and logic."
    ],
    interviewTips: [
      "Critiquing poor architecture is a core Senior Developer skill. If asked 'What's wrong with Singletons?', immediately pivot to 'They hide dependencies and ruin unit testing'.",
      "Primitive Obsession is a great concept to drop in an interview when discussing DDD or Clean Code.",
      "Understand the 'Yo-Yo Problem'—when inheritance hierarchies get so deep (10+ levels) that a programmer must constantly 'yo-yo' up and down the files to figure out what a method actually does."
    ],
    commonQuestions: [
      "What is a God Object and why is it detrimental to a codebase?",
      "Why is the Singleton design pattern often considered an Anti-Pattern?",
      "What is Primitive Obsession?",
      "How do extremely deep inheritance trees harm code readability?"
    ],
    companies: ["Atlassian", "Epic Games", "Microsoft", "Google", "Shopify"]
  },

  event_driven_architecture: {
    title: "Event-Driven & Pub/Sub",
    subject: "Object-Oriented Programming",
    readTime: "10 min",
    content: [
      "Object-Oriented systems often fall into the trap of tight coupling, where `Object A` directly calls `Object B`. Event-Driven Architecture (EDA) decouples them entirely using messages.",
      "## The Publisher-Subscriber (Pub/Sub) Model\n\n- **Publishers**: Create and emit 'Events' (e.g., `OrderPlacedEvent`). They have absolutely no idea who is listening to them.\n- **Subscribers**: Listen for specific events and react to them (e.g., `EmailService` listens for `OrderPlacedEvent` to send a receipt). They have no idea who published the event.\n- **The Event Bus (Broker)**: The central middleware (like Kafka, RabbitMQ, or an in-memory Event Emitter) that routes the events from publishers to subscribers.",
      "## The Observer Pattern vs Pub/Sub\n\n- **Observer Pattern**: The Subject maintains a direct list of its Observers. (Subject A knows about Observer B). It's highly synchronous.\n- **Pub/Sub**: A true broker exists in the middle. The Publisher and Subscriber are perfectly separated topologically, geographically, and temporally. It's highly asynchronous.",
      "## Event Sourcing\n\nAn advanced EDA concept. Instead of storing the *current state* of an object (e.g., `Balance: $50`), the database stores the *entire history of events* (`Deposited $100`, `Withdrew $50`). The current state is derived by replaying the events. This provides a perfect, unalterable audit log."
    ],
    interviewTips: [
      "EDA is the de facto standard for breaking up Monolithic Object-Oriented applications into Microservices.",
      "Highlight the ultimate benefit: 'I can add a brand new `AnalyticsService` tomorrow that listens to `OrderPlacedEvent`, and I don't have to change a single line of code in the `OrderService`.'",
      "Be prepared to discuss the main drawback: Eventual Consistency and tracking bugs across asynchronous boundaries."
    ],
    commonQuestions: [
      "What is the difference between the standard Observer Pattern and Pub/Sub?",
      "How does Event-Driven Architecture enforce decoupling?",
      "What is Event Sourcing?",
      "What is the main drawback of highly asynchronous, event-driven microservices?"
    ],
    companies: ["Uber", "Netflix", "Spotify", "Amazon", "Twitch"]
  },

  cqrs_pattern: {
    title: "CQRS Pattern Deep Dive",
    subject: "Object-Oriented Programming",
    readTime: "9 min",
    content: [
      "CQRS (Command Query Responsibility Segregation) is an architectural pattern that states that the data models used to *update* information should be strictly separated from the data models used to *read* information.",
      "## The Core Philosophy\n\nIn standard CRUD (Create, Read, Update, Delete), we use the exact same `User` entity to save data to the DB and to display data on the UI. \n- As business logic scales, the Read logic (which often joins 5 tables) becomes terrifyingly complex compared to the Write logic (which just updates a status field).\n- CQRS physically splits them. You create **Commands** (do something: `MakeUserAdminCommand`) and **Queries** (get something: `GetUserDetailsQuery`).",
      "## Two Databases (Advanced CQRS)\n\nTrue CQRS often involves splitting the storage entirely.\n- **Write Database (Command Side)**: A highly normalized relational DB (Postgres) ensuring absolute ACID strictness and business invariants.\n- **Read Database (Query Side)**: A completely denormalized NoSQL DB (MongoDB or ElasticSearch) optimized entirely for blazing-fast reads. \n- **The Bridge**: The Write DB publishes an Event when data changes. The Read DB listens to the event and updates its customized 'Read Models'.",
      "## Trade-offs\n\nCQRS adds immense complexity. It forces the system into Eventual Consistency (the Read DB might be a few milliseconds behind the Write DB). It should only be used in highly complex domains, not simple CRUD APIs."
    ],
    interviewTips: [
      "Never suggest CQRS for a simple blog application. Always frame it as a solution for high-complexity, high-scale domains where read workloads radically differ from write workloads.",
      "CQRS almost almost goes hand-in-hand with Event Sourcing (ES). They are the 'CQRS/ES' duo.",
      "Know that Bertrand Meyer coined the original CQS principle ('a method should either change state or return state, never both')."
    ],
    commonQuestions: [
      "What does CQRS stand for and what problem does it solve?",
      "How does CQRS differ from standard CRUD?",
      "Why does advanced CQRS usually introduce Eventual Consistency?",
      "In what scenario is CQRS a terrible architectural choice?"
    ],
    companies: ["Microsoft", "ThoughtWorks", "Uber", "Square", "Stripe"]
  },

  mixins_traits: {
    title: "Mixins and Traits",
    subject: "Object-Oriented Programming",
    readTime: "8 min",
    content: [
      "Most modern OOP languages (Java, C#, Ruby, PHP) prohibit Multiple Class Inheritance to avoid the 'Diamond Problem'. However, developers still need a way to reuse specific bundles of behavior across unrelated classes.",
      "## The Diamond Problem\n\nIf Class A has a `jump()` method. Class B and Class C inherit from A and both override `jump()`. If Class D inherits from *both* B and C, and D calls `jump()`, which version runs? B's or C's? This terrifying ambiguity is why Multiple Inheritance is banned.",
      "## Mixins (Ruby, Dart)\n\nA Mixin is a class that contains methods for use by other classes without having to be the parent class of those other classes. \n- In Ruby, if you want your `User` class and `Invoice` class to both be `Loggable`, you don't make them inherit from a `BaseLogger` (because they aren't Loggers, they are business entities). \n- Instead, you `include Loggable` (the Mixin). The compiler effectively copies the Mixin's methods directly into the target class.",
      "## Traits (PHP, Rust, Scala)\n\nVery similar to Mixins. A Trait is a mechanism for code reuse in single inheritance languages. It reduces limitations by enabling a developer to reuse sets of methods freely in several independent classes living in different class hierarchies.\n- Traits actively solve method conflicts. If two traits provide the exact same method, the developer **must** explicitly resolve the conflict in the importing class, preventing the Diamond Problem."
    ],
    interviewTips: [
      "Understanding the exact mechanics of the Diamond Problem is critical. Be prepared to draw it on a whiteboard.",
      "If you use Python, mention that Python *does* support Multiple Inheritance and solves the Diamond Problem using MRO (Method Resolution Order; C3 Linearization).",
      "Mixins and Traits favor Composition-like behavior over strict IS-A Inheritance."
    ],
    commonQuestions: [
      "What is the 'Diamond Problem' in Multiple Inheritance?",
      "Why were Mixins and Traits created?",
      "If a class imports a Trait, is that an IS-A relationship or a HAS-A relationship?",
      "How does Python handle Multiple Inheritance conflicts without failing?"
    ],
    companies: ["Shopify (Ruby)", "Meta (PHP/Hack)", "Twitter (Scala)", "GitHub", "Atlassian"]
  },

  reflection_metaprogramming: {
    title: "Reflection & Metaprogramming",
    subject: "Object-Oriented Programming",
    readTime: "11 min",
    content: [
      "Metaprogramming is writing code that writes, modifies, or inspects other code at runtime. Reflection is the primary tool used to achieve this in OOP languages.",
      "## Reflection (Java, C#)\n\nReflection allows an executing program to examine or 'introspect' upon itself, and manipulate internal properties of the program.\n- **Capabilities**: You can instantiate a class just by knowing its name as a string (`Class.forName(\"User\")`). You can find all private methods of a class and forcibly invoke them, bypassing standard encapsulation (Access Modifiers).\n- **Use Cases**: It is the absolute backbone of almost all modern Enterprise Frameworks. When you add `@Autowired` or `@Inject` in Spring, the framework uses Reflection to scan your classes at runtime, read the annotations, and inject the instances.",
      "## Duck Punching / Monkey Patching (Ruby, JS)\n\nIn dynamic languages, metaprogramming allows you to literally alter a class out from under the rest of the application at runtime.\n- You can simply rewrite the `String.length` function globally in JavaScript so that it always returns 42. Extremely powerful, but incredibly dangerous as it changes the behavior of third-party libraries globally.",
      "## The Dangers of Reflection\n\n- **Performance**: Reflection is notoriously slow. The compiler cannot optimize it, and security checks must be run dynamically.\n- **Type Safety**: It shatters compile-time type safety. Mistakes won't be caught until the app crashes in production.\n- **Security**: It bypasses the `private` keyword, allowing rogue code to manipulate secure internal state."
    ],
    interviewTips: [
      "Connect Reflection immediately to Dependency Injection frameworks (Spring, Guice) or ORMs (Hibernate). Without Reflection, these magical frameworks could not exist.",
      "Always list the big trio of Reflection drawbacks: 1. Slow Performance, 2. Loss of Type Safety, 3. Violation of Encapsulation.",
      "Be aware that languages like Go use a specialized `reflect` package, while Python treats metadata reading natively via `__dict__`."
    ],
    commonQuestions: [
      "What is Reflection in the context of Java or C#?",
      "How does an IoC container (like Spring) use Reflection under the hood?",
      "What are the severe performance and security drawbacks of overusing Reflection?",
      "What is Monkey Patching in dynamic languages?"
    ],
    companies: ["Pivotal (Spring)", "Oracle", "Microsoft", "Shopify", "Stripe"]
  },

  actor_model: {
    title: "The Actor Model (Akka, Erlang)",
    subject: "Object-Oriented Programming",
    readTime: "10 min",
    content: [
      "State mutability and threads are the hardest problems in OOP. Locks and Mutexes cause deadlocks and kill performance. The Actor Model solves concurrency entirely without a single Lock.",
      "## Everything is an Actor\n\nUnlike standard objects, an Actor is a completely isolated entity that encapsulates its State and Behavior. \n- **No Shared Memory**: Two actors absolutely NEVER share memory. They cannot access each other's variables under any circumstances.",
      "## Asynchronous Message Passing\n\nIf Actor A wants Actor B to do something, it must send an immutable Message to Actor B's 'Mailbox'.\n- Actor B reads messages from its mailbox strictly sequentially, one at a time.\n- Because Actor B only processes one message at a time, its internal state is never accessed concurrently by multiple threads. Therefore, **Locks/Mutexes are completely obsolete**.",
      "## Fault Tolerance ('Let It Crash')\n\nPopularized by Erlang (used in WhatsApp/Discord telecoms). Actors form massive hierarchies. If a worker actor hits a critical error, it doesn't try to catch it and limp along. It purposefully crashes.\n- Its Supervisor Actor sees the crash, completely wipes the dead actor from memory, and instantly spawns a brand new, clean replacement actor. This guarantees the system heals itself automatically."
    ],
    interviewTips: [
      "If asked 'How do you prevent Deadlocks in a highly concurrent system?', the Actor Model is an elite-level architectural response.",
      "Emphasize the 'Mailbox' and 'No Shared Memory' concepts. That is the core of why Actors are thread-safe without locks.",
      "Mentioning Erlang or Scala/Akka proves you have looked outside standard Java/C# ecosystem paradigms."
    ],
    commonQuestions: [
      "How does the Actor Model completely eliminate the need for Locks and Mutexes?",
      "Describe how two Actors communicate with each other.",
      "What does the 'Let it Crash' philosophy mean in the Actor Model?",
      "Compare the Actor Model to traditional multithreaded shared-memory concurrency."
    ],
    companies: ["WhatsApp/Meta", "Discord", "Riot Games", "Epic Games", "Twitter"]
  },

  hexagonal_architecture: {
    title: "Hexagonal Architecture (Ports & Adapters)",
    subject: "Object-Oriented Programming",
    readTime: "11 min",
    content: [
      "Coined by Alistair Cockburn, Hexagonal Architecture (Ports and Adapters) is a design pattern intended to create loosely coupled application components that can be easily connected to their software environment.",
      "## The Core Domain\n\nThe center of the hexagon is pure, framework-agnostic business logic. It knows absolutely nothing about HTTP, REST, SQL, or HTML. It only knows pure domain rules.",
      "## Ports (The Interfaces)\n\nTo communicate with the outside world, the Domain defines **Ports**.\n- **Primary (Driving) Ports**: Interfaces defining how the outside world can talk to the Domain (e.g., `interface ManageOrdersUseCase`).\n- **Secondary (Driven) Ports**: Interfaces defining what the Domain needs from the outside world (e.g., `interface OrderRepository`).",
      "## Adapters (The Implementations)\n\nAdapters plug into these ports from the outside.\n- **Driving Adapters**: A REST Controller takes an HTTP Request and calls the `ManageOrdersUseCase` port. Or, a CLI tool script calls that exact same port. The Domain doesn't care if the user clicked a button on a website or typed in a terminal.\n- **Driven Adapters**: A `PostgresOrderRepository` implements the `OrderRepository` port. If you swap Postgres out for MongoDB tomorrow, you just write a `MongoOrderRepository` adapter. The Domain code doesn't change by a single character."
    ],
    interviewTips: [
      "Hexagonal Architecture, Clean Architecture, and Onion Architecture are functionally identical in their goal: isolating business logic and using Dependency Inversion at the boundaries.",
      "The 'Hexagon' is just a visual metaphor to show there are many ways in and out of the application (HTTP, gRPC, CLI, Message Queues). The number 6 means nothing specific.",
      "Used extensively in complex Domain-Driven Design (DDD) projects."
    ],
    commonQuestions: [
      "What is the core objective of the Hexagonal (Ports & Adapters) architecture?",
      "What is the difference between a Driving Port (Primary) and a Driven Port (Secondary)?",
      "If you want to switch your database from MySQL to PostgreSQL, what specifically changes in a Hexagonal Architecture?",
      "Why must the Core Domain have zero dependencies on external frameworks?"
    ],
    companies: ["Netflix", "Atlassian", "Zillow", "Capital One", "ThoughtWorks"]
  }
};
