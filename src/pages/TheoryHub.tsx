import { useState } from "react";
import { BookOpen, ChevronRight, Search, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const subjects = [
  {
    id: "os", name: "Operating Systems", topics: [
      { id: "process", title: "Process Management", articles: 8, difficulty: "Medium" },
      { id: "deadlock", title: "Deadlocks", articles: 5, difficulty: "Hard" },
      { id: "memory", title: "Memory Management", articles: 7, difficulty: "Hard" },
      { id: "scheduling", title: "CPU Scheduling", articles: 6, difficulty: "Medium" },
      { id: "sync", title: "Synchronization", articles: 4, difficulty: "Hard" },
      { id: "threads", title: "Threads & Concurrency", articles: 5, difficulty: "Medium" },
      { id: "virtual_memory", title: "Virtual Memory", articles: 9, difficulty: "Hard" },
      { id: "file_systems", title: "File Systems & I/O", articles: 6, difficulty: "Medium" },
      { id: "cpu_caching", title: "CPU Caching & TLB", articles: 7, difficulty: "Hard" },
      { id: "ipc_advanced", title: "Advanced IPC", articles: 5, difficulty: "Medium" },
      { id: "bankers", title: "Banker's Algorithm", articles: 4, difficulty: "Hard" },
      { id: "disk_scheduling", title: "Disk Scheduling", articles: 5, difficulty: "Medium" },
      { id: "locks_advanced", title: "Mutex & Semaphores", articles: 8, difficulty: "Hard" },
      { id: "kernel_architecture", title: "Kernel Architecture", articles: 8, difficulty: "Hard" },
      { id: "linux_boot_process", title: "Linux Boot Process", articles: 6, difficulty: "Medium" },
      { id: "system_calls", title: "System Calls & Modes", articles: 9, difficulty: "Medium" },
      { id: "page_tables", title: "Advanced Page Tables", articles: 5, difficulty: "Hard" },
      { id: "thread_implementations", title: "User vs Kernel Threads", articles: 7, difficulty: "Medium" },
      { id: "process_synchronization_hardware", title: "Hardware Sync (CAS)", articles: 4, difficulty: "Hard" },
      { id: "real_time_os", title: "Real-Time OS (RTOS)", articles: 6, difficulty: "Hard" },
    ]
  },
  {
    id: "dbms", name: "Database Management", topics: [
      { id: "normalization", title: "Normalization", articles: 6, difficulty: "Medium" },
      { id: "sql", title: "SQL & Queries", articles: 10, difficulty: "Easy" },
      { id: "indexing", title: "Indexing & B-Trees", articles: 5, difficulty: "Hard" },
      { id: "transactions", title: "Transactions & ACID", articles: 4, difficulty: "Medium" },
      { id: "concurrency", title: "Concurrency Control", articles: 3, difficulty: "Hard" },
      { id: "nosql", title: "NoSQL Databases", articles: 7, difficulty: "Medium" },
      { id: "sharding", title: "Sharding & Partitioning", articles: 7, difficulty: "Hard" },
      { id: "replication", title: "Distributed Replication", articles: 6, difficulty: "Hard" },
      { id: "relational_algebra", title: "Relational Algebra", articles: 5, difficulty: "Medium" },
      { id: "concurrency_anomalies", title: "Concurrency Anomalies", articles: 8, difficulty: "Hard" },
      { id: "wal_recovery", title: "WAL & Crash Recovery", articles: 5, difficulty: "Medium" },
      { id: "query_optimization", title: "Query Optimization", articles: 9, difficulty: "Hard" },
      { id: "cap_pacelc", title: "CAP & PACELC Theorems", articles: 4, difficulty: "Medium" },
      { id: "mvcc", title: "MVCC Deep Dive", articles: 8, difficulty: "Hard" },
      { id: "database_indexes_internal", title: "B+Tree vs Hash", articles: 6, difficulty: "Medium" },
      { id: "graph_databases", title: "Graph Databases (Neo4j)", articles: 5, difficulty: "Medium" },
      { id: "timeseries_databases", title: "Time-Series Databases", articles: 4, difficulty: "Easy" },
      { id: "two_phase_commit", title: "Two-Phase Commit (2PC)", articles: 5, difficulty: "Hard" },
      { id: "oltp_vs_olap", title: "OLTP vs OLAP", articles: 5, difficulty: "Medium" },
      { id: "bloom_filters", title: "Bloom Filters in DBs", articles: 6, difficulty: "Hard" },
    ]
  },
  {
    id: "cn", name: "Computer Networks", topics: [
      { id: "osi", title: "OSI & TCP/IP Models", articles: 5, difficulty: "Easy" },
      { id: "tcp", title: "TCP vs UDP", articles: 4, difficulty: "Medium" },
      { id: "routing", title: "Routing Algorithms", articles: 6, difficulty: "Hard" },
      { id: "dns", title: "DNS & HTTP", articles: 4, difficulty: "Easy" },
      { id: "security", title: "Network Security", articles: 3, difficulty: "Medium" },
      { id: "applayer", title: "Application Layer Protocols", articles: 8, difficulty: "Medium" },
      { id: "subnetting", title: "Subnetting & CIDR", articles: 12, difficulty: "Hard" },
      { id: "tls_ssl", title: "TLS & SSL Security", articles: 7, difficulty: "Medium" },
      { id: "bgp_advanced", title: "BGP Routing", articles: 5, difficulty: "Hard" },
      { id: "nat_pat", title: "NAT & PAT", articles: 6, difficulty: "Medium" },
      { id: "ipv6", title: "IPv4 vs IPv6", articles: 4, difficulty: "Easy" },
      { id: "congestion_control", title: "TCP Congestion", articles: 8, difficulty: "Hard" },
      { id: "cdn_edge", title: "CDN & Edge Computing", articles: 5, difficulty: "Medium" },
      { id: "arp_ndp", title: "ARP & NDP Deep Dive", articles: 6, difficulty: "Medium" },
      { id: "icmp", title: "ICMP & Diagnostics", articles: 4, difficulty: "Easy" },
      { id: "http_versions", title: "HTTP/1.1 vs HTTP/2/3", articles: 9, difficulty: "Medium" },
      { id: "websocket_webrtc", title: "WebSockets vs WebRTC", articles: 7, difficulty: "Hard" },
      { id: "vpns_ipsec", title: "VPNs & IPsec", articles: 6, difficulty: "Hard" },
      { id: "dns_internals", title: "Advanced DNS & DoH", articles: 5, difficulty: "Medium" },
      { id: "load_balancing_algos", title: "Load Balancing Algos", articles: 8, difficulty: "Medium" },
    ]
  },
  {
    id: "oops", name: "Object-Oriented Programming", topics: [
      { id: "pillars", title: "OOP Pillars", articles: 8, difficulty: "Easy" },
      { id: "solid", title: "SOLID Principles", articles: 5, difficulty: "Medium" },
      { id: "patterns", title: "Design Patterns", articles: 7, difficulty: "Hard" },
      { id: "abstraction", title: "Abstraction vs Interfaces", articles: 4, difficulty: "Medium" },
      { id: "polymorphism", title: "Polymorphism Deep Dive", articles: 3, difficulty: "Medium" },
      { id: "exception", title: "Exception Handling", articles: 5, difficulty: "Medium" },
      { id: "dependency_injection", title: "Dependency Injection", articles: 7, difficulty: "Medium" },
      { id: "composition_vs_inheritance", title: "Composition vs Inheritance", articles: 6, difficulty: "Easy" },
      { id: "memory_management", title: "Garbage Collection", articles: 8, difficulty: "Hard" },
      { id: "domain_driven_design", title: "Domain-Driven Design", articles: 5, difficulty: "Hard" },
      { id: "clean_architecture", title: "Clean Architecture", articles: 6, difficulty: "Medium" },
      { id: "type_systems", title: "Type Systems", articles: 4, difficulty: "Medium" },
      { id: "functional_vs_oop", title: "Functional vs OOP", articles: 5, difficulty: "Easy" },
      { id: "oop_antipatterns", title: "OOP Anti-Patterns", articles: 6, difficulty: "Medium" },
      { id: "event_driven_architecture", title: "Event-Driven & Pub/Sub", articles: 7, difficulty: "Hard" },
      { id: "cqrs_pattern", title: "CQRS Pattern", articles: 5, difficulty: "Hard" },
      { id: "mixins_traits", title: "Mixins & Traits", articles: 4, difficulty: "Medium" },
      { id: "reflection_metaprogramming", title: "Reflection & Meta", articles: 8, difficulty: "Hard" },
      { id: "actor_model", title: "The Actor Model", articles: 6, difficulty: "Hard" },
      { id: "hexagonal_architecture", title: "Hexagonal Architecture", articles: 5, difficulty: "Medium" },
    ]
  },
];

const diffColors: Record<string, string> = { Easy: "text-accent", Medium: "text-yellow-400", Hard: "text-primary" };

const TheoryHub = () => {
  const [selectedSubject, setSelectedSubject] = useState("os");
  const [search, setSearch] = useState("");

  const activeSubject = subjects.find((s) => s.id === selectedSubject)!;
  const filteredTopics = activeSubject.topics.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Navbar />
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12 container mx-auto px-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wider">
              CS Theory <span className="text-primary">Hub</span>
            </h1>
          </div>
          <p className="font-mono text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
            Subject-based articles, interview tips & quick revision sheets.
          </p>
        </div>

        {/* Subject tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
          {subjects.map((s) => (
            <button key={s.id} onClick={() => setSelectedSubject(s.id)} className={cn(
              "px-3 sm:px-4 py-1.5 sm:py-2 border font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all",
              selectedSubject === s.id ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"
            )}>{s.id}</button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search topics..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 font-mono text-xs sm:text-sm" />
        </div>

        <h2 className="font-heading text-base sm:text-lg font-bold uppercase tracking-wider mb-3 sm:mb-4">{activeSubject.name}</h2>

        {/* Topics */}
        <div className="space-y-2">
          {filteredTopics.map((topic) => (
            <Link key={topic.id} to={`/theory/${selectedSubject}/${topic.id}`} className="flex items-center justify-between border border-border bg-card p-3 sm:p-4 hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-2.5 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 border border-border flex items-center justify-center bg-secondary/30 group-hover:bg-primary/10 transition-colors shrink-0">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider group-hover:text-primary transition-colors">{topic.title}</h3>
                  <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                    <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">{topic.articles} articles</span>
                    <span className={cn("font-mono text-[9px] sm:text-[10px] uppercase", diffColors[topic.difficulty])}>{topic.difficulty}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/30 hover:text-primary transition-colors hidden sm:block" />
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <p className="font-mono text-xs sm:text-sm text-muted-foreground">No topics found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheoryHub;
