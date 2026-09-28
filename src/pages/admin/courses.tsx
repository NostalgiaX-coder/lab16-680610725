import { useState } from "react";
import { PlusCircle, Trash2, X } from "lucide-react";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeInstructor } = useEnrollmentStore();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [instructors, setInstructors] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const normalizedCode = code.trim().toUpperCase();
  const duplicate = courses.some(c => c.courseCode.toUpperCase() === normalizedCode);
  const names = [...new Set(courses.flatMap(c => c.instructors ?? []))];
  function openForm() { setCode(""); setTitle(""); setInstructors([]); setOpen(true); }
  return <div className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1><p className="text-sm text-muted-foreground">{courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่ แล้วลงทะเบียนให้นักศึกษาที่หน้า “จัดการการลงทะเบียน”</p></div>
      <Button onClick={openForm}><PlusCircle /> เพิ่มวิชา</Button>
    </div>
    <div className="overflow-hidden rounded-lg border"><Table>
      <TableHeader><TableRow><TableHead>รหัสวิชา</TableHead><TableHead>ชื่อวิชา</TableHead><TableHead>ผู้สอน</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
      <TableBody>{courses.map(c => <TableRow key={c.courseCode}>
        <TableCell className="font-medium">{c.courseCode}</TableCell><TableCell className="min-w-48 whitespace-normal">{c.courseTitle}</TableCell>
        <TableCell><div className="flex min-w-40 flex-wrap gap-1">{c.instructors?.length ? c.instructors.map(name => <Badge key={name} variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-300">{name}<button type="button" aria-label={`ลบผู้สอน ${name} จาก ${c.courseCode}`} onClick={() => removeInstructor(c.courseCode, name)} className="rounded hover:bg-blue-500/20 focus-visible:outline-2"><X className="size-3" /></button></Badge>) : <span className="text-muted-foreground">ยังไม่มีผู้สอน</span>}</div></TableCell>
        <TableCell className="text-right"><Button variant="ghost" size="icon" aria-label={`ลบวิชา ${c.courseCode}`} onClick={() => setDeleting(c.courseCode)} className="text-destructive"><Trash2 /></Button></TableCell>
      </TableRow>)}{!courses.length && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">ยังไม่มีวิชาเรียน กด “เพิ่มวิชา” เพื่อเริ่มต้น</TableCell></TableRow>}</TableBody>
    </Table></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-md"><form className="space-y-4" onSubmit={e => { e.preventDefault(); if (addCourse({ courseCode: code, courseTitle: title, instructors })) setOpen(false); }}>
      <DialogHeader><DialogTitle>เพิ่มวิชาใหม่</DialogTitle><DialogDescription>วิชาที่เพิ่มจะเป็นตัวเลือกลงทะเบียนให้นักศึกษาได้ทันที</DialogDescription></DialogHeader>
      <div className="space-y-2"><Label htmlFor="course-code">รหัสวิชา</Label><Input id="course-code" value={code} onChange={e => setCode(e.target.value)} aria-invalid={duplicate} aria-describedby={duplicate ? "code-error" : undefined} required />{duplicate && <p id="code-error" role="alert" className="text-sm text-red-500">มีรหัสวิชา {normalizedCode} นี้แล้ว</p>}</div>
      <div className="space-y-2"><Label htmlFor="course-title">ชื่อวิชา</Label><Input id="course-title" value={title} onChange={e => setTitle(e.target.value)} required /></div>
      <div className="space-y-2"><Label htmlFor="instructors">ผู้สอน</Label><MultiSelect id="instructors" options={names.map(name => ({ value: name, label: name }))} value={instructors} onChange={setInstructors} creatable placeholder="เลือกหรือพิมพ์ชื่อผู้สอน" /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button><Button type="submit" disabled={!normalizedCode || !title.trim() || duplicate}>บันทึก</Button></DialogFooter>
    </form></DialogContent></Dialog>
    <AlertDialog open={deleting !== null} onOpenChange={next => { if (!next) setDeleting(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>ยืนยันการลบวิชา {deleting}</AlertDialogTitle><AlertDialogDescription>วิชานี้และการลงทะเบียนของนักศึกษาในวิชานี้จะถูกลบ</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>ยกเลิก</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { if (deleting) removeCourse(deleting); setDeleting(null); }}>ลบวิชา</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
