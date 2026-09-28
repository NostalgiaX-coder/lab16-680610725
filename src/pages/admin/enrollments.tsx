import { useState } from "react";
import { PlusCircle, X } from "lucide-react";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollStudents, dropStudent } = useEnrollmentStore();
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState("course");
  const [filter, setFilter] = useState("all");
  const available = students.filter(s => !s.enrolledCourses.includes(course ?? ""));
  const visible = courses.filter(c => filter === "all" || (mode === "course" ? c.courseCode === filter : students.some(s => s.studentId === filter && s.enrolledCourses.includes(c.courseCode))));
  const options = mode === "course" ? courses.map(c => ({ value: c.courseCode, label: `${c.courseCode} — ${c.courseTitle}` })) : students.map(s => ({ value: s.studentId, label: `${s.studentId} — ${s.firstName} ${s.lastName}` }));
  return <div className="space-y-4">
    <div><h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1><p className="text-sm text-muted-foreground">Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน</p></div>
    <Button onClick={() => { setCourse(null); setSelected([]); setOpen(true); }} disabled={!courses.length}><PlusCircle /> ลงทะเบียนให้นักศึกษา</Button>
    <Tabs value={mode} onValueChange={v => { setMode(v); setFilter("all"); }}><TabsList><TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger><TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger></TabsList></Tabs>
    <Select value={filter} onValueChange={v => setFilter(v ?? "all")} items={[{ value: "all", label: mode === "course" ? "ทุกวิชา" : "นักศึกษาทุกคน" }, ...options]}><SelectTrigger className="w-full" aria-label="กรองการลงทะเบียน"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{mode === "course" ? "ทุกวิชา" : "นักศึกษาทุกคน"}</SelectItem>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
    <div className="overflow-hidden rounded-lg border"><Table><TableHeader><TableRow><TableHead>รหัสวิชา</TableHead><TableHead>ชื่อวิชา</TableHead><TableHead className="text-center">จำนวน นศ.</TableHead><TableHead>นักศึกษาที่ลงทะเบียน</TableHead></TableRow></TableHeader><TableBody>
      {visible.map(c => { const enrolled = students.filter(s => s.enrolledCourses.includes(c.courseCode)); return <TableRow key={c.courseCode}><TableCell className="font-medium">{c.courseCode}</TableCell><TableCell className="min-w-48 whitespace-normal">{c.courseTitle}</TableCell><TableCell className="text-center">{enrolled.length}</TableCell><TableCell><div className="flex min-w-48 flex-wrap gap-1">{enrolled.map(s => <Badge key={s.studentId} variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-300">{s.firstName} {s.lastName}<button type="button" aria-label={`ยกเลิกการลงทะเบียน ${s.firstName} ${s.lastName} วิชา ${c.courseCode}`} onClick={() => dropStudent(c.courseCode, s.studentId)} className="rounded hover:bg-blue-500/20 focus-visible:outline-2"><X className="size-3" /></button></Badge>)}{!enrolled.length && <span className="text-muted-foreground">ยังไม่มีนักศึกษาลงทะเบียน</span>}</div></TableCell></TableRow>; })}
      {!visible.length && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">ไม่พบรายการลงทะเบียน</TableCell></TableRow>}
    </TableBody></Table></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle><DialogDescription>เลือกวิชาก่อน แล้วเลือกรายชื่อนักศึกษาได้มากกว่า 1 คน</DialogDescription></DialogHeader>
      <div className="space-y-2"><Label htmlFor="enrollment-course">วิชา</Label><Select value={course} onValueChange={v => { setCourse(v); setSelected([]); }} items={courses.map(c => ({ value: c.courseCode, label: `${c.courseCode} — ${c.courseTitle}` }))}><SelectTrigger id="enrollment-course" className="w-full"><SelectValue placeholder="เลือกวิชา" /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.courseCode} value={c.courseCode}>{c.courseCode} — {c.courseTitle}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="enrollment-students">นักศึกษา</Label><MultiSelect key={course ?? "none"} id="enrollment-students" options={available.map(s => ({ value: s.studentId, label: `${s.studentId} — ${s.firstName} ${s.lastName}` }))} value={selected} onChange={setSelected} disabled={!course} placeholder={!course ? "กรุณาเลือกวิชาก่อน" : "ค้นหาและเลือกนักศึกษา"} />{course && !available.length && <p className="text-sm text-muted-foreground">นักศึกษาทุกคนลงทะเบียนวิชานี้แล้ว</p>}</div>
      <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button><Button disabled={!course || !selected.length} onClick={() => { if (course) enrollStudents(course, selected); setOpen(false); }}><PlusCircle /> ลงทะเบียน ({selected.length} คน)</Button></DialogFooter>
    </DialogContent></Dialog>
  </div>;
}
